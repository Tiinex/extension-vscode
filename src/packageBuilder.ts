import os from 'node:os';
import path from 'node:path';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import * as vscode from 'vscode';
import { manufactureHandoffPackage, OperatorContextResult, prepareBundledRuntime, projectOperatorContext, WorkspacePackageSourcesResult } from './tiinex/bootstrap';
import { repositoryRoots } from './vscode/gitApi';
import { repositoryFact } from './host/git';
import { workspaceCarrierArgs } from './core/packageArgs';
import { exactRouteByKey, exactWorkspaceIds, routeChoiceKey } from './core/operatorModel';
import { sameRepositoryRoot } from './core/repositoryPath';
import { presentActionableFindings } from './core/findingPresentation';

type WorkspaceSource = WorkspacePackageSourcesResult['candidates'][number] & { root: string };
export type RouteChoice = { id: string; pointerless: boolean; label: string; description: string; detail?: string; path?: string; from?: string; to?: string; workspaceId?: string };
export interface PackageWorkspaceChoice { workspaceId: string; repository: string; ref: string; root: string; workspaceTargetPath: string; sourceKind?: string }
export interface PackageBuilderModel { workspaces: PackageWorkspaceChoice[]; routes: RouteChoice[] }
export interface PackageBuildInput { routeId: string; workspaceIds: string[] }
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

async function handoffArgs(selected: WorkspaceSource[], route: RouteChoice, scratch: string): Promise<string[]> {
  if (!route.workspaceId || !route.path) throw new Error('tiinex.package-builder.route-unresolved');
  const primary = selected.find((item) => item.workspaceId === route.workspaceId);
  if (!primary) throw new Error('tiinex.package-builder.route-workspace-not-selected');
  const ordered = [primary, ...selected.filter((item) => item.workspaceId !== primary.workspaceId)];
  const descriptorsPath = path.join(scratch, 'workspaces.json');
  await writeFile(descriptorsPath, JSON.stringify({ workspaces: ordered.slice(1).map((item) => ({ id: item.workspaceId, root: item.root, workspaceTargetPath: item.workspaceTargetPath })) }), 'utf8');
  return [primary.root, '--handoff', route.path, '--route', route.path, '--workspace-id', primary.workspaceId, '--workspace-target', primary.workspaceTargetPath, '--workspace-roots', descriptorsPath, '--tooling-bootstrap', 'embedded'];
}

export async function buildHandoffPackageFromForm(extensionPath: string, input: PackageBuildInput): Promise<string> {
  const runtime = await prepareBundledRuntime(extensionPath, nodeExecutable());
  const scratch = await mkdtemp(path.join(os.tmpdir(), 'tiinex-vscode-package-builder-'));
  try {
    const current = await loadModelWithRuntime(runtime);
    const route = exactRouteByKey(current.routes, input.routeId);
    const selectedSources = exactWorkspaceIds(current.sources, input.workspaceIds);
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
      return built.primaryOutput.path;
    }
    if (!route.workspaceId || !selectedSources.some((item) => item.workspaceId === route.workspaceId)) throw new Error('tiinex.package-builder.route-workspace-not-selected');
    const args = await handoffArgs(selectedSources, route, scratch);
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
    if (routing) await vscode.env.clipboard.writeText(routing);
    await announceBuiltCarrier(built.primaryOutput.path, 'Handoff carrier', routing ? 'Exact routing text was copied to the clipboard.' : '');
    return built.primaryOutput.path;
  } finally { await rm(scratch, { recursive: true, force: true }); await runtime.dispose(); }
}
