import { randomBytes } from 'node:crypto';
import path from 'node:path';
import * as vscode from 'vscode';
import { AuthoringParentContext, createHandoffFromForm, qualifyArtifactParent } from './authoring';
import { handoffAuthoringDefaults } from './core/operatorUx';
import { operatorClientScript } from './core/operatorWebview';
import { presentOperatorError } from './core/operatorError';
import { DiagnosticsSnapshot, TiinexDiagnosticsController } from './diagnostics';
import { HandoffInboxWatcher } from './inbox';
import { buildHandoffPackageFromForm, loadHandoffEndpointChoices, loadPackageBuilderModel, HandoffEndpointChoice, PackageBuilderModel, PackageBuildResult } from './packageBuilder';
import { repositoryRoots } from './vscode/gitApi';
import { receivedControlTarget, ReceivedHandoffContext } from './core/receivedHandoff';
import { sameRepositoryRoot } from './core/repositoryPath';

const VIEW_ID = 'tiinex.operator';
type Section = 'diagnostics' | 'authoring' | 'package';

function html(value: unknown): string {
  return String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

export class TiinexOperatorView implements vscode.WebviewViewProvider, vscode.Disposable {
  private view: vscode.WebviewView | undefined;
  private parent: AuthoringParentContext | null = null;
  private packageModel: PackageBuilderModel | null = null;
  private received: ReceivedHandoffContext | null = null;
  private preferredReturnTarget: { root: string; path: string } | null = null;
  private lastBuild: PackageBuildResult | null = null;
  private endpointChoices: HandoffEndpointChoice[] = [];
  private endpointLoading = false;
  private section: Section = 'diagnostics';
  private statusMessage = '';
  private busy = false;
  private authoringEpoch = 0;
  private packageEpoch = 0;
  private readonly disposables: vscode.Disposable[] = [];
  private readonly output = vscode.window.createOutputChannel('Tiinex');

  constructor(
    private readonly extensionPath: string,
    private readonly diagnostics: TiinexDiagnosticsController,
    private readonly inbox: HandoffInboxWatcher
  ) {
    this.disposables.push(this.output);
    this.disposables.push(this.diagnostics.onDidChange(() => { if (this.section === 'diagnostics') void this.render(); }));
    this.disposables.push(this.inbox.onDidChangeState(() => { if (this.section === 'diagnostics') void this.render(); }));
    this.disposables.push(vscode.window.onDidChangeActiveTextEditor(() => void this.refreshActiveArtifactCapability()));
    this.disposables.push(vscode.workspace.onDidSaveTextDocument(() => void this.refreshActiveArtifactCapability()));
    this.disposables.push(vscode.workspace.onDidChangeWorkspaceFolders(() => { this.packageModel = null; this.endpointChoices = []; this.preferredReturnTarget = null; this.lastBuild = null; this.packageEpoch += 1; this.authoringEpoch += 1; void this.render(); }));
    void this.refreshActiveArtifactCapability();
  }

  resolveWebviewView(view: vscode.WebviewView): void {
    this.view = view;
    view.webview.options = { enableScripts: true };
    this.disposables.push(view.webview.onDidReceiveMessage((payload: any) => void this.onMessage(payload)));
    if (this.section === 'package') void this.ensurePackageModel();
    else if (this.section === 'authoring') void this.ensureEndpointChoices();
    else void this.render();
  }

  async show(section: Section): Promise<void> {
    this.section = section;
    if (section === 'package') await this.ensurePackageModel();
    if (section === 'authoring') await this.ensureEndpointChoices();
    await vscode.commands.executeCommand(`${VIEW_ID}.focus`);
    await this.render();
  }

  async showAuthoring(resource?: vscode.Uri): Promise<void> {
    this.section = 'authoring';
    if (resource?.scheme === 'file') await this.bindArtifact(resource);
    await this.show('authoring');
  }

  async showPackage(): Promise<void> { await this.show('package'); }

  async acceptReceivedHandoff(received: ReceivedHandoffContext): Promise<void> {
    this.received = received;
    this.packageModel = null;
    this.preferredReturnTarget = null;
    this.lastBuild = null;
    this.authoringEpoch += 1;
    this.packageEpoch += 1;
    this.section = 'diagnostics';
    this.statusMessage = `Received and grounded Handoff: ${received.from || 'unknown'} → ${received.to || 'unknown'} (${received.groundingState}). Carrier context: ${received.carriedWorkspaceIds.length} Workspace(s); locally landed: ${Object.keys(received.workspaceRoots).length}.`;
    await this.render();
  }

  async bindArtifact(resource: vscode.Uri): Promise<void> {
    if (resource.scheme !== 'file') throw new Error('tiinex.authoring.parent-must-be-local-file');
    this.parent = await qualifyArtifactParent(this.extensionPath, resource.fsPath);
    this.authoringEpoch += 1;
    this.statusMessage = `Qualified Handoff Parent: ${this.parent.parentPath}`;
    await vscode.commands.executeCommand('setContext', 'tiinex.activeArtifactCanCreateHandoff', true);
    await this.render();
  }

  private async refreshActiveArtifactCapability(): Promise<void> {
    const resource = vscode.window.activeTextEditor?.document.uri;
    let qualified = false;
    if (resource?.scheme === 'file') {
      try { await qualifyArtifactParent(this.extensionPath, resource.fsPath); qualified = true; } catch { qualified = false; }
    }
    await vscode.commands.executeCommand('setContext', 'tiinex.activeArtifactCanCreateHandoff', qualified);
  }

  private async ensureEndpointChoices(force = false): Promise<void> {
    if ((!force && this.endpointChoices.length) || this.endpointLoading) return;
    this.endpointLoading = true;
    this.statusMessage = 'Loading qualified Role/Party endpoint choices…';
    await this.render();
    try {
      this.endpointChoices = await loadHandoffEndpointChoices(this.extensionPath);
      this.statusMessage = this.endpointChoices.length
        ? `Loaded ${this.endpointChoices.length} qualified Role/Party endpoint choice(s) from shared Tiinex Tooling.`
        : 'No qualified Role/Party endpoints are available in the open Workspaces; choose unknown only when that is truthful.';
    } finally {
      this.endpointLoading = false;
      await this.render();
    }
  }

  private async ensurePackageModel(): Promise<void> {
    if (this.packageModel || this.busy) return;
    this.busy = true;
    this.statusMessage = 'Loading qualified Handoff leaves and Workspace sources automatically…';
    await this.render();
    try {
      this.packageModel = await loadPackageBuilderModel(this.extensionPath);
      this.statusMessage = 'Package options qualified by shared Tiinex Tooling.';
    } finally {
      this.busy = false;
      await this.render();
    }
  }

  private async onMessage(payload: any): Promise<void> {
    const type = String(payload?.type || '');
    try {
      if (type === 'section') {
        this.section = payload.section === 'authoring' || payload.section === 'package' ? payload.section : 'diagnostics';
        if (this.section === 'package') await this.ensurePackageModel();
        else if (this.section === 'authoring') await this.ensureEndpointChoices();
        else await this.render();
        return;
      }
      if (type === 'refreshDiagnostics') { await this.diagnostics.refreshActive(); this.statusMessage = 'Diagnostics refreshed from shared Tiinex Tooling.'; await this.render(); return; }
      if (type === 'showProblems') { await vscode.commands.executeCommand('workbench.actions.view.problems'); return; }
      if (type === 'useActiveParent') {
        const resource = vscode.window.activeTextEditor?.document.uri;
        if (!resource) throw new Error('tiinex.authoring.no-active-artifact');
        await this.bindArtifact(resource);
        this.section = 'authoring';
        await this.render();
        return;
      }
      if (type === 'clearParent') {
        this.parent = null;
        this.authoringEpoch += 1;
        this.statusMessage = 'Handoff Parent cleared; root Handoff mode selected.';
        await this.render();
        return;
      }
      if (type === 'landPackage') { await vscode.commands.executeCommand('tiinex.landHandoffPackage'); return; }
      if (type === 'openPackageBuilder') { this.section = 'package'; await this.ensurePackageModel(); return; }
      if (type === 'returnToAuthoring') { this.section = 'authoring'; await this.ensureEndpointChoices(); await this.render(); return; }
      if (type === 'reloadPackage') { this.packageModel = null; this.packageEpoch += 1; await this.ensurePackageModel(); return; }
      if (type === 'openSettings') { await vscode.commands.executeCommand('workbench.action.openSettings', 'tiinex'); return; }
      if (type === 'selectInbox') { await vscode.commands.executeCommand('tiinex.selectHandoffInbox'); return; }
      if (type === 'createHandoff') {
        this.busy = true;
        this.statusMessage = 'Qualifying Handoff creation…';
        await this.render();
        try {
          const data = payload?.data || {};
          const root = this.parent?.root || String(data.root || '');
          const parentPath = this.parent?.parentPath || '';
          const freshEndpoints = await loadHandoffEndpointChoices(this.extensionPath);
          const resolveEndpoint = (prefix: 'from' | 'to') => {
            const kind = String(data[`${prefix}Kind`] || '');
            if (kind === 'unknown') return { label: String(data[prefix] || '').trim(), reference: '' };
            if (kind !== 'role' && kind !== 'party') throw new Error('tiinex.authoring.endpoint-kind-invalid');
            const reference = String(data[`${prefix}Reference`] || '').trim();
            const matches = freshEndpoints.filter((item) => item.kind === kind && item.reference === reference);
            if (matches.length !== 1) throw new Error(matches.length ? `tiinex.authoring.${prefix}-endpoint-ambiguous` : `tiinex.authoring.${prefix}-endpoint-unqualified`);
            return { label: matches[0].label, reference: matches[0].reference };
          };
          const fromEndpoint = resolveEndpoint('from');
          const toEndpoint = resolveEndpoint('to');
          const created = await createHandoffFromForm(this.extensionPath, { ...data, root, parentPath, from: fromEndpoint.label, fromReference: fromEndpoint.reference, to: toEndpoint.label, toReference: toEndpoint.reference });
          this.statusMessage = `Created qualified Handoff: ${created}`;
          this.parent = null;
          this.packageModel = null;
          this.authoringEpoch += 1;
          this.packageEpoch += 1;
        } finally { this.busy = false; await this.render(); }
        return;
      }
      if (type === 'buildPackage') {
        this.busy = true;
        this.statusMessage = 'Qualifying package preview…';
        await this.render();
        try {
          const output = await buildHandoffPackageFromForm(this.extensionPath, { routeId: String(payload?.data?.routeId || ''), workspaceIds: Array.isArray(payload?.data?.workspaceIds) ? payload.data.workspaceIds.map(String) : [] });
          this.statusMessage = 'Built qualified carrier.';
          this.packageModel = null;
          this.packageEpoch += 1;
        } finally { this.busy = false; await this.render(); }
        return;
      }
    } catch (error) {
      this.busy = false;
      const presentation = presentOperatorError(error);
      this.statusMessage = presentation.summary;
      if (!presentation.cancelled) {
        this.output.appendLine(`[${new Date().toISOString()}] ${type || 'operator'} blocked`);
        this.output.appendLine(presentation.detail);
        this.output.appendLine('');
        const action = await vscode.window.showErrorMessage(presentation.summary, 'Show details');
        if (action === 'Show details') this.output.show(true);
      }
      await this.render();
    }
  }

  private async render(): Promise<void> {
    if (!this.view) return;
    let roots: string[] = [];
    try { roots = await repositoryRoots(); } catch { roots = []; }
    const diagnostic = this.diagnostics.activeSnapshot();
    this.view.webview.html = this.page(this.view.webview, roots, diagnostic);
  }

  private page(webview: vscode.Webview, roots: string[], diagnostic: DiagnosticsSnapshot | null): string {
    const nonce = randomBytes(16).toString('hex');
    const model = this.packageModel || { workspaces: [], routes: [] };
    const routeOptions = model.routes.map((route) => `<option value="${html(route.id)}">${html(route.label)} — ${html(route.description)}</option>`).join('');
    const endpointOptions = this.endpointChoices.map((endpoint) => `<option data-kind="${html(endpoint.kind)}" data-label="${html(endpoint.label)}" value="${html(endpoint.reference)}">${html(endpoint.label)} — ${html(endpoint.workspaceId)} (${html(endpoint.kind === 'role' ? 'Role' : 'Party')})</option>`).join('');
    const workspaceBoxes = model.workspaces.map((workspace) => { const source = workspace.repository ? `${workspace.repository}@${workspace.ref || '(no ref)'}` : (workspace.sourceKind || 'local snapshot'); return `<label class="check"><input type="checkbox" name="workspace" value="${html(workspace.workspaceId)}" checked> <span><strong>${html(workspace.workspaceId)}</strong><small>${html(source)}<br>${html(workspace.root)}</small></span></label>`; }).join('');
    const rootOptions = roots.map((root) => `<option value="${html(root)}">${html(root)}</option>`).join('');
    const parentText = this.parent ? `${this.parent.parentPath} (${this.parent.schemaId || 'qualified artifact'})` : 'No Parent — create a root Handoff';
    const defaults = handoffAuthoringDefaults(this.parent?.parentPath || '', this.parent?.label || '');
    const diagText = diagnostic ? `${path.basename(diagnostic.path)} — ${diagnostic.detail}` : 'Open a Tiinex Markdown artifact; shared validation runs automatically on open, change, and save.';
    const diagClass = diagnostic?.errors ? 'bad' : diagnostic?.warnings ? 'warn' : 'good';
    const clientScript = operatorClientScript({ ...model, endpoints: this.endpointChoices }, this.authoringEpoch, this.packageEpoch);
    const discovery = this.inbox.currentState();
    const discoveryClass = ['candidate-invalid', 'blocked'].includes(discovery.state) ? 'bad' : ['disabled', 'ignored'].includes(discovery.state) ? 'warn' : 'good';
    const discoveryTitle: Record<string, string> = {
      disabled: 'Disabled',
      watching: 'Watching',
      'candidate-found': 'Candidate found',
      'candidate-invalid': 'Invalid / unqualified',
      'landing-awaiting-confirmation': 'Awaiting landing confirmation',
      landed: 'Landed',
      ignored: 'Ignored',
      blocked: 'Blocked'
    };
    const packageStatus = this.busy && this.section === 'package' ? 'Loading qualified package options…' : 'Qualified package options are not currently available.';
    return `<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'nonce-${nonce}'"><meta name="viewport" content="width=device-width,initial-scale=1"><style>
      body{font-family:var(--vscode-font-family);color:var(--vscode-foreground);padding:0 10px 20px}button,input,select,textarea{font:inherit;color:var(--vscode-input-foreground);background:var(--vscode-input-background);border:1px solid var(--vscode-input-border,transparent);box-sizing:border-box}button{padding:6px 10px;background:var(--vscode-button-background);color:var(--vscode-button-foreground);border:0;cursor:pointer}button.secondary{background:var(--vscode-button-secondaryBackground);color:var(--vscode-button-secondaryForeground)}button:disabled{opacity:.55;cursor:default}.flow{display:grid;grid-template-columns:1fr 1fr 1fr;gap:4px;position:sticky;top:0;background:var(--vscode-sideBar-background);padding:8px 0;z-index:2}.flow button{min-width:0}.flow-note{font-size:11px;color:var(--vscode-descriptionForeground);margin:0 0 8px}.card{border:1px solid var(--vscode-panel-border);padding:10px;margin:8px 0}.row{display:grid;grid-template-columns:1fr 1fr;gap:8px}.field{margin:7px 0}.field label{display:block;font-size:11px;color:var(--vscode-descriptionForeground);margin-bottom:3px}.field input,.field select,.field textarea{width:100%;padding:5px}.field textarea{min-height:62px;resize:vertical}.muted,small{color:var(--vscode-descriptionForeground);font-size:11px}.status{padding:7px;margin:8px 0;background:var(--vscode-textBlockQuote-background);border-left:2px solid var(--vscode-textBlockQuote-border)}.good{color:var(--vscode-testing-iconPassed)}.warn{color:var(--vscode-editorWarning-foreground)}.bad{color:var(--vscode-editorError-foreground)}.check{display:flex;gap:6px;margin:6px 0}.check input{width:auto}.check small{display:block}.actions{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}.hidden{display:none}h3{margin:4px 0 8px;font-size:13px}code{font-family:var(--vscode-editor-font-family)}details.card>summary{cursor:pointer;font-weight:600}details.card[open]>summary{margin-bottom:8px}.pill{font-size:10px;font-weight:400;color:var(--vscode-descriptionForeground);margin-left:6px}
    </style></head><body>
      <div class="flow"><button id="landPackage">1 Receive</button><button data-section="diagnostics">2 Review</button><button data-section="authoring">3 Return</button></div>
      <div class="flow-note">Receive a carrier, review qualified state, then return through one Handoff and one qualified package route. Advanced package construction stays available without becoming a fourth semantic step.</div>
      ${this.statusMessage ? `<div class="status">${html(this.statusMessage)}</div>` : ''}
      <section id="diagnostics" class="${this.section === 'diagnostics' ? '' : 'hidden'}">
        <div class="card"><h3>Receive state</h3><div class="${discoveryClass}"><strong>${html(discoveryTitle[discovery.state] || discovery.state)}</strong></div><p class="muted">${html(discovery.detail)}</p><small>${html(discovery.directory)}${discovery.candidatePath ? `<br>Candidate: ${html(path.basename(discovery.candidatePath))}` : ''}</small><div class="actions"><button id="selectInbox">Choose Inbox</button><button id="openSettings" class="secondary">Receive settings</button></div></div>
        <div class="card"><h3>Review current artifact</h3><div class="${diagClass}">${html(diagText)}</div><p class="muted">Open/change/save events invoke the installed @tiinex/core Tooling automatically. Problems, squiggles, severity, deterministic locations, and qualified Quick Fix bytes remain shared-Core results rather than editor guesses.</p><div class="actions"><button id="showProblems">Show Problems</button><button id="refreshDiagnostics" class="secondary">Refresh now (recovery)</button></div></div>
      </section>
      <section id="authoring" class="${this.section === 'authoring' ? '' : 'hidden'}"><form id="handoffForm">
        <div class="card"><h3>Continuity Parent</h3><div><strong>${html(parentText)}</strong></div><p class="muted">The explicit selected Parent drives safe continuation defaults. It does not infer sender/recipient identity or authority.</p><div class="actions"><button type="button" id="useActiveParent" class="secondary">Use active artifact as Parent</button>${this.parent ? '<button type="button" id="clearParent" class="secondary">Clear Parent (root Handoff)</button>' : ''}</div>${this.parent ? '' : `<div class="field"><label>Owning repository for root Handoff</label><select name="root" required><option value="">Select repository…</option>${rootOptions}</select></div>`}</div>
        <div class="card"><h3>Common Handoff fields</h3><div class="field"><label>Title</label><input name="title" value="${html(defaults.title)}" required></div><div class="field"><label>Purpose</label><textarea name="purpose" required>${html(defaults.purpose)}</textarea></div><div class="row"><div class="field"><label>From</label><select id="fromQualified" name="fromQualified"><option value="">Select qualified Role/Party…</option>${endpointOptions}<option value="__unknown__" data-kind="unknown" data-label="">Explicit unknown / unrepresented endpoint…</option></select><input id="fromUnknown" name="fromUnknown" class="hidden" placeholder="Explicit unknown endpoint label"><input type="hidden" name="fromKind"><input type="hidden" name="from"><input type="hidden" name="fromReference"></div><div class="field"><label>To</label><select id="toQualified" name="toQualified"><option value="">Select qualified Role/Party…</option>${endpointOptions}<option value="__unknown__" data-kind="unknown" data-label="">Explicit unknown / unrepresented endpoint…</option></select><input id="toUnknown" name="toUnknown" class="hidden" placeholder="Explicit unknown endpoint label"><input type="hidden" name="toKind"><input type="hidden" name="to"><input type="hidden" name="toReference"></div></div><p class="muted">Endpoint type is derived from the selected qualified Role/Party; choose Explicit unknown only when no qualified endpoint represents the participant. A Role/Party reference does not grant authority. Durable <code>workspaceId::artifact-path</code> references come only from shared Tiinex Tooling. Required Context, Reference Context, Retained Responsibilities, and Exclusions And Dependencies default explicitly to <code>none</code> unless additional declarations are supplied through shared Tooling.</p></div>
        <details class="card"><summary>Advanced transfer details <span class="pill">pre-filled and editable</span></summary><div class="row"><div class="field"><label>Name</label><input name="transferName" value="${html(defaults.transferName)}" required></div><div class="field"><label>Kind</label><select name="transferKind"><option>work</option><option>responsibility</option><option selected>work-and-responsibility</option></select></div></div><div class="field"><label>Description</label><textarea name="description" required>${html(defaults.description)}</textarea></div><div class="field"><label>Boundary</label><textarea name="boundary" required>${html(defaults.boundary)}</textarea></div></details>
        <details class="card"><summary>Advanced completion and interpretation limits <span class="pill">pre-filled and editable</span></summary><div class="field"><label>Completion signal meaning</label><textarea name="signalMeaning" required>${html(defaults.signalMeaning)}</textarea></div><div class="field"><label>Does Not Mean</label><textarea name="doesNotMean" required>${html(defaults.doesNotMean)}</textarea></div><div class="field"><label>Must Not Be Used To Claim</label><textarea name="mustNotClaim" required>${html(defaults.mustNotClaim)}</textarea></div></details>
        <div class="card"><button type="submit" ${this.busy ? 'disabled' : ''}>Prepare qualified return Handoff</button><p class="muted">Exactly one From and one To are authored for the Handoff. Additional context or participants belong in their declared schema fields, never as extra Handoff endpoints. Envelope, Parent/Origin rendering, schema references, validation, and integrity remain shared Tooling responsibilities.</p><div class="actions"><button type="button" id="openPackageBuilder" class="secondary">Build return package…</button></div></div>
      </form></section>
      <section id="package" class="${this.section === 'package' ? '' : 'hidden'}"><div class="card"><h3>Return package</h3><p class="muted">Package route selection transports an already-authored Handoff or an explicit pointerless Workspace carrier. It does not create another participant or continuity Parent.</p><div class="actions"><button id="returnToAuthoring" class="secondary">Back to Return Handoff</button></div></div><div class="card"><h3>Handoff Package route</h3>${model.routes.length ? `<div class="field"><label>Qualified Handoff leaf or explicit Workspace carrier</label><select id="route">${routeOptions}</select></div><div id="routeDetail" class="muted"></div>` : `<p class="muted">${html(packageStatus)}</p>`}<div class="actions"><button id="reloadPackage" class="secondary" ${this.busy ? 'disabled' : ''}>Refresh qualified options</button></div></div><div class="card"><h3>Workspace inclusion</h3>${workspaceBoxes || `<p class="muted">${html(packageStatus)}</p>`}<p class="muted">Workspace inclusion is package construction. It does not select Handoff Parent continuity.</p></div>${model.routes.length ? `<div class="card"><h3>Preview</h3><div id="packagePreview" class="muted"></div><button id="buildPackage" ${this.busy ? 'disabled' : ''}>Preview and build through shared Tooling</button></div>` : ''}</section>
      <script nonce="${nonce}">${clientScript}</script>
    </body></html>`;
  }

  dispose(): void { for (const disposable of this.disposables) disposable.dispose(); }
}
