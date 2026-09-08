import { createHash } from 'node:crypto';
import * as vscode from 'vscode';
import { prepareBundledRuntime, projectEditorAssistance, projectEditorAssistanceText } from './tiinex/bootstrap';
import { relativeRepositoryPath } from './core/repositoryPath';
import { repositoryRootForResource } from './vscode/gitApi';
import { LatestWinsKeyedQueue } from './core/latestWinsQueue';

export interface DiagnosticsSnapshot {
  uri: string;
  path: string;
  state: 'idle' | 'clean' | 'findings' | 'validating' | 'unavailable';
  errors: number;
  warnings: number;
  actions: number;
  detail: string;
}

interface ValidationRequest {
  key: string;
  uri: vscode.Uri;
  path: string;
  version: number;
  generation: number;
  source: 'saved' | 'in-memory';
  content: string | null;
}

const CHANGE_DEBOUNCE_MS = 250;

function eligible(document: vscode.TextDocument): boolean {
  return !document.isClosed && document.uri.scheme === 'file' && /\.(?:md|markdown)$/i.test(document.fileName) && /(?:\.trace|\.task|\.workspace|\.schema)?\.md$/i.test(document.fileName);
}
function digest(text: string): string { return createHash('sha256').update(Buffer.from(text, 'utf8')).digest('hex'); }
function message(error: unknown): string { return error instanceof Error ? error.message : String(error); }

export class TiinexDiagnosticsController implements vscode.Disposable {
  private readonly collection = vscode.languages.createDiagnosticCollection('tiinex');
  private readonly actions = new Map<string, any[]>();
  private readonly snapshots = new Map<string, DiagnosticsSnapshot>();
  private readonly changed = new vscode.EventEmitter<DiagnosticsSnapshot | null>();
  readonly onDidChange = this.changed.event;
  private readonly status = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 80);
  private runtimePromise: ReturnType<typeof prepareBundledRuntime> | null = null;
  private readonly disposables: vscode.Disposable[] = [];
  private readonly debounceTimers = new Map<string, NodeJS.Timeout>();
  private readonly generations = new Map<string, number>();
  private readonly validationQueue = new LatestWinsKeyedQueue<string, ValidationRequest, DiagnosticsSnapshot | null>((request) => this.validate(request));

  constructor(private readonly extensionPath: string) {
    this.status.command = 'tiinex.showProblems';
    this.status.tooltip = 'Tiinex validation — click to show Problems';
    this.disposables.push(this.collection, this.changed, this.status);
    this.disposables.push(vscode.workspace.onDidOpenTextDocument((document: vscode.TextDocument) => void this.refresh(document)));
    this.disposables.push(vscode.workspace.onDidSaveTextDocument((document: vscode.TextDocument) => void this.refresh(document)));
    this.disposables.push(vscode.workspace.onDidChangeTextDocument((event: { document: vscode.TextDocument }) => { if (eligible(event.document)) this.scheduleInMemoryRefresh(event.document); }));
    this.disposables.push(vscode.workspace.onDidCloseTextDocument((document: vscode.TextDocument) => this.forget(document)));
    this.disposables.push(vscode.window.onDidChangeActiveTextEditor(() => this.updateActiveStatus()));
    this.disposables.push(vscode.languages.registerCodeActionsProvider({ scheme: 'file', language: 'markdown' }, {
      provideCodeActions: (document: vscode.TextDocument, _range: vscode.Range | vscode.Selection, context: vscode.CodeActionContext) => this.codeActions(document, context)
    }, { providedCodeActionKinds: [vscode.CodeActionKind.QuickFix] }));
    for (const document of vscode.workspace.textDocuments) void this.refresh(document);
    this.updateActiveStatus();
  }

  private runtime() {
    return this.runtimePromise ??= prepareBundledRuntime(this.extensionPath, vscode.workspace.getConfiguration('tiinex').get('nodePath', '').toString().trim() || process.execPath);
  }

  private emit(snapshot: DiagnosticsSnapshot | null): void {
    this.changed.fire(snapshot);
    this.updateActiveStatus();
  }

  private nextGeneration(key: string): number {
    const next = (this.generations.get(key) || 0) + 1;
    this.generations.set(key, next);
    return next;
  }

  private cancelScheduled(key: string): void {
    const timer = this.debounceTimers.get(key);
    if (timer) clearTimeout(timer);
    this.debounceTimers.delete(key);
  }

  private forget(document: vscode.TextDocument): void {
    const key = document.uri.toString();
    const uri = document.uri;
    this.cancelScheduled(key);
    this.nextGeneration(key);
    this.collection.delete(uri);
    this.actions.delete(key);
    this.snapshots.delete(key);
    this.updateActiveStatus();
  }

  private requestFor(document: vscode.TextDocument, generation: number, source: 'saved' | 'in-memory', content: string | null): ValidationRequest {
    return { key: document.uri.toString(), uri: document.uri, path: document.fileName, version: document.version, generation, source, content };
  }

  private liveDocument(request: ValidationRequest): vscode.TextDocument | null {
    if (this.generations.get(request.key) !== request.generation) return null;
    return vscode.workspace.textDocuments.find((document: vscode.TextDocument) => !document.isClosed && document.uri.toString() === request.key && document.version === request.version) || null;
  }

  private scheduleInMemoryRefresh(document: vscode.TextDocument): void {
    const key = document.uri.toString();
    this.cancelScheduled(key);
    const generation = this.nextGeneration(key);
    const request = this.requestFor(document, generation, 'in-memory', document.getText());
    this.actions.delete(key);
    const prior = this.snapshots.get(key);
    const snapshot: DiagnosticsSnapshot = {
      uri: key,
      path: request.path,
      state: 'validating',
      errors: prior?.errors || 0,
      warnings: prior?.warnings || 0,
      actions: 0,
      detail: 'Validating captured in-memory bytes through shared Tiinex Tooling…'
    };
    this.snapshots.set(key, snapshot);
    this.emit(snapshot);
    this.debounceTimers.set(key, setTimeout(() => {
      this.debounceTimers.delete(key);
      void this.validationQueue.enqueue(key, request);
    }, CHANGE_DEBOUNCE_MS));
  }

  async refresh(document: vscode.TextDocument): Promise<DiagnosticsSnapshot | null> {
    const key = document.uri.toString();
    if (!eligible(document)) {
      this.cancelScheduled(key);
      this.nextGeneration(key);
      this.collection.delete(document.uri);
      this.actions.delete(key);
      this.snapshots.delete(key);
      this.emit(null);
      return null;
    }
    this.cancelScheduled(key);
    const generation = this.nextGeneration(key);
    const content = document.isDirty ? document.getText() : null;
    const request = this.requestFor(document, generation, content === null ? 'saved' : 'in-memory', content);
    return this.validationQueue.enqueue(key, request);
  }

  private async validate(request: ValidationRequest): Promise<DiagnosticsSnapshot | null> {
    const { key, uri, path: sourcePath, generation, source, content } = request;
    if (!this.liveDocument(request)) return this.snapshots.get(key) || null;
    try {
      const runtime = await this.runtime();
      if (!this.liveDocument(request)) return this.snapshots.get(key) || null;
      const materialRoot = await repositoryRootForResource(sourcePath);
      const focusPath = relativeRepositoryPath(materialRoot, sourcePath);
      const result = content === null
        ? await projectEditorAssistance(runtime, materialRoot, focusPath)
        : await projectEditorAssistanceText(runtime, materialRoot, focusPath, content);
      const document = this.liveDocument(request);
      if (!document) return this.snapshots.get(key) || null;
      const projected = result.documents?.[0];
      if (!projected) {
        this.collection.delete(uri);
        this.actions.delete(key);
        const snapshot: DiagnosticsSnapshot = { uri: key, path: sourcePath, state: 'unavailable', errors: 0, warnings: 0, actions: 0, detail: 'Shared Tooling did not project this document.' };
        this.snapshots.set(key, snapshot);
        this.emit(snapshot);
        return snapshot;
      }
      const diagnostics = projected.diagnostics.map((item) => {
        const hasLine = Number.isInteger(item.line) && Number(item.line) > 0;
        const line = hasLine ? Math.min(Math.max(0, document.lineCount - 1), Number(item.line) - 1) : 0;
        const range = hasLine ? document.lineAt(line).range : new vscode.Range(new vscode.Position(0, 0), new vscode.Position(0, 0));
        const suffix = item.locationState === 'deterministic'
          ? ''
          : item.locationState === 'deterministic-anchor' && hasLine
            ? ` [anchored by shared validator: ${item.locationBasis}; exact source line unavailable]`
            : ' [location unresolved by shared validator]';
        const diagnostic = new vscode.Diagnostic(range, `${item.message}${suffix}`, item.severity === 'error' ? vscode.DiagnosticSeverity.Error : vscode.DiagnosticSeverity.Warning);
        diagnostic.code = item.code;
        diagnostic.source = `Tiinex/${projected.validator.state}`;
        return diagnostic;
      });
      this.collection.set(uri, diagnostics);
      this.actions.set(key, projected.actions || []);
      const errors = diagnostics.filter((item) => item.severity === vscode.DiagnosticSeverity.Error).length;
      const warnings = diagnostics.filter((item) => item.severity === vscode.DiagnosticSeverity.Warning).length;
      const qualifier = source === 'in-memory' ? 'Current in-memory bytes' : 'Saved bytes';
      const snapshot: DiagnosticsSnapshot = {
        uri: key,
        path: sourcePath,
        state: diagnostics.length ? 'findings' : 'clean',
        errors,
        warnings,
        actions: (projected.actions || []).length,
        detail: diagnostics.length
          ? `${qualifier}: ${errors} error(s), ${warnings} warning(s); ${(projected.actions || []).length} deterministic Quick Fix(es). Validator: ${projected.validator.state}.`
          : `${qualifier}: exact shared Tiinex validation is clean.`
      };
      this.snapshots.set(key, snapshot);
      this.emit(snapshot);
      return snapshot;
    } catch (error) {
      const document = this.liveDocument(request);
      if (!document) return this.snapshots.get(key) || null;
      const diagnostic = new vscode.Diagnostic(new vscode.Range(new vscode.Position(0, 0), new vscode.Position(0, 0)), `Tiinex validator unavailable: ${message(error)} [location unresolved]`, vscode.DiagnosticSeverity.Warning);
      diagnostic.code = 'tiinex.validator.unavailable';
      diagnostic.source = 'Tiinex/degraded';
      this.collection.set(uri, [diagnostic]);
      this.actions.delete(key);
      const snapshot: DiagnosticsSnapshot = { uri: key, path: sourcePath, state: 'unavailable', errors: 0, warnings: 1, actions: 0, detail: message(error) };
      this.snapshots.set(key, snapshot);
      this.emit(snapshot);
      return snapshot;
    }
  }

  activeSnapshot(): DiagnosticsSnapshot | null {
    const document = vscode.window.activeTextEditor?.document;
    return document && !document.isClosed ? this.snapshots.get(document.uri.toString()) || null : null;
  }

  async refreshActive(): Promise<DiagnosticsSnapshot | null> {
    const document = vscode.window.activeTextEditor?.document;
    return document && !document.isClosed ? this.refresh(document) : null;
  }

  private codeActions(document: vscode.TextDocument, context: vscode.CodeActionContext): vscode.CodeAction[] {
    if (document.isClosed) return [];
    return (this.actions.get(document.uri.toString()) || []).filter((item) => item.kind === 'replace-document' && item.qualification === 'deterministic-shared-core').map((item) => {
      const diagnosticCodes = new Set((item.diagnosticCodes || []).map((value: unknown) => String(value)));
      const matchingDiagnostics = context.diagnostics.filter((diagnostic: vscode.Diagnostic) => !diagnosticCodes.size || diagnosticCodes.has(String(typeof diagnostic.code === 'object' ? diagnostic.code.value : diagnostic.code || '')));
      if (diagnosticCodes.size && !matchingDiagnostics.length) return null;
      const action = new vscode.CodeAction(item.title, vscode.CodeActionKind.QuickFix);
      if (matchingDiagnostics.length) action.diagnostics = matchingDiagnostics;
      if (item.sourceSha256 !== digest(document.getText())) {
        action.disabled = { reason: 'Document bytes changed after Tiinex qualification.' };
        return action;
      }
      const edit = new vscode.WorkspaceEdit();
      const end = document.lineAt(Math.max(0, document.lineCount - 1)).rangeIncludingLineBreak.end;
      edit.replace(document.uri, new vscode.Range(new vscode.Position(0, 0), end), item.replacementMarkdown);
      action.edit = edit;
      action.isPreferred = true;
      return action;
    }).filter((item): item is vscode.CodeAction => Boolean(item));
  }

  private updateActiveStatus(): void {
    const document = vscode.window.activeTextEditor?.document;
    if (!document || !eligible(document)) { this.status.hide(); return; }
    const snapshot = this.snapshots.get(document.uri.toString());
    if (!snapshot) { this.status.text = '$(sync~spin) Tiinex'; this.status.tooltip = 'Tiinex validation pending'; this.status.show(); return; }
    if (snapshot.state === 'validating') this.status.text = '$(sync~spin) Tiinex: validating';
    else if (snapshot.errors) this.status.text = `$(error) Tiinex: ${snapshot.errors} error${snapshot.errors === 1 ? '' : 's'}`;
    else if (snapshot.warnings) this.status.text = `$(warning) Tiinex: ${snapshot.warnings} warning${snapshot.warnings === 1 ? '' : 's'}`;
    else this.status.text = '$(pass) Tiinex: clean';
    this.status.tooltip = snapshot.detail;
    this.status.show();
  }

  dispose(): void {
    for (const timer of this.debounceTimers.values()) clearTimeout(timer);
    this.debounceTimers.clear();
    for (const disposable of this.disposables) disposable.dispose();
    void this.runtimePromise?.then((value) => value.dispose());
  }
}

export async function registerTiinexDiagnostics(context: vscode.ExtensionContext, extensionPath: string): Promise<TiinexDiagnosticsController> {
  const controller = new TiinexDiagnosticsController(extensionPath);
  context.subscriptions.push(controller);
  return controller;
}
