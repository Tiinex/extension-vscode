import path from 'node:path';
import { FSWatcher, watch } from 'node:fs';
import { stat } from 'node:fs/promises';
import * as vscode from 'vscode';
import { indexCarrierPackage, indexLocalWorkspace, discoveryPackages, IndexedCarrierPackage } from './carrierIndex';
import { alphabeticalWorkspaceIds, artifactsForLineageMode, currentRoleChoices, IndexedArtifact, logicalGroupForArtifact, normalizePath, TreeLineageMode, TreeProjectionMode } from './core/artifactTree';
import { preferredRepositoryParent } from './core/receiveUx';
import { qualifiedRoutes, QualifiedRouteReceipt } from './core/receivedHandoff';
import { landHandoffPackage } from './landing';
import { loadHandoffEndpointChoices, loadPackageBuilderModel, buildHandoffPackageFromForm, routeChoiceKeyForHandoff } from './packageBuilder';
import { prepareSimpleHandoffDraft, PreparedSimpleHandoffDraft, SimpleHandoffIntent, SimpleHandoffParticipant, writePreparedSimpleHandoffDraft } from './authoring';
import { orientPackage, preparePackageRuntime } from './tiinex/bootstrap';

export type OperatorSection = 'discovery' | 'incoming' | 'outgoing';

type NodeKind =
  | 'message'
  | 'package'
  | 'workspace'
  | 'group'
  | 'directory'
  | 'artifact'
  | 'outgoing'
  | 'draft';

interface OutgoingWorkspace {
  workspaceId: string;
  label: string;
  root: string;
  repository: string;
  ref: string;
}

interface OutgoingDraft {
  id: string;
  draft: PreparedSimpleHandoffDraft;
  writtenPath: string;
  routeIncluded: boolean;
}

interface OutgoingState {
  name: string;
  fromIncoming: boolean;
  packageParentPath: string;
  workspaces: OutgoingWorkspace[];
  drafts: OutgoingDraft[];
}

interface IncomingState {
  index: IndexedCarrierPackage;
  orientation: any;
  mergedWorkspaceIds: Set<string>;
}

interface OperatorNodeData {
  kind: NodeKind;
  section: OperatorSection;
  id: string;
  label: string;
  description?: string;
  tooltip?: string;
  contextValue?: string;
  collapsible?: vscode.TreeItemCollapsibleState;
  packagePath?: string;
  workspaceId?: string;
  artifact?: IndexedArtifact;
  draftId?: string;
  pathPrefix?: string;
  groupName?: string;
}

class OperatorNode extends vscode.TreeItem {
  readonly data: OperatorNodeData;

  constructor(data: OperatorNodeData) {
    super(data.label, data.collapsible ?? vscode.TreeItemCollapsibleState.None);
    this.data = data;
    this.id = data.id;
    this.description = data.description;
    this.tooltip = data.tooltip || data.description || data.label;
    this.contextValue = data.contextValue;
    if (data.kind === 'artifact' || data.kind === 'draft') {
      this.command = {
        command: data.kind === 'draft' ? 'tiinex.outgoing.previewDraft' : 'tiinex.tree.openArtifact',
        title: 'Open Markdown Preview',
        arguments: [this]
      };
      this.iconPath = new vscode.ThemeIcon(data.kind === 'draft' ? 'edit' : 'markdown');
    } else if (data.kind === 'workspace') {
      this.iconPath = new vscode.ThemeIcon('repo');
    } else if (data.kind === 'package') {
      this.iconPath = new vscode.ThemeIcon('package');
    } else if (data.kind === 'directory' || data.kind === 'group') {
      this.iconPath = new vscode.ThemeIcon('folder');
    } else if (data.kind === 'outgoing') {
      this.iconPath = new vscode.ThemeIcon('archive');
    } else if (data.kind === 'message') {
      this.iconPath = new vscode.ThemeIcon('info');
    }
  }
}

class SectionProvider implements vscode.TreeDataProvider<OperatorNode> {
  private readonly changed = new vscode.EventEmitter<OperatorNode | undefined | void>();
  readonly onDidChangeTreeData = this.changed.event;

  constructor(private readonly controller: TiinexOperatorTrees, readonly section: OperatorSection) {}

  refresh(): void { this.changed.fire(); }
  getTreeItem(element: OperatorNode): vscode.TreeItem { return element; }
  getChildren(element?: OperatorNode): Thenable<OperatorNode[]> { return this.controller.children(this.section, element); }
  dispose(): void { this.changed.dispose(); }
}

class PreviewProvider implements vscode.TextDocumentContentProvider, vscode.Disposable {
  private readonly changed = new vscode.EventEmitter<vscode.Uri>();
  readonly onDidChange = this.changed.event;
  private readonly values = new Map<string, string>();

  put(id: string, markdown: string): vscode.Uri {
    const safe = id.replace(/[^a-zA-Z0-9._/-]+/g, '-').replace(/^\/+/, '');
    const uri = vscode.Uri.from({ scheme: 'tiinex-preview', path: `/${safe.endsWith('.md') ? safe : `${safe}.trace.md`}` });
    this.values.set(uri.toString(), markdown);
    this.changed.fire(uri);
    return uri;
  }

  provideTextDocumentContent(uri: vscode.Uri): string { return this.values.get(uri.toString()) || '# Tiinex preview\n\nPreview content is no longer available.'; }
  dispose(): void { this.values.clear(); this.changed.dispose(); }
}

export class TiinexOperatorTrees implements vscode.Disposable {
  private readonly discoveryProvider = new SectionProvider(this, 'discovery');
  private readonly incomingProvider = new SectionProvider(this, 'incoming');
  private readonly outgoingProvider = new SectionProvider(this, 'outgoing');
  private readonly previewProvider = new PreviewProvider();
  private readonly discoveryView: vscode.TreeView<OperatorNode>;
  private readonly incomingView: vscode.TreeView<OperatorNode>;
  private readonly outgoingView: vscode.TreeView<OperatorNode>;
  private watcher: FSWatcher | null = null;
  private watcherTimer: NodeJS.Timeout | null = null;
  private discovered: Array<{ path: string; filename: string; mtimeMs: number; bytes: number }> = [];
  private readonly carrierCache = new Map<string, IndexedCarrierPackage>();
  private incoming: IncomingState | null = null;
  private outgoing: OutgoingState | null = null;

  constructor(private readonly context: vscode.ExtensionContext, private readonly extensionPath: string) {
    this.discoveryView = vscode.window.createTreeView('tiinex.discovery', { treeDataProvider: this.discoveryProvider, showCollapseAll: true });
    this.incomingView = vscode.window.createTreeView('tiinex.incoming', { treeDataProvider: this.incomingProvider, showCollapseAll: true });
    this.outgoingView = vscode.window.createTreeView('tiinex.outgoing', { treeDataProvider: this.outgoingProvider, showCollapseAll: true });
    context.subscriptions.push(this.discoveryView, this.incomingView, this.outgoingView, this.discoveryProvider, this.incomingProvider, this.outgoingProvider, this.previewProvider);
    context.subscriptions.push(vscode.workspace.registerTextDocumentContentProvider('tiinex-preview', this.previewProvider));

    context.subscriptions.push(this.discoveryView.onDidChangeVisibility((event: { visible: boolean }) => {
      if (event.visible) void this.ensureDiscoveryFolderOnExpand();
    }));
    context.subscriptions.push(vscode.workspace.onDidChangeConfiguration((event: { affectsConfiguration(value: string): boolean }) => {
      if (event.affectsConfiguration('tiinex.discovery')) void this.restartDiscovery();
    }));
    this.registerCommands();
  }

  async start(): Promise<void> { await this.restartDiscovery(); }

  async openIncoming(packagePath: string): Promise<void> { await this.setIncoming(packagePath); }

  async focus(section: OperatorSection): Promise<void> { await vscode.commands.executeCommand(`tiinex.${section}.focus`); }

  dispose(): void {
    this.stopWatcher();
  }

  async children(section: OperatorSection, node?: OperatorNode): Promise<OperatorNode[]> {
    if (section === 'discovery') return this.discoveryChildren(node);
    if (section === 'incoming') return this.incomingChildren(node);
    return this.outgoingChildren(node);
  }

  private registerCommands(): void {
    const register = (id: string, fn: (...args: any[]) => any) => this.context.subscriptions.push(vscode.commands.registerCommand(id, fn));
    register('tiinex.discovery.selectFolder', () => this.selectDiscoveryFolder());
    register('tiinex.discovery.refresh', () => this.refreshDiscovery(true));
    register('tiinex.discovery.toggleProjection', () => this.toggleProjection('discovery'));
    register('tiinex.discovery.toggleLineage', () => this.toggleLineage('discovery'));
    register('tiinex.discovery.setIncoming', (node?: OperatorNode) => this.setIncoming(node?.data.packagePath || ''));
    register('tiinex.incoming.clear', () => this.clearIncoming());
    register('tiinex.incoming.toggleProjection', () => this.toggleProjection('incoming'));
    register('tiinex.incoming.toggleLineage', () => this.toggleLineage('incoming'));
    register('tiinex.incoming.mergeWorkspace', (node?: OperatorNode) => this.mergeIncomingWorkspace(node?.data.workspaceId || ''));
    register('tiinex.outgoing.new', () => this.newOutgoing());
    register('tiinex.outgoing.addWorkspace', () => this.addOutgoingWorkspace());
    register('tiinex.outgoing.toggleProjection', () => this.toggleProjection('outgoing'));
    register('tiinex.outgoing.toggleLineage', () => this.toggleLineage('outgoing'));
    register('tiinex.outgoing.newHandoff', (node?: OperatorNode) => this.newOutgoingHandoff(node?.data.workspaceId || ''));
    register('tiinex.outgoing.previewDraft', (node?: OperatorNode) => this.previewDraft(node?.data.draftId || ''));
    register('tiinex.outgoing.writeDraft', (node?: OperatorNode) => this.writeDraft(node?.data.draftId || ''));
    register('tiinex.outgoing.includeRoute', (node?: OperatorNode) => this.setDraftRoute(node?.data.draftId || '', true));
    register('tiinex.outgoing.excludeRoute', (node?: OperatorNode) => this.setDraftRoute(node?.data.draftId || '', false));
    register('tiinex.outgoing.package', () => this.packageOutgoing());
    register('tiinex.tree.openArtifact', (node: OperatorNode) => this.openArtifactNode(node));
  }

  private config(): vscode.WorkspaceConfiguration { return vscode.workspace.getConfiguration('tiinex'); }
  private discoveryFolder(): string { return String(this.config().get('discovery.folder', '') || '').trim(); }
  private projection(section: OperatorSection): TreeProjectionMode { return this.context.workspaceState.get<TreeProjectionMode>(`tiinex.tree.${section}.projection`, 'logical'); }
  private lineage(section: OperatorSection): TreeLineageMode { return this.context.workspaceState.get<TreeLineageMode>(`tiinex.tree.${section}.lineage`, 'leaves'); }

  private async toggleProjection(section: OperatorSection): Promise<void> {
    const next: TreeProjectionMode = this.projection(section) === 'logical' ? 'files' : 'logical';
    await this.context.workspaceState.update(`tiinex.tree.${section}.projection`, next);
    this.refresh(section);
  }

  private async toggleLineage(section: OperatorSection): Promise<void> {
    const next: TreeLineageMode = this.lineage(section) === 'leaves' ? 'lineage' : 'leaves';
    await this.context.workspaceState.update(`tiinex.tree.${section}.lineage`, next);
    this.refresh(section);
  }

  private refresh(section?: OperatorSection): void {
    if (!section || section === 'discovery') this.discoveryProvider.refresh();
    if (!section || section === 'incoming') this.incomingProvider.refresh();
    if (!section || section === 'outgoing') this.outgoingProvider.refresh();
  }

  private async ensureDiscoveryFolderOnExpand(): Promise<void> {
    if (this.discoveryFolder()) return;
    await this.selectDiscoveryFolder(false);
  }

  private async selectDiscoveryFolder(refresh = true): Promise<void> {
    const selected = await vscode.window.showOpenDialog({ canSelectFiles: false, canSelectFolders: true, canSelectMany: false, title: 'Select Tiinex discovery folder' });
    if (!selected?.length) {
      this.discovered = [];
      this.discoveryProvider.refresh();
      return;
    }
    const before = this.discoveryFolder();
    await this.config().update('discovery.folder', selected[0].fsPath, vscode.ConfigurationTarget.Global);
    if (refresh && path.resolve(before || '.') === path.resolve(selected[0].fsPath)) await this.restartDiscovery();
  }

  private async restartDiscovery(): Promise<void> {
    this.stopWatcher();
    await this.refreshDiscovery(false);
    if (this.config().get<boolean>('discovery.autoRefresh', false) && this.discoveryFolder()) this.startWatcher();
  }

  private stopWatcher(): void {
    this.watcher?.close();
    this.watcher = null;
    if (this.watcherTimer) clearTimeout(this.watcherTimer);
    this.watcherTimer = null;
  }

  private startWatcher(): void {
    const folder = this.discoveryFolder();
    if (!folder) return;
    try {
      this.watcher = watch(folder, { persistent: false }, (_event, filename) => {
        if (!filename || !String(filename).toLowerCase().endsWith('.handoff-package.zip')) return;
        if (this.watcherTimer) clearTimeout(this.watcherTimer);
        this.watcherTimer = setTimeout(() => void this.refreshDiscovery(false), 700);
      });
      this.watcher.on('error', () => { this.stopWatcher(); });
    } catch {
      this.stopWatcher();
    }
  }

  private async refreshDiscovery(showError: boolean): Promise<void> {
    const folder = this.discoveryFolder();
    if (!folder) {
      this.discovered = [];
      this.discoveryProvider.refresh();
      return;
    }
    try {
      const before = discoveryIdentity(this.discovered[0]);
      this.discovered = await discoveryPackages(folder);
      this.discoveryProvider.refresh();
      const latest = this.discovered[0];
      if (latest && discoveryIdentity(latest) !== before && this.config().get<boolean>('discovery.latestToIncoming', false)) await this.setIncoming(latest.path);
    } catch (error) {
      this.discovered = [];
      this.discoveryProvider.refresh();
      if (showError) await vscode.window.showErrorMessage(`Tiinex Discovery: ${shortMessage(error)}`);
    }
  }

  private async discoveryChildren(node?: OperatorNode): Promise<OperatorNode[]> {
    if (!node) {
      if (!this.discoveryFolder()) return [messageNode('discovery', 'You need to select a discovery folder')];
      if (!this.discovered.length) return [messageNode('discovery', 'No Handoff packages found')];
      return this.discovered.map((item) => new OperatorNode({
        kind: 'package', section: 'discovery', id: `discovery:package:${item.path}`, label: item.filename,
        description: timestamp(item.mtimeMs), tooltip: item.path, packagePath: item.path,
        contextValue: 'tiinex.discoveryPackage', collapsible: vscode.TreeItemCollapsibleState.Collapsed
      }));
    }
    if (node.data.kind === 'package') {
      const index = await this.carrier(node.data.packagePath || '');
      return this.packageProjection('discovery', index);
    }
    return this.artifactProjectionChildren('discovery', node, await this.artifactsForNode('discovery', node));
  }

  private async setIncoming(packagePath: string): Promise<void> {
    if (!packagePath) return;
    try {
      await vscode.window.withProgress({ location: vscode.ProgressLocation.Notification, title: 'Tiinex qualifying Incoming Handoff package', cancellable: false }, async () => {
        const index = await this.carrier(packagePath);
        const runtime = await preparePackageRuntime(packagePath, nodeExecutable());
        try {
          const orientation = await orientPackage(runtime, packagePath);
          if (String(orientation.status || '').toLowerCase() !== 'ready' && orientation.ready !== true) throw new Error(`package orientation is ${String(orientation.status || 'not ready')}`);
          this.incoming = { index, orientation, mergedWorkspaceIds: new Set() };
        } finally { await runtime.dispose(); }
      });
      this.incomingProvider.refresh();
      await this.autoShowIncomingRoleHandoff();
    } catch (error) {
      await vscode.window.showErrorMessage(`Tiinex Incoming blocked: ${shortMessage(error)}`, 'Show Details').then(async (choice: string | undefined) => {
        if (choice === 'Show Details') await vscode.window.showErrorMessage(String(error instanceof Error ? error.stack || error.message : error), { modal: true });
      });
    }
  }

  private clearIncoming(): void { this.incoming = null; this.incomingProvider.refresh(); }

  private async incomingChildren(node?: OperatorNode): Promise<OperatorNode[]> {
    if (!this.incoming) return [messageNode('incoming', 'No Incoming Handoff package')];
    const index = this.incoming.index;
    if (!node) return [new OperatorNode({ kind: 'package', section: 'incoming', id: `incoming:package:${index.packagePath}`, label: index.filename, description: timestamp(index.mtimeMs), tooltip: index.packagePath, packagePath: index.packagePath, contextValue: 'tiinex.incomingPackage', collapsible: vscode.TreeItemCollapsibleState.Expanded })];
    if (node.data.kind === 'package') return this.packageProjection('incoming', index);
    return this.artifactProjectionChildren('incoming', node, await this.artifactsForNode('incoming', node));
  }

  private async mergeIncomingWorkspace(workspaceId: string): Promise<void> {
    if (!this.incoming || !workspaceId || this.incoming.mergedWorkspaceIds.has(workspaceId)) return;
    try {
      const result = await landHandoffPackage(this.incoming.index.packagePath, this.extensionPath, [workspaceId]);
      if (result?.affectedWorkspaceIds.includes(workspaceId)) {
        this.incoming.mergedWorkspaceIds.add(workspaceId);
        this.incomingProvider.refresh();
      }
    } catch (error) {
      await vscode.window.showErrorMessage(`Tiinex Merge blocked: ${shortMessage(error)}`, 'Show Details').then(async (choice: string | undefined) => {
        if (choice === 'Show Details') await vscode.window.showErrorMessage(String(error instanceof Error ? error.stack || error.message : error), { modal: true });
      });
    }
  }

  private async autoShowIncomingRoleHandoff(): Promise<void> {
    if (!this.incoming) return;
    const policy = this.config().get<'no' | 'ask' | 'yes'>('incoming.autoShowRoleHandoff', 'ask');
    if (policy === 'no') return;
    const role = String(this.config().get('operator.role', '') || '').trim().toLocaleLowerCase();
    if (!role) return;
    const matches = qualifiedRoutes(this.incoming.orientation).filter((route) => [route.from, route.to].some((value) => String(value || '').trim().toLocaleLowerCase() === role));
    if (matches.length !== 1) return;
    if (policy === 'ask') {
      const accepted = await vscode.window.showInformationMessage(`Open the qualified Handoff for ${String(this.config().get('operator.role', '') || '').trim()}?`, 'Open Handoff');
      if (accepted !== 'Open Handoff') return;
    }
    await this.openRouteHandoff(matches[0]);
  }

  private async openRouteHandoff(route: QualifiedRouteReceipt): Promise<void> {
    if (!this.incoming) return;
    const workspace = this.incoming.index.workspaces.find((item) => item.workspaceId === route.workspaceId);
    const artifact = workspace?.artifacts.find((item) => normalizePath(item.path) === normalizePath(route.workspaceRelativeHandoffPath));
    if (!artifact) throw new Error('tiinex.incoming.route-handoff-artifact-missing');
    await this.openVirtualMarkdown(`incoming/${route.workspaceId}/${artifact.path}`, artifact.markdown);
  }

  private async newOutgoing(): Promise<void> {
    const choices: Array<vscode.QuickPickItem & { mode: 'blank' | 'incoming' }> = [
      { label: 'Blank', description: 'Start an empty live Outgoing context.', mode: 'blank' },
      { label: 'From Incoming', description: 'Mirror the active Incoming Workspaces and preserve carrier parentage.', mode: 'incoming' }
    ];
    const selected = await vscode.window.showQuickPick(choices, { placeHolder: 'New Outgoing', ignoreFocusOut: true });
    if (!selected) return;
    if (selected.mode === 'incoming' && !this.incoming) {
      await vscode.window.showInformationMessage('Set an Incoming Handoff package first.');
      return;
    }
    const roots = await safePackageModel(this.extensionPath);
    const defaultParent = preferredRepositoryParent(roots.workspaces.map((item) => item.root));
    const defaultName = `${path.basename(defaultParent || roots.workspaces[0]?.root || 'tiinex') || 'tiinex'}-`;
    const name = await vscode.window.showInputBox({ title: 'Outgoing name', prompt: 'Friendly local name for this Outgoing context.', value: defaultName, ignoreFocusOut: true });
    if (!name?.trim()) return;
    const workspaces: OutgoingWorkspace[] = [];
    if (selected.mode === 'incoming' && this.incoming) {
      for (const carrierWorkspace of this.incoming.index.workspaces) {
        const local = roots.workspaces.find((item) => item.workspaceId === carrierWorkspace.workspaceId);
        workspaces.push({ workspaceId: carrierWorkspace.workspaceId, label: carrierWorkspace.label || carrierWorkspace.workspaceId, root: local?.root || '', repository: local?.repository || carrierWorkspace.repository, ref: local?.ref || carrierWorkspace.ref });
      }
    }
    this.outgoing = {
      name: name.trim(),
      fromIncoming: selected.mode === 'incoming',
      packageParentPath: selected.mode === 'incoming' && this.incoming ? this.incoming.index.packagePath : '',
      workspaces: alphabeticalWorkspaceIds(workspaces),
      drafts: []
    };
    this.outgoingProvider.refresh();
  }

  private async addOutgoingWorkspace(): Promise<void> {
    if (!this.outgoing) { await this.newOutgoing(); if (!this.outgoing) return; }
    let model: Awaited<ReturnType<typeof loadPackageBuilderModel>>;
    try { model = await loadPackageBuilderModel(this.extensionPath); }
    catch (error) { await vscode.window.showErrorMessage(`Tiinex Outgoing Workspace discovery blocked: ${shortMessage(error)}`); return; }
    const existing = new Set(this.outgoing.workspaces.map((item) => item.workspaceId));
    const choices = model.workspaces.filter((item) => !existing.has(item.workspaceId)).map((item) => ({ label: item.workspaceId, description: item.repository || item.root, workspace: item }));
    if (!choices.length) { await vscode.window.showInformationMessage('All qualified local Workspaces are already in Outgoing.'); return; }
    const selected = await vscode.window.showQuickPick(choices, { canPickMany: true, placeHolder: 'Add live Workspaces to Outgoing', ignoreFocusOut: true });
    if (!selected?.length) return;
    for (const item of selected) this.outgoing.workspaces.push({ workspaceId: item.workspace.workspaceId, label: item.workspace.workspaceId, root: item.workspace.root, repository: item.workspace.repository, ref: item.workspace.ref });
    this.outgoing.workspaces = alphabeticalWorkspaceIds(this.outgoing.workspaces);
    this.outgoingProvider.refresh();
  }

  private async outgoingChildren(node?: OperatorNode): Promise<OperatorNode[]> {
    if (!this.outgoing) return [messageNode('outgoing', 'No Outgoing package context')];
    if (!node) return [new OperatorNode({ kind: 'outgoing', section: 'outgoing', id: `outgoing:${this.outgoing.name}`, label: this.outgoing.name, description: this.outgoing.fromIncoming ? 'From Incoming' : 'Blank', contextValue: 'tiinex.outgoingRoot', collapsible: vscode.TreeItemCollapsibleState.Expanded })];
    if (node.data.kind === 'outgoing') {
      const workspaces = alphabeticalWorkspaceIds(this.outgoing.workspaces);
      return workspaces.map((workspace) => this.workspaceNode('outgoing', workspace.workspaceId, workspace.label, Boolean(workspace.root), workspace.root ? '' : 'not open locally'));
    }
    if (node.data.kind === 'workspace') {
      const workspace = this.outgoing.workspaces.find((item) => item.workspaceId === node.data.workspaceId);
      if (!workspace) return [];
      const drafts = this.outgoing.drafts.filter((item) => item.draft.workspaceId === workspace.workspaceId).map((item) => new OperatorNode({
        kind: 'draft', section: 'outgoing', id: `outgoing:draft:${item.id}`, label: item.draft.title,
        description: item.writtenPath ? (item.routeIncluded ? 'route included' : 'written') : 'preview only',
        contextValue: item.writtenPath ? (item.routeIncluded ? 'tiinex.outgoingDraftRoute' : 'tiinex.outgoingDraftWritten') : 'tiinex.outgoingDraft',
        draftId: item.id
      }));
      if (!workspace.root) return drafts.length ? drafts : [messageNode('outgoing', 'Workspace source is carried by Incoming but is not open locally')];
      const indexed = await indexLocalWorkspace(workspace.root, workspace.workspaceId);
      return [...drafts, ...this.artifactNodesForWorkspace('outgoing', workspace.workspaceId, indexed.artifacts)];
    }
    return this.artifactProjectionChildren('outgoing', node, await this.artifactsForNode('outgoing', node));
  }

  private async newOutgoingHandoff(workspaceId: string): Promise<void> {
    if (!this.outgoing) return;
    const workspace = this.outgoing.workspaces.find((item) => item.workspaceId === workspaceId);
    if (!workspace?.root) { await vscode.window.showInformationMessage('Open or merge this Workspace locally before creating a Handoff in it.'); return; }
    const subject = await vscode.window.showInputBox({ title: 'New Handoff', prompt: 'What is this Handoff about?', placeHolder: 'Short subject', ignoreFocusOut: true });
    if (!subject?.trim()) return;
    const intentItems: Array<vscode.QuickPickItem & { intent: SimpleHandoffIntent }> = [
      { label: 'Discussion', description: 'Open a bounded discussion with another role.', intent: 'discussion' },
      { label: 'Continue', description: 'Hand off bounded work for continuation.', intent: 'continue' },
      { label: 'Review', description: 'Request review and disposition.', intent: 'review' },
      { label: 'Blocked', description: 'Transfer a blocker for resolution or routing.', intent: 'blocked' },
      { label: 'Complete', description: 'Return completed work for acknowledgement/disposition.', intent: 'complete' }
    ];
    const intent = await vscode.window.showQuickPick(intentItems, { title: 'Handoff intent', ignoreFocusOut: true });
    if (!intent) return;
    const endpoints = await this.endpointCatalog();
    const from = await this.pickEndpoint('From', endpoints, this.operatorRole());
    if (!from) return;
    const defaultTo = this.defaultIncomingReturnRole(workspaceId);
    const to = await this.pickEndpoint('To', endpoints, defaultTo);
    if (!to) return;
    const roleParticipants = endpoints.filter((item) => item.kind === 'role' && item.reference && item.label !== from.label && item.label !== to.label);
    const participantItems = roleParticipants.map((item) => ({ label: item.label, description: item.reference, endpoint: item, picked: false }));
    const participantPick = participantItems.length ? await vscode.window.showQuickPick(participantItems, { title: 'Additional participants (optional)', canPickMany: true, ignoreFocusOut: true, placeHolder: 'Select zero or more Role context participants, then press Enter' }) : [];
    if (participantPick === undefined) return;
    const participants: SimpleHandoffParticipant[] = (participantPick || []).map((item: any) => ({ label: item.endpoint.label, reference: item.endpoint.reference, workspaceId: item.endpoint.workspaceId, path: item.endpoint.path }));
    const parentArtifact = this.defaultIncomingParent(workspaceId);
    try {
      const draft = await vscode.window.withProgress({ location: vscode.ProgressLocation.Notification, title: 'Tiinex preparing Handoff preview', cancellable: false }, () => prepareSimpleHandoffDraft(this.extensionPath, {
        root: workspace.root,
        workspaceId,
        subject: subject.trim(),
        intent: intent.intent,
        from: { label: from.label, kind: from.kind, reference: from.reference },
        to: { label: to.label, kind: to.kind, reference: to.reference },
        participants,
        parentArtifact
      }));
      const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      this.outgoing.drafts.push({ id, draft, writtenPath: '', routeIncluded: false });
      this.outgoingProvider.refresh();
      await this.openVirtualMarkdown(`outgoing/${workspaceId}/${draft.path}`, draft.markdown);
    } catch (error) {
      await vscode.window.showErrorMessage(`Tiinex Handoff preview blocked: ${shortMessage(error)}`, 'Show Details').then(async (choice: string | undefined) => {
        if (choice === 'Show Details') await vscode.window.showErrorMessage(String(error instanceof Error ? error.stack || error.message : error), { modal: true });
      });
    }
  }

  private async previewDraft(draftId: string): Promise<void> {
    const item = this.outgoing?.drafts.find((draft) => draft.id === draftId);
    if (!item) return;
    if (item.writtenPath) {
      await vscode.commands.executeCommand('markdown.showPreview', vscode.Uri.file(item.writtenPath));
      return;
    }
    await this.openVirtualMarkdown(`outgoing/${item.draft.workspaceId}/${item.draft.path}`, item.draft.markdown);
  }

  private async writeDraft(draftId: string): Promise<void> {
    const item = this.outgoing?.drafts.find((draft) => draft.id === draftId);
    if (!item || item.writtenPath) return;
    try {
      item.writtenPath = await writePreparedSimpleHandoffDraft(this.extensionPath, item.draft);
      this.outgoingProvider.refresh();
      await vscode.commands.executeCommand('markdown.showPreview', vscode.Uri.file(item.writtenPath));
    } catch (error) {
      await vscode.window.showErrorMessage(`Tiinex Handoff write blocked: ${shortMessage(error)}`);
    }
  }

  private setDraftRoute(draftId: string, included: boolean): void {
    const item = this.outgoing?.drafts.find((draft) => draft.id === draftId);
    if (!item?.writtenPath) return;
    item.routeIncluded = included;
    this.outgoingProvider.refresh();
  }

  private async packageOutgoing(): Promise<void> {
    if (!this.outgoing) return;
    const routes = this.outgoing.drafts.filter((item) => item.writtenPath && item.routeIncluded);
    if (!routes.length) { await vscode.window.showInformationMessage('Mark at least one written Handoff as an Outgoing route before packaging.'); return; }
    const candidateItems = routes.map((item) => ({ label: item.draft.title, description: `${item.draft.workspaceId}: ${item.draft.path}`, item }));
    const selected = candidateItems.length === 1 ? candidateItems[0] : await vscode.window.showQuickPick(candidateItems, { title: 'Primary route for copied human routing text', ignoreFocusOut: true });
    if (!selected) return;
    const workspaceIds = alphabeticalWorkspaceIds(this.outgoing.workspaces).map((item) => item.workspaceId);
    try {
      await buildHandoffPackageFromForm(this.extensionPath, {
        routeId: routeChoiceKeyForHandoff(selected.item.draft.workspaceId, selected.item.draft.path),
        routeInputs: routes.map((item) => ({ routeId: routeChoiceKeyForHandoff(item.draft.workspaceId, item.draft.path), participantRoles: item.draft.participants })),
        workspaceIds,
        packageParentPath: this.outgoing.packageParentPath
      });
    } catch (error) {
      await vscode.window.showErrorMessage(`Tiinex Outgoing package blocked: ${shortMessage(error)}`, 'Show Details').then(async (choice: string | undefined) => {
        if (choice === 'Show Details') await vscode.window.showErrorMessage(String(error instanceof Error ? error.stack || error.message : error), { modal: true });
      });
    }
  }

  private operatorRole(): string { return String(this.config().get('operator.role', '') || '').trim(); }

  private async endpointCatalog(): Promise<Array<{ label: string; kind: 'role' | 'party' | 'unknown'; reference: string; workspaceId: string; path: string }>> {
    const artifacts: IndexedArtifact[] = [];
    if (this.incoming) {
      artifacts.push(...this.incoming.index.carrierArtifacts);
      for (const workspace of this.incoming.index.workspaces) artifacts.push(...workspace.artifacts);
    }
    const localModel = await safePackageModel(this.extensionPath);
    for (const workspace of localModel.workspaces) if (workspace.root) {
      try { artifacts.push(...(await indexLocalWorkspace(workspace.root, workspace.workspaceId)).artifacts); } catch { /* keep carried catalog usable */ }
    }
    const roles = currentRoleChoices(artifacts).map((item) => ({ label: item.label, kind: 'role' as const, reference: item.reference, workspaceId: item.workspaceId, path: item.path }));
    let parties: Array<{ label: string; kind: 'party'; reference: string; workspaceId: string; path: string }> = [];
    try {
      parties = (await loadHandoffEndpointChoices(this.extensionPath)).filter((item) => item.kind === 'party').map((item) => ({ label: item.label, kind: 'party' as const, reference: item.reference || item.target, workspaceId: item.workspaceId, path: item.artifactPath }));
    } catch { /* package-carried roles still work when a local endpoint catalog is unavailable */ }
    const byKey = new Map<string, { label: string; kind: 'role' | 'party' | 'unknown'; reference: string; workspaceId: string; path: string }>();
    for (const item of [...roles, ...parties]) byKey.set(`${item.kind}:${item.label.toLocaleLowerCase()}`, item);
    return [...byKey.values()].sort((a, b) => a.label.localeCompare(b.label));
  }

  private async pickEndpoint(title: string, catalog: Array<{ label: string; kind: 'role' | 'party' | 'unknown'; reference: string; workspaceId: string; path: string }>, preferred = ''): Promise<{ label: string; kind: 'role' | 'party' | 'unknown'; reference: string; workspaceId: string; path: string } | null> {
    const preferredKey = preferred.trim().toLocaleLowerCase();
    const items = catalog.map((item) => ({ label: item.label, description: item.kind === 'role' ? `Role · ${item.reference}` : `Party · ${item.reference}`, item, picked: item.label.toLocaleLowerCase() === preferredKey }));
    items.sort((a, b) => Number(b.picked) - Number(a.picked) || a.label.localeCompare(b.label));
    const custom = { label: 'Unknown / unrepresented', description: 'Use a text label without claiming a Role/Party artifact reference.', item: null as any, picked: false };
    const selected = await vscode.window.showQuickPick([...items, custom], { title, placeHolder: preferred ? `Suggested: ${preferred}` : `Select ${title}`, ignoreFocusOut: true });
    if (!selected) return null;
    if (selected.item) return selected.item;
    const label = await vscode.window.showInputBox({ title: `${title} label`, prompt: 'Label only; no Role/Party authority is inferred.', value: preferred || '', ignoreFocusOut: true });
    if (!label?.trim()) return null;
    return { label: label.trim(), kind: 'unknown', reference: '', workspaceId: '', path: '' };
  }

  private defaultIncomingReturnRole(workspaceId: string): string {
    if (!this.outgoing?.fromIncoming || !this.incoming) return '';
    const routes = qualifiedRoutes(this.incoming.orientation);
    const local = routes.filter((route) => route.workspaceId === workspaceId);
    if (local.length === 1) return local[0].from;
    return routes.length === 1 ? routes[0].from : '';
  }

  private defaultIncomingParent(workspaceId: string): { path: string; markdown: string } | null {
    if (!this.outgoing?.fromIncoming || !this.incoming) return null;
    const routes = qualifiedRoutes(this.incoming.orientation).filter((route) => route.workspaceId === workspaceId);
    if (routes.length !== 1) return null;
    const workspace = this.incoming.index.workspaces.find((item) => item.workspaceId === workspaceId);
    const artifact = workspace?.artifacts.find((item) => normalizePath(item.path) === normalizePath(routes[0].workspaceRelativeHandoffPath));
    return artifact ? { path: artifact.path, markdown: artifact.markdown } : null;
  }

  private async carrier(packagePath: string): Promise<IndexedCarrierPackage> {
    const resolved = path.resolve(packagePath);
    const existing = this.carrierCache.get(resolved);
    if (existing) {
      try {
        const current = await stat(resolved);
        if (current.isFile() && current.mtimeMs === existing.mtimeMs && current.size === existing.bytes) return existing;
      } catch { /* re-index below so the canonical error is surfaced */ }
    }
    const indexed = await indexCarrierPackage(resolved);
    this.carrierCache.set(resolved, indexed);
    return indexed;
  }

  private packageProjection(section: OperatorSection, index: IndexedCarrierPackage): OperatorNode[] {
    const carrierArtifacts = artifactsForLineageMode(index.carrierArtifacts, this.lineage(section));
    if (this.projection(section) === 'logical') {
      const nodes: OperatorNode[] = [];
      if (carrierArtifacts.length) nodes.push(...this.logicalArtifactGroups(section, 'carrier', carrierArtifacts));
      for (const workspace of index.workspaces) { const node = this.workspaceNode(section, workspace.workspaceId, workspace.label, true); node.data.packagePath = index.packagePath; nodes.push(node); }
      return nodes;
    }
    const nodes: OperatorNode[] = [];
    if (carrierArtifacts.length) nodes.push(new OperatorNode({ kind: 'group', section, id: `${section}:carrier-files`, label: 'Carrier', groupName: 'carrier-files', collapsible: vscode.TreeItemCollapsibleState.Collapsed }));
    for (const workspace of index.workspaces) { const node = this.workspaceNode(section, workspace.workspaceId, workspace.label, true); node.data.packagePath = index.packagePath; nodes.push(node); }
    return nodes;
  }

  private workspaceNode(section: OperatorSection, workspaceId: string, label: string, hasSource: boolean, description = ''): OperatorNode {
    let contextValue = `tiinex.${section}Workspace`;
    let icon = '';
    if (section === 'incoming' && this.incoming?.mergedWorkspaceIds.has(workspaceId)) { contextValue = 'tiinex.incomingWorkspaceMerged'; icon = 'merged'; }
    else if (section === 'incoming') contextValue = 'tiinex.incomingWorkspace';
    else if (section === 'outgoing' && !hasSource) contextValue = 'tiinex.outgoingWorkspaceMissing';
    else if (section === 'outgoing') contextValue = 'tiinex.outgoingWorkspace';
    const node = new OperatorNode({ kind: 'workspace', section, id: `${section}:workspace:${workspaceId}`, label, description: icon || description, workspaceId, contextValue, collapsible: vscode.TreeItemCollapsibleState.Collapsed });
    if (icon) node.iconPath = new vscode.ThemeIcon('pass-filled', new vscode.ThemeColor('testing.iconPassed'));
    return node;
  }

  private artifactNodesForWorkspace(section: OperatorSection, workspaceId: string, sourceArtifacts: IndexedArtifact[]): OperatorNode[] {
    const artifacts = artifactsForLineageMode(sourceArtifacts, this.lineage(section));
    if (this.projection(section) === 'logical') return this.logicalArtifactGroups(section, workspaceId, artifacts);
    return this.fileArtifactRoots(section, workspaceId, artifacts);
  }

  private logicalArtifactGroups(section: OperatorSection, scope: string, artifacts: IndexedArtifact[]): OperatorNode[] {
    const groups = new Map<string, IndexedArtifact[]>();
    for (const artifact of artifacts) groups.set(logicalGroupForArtifact(artifact), [...(groups.get(logicalGroupForArtifact(artifact)) || []), artifact]);
    return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([name]) => new OperatorNode({ kind: 'group', section, id: `${section}:group:${scope}:${name}`, label: name, groupName: `${scope}:${name}`, collapsible: vscode.TreeItemCollapsibleState.Collapsed }));
  }

  private fileArtifactRoots(section: OperatorSection, scope: string, artifacts: IndexedArtifact[]): OperatorNode[] {
    return directoryChildren(section, scope, artifacts, '');
  }

  private async artifactsForNode(section: OperatorSection, node: OperatorNode): Promise<IndexedArtifact[]> {
    if (section === 'discovery') {
      const packageNode = this.ancestorPackagePath(node) || node.data.packagePath;
      const index = packageNode ? await this.carrier(packageNode) : null;
      if (!index) return [];
      if (node.data.groupName === 'carrier-files' || node.data.groupName?.startsWith('carrier:')) return artifactsForLineageMode(index.carrierArtifacts, this.lineage(section));
      const workspace = index.workspaces.find((item) => item.workspaceId === node.data.workspaceId || node.data.groupName?.startsWith(`${item.workspaceId}:`) || node.data.pathPrefix?.startsWith(`${item.workspaceId}:`));
      return artifactsForLineageMode(workspace?.artifacts || [], this.lineage(section));
    }
    if (section === 'incoming' && this.incoming) {
      if (node.data.groupName === 'carrier-files' || node.data.groupName?.startsWith('carrier:')) return artifactsForLineageMode(this.incoming.index.carrierArtifacts, this.lineage(section));
      const workspace = this.incoming.index.workspaces.find((item) => item.workspaceId === node.data.workspaceId || node.data.groupName?.startsWith(`${item.workspaceId}:`) || node.data.pathPrefix?.startsWith(`${item.workspaceId}:`));
      return artifactsForLineageMode(workspace?.artifacts || [], this.lineage(section));
    }
    if (section === 'outgoing' && this.outgoing) {
      const workspaceId = node.data.workspaceId || node.data.groupName?.split(':')[0] || node.data.pathPrefix?.split(':')[0] || '';
      const workspace = this.outgoing.workspaces.find((item) => item.workspaceId === workspaceId);
      if (!workspace?.root) return [];
      return artifactsForLineageMode((await indexLocalWorkspace(workspace.root, workspaceId)).artifacts, this.lineage(section));
    }
    return [];
  }

  private artifactProjectionChildren(section: OperatorSection, node: OperatorNode, artifacts: IndexedArtifact[]): OperatorNode[] {
    if (node.data.kind === 'workspace') {
      const children = this.artifactNodesForWorkspace(section, node.data.workspaceId || '', artifacts);
      for (const child of children) { child.data.packagePath = node.data.packagePath; child.data.workspaceId = node.data.workspaceId; }
      return children;
    }
    if (node.data.kind === 'group') {
      let children: OperatorNode[] = [];
      if (node.data.groupName === 'carrier-files') children = this.fileArtifactRoots(section, 'carrier', artifacts);
      else {
        const [, group] = String(node.data.groupName || '').split(':', 2);
        if (group) children = artifacts.filter((artifact) => logicalGroupForArtifact(artifact) === group).sort((a, b) => a.title.localeCompare(b.title)).map((artifact) => artifactNode(section, artifact));
      }
      for (const child of children) { child.data.packagePath = node.data.packagePath; child.data.workspaceId = node.data.workspaceId; }
      return children;
    }
    if (node.data.kind === 'directory') {
      const prefix = String(node.data.pathPrefix || '').split(':').slice(1).join(':');
      const scope = String(node.data.pathPrefix || '').split(':')[0];
      const children = directoryChildren(section, scope, artifacts, prefix);
      for (const child of children) { child.data.packagePath = node.data.packagePath; child.data.workspaceId = node.data.workspaceId; }
      return children;
    }
    return [];
  }

  private ancestorPackagePath(node: OperatorNode): string { return node.data.packagePath || ''; }

  private async openArtifactNode(node: OperatorNode): Promise<void> {
    const artifact = node.data.artifact;
    if (!artifact) return;
    await this.openVirtualMarkdown(`${node.data.section}/${artifact.workspaceId || 'carrier'}/${artifact.path}`, artifact.markdown);
  }

  private async openVirtualMarkdown(id: string, markdown: string): Promise<void> {
    const uri = this.previewProvider.put(id, markdown);
    try {
      await vscode.commands.executeCommand('markdown.showPreview', uri);
      await vscode.commands.executeCommand('workbench.action.keepEditor');
    } catch {
      const document = await vscode.workspace.openTextDocument(uri);
      await vscode.window.showTextDocument(document, { preview: false, preserveFocus: false });
    }
  }
}

function artifactNode(section: OperatorSection, artifact: IndexedArtifact): OperatorNode {
  return new OperatorNode({ kind: 'artifact', section, id: `${section}:artifact:${artifact.id}`, label: artifact.title || path.posix.basename(artifact.path), description: artifact.kind, tooltip: artifact.path, contextValue: `tiinex.${section}Artifact`, artifact });
}

function directoryChildren(section: OperatorSection, scope: string, artifacts: IndexedArtifact[], prefix: string): OperatorNode[] {
  const normalizedPrefix = normalizePath(prefix);
  const directories = new Set<string>();
  const direct: IndexedArtifact[] = [];
  for (const artifact of artifacts) {
    const value = normalizePath(artifact.path);
    if (normalizedPrefix && !value.startsWith(`${normalizedPrefix}/`)) continue;
    const remainder = normalizedPrefix ? value.slice(normalizedPrefix.length + 1) : value;
    const slash = remainder.indexOf('/');
    if (slash < 0) direct.push(artifact);
    else directories.add(remainder.slice(0, slash));
  }
  const nodes = [...directories].sort((a, b) => a.localeCompare(b)).map((name) => {
    const next = normalizedPrefix ? `${normalizedPrefix}/${name}` : name;
    return new OperatorNode({ kind: 'directory', section, id: `${section}:dir:${scope}:${next}`, label: name, pathPrefix: `${scope}:${next}`, contextValue: `tiinex.${section}Directory`, collapsible: vscode.TreeItemCollapsibleState.Collapsed });
  });
  nodes.push(...direct.sort((a, b) => a.path.localeCompare(b.path)).map((artifact) => artifactNode(section, artifact)));
  return nodes;
}

function messageNode(section: OperatorSection, label: string): OperatorNode {
  return new OperatorNode({ kind: 'message', section, id: `${section}:message:${label}`, label, contextValue: `tiinex.${section}Message` });
}

function discoveryIdentity(item?: { path: string; mtimeMs: number; bytes: number }): string {
  return item ? `${path.resolve(item.path)}|${item.mtimeMs}|${item.bytes}` : '';
}

function timestamp(value: number): string {
  try { return new Date(value).toLocaleString(); } catch { return ''; }
}

function shortMessage(error: unknown): string {
  const raw = error instanceof Error ? error.message : String(error);
  const first = raw.split(/\r?\n/).find((line) => line.trim()) || raw;
  return first.length > 180 ? `${first.slice(0, 177)}...` : first;
}

function nodeExecutable(): string { return vscode.workspace.getConfiguration('tiinex').get('nodePath', '').toString().trim() || process.execPath; }

async function safePackageModel(extensionPath: string): Promise<Awaited<ReturnType<typeof loadPackageBuilderModel>>> {
  try { return await loadPackageBuilderModel(extensionPath); }
  catch { return { workspaces: [], routes: [] }; }
}
