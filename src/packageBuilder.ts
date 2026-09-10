import os from 'node:os';
import path from 'node:path';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import * as vscode from 'vscode';
import { manufactureHandoffPackage, OperatorContextResult, prepareBundledRuntime, projectOperatorContext, WorkspacePackageSourcesResult } from './tiinex/bootstrap';
import { repositoryRoots } from './vscode/gitApi';
import { repositoryFact } from './host/git';
import { workspaceCarrierArgs } from './core/packageArgs';
import { exactRouteByKey, routeChoiceKey } from './core/operatorModel';
import { sameRepositoryRoot } from './core/repositoryPath';
import { presentActionableFindings } from './core/findingPresentation';

type WorkspaceSource = WorkspacePackageSourcesResult['candidates'][number] & { root: string };
export type RouteChoice = { id: string; pointerless: boolean; label: string; description: string; detail?: string; path?: string; from?: string; to?: string; workspaceId?: string };
export interface PackageWorkspaceChoice { workspaceId: string; repository: string; ref: string; root: string; workspaceTargetPath: string; sourceKind?: string }
export interface PackageBuilderModel { workspaces: PackageWorkspaceChoice[]; routes: RouteChoice[] }
export interface PackageParticipantRole { label: string; reference: string; workspaceId: string; path: string }
export interface PackageRouteInput { routeId: string; participantRoles?: PackageParticipantRole[] }
export interface PackageBuildInput { routeId: string; routeInputs?: PackageRouteInput[]; workspaceIds: string[]; packageParentPath?: string; participantRoles?: PackageParticipantRole[] }
export interface PackageBuildResult { outputPath: string; routingText: string; routeId: string; routeIds: string[]; workspaceIds: string[] }
export interface HandoffEndpointChoice { id: string; target: string; reference: string; kind: 'role' | 'party'; label: string; workspaceId: string; artifactPath: string; schemaId: string; qualification: string }

function nodeExecutable(): string { return vscode.workspace.getConfiguration('tiinex').get('nodePath', '').toString().trim() || process.execPath; }
function receiptBlocker(receipt: any): string { return presentActionableFindings(receipt?.findings || [], receipt?.status || 'unknown'); }
function workspaceSourceLabel(item: WorkspaceSource): string { return item.repository ? `${item.repository}@${item.ref || '(no ref)'}` : (item.sourceKind || 'local snapshot'); }

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

async function announceBuiltCarrier(outputPath: string, label: string, note = ''): Promise<void> {
  const action = await vscode.window.showInformationMessage(`Tiinex ${label} built.${note ? ` ${note}` : ''}`, 'Reveal in File Explorer', 'Copy path');
  if (action === 'Reveal in File Explorer') await vscode.commands.executeCommand('revealFileInOS', vscode.Uri.file(outputPath));
  else if (action === 'Copy path') await vscode.env.clipboard.writeText(outputPath);
}

export function routeChoiceKeyForHandoff(workspaceId: string, pathValue: string): string { return routeChoiceKey({ pointerless: false, workspaceId, path: pathValue }); }

async function handoffArgs(selected: WorkspaceSource[], primaryRoute: RouteChoice, routes: Array<{ route: RouteChoice; participantRoles: PackageParticipantRole[] }>, scratch: string, packageParentPath = ''): Promise<string[]> {
  if (!primaryRoute.workspaceId || !primaryRoute.path) throw new Error('tiinex.package-builder.route-unresolved');
  const primary = selected.find((item) => item.workspaceId === primaryRoute.workspaceId);
  if (!primary) throw new Error('tiinex.package-builder.route-workspace-not-selected');
  const ordered = [primary, ...selected.filter((item) => item.workspaceId !== primary.workspaceId)];
  const descriptorsPath = path.join(scratch, 'workspaces.json');
  await writeFile(descriptorsPath, JSON.stringify({ workspaces: ordered.slice(1).map((item) => ({ id: item.workspaceId, root: item.root, workspaceTargetPath: item.workspaceTargetPath })) }), 'utf8');
  const selector = `${primaryRoute.workspaceId}:${primaryRoute.path}`;
  const args = [primary.root, '--handoff', primaryRoute.path, '--route', selector, '--workspace-id', primary.workspaceId, '--workspace-target', primary.workspaceTargetPath, '--workspace-roots', descriptorsPath, '--tooling-bootstrap', 'embedded'];
  if (packageParentPath) args.push('--package-parent', path.resolve(packageParentPath));
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
    const route = exactRouteByKey(current.routes, input.routeId);
    const requestedRouteInputs = (input.routeInputs?.length ? input.routeInputs : [{ routeId: input.routeId, participantRoles: input.participantRoles || [] }]);
    const uniqueRouteInputs = new Map<string, PackageRouteInput>();
    for (const item of requestedRouteInputs) uniqueRouteInputs.set(item.routeId, item);
    if (!uniqueRouteInputs.has(input.routeId)) uniqueRouteInputs.set(input.routeId, { routeId: input.routeId, participantRoles: input.participantRoles || [] });
    const routeInputs = [...uniqueRouteInputs.values()].map((item) => ({ route: exactRouteByKey(current.routes, item.routeId), participantRoles: item.participantRoles || [] }));
    const requestedWorkspaceIds = [...new Set(input.workspaceIds.map((item) => String(item || '').trim()).filter(Boolean))].sort();
    const selectedSources = current.sources.filter((item) => requestedWorkspaceIds.includes(item.workspaceId));
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
      const folder = await vscode.window.showOpenDialog({ canSelectFiles: false, canSelectFolders: true, canSelectMany: false, title: 'Select output directory for Tiinex Workspace carrier' });
      if (!folder?.length) throw new Error('tiinex.package-builder.output-cancelled');
      const built = await manufactureHandoffPackage(runtime, [...args, '--output-dir', folder[0].fsPath]);
      if (built.status !== 'ready' || !built.primaryOutput?.path || built?.carrierProjection?.mode !== 'workspace' || (built?.carrierProjection?.routes || []).length !== 0) throw new Error(`tiinex.package-builder.workspace-manufacture-blocked:\n${receiptBlocker(built)}`);
      await announceBuiltCarrier(built.primaryOutput.path, 'Workspace carrier');
      return { outputPath: built.primaryOutput.path, routingText: '', routeId: route.id, routeIds: [route.id], workspaceIds: selectedSources.map((item) => item.workspaceId) };
    }
    if (!route.workspaceId || !selectedSources.some((item) => item.workspaceId === route.workspaceId)) throw new Error('tiinex.package-builder.route-workspace-not-selected');
    for (const item of routeInputs) {
      if (item.route.pointerless || !item.route.workspaceId || !item.route.path) throw new Error('tiinex.package-builder.handoff-route-required');
      if (!selectedSources.some((source) => source.workspaceId === item.route.workspaceId) && !input.packageParentPath) throw new Error(`tiinex.package-builder.route-workspace-not-selected:${item.route.workspaceId}`);
    }
    const args = await handoffArgs(selectedSources, route, routeInputs, scratch, String(input.packageParentPath || ''));
    const preview = await manufactureHandoffPackage(runtime, args);
    if (preview.status !== 'ready' || preview.transportExecutable === false) throw new Error(`tiinex.package-builder.preview-blocked:\n${receiptBlocker(preview)}`);
    const workspaceText = selectedSources.map((item) => `${item.workspaceId}: ${workspaceSourceLabel(item)}`).join('\n');
    const filename = String(preview?.humanOutput?.primary?.filename || '(shared Tooling will resolve filename)');
    const accepted = await vscode.window.showWarningMessage(`Build qualified Handoff carrier?\n\nRoute: ${route.path}\nFrom/To (read-only): ${route.from} → ${route.to}\n\nWorkspaces:\n${workspaceText}\n\nProjected package: ${filename}\n\nHandoff artifact continuity Parent is not package route selection. Complete-snapshot membership is owned by shared Tooling.`, { modal: true }, 'Build Return Package');
    if (accepted !== 'Build Return Package') throw new Error('tiinex.package-builder.cancelled');
    const folder = await vscode.window.showOpenDialog({ canSelectFiles: false, canSelectFolders: true, canSelectMany: false, title: 'Select output directory for Tiinex Handoff package' });
    if (!folder?.length) throw new Error('tiinex.package-builder.output-cancelled');
    const built = await manufactureHandoffPackage(runtime, [...args, '--output-dir', folder[0].fsPath]);
    if (built.status !== 'ready' || !built.primaryOutput?.path) throw new Error(`tiinex.package-builder.manufacture-blocked:\n${receiptBlocker(built)}`);
    const routing = String(built?.humanOutput?.normalInlineRouting?.content || '').trim();
    if (!routing) throw new Error('tiinex.package-builder.routing-text-missing');
    await vscode.env.clipboard.writeText(routing);
    await announceBuiltCarrier(built.primaryOutput.path, 'Handoff carrier', 'Exact routing text was copied to the clipboard.');
    return { outputPath: built.primaryOutput.path, routingText: routing, routeId: route.id, routeIds: routeInputs.map((item) => item.route.id), workspaceIds: selectedSources.map((item) => item.workspaceId) };
  } finally { await rm(scratch, { recursive: true, force: true }); await runtime.dispose(); }
}
