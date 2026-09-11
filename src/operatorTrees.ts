import path from 'node:path';
import os from 'node:os';
import { createHash } from 'node:crypto';
import { FSWatcher, watch } from 'node:fs';
import { mkdir, readdir, readFile, rm, stat } from 'node:fs/promises';
import * as vscode from 'vscode';
import { preferredNodeExecutable } from './host/nodeExecutable';
import { indexCarrierPackage, indexLocalWorkspace, indexLocalWorkspaceFiles, readCarrierWorkspaceFile, discoveryPackages, IndexedCarrierPackage, IndexedWorkspaceFile } from './carrierIndex';
import { alphabeticalWorkspaceIds, artifactsForLineageMode, currentRoleChoices, IndexedArtifact, logicalGroupForArtifact, normalizePath, TreeLineageMode, TreeProjectionMode } from './core/artifactTree';
import { preferredRepositoryParent } from './core/receiveUx';
import { qualifiedRoutes, QualifiedRouteReceipt } from './core/receivedHandoff';
import { loadHandoffEndpointChoices, loadLocalWorkspaceChoices, loadPackageBuilderModel, buildHandoffPackageFromForm, announceBuiltCarrier, routeChoiceKeyForHandoff, IncomingPackageWorkspaceSource, PackageWorkspaceChoice, PackageWorkspaceSourceOverride, PackageRouteRouting, qualifyLocalWorkspaceChoice } from './packageBuilder';
import { ArtifactDraftParent, loadArtifactAuthoringModel, prepareArtifactDraft, PreparedArtifactDraft, qualifyExistingHandoff, SimpleHandoffParticipant, writePreparedArtifactDraft } from './authoring';
import { compareIncomingWorkspaceToLocal, orientPackage, prepareBundledRuntime, preparePackageRuntime } from './tiinex/bootstrap';
import { applyIncomingWorkspaces, IncomingApplyStrategy } from './incomingApply';
import { operatorMatchedWorkspaceIds, resolvePrioritizedWorkspaceDuplicates } from './core/sourceSelection';
import { comparePackageRecency, inheritedOutgoingLabel } from './core/outgoingUx';
import { payloadCheckoutEligibility } from './host/git';
import { extractZipBuffer, readExactZipEntryFromFile } from './host/zip';
import { ArtifactAuthoringSubmission, AuthoringFieldAssist, AuthoringTemplateOption, openArtifactAuthoringPanel } from './artifactAuthoringPanel';
import { repositoryRootForResource } from './vscode/gitApi';
import { sameRepositoryRoot } from './core/repositoryPath';
import { planWorkspaceSession, validateWorkspaceTargetMapping } from './core/workspaceSession';
import { routeChoiceKey } from './core/operatorModel';
import { consumeIncomingMultiRootResume, prepareIncomingMultiRootSession } from './vscode/incomingWorkspaceSession';

export type OperatorSection = 'discovery' | 'incoming' | 'outgoing';

type NodeKind =
  | 'message'
  | 'package'
  | 'workspace'
  | 'workspaceArchive'
  | 'group'
  | 'directory'
  | 'artifact'
  | 'projectedFile'
  | 'file'
  | 'outgoing'
  | 'draft'
  | 'action';

interface OutgoingWorkspace {
  workspaceId: string;
  label: string;
  root: string;
  repository: string;
  ref: string;
  source: 'local' | 'incoming';
  sourceKey: string;
  sourceLabel: string;
  packagePath?: string;
  archivePath?: string;
  payloadIncluded: boolean;
  checkoutRepository?: string;
  checkoutRef?: string;
  stagedRoot?: string;
}

interface OutgoingDraft {
  id: string;
  draft: PreparedArtifactDraft;
  writtenPath: string;
  routeIncluded: boolean;
  participants: SimpleHandoffParticipant[];
  from: string;
  to: string;
  origin: 'created' | 'existing';
}

interface OutgoingState {
  name: string;
  packageParentPath: string;
  workspaces: OutgoingWorkspace[];
  drafts: OutgoingDraft[];
  packageMajorReason: string;
  lastBuilt?: { outputPath: string; routes: PackageRouteRouting[] };
}

type OutgoingWorkspaceSeed =
  | { kind: 'local' }
  | { kind: 'incoming'; packagePath: string };

interface IncomingPendingState {
  packagePath: string;
  filename: string;
  mtimeMs: number;
  bytes: number;
}

interface IncomingState {
  index: IndexedCarrierPackage;
  orientation: any;
  appliedWorkspaceIds: Set<string>;
}

interface PackageHandoffLink {
  workspaceId: string;
  handoffPath: string;
  pointerPath: string;
  from: string;
  to: string;
}

interface WorkspaceDeltaView {
  state: 'exact' | 'changed' | 'local-missing' | 'unavailable';
  added: number;
  modified: number;
  removed: number;
  incomingPaths: Set<string>;
}

interface PackageDeltaView {
  workspaces: Map<string, WorkspaceDeltaView>;
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
  filePath?: string;
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
      this.iconPath = new vscode.ThemeIcon(data.kind === 'draft' ? 'edit' : (data.artifact ? artifactIcon(data.artifact) : 'markdown'));
    } else if (data.kind === 'workspace') {
      this.iconPath = new vscode.ThemeIcon('repo');
    } else if (data.kind === 'workspaceArchive') {
      this.iconPath = new vscode.ThemeIcon('file-zip');
    } else if (data.kind === 'package') {
      this.iconPath = new vscode.ThemeIcon('archive');
    } else if (data.kind === 'projectedFile') {
      this.iconPath = new vscode.ThemeIcon(data.label.toLocaleLowerCase().endsWith('.zip') ? 'file-zip' : 'markdown');
    } else if (data.kind === 'file') {
      this.iconPath = new vscode.ThemeIcon(fileTreeIcon(data.label));
      if (/\.md$/i.test(data.label)) {
        this.command = {
          command: 'tiinex.tree.openWorkspaceMarkdown',
          title: 'Open Markdown Preview',
          arguments: [this]
        };
      }
    } else if (data.kind === 'directory' || data.kind === 'group') {
      this.iconPath = new vscode.ThemeIcon(treeFolderIcon(data.label));
    } else if (data.kind === 'outgoing') {
      // Keep Incoming and Outgoing package roots visually identical.
      this.iconPath = new vscode.ThemeIcon('archive');
    } else if (data.kind === 'action') {
      this.iconPath = new vscode.ThemeIcon('play');
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
  getParent(element: OperatorNode): vscode.ProviderResult<OperatorNode> { return this.controller.parent(this.section, element); }
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
  private readonly deltaCache = new Map<string, Promise<PackageDeltaView>>();
  private readonly parentNodes: Record<OperatorSection, Map<string, OperatorNode>> = {
    discovery: new Map(),
    incoming: new Map(),
    outgoing: new Map()
  };
  private incoming: IncomingState[] = [];
  private readonly incomingPending = new Map<string, IncomingPendingState>();
  private outgoing: OutgoingState | null = null;
  private outgoingFolderSelection = '';
  private outgoingLoading = false;

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

  async start(): Promise<void> {
    await this.ensureTreePreferenceDefaults();
    await this.restartDiscovery();
    await this.updateUiContexts();
    await this.resumeIncomingMultiRootSession();
  }

  async openIncoming(packagePath: string): Promise<void> { await this.setIncoming(packagePath); }

  async focus(section: OperatorSection): Promise<void> { await vscode.commands.executeCommand(`tiinex.${section}.focus`); }

  async beginHandoffAuthoring(): Promise<void> {
    await this.revealOutgoingPanel();
    if (!this.outgoing) {
      await this.newOutgoing();
      if (!this.outgoing) return;
    }
    if (!this.outgoing.workspaces.length && !await this.selectOutgoingWorkspaces()) return;
    const choices = this.outgoing.workspaces.map((workspace) => ({
      label: workspace.label || workspace.workspaceId,
      description: workspace.sourceLabel || workspace.workspaceId,
      workspaceId: workspace.workspaceId
    }));
    const selected = choices.length === 1
      ? choices[0]
      : await vscode.window.showQuickPick(choices, { title: 'New Handoff · Choose Workspace', canPickMany: false, ignoreFocusOut: true });
    if (selected) await this.newOutgoingHandoff(selected.workspaceId);
  }

  dispose(): void {
    this.stopWatcher();
  }

  async children(section: OperatorSection, node?: OperatorNode): Promise<OperatorNode[]> {
    const children = section === 'discovery'
      ? await this.discoveryChildren(node)
      : section === 'incoming'
        ? await this.incomingChildren(node)
        : await this.outgoingChildren(node);
    const parents = this.parentNodes[section];
    if (!node) parents.clear();
    for (const child of children) {
      if (node) parents.set(child.id || child.data.id, node);
      else parents.delete(child.id || child.data.id);
    }
    return children;
  }

  parent(section: OperatorSection, node: OperatorNode): OperatorNode | undefined {
    return this.parentNodes[section].get(node.id || node.data.id);
  }

  private registerCommands(): void {
    const register = (id: string, fn: (...args: any[]) => any) => this.context.subscriptions.push(vscode.commands.registerCommand(id, fn));
    register('tiinex.discovery.selectFolder', () => this.selectDiscoveryFolder());
    register('tiinex.discovery.refresh', () => this.refreshDiscovery(true));
    register('tiinex.discovery.toggleProjection', () => this.toggleProjection('discovery'));
    register('tiinex.discovery.toggleLineage', () => this.toggleLineage('discovery'));
    register('tiinex.discovery.toggleDelta', () => this.toggleDelta('discovery'));
    register('tiinex.discovery.setIncoming', (node?: OperatorNode) => this.setIncoming(node?.data.packagePath || ''));
    register('tiinex.incoming.refresh', () => this.refreshIncoming());
    register('tiinex.incoming.close', (node?: OperatorNode) => this.closeIncoming(node?.data.packagePath || ''));
    register('tiinex.incoming.toggleProjection', () => this.toggleProjection('incoming'));
    register('tiinex.incoming.toggleLineage', () => this.toggleLineage('incoming'));
    register('tiinex.incoming.toggleDelta', () => this.toggleDelta('incoming'));
    register('tiinex.incoming.mergeReplace', (node?: OperatorNode) => this.mergeReplaceIncoming(node));
    register('tiinex.incoming.merge', (node?: OperatorNode) => this.mergeReplaceIncoming(node, 'merge'));
    register('tiinex.incoming.replace', (node?: OperatorNode) => this.mergeReplaceIncoming(node, 'replace'));
    register('tiinex.outgoing.new', () => this.newOutgoing());
    register('tiinex.outgoing.selectWorkspaces', () => this.selectOutgoingWorkspaces());
    register('tiinex.outgoing.refresh', () => this.refreshOutgoing());
    register('tiinex.outgoing.selectFolder', () => this.selectOutgoingFolder(this.outgoingFolder() || this.discoveryFolder() || undefined));
    register('tiinex.outgoing.close', () => this.closeOutgoing());
    register('tiinex.outgoing.bumpMajor', () => this.bumpOutgoingMajor());
    register('tiinex.outgoing.clearMajor', () => this.clearOutgoingMajor());
    register('tiinex.outgoing.toggleProjection', () => this.toggleProjection('outgoing'));
    register('tiinex.outgoing.toggleLineage', () => this.toggleLineage('outgoing'));
    register('tiinex.outgoing.newHandoff', (node?: OperatorNode) => this.newOutgoingHandoff(node?.data.workspaceId || ''));
    register('tiinex.outgoing.previewDraft', (node?: OperatorNode) => this.previewDraft(node?.data.draftId || ''));
    register('tiinex.outgoing.writeDraft', (node?: OperatorNode) => this.writeDraft(node?.data.draftId || ''));
    register('tiinex.outgoing.includeRoute', (node?: OperatorNode) => this.setDraftRoute(node?.data.draftId || '', true));
    register('tiinex.outgoing.excludeRoute', (node?: OperatorNode) => this.setDraftRoute(node?.data.draftId || '', false));
    register('tiinex.outgoing.attachHandoff', (node?: OperatorNode) => this.attachOutgoingHandoffNode(node));
    register('tiinex.outgoing.detachHandoff', (node?: OperatorNode) => this.detachOutgoingHandoffNode(node));
    register('tiinex.outgoing.copyTransportText', (node?: OperatorNode) => this.copyOutgoingTransportText(node));
    register('tiinex.outgoing.package', () => this.packageOutgoing());
    register('tiinex.outgoing.omitWorkspacePayload', (node?: OperatorNode) => this.setOutgoingWorkspacePayload(node?.data.workspaceId || '', false));
    register('tiinex.outgoing.embedWorkspacePayload', (node?: OperatorNode) => this.setOutgoingWorkspacePayload(node?.data.workspaceId || '', true));
    register('tiinex.outgoing.omitBootstrapPayload', () => this.setOutgoingBootstrapPayload(false));
    register('tiinex.outgoing.embedBootstrapPayload', () => this.setOutgoingBootstrapPayload(true));
    register('tiinex.tree.openArtifact', (node: OperatorNode) => this.openArtifactNode(node));
    register('tiinex.tree.openWorkspaceMarkdown', (node: OperatorNode) => this.openWorkspaceMarkdownNode(node));
    register('tiinex.artifact.newHandoff', (resource?: vscode.Uri) => this.newHandoffFromExplorer(resource));
    register('tiinex.artifact.attachHandoff', (resource?: vscode.Uri) => this.attachHandoffFromExplorer(resource));

    // Compatibility-only command ids from the preparatory iteration. They stay hidden.
    register('tiinex.incoming.clear', () => this.clearIncoming());
    register('tiinex.incoming.mergeSelected', () => this.mergeReplaceIncoming(this.latestIncomingRootNode()));
    register('tiinex.incoming.mergeWorkspace', (node?: OperatorNode) => this.mergeReplaceIncoming(node));
    register('tiinex.outgoing.newBlank', () => this.newOutgoing());
    register('tiinex.outgoing.newFromIncoming', async () => { await this.newOutgoing(); if (this.outgoing) await this.selectOutgoingWorkspaces(); });
    register('tiinex.outgoing.addWorkspace', () => this.selectOutgoingWorkspaces());
  }

  private config(): vscode.WorkspaceConfiguration { return vscode.workspace.getConfiguration('tiinex'); }
  private discoveryFolder(): string { return String(this.config().get('discovery.folder', '') || '').trim(); }
  private outgoingFolder(): string { return String(this.outgoingFolderSelection || this.config().get('outgoing.folder', '') || '').trim(); }
  private projection(section: OperatorSection): TreeProjectionMode { return this.context.workspaceState.get<TreeProjectionMode>(`tiinex.tree.${section}.projection`, 'files'); }
  private lineage(section: OperatorSection): TreeLineageMode { return this.context.workspaceState.get<TreeLineageMode>(`tiinex.tree.${section}.lineage`, 'lineage'); }
  private delta(section: OperatorSection): boolean { return section !== 'outgoing' && this.context.workspaceState.get<boolean>(`tiinex.tree.${section}.delta`, false); }

  private async ensureTreePreferenceDefaults(): Promise<void> {
    const version = this.context.workspaceState.get<number>('tiinex.tree.preferenceVersion', 0);
    if (version >= 2) return;
    for (const section of ['discovery', 'incoming', 'outgoing'] as OperatorSection[]) {
      await this.context.workspaceState.update(`tiinex.tree.${section}.projection`, 'files');
      await this.context.workspaceState.update(`tiinex.tree.${section}.lineage`, 'lineage');
      if (section !== 'outgoing') await this.context.workspaceState.update(`tiinex.tree.${section}.delta`, false);
    }
    await this.context.workspaceState.update('tiinex.tree.preferenceVersion', 2);
  }

  private modeLabel(section: OperatorSection): string {
    const projection = this.projection(section) === 'files' ? 'Files' : 'Logical';
    const lineage = this.lineage(section) === 'lineage' ? 'Lineage' : 'Leaves';
    const delta = this.delta(section) ? ' · Delta' : '';
    return `${projection} · ${lineage}${delta}`;
  }

  private async toggleDelta(section: 'discovery' | 'incoming'): Promise<void> {
    await this.context.workspaceState.update(`tiinex.tree.${section}.delta`, !this.delta(section));
    this.deltaCache.clear();
    (section === 'discovery' ? this.discoveryProvider : this.incomingProvider).refresh();
    await this.updateUiContexts();
  }

  private async toggleProjection(section: OperatorSection): Promise<void> {
    const next: TreeProjectionMode = this.projection(section) === 'logical' ? 'files' : 'logical';
    await this.context.workspaceState.update(`tiinex.tree.${section}.projection`, next);
    this.refresh(section);
    await this.updateUiContexts();
  }

  private async toggleLineage(section: OperatorSection): Promise<void> {
    const next: TreeLineageMode = this.lineage(section) === 'leaves' ? 'lineage' : 'leaves';
    await this.context.workspaceState.update(`tiinex.tree.${section}.lineage`, next);
    this.refresh(section);
    await this.updateUiContexts();
  }

  private refresh(section?: OperatorSection): void {
    if (!section || section === 'discovery') this.discoveryProvider.refresh();
    if (!section || section === 'incoming') this.incomingProvider.refresh();
    if (!section || section === 'outgoing') this.outgoingProvider.refresh();
  }

  private async updateUiContexts(): Promise<void> {
    const hasIncoming = this.incoming.length > 0 || this.incomingPending.size > 0;
    const hasOutgoing = Boolean(this.outgoing);
    const canPackage = Boolean(this.outgoing && this.outgoing.workspaces.length && this.outgoing.drafts.some((item) => item.writtenPath && item.routeIncluded));
    const canBumpMajor = Boolean(this.outgoing?.packageParentPath && !this.outgoing.packageMajorReason);
    const majorSelected = Boolean(this.outgoing?.packageMajorReason);
    const pairs: Array<[string, boolean | string]> = [
      ['tiinex.discovery.hasFolder', Boolean(this.discoveryFolder())],
      ['tiinex.discovery.hasPackages', this.visibleDiscoveredPackages().length > 0],
      ['tiinex.incoming.hasPackage', hasIncoming],
      ['tiinex.outgoing.hasContext', hasOutgoing],
      ['tiinex.outgoing.canPackage', canPackage],
      ['tiinex.outgoing.canBumpMajor', canBumpMajor],
      ['tiinex.outgoing.majorSelected', majorSelected],
      ['tiinex.discovery.projection', this.projection('discovery')],
      ['tiinex.discovery.lineage', this.lineage('discovery')],
      ['tiinex.discovery.delta', this.delta('discovery')],
      ['tiinex.incoming.projection', this.projection('incoming')],
      ['tiinex.incoming.lineage', this.lineage('incoming')],
      ['tiinex.incoming.delta', this.delta('incoming')],
      ['tiinex.outgoing.projection', this.projection('outgoing')],
      ['tiinex.outgoing.lineage', this.lineage('outgoing')]
    ];
    await Promise.all(pairs.map(([key, value]) => vscode.commands.executeCommand('setContext', key, value)));
    this.discoveryView.description = this.modeLabel('discovery');
    this.incomingView.description = this.modeLabel('incoming');
    this.outgoingView.description = this.modeLabel('outgoing');
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
      await this.updateUiContexts();
      return;
    }
    const before = this.discoveryFolder();
    await this.config().update('discovery.folder', selected[0].fsPath, vscode.ConfigurationTarget.Global);
    if (refresh && path.resolve(before || '.') === path.resolve(selected[0].fsPath)) await this.restartDiscovery();
    else await this.updateUiContexts();
  }

  private async selectOutgoingFolder(defaultFolder?: string, persist = true): Promise<string> {
    const selected = await vscode.window.showOpenDialog({
      canSelectFiles: false,
      canSelectFolders: true,
      canSelectMany: false,
      title: 'Select Tiinex outgoing folder',
      defaultUri: defaultFolder ? vscode.Uri.file(path.resolve(defaultFolder)) : undefined
    });
    if (!selected?.length) return '';
    if (persist) {
      this.outgoingFolderSelection = selected[0].fsPath;
      await this.config().update('outgoing.folder', selected[0].fsPath, vscode.ConfigurationTarget.Global);
    }
    this.outgoingProvider.refresh();
    return selected[0].fsPath;
  }

  private async restartDiscovery(): Promise<void> {
    this.stopWatcher();
    await this.refreshDiscovery(false);
    if (this.config().get<boolean>('discovery.autoRefresh', false) && this.discoveryFolder()) this.startWatcher();
    await this.updateUiContexts();
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
      await this.updateUiContexts();
      return;
    }
    try {
      const before = discoveryIdentity(this.discovered[0]);
      this.discovered = await discoveryPackages(folder);
      this.discoveryProvider.refresh();
      const latest = this.discovered[0];
      if (latest && discoveryIdentity(latest) !== before && this.config().get<boolean>('discovery.latestToIncoming', false)) await this.setIncoming(latest.path);
      await this.updateUiContexts();
    } catch (error) {
      this.discovered = [];
      this.discoveryProvider.refresh();
      if (showError) await vscode.window.showErrorMessage(`Tiinex Discovery: ${shortMessage(error)}`);
      await this.updateUiContexts();
    }
  }

  private visibleDiscoveredPackages(): Array<{ path: string; filename: string; mtimeMs: number; bytes: number }> {
    const incomingPaths = new Set([
      ...this.incoming.map((item) => path.resolve(item.index.packagePath)),
      ...[...this.incomingPending.keys()]
    ]);
    return this.discovered.filter((item) => !incomingPaths.has(path.resolve(item.path)));
  }

  private async discoveryChildren(node?: OperatorNode): Promise<OperatorNode[]> {
    if (!node) {
      if (!this.discoveryFolder()) return [messageNode('discovery', 'You need to select a discovery folder')];
      if (!this.discovered.length) return [messageNode('discovery', 'No Handoff packages found')];
      const visible = this.visibleDiscoveredPackages();
      if (!visible.length) return [messageNode('discovery', 'All discovered Handoff packages are open in Incoming')];
      return visible.map((item) => new OperatorNode({
        kind: 'package', section: 'discovery', id: `discovery:package:${item.path}`, label: item.filename,
        description: `${timestamp(item.mtimeMs)} · ${this.modeLabel('discovery')}`, tooltip: item.path, packagePath: item.path,
        contextValue: 'tiinex.discoveryPackage', collapsible: vscode.TreeItemCollapsibleState.Collapsed
      }));
    }
    if (node.data.kind === 'package') {
      const index = await this.carrier(node.data.packagePath || '');
      return this.delta('discovery') ? this.deltaPackageProjection('discovery', index) : this.packageProjection('discovery', index);
    }
    const index = node.data.packagePath ? await this.carrier(node.data.packagePath) : null;
    if (index) {
      const pointerChildren = await this.pointerTargetChildren('discovery', node, index);
      if (pointerChildren) return pointerChildren;
    }
    if (index && node.data.kind === 'workspaceArchive') {
      const workspace = index.workspaces.find((item) => item.workspaceId === node.data.workspaceId);
      const artifacts = artifactsForLineageMode(workspace?.artifacts || [], this.lineage('discovery'));
      return this.fileArtifactRoots('discovery', workspace?.workspaceId || '', await this.filterDeltaArtifacts('discovery', index, workspace?.workspaceId || '', artifacts), index.packagePath);
    }
    if (index && node.data.kind === 'directory' && node.data.pathPrefix?.startsWith('outer:')) {
      return this.outerCarrierFileChildren('discovery', index, node.data.pathPrefix.slice('outer:'.length));
    }
    const logical = await this.logicalWorkspaceProjectionChildren('discovery', node);
    if (logical) return logical;
    return this.artifactProjectionChildren('discovery', node, await this.artifactsForNode('discovery', node));
  }

  private incomingState(packagePath = ''): IncomingState | null {
    if (!this.incoming.length) return null;
    if (!packagePath) return this.incoming[0];
    const resolved = path.resolve(packagePath);
    return this.incoming.find((item) => path.resolve(item.index.packagePath) === resolved) || null;
  }

  private latestIncomingRootNode(): OperatorNode | undefined {
    const state = this.incoming[0];
    if (!state) return undefined;
    return new OperatorNode({
      kind: 'package', section: 'incoming', id: `incoming:package:${state.index.packagePath}`, label: state.index.filename,
      packagePath: state.index.packagePath, contextValue: 'tiinex.incomingPackage', collapsible: vscode.TreeItemCollapsibleState.Expanded
    });
  }

  private async qualifyIncoming(packagePath: string, appliedWorkspaceIds = new Set<string>()): Promise<IncomingState> {
    const index = await this.carrier(packagePath);
    const runtime = await preparePackageRuntime(packagePath, nodeExecutable());
    try {
      const orientation = await orientPackage(runtime, packagePath);
      if (String(orientation.status || '').toLowerCase() !== 'ready' && orientation.ready !== true) throw new Error(`package orientation is ${String(orientation.status || 'not ready')}`);
      return { index, orientation, appliedWorkspaceIds };
    } finally { await runtime.dispose(); }
  }

  private sortIncomingByDiscoveryOrder(): void {
    this.incoming.sort((a, b) => comparePackageRecency(a.index, b.index));
  }

  private async setIncoming(packagePath: string): Promise<void> {
    if (!packagePath) return;
    const resolved = path.resolve(packagePath);
    // A package behaves like a moved card while it is in Incoming. Re-opening the
    // same path must not create a second loading/ready root.
    if (this.incomingState(resolved) || this.incomingPending.has(resolved)) return;
    const discovered = this.discovered.find((item) => path.resolve(item.path) === resolved);
    let metadata: IncomingPendingState;
    try {
      const info = discovered ? null : await stat(resolved);
      metadata = {
        packagePath: resolved,
        filename: discovered?.filename || path.basename(resolved),
        mtimeMs: discovered?.mtimeMs ?? info?.mtimeMs ?? Date.now(),
        bytes: discovered?.bytes ?? info?.size ?? 0
      };
    } catch {
      metadata = { packagePath: resolved, filename: path.basename(resolved), mtimeMs: Date.now(), bytes: 0 };
    }

    // Move first, qualify second: the package immediately leaves Discovery and
    // appears in Incoming as a lightweight loading root. No carrier bytes are
    // trusted or projected until qualification completes.
    this.incomingPending.set(resolved, metadata);
    this.incomingProvider.refresh();
    this.discoveryProvider.refresh();
    await this.updateUiContexts();

    try {
      let state!: IncomingState;
      await vscode.window.withProgress({ location: vscode.ProgressLocation.Notification, title: 'Tiinex qualifying Incoming Handoff package', cancellable: false }, async () => {
        const existing = this.incomingState(packagePath);
        state = await this.qualifyIncoming(packagePath, existing?.appliedWorkspaceIds || new Set());
      });
      // Close may have been invoked while qualification was running. In that case
      // the dry loading root has already been cancelled and must not reappear.
      if (!this.incomingPending.has(resolved)) return;
      this.incomingPending.delete(resolved);
      this.incoming = [state, ...this.incoming.filter((item) => path.resolve(item.index.packagePath) !== resolved)];
      this.sortIncomingByDiscoveryOrder();
      this.incomingProvider.refresh();
      this.discoveryProvider.refresh();
      await this.updateUiContexts();
      await this.autoShowIncomingRoleHandoff(state);
    } catch (error) {
      this.incomingPending.delete(resolved);
      this.incomingProvider.refresh();
      this.discoveryProvider.refresh();
      await this.updateUiContexts();
      await vscode.window.showErrorMessage(`Tiinex Incoming blocked: ${shortMessage(error)}`, 'Show Details').then(async (choice: string | undefined) => {
        if (choice === 'Show Details') await vscode.window.showErrorMessage(String(error instanceof Error ? error.stack || error.message : error), { modal: true });
      });
    }
  }

  private clearIncoming(): void {
    this.incoming = [];
    this.incomingPending.clear();
    this.incomingProvider.refresh();
    this.discoveryProvider.refresh();
    void this.updateUiContexts();
  }

  private closeIncoming(packagePath: string): void {
    if (!packagePath) return;
    const resolved = path.resolve(packagePath);
    this.incoming = this.incoming.filter((item) => path.resolve(item.index.packagePath) !== resolved);
    this.incomingPending.delete(resolved);
    this.incomingProvider.refresh();
    this.discoveryProvider.refresh();
    void this.updateUiContexts();
  }

  private async refreshIncoming(): Promise<void> {
    this.deltaCache.clear();
    if (!this.incoming.length) { this.incomingProvider.refresh(); return; }
    try {
      await vscode.window.withProgress({ location: vscode.ProgressLocation.Notification, title: 'Tiinex refreshing Incoming packages', cancellable: false }, async () => {
        const refreshed: IncomingState[] = [];
        for (const previous of this.incoming) {
          this.carrierCache.delete(path.resolve(previous.index.packagePath));
          refreshed.push(await this.qualifyIncoming(previous.index.packagePath, previous.appliedWorkspaceIds));
        }
        this.incoming = refreshed;
        this.sortIncomingByDiscoveryOrder();
      });
      this.incomingProvider.refresh();
      this.discoveryProvider.refresh();
      await this.updateUiContexts();
    } catch (error) {
      await vscode.window.showErrorMessage(`Tiinex Incoming refresh blocked: ${shortMessage(error)}`);
    }
  }

  private async incomingChildren(node?: OperatorNode): Promise<OperatorNode[]> {
    if (!this.incoming.length && !this.incomingPending.size) return [messageNode('incoming', 'No Incoming Handoff packages')];
    if (!node) {
      const ready = this.incoming.map((state) => ({
        packagePath: state.index.packagePath, filename: state.index.filename, mtimeMs: state.index.mtimeMs, bytes: state.index.bytes, state
      }));
      const pending = [...this.incomingPending.values()].map((item) => ({ ...item, state: null as IncomingState | null }));
      const roots = [...ready, ...pending].sort(comparePackageRecency);
      return roots.map((item, index) => new OperatorNode({
        kind: 'package', section: 'incoming', id: `incoming:package:${item.packagePath}`, label: item.filename,
        description: item.state ? `${timestamp(item.mtimeMs)} · ${this.modeLabel('incoming')}` : 'Loading…',
        tooltip: item.packagePath, packagePath: item.packagePath, contextValue: item.state ? 'tiinex.incomingPackage' : 'tiinex.incomingPackageLoading',
        collapsible: index === 0 ? vscode.TreeItemCollapsibleState.Expanded : vscode.TreeItemCollapsibleState.Collapsed
      }));
    }
    const pending = this.incomingPending.get(path.resolve(node.data.packagePath || ''));
    if (pending) return [messageNode('incoming', 'Qualifying Handoff package…')];
    const state = this.incomingState(node.data.packagePath || '');
    if (!state) return [];
    const index = state.index;
    if (node.data.kind === 'package') return this.delta('incoming') ? this.deltaPackageProjection('incoming', index) : this.packageProjection('incoming', index);
    const pointerChildren = await this.pointerTargetChildren('incoming', node, index);
    if (pointerChildren) return pointerChildren;
    if (node.data.kind === 'workspaceArchive') {
      const workspace = index.workspaces.find((item) => item.workspaceId === node.data.workspaceId);
      const artifacts = artifactsForLineageMode(workspace?.artifacts || [], this.lineage('incoming'));
      return this.fileArtifactRoots('incoming', workspace?.workspaceId || '', await this.filterDeltaArtifacts('incoming', index, workspace?.workspaceId || '', artifacts), index.packagePath);
    }
    if (node.data.kind === 'directory' && node.data.pathPrefix?.startsWith('outer:')) return this.outerCarrierFileChildren('incoming', index, node.data.pathPrefix.slice('outer:'.length));
    const logical = await this.logicalWorkspaceProjectionChildren('incoming', node);
    if (logical) return logical;
    return this.artifactProjectionChildren('incoming', node, await this.artifactsForNode('incoming', node));
  }

  private async resolveIncomingTargetChoices(state: IncomingState, workspaceIds: string[]): Promise<PackageWorkspaceChoice[] | null> {
    let local: PackageWorkspaceChoice[] = [];
    try {
      local = await vscode.window.withProgress(
        { location: vscode.ProgressLocation.Notification, title: 'Tiinex qualifying local repositories', cancellable: false },
        () => loadLocalWorkspaceChoices(this.extensionPath)
      );
    } catch (error) {
      await vscode.window.showErrorMessage(`Tiinex repository mapping blocked: ${shortMessage(error)}`);
      return null;
    }
    const byId = new Map(local.map((item) => [item.workspaceId, item]));
    const resolved: PackageWorkspaceChoice[] = [];
    const defaultParent = preferredRepositoryParent((vscode.workspace.workspaceFolders || []).map((item: vscode.WorkspaceFolder) => item.uri.fsPath));
    for (const workspaceId of workspaceIds) {
      const existing = byId.get(workspaceId);
      if (existing) { resolved.push(existing); continue; }
      const carried = state.index.workspaces.find((item) => item.workspaceId === workspaceId);
      if (!carried) throw new Error(`tiinex.incoming-apply.workspace-missing:${workspaceId}`);
      for (;;) {
        const selected = await vscode.window.showOpenDialog({
          canSelectFiles: false,
          canSelectFolders: true,
          canSelectMany: false,
          title: `Locate local repository for ${carried.label || workspaceId}`,
          defaultUri: defaultParent ? vscode.Uri.file(defaultParent) : undefined,
          openLabel: 'Use Repository'
        });
        if (!selected?.length) return null;
        const qualified = await vscode.window.withProgress(
          { location: vscode.ProgressLocation.Notification, title: `Tiinex qualifying ${carried.label || workspaceId}`, cancellable: false },
          () => qualifyLocalWorkspaceChoice(this.extensionPath, selected[0].fsPath, workspaceId)
        );
        if (qualified) { resolved.push(qualified); break; }
        const choice = await vscode.window.showWarningMessage(
          `${selected[0].fsPath}

does not qualify as the selected Tiinex Workspace ${workspaceId}. No source was changed.`,
          { modal: true },
          'Choose Another',
          'Cancel'
        );
        if (choice !== 'Choose Another') return null;
      }
    }
    return resolved;
  }

  private async prepareIncomingRepositorySession(state: IncomingState, workspaceIds: string[], forcedStrategy?: IncomingApplyStrategy): Promise<'ready' | 'deferred' | 'cancelled'> {
    const targets = await this.resolveIncomingTargetChoices(state, workspaceIds);
    if (!targets) return 'cancelled';
    const targetValidation = validateWorkspaceTargetMapping(targets.map((item) => ({ workspaceId: item.workspaceId, root: item.root })));
    if (targetValidation.status === 'blocked') {
      const duplicateText = targetValidation.duplicateRoots.map((item) => `${item.workspaceIds.join(', ')} → ${item.root}`).join('\n');
      const overlapText = targetValidation.overlappingRoots.map((item) => `${item.parentRoot} ↔ ${item.childRoot}`).join('\n');
      await vscode.window.showErrorMessage(
        `Tiinex Incoming blocked before mutation: selected Workspace targets do not form independent repository roots.${duplicateText ? `\n\nMultiple full Workspace snapshots target one repository:\n${duplicateText}` : ''}${overlapText ? `\n\nNested repository roots overlap:\n${overlapText}` : ''}\n\nNo source was changed. Split this into independent operations unless shared Tiinex Tooling explicitly qualifies a combined mutation shape.`,
        { modal: true }
      );
      return 'cancelled';
    }
    const openRoots = (vscode.workspace.workspaceFolders || []).map((item: vscode.WorkspaceFolder) => item.uri.fsPath);
    const session = planWorkspaceSession(openRoots, targets.map((item) => item.root));
    if (session.transition === 'none') return 'ready';
    if (session.transition === 'single-root-unavailable') {
      const root = session.targetRoots[0] || targets[0]?.root || '';
      await vscode.window.showWarningMessage(
        `The selected repository is not open in this VS Code window:

${root}

Tiinex will not mutate a hidden repository and will not create a multi-root workspace for a one-repository operation. Open that repository as a normal folder, then retry the Incoming review.`,
        { modal: true },
        'OK'
      );
      return 'cancelled';
    }
    const mapping = targets.map((item) => `• ${item.workspaceId} → ${item.root}`).join('\n');
    const accepted = await vscode.window.showWarningMessage(
      `This Incoming operation targets ${session.distinctTargetRootCount} repositories.

${mapping}

Tiinex will open a dedicated temporary multi-root workspace in a new VS Code window containing only these repositories. The current window/workspace is not modified, and no repository source changes occur before the resumed Review Plan reaches its final Execute step.`,
      { modal: true },
      'Open Multi-Repo Workspace',
      'Cancel'
    );
    if (accepted !== 'Open Multi-Repo Workspace') return 'cancelled';
    const prepared = await prepareIncomingMultiRootSession(this.context.globalStorageUri.fsPath, {
      packagePath: state.index.packagePath,
      workspaceIds,
      forcedStrategy,
      targetRoots: [...session.targetRoots]
    });
    await vscode.commands.executeCommand('vscode.openFolder', vscode.Uri.file(prepared.workspaceFile), true);
    await vscode.window.showInformationMessage('Tiinex opened a dedicated multi-repo workspace. Continue the Incoming Review Plan in the new window.');
    return 'deferred';
  }

  private async runIncomingApply(state: IncomingState, workspaceIds: string[], forcedStrategy?: IncomingApplyStrategy): Promise<void> {
    try {
      const result = await applyIncomingWorkspaces(this.extensionPath, state.index, workspaceIds, forcedStrategy);
      if (!result) return;
      for (const workspaceId of result.affectedWorkspaceIds) state.appliedWorkspaceIds.add(workspaceId);
      this.deltaCache.clear();
      this.incomingProvider.refresh();
      this.outgoingProvider.refresh();
      await this.updateUiContexts();
    } catch (error) {
      await vscode.window.showErrorMessage(`Tiinex ${forcedStrategy === 'merge' ? 'Merge' : forcedStrategy === 'replace' ? 'Replace' : 'Incoming'} review blocked: ${shortMessage(error)}`, 'Show Details').then(async (choice: string | undefined) => {
        if (choice === 'Show Details') await vscode.window.showErrorMessage(String(error instanceof Error ? error.stack || error.message : error), { modal: true });
      });
    }
  }

  private async resumeIncomingMultiRootSession(): Promise<void> {
    const openRoots = (vscode.workspace.workspaceFolders || []).map((item: vscode.WorkspaceFolder) => item.uri.fsPath);
    const pending = await consumeIncomingMultiRootResume(this.context.globalStorageUri.fsPath, vscode.workspace.workspaceFile, openRoots);
    if (!pending) return;
    try {
      if (!this.incomingState(pending.packagePath)) await this.setIncoming(pending.packagePath);
      const state = this.incomingState(pending.packagePath);
      if (!state) throw new Error('tiinex.incoming-resume.package-unavailable');
      const action = await vscode.window.showInformationMessage(
        `Tiinex multi-repo workspace is ready for ${pending.workspaceIds.length} selected Workspace${pending.workspaceIds.length === 1 ? '' : 's'}. No repository source has changed.`,
        'Review Plan',
        'Later'
      );
      if (action === 'Review Plan') await this.runIncomingApply(state, pending.workspaceIds, pending.forcedStrategy);
    } catch (error) {
      await vscode.window.showErrorMessage(`Tiinex Incoming resume blocked: ${shortMessage(error)}`);
    }
  }

  private async mergeReplaceIncoming(node?: OperatorNode, forcedStrategy?: IncomingApplyStrategy): Promise<void> {
    const state = this.incomingState(node?.data.packagePath || '');
    if (!state) return;
    let workspaceIds: string[];
    if (node?.data.workspaceId) workspaceIds = [node.data.workspaceId];
    else {
      const defaults = new Set(operatorMatchedWorkspaceIds(qualifiedRoutes(state.orientation), this.operatorRole()));
      const choices = state.index.workspaces
        .filter((workspace) => !state.appliedWorkspaceIds.has(workspace.workspaceId))
        .map((workspace) => ({
          label: workspace.label || workspace.workspaceId,
          description: workspace.workspaceId,
          detail: `${workspace.repository || '(repository not declared)'}${workspace.ref ? ` @ ${workspace.ref}` : ' · Ref unasserted'}`,
          workspaceId: workspace.workspaceId,
          picked: defaults.has(workspace.workspaceId)
        }));
      if (!choices.length) {
        await vscode.window.showInformationMessage('Every Workspace in this Incoming package is already applied in this session.');
        return;
      }
      const selected = await vscode.window.showQuickPick(choices, {
        title: forcedStrategy === 'merge' ? 'Review Merge Plan' : forcedStrategy === 'replace' ? 'Review Replace Plan' : 'Review Incoming Merge / Replace Plan',
        placeHolder: defaults.size ? 'Operator-matching Handoff workspaces are preselected' : 'Select one or more Workspaces, or Esc to cancel',
        canPickMany: true,
        ignoreFocusOut: true
      });
      if (selected === undefined) return;
      workspaceIds = selected.map((item: typeof choices[number]) => item.workspaceId);
      if (!workspaceIds.length) return;
    }
    const session = await this.prepareIncomingRepositorySession(state, workspaceIds, forcedStrategy);
    if (session !== 'ready') return;
    await this.runIncomingApply(state, workspaceIds, forcedStrategy);
  }

  private async autoShowIncomingRoleHandoff(state: IncomingState): Promise<void> {
    const policy = this.config().get<'no' | 'ask' | 'yes'>('incoming.autoShowRoleHandoff', 'ask');
    if (policy === 'no') return;
    const role = this.operatorRole().toLocaleLowerCase();
    if (!role) return;
    const matches = qualifiedRoutes(state.orientation).filter((route) => String(route.to || '').trim().toLocaleLowerCase() === role);
    if (!matches.length) return;
    if (policy === 'ask') {
      const noun = matches.length === 1 ? 'Handoff' : `${matches.length} Handoffs`;
      const accepted = await vscode.window.showInformationMessage(`Open ${noun} matching ${this.operatorRole()}?`, 'Open Handoff');
      if (accepted !== 'Open Handoff') return;
    }
    await vscode.commands.executeCommand('tiinex.incoming.focus');
    for (const route of matches) {
      await this.openRouteHandoff(state, route);
      await this.revealIncomingRoute(state, route);
    }
  }

  private async openRouteHandoff(state: IncomingState, route: QualifiedRouteReceipt): Promise<boolean> {
    const workspace = state.index.workspaces.find((item) => item.workspaceId === route.workspaceId);
    const artifact = workspace?.artifacts.find((item) => normalizePath(item.path) === normalizePath(route.workspaceRelativeHandoffPath));
    if (!artifact) return false;
    await this.openVirtualMarkdown(`incoming/${route.workspaceId}/${artifact.path}`, artifact.markdown);
    return true;
  }

  private async revealIncomingRoute(state: IncomingState, route: QualifiedRouteReceipt): Promise<void> {
    const roots = await this.children('incoming');
    const root = roots.find((item) => path.resolve(item.data.packagePath || '') === path.resolve(state.index.packagePath));
    if (!root) return;
    await this.revealIncomingNode(root, { expand: true, select: false, focus: false });

    if (this.projection('incoming') === 'logical') {
      const rootChildren = await this.children('incoming', root);
      const workspace = rootChildren.find((item) => item.data.kind === 'workspace' && item.data.workspaceId === route.workspaceId);
      if (!workspace) return;
      await this.revealIncomingNode(workspace, { expand: true, select: false, focus: false });
      const workspaceChildren = await this.children('incoming', workspace);
      const handoff = workspaceChildren.find((item) =>
        item.data.groupName === `resolved-handoff:${normalizePath(route.pointerPath)}` ||
        normalizePath(item.data.artifact?.path || '') === normalizePath(route.workspaceRelativeHandoffPath)
      );
      if (!handoff) return;
      await this.revealIncomingNode(handoff, { expand: true, select: true, focus: false });
      return;
    }

    let parent = root;
    const segments = normalizePath(route.pointerPath).split('/').filter(Boolean);
    for (const segment of segments.slice(0, -1)) {
      const children = await this.children('incoming', parent);
      const directory = children.find((item) => item.data.kind === 'directory' && String(item.label) === segment);
      if (!directory) return;
      await this.revealIncomingNode(directory, { expand: true, select: false, focus: false });
      parent = directory;
    }
    const pointerChildren = await this.children('incoming', parent);
    const pointer = pointerChildren.find((item) => normalizePath(item.data.artifact?.path || '') === normalizePath(route.pointerPath));
    if (!pointer) return;
    await this.revealIncomingNode(pointer, { expand: true, select: false, focus: false });
    const targets = await this.children('incoming', pointer);
    const target = targets.find((item) => normalizePath(item.data.artifact?.path || item.data.tooltip || '') === normalizePath(route.workspaceRelativeHandoffPath)) || targets[0];
    if (target) await this.revealIncomingNode(target, { expand: true, select: true, focus: false });
  }

  private async revealIncomingNode(node: OperatorNode, options: { expand?: boolean | number; select?: boolean; focus?: boolean }): Promise<void> {
    const reveal = (this.incomingView as any).reveal;
    if (typeof reveal !== 'function') return;
    await reveal.call(this.incomingView, node, options);
  }

  private async confirmReplaceOutgoing(): Promise<boolean> {
    if (!this.outgoing) return true;
    const accepted = await vscode.window.showWarningMessage(
      'Replace the current Outgoing context? Preview-only Handoff drafts in this context will be discarded.',
      { modal: true },
      'Replace',
      'Cancel'
    );
    return accepted === 'Replace';
  }
  private async pickOutgoingParent(): Promise<string | null> {
    if (!this.incoming.length) return '';
    const items: Array<vscode.QuickPickItem & { packagePath: string }> = [
      {
        label: '$(add) Blank',
        description: 'Start a new carrier at major 001',
        packagePath: ''
      },
      ...this.incoming.map((state) => {
        const dimension = String(state.orientation?.carrierLineage?.dimension || '').trim();
        return {
          label: `$(archive) ${state.index.filename}`,
          description: dimension ? `Continue carrier ${dimension}` : 'Continue this Incoming carrier',
          detail: timestamp(state.index.mtimeMs),
          packagePath: state.index.packagePath
        };
      })
    ];
    const selected = await vscode.window.showQuickPick(items, {
      title: 'New Outgoing',
      placeHolder: 'Blank, or continue one of the open Incoming packages',
      canPickMany: false,
      ignoreFocusOut: true
    });
    return selected ? selected.packagePath : null;
  }

  private outgoingNameFromIncoming(packagePath: string): string {
    const state = this.incomingState(packagePath);
    if (!state) return '';
    const dimension = String(state.orientation?.carrierLineage?.dimension || '').trim();
    return inheritedOutgoingLabel(state.index.filename, dimension);
  }

  private async newOutgoing(): Promise<void> {
    if (!await this.confirmReplaceOutgoing()) return;
    const previous = this.outgoing;
    const packageParentPath = await this.pickOutgoingParent();
    if (packageParentPath === null) return;

    let name = '';
    if (packageParentPath) {
      name = this.outgoingNameFromIncoming(packageParentPath);
      if (!name) {
        await vscode.window.showErrorMessage('Tiinex New Outgoing blocked: the selected Incoming carrier has no usable lineage identity.');
        return;
      }
    } else {
      const localRoots = (vscode.workspace.workspaceFolders || []).map((item: vscode.WorkspaceFolder) => item.uri.fsPath);
      const defaultParent = preferredRepositoryParent(localRoots);
      const focus = outgoingSeriesPrefix(path.basename(defaultParent || localRoots[0] || 'tiinex') || 'tiinex');
      const entered = await vscode.window.showInputBox({
        title: 'New Outgoing · Blank',
        prompt: 'Outgoing prefix. Shared Tooling owns the qualified package filename; Tiinex adds the 000-series suffix after you choose the prefix.',
        value: focus,
        ignoreFocusOut: true
      });
      if (!entered?.trim()) return;
      name = await nextOutgoingSeriesLabel(entered, this.outgoingFolder());
    }

    this.outgoing = { name, packageParentPath, workspaces: [], drafts: [], packageMajorReason: '' };
    this.outgoingLoading = true;
    this.outgoingProvider.refresh();
    await this.updateUiContexts();

    const accepted = await this.selectOutgoingWorkspaces(packageParentPath
      ? { kind: 'incoming', packagePath: packageParentPath }
      : { kind: 'local' });
    if (!accepted) {
      this.outgoing = previous;
      this.outgoingProvider.refresh();
      await this.updateUiContexts();
    }
  }

  private incomingCarrierDimension(packagePath = this.outgoing?.packageParentPath || ''): string {
    return String(this.incomingState(packagePath)?.orientation?.carrierLineage?.dimension || '').trim();
  }

  private async bumpOutgoingMajor(): Promise<void> {
    if (!this.outgoing?.packageParentPath || this.outgoing.packageMajorReason) return;
    this.outgoing.packageMajorReason = 'VS Code operator selected stable multi-Workspace checkpoint';
    if (this.outgoing) this.outgoing.lastBuilt = undefined;
    this.outgoingProvider.refresh();
    await this.updateUiContexts();
  }

  private async clearOutgoingMajor(): Promise<void> {
    if (!this.outgoing?.packageMajorReason) return;
    this.outgoing.packageMajorReason = '';
    if (this.outgoing) this.outgoing.lastBuilt = undefined;
    this.outgoingProvider.refresh();
    await this.updateUiContexts();
  }

  private setOutgoingLoading(value: boolean): void {
    if (this.outgoingLoading === value) return;
    this.outgoingLoading = value;
    this.outgoingProvider.refresh();
  }

  private closeOutgoing(): void {
    this.outgoingLoading = false;
    this.outgoing = null;
    this.outgoingProvider.refresh();
    void this.updateUiContexts();
  }

  private async refreshOutgoing(): Promise<void> {
    this.outgoingProvider.refresh();
    await this.updateUiContexts();
  }

  private bootstrapPayloadIncluded(): boolean {
    // Workspace-scoped state intentionally survives New/Close so the operator's
    // packaging preference is remembered across Outgoing runs for this project.
    return this.context.workspaceState.get<boolean>('tiinex.outgoing.bootstrapPayloadIncluded', true);
  }

  private async setOutgoingBootstrapPayload(included: boolean): Promise<void> {
    await this.context.workspaceState.update('tiinex.outgoing.bootstrapPayloadIncluded', included);
    this.outgoingProvider.refresh();
  }

  private async setOutgoingWorkspacePayload(workspaceId: string, included: boolean): Promise<void> {
    const workspace = this.outgoing?.workspaces.find((item) => item.workspaceId === workspaceId);
    if (!workspace) return;
    if (included) {
      if (workspace.source === 'incoming' && !workspace.archivePath) {
        await vscode.window.showInformationMessage(`Tiinex cannot embed ${workspace.label}: the selected Incoming source has no Workspace payload ZIP. Select a Local source or another Incoming package instead.`);
        return;
      }
      workspace.payloadIncluded = true;
      if (this.outgoing) this.outgoing.lastBuilt = undefined;
      workspace.checkoutRepository = undefined;
      workspace.checkoutRef = undefined;
      this.outgoingProvider.refresh();
      return;
    }

    if (workspace.source === 'local') {
      const eligibility = await vscode.window.withProgress(
        { location: vscode.ProgressLocation.Notification, title: `Tiinex checking ${workspace.label} checkout`, cancellable: false },
        () => payloadCheckoutEligibility(workspace.root)
      );
      if (!eligibility.eligible) {
        await vscode.window.showWarningMessage(`Keep ${workspace.label} payload ZIP · ${payloadCheckoutReason(eligibility.reason)}`);
        return;
      }
      workspace.payloadIncluded = false;
      if (this.outgoing) this.outgoing.lastBuilt = undefined;
      workspace.checkoutRepository = eligibility.repository;
      workspace.checkoutRef = eligibility.ref;
      workspace.repository = eligibility.repository;
      workspace.ref = eligibility.ref;
      this.outgoingProvider.refresh();
      return;
    }

    const repository = String(workspace.repository || '').trim();
    const ref = String(workspace.ref || '').trim().toLowerCase();
    if (!repository || !isExactCommitRef(ref)) {
      await vscode.window.showWarningMessage(`Keep ${workspace.label} payload ZIP · Incoming does not assert a checkout repository + exact commit.`);
      return;
    }
    workspace.payloadIncluded = false;
    if (this.outgoing) this.outgoing.lastBuilt = undefined;
    workspace.checkoutRepository = repository;
    workspace.checkoutRef = ref;
    this.outgoingProvider.refresh();
  }

  private async validateOutgoingPayloadPlanForPackaging(): Promise<boolean> {
    if (!this.outgoing) return false;
    const checkoutOnly = this.outgoing.workspaces.filter((item) => !item.payloadIncluded);
    for (const workspace of checkoutOnly.filter((item) => item.source === 'local')) {
      const eligibility = await payloadCheckoutEligibility(workspace.root);
      if (!eligibility.eligible) {
        await vscode.window.showErrorMessage(`Tiinex Package blocked: ${workspace.label} can no longer omit its payload · ${payloadCheckoutReason(eligibility.reason)}.`);
        return false;
      }
      workspace.checkoutRepository = eligibility.repository;
      workspace.checkoutRef = eligibility.ref;
      workspace.repository = eligibility.repository;
      workspace.ref = eligibility.ref;
    }

    // UI planning is intentionally ahead of the shared carrier contract here.
    // Do not synthesize a different ZIP in the extension: current shared Core
    // owns manufacture/unpack semantics and still requires embedded payloads.
    const bootstrapOmitted = !this.bootstrapPayloadIncluded();
    if (!checkoutOnly.length && !bootstrapOmitted) return true;
    const parts = [
      checkoutOnly.length ? `${checkoutOnly.length} checkout-only Workspace payload${checkoutOnly.length === 1 ? '' : 's'}` : '',
      bootstrapOmitted ? 'bootstrap payload omitted' : ''
    ].filter(Boolean).join(' + ');
    await vscode.window.showErrorMessage(
      `Tiinex Package blocked: ${parts} require shared Core manufacture/unpack support. Re-embed the payloads to package safely for now.`,
      'Show Details'
    ).then(async (choice: string | undefined) => {
      if (choice === 'Show Details') await vscode.window.showInformationMessage(
        'The Outgoing tree can safely plan checkout-backed payload omission, but the current shared Tooling contract still manufactures self-contained payload ZIPs. VS Code will not fake or post-edit a qualified carrier.',
        { modal: true }
      );
    });
    return false;
  }

  private async selectOutgoingWorkspaces(seed?: OutgoingWorkspaceSeed): Promise<boolean> {
    if (!this.outgoing) return false;
    let locals: PackageWorkspaceChoice[];
    this.setOutgoingLoading(true);
    try {
      locals = await vscode.window.withProgress(
        { location: vscode.ProgressLocation.Notification, title: 'Tiinex qualifying local Workspace choices', cancellable: false },
        () => loadLocalWorkspaceChoices(this.extensionPath)
      );
    } catch (error) {
      await vscode.window.showErrorMessage(`Tiinex Workspace selection blocked: ${shortMessage(error)}`);
      return false;
    } finally {
      this.setOutgoingLoading(false);
    }

    type SourceItem = vscode.QuickPickItem & { source?: OutgoingWorkspace; key?: string; priority?: number };
    const sources: OutgoingWorkspace[] = [];
    const pickerItems: SourceItem[] = [];
    let priority = 0;
    pickerItems.push({ label: '$(repo) LOCAL · VS CODE', kind: vscode.QuickPickItemKind.Separator });
    for (const local of locals) {
      const key = `local:${local.workspaceId}`;
      const source: OutgoingWorkspace = {
        workspaceId: local.workspaceId,
        label: local.workspaceId,
        root: local.root,
        repository: local.repository,
        ref: local.ref,
        source: 'local',
        sourceKey: key,
        sourceLabel: 'Local',
        payloadIncluded: true
      };
      sources.push(source);
      pickerItems.push({ label: `$(repo) ${local.workspaceId}`, source, key, priority: priority++ });
    }
    for (const [incomingIndex, incoming] of this.incoming.entries()) {
      const dimension = String(incoming.orientation?.carrierLineage?.dimension || '').trim();
      const sourceName = inheritedOutgoingLabel(incoming.index.filename, dimension) || incoming.index.filename.replace(/\.handoff-package\.zip$/i, '');
      pickerItems.push({ label: `$(archive) INCOMING ${incomingIndex + 1} · ${sourceName}`, kind: vscode.QuickPickItemKind.Separator });
      for (const workspace of incoming.index.workspaces) {
        const key = `incoming:${path.resolve(incoming.index.packagePath)}:${workspace.workspaceId}`;
        const source: OutgoingWorkspace = {
          workspaceId: workspace.workspaceId,
          label: workspace.label || workspace.workspaceId,
          root: '',
          repository: workspace.repository,
          ref: workspace.ref,
          source: 'incoming',
          sourceKey: key,
          sourceLabel: incoming.index.filename,
          packagePath: incoming.index.packagePath,
          archivePath: workspace.archivePath,
          payloadIncluded: Boolean(workspace.archivePath),
          checkoutRepository: workspace.archivePath ? undefined : workspace.repository,
          checkoutRef: workspace.archivePath ? undefined : workspace.ref
        };
        sources.push(source);
        pickerItems.push({ label: `$(file-zip) ${workspace.label || workspace.workspaceId}`, source, key, priority: priority++ });
      }
    }
    if (!sources.length) {
      await vscode.window.showInformationMessage('No qualified Local or Incoming Workspaces are available.');
      return false;
    }

    const currentKeys = new Set(this.outgoing.workspaces.map((item) => item.sourceKey));
    let pickedKeys = currentKeys;
    if (!pickedKeys.size && seed?.kind === 'local') {
      pickedKeys = new Set(sources.filter((item) => item.source === 'local').map((item) => item.sourceKey));
    } else if (!pickedKeys.size && seed?.kind === 'incoming') {
      const parent = path.resolve(seed.packagePath);
      pickedKeys = new Set(sources
        .filter((item) => item.source === 'incoming' && item.packagePath && path.resolve(item.packagePath) === parent)
        .map((item) => item.sourceKey));
    }
    let duplicateCorrection = false;
    for (;;) {
      const items = pickerItems.map((item) => item.kind === vscode.QuickPickItemKind.Separator ? item : ({ ...item, picked: Boolean(item.key && pickedKeys.has(item.key)) }));
      const selected = await vscode.window.showQuickPick(items, {
        title: 'Select Outgoing Workspaces',
        placeHolder: duplicateCorrection ? 'Duplicate sources removed; the higher group wins. Press OK again.' : 'LOCAL first, then INCOMING newest → oldest. Higher group wins duplicates.',
        canPickMany: true,
        ignoreFocusOut: true
      });
      if (selected === undefined) return false;
      const selectedKeys = selected.map((item: SourceItem) => item.key || '').filter(Boolean);
      const resolution = resolvePrioritizedWorkspaceDuplicates(selectedKeys, sources.map((source, index) => ({ key: source.sourceKey, workspaceId: source.workspaceId, priority: index })));
      if (resolution.duplicateWorkspaceIds.length) {
        pickedKeys = new Set(resolution.selectedKeys);
        duplicateCorrection = true;
        continue;
      }
      pickedKeys = new Set(resolution.selectedKeys);
      break;
    }

    const selectedSources = sources.filter((source) => pickedKeys.has(source.sourceKey));

    const previousByWorkspace = new Map(this.outgoing.workspaces.map((item) => [item.workspaceId, item]));
    const changedDraftWorkspaceIds = new Set<string>();
    for (const draft of this.outgoing.drafts) {
      const next = selectedSources.find((item) => item.workspaceId === draft.draft.workspaceId);
      const previous = previousByWorkspace.get(draft.draft.workspaceId);
      if (!next || next.source !== 'local' || !previous || previous.sourceKey !== next.sourceKey) changedDraftWorkspaceIds.add(draft.draft.workspaceId);
    }
    if (changedDraftWorkspaceIds.size) {
      const accepted = await vscode.window.showWarningMessage(
        `Changing Workspace source will remove ${this.outgoing.drafts.filter((item) => changedDraftWorkspaceIds.has(item.draft.workspaceId)).length} Outgoing Handoff draft(s) tied to: ${[...changedDraftWorkspaceIds].join(', ')}.`,
        { modal: true },
        'Continue',
        'Cancel'
      );
      if (accepted !== 'Continue') return false;
    }

    const previousBySourceKey = new Map(this.outgoing.workspaces.map((item) => [item.sourceKey, item]));
    this.outgoing.workspaces = selectedSources.map((source) => {
      const previous = previousBySourceKey.get(source.sourceKey);
      return previous ? {
        ...source,
        payloadIncluded: previous.payloadIncluded,
        checkoutRepository: previous.checkoutRepository,
        checkoutRef: previous.checkoutRef
      } : source;
    });
    this.outgoing.drafts = this.outgoing.drafts.filter((item) => !changedDraftWorkspaceIds.has(item.draft.workspaceId));
    if (this.outgoing) this.outgoing.lastBuilt = undefined;
    this.outgoingProvider.refresh();
    await this.updateUiContexts();
    return true;
  }

  private async outgoingChildren(node?: OperatorNode): Promise<OperatorNode[]> {
    if (!this.outgoing) return [messageNode('outgoing', 'No Outgoing context · use New')];
    if (!node) {
      const dimension = this.incomingCarrierDimension();
      const lineage = this.outgoing.packageParentPath
        ? (this.outgoing.packageMajorReason ? `Major ${nextMajorDimension(dimension) || 'checkpoint'}` : `Child of ${dimension || 'Incoming'}`)
        : 'New root 001';
      const count = this.outgoing.workspaces.length;
      const projectedFilename = this.outgoingProjectedFilename();
      const tooltipLines = [projectedFilename, lineage];
      const root = new OperatorNode({
        kind: 'outgoing', section: 'outgoing', id: `outgoing:${this.outgoing.name}`, label: projectedFilename,
        description: this.outgoingLoading ? 'Loading…' : `${count} Workspace${count === 1 ? '' : 's'} · ${this.modeLabel('outgoing')}`,
        tooltip: tooltipLines.join('\n'),
        contextValue: 'tiinex.outgoingRoot', collapsible: vscode.TreeItemCollapsibleState.Expanded
      });
      if (this.outgoingLoading) root.iconPath = new vscode.ThemeIcon('loading~spin');
      return [root];
    }
    if (node.data.kind === 'outgoing') {
      // Logical is the human-friendly Workspace projection. Files mirrors the
      // recipient-facing carrier surface instead of showing another Workspace list.
      if (this.projection('outgoing') === 'files') return this.outgoingCarrierFileChildren();
      return this.outgoing.workspaces.map((workspace) => this.workspaceNode('outgoing', workspace.workspaceId, workspace.label, true, workspace.sourceLabel));
    }
    if (node.data.kind === 'workspaceArchive') {
      const workspace = this.outgoing.workspaces.find((item) => item.workspaceId === node.data.workspaceId);
      if (!workspace) return [];
      const artifacts = await this.outgoingWorkspaceArtifacts(workspace);
      return this.decorateOutgoingNodes(this.fileArtifactRoots('outgoing', workspace.workspaceId, artifacts, workspace.packagePath || ''));
    }
    if (node.data.kind === 'workspace') {
      const workspace = this.outgoing.workspaces.find((item) => item.workspaceId === node.data.workspaceId);
      if (!workspace) return [];
      if (!workspace.root && !(workspace.source === 'incoming' && workspace.packagePath)) return [messageNode('outgoing', 'Workspace source unavailable')];
      const logical = await this.logicalWorkspaceProjectionChildren('outgoing', node);
      if (logical) return this.decorateOutgoingNodes(logical);
      const artifacts = await this.outgoingWorkspaceArtifacts(workspace);
      return this.decorateOutgoingNodes(this.artifactProjectionChildren('outgoing', node, artifacts));
    }
    const logical = await this.logicalWorkspaceProjectionChildren('outgoing', node);
    if (logical) return this.decorateOutgoingNodes(logical);
    return this.decorateOutgoingNodes(this.artifactProjectionChildren('outgoing', node, await this.artifactsForNode('outgoing', node)));
  }

  private decorateOutgoingNodes(nodes: OperatorNode[]): OperatorNode[] {
    for (const node of nodes) {
      const artifact = node.data.artifact;
      if (!artifact || artifact.schemaId !== 'tiinex.handoff.v1' || !node.data.workspaceId) continue;
      const tracked = this.outgoingDraftForPath(node.data.workspaceId, artifact.path);
      const contextValue = tracked?.routeIncluded ? 'tiinex.outgoingHandoffAttached' : 'tiinex.outgoingHandoffUnattached';
      node.data.contextValue = contextValue;
      node.data.draftId = tracked?.id;
      node.contextValue = contextValue;
    }
    return nodes;
  }


  private async decorateOutgoingWorkspaceFileNodes(nodes: OperatorNode[], workspaceId: string): Promise<OperatorNode[]> {
    const workspace = this.outgoing?.workspaces.find((item) => item.workspaceId === workspaceId);
    if (!workspace) return nodes;
    const artifacts = await this.outgoingWorkspaceArtifacts(workspace);
    const byPath = new Map(artifacts.map((artifact) => [normalizePath(artifact.path), artifact]));
    for (const node of nodes) {
      if (node.data.kind !== 'file' || !node.data.filePath) continue;
      const artifact = byPath.get(normalizePath(node.data.filePath));
      if (artifact) node.data.artifact = artifact;
    }
    return this.decorateOutgoingNodes(nodes);
  }

  private outgoingProjectedFilename(): string {
    if (!this.outgoing) return '';
    const routeCandidates = this.outgoing.drafts.filter((item) => item.writtenPath && item.routeIncluded);
    const primary = routeCandidates.length === 1 ? routeCandidates[0] : null;

    // Never render fake `?` / ellipsis filename fragments. Before a single
    // qualified route is selected there is no truthful final carrier filename,
    // so show the user-visible carrier label. A major bump is independent of
    // route selection and therefore updates the displayed carrier identity
    // immediately. Shared Tooling remains final authority.
    if (!primary) {
      let stem = this.outgoing.name.replace(/\.handoff-package\.zip$/i, '').trim().toLocaleLowerCase();
      const parentDimension = this.incomingCarrierDimension();
      if (this.outgoing.packageParentPath && this.outgoing.packageMajorReason && parentDimension) {
        const major = nextMajorDimension(parentDimension);
        if (major && stem.endsWith(parentDimension)) stem = `${stem.slice(0, -parentDimension.length)}${major}`;
      }
      return `${stem}.handoff-package.zip`;
    }

    const parentDimension = this.incomingCarrierDimension();
    const dimension = this.outgoing.packageParentPath
      ? (this.outgoing.packageMajorReason ? nextMajorDimension(parentDimension) : this.expectedOutgoingCarrierDimension(primary))
      : '001';
    if (!dimension) return `${this.outgoing.name.replace(/\.handoff-package\.zip$/i, '').trim().toLocaleLowerCase()}.handoff-package.zip`;

    let stem = this.outgoing.name.replace(/\.handoff-package\.zip$/i, '').trim().toLocaleLowerCase();
    if (this.outgoing.packageParentPath && parentDimension && stem.endsWith(parentDimension)) {
      stem = `${stem.slice(0, -parentDimension.length)}${dimension}`;
    } else if (!stem.endsWith(dimension)) {
      stem = `${stem}-${dimension}`;
    }
    const from = filenameToken(primary.from);
    const to = filenameToken(primary.to);
    return `${stem}-${from}-to-${to}.handoff-package.zip`;
  }

  private async outgoingWorkspaceArtifacts(workspace: OutgoingWorkspace): Promise<IndexedArtifact[]> {
    if (workspace.stagedRoot) {
      const indexed = await indexLocalWorkspace(workspace.stagedRoot, workspace.workspaceId);
      return artifactsForLineageMode(indexed.artifacts, this.lineage('outgoing'));
    }
    if (workspace.source === 'incoming' && workspace.packagePath) {
      const state = this.incomingState(workspace.packagePath);
      const carried = state?.index.workspaces.find((item) => item.workspaceId === workspace.workspaceId);
      return artifactsForLineageMode(carried?.artifacts || [], this.lineage('outgoing'));
    }
    if (!workspace.root) return [];
    const indexed = await indexLocalWorkspace(workspace.root, workspace.workspaceId);
    return artifactsForLineageMode(indexed.artifacts, this.lineage('outgoing'));
  }

  private outgoingCarrierFileChildren(): OperatorNode[] {
    if (!this.outgoing) return [];
    const nodes: OperatorNode[] = [
      projectedCarrierFileNode('outgoing', '001-1-READ-BEFORE-PROCEEDING.trace.md', 'pointer')
    ];

    const bootstrapIncluded = this.bootstrapPayloadIncluded();
    nodes.push(new OperatorNode({
      kind: 'projectedFile', section: 'outgoing', id: 'outgoing:bootstrap-descriptor',
      label: '001-2-bootstrap.trace.md', description: bootstrapIncluded ? 'bootstrap · embedded' : 'bootstrap · omitted',
      tooltip: bootstrapIncluded ? '001-2-bootstrap.trace.md · payload embedded' : '001-2-bootstrap.trace.md · payload omission planned',
      contextValue: bootstrapIncluded ? 'tiinex.outgoingBootstrapDescriptorEmbedded' : 'tiinex.outgoingBootstrapDescriptorOmitted'
    }));
    if (bootstrapIncluded) nodes.push(projectedCarrierFileNode('outgoing', '001-2-bootstrap.zip', 'bootstrap'));

    const ordered = [...this.outgoing.workspaces].sort((a, b) => a.workspaceId.localeCompare(b.workspaceId, undefined, { sensitivity: 'base' }));
    for (const [index, workspace] of ordered.entries()) {
      const prefix = `001-${index + 3}`;
      const slug = filenameToken(workspace.workspaceId);
      const descriptorName = `${prefix}-${slug}.workspace.md`;
      const checkoutRef = workspace.checkoutRef || workspace.ref;
      const descriptorDescription = workspace.payloadIncluded
        ? 'workspace · embedded'
        : `workspace · checkout ${shortRef(checkoutRef)}`;
      nodes.push(new OperatorNode({
        kind: 'projectedFile', section: 'outgoing', id: `outgoing:workspace-descriptor:${workspace.workspaceId}`,
        label: descriptorName, description: descriptorDescription,
        tooltip: workspace.payloadIncluded ? `${descriptorName} · payload embedded` : `${descriptorName} · checkout ${workspace.checkoutRepository || workspace.repository}@${checkoutRef}`,
        workspaceId: workspace.workspaceId,
        contextValue: workspace.payloadIncluded ? 'tiinex.outgoingWorkspaceDescriptorEmbedded' : 'tiinex.outgoingWorkspaceDescriptorCheckout'
      }));
      if (workspace.payloadIncluded) {
        nodes.push(new OperatorNode({
          kind: 'workspaceArchive', section: 'outgoing', id: `outgoing:projected-archive:${workspace.workspaceId}`,
          label: `${prefix}-${slug}.workspace.zip`, description: workspace.label, tooltip: `${prefix}-${slug}.workspace.zip`,
          workspaceId: workspace.workspaceId, packagePath: workspace.packagePath, contextValue: 'tiinex.outgoingWorkspaceArchive',
          collapsible: vscode.TreeItemCollapsibleState.Collapsed
        }));
      }
    }

    nodes.push(projectedCarrierFileNode('outgoing', '001-tiinex-handoff-package.trace.md', 'artifact'));
    return nodes.sort((a, b) => String(a.label ?? '').localeCompare(String(b.label ?? ''), undefined, { numeric: true, sensitivity: 'base' }));
  }

  private handoffTemplates(): AuthoringTemplateOption[] {
    return [
      { id: 'work', label: 'Work / Continue', description: 'Bounded work continuation. Fill the exact transfer, context and boundaries.', defaults: { 'Signal Kind': 'return' } },
      { id: 'discussion', label: 'Discussion', description: 'Bounded discussion without implying acceptance, completion or broader authority.', defaults: { 'Signal Kind': 'disposition' } },
      { id: 'review', label: 'Review', description: 'Request a bounded review and disposition.', defaults: { 'Signal Kind': 'disposition' } },
      { id: 'blocked', label: 'Blocked', description: 'Transfer a blocker for explicit bounded disposition.', defaults: { 'Signal Kind': 'disposition' } },
      { id: 'complete', label: 'Complete / Return', description: 'Return completed bounded work for acknowledgement or disposition.', defaults: { 'Signal Kind': 'acknowledgement' } },
      { id: 'blank', label: 'Blank', description: 'No semantic defaults beyond Core schema constraints.' }
    ];
  }

  private handoffFieldAssists(endpoints: Array<{ label: string; kind: 'role' | 'party' | 'unknown'; reference: string; workspaceId: string; path: string }>): AuthoringFieldAssist[] {
    const suggestions = endpoints.map((item) => ({
      label: item.label,
      value: item.label,
      description: `${item.kind} · ${item.reference}`,
      fills: {
        '__KIND__': item.kind,
        '__REFERENCE__': item.reference ? `[${item.label.replace(/]/g, '\]')}](${item.reference})` : ''
      }
    }));
    return ['From', 'To'].map((field) => ({
      field,
      suggestions: suggestions.map((item) => ({
        ...item,
        fills: {
          [`${field} Kind`]: item.fills.__KIND__,
          [`${field} Reference`]: item.fills.__REFERENCE__
        }
      }))
    }));
  }

  private outgoingStagingBase(): string {
    const contextAny = this.context as any;
    const base = String(contextAny.storageUri?.fsPath || contextAny.globalStorageUri?.fsPath || path.join(os.tmpdir(), 'tiinex-vscode')).trim();
    return path.join(base, 'outgoing-authoring');
  }

  private async ensureOutgoingAuthoringRoot(workspace: OutgoingWorkspace): Promise<string> {
    if (workspace.source === 'local') {
      if (!workspace.root) throw new Error(`tiinex.authoring.workspace-source-unavailable:${workspace.workspaceId}`);
      return workspace.root;
    }
    if (workspace.stagedRoot) return workspace.stagedRoot;
    if (!workspace.packagePath || !workspace.archivePath) throw new Error(`tiinex.authoring.incoming-payload-required:${workspace.workspaceId}`);
    const key = createHash('sha256').update(workspace.sourceKey).digest('hex').slice(0, 16);
    const root = path.join(this.outgoingStagingBase(), `${filenameToken(workspace.workspaceId)}-${key}`);
    await rm(root, { recursive: true, force: true });
    await mkdir(root, { recursive: true });
    const archive = await readExactZipEntryFromFile(workspace.packagePath, workspace.archivePath);
    await extractZipBuffer(archive, root);
    workspace.stagedRoot = root;
    workspace.payloadIncluded = true;
    workspace.checkoutRepository = undefined;
    workspace.checkoutRef = undefined;
    return root;
  }

  private async disposeOutgoingWorkspaceStaging(workspaces: OutgoingWorkspace[]): Promise<void> {
    await Promise.all(workspaces.map(async (workspace) => {
      if (workspace.stagedRoot) await rm(workspace.stagedRoot, { recursive: true, force: true });
    }));
  }

  private async prepareAuthoringSubmission(workspace: OutgoingWorkspace, submission: ArtifactAuthoringSubmission, parentOverride?: ArtifactDraftParent | null): Promise<{ draft: PreparedArtifactDraft; participants: SimpleHandoffParticipant[]; from: string; to: string }> {
    const root = await this.ensureOutgoingAuthoringRoot(workspace);
    const parent = this.defaultIncomingParent(workspace.workspaceId);
    const parentArtifact: ArtifactDraftParent | null = parentOverride === undefined
      ? (parent ? { path: parent.path, markdown: parent.markdown } : null)
      : parentOverride;
    const endpoints = await this.endpointCatalog();
    const participantByReference = new Map(endpoints.filter((item) => item.kind === 'role' && item.reference).map((item) => [item.reference, item]));
    const participants: SimpleHandoffParticipant[] = submission.participantReferences
      .map((reference) => participantByReference.get(reference))
      .filter((item): item is NonNullable<typeof item> => Boolean(item))
      .map((item) => ({ label: item.label, reference: item.reference, workspaceId: item.workspaceId, path: item.path }));
    const draft = await prepareArtifactDraft(this.extensionPath, {
      root,
      workspaceId: workspace.workspaceId,
      schemaId: 'tiinex.handoff.v1',
      title: submission.title,
      values: submission.values,
      parentArtifact
    });
    return { draft, participants, from: String(submission.values.From || '').trim(), to: String(submission.values.To || '').trim() };
  }

  private outgoingDraftForPath(workspaceId: string, artifactPath: string): OutgoingDraft | undefined {
    const wanted = normalizePath(artifactPath);
    return this.outgoing?.drafts.find((item) => item.draft.workspaceId === workspaceId && normalizePath(item.draft.path) === wanted);
  }

  private effectiveOutgoingWorkspaceRoot(workspace: OutgoingWorkspace): string {
    return workspace.stagedRoot || workspace.root;
  }

  private trackOutgoingHandoff(workspace: OutgoingWorkspace, draft: PreparedArtifactDraft, writtenPath: string, from: string, to: string, participants: SimpleHandoffParticipant[], origin: 'created' | 'existing', routeIncluded = true): OutgoingDraft {
    if (!this.outgoing) throw new Error('tiinex.authoring.outgoing-required');
    const current = this.outgoing.workspaces.find((item) => item.workspaceId === workspace.workspaceId && item.sourceKey === workspace.sourceKey);
    if (!current) throw new Error(`tiinex.authoring.outgoing-workspace-source-changed:${workspace.workspaceId}`);
    const existing = this.outgoingDraftForPath(workspace.workspaceId, draft.path);
    if (existing) {
      existing.draft = draft;
      existing.writtenPath = writtenPath;
      existing.routeIncluded = routeIncluded;
      existing.participants = participants;
      existing.from = from;
      existing.to = to;
      if (this.outgoing) this.outgoing.lastBuilt = undefined;
      return existing;
    }
    const tracked: OutgoingDraft = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      draft,
      writtenPath,
      routeIncluded,
      participants,
      from,
      to,
      origin
    };
    this.outgoing.drafts.push(tracked);
    if (this.outgoing) this.outgoing.lastBuilt = undefined;
    return tracked;
  }

  private preparedFromQualifiedHandoff(item: Awaited<ReturnType<typeof qualifyExistingHandoff>>): PreparedArtifactDraft {
    return {
      root: item.root,
      workspaceId: item.workspaceId,
      schemaId: 'tiinex.handoff.v1',
      path: item.path,
      title: item.title,
      markdown: item.markdown,
      values: {},
      parentPath: item.parentPath
    };
  }

  private async pickAdditionalCarrierRoles(from = '', to = '', selectedReferences: string[] = []): Promise<SimpleHandoffParticipant[] | null> {
    const endpoints = await this.endpointCatalog();
    const excluded = new Set([from, to].map((item) => item.trim().toLocaleLowerCase()).filter(Boolean));
    const selectedSet = new Set(selectedReferences);
    const items = endpoints
      .filter((item) => item.kind === 'role' && item.reference && !excluded.has(item.label.trim().toLocaleLowerCase()))
      .map((item) => ({
        label: item.label,
        description: item.reference,
        picked: selectedSet.has(item.reference),
        participant: { label: item.label, reference: item.reference, workspaceId: item.workspaceId, path: item.path } satisfies SimpleHandoffParticipant
      }));
    if (!items.length) return [];
    const picked = await vscode.window.showQuickPick(items, {
      title: 'Additional carrier Roles (optional)',
      placeHolder: 'From / To Roles are already represented by the Handoff. Select only extra participant Roles.',
      canPickMany: true,
      ignoreFocusOut: true
    });
    if (!picked) return null;
    return (picked as typeof items).map((item) => item.participant);
  }

  private async showHandoffAuthoring(workspace: OutgoingWorkspace, options: { attachAvailable: boolean; useIncomingParent: boolean }): Promise<void> {
    try {
      // Incoming payloads are materialized only into extension-owned staging.
      // The carrier supplied by the operator remains immutable.
      await this.ensureOutgoingAuthoringRoot(workspace);
      const [model, endpoints] = await Promise.all([
        loadArtifactAuthoringModel(this.extensionPath, 'tiinex.handoff.v1'),
        this.endpointCatalog()
      ]);
      const defaultTo = options.useIncomingParent ? this.defaultIncomingReturnRole(workspace.workspaceId) : '';
      const parent = options.useIncomingParent ? this.defaultIncomingParent(workspace.workspaceId) : null;
      const parentOverride: ArtifactDraftParent | null = parent ? { path: parent.path, markdown: parent.markdown } : null;
      openArtifactAuthoringPanel({
        model,
        workspaces: [{ workspaceId: workspace.workspaceId, label: workspace.label || workspace.workspaceId, description: workspace.source === 'local' ? 'LOCAL' : `INCOMING · ${workspace.sourceLabel}` }],
        selectedWorkspaceId: workspace.workspaceId,
        fieldAssists: this.handoffFieldAssists(endpoints),
        carrierRoles: endpoints.filter((item) => item.kind === 'role').map((item) => ({ label: item.label, reference: item.reference })),
        templates: this.handoffTemplates(),
        selectedTemplateId: 'work',
        attachAvailable: options.attachAvailable,
        attachDefault: options.attachAvailable,
        parentLabel: parent?.path || '',
        initialValues: { From: this.operatorRole(), To: defaultTo }
      }, {
        preview: async (submission) => {
          const prepared = await vscode.window.withProgress({ location: vscode.ProgressLocation.Notification, title: 'Tiinex preparing Handoff preview', cancellable: false }, () => this.prepareAuthoringSubmission(workspace, submission, parentOverride));
          await this.openVirtualMarkdown(`authoring/${workspace.workspaceId}/${prepared.draft.path}`, prepared.draft.markdown);
        },
        create: async (submission) => {
          const prepared = await vscode.window.withProgress({ location: vscode.ProgressLocation.Notification, title: 'Tiinex qualifying Handoff', cancellable: false }, () => this.prepareAuthoringSubmission(workspace, submission, parentOverride));
          await this.openVirtualMarkdown(`authoring/${workspace.workspaceId}/${prepared.draft.path}`, prepared.draft.markdown);
          const accepted = await vscode.window.showWarningMessage(`Create exact Core-qualified Handoff?\n\n${prepared.from || '(From)'} → ${prepared.to || '(To)'}\n${prepared.draft.path}\n\nThe previewed bytes are written only after this confirmation.`, { modal: true }, 'Create Handoff', 'Cancel');
          if (accepted !== 'Create Handoff') throw new Error('tiinex.authoring.cancelled');
          const writtenPath = await writePreparedArtifactDraft(this.extensionPath, prepared.draft);
          if (submission.attachToOutgoing) {
            if (!options.attachAvailable) throw new Error('tiinex.authoring.attach-outgoing-unavailable');
            this.trackOutgoingHandoff(workspace, prepared.draft, writtenPath, prepared.from, prepared.to, prepared.participants, 'created', true);
          }
          // A newly written Handoff makes the effective source differ from any
          // checkout-only snapshot, so transport must remain embedded.
          if (submission.attachToOutgoing && this.outgoing?.workspaces.some((item) => item.workspaceId === workspace.workspaceId && item.sourceKey === workspace.sourceKey)) {
            workspace.payloadIncluded = true;
            workspace.checkoutRepository = undefined;
            workspace.checkoutRef = undefined;
          }
          this.outgoingProvider.refresh();
          await this.updateUiContexts();
          if (submission.attachToOutgoing) await this.revealOutgoingPanel();
          await vscode.commands.executeCommand('markdown.showPreview', vscode.Uri.file(writtenPath));
        }
      });
    } catch (error) {
      await vscode.window.showErrorMessage(`Tiinex Handoff authoring blocked: ${shortMessage(error)}`, 'Show Details').then(async (choice: string | undefined) => {
        if (choice === 'Show Details') await vscode.window.showErrorMessage(String(error instanceof Error ? error.stack || error.message : error), { modal: true });
      });
    }
  }

  private async newOutgoingHandoff(workspaceId: string): Promise<void> {
    if (!this.outgoing) return;
    const workspace = this.outgoing.workspaces.find((item) => item.workspaceId === workspaceId);
    if (!workspace) return;
    await this.showHandoffAuthoring(workspace, { attachAvailable: true, useIncomingParent: true });
  }

  private resourceInsideRoot(root: string, resourcePath: string): boolean {
    const relative = path.relative(path.resolve(root), path.resolve(resourcePath));
    return relative === '' || (!path.isAbsolute(relative) && relative !== '..' && !relative.startsWith(`..${path.sep}`));
  }

  private async localWorkspaceForResource(resource: vscode.Uri): Promise<PackageWorkspaceChoice> {
    if (!resource || resource.scheme !== 'file') throw new Error('tiinex.authoring.file-resource-required');
    const choices = await loadLocalWorkspaceChoices(this.extensionPath);
    const matches = choices
      .filter((item) => this.resourceInsideRoot(item.root, resource.fsPath))
      .sort((a, b) => path.resolve(b.root).length - path.resolve(a.root).length);
    if (!matches.length) throw new Error('tiinex.authoring.resource-not-in-qualified-workspace');
    return matches[0];
  }

  private localOutgoingWorkspaceForChoice(choice: PackageWorkspaceChoice): OutgoingWorkspace | undefined {
    return this.outgoing?.workspaces.find((item) => item.workspaceId === choice.workspaceId && item.source === 'local' && sameRepositoryRoot(item.root, choice.root));
  }

  private workspaceFromLocalChoice(choice: PackageWorkspaceChoice): OutgoingWorkspace {
    return {
      workspaceId: choice.workspaceId,
      label: choice.workspaceId,
      root: choice.root,
      repository: choice.repository,
      ref: choice.ref,
      source: 'local',
      sourceKey: `local:${choice.workspaceId}:${path.resolve(choice.root)}`,
      sourceLabel: 'Local',
      payloadIncluded: true
    };
  }

  private async newHandoffFromExplorer(resource?: vscode.Uri): Promise<void> {
    if (!resource) return;
    try {
      const choice = await this.localWorkspaceForResource(resource);
      const outgoingWorkspace = this.localOutgoingWorkspaceForChoice(choice);
      const workspace = outgoingWorkspace || this.workspaceFromLocalChoice(choice);
      await this.showHandoffAuthoring(workspace, { attachAvailable: Boolean(outgoingWorkspace), useIncomingParent: Boolean(outgoingWorkspace) });
    } catch (error) {
      await vscode.window.showErrorMessage(`Tiinex New Handoff blocked: ${shortMessage(error)}`);
    }
  }

  private async revealOutgoingPanel(): Promise<void> {
    // Opening the container first makes Explorer-triggered Attach/Create feel continuous:
    // the operator lands directly on the Outgoing state they just changed.
    await vscode.commands.executeCommand('workbench.view.extension.tiinex');
    await vscode.commands.executeCommand('tiinex.outgoing.focus');
  }

  private async attachQualifiedHandoff(workspace: OutgoingWorkspace, artifactPath: string): Promise<void> {
    if (!this.outgoing) throw new Error('tiinex.authoring.outgoing-required');
    const root = await this.ensureOutgoingAuthoringRoot(workspace);
    const qualified = await qualifyExistingHandoff(this.extensionPath, root, workspace.workspaceId, artifactPath);
    const existing = this.outgoingDraftForPath(workspace.workspaceId, qualified.path);
    const participants = await this.pickAdditionalCarrierRoles(qualified.from, qualified.to, existing?.participants.map((item) => item.reference) || []);
    if (participants === null) return;
    this.trackOutgoingHandoff(workspace, this.preparedFromQualifiedHandoff(qualified), path.join(root, ...normalizePath(qualified.path).split('/')), qualified.from, qualified.to, participants, 'existing', true);
    this.outgoingProvider.refresh();
    await this.updateUiContexts();
    await this.revealOutgoingPanel();
  }

  private async attachOutgoingHandoffNode(node?: OperatorNode): Promise<void> {
    if (!this.outgoing || !node?.data.workspaceId || node.data.artifact?.schemaId !== 'tiinex.handoff.v1') return;
    const workspace = this.outgoing.workspaces.find((item) => item.workspaceId === node.data.workspaceId);
    if (!workspace) return;
    try { await this.attachQualifiedHandoff(workspace, node.data.artifact.path); }
    catch (error) { await vscode.window.showErrorMessage(`Tiinex Attach blocked: ${shortMessage(error)}`); }
  }

  private async detachOutgoingHandoffNode(node?: OperatorNode): Promise<void> {
    if (!this.outgoing || !node?.data.workspaceId || !node.data.artifact) return;
    const tracked = this.outgoingDraftForPath(node.data.workspaceId, node.data.artifact.path);
    if (!tracked?.routeIncluded) return;
    tracked.routeIncluded = false;
    if (this.outgoing) this.outgoing.lastBuilt = undefined;
    this.outgoingProvider.refresh();
    await this.updateUiContexts();
  }

  private async attachHandoffFromExplorer(resource?: vscode.Uri): Promise<void> {
    if (!resource || resource.scheme !== 'file') return;
    if (!this.outgoing) {
      const action = await vscode.window.showInformationMessage(
        'No Outgoing carrier is open. Create one and continue attaching this Handoff?',
        'Create Outgoing',
        'Cancel'
      );
      if (action !== 'Create Outgoing') return;
      await this.newOutgoing();
      if (!this.outgoing) return;
    }
    try {
      const choice = await this.localWorkspaceForResource(resource);
      let workspace = this.localOutgoingWorkspaceForChoice(choice);
      if (!workspace) {
        const accepted = await vscode.window.showInformationMessage(
          `${choice.workspaceId} is not using this Local source in Outgoing. Select it before attaching the Handoff?`,
          'Select Outgoing Workspaces',
          'Cancel'
        );
        if (accepted !== 'Select Outgoing Workspaces') return;
        await this.selectOutgoingWorkspaces({ kind: 'local' });
        workspace = this.localOutgoingWorkspaceForChoice(choice);
        if (!workspace) throw new Error('tiinex.authoring.outgoing-local-source-required: Local Workspace source was not selected');
      }
      const relative = normalizePath(path.relative(choice.root, resource.fsPath));
      if (!relative || relative.startsWith('../')) throw new Error('tiinex.authoring.artifact-path-outside-workspace');
      await this.attachQualifiedHandoff(workspace, relative);
    } catch (error) {
      await vscode.window.showErrorMessage(`Tiinex Attach Handoff blocked: ${shortMessage(error)}`);
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
      item.writtenPath = await writePreparedArtifactDraft(this.extensionPath, item.draft);
      this.outgoingProvider.refresh();
      await this.updateUiContexts();
      await vscode.commands.executeCommand('markdown.showPreview', vscode.Uri.file(item.writtenPath));
    } catch (error) {
      await vscode.window.showErrorMessage(`Tiinex Handoff write blocked: ${shortMessage(error)}`);
    }
  }

  private setDraftRoute(draftId: string, included: boolean): void {
    const item = this.outgoing?.drafts.find((draft) => draft.id === draftId);
    if (!item?.writtenPath) return;
    item.routeIncluded = included;
    if (this.outgoing) this.outgoing.lastBuilt = undefined;
    this.outgoingProvider.refresh();
    void this.updateUiContexts();
  }

  private async copyOutgoingTransportText(node?: OperatorNode): Promise<void> {
    if (!this.outgoing) return;
    const draft = node?.data.draftId
      ? this.outgoing.drafts.find((item) => item.id === node.data.draftId)
      : node?.data.artifact && node.data.workspaceId
        ? this.outgoingDraftForPath(node.data.workspaceId, node.data.artifact.path)
        : undefined;
    if (!draft?.routeIncluded) {
      await vscode.window.showInformationMessage('Attach this Handoff to Outgoing before copying transport text.');
      return;
    }
    const routeId = routeChoiceKeyForHandoff(draft.draft.workspaceId, draft.draft.path);
    const routing = this.outgoing.lastBuilt?.routes.find((item) => item.routeId === routeId);
    if (!routing?.text) {
      await vscode.window.showInformationMessage('Pack Outgoing first. Exact transport text is copied from shared Tiinex Tooling after package manufacture.');
      return;
    }
    await vscode.env.clipboard.writeText(routing.text);
    await vscode.window.showInformationMessage(`Copied Handoff transport text for ${draft.draft.title}.`);
  }

  private expectedOutgoingCarrierDimension(primary: OutgoingDraft): string {
    if (!this.outgoing) return '';
    if (!this.outgoing.packageParentPath) return '001';
    const parent = this.incomingState(this.outgoing.packageParentPath);
    const parentDimension = String(parent?.orientation?.carrierLineage?.dimension || '').trim();
    if (!parent || !parentDimension) return '';
    if (this.outgoing.packageMajorReason) return nextMajorDimension(parentDimension);
    const parentPath = normalizePath(primary.draft.parentPath || '');
    if (!parentPath) return '';
    const routes = qualifiedRoutes(parent.orientation);
    const ordinal = routes.findIndex((route) => route.workspaceId === primary.draft.workspaceId && normalizePath(route.workspaceRelativeHandoffPath) === parentPath);
    return ordinal >= 0 ? `${parentDimension}-${ordinal + 1}` : '';
  }

  private async refreshDiscoveryAfterPack(outputPath: string): Promise<void> {
    const discovery = this.discoveryFolder();
    if (!discovery || path.resolve(path.dirname(outputPath)) !== path.resolve(discovery)) return;
    this.carrierCache.delete(path.resolve(outputPath));
    await this.refreshDiscovery(false);
  }

  private async packageOutgoing(): Promise<void> {
    if (!this.outgoing) return;
    if (!await this.validateOutgoingPayloadPlanForPackaging()) return;
    const routes = this.outgoing.drafts.filter((item) => item.writtenPath && item.routeIncluded);
    const incomingWorkspaceSources: IncomingPackageWorkspaceSource[] = this.outgoing.workspaces
      .filter((item) => item.source === 'incoming' && item.packagePath && item.archivePath)
      .map((item) => ({ workspaceId: item.workspaceId, packagePath: item.packagePath!, archivePath: item.archivePath! }));
    const workspaceIds = this.outgoing.workspaces.map((item) => item.workspaceId);
    const workspaceSourceOverrides = this.outgoing.workspaces
      .filter((item) => Boolean(item.root) || Boolean(item.stagedRoot))
      .map((item): PackageWorkspaceSourceOverride => ({ workspaceId: item.workspaceId, root: item.stagedRoot || item.root }));

    if (!routes.length) {
      // Packing Workspace state is valid without Handoff routing semantics. This is
      // intentionally independent from whether the Outgoing context originated from
      // Incoming: shared Tooling manufactures a pointerless Workspace carrier and the
      // host does not invent a Handoff merely to preserve transport continuity.
      const outputDirectory = this.outgoingFolder() || await this.selectOutgoingFolder(this.discoveryFolder() || undefined, false);
      if (!outputDirectory) return;
      this.setOutgoingLoading(true);
      try {
        const built = await vscode.window.withProgress(
          { location: vscode.ProgressLocation.Notification, title: 'Tiinex packing Workspace carrier', cancellable: false },
          async (progress) => {
            progress.report({ message: 'Preparing outgoing sources...' });
            return buildHandoffPackageFromForm(this.extensionPath, {
              routeId: routeChoiceKey({ pointerless: true }),
              workspaceIds,
              incomingWorkspaceSources,
              workspaceSourceOverrides,
              outputDirectory
            });
          }
        );
        this.outgoing.lastBuilt = { outputPath: built.outputPath, routes: built.routeRoutingTexts };
        this.outgoingProvider.refresh();
        await this.refreshDiscoveryAfterPack(built.outputPath);
        this.closeOutgoing();
        await announceBuiltCarrier(built.outputPath, 'Workspace carrier');
      } catch (error) {
        await vscode.window.showErrorMessage(`Tiinex Outgoing package blocked: ${shortMessage(error)}`, 'Show Details').then(async (choice: string | undefined) => {
          if (choice === 'Show Details') await vscode.window.showErrorMessage(String(error instanceof Error ? error.stack || error.message : error), { modal: true });
        });
      } finally {
        this.setOutgoingLoading(false);
      }
      return;
    }

    const candidateItems = routes.map((item) => ({ label: item.draft.title, description: `${item.draft.workspaceId}: ${item.draft.path}`, item }));
    const selected = candidateItems.length === 1 ? candidateItems[0] : await vscode.window.showQuickPick(candidateItems, { title: 'Primary Outgoing route', ignoreFocusOut: true });
    if (!selected) return;
    const expectedCarrierDimension = this.expectedOutgoingCarrierDimension(selected.item);
    const expectedCarrierFilename = this.outgoingProjectedFilename();
    const outputDirectory = this.outgoingFolder() || await this.selectOutgoingFolder(this.discoveryFolder() || undefined, false);
    if (!outputDirectory) return;
    if (this.outgoing.packageParentPath && !this.outgoing.packageMajorReason && !expectedCarrierDimension) {
      await vscode.window.showErrorMessage('Tiinex Package blocked: the primary Handoff does not continue an exact qualified Handoff route in the selected Incoming carrier parent.');
      return;
    }
    this.setOutgoingLoading(true);
    try {
      const built = await vscode.window.withProgress(
        { location: vscode.ProgressLocation.Notification, title: 'Tiinex packing Handoff carrier', cancellable: false },
        async (progress) => {
          progress.report({ message: 'Preparing outgoing sources...' });
          return buildHandoffPackageFromForm(this.extensionPath, {
            routeId: routeChoiceKeyForHandoff(selected.item.draft.workspaceId, selected.item.draft.path),
            routeInputs: routes.map((item) => ({ routeId: routeChoiceKeyForHandoff(item.draft.workspaceId, item.draft.path), participantRoles: item.participants })),
            workspaceIds,
            packageParentPath: this.outgoing?.packageParentPath || '',
            packageMajorReason: this.outgoing?.packageMajorReason || '',
            incomingWorkspaceSources,
            workspaceSourceOverrides,
            outputDirectory,
            expectedCarrierDimension,
            expectedCarrierFilename
          });
        }
      );
      this.outgoing.lastBuilt = { outputPath: built.outputPath, routes: built.routeRoutingTexts };
      this.outgoingProvider.refresh();
      await this.refreshDiscoveryAfterPack(built.outputPath);
      this.closeOutgoing();
      await announceBuiltCarrier(
        built.outputPath,
        'Handoff carrier',
        built.autoCopiedTransportText ? 'Exact Handoff transport text was copied to the clipboard.' : 'Use the copy action beside an attached Handoff route to copy its exact transport text.'
      );
    } catch (error) {
      await vscode.window.showErrorMessage(`Tiinex Outgoing package blocked: ${shortMessage(error)}`, 'Show Details').then(async (choice: string | undefined) => {
        if (choice === 'Show Details') await vscode.window.showErrorMessage(String(error instanceof Error ? error.stack || error.message : error), { modal: true });
      });
    } finally {
      this.setOutgoingLoading(false);
    }
  }

  private operatorRole(): string { return String(this.config().get('operator.role', '') || '').trim(); }

  private async endpointCatalog(): Promise<Array<{ label: string; kind: 'role' | 'party' | 'unknown'; reference: string; workspaceId: string; path: string }>> {
    const artifacts: IndexedArtifact[] = [];
    for (const incoming of this.incoming) {
      artifacts.push(...incoming.index.carrierArtifacts);
      for (const workspace of incoming.index.workspaces) artifacts.push(...workspace.artifacts);
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
    const incoming = this.incomingState(this.outgoing?.packageParentPath || '');
    if (!this.outgoing?.packageParentPath || !incoming) return '';
    const routes = qualifiedRoutes(incoming.orientation);
    const local = routes.filter((route) => route.workspaceId === workspaceId);
    if (local.length === 1) return local[0].from;
    return routes.length === 1 ? routes[0].from : '';
  }

  private defaultIncomingParent(workspaceId: string): { path: string; markdown: string } | null {
    const incoming = this.incomingState(this.outgoing?.packageParentPath || '');
    if (!this.outgoing?.packageParentPath || !incoming) return null;
    const routes = qualifiedRoutes(incoming.orientation).filter((route) => route.workspaceId === workspaceId);
    if (routes.length !== 1) return null;
    const workspace = incoming.index.workspaces.find((item) => item.workspaceId === workspaceId);
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

  private async packageDeltaView(index: IndexedCarrierPackage): Promise<PackageDeltaView> {
    const localRoots = (vscode.workspace.workspaceFolders || []).map((item: vscode.WorkspaceFolder) => path.resolve(item.uri.fsPath)).sort();
    const key = `${path.resolve(index.packagePath)}\u0000${index.mtimeMs}\u0000${index.bytes}\u0000${localRoots.join('\u0001')}`;
    const cached = this.deltaCache.get(key);
    if (cached) return cached;
    const projected = (async (): Promise<PackageDeltaView> => {
      let local: PackageWorkspaceChoice[] = [];
      try { local = await loadLocalWorkspaceChoices(this.extensionPath); }
      catch {
        return { workspaces: new Map(index.workspaces.map((workspace) => [workspace.workspaceId, { state: 'unavailable' as const, added: 0, modified: 0, removed: 0, incomingPaths: new Set<string>() }])) };
      }
      const localById = new Map(local.map((item) => [item.workspaceId, item]));
      const runtime = await prepareBundledRuntime(this.extensionPath, nodeExecutable());
      try {
        const entries = await Promise.all(index.workspaces.map(async (workspace): Promise<[string, WorkspaceDeltaView]> => {
          const match = localById.get(workspace.workspaceId);
          if (!match) return [workspace.workspaceId, { state: 'local-missing', added: 0, modified: 0, removed: 0, incomingPaths: new Set<string>() }];
          try {
            const result = await compareIncomingWorkspaceToLocal(runtime, index.packagePath, match.root, workspace.workspaceId);
            const item = (result.workspaces || []).find((candidate) => candidate.workspaceId === workspace.workspaceId);
            if (!item) throw new Error('workspace delta missing');
            const delta: any = item.delta || {};
            const pathOf = (value: any): string => normalizePath(typeof value === 'string' ? value : value?.path || '');
            const incomingPaths = new Set<string>([
              ...(delta.added || []).map(pathOf),
              ...(delta.byteChanged || []).map(pathOf)
            ].filter(Boolean));
            const counts = delta.counts || {};
            return [workspace.workspaceId, {
              state: String(item.state || '') === 'exact' ? 'exact' : 'changed',
              added: Number(counts.added || 0),
              modified: Number(counts.byteChanged || 0),
              removed: Number(counts.removed || 0),
              incomingPaths
            }];
          } catch {
            return [workspace.workspaceId, { state: 'unavailable', added: 0, modified: 0, removed: 0, incomingPaths: new Set<string>() }];
          }
        }));
        return { workspaces: new Map(entries) };
      } finally { await runtime.dispose(); }
    })();
    this.deltaCache.set(key, projected);
    return projected;
  }

  private deltaDescription(delta: WorkspaceDeltaView): string {
    if (delta.state === 'local-missing') return 'not open locally';
    if (delta.state === 'unavailable') return 'delta unavailable';
    return `+${delta.added}  ~${delta.modified}  -${delta.removed}`;
  }

  private async deltaPackageProjection(section: 'discovery' | 'incoming', index: IndexedCarrierPackage): Promise<OperatorNode[]> {
    const view = await vscode.window.withProgress(
      { location: { viewId: `tiinex.${section}` }, title: 'Comparing with local…', cancellable: false },
      () => this.packageDeltaView(index)
    );
    const visible = index.workspaces.filter((workspace) => view.workspaces.get(workspace.workspaceId)?.state !== 'exact');
    if (!visible.length) return [messageNode(section, 'No Workspace delta against open local repositories')];
    if (this.projection(section) === 'logical') {
      return visible.map((workspace) => this.workspaceNode(
        section, workspace.workspaceId, workspace.label, true,
        this.deltaDescription(view.workspaces.get(workspace.workspaceId)!), index.packagePath
      ));
    }
    return visible.map((workspace) => {
      const delta = view.workspaces.get(workspace.workspaceId)!;
      const applied = section === 'incoming' && this.incomingState(index.packagePath)?.appliedWorkspaceIds.has(workspace.workspaceId);
      const node = new OperatorNode({
        kind: 'workspaceArchive', section, id: `${section}:delta-workspace-archive:${index.packagePath}:${workspace.workspaceId}`,
        label: workspace.archivePath ? path.posix.basename(workspace.archivePath) : workspace.label,
        description: applied ? `applied · ${this.deltaDescription(delta)}` : this.deltaDescription(delta),
        tooltip: `${workspace.label}\n${this.deltaDescription(delta)}`,
        packagePath: index.packagePath, workspaceId: workspace.workspaceId,
        contextValue: applied ? 'tiinex.incomingWorkspaceArchiveApplied' : `tiinex.${section}WorkspaceArchive`,
        collapsible: workspace.artifacts.length ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None
      });
      if (applied) node.iconPath = new vscode.ThemeIcon('pass-filled', new vscode.ThemeColor('testing.iconPassed'));
      return node;
    });
  }

  private async filterDeltaArtifacts(section: 'discovery' | 'incoming', index: IndexedCarrierPackage, workspaceId: string, artifacts: IndexedArtifact[]): Promise<IndexedArtifact[]> {
    if (!this.delta(section) || !workspaceId) return artifacts;
    const delta = (await this.packageDeltaView(index)).workspaces.get(workspaceId);
    if (!delta || delta.state === 'local-missing' || delta.state === 'unavailable') return artifacts;
    if (delta.state === 'exact') return [];
    return artifacts.filter((artifact) => delta.incomingPaths.has(normalizePath(artifact.path)));
  }

  private packageProjection(section: OperatorSection, index: IndexedCarrierPackage): OperatorNode[] {
    if (this.projection(section) === 'logical') {
      // Logical is deliberately package-simple: one row per carried Workspace.
      // Carrier control artifacts remain truthful in Files; expanding a Workspace
      // exposes Lineage / Handoffs / Files without inventing carrier-wide buckets.
      return index.workspaces.map((workspace) => this.workspaceNode(section, workspace.workspaceId, workspace.label, true, '', index.packagePath));
    }
    return this.outerCarrierFileChildren(section, index, '');
  }

  private outerCarrierFileChildren(section: OperatorSection, index: IndexedCarrierPackage, prefix: string): OperatorNode[] {
    const normalizedPrefix = normalizePath(prefix);
    const artifacts = artifactsForLineageMode(index.carrierArtifacts, this.lineage(section));
    const represented = new Set<string>();
    const entries: Array<{ path: string; artifact?: IndexedArtifact; workspaceId?: string; label?: string; raw?: IndexedWorkspaceFile }> = [
      ...artifacts.map((artifact) => ({ path: normalizePath(artifact.path), artifact })),
      ...index.workspaces.filter((workspace) => workspace.archivePath).map((workspace) => ({ path: normalizePath(workspace.archivePath), workspaceId: workspace.workspaceId, label: workspace.label }))
    ];
    for (const entry of entries) represented.add(entry.path);
    for (const file of index.carrierFiles) {
      const filePath = normalizePath(file.path);
      if (!filePath || file.directory || represented.has(filePath)) continue;
      entries.push({ path: filePath, raw: file });
    }
    const directories = new Set<string>();
    const direct: typeof entries = [];
    for (const entry of entries) {
      if (normalizedPrefix && !entry.path.startsWith(`${normalizedPrefix}/`)) continue;
      const remainder = normalizedPrefix ? entry.path.slice(normalizedPrefix.length + 1) : entry.path;
      const slash = remainder.indexOf('/');
      if (slash < 0) direct.push(entry);
      else directories.add(remainder.slice(0, slash));
    }
    const nodes = [...directories].sort((a, b) => a.localeCompare(b)).map((name) => {
      const next = normalizedPrefix ? `${normalizedPrefix}/${name}` : name;
      return new OperatorNode({
        kind: 'directory', section, id: `${section}:outer-dir:${index.packagePath}:${next}`, label: name,
        pathPrefix: `outer:${next}`, packagePath: index.packagePath, contextValue: `tiinex.${section}Directory`,
        collapsible: vscode.TreeItemCollapsibleState.Collapsed
      });
    });
    for (const entry of direct.sort((a, b) => a.path.localeCompare(b.path))) {
      if (entry.artifact) {
        const node = fileArtifactNode(section, entry.artifact, index.packagePath);
        node.data.packagePath = index.packagePath;
        nodes.push(node);
        continue;
      }
      if (entry.raw) {
        const raw = projectedCarrierFileNode(section, path.posix.basename(entry.path), /bootstrap\.zip$/i.test(entry.path) ? 'bootstrap' : formatBytes(entry.raw.bytes));
        raw.data.id = `${section}:outer-file:${index.packagePath}:${entry.path}`;
        raw.id = raw.data.id;
        raw.data.packagePath = index.packagePath;
        raw.data.tooltip = entry.path;
        raw.tooltip = entry.path;
        nodes.push(raw);
        continue;
      }
      const workspace = index.workspaces.find((item) => item.workspaceId === entry.workspaceId);
      const archiveNode = new OperatorNode({
        kind: 'workspaceArchive', section, id: `${section}:workspace-archive:${index.packagePath}:${entry.path}`,
        label: path.posix.basename(entry.path), description: workspace?.label || entry.workspaceId || '', tooltip: entry.path,
        packagePath: index.packagePath, workspaceId: entry.workspaceId, contextValue: `tiinex.${section}WorkspaceArchive`,
        collapsible: workspace?.artifacts.length ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None
      });
      if (section === 'incoming' && entry.workspaceId && this.incomingState(index.packagePath)?.appliedWorkspaceIds.has(entry.workspaceId)) {
        archiveNode.description = `applied · ${workspace?.label || entry.workspaceId}`;
        archiveNode.contextValue = 'tiinex.incomingWorkspaceArchiveApplied';
        archiveNode.data.contextValue = 'tiinex.incomingWorkspaceArchiveApplied';
        archiveNode.iconPath = new vscode.ThemeIcon('pass-filled', new vscode.ThemeColor('testing.iconPassed'));
      }
      nodes.push(archiveNode);
    }
    return nodes;
  }

  private workspaceNode(section: OperatorSection, workspaceId: string, label: string, hasSource: boolean, description = '', packagePath = ''): OperatorNode {
    let contextValue = `tiinex.${section}Workspace`;
    let applied = false;
    if (section === 'incoming') {
      applied = Boolean(this.incomingState(packagePath)?.appliedWorkspaceIds.has(workspaceId));
      contextValue = applied ? 'tiinex.incomingWorkspaceApplied' : 'tiinex.incomingWorkspace';
    } else if (section === 'outgoing' && !hasSource) contextValue = 'tiinex.outgoingWorkspaceMissing';
    else if (section === 'outgoing') contextValue = 'tiinex.outgoingWorkspace';
    const idScope = packagePath ? `${packagePath}:` : '';
    const node = new OperatorNode({
      kind: 'workspace', section, id: `${section}:workspace:${idScope}${workspaceId}`, label,
      description: applied ? `applied${description ? ` · ${description}` : ''}` : description,
      workspaceId, packagePath, contextValue, collapsible: vscode.TreeItemCollapsibleState.Collapsed
    });
    if (applied) node.iconPath = new vscode.ThemeIcon('pass-filled', new vscode.ThemeColor('testing.iconPassed'));
    return node;
  }

  private artifactNodesForWorkspace(section: OperatorSection, workspaceId: string, sourceArtifacts: IndexedArtifact[], packagePath = ''): OperatorNode[] {
    const artifacts = artifactsForLineageMode(sourceArtifacts, this.lineage(section));
    return this.fileArtifactRoots(section, workspaceId, artifacts, packagePath);
  }

  private async logicalWorkspaceRootChildren(section: OperatorSection, workspaceId: string, packagePath = ''): Promise<OperatorNode[]> {
    const nodes: OperatorNode[] = [];
    const hasPayload = this.workspacePayloadIncluded(section, workspaceId, packagePath);
    if (hasPayload) {
      nodes.push(logicalWorkspaceGroupNode(section, workspaceId, packagePath, 'files', 'Files'));
      const lineage = await this.rawWorkspaceArtifacts(section, workspaceId, packagePath);
      if (lineage.length) nodes.push(logicalWorkspaceGroupNode(section, workspaceId, packagePath, 'lineage', 'Lineage'));
    }
    nodes.push(...await this.logicalWorkspaceHandoffTargets(section, workspaceId, packagePath));
    return nodes.length ? nodes : [messageNode(section, 'No package-level Handoffs')];
  }

  private fileArtifactRoots(section: OperatorSection, scope: string, artifacts: IndexedArtifact[], packagePath = ''): OperatorNode[] {
    return directoryChildren(section, scope, artifacts, '', packagePath);
  }

  private async rawWorkspaceArtifacts(section: OperatorSection, workspaceId: string, packagePath = ''): Promise<IndexedArtifact[]> {
    if (section === 'discovery') {
      const index = packagePath ? await this.carrier(packagePath) : null;
      const artifacts = index?.workspaces.find((item) => item.workspaceId === workspaceId)?.artifacts || [];
      return index ? this.filterDeltaArtifacts('discovery', index, workspaceId, artifacts) : artifacts;
    }
    if (section === 'incoming') {
      const index = this.incomingState(packagePath)?.index || null;
      const artifacts = index?.workspaces.find((item) => item.workspaceId === workspaceId)?.artifacts || [];
      return index ? this.filterDeltaArtifacts('incoming', index, workspaceId, artifacts) : artifacts;
    }
    const workspace = this.outgoing?.workspaces.find((item) => item.workspaceId === workspaceId);
    if (!workspace) return [];
    if (workspace.stagedRoot) return (await indexLocalWorkspace(workspace.stagedRoot, workspaceId)).artifacts;
    if (workspace.source === 'incoming' && workspace.packagePath) {
      return this.incomingState(workspace.packagePath)?.index.workspaces.find((item) => item.workspaceId === workspaceId)?.artifacts || [];
    }
    if (!workspace.root) return [];
    return (await indexLocalWorkspace(workspace.root, workspaceId)).artifacts;
  }

  private async workspaceFiles(section: OperatorSection, workspaceId: string, packagePath = ''): Promise<IndexedWorkspaceFile[]> {
    if (section === 'discovery' || section === 'incoming') {
      const index = section === 'discovery' ? (packagePath ? await this.carrier(packagePath) : null) : (this.incomingState(packagePath)?.index || null);
      const files = index?.workspaces.find((item) => item.workspaceId === workspaceId)?.files || [];
      if (!index || !this.delta(section)) return files;
      const delta = (await this.packageDeltaView(index)).workspaces.get(workspaceId);
      if (!delta || delta.state === 'local-missing' || delta.state === 'unavailable') return files;
      if (delta.state === 'exact') return [];
      return files.filter((file) => delta.incomingPaths.has(normalizePath(file.path)));
    }
    const workspace = this.outgoing?.workspaces.find((item) => item.workspaceId === workspaceId);
    if (!workspace) return [];
    if (workspace.stagedRoot) return indexLocalWorkspaceFiles(workspace.stagedRoot);
    if (workspace.source === 'incoming' && workspace.packagePath) {
      return this.incomingState(workspace.packagePath)?.index.workspaces.find((item) => item.workspaceId === workspaceId)?.files || [];
    }
    if (!workspace.root) return [];
    return indexLocalWorkspaceFiles(workspace.root);
  }

  private workspacePayloadIncluded(section: OperatorSection, workspaceId: string, packagePath = ''): boolean {
    if (section === 'incoming') {
      return Boolean(this.incomingState(packagePath)?.index.workspaces.find((item) => item.workspaceId === workspaceId)?.archivePath);
    }
    if (section === 'discovery') {
      const index = this.carrierCache.get(path.resolve(packagePath));
      return Boolean(index?.workspaces.find((item) => item.workspaceId === workspaceId)?.archivePath);
    }
    return Boolean(this.outgoing?.workspaces.find((item) => item.workspaceId === workspaceId)?.payloadIncluded);
  }

  private async logicalWorkspaceProjectionChildren(section: OperatorSection, node: OperatorNode): Promise<OperatorNode[] | null> {
    const workspaceId = node.data.workspaceId || '';
    if (!workspaceId) return null;
    if (node.data.kind === 'workspace') return this.logicalWorkspaceRootChildren(section, workspaceId, node.data.packagePath || '');

    if (node.data.kind === 'directory' && node.data.pathPrefix?.startsWith('logical-files:')) {
      const prefix = node.data.pathPrefix.slice('logical-files:'.length);
      const children = workspaceFileTreeChildren(section, workspaceId, await this.workspaceFiles(section, workspaceId, node.data.packagePath || ''), prefix, node.data.packagePath || '');
      return section === 'outgoing' ? this.decorateOutgoingWorkspaceFileNodes(children, workspaceId) : children;
    }
    if (node.data.kind === 'directory' && node.data.pathPrefix?.startsWith('logical-lineage:')) {
      const prefix = node.data.pathPrefix.slice('logical-lineage:'.length);
      const artifacts = artifactsForLineageMode(await this.rawWorkspaceArtifacts(section, workspaceId, node.data.packagePath || ''), this.lineage(section));
      return logicalLineageChildren(section, workspaceId, artifacts, prefix, node.data.packagePath || '');
    }

    if ((node.data.kind === 'artifact' || node.data.kind === 'projectedFile') && node.data.groupName?.startsWith('resolved-handoff:')) {
      return this.logicalHandoffProvenance(section, workspaceId, node.data.packagePath || '', node.data.groupName.slice('resolved-handoff:'.length));
    }

    const logicalGroup = parseLogicalWorkspaceGroup(node.data.groupName || '');
    if (node.data.kind !== 'group' || !logicalGroup || logicalGroup.workspaceId !== workspaceId) return null;
    if (logicalGroup.kind === 'files') {
      const children = workspaceFileTreeChildren(section, workspaceId, await this.workspaceFiles(section, workspaceId, node.data.packagePath || ''), '', node.data.packagePath || '');
      return section === 'outgoing' ? this.decorateOutgoingWorkspaceFileNodes(children, workspaceId) : children;
    }
    const artifacts = artifactsForLineageMode(await this.rawWorkspaceArtifacts(section, workspaceId, node.data.packagePath || ''), this.lineage(section));
    return logicalLineageChildren(section, workspaceId, artifacts, '', node.data.packagePath || '');
  }

  private async logicalCarrierIndex(section: OperatorSection, packagePath: string): Promise<IndexedCarrierPackage | null> {
    if (section === 'incoming') return this.incomingState(packagePath)?.index || null;
    if (section === 'discovery') return packagePath ? this.carrier(packagePath) : null;
    return null;
  }

  private packageHandoffLinks(section: OperatorSection, workspaceId: string, packagePath: string): PackageHandoffLink[] {
    if (section === 'incoming') {
      const state = this.incomingState(packagePath);
      if (!state) return [];
      return qualifiedRoutes(state.orientation)
        .filter((route) => route.workspaceId === workspaceId)
        .map((route) => ({
          workspaceId: route.workspaceId,
          handoffPath: normalizePath(route.workspaceRelativeHandoffPath),
          pointerPath: normalizePath(route.pointerPath),
          from: route.from,
          to: route.to
        }));
    }
    if (section === 'discovery') {
      const index = this.carrierCache.get(path.resolve(packagePath));
      if (!index) return [];
      return index.carrierArtifacts
        .filter(isOuterHandoffPointer)
        .map((artifact) => ({
          workspaceId: carrierArtifactWorkspaceId(artifact),
          handoffPath: normalizePath(markdownFieldValue(artifact.markdown, 'Handoff Workspace Path')),
          pointerPath: normalizePath(artifact.path),
          from: markdownFieldValue(artifact.markdown, 'From'),
          to: markdownFieldValue(artifact.markdown, 'To')
        }))
        .filter((route) => route.workspaceId === workspaceId && Boolean(route.handoffPath));
    }
    return [];
  }

  private async logicalWorkspaceHandoffTargets(section: OperatorSection, workspaceId: string, packagePath: string): Promise<OperatorNode[]> {
    if (section === 'outgoing') {
      if (!this.outgoing) return [];
      return this.outgoing.drafts
        .filter((item) => item.draft.workspaceId === workspaceId && Boolean(item.writtenPath) && item.routeIncluded)
        .map((item) => new OperatorNode({
          kind: 'draft', section: 'outgoing', id: `outgoing:draft:${item.id}`, label: item.draft.title,
          description: item.writtenPath ? (item.routeIncluded ? 'handoff · route included' : 'handoff · written') : 'handoff · preview only',
          contextValue: item.writtenPath ? (item.routeIncluded ? 'tiinex.outgoingDraftRoute' : 'tiinex.outgoingDraftWritten') : 'tiinex.outgoingDraft',
          draftId: item.id, workspaceId
        }));
    }

    const index = await this.logicalCarrierIndex(section, packagePath);
    if (!index) return [];
    const workspace = index.workspaces.find((item) => item.workspaceId === workspaceId);
    if (!workspace) return [];
    const nodes: OperatorNode[] = [];
    for (const link of this.packageHandoffLinks(section, workspaceId, packagePath)) {
      const artifact = workspace.artifacts.find((item) => normalizePath(item.path) === link.handoffPath);
      const pointer = index.carrierArtifacts.find((item) => normalizePath(item.path) === link.pointerPath);
      if (artifact) {
        const node = new OperatorNode({
          kind: 'artifact', section, id: `${section}:resolved-handoff:${packagePath}:${link.pointerPath}`,
          label: artifact.title || path.posix.basename(link.handoffPath), description: 'handoff', tooltip: artifact.path,
          contextValue: `tiinex.${section}ResolvedHandoff`, artifact, packagePath, workspaceId,
          groupName: `resolved-handoff:${link.pointerPath}`,
          collapsible: pointer ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None
        });
        node.iconPath = new vscode.ThemeIcon('git-pull-request');
        nodes.push(node);
      } else {
        const node = new OperatorNode({
          kind: 'projectedFile', section, id: `${section}:resolved-handoff:${packagePath}:${link.pointerPath}`,
          label: path.posix.basename(link.handoffPath), description: 'handoff · checkout required', tooltip: link.handoffPath,
          contextValue: `tiinex.${section}ResolvedHandoffUnavailable`, packagePath, workspaceId,
          groupName: `resolved-handoff:${link.pointerPath}`,
          collapsible: pointer ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None
        });
        node.iconPath = new vscode.ThemeIcon('git-pull-request');
        nodes.push(node);
      }
    }
    return nodes;
  }

  private async logicalHandoffProvenance(section: OperatorSection, workspaceId: string, packagePath: string, pointerPath: string): Promise<OperatorNode[]> {
    const index = await this.logicalCarrierIndex(section, packagePath);
    const pointer = index?.carrierArtifacts.find((item) => normalizePath(item.path) === normalizePath(pointerPath));
    if (!pointer) return [];
    const node = fileArtifactNode(section, pointer, packagePath);
    node.data.workspaceId = workspaceId;
    return [node];
  }

  private resolveCarrierPointerTarget(index: IndexedCarrierPackage, pointer: IndexedArtifact): { workspaceId: string; targetPath: string; artifact?: IndexedArtifact } | null {
    if (pointer.kind !== 'pointer') return null;
    const carrierRole = markdownFieldValue(pointer.markdown, 'Carrier Role').toLocaleLowerCase();
    const workspaceId = markdownFieldValue(pointer.markdown, 'Workspace Id') || markdownFieldValue(pointer.markdown, 'Target Workspace Id') || carrierArtifactWorkspaceId(pointer);
    const targetPath = normalizePath(
      markdownFieldValue(pointer.markdown, 'Handoff Workspace Path') ||
      markdownFieldValue(pointer.markdown, 'Target Inner Path')
    );
    if (!workspaceId || !targetPath) return null;
    if (carrierRole && carrierRole !== 'handoff-route' && carrierRole !== 'endpoint-role') return null;
    const workspace = index.workspaces.find((item) => item.workspaceId === workspaceId);
    if (!workspace) return null;
    const artifact = workspace.artifacts.find((item) => normalizePath(item.path) === targetPath);
    return { workspaceId, targetPath, artifact };
  }

  private async pointerTargetChildren(section: OperatorSection, node: OperatorNode, index: IndexedCarrierPackage | null): Promise<OperatorNode[] | null> {
    const pointer = node.data.artifact;
    if (node.data.kind !== 'artifact' || pointer?.kind !== 'pointer') return null;
    if (!index) return [];
    const target = this.resolveCarrierPointerTarget(index, pointer);
    if (!target) return [];
    if (target.artifact) {
      const child = resolvedArtifactFileNode(section, target.artifact, node.data.packagePath || index.packagePath);
      child.data.workspaceId = target.workspaceId;
      return [child];
    }
    const child = new OperatorNode({
      kind: 'projectedFile', section, id: `${section}:pointer-target:${index.packagePath}:${pointer.path}:${target.targetPath}`,
      label: path.posix.basename(target.targetPath), description: 'checkout required', tooltip: target.targetPath,
      packagePath: node.data.packagePath || index.packagePath, workspaceId: target.workspaceId,
      contextValue: `tiinex.${section}PointerTargetUnavailable`
    });
    return [child];
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
    if (section === 'incoming') {
      const incoming = this.incomingState(node.data.packagePath || '');
      if (!incoming) return [];
      if (node.data.groupName === 'carrier-files' || node.data.groupName?.startsWith('carrier:')) return artifactsForLineageMode(incoming.index.carrierArtifacts, this.lineage(section));
      const workspace = incoming.index.workspaces.find((item) => item.workspaceId === node.data.workspaceId || node.data.groupName?.startsWith(`${item.workspaceId}:`) || node.data.pathPrefix?.startsWith(`${item.workspaceId}:`));
      return artifactsForLineageMode(workspace?.artifacts || [], this.lineage(section));
    }
    if (section === 'outgoing' && this.outgoing) {
      const workspaceId = node.data.workspaceId || node.data.groupName?.split(':')[0] || node.data.pathPrefix?.split(':')[0] || '';
      const workspace = this.outgoing.workspaces.find((item) => item.workspaceId === workspaceId);
      if (!workspace) return [];
      if (workspace.stagedRoot) return artifactsForLineageMode((await indexLocalWorkspace(workspace.stagedRoot, workspaceId)).artifacts, this.lineage(section));
      if (workspace.source === 'incoming' && workspace.packagePath) {
        const incoming = this.incomingState(workspace.packagePath);
        const carried = incoming?.index.workspaces.find((item) => item.workspaceId === workspace.workspaceId);
        return artifactsForLineageMode(carried?.artifacts || [], this.lineage(section));
      }
      if (!workspace.root) return [];
      return artifactsForLineageMode((await indexLocalWorkspace(workspace.root, workspaceId)).artifacts, this.lineage(section));
    }
    return [];
  }

  private artifactProjectionChildren(section: OperatorSection, node: OperatorNode, artifacts: IndexedArtifact[]): OperatorNode[] {
    if (node.data.kind === 'workspace') {
      const children = this.artifactNodesForWorkspace(section, node.data.workspaceId || '', artifacts, node.data.packagePath || '');
      for (const child of children) { child.data.packagePath = node.data.packagePath; child.data.workspaceId = node.data.workspaceId; }
      return children;
    }
    if (node.data.kind === 'group') {
      let children: OperatorNode[] = [];
      if (node.data.groupName === 'carrier-files') children = this.fileArtifactRoots(section, 'carrier', artifacts, node.data.packagePath || '');
      else {
        const [, group] = String(node.data.groupName || '').split(':', 2);
        if (group) children = artifacts.filter((artifact) => logicalGroupForArtifact(artifact) === group).sort((a, b) => a.title.localeCompare(b.title)).map((artifact) => artifactNode(section, artifact, node.data.packagePath || ''));
      }
      for (const child of children) { child.data.packagePath = node.data.packagePath; child.data.workspaceId = node.data.workspaceId; }
      return children;
    }
    if (node.data.kind === 'directory') {
      const prefix = String(node.data.pathPrefix || '').split(':').slice(1).join(':');
      const scope = String(node.data.pathPrefix || '').split(':')[0];
      const children = directoryChildren(section, scope, artifacts, prefix, node.data.packagePath || '');
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

  private async openWorkspaceMarkdownNode(node: OperatorNode): Promise<void> {
    const workspaceId = node.data.workspaceId || '';
    const filePath = normalizePath(node.data.filePath || '');
    if (!workspaceId || !filePath || !/\.md$/i.test(filePath)) return;
    try {
      let markdown = '';
      if (node.data.section === 'incoming' || node.data.section === 'discovery') {
        const index = node.data.section === 'incoming'
          ? this.incomingState(node.data.packagePath || '')?.index || null
          : node.data.packagePath ? await this.carrier(node.data.packagePath) : null;
        const workspace = index?.workspaces.find((item) => item.workspaceId === workspaceId);
        if (!index || !workspace?.archivePath) return;
        markdown = (await readCarrierWorkspaceFile(index.packagePath, workspace.archivePath, filePath)).toString('utf8');
      } else {
        const workspace = this.outgoing?.workspaces.find((item) => item.workspaceId === workspaceId);
        if (!workspace) return;
        if (workspace.stagedRoot) {
          const root = path.resolve(workspace.stagedRoot);
          const absolute = path.resolve(root, ...filePath.split('/'));
          const relative = path.relative(root, absolute);
          if (!relative || relative === '..' || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) return;
          markdown = await readFile(absolute, 'utf8');
        } else if (workspace.source === 'incoming' && workspace.packagePath) {
          const state = this.incomingState(workspace.packagePath);
          const carried = state?.index.workspaces.find((item) => item.workspaceId === workspaceId);
          if (!state || !carried?.archivePath) return;
          markdown = (await readCarrierWorkspaceFile(state.index.packagePath, carried.archivePath, filePath)).toString('utf8');
        } else if (workspace.root) {
          const root = path.resolve(workspace.root);
          const absolute = path.resolve(root, ...filePath.split('/'));
          const relative = path.relative(root, absolute);
          if (!relative || relative === '..' || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) return;
          markdown = await readFile(absolute, 'utf8');
        }
      }
      if (markdown) await this.openVirtualMarkdown(`${node.data.section}/${workspaceId}/${filePath}`, markdown);
    } catch (error) {
      await vscode.window.showErrorMessage(`Tiinex Markdown preview blocked: ${shortMessage(error)}`);
    }
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

function artifactIcon(artifact: IndexedArtifact): string {
  const kind = String(artifact.kind || '').toLocaleLowerCase();
  if (kind.includes('handoff')) return 'git-pull-request';
  if (kind.includes('task')) return 'checklist';
  if (kind.includes('role') || kind.includes('party')) return 'person';
  if (kind.includes('pointer')) return 'references';
  if (kind.includes('schema')) return 'symbol-structure';
  if (kind.includes('validator')) return 'beaker';
  if (kind.includes('tool')) return 'tools';
  return 'markdown';
}

function treeFolderIcon(label: string): string {
  const value = label.toLocaleLowerCase();
  if (value === 'lineage') return 'references';
  if (value === 'handoffs') return 'git-pull-request';
  if (value === 'files') return 'files';
  if (value === '.topics') return 'symbol-namespace';
  if (value.includes('schema')) return 'symbol-structure';
  if (value.includes('role') || value.includes('part')) return 'organization';
  if (value.includes('handoff')) return 'git-pull-request';
  if (value.includes('task')) return 'checklist';
  if (value === 'src') return 'file-code';
  if (value === 'test' || value === 'tests') return 'beaker';
  if (value.includes('workspace')) return 'repo';
  return 'folder';
}

function fileTreeIcon(label: string): string {
  const value = label.toLocaleLowerCase();
  if (value.endsWith('.ts') || value.endsWith('.tsx') || value.endsWith('.js') || value.endsWith('.mjs') || value.endsWith('.cjs')) return 'file-code';
  if (value.endsWith('.json') || value.endsWith('.jsonc')) return 'json';
  if (value.endsWith('.md')) return 'markdown';
  if (value.endsWith('.zip')) return 'file-zip';
  if (value === 'license' || value === 'notice') return 'law';
  return 'file';
}

type LogicalWorkspaceGroupKind = 'lineage' | 'files';

function logicalWorkspaceGroupNode(section: OperatorSection, workspaceId: string, packagePath: string, kind: LogicalWorkspaceGroupKind, label: string): OperatorNode {
  const node = new OperatorNode({
    kind: 'group', section, id: `${section}:logical:${packagePath}:${workspaceId}:${kind}`, label,
    groupName: `${workspaceId}:logical:${kind}`, workspaceId, packagePath,
    contextValue: `tiinex.${section}Logical${label}`, collapsible: vscode.TreeItemCollapsibleState.Collapsed
  });
  node.iconPath = new vscode.ThemeIcon(treeFolderIcon(label));
  return node;
}

function parseLogicalWorkspaceGroup(value: string): { workspaceId: string; kind: LogicalWorkspaceGroupKind } | null {
  const match = String(value || '').match(/^(.+):logical:(lineage|files)$/);
  return match ? { workspaceId: match[1], kind: match[2] as LogicalWorkspaceGroupKind } : null;
}

function workspaceFileTreeChildren(section: OperatorSection, workspaceId: string, files: IndexedWorkspaceFile[], prefix: string, packagePath = ''): OperatorNode[] {
  const normalizedPrefix = normalizePath(prefix);
  const directories = new Set<string>();
  const direct = new Map<string, IndexedWorkspaceFile>();
  for (const entry of files) {
    const value = normalizePath(entry.path);
    if (!value || (normalizedPrefix && value === normalizedPrefix)) continue;
    if (normalizedPrefix && !value.startsWith(`${normalizedPrefix}/`)) continue;
    const remainder = normalizedPrefix ? value.slice(normalizedPrefix.length + 1) : value;
    const slash = remainder.indexOf('/');
    if (slash >= 0) { directories.add(remainder.slice(0, slash)); continue; }
    if (entry.directory) directories.add(remainder);
    else direct.set(remainder, entry);
  }
  const nodes = [...directories].filter(Boolean).sort((a, b) => a.localeCompare(b)).map((name) => {
    const next = normalizedPrefix ? `${normalizedPrefix}/${name}` : name;
    const node = new OperatorNode({
      kind: 'directory', section, id: `${section}:logical-file-dir:${packagePath}:${workspaceId}:${next}`, label: name,
      pathPrefix: `logical-files:${next}`, workspaceId, packagePath, contextValue: `tiinex.${section}Directory`,
      collapsible: vscode.TreeItemCollapsibleState.Collapsed
    });
    node.iconPath = new vscode.ThemeIcon(treeFolderIcon(name));
    return node;
  });
  for (const [name, entry] of [...direct.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    nodes.push(new OperatorNode({
      kind: 'file', section, id: `${section}:logical-file:${packagePath}:${workspaceId}:${entry.path}`, label: name,
      description: entry.bytes ? formatBytes(entry.bytes) : '', tooltip: entry.path, filePath: entry.path, workspaceId, packagePath,
      contextValue: `tiinex.${section}File`
    }));
  }
  return nodes;
}


function carrierArtifactWorkspaceId(artifact: IndexedArtifact): string {
  const fields = ['Target Workspace Id', 'Workspace Id', 'Route Workspace Id', 'Handoff Workspace Id'];
  for (const name of fields) {
    const value = markdownFieldValue(artifact.markdown, name);
    if (value) return value;
  }
  const reference = markdownFieldValue(artifact.markdown, 'Role Reference') || markdownFieldValue(artifact.markdown, 'Target Reference');
  const separator = reference.indexOf('::');
  return separator > 0 ? reference.slice(0, separator).trim() : '';
}

function isOuterHandoffPointer(artifact: IndexedArtifact): boolean {
  if (artifact.kind !== 'pointer') return false;
  const role = markdownFieldValue(artifact.markdown, 'Carrier Role').toLocaleLowerCase();
  if (role.includes('handoff')) return true;
  return /handoff[- ]pointer/i.test(`${artifact.path}\n${artifact.title}`);
}

function markdownFieldValue(markdown: string, name: string): string {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = String(markdown || '').match(new RegExp(`^\\s*-\\s+${escaped}:\\s*(.+?)\\s*$`, 'mi'));
  return String(match?.[1] || '').trim().replace(/^`|`$/g, '');
}

function formatBytes(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return '';
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${Math.round(value / 1024)} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

function shortRef(value: string): string {
  const ref = String(value || '').trim();
  return /^[a-f0-9]{12,64}$/i.test(ref) ? ref.slice(0, 12) : ref;
}

function artifactNode(section: OperatorSection, artifact: IndexedArtifact, packagePath = ''): OperatorNode {
  const node = new OperatorNode({
    kind: 'artifact', section, id: `${section}:artifact:${packagePath}:${artifact.id}`,
    label: artifact.title || path.posix.basename(artifact.path), description: artifact.kind, tooltip: artifact.path,
    contextValue: `tiinex.${section}Artifact`, artifact, packagePath, workspaceId: artifact.workspaceId
  });
  node.iconPath = new vscode.ThemeIcon(artifactIcon(artifact));
  return node;
}

function fileArtifactNode(section: OperatorSection, artifact: IndexedArtifact, packagePath = ''): OperatorNode {
  const node = new OperatorNode({
    kind: 'artifact', section, id: `${section}:file-artifact:${packagePath}:${artifact.id}`,
    label: path.posix.basename(artifact.path), description: artifact.kind, tooltip: artifact.path,
    contextValue: `tiinex.${section}Artifact`, artifact, packagePath, workspaceId: artifact.workspaceId,
    collapsible: artifact.kind === 'pointer' ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None
  });
  node.iconPath = new vscode.ThemeIcon(artifactIcon(artifact));
  return node;
}

function resolvedArtifactFileNode(section: OperatorSection, artifact: IndexedArtifact, packagePath = ''): OperatorNode {
  const node = new OperatorNode({
    kind: 'artifact', section, id: `${section}:resolved-file:${packagePath}:${artifact.id}`,
    label: path.posix.basename(artifact.path), description: artifact.kind, tooltip: artifact.path,
    contextValue: `tiinex.${section}ResolvedArtifact`, artifact, packagePath, workspaceId: artifact.workspaceId,
    collapsible: artifact.kind === 'pointer' ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None
  });
  node.iconPath = new vscode.ThemeIcon(artifactIcon(artifact));
  return node;
}

function directoryChildren(section: OperatorSection, scope: string, artifacts: IndexedArtifact[], prefix: string, packagePath = ''): OperatorNode[] {
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
    const node = new OperatorNode({
      kind: 'directory', section, id: `${section}:dir:${packagePath}:${scope}:${next}`, label: name,
      pathPrefix: `${scope}:${next}`, packagePath, contextValue: `tiinex.${section}Directory`, collapsible: vscode.TreeItemCollapsibleState.Collapsed
    });
    node.iconPath = new vscode.ThemeIcon(treeFolderIcon(name));
    return node;
  });
  nodes.push(...direct.sort((a, b) => a.path.localeCompare(b.path)).map((artifact) => fileArtifactNode(section, artifact, packagePath)));
  return nodes;
}

function logicalLineageChildren(section: OperatorSection, workspaceId: string, artifacts: IndexedArtifact[], prefix: string, packagePath = ''): OperatorNode[] {
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
    const node = new OperatorNode({
      kind: 'directory', section, id: `${section}:logical-lineage:${packagePath}:${workspaceId}:${next}`, label: name,
      pathPrefix: `logical-lineage:${next}`, workspaceId, packagePath, contextValue: `tiinex.${section}Directory`,
      collapsible: vscode.TreeItemCollapsibleState.Collapsed
    });
    node.iconPath = new vscode.ThemeIcon(treeFolderIcon(name));
    return node;
  });
  nodes.push(...direct.sort((a, b) => a.path.localeCompare(b.path)).map((artifact) => {
    const node = fileArtifactNode(section, artifact, packagePath);
    node.data.workspaceId = workspaceId;
    return node;
  }));
  return nodes;
}

function projectedCarrierFileNode(section: OperatorSection, label: string, description = ''): OperatorNode {
  return new OperatorNode({
    kind: 'projectedFile', section, id: `${section}:projected-file:${label}`, label, description, tooltip: label,
    contextValue: `tiinex.${section}ProjectedFile`
  });
}

function messageNode(section: OperatorSection, label: string): OperatorNode {
  return new OperatorNode({ kind: 'message', section, id: `${section}:message:${label}`, label, contextValue: `tiinex.${section}Message` });
}

function discoveryIdentity(item?: { path: string; mtimeMs: number; bytes: number }): string {
  return item ? `${path.resolve(item.path)}|${item.mtimeMs}|${item.bytes}` : '';
}

function timestamp(value: number): string {
  try {
    const date = new Date(value);
    if (!Number.isFinite(date.getTime())) return '';
    const pad = (part: number) => String(part).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  } catch { return ''; }
}

function nextMajorDimension(value: string): string {
  const match = String(value || '').trim().match(/^(\d{3})(?:-|$)/);
  if (!match) return '';
  const current = Number.parseInt(match[1], 10);
  if (!Number.isFinite(current) || current < 1 || current >= 999) return '';
  return String(current + 1).padStart(3, '0');
}

function outgoingSeriesPrefix(value: string): string {
  return filenameToken(String(value || '').trim()).replace(/-(\d{3})$/, '') || 'tiinex';
}

async function nextOutgoingSeriesLabel(prefix: string, folder = ''): Promise<string> {
  const normalizedPrefix = outgoingSeriesPrefix(prefix);
  const used = new Set<number>();
  const outputFolder = String(folder || '').trim();
  if (outputFolder) {
    try {
      const escapedPrefix = normalizedPrefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      for (const entry of await readdir(outputFolder)) {
        const match = new RegExp(`^${escapedPrefix}-(\\d{3})\\.handoff-package\\.zip$`, 'i').exec(entry);
        if (match) used.add(Number.parseInt(match[1], 10));
      }
    } catch (error) {
      if ((error as NodeJS.ErrnoException)?.code !== 'ENOENT') throw error;
    }
  }
  for (let index = 1; index < 1000; index += 1) {
    if (!used.has(index)) return `${normalizedPrefix}-${String(index).padStart(3, '0')}`;
  }
  return `${normalizedPrefix}-999`;
}

function filenameToken(value: string): string {
  return String(value || '')
    .trim()
    .toLocaleLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'unknown';
}

function isExactCommitRef(value: string): boolean { return /^[a-f0-9]{40,64}$/i.test(String(value || '').trim()); }

function payloadCheckoutReason(reason: string): string {
  const labels: Record<string, string> = {
    'workspace-is-dirty': 'commit or discard local changes first',
    'origin-remote-missing': 'origin remote is missing',
    'branch-unresolved': 'current branch is unresolved',
    'head-commit-unresolved': 'HEAD commit is unresolved',
    'upstream-missing': 'branch upstream is missing',
    'head-not-published-to-upstream': 'HEAD is not published to its upstream',
    'not-a-qualified-git-repository': 'no qualified Git checkout is available'
  };
  return labels[reason] || reason;
}

function shortMessage(error: unknown): string {
  const raw = error instanceof Error ? error.message : String(error);
  const first = raw.split(/\r?\n/).find((line) => line.trim()) || raw;
  return first.length > 180 ? `${first.slice(0, 177)}...` : first;
}

function nodeExecutable(): string { return preferredNodeExecutable(vscode.workspace.getConfiguration('tiinex').get('nodePath', '').toString().trim()); }

async function safePackageModel(extensionPath: string): Promise<Awaited<ReturnType<typeof loadPackageBuilderModel>>> {
  try { return await loadPackageBuilderModel(extensionPath); }
  catch { return { workspaces: [], routes: [] }; }
}
