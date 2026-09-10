import os from 'node:os';
import path from 'node:path';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import * as vscode from 'vscode';
import { preferredNodeExecutable } from './host/nodeExecutable';
import { manufactureHandoffPackage, OperatorContextResult, prepareBundledRuntime, projectHandoffLeaves, projectOperatorContext, projectWorkspacePackageSources, WorkspacePackageSourcesResult } from './tiinex/bootstrap';
import { repositoryRoots } from './vscode/gitApi';
import { repositoryFact } from './host/git';
import { workspaceCarrierArgs } from './core/packageArgs';
import { exactRouteByKey, routeChoiceKey } from './core/operatorModel';
import { repositoryContainsPath, sameRepositoryRoot } from './core/repositoryPath';
import { presentActionableFindings } from './core/findingPresentation';
import { extractZipBuffer, readExactZipEntryFromFile } from './host/zip';

type WorkspaceSource = WorkspacePackageSourcesResult['candidates'][number] & { root: string };
export type RouteChoice = { id: string; pointerless: boolean; label: string; description: string; detail?: string; path?: string; from?: string; to?: string; workspaceId?: string };
export interface PackageWorkspaceChoice { workspaceId: string; repository: string; ref: string; root: string; workspaceTargetPath: string; sourceKind?: string }
export interface IncomingPackageWorkspaceSource { workspaceId: string; packagePath: string; archivePath: string }
export interface PackageWorkspaceSourceOverride { workspaceId: string; root: string }
export interface PackageBuilderModel { workspaces: PackageWorkspaceChoice[]; routes: RouteChoice[] }
export interface PackageParticipantRole { label: string; reference: string; workspaceId: string; path: string }
export interface PackageRouteInput { routeId: string; participantRoles?: PackageParticipantRole[] }
export interface PackageBuildInput { routeId: string; routeInputs?: PackageRouteInput[]; workspaceIds: string[]; packageParentPath?: string; packageMajorReason?: string; participantRoles?: PackageParticipantRole[]; incomingWorkspaceSources?: IncomingPackageWorkspaceSource[]; workspaceSourceOverrides?: PackageWorkspaceSourceOverride[]; outputDirectory?: string; expectedCarrierDimension?: string; expectedCarrierFilename?: string }
export interface PackageRouteRouting { routeId: string; workspaceId: string; handoffPath: string; text: string }
export interface PackageBuildResult { outputPath: string; routingText: string; routeRoutingTexts: PackageRouteRouting[]; autoCopiedTransportText: boolean; routeId: string; routeIds: string[]; workspaceIds: string[] }
export interface HandoffEndpointChoice { id: string; target: string; reference: string; kind: 'role' | 'party'; label: string; workspaceId: string; artifactPath: string; schemaId: string; qualification: string }

function nodeExecutable(): string { return preferredNodeExecutable(vscode.workspace.getConfiguration('tiinex').get('nodePath', '').toString().trim()); }
function receiptBlocker(receipt: any): string { return presentActionableFindings(receipt?.findings || [], receipt?.status || 'unknown'); }
function workspaceSourceLabel(item: WorkspaceSource): string { return item.repository ? `${item.repository}@${item.ref || '(no ref)'}` : (item.sourceKind || 'local snapshot'); }

function receiptWorkspaceIds(receipt: any): string[] {
  const candidates = receipt?.planSummary?.workspaces || receipt?.manufacturingEvidence?.workspaceEnumerations || receipt?.carrierProjection?.workspaces || [];
  return [...new Set((Array.isArray(candidates) ? candidates : []).map((item: any) => String(item?.id || item?.workspaceId || '').trim()).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
}


function assertExpectedCarrierDimension(receipt: any, expected: string): void {
  const wanted = String(expected || '').trim();
  if (!wanted) return;
  const actual = String(receipt?.carrierProjection?.lineage?.dimension || receipt?.carrierProjection?.primary?.dimension || '').trim();
  if (!actual) throw new Error(`tiinex.package-builder.carrier-dimension-missing:expected=${wanted}`);
  if (actual !== wanted) throw new Error(`tiinex.package-builder.carrier-dimension-shared-contract-mismatch:expected=${wanted};actual=${actual}`);
}
function assertExpectedCarrierFilename(receipt: any, expected: string): void {
  const wanted = String(expected || '').trim();
  if (!wanted) return;
  const actual = String(receipt?.humanOutput?.primary?.filename || receipt?.carrierProjection?.routes?.[0]?.projectedFilename || '').trim();
  if (!actual) throw new Error(`tiinex.package-builder.carrier-filename-missing:expected=${wanted}`);
  if (actual !== wanted) throw new Error(`tiinex.package-builder.carrier-filename-shared-contract-mismatch:expected=${wanted};actual=${actual}`);
}
function assertExactWorkspaceSelection(receipt: any, requestedWorkspaceIds: string[]): void {
  const actual = receiptWorkspaceIds(receipt);
  if (!actual.length) return;
  const requested = [...new Set(requestedWorkspaceIds)].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
  const actualSet = new Set(actual);
  const requestedSet = new Set(requested);
  const extra = actual.filter((id) => !requestedSet.has(id));
  const missing = requested.filter((id) => !actualSet.has(id));
  if (extra.length || missing.length) throw new Error(`tiinex.package-builder.workspace-selection-expanded-or-missing:extra=${extra.join(',') || 'none'};missing=${missing.join(',') || 'none'}`);
}

async function operatorContext(runtime: Awaited<ReturnType<typeof prepareBundledRuntime>>): Promise<OperatorContextResult> {
  const roots = await repositoryRoots();
  const facts = [];
  for (const root of roots) facts.push(await repositoryFact(root));
  const result = await projectOperatorContext(runtime, roots, facts);
  if (result.status !== 'ready' || (result.findings || []).some((item) => item.severity === 'error')) throw new Error(`tiinex.package-builder.operator-context-blocked:\n${presentActionableFindings(result.findings || [], result.status)}`);
  return result;
}

function sourcesFromContext(context: OperatorContextResult): WorkspaceSource[] {
  const roots = (context.roots || []).map((item) => item.root);
  const out: WorkspaceSource[] = [];
  for (const candidate of context.workspaces || []) {
    const matchedRoot = candidate.localRepository?.root || candidate.hostRoot || '';
    if (!matchedRoot || !roots.some((root) => sameRepositoryRoot(root, matchedRoot))) throw new Error(`tiinex.package-builder.shared-repository-match-invalid:${candidate.workspaceId}`);
    out.push({ ...candidate, root: matchedRoot });
  }
  const ids = new Map<string, WorkspaceSource[]>();
  for (const item of out) ids.set(item.workspaceId, [...(ids.get(item.workspaceId) || []), item]);
  const duplicate = [...ids.entries()].find(([, items]) => items.length > 1);
  if (duplicate) throw new Error(`tiinex.package-builder.workspace-id-ambiguous:${duplicate[0]}`);
  return out.sort((a, b) => a.workspaceId.localeCompare(b.workspaceId));
}

function routeChoices(context: OperatorContextResult, workspaces: WorkspaceSource[]): RouteChoice[] {
  const validWorkspaceIds = new Set(workspaces.map((item) => item.workspaceId));
  const choices: RouteChoice[] = [{ id: routeChoiceKey({ pointerless: true }), pointerless: true, label: context.pointerless?.selectionLabel || 'No Handoff pointer', description: context.pointerless?.consequence || 'Workspace transport only — no Handoff semantics' }];
  for (const leaf of context.handoffLeaves || []) {
    if (!validWorkspaceIds.has(leaf.workspaceId)) continue;
    const base = { pointerless: false, workspaceId: leaf.workspaceId, path: leaf.path };
    choices.push({ id: routeChoiceKey(base), ...base, label: leaf.title || leaf.path, description: `${leaf.from} → ${leaf.to}`, detail: `${leaf.workspaceId}: ${leaf.path}\n${leaf.purpose || ''}`, from: leaf.from, to: leaf.to });
  }
  return choices;
}

async function loadModelWithRuntime(runtime: Awaited<ReturnType<typeof prepareBundledRuntime>>): Promise<{ model: PackageBuilderModel; sources: WorkspaceSource[]; routes: RouteChoice[] }> {
  const context = await operatorContext(runtime);
  const available = sourcesFromContext(context);
  if (!available.length) throw new Error('tiinex.package-builder.no-qualified-workspaces');
  const routes = routeChoices(context, available);
  return {
    model: {
      workspaces: available.map((item) => ({ workspaceId: item.workspaceId, repository: item.repository, ref: item.ref, root: item.root, workspaceTargetPath: item.workspaceTargetPath, sourceKind: item.sourceKind })),
      routes
    },
    sources: available,
    routes
  };
}

export async function loadPackageBuilderModel(extensionPath: string): Promise<PackageBuilderModel> {
  const runtime = await prepareBundledRuntime(extensionPath, nodeExecutable());
  try { return (await loadModelWithRuntime(runtime)).model; }
  finally { await runtime.dispose(); }
}


export async function qualifyLocalWorkspaceChoice(extensionPath: string, rootValue: string, workspaceId: string): Promise<PackageWorkspaceChoice | null> {
  const root = path.resolve(String(rootValue || '').trim());
  const wanted = String(workspaceId || '').trim();
  if (!root || !wanted) return null;
  const runtime = await prepareBundledRuntime(extensionPath, nodeExecutable());
  try {
    const projected = await projectWorkspacePackageSources(runtime, [root]);
    if (projected.status !== 'ready') return null;
    const matches = (projected.candidates || []).filter((item) => item.workspaceId === wanted && item.workspaceTargetPath);
    if (matches.length !== 1) return null;
    const item = matches[0];
    return { workspaceId: item.workspaceId, repository: item.repository, ref: item.ref, root, workspaceTargetPath: item.workspaceTargetPath, sourceKind: item.sourceKind };
  } finally { await runtime.dispose(); }
}

export async function loadLocalWorkspaceChoices(extensionPath: string): Promise<PackageWorkspaceChoice[]> {
  const roots = (vscode.workspace.workspaceFolders || []).map((item: vscode.WorkspaceFolder) => item.uri.fsPath);
  if (!roots.length) return [];
  const runtime = await prepareBundledRuntime(extensionPath, nodeExecutable());
  try {
    // Each root must be qualified independently so a non-Git folder keeps an
    // unambiguous physical source root. Run a small bounded pool instead of
    // serializing one portable-Tooling process per VS Code Workspace.
    const projectedByRoot: Array<WorkspacePackageSourcesResult | undefined> = new Array(roots.length);
    let next = 0;
    const worker = async (): Promise<void> => {
      for (;;) {
        const index = next++;
        if (index >= roots.length) return;
        projectedByRoot[index] = await projectWorkspacePackageSources(runtime, [roots[index]]);
      }
    };
    await Promise.all(Array.from({ length: Math.min(4, roots.length) }, () => worker()));

    const choices: PackageWorkspaceChoice[] = [];
    for (let index = 0; index < roots.length; index += 1) {
      const projected = projectedByRoot[index];
      if (projected?.status !== 'ready') continue;
      for (const item of projected.candidates || []) {
        if (!item.workspaceId || !item.workspaceTargetPath) continue;
        choices.push({ workspaceId: item.workspaceId, repository: item.repository, ref: item.ref, root: roots[index], workspaceTargetPath: item.workspaceTargetPath, sourceKind: item.sourceKind });
      }
    }
    const byId = new Map<string, PackageWorkspaceChoice[]>();
    for (const item of choices) byId.set(item.workspaceId, [...(byId.get(item.workspaceId) || []), item]);
    const ambiguous = [...byId.entries()].find(([, items]) => items.length > 1);
    if (ambiguous) throw new Error(`tiinex.package-builder.workspace-id-ambiguous:${ambiguous[0]}`);
    return choices;
  } finally { await runtime.dispose(); }
}

async function qualifyIncomingWorkspaceSources(runtime: Awaited<ReturnType<typeof prepareBundledRuntime>>, scratch: string, sources: IncomingPackageWorkspaceSource[]): Promise<WorkspaceSource[]> {
  const out: WorkspaceSource[] = [];
  let index = 0;
  for (const source of sources) {
    const workspaceId = String(source.workspaceId || '').trim();
    if (!workspaceId || !source.packagePath || !source.archivePath) throw new Error('tiinex.package-builder.incoming-source-invalid');
    const root = path.join(scratch, `incoming-${index++}-${workspaceId.replace(/[^a-z0-9._-]+/gi, '-')}`);
    const archive = await readExactZipEntryFromFile(source.packagePath, source.archivePath);
    await extractZipBuffer(archive, root);
    const projected = await projectWorkspacePackageSources(runtime, [root]);
    const matches = (projected.candidates || []).filter((item) => item.workspaceId === workspaceId);
    if (projected.status !== 'ready' || matches.length !== 1) throw new Error(`tiinex.package-builder.incoming-source-unqualified:${workspaceId}`);
    out.push({ ...matches[0], root });
  }
  return out;
}


async function qualifyWorkspaceSourceOverrides(runtime: Awaited<ReturnType<typeof prepareBundledRuntime>>, overrides: PackageWorkspaceSourceOverride[]): Promise<WorkspaceSource[]> {
  const out: WorkspaceSource[] = [];
  for (const override of overrides) {
    const workspaceId = String(override.workspaceId || '').trim();
    const root = path.resolve(String(override.root || '').trim());
    if (!workspaceId || !root) throw new Error('tiinex.package-builder.workspace-source-override-invalid');
    const projected = await projectWorkspacePackageSources(runtime, [root]);
    const matches = (projected.candidates || []).filter((item) => item.workspaceId === workspaceId);
    if (projected.status !== 'ready' || matches.length !== 1) throw new Error(`tiinex.package-builder.workspace-source-override-unqualified:${workspaceId}`);
    out.push({ ...matches[0], root });
  }
  return out;
}

async function handoffRouteChoicesForSources(runtime: Awaited<ReturnType<typeof prepareBundledRuntime>>, sources: WorkspaceSource[]): Promise<RouteChoice[]> {
  const out: RouteChoice[] = [];
  for (const source of sources) {
    const projected = await projectHandoffLeaves(runtime, [source.root]);
    if (projected.status !== 'ready') throw new Error(`tiinex.package-builder.handoff-routes-unqualified:${source.workspaceId}`);
    const candidates = projected.candidates?.length ? projected.candidates : projected.leaves;
    for (const leaf of candidates || []) {
      if (leaf.qualification !== 'qualified-exact') continue;
      const base = { pointerless: false, workspaceId: source.workspaceId, path: leaf.path };
      out.push({ id: routeChoiceKey(base), ...base, label: leaf.title || leaf.path, description: `${leaf.from} → ${leaf.to}`, detail: `${source.workspaceId}: ${leaf.path}\n${leaf.purpose || ''}`, from: leaf.from, to: leaf.to });
    }
  }
  return out;
}

async function outputDirectory(input: PackageBuildInput, title: string): Promise<string> {
  const configured = String(input.outputDirectory || '').trim();
  if (configured) {
    const resolved = path.resolve(configured);
    await mkdir(resolved, { recursive: true });
    return resolved;
  }
  const folder = await vscode.window.showOpenDialog({ canSelectFiles: false, canSelectFolders: true, canSelectMany: false, title });
  if (!folder?.length) throw new Error('tiinex.package-builder.output-cancelled');
  return folder[0].fsPath;
}

export async function loadHandoffEndpointChoices(extensionPath: string): Promise<HandoffEndpointChoice[]> {
  const runtime = await prepareBundledRuntime(extensionPath, nodeExecutable());
  try {
    const context = await operatorContext(runtime);
    const validWorkspaceIds = new Set(sourcesFromContext(context).map((item) => item.workspaceId));
    const byTarget = new Map<string, HandoffEndpointChoice>();
    for (const candidate of context.endpoints || []) if (validWorkspaceIds.has(candidate.workspaceId)) byTarget.set(candidate.target, candidate);
    return [...byTarget.values()].sort((a, b) => a.kind.localeCompare(b.kind) || a.label.localeCompare(b.label) || a.target.localeCompare(b.target));
  } finally { await runtime.dispose(); }
}

export async function announceBuiltCarrier(outputPath: string, label: string, note = ''): Promise<void> {
  const target = path.resolve(outputPath);
  const insideWorkspace = (vscode.workspace.workspaceFolders || []).some((folder: vscode.WorkspaceFolder) => repositoryContainsPath(folder.uri.fsPath, target));
  const revealAction = insideWorkspace ? 'Reveal in Explorer' : 'Open Folder';
  const action = await vscode.window.showInformationMessage(`Tiinex ${label} built.${note ? ` ${note}` : ''}`, revealAction, 'Copy path');
  if (action === 'Reveal in Explorer') await vscode.commands.executeCommand('revealInExplorer', vscode.Uri.file(target));
  else if (action === 'Open Folder') await vscode.commands.executeCommand('revealFileInOS', vscode.Uri.file(target));
  else if (action === 'Copy path') await vscode.env.clipboard.writeText(target);
}

function routeRoutingTexts(receipt: any, routeInputs: Array<{ route: RouteChoice }>, fallback = ''): PackageRouteRouting[] {
  const shared = Array.isArray(receipt?.humanOutput?.sharedRouting?.routes) ? receipt.humanOutput.sharedRouting.routes : [];
  if (shared.length) return shared.map((item: any) => ({
    routeId: String(item.routeId || ''),
    workspaceId: String(item.workspaceId || ''),
    handoffPath: String(item.workspaceRelativeHandoffPath || ''),
    text: String(item.transportText || '').trim()
  })).filter((item: PackageRouteRouting) => item.routeId && item.text);
  const primary = routeInputs[0]?.route;
  const text = String(fallback || receipt?.humanOutput?.normalInlineRouting?.content || '').trim();
  return primary && text ? [{ routeId: primary.id, workspaceId: primary.workspaceId || '', handoffPath: primary.path || '', text }] : [];
}

export function routeChoiceKeyForHandoff(workspaceId: string, pathValue: string): string { return routeChoiceKey({ pointerless: false, workspaceId, path: pathValue }); }

async function handoffArgs(selected: WorkspaceSource[], primaryRoute: RouteChoice, routes: Array<{ route: RouteChoice; participantRoles: PackageParticipantRole[] }>, scratch: string, packageParentPath = '', packageMajorReason = ''): Promise<string[]> {
  if (!primaryRoute.workspaceId || !primaryRoute.path) throw new Error('tiinex.package-builder.route-unresolved');
  const primary = selected.find((item) => item.workspaceId === primaryRoute.workspaceId);
  if (!primary) throw new Error('tiinex.package-builder.route-workspace-not-selected');
  const ordered = [primary, ...selected.filter((item) => item.workspaceId !== primary.workspaceId)];
  const descriptorsPath = path.join(scratch, 'workspaces.json');
  await writeFile(descriptorsPath, JSON.stringify({ workspaces: ordered.slice(1).map((item) => ({ id: item.workspaceId, root: item.root, workspaceTargetPath: item.workspaceTargetPath })) }), 'utf8');
  const selector = `${primaryRoute.workspaceId}:${primaryRoute.path}`;
  const args = [primary.root, '--handoff', primaryRoute.path, '--route', selector, '--workspace-id', primary.workspaceId, '--workspace-target', primary.workspaceTargetPath, '--workspace-roots', descriptorsPath, '--tooling-bootstrap', 'embedded'];
  if (packageParentPath) args.push('--package-parent', path.resolve(packageParentPath));
  if (packageMajorReason) {
    if (!packageParentPath) throw new Error('tiinex.package-builder.package-major-parent-required');
    args.push('--package-major', '--major-reason', packageMajorReason);
  }
  if (routes.length > 1 || routes.some((item) => item.participantRoles.length)) {
    const routesPath = path.join(scratch, 'workspace-routes.json');
    await writeFile(routesPath, JSON.stringify({ routes: routes.map(({ route, participantRoles }) => ({
      workspaceId: route.workspaceId,
      path: route.path,
      participantRoles: participantRoles.map((item) => ({ label: item.label, workspaceId: item.workspaceId, path: item.path, reference: item.reference }))
    })) }), 'utf8');
    args.push('--workspace-routes', routesPath);
  }
  return args;
}

export async function buildHandoffPackageFromForm(extensionPath: string, input: PackageBuildInput): Promise<PackageBuildResult> {
  const runtime = await prepareBundledRuntime(extensionPath, nodeExecutable());
  const scratch = await mkdtemp(path.join(os.tmpdir(), 'tiinex-vscode-package-builder-'));
  try {
    const current = await loadModelWithRuntime(runtime);
    const incomingSources = await qualifyIncomingWorkspaceSources(runtime, scratch, input.incomingWorkspaceSources || []);
    const overrideSources = await qualifyWorkspaceSourceOverrides(runtime, input.workspaceSourceOverrides || []);
    const sourceById = new Map<string, WorkspaceSource>(current.sources.map((item) => [item.workspaceId, item]));
    for (const item of incomingSources) sourceById.set(item.workspaceId, item);
    for (const item of overrideSources) sourceById.set(item.workspaceId, item);
    const sourceRoutes = await handoffRouteChoicesForSources(runtime, [...incomingSources, ...overrideSources]);
    const routeMap = new Map<string, RouteChoice>();
    for (const item of [...current.routes, ...sourceRoutes]) routeMap.set(item.id, item);
    const availableRoutes = [...routeMap.values()];
    const route = exactRouteByKey(availableRoutes, input.routeId);
    const requestedRouteInputs = (input.routeInputs?.length ? input.routeInputs : [{ routeId: input.routeId, participantRoles: input.participantRoles || [] }]);
    const uniqueRouteInputs = new Map<string, PackageRouteInput>();
    for (const item of requestedRouteInputs) uniqueRouteInputs.set(item.routeId, item);
    if (!uniqueRouteInputs.has(input.routeId)) uniqueRouteInputs.set(input.routeId, { routeId: input.routeId, participantRoles: input.participantRoles || [] });
    const routeInputs = [...uniqueRouteInputs.values()].map((item) => ({ route: exactRouteByKey(availableRoutes, item.routeId), participantRoles: item.participantRoles || [] }));
    const requestedWorkspaceIds = [...new Set(input.workspaceIds.map((item) => String(item || '').trim()).filter(Boolean))].sort();
    const selectedSources = requestedWorkspaceIds.map((workspaceId) => sourceById.get(workspaceId)).filter((item): item is WorkspaceSource => Boolean(item));
    const selectedIds = new Set(selectedSources.map((item) => item.workspaceId));
    const missingWorkspaceIds = requestedWorkspaceIds.filter((item) => !selectedIds.has(item));
    if (missingWorkspaceIds.length && !input.packageParentPath) throw new Error(`tiinex.package-builder.workspace-id-unresolved:${missingWorkspaceIds.join(',')}`);
    if (!selectedSources.length) throw new Error('tiinex.package-builder.no-local-workspace-source');
    if (route.pointerless) {
      const args = await workspaceCarrierArgs(selectedSources, scratch);
      const preview = await manufactureHandoffPackage(runtime, args);
      if (preview.status !== 'ready' || preview.transportExecutable === false || preview?.carrierProjection?.mode !== 'workspace' || (preview?.carrierProjection?.routes || []).length !== 0) throw new Error(`tiinex.package-builder.workspace-preview-blocked:\n${receiptBlocker(preview)}`);
      const workspaceText = selectedSources.map((item) => `${item.workspaceId}: ${workspaceSourceLabel(item)}`).join('\n');
      const filename = String(preview?.humanOutput?.primary?.filename || '(shared Tooling will resolve filename)');
      const accepted = await vscode.window.showWarningMessage(`Build qualified pointerless Workspace carrier?\n\nNo Handoff pointer, From/To, Role, current-work, transfer, participation, acceptance, or completion semantics will be created.\n\nWorkspaces:\n${workspaceText}\n\nProjected package: ${filename}\n\nComplete Workspace membership and package qualification are owned by shared Tooling.`, { modal: true }, 'Build Workspace Carrier');
      if (accepted !== 'Build Workspace Carrier') throw new Error('tiinex.package-builder.cancelled');
      const folder = await outputDirectory(input, 'Select Tiinex outgoing folder');
      const built = await manufactureHandoffPackage(runtime, [...args, '--output-dir', folder]);
      if (built.status !== 'ready' || !built.primaryOutput?.path || built?.carrierProjection?.mode !== 'workspace' || (built?.carrierProjection?.routes || []).length !== 0) throw new Error(`tiinex.package-builder.workspace-manufacture-blocked:\n${receiptBlocker(built)}`);
      return { outputPath: built.primaryOutput.path, routingText: '', routeRoutingTexts: [], autoCopiedTransportText: false, routeId: route.id, routeIds: [route.id], workspaceIds: selectedSources.map((item) => item.workspaceId) };
    }
    if (!route.workspaceId || !selectedSources.some((item) => item.workspaceId === route.workspaceId)) throw new Error('tiinex.package-builder.route-workspace-not-selected');
    for (const item of routeInputs) {
      if (item.route.pointerless || !item.route.workspaceId || !item.route.path) throw new Error('tiinex.package-builder.handoff-route-required');
      if (!selectedSources.some((source) => source.workspaceId === item.route.workspaceId) && !input.packageParentPath) throw new Error(`tiinex.package-builder.route-workspace-not-selected:${item.route.workspaceId}`);
    }
    const args = await handoffArgs(selectedSources, route, routeInputs, scratch, String(input.packageParentPath || ''), String(input.packageMajorReason || '').trim());
    const preview = await manufactureHandoffPackage(runtime, args);
    if (preview.status !== 'ready' || preview.transportExecutable === false) throw new Error(`tiinex.package-builder.preview-blocked:\n${receiptBlocker(preview)}`);
    assertExpectedCarrierDimension(preview, String(input.expectedCarrierDimension || ''));
    assertExpectedCarrierFilename(preview, String(input.expectedCarrierFilename || ''));
    assertExactWorkspaceSelection(preview, requestedWorkspaceIds);
    const workspaceText = selectedSources.map((item) => `${item.workspaceId}: ${workspaceSourceLabel(item)}`).join('\n');
    const filename = String(preview?.humanOutput?.primary?.filename || '(shared Tooling will resolve filename)');
    const lineageText = input.packageMajorReason ? `Major checkpoint: ${input.packageMajorReason}` : (input.packageParentPath ? 'Child continuation of Incoming carrier' : 'New root carrier (001)');
    const accepted = await vscode.window.showWarningMessage(`Build qualified Handoff carrier?\n\nRoute: ${route.path}\nFrom/To (read-only): ${route.from} → ${route.to}\nCarrier lineage: ${lineageText}\n\nWorkspaces:\n${workspaceText}\n\nProjected package: ${filename}\n\nHandoff artifact continuity Parent is not package route selection. Complete-snapshot membership is owned by shared Tooling.`, { modal: true }, 'Build Return Package');
    if (accepted !== 'Build Return Package') throw new Error('tiinex.package-builder.cancelled');
    const folder = await outputDirectory(input, 'Select Tiinex outgoing folder');
    const built = await manufactureHandoffPackage(runtime, [...args, '--output-dir', folder]);
    if (built.status !== 'ready' || !built.primaryOutput?.path) throw new Error(`tiinex.package-builder.manufacture-blocked:\n${receiptBlocker(built)}`);
    assertExpectedCarrierDimension(built, String(input.expectedCarrierDimension || ''));
    assertExpectedCarrierFilename(built, String(input.expectedCarrierFilename || ''));
    const routing = String(built?.humanOutput?.normalInlineRouting?.content || '').trim();
    if (!routing) throw new Error('tiinex.package-builder.routing-text-missing');
    const routeTexts = routeRoutingTexts(built, routeInputs, routing);
    if (routeTexts.length !== routeInputs.length) throw new Error('tiinex.package-builder.routing-text-route-count-mismatch');
    const autoCopied = routeTexts.length === 1;
    if (autoCopied) await vscode.env.clipboard.writeText(routeTexts[0].text);
    return { outputPath: built.primaryOutput.path, routingText: autoCopied ? routeTexts[0].text : '', routeRoutingTexts: routeTexts, autoCopiedTransportText: autoCopied, routeId: route.id, routeIds: routeInputs.map((item) => item.route.id), workspaceIds: selectedSources.map((item) => item.workspaceId) };
  } finally { await rm(scratch, { recursive: true, force: true }); await runtime.dispose(); }
}
