import { checkedCarrierFilename } from './core/carrierFilename';
import { existingCarrierFilenames, inspectCarrierDestination, publishCarrierFile } from './host/carrierPublish';
import os from 'node:os';
import path from 'node:path';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import * as vscode from 'vscode';
import { extensionHostAcceptanceEnabled, recordExtensionHostAcceptanceEvent } from './vscode/extensionHostAcceptance';
import { preferredNodeExecutable } from './host/nodeExecutable';
import { manufactureHandoffPackage, manufactureHandoffPackageDetailed, projectHandoffCarrierOutputCollision, projectHandoffParticipants, OperatorContextResult, prepareBundledRuntime, prepareHostCoreRuntime, prepareSelectedHostCoreRuntime, projectHandoffLeaves, projectHandoffEndpoints, projectOperatorContext, projectWorkspacePackageSources, WorkspacePackageSourcesResult } from './tiinex/bootstrap';
import { workspaceCarrierArgs } from './core/packageArgs';
import { appendHostCarrierProgressionArgs } from './tiinex/hostManufactureContract';
import { exactRouteByKey, routeChoiceKey } from './core/operatorModel';
import { repositoryContainsPath, sameRepositoryRoot } from './core/repositoryPath';
import { presentActionableFindings } from './core/findingPresentation';
import { extractZipBuffer, readExactZipEntryFromFile } from './host/zip';
import { representativeWorkspaceChoicesForRoot } from './core/workspaceChoice';
import { ParticipantProjection, QualifiedParticipantRole } from './core/participantProjection';
import { assertStableQualifiedCarrierAllocation, qualifiedCarrierAllocationFromManufactureReceipt } from './core/carrierAllocation';
import { endpointCandidatesForAuthoringSource, endpointCandidatesForExplicitSource, mergeExactHandoffEndpointChoices, mergeHandoffEndpointAuthoringChoices, HandoffEndpointAuthoringCandidate } from './core/handoffEndpointSelection';
import { handoffRouteCandidatesForExplicitSource } from './core/handoffRouteSelection';
import { safeTarget } from './core/paths';
import { revealFileInNativeFolder } from './host/reveal';

type WorkspaceSource = WorkspacePackageSourcesResult['candidates'][number] & { root: string };
export type RouteChoice = { id: string; pointerless: boolean; label: string; description: string; detail?: string; path?: string; from?: string; to?: string; workspaceId?: string; leaf?: boolean };
export interface PackageWorkspaceChoice { workspaceId: string; title?: string; repository: string; ref: string; root: string; workspaceTargetPath: string; sourceKind?: string }
export interface IncomingPackageWorkspaceSource { workspaceId: string; packagePath: string; archivePath: string }
export interface PackageWorkspaceSourceOverride { workspaceId: string; root: string }
export interface PackageBuilderModel { workspaces: PackageWorkspaceChoice[]; routes: RouteChoice[] }
export interface PackageParticipantRole extends QualifiedParticipantRole {}
export interface PackageEndpointRoleBinding {
  party: 'from' | 'to';
  label: string;
  reference: string;
  workspaceId: string;
  path: string;
}
export interface PackageRouteInput { routeId: string; participantRoles?: PackageParticipantRole[]; endpointRoles?: PackageEndpointRoleBinding[] }
export interface PackageBuildInput { routeId: string; routeInputs?: PackageRouteInput[]; workspaceIds: string[]; carrierPrefix?: string; packageParentPath?: string; packageParentRoutePointer?: string; packageParentRouteId?: string; packageConsolidation?: boolean; packageMajorReason?: string; incomingWorkspaceSources?: IncomingPackageWorkspaceSource[]; workspaceSourceOverrides?: PackageWorkspaceSourceOverride[]; discoveryWorkspaceSourceOverrides?: PackageWorkspaceSourceOverride[]; outputDirectory?: string; expectedCarrierDimension?: string; expectedCarrierFilename?: string; reportProgress?: (message: string) => void }
export interface PackageRouteRouting { routeId: string; workspaceId: string; handoffPath: string; recipientLabel?: string; text: string }
export type PackageParticipantProjection = ParticipantProjection;
export interface PackageBuildResult { outputPath: string; routingText: string; routeRoutingTexts: PackageRouteRouting[]; autoCopiedTransportText: boolean; routeId: string; routeIds: string[]; workspaceIds: string[] }
export interface HandoffEndpointChoice { id: string; target: string; reference: string; kind: 'role' | 'party'; label: string; authoringLabel?: string; workspaceId: string; artifactPath: string; schemaId: string; qualification: string }
export interface PartyReferenceSource { workspaceId: string; root: string }
export interface HandoffEndpointSource extends PartyReferenceSource {}

function nodeExecutable(): string { return preferredNodeExecutable(vscode.workspace.getConfiguration('tiinex').get('nodePath', '').toString().trim()); }
function receiptBlocker(receipt: any): string { return presentActionableFindings(receipt?.findings || [], receipt?.status || 'unknown'); }
function workspaceSourceLabel(item: WorkspaceSource): string { return item.repository ? `${item.repository}@${item.ref || '(no ref)'}` : (item.sourceKind || 'local snapshot'); }
function reportProgress(input: PackageBuildInput, message: string): void { input.reportProgress?.(message); }

async function cleanupScratch(root: string): Promise<void> {
  try { await rm(root, { recursive: true, force: true, maxRetries: 8, retryDelay: 75 }); }
  catch { /* Disposable temp cleanup must never mask a qualified/published carrier or the original operation error. */ }
}

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
function qualifiedCoreCarrierFilename(receipt: any): string {
  const value = String(receipt?.humanOutput?.primary?.filename || receipt?.carrierProjection?.routes?.[0]?.projectedFilename || '').trim();
  if (!value) throw new Error('tiinex.package-builder.carrier-filename-missing');
  return checkedCarrierFilename(value);
}

async function destinationCarrierFilename(runtime: Awaited<ReturnType<typeof prepareBundledRuntime>>, sourcePath: string, folder: string, coreFilename: string): Promise<string> {
  const canonical = checkedCarrierFilename(coreFilename);
  const destinationState = await inspectCarrierDestination(sourcePath, folder, canonical);
  if (destinationState === 'absent' || destinationState === 'identical') return canonical;
  const existing = await existingCarrierFilenames(folder);
  const projection = await projectHandoffCarrierOutputCollision(runtime, canonical, existing);
  const projected = String(projection?.filename || '').trim();
  if (projection?.status !== 'ready' || !projected) {
    throw new Error(`tiinex.package-builder.output-collision-projection-blocked:${projection?.reasonCode || projection?.state || 'unknown'}`);
  }
  return checkedCarrierFilename(projected);
}
function assertCoreCarrierFilenameStable(preview: any, built: any): void {
  const expected = qualifiedCoreCarrierFilename(preview);
  const actual = qualifiedCoreCarrierFilename(built);
  if (actual !== expected) throw new Error(`tiinex.package-builder.carrier-filename-preview-build-mismatch:preview=${expected};built=${actual}`);
}

function qualifiedCoreRouteSelector(receipt: any, route: RouteChoice): string {
  const workspaceId = String(route.workspaceId || '').trim();
  const handoffPath = String(route.path || '').replace(/\\/g, '/').trim();
  if (!workspaceId || !handoffPath) throw new Error('tiinex.package-builder.route-selector-source-incomplete');
  const matches = (Array.isArray(receipt?.carrierProjection?.routes) ? receipt.carrierProjection.routes : []).filter((item: any) => {
    if (String(item?.state || '') !== 'qualified') return false;
    const itemWorkspaceId = String(item?.workspaceId || '').trim();
    const itemPath = String(item?.workspaceRelativeHandoffPath || item?.workspaceRelativePath || '').replace(/\\/g, '/').trim();
    return itemWorkspaceId === workspaceId && itemPath === handoffPath;
  });
  if (matches.length !== 1) throw new Error(`tiinex.package-builder.core-route-selector-${matches.length ? 'ambiguous' : 'missing'}:${workspaceId}:${handoffPath}`);
  const selector = String(matches[0]?.id || matches[0]?.routeId || '').trim();
  if (!selector) throw new Error(`tiinex.package-builder.core-route-selector-missing-id:${workspaceId}:${handoffPath}`);
  return selector;
}

function withCoreRouteSelector(args: string[], selector: string): string[] {
  const next = [...args];
  const index = next.indexOf('--route');
  if (index >= 0) {
    if (index + 1 >= next.length) throw new Error('tiinex.package-builder.route-selector-argument-incomplete');
    next[index + 1] = selector;
  } else next.push('--route', selector);
  return next;
}

function humanOutputMatchesRoute(receipt: any, route: RouteChoice): boolean {
  const primary = receipt?.humanOutput?.primary || null;
  if (!primary) return false;
  return String(primary.workspaceId || '').trim() === String(route.workspaceId || '').trim()
    && String(primary.workspaceRelativeHandoffPath || '').replace(/\\/g, '/').trim() === String(route.path || '').replace(/\\/g, '/').trim();
}
function assertExactWorkspaceSelection(receipt: any, requestedWorkspaceIds: string[]): void {
  const actual = receiptWorkspaceIds(receipt);
  if (!actual.length) throw new Error('tiinex.package-builder.workspace-selection-unavailable');
  const requested = [...new Set(requestedWorkspaceIds)].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
  const actualSet = new Set(actual);
  const requestedSet = new Set(requested);
  const extra = actual.filter((id) => !requestedSet.has(id));
  const missing = requested.filter((id) => !actualSet.has(id));
  if (extra.length || missing.length) throw new Error(`tiinex.package-builder.workspace-selection-expanded-or-missing:extra=${extra.join(',') || 'none'};missing=${missing.join(',') || 'none'}`);
}

async function operatorContext(runtime: Awaited<ReturnType<typeof prepareBundledRuntime>>): Promise<OperatorContextResult> {
  const roots = openWorkspaceRoots();
  const result = await projectOperatorContext(runtime, roots);
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


function openWorkspaceRoots(): string[] {
  return (vscode.workspace.workspaceFolders || []).map((item: vscode.WorkspaceFolder) => item.uri.fsPath);
}

const DISCOVERY_CONTEXT_TTL_MS = 60_000;
const discoveryContextCache = new Map<string, { at: number; value: Promise<OperatorContextResult> }>();

function discoveryContextKey(roots: string[]): string {
  return [...new Set((roots || []).map((root) => path.resolve(String(root || '').trim())).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }))
    .join('\u0000');
}

export function clearPackageBuilderDiscoveryCache(): void {
  discoveryContextCache.clear();
}

async function cachedOperatorContext(extensionPath: string, roots: string[]): Promise<OperatorContextResult> {
  const normalizedRoots = [...new Set((roots || []).map((root) => path.resolve(String(root || '').trim())).filter(Boolean))];
  if (!normalizedRoots.length) throw new Error('tiinex.package-builder.operator-context.workspace-required');
  const key = discoveryContextKey(normalizedRoots);
  const now = Date.now();
  const existing = discoveryContextCache.get(key);
  if (existing && now - existing.at <= DISCOVERY_CONTEXT_TTL_MS) return existing.value;
  const value = (async () => {
    const runtime = await prepareHostCoreRuntime(extensionPath, normalizedRoots);
    try {
      const result = await projectOperatorContext(runtime, normalizedRoots);
      if (result.status !== 'ready' || (result.findings || []).some((item) => item.severity === 'error')) {
        throw new Error(`tiinex.package-builder.operator-context-blocked:\n${presentActionableFindings(result.findings || [], result.status)}`);
      }
      return result;
    } finally { await runtime.dispose(); }
  })();
  discoveryContextCache.set(key, { at: now, value });
  try { return await value; }
  catch (error) { discoveryContextCache.delete(key); throw error; }
}

export async function loadPackageBuilderModel(extensionPath: string): Promise<PackageBuilderModel> {
  const runtime = await prepareHostCoreRuntime(extensionPath, openWorkspaceRoots());
  try { return (await loadModelWithRuntime(runtime)).model; }
  finally { await runtime.dispose(); }
}


export async function qualifyLocalWorkspaceChoice(extensionPath: string, rootValue: string, workspaceId: string): Promise<PackageWorkspaceChoice | null> {
  const root = path.resolve(String(rootValue || '').trim());
  const wanted = String(workspaceId || '').trim();
  if (!root || !wanted) return null;
  const runtime = await prepareHostCoreRuntime(extensionPath, [...openWorkspaceRoots(), root]);
  try {
    const projected = await projectWorkspacePackageSources(runtime, [root]);
    if (projected.status !== 'ready') return null;
    const matches = (projected.candidates || []).filter((item) => item.workspaceId === wanted && item.workspaceTargetPath);
    if (matches.length !== 1) return null;
    const item = matches[0];
    return { workspaceId: item.workspaceId, title: item.title, repository: item.repository, ref: item.ref, root, workspaceTargetPath: item.workspaceTargetPath, sourceKind: item.sourceKind };
  } finally { await runtime.dispose(); }
}

export async function loadLocalWorkspaceChoices(extensionPath: string): Promise<PackageWorkspaceChoice[]> {
  const roots = openWorkspaceRoots();
  if (!roots.length) return [];
  const context = await cachedOperatorContext(extensionPath, roots);
  const choices: PackageWorkspaceChoice[] = [];
  for (const root of roots) {
    const candidates = (context.workspaces || []).filter((item) => sameRepositoryRoot(String(item.hostRoot || ''), root));
    for (const item of representativeWorkspaceChoicesForRoot(root, candidates as WorkspacePackageSourcesResult['candidates'])) {
      if (!item.workspaceId || !item.workspaceTargetPath) continue;
      choices.push({ workspaceId: item.workspaceId, title: item.title, repository: item.repository, ref: item.ref, root, workspaceTargetPath: item.workspaceTargetPath, sourceKind: item.sourceKind });
    }
  }
  const byId = new Map<string, PackageWorkspaceChoice[]>();
  for (const item of choices) byId.set(item.workspaceId, [...(byId.get(item.workspaceId) || []), item]);
  const ambiguous = [...byId.entries()].find(([, items]) => items.length > 1);
  if (ambiguous) throw new Error(`tiinex.package-builder.workspace-id-ambiguous:${ambiguous[0]}`);
  return choices;
}


async function mapBounded<T, R>(items: T[], limit: number, worker: (item: T, index: number) => Promise<R>): Promise<R[]> {
  if (!items.length) return [];
  const results = new Array<R>(items.length);
  let next = 0;
  const run = async (): Promise<void> => {
    for (;;) {
      const index = next++;
      if (index >= items.length) return;
      results[index] = await worker(items[index], index);
    }
  };
  await Promise.all(Array.from({ length: Math.min(Math.max(1, limit), items.length) }, () => run()));
  return results;
}

async function qualifyIncomingWorkspaceSources(runtime: Awaited<ReturnType<typeof prepareBundledRuntime>>, scratch: string, sources: IncomingPackageWorkspaceSource[]): Promise<WorkspaceSource[]> {
  return mapBounded(sources, 4, async (source, index) => {
    const workspaceId = String(source.workspaceId || '').trim();
    if (!workspaceId || !source.packagePath || !source.archivePath) throw new Error('tiinex.package-builder.incoming-source-invalid');
    const root = path.join(scratch, `incoming-${index}-${workspaceId.replace(/[^a-z0-9._-]+/gi, '-')}`);
    const archive = await readExactZipEntryFromFile(source.packagePath, source.archivePath);
    await extractZipBuffer(archive, root);
    const projected = await projectWorkspacePackageSources(runtime, [root]);
    const matches = (projected.candidates || []).filter((item) => item.workspaceId === workspaceId);
    if (projected.status !== 'ready' || matches.length !== 1) throw new Error(`tiinex.package-builder.incoming-source-unqualified:${workspaceId}`);
    return { ...matches[0], root };
  });
}

async function qualifyWorkspaceSourceOverrides(runtime: Awaited<ReturnType<typeof prepareBundledRuntime>>, overrides: PackageWorkspaceSourceOverride[]): Promise<WorkspaceSource[]> {
  return mapBounded(overrides, 4, async (override) => {
    const workspaceId = String(override.workspaceId || '').trim();
    const root = path.resolve(String(override.root || '').trim());
    if (!workspaceId || !root) throw new Error('tiinex.package-builder.workspace-source-override-invalid');
    const projected = await projectWorkspacePackageSources(runtime, [root]);
    const matches = (projected.candidates || []).filter((item) => item.workspaceId === workspaceId);
    if (projected.status !== 'ready' || matches.length !== 1) throw new Error(`tiinex.package-builder.workspace-source-override-unqualified:${workspaceId}`);
    return { ...matches[0], root };
  });
}

type MaterialBinding = { sourcePath: string; referenceTarget: string; provenance: { workspaceId: string; path: string } };

async function materialBindingsForDiscoverySources(
  runtime: Awaited<ReturnType<typeof prepareBundledRuntime>>,
  selectedSources: WorkspaceSource[],
  discoverySources: WorkspaceSource[]
): Promise<Record<string, MaterialBinding>> {
  const carriedWorkspaceIds = new Set(selectedSources.map((item) => item.workspaceId));
  const bindings: Record<string, MaterialBinding> = {};
  const externalDiscoverySources = discoverySources.filter((source) => !carriedWorkspaceIds.has(source.workspaceId));
  const projectedDiscovery = await mapBounded(externalDiscoverySources, 4, async (source) => {
    const projection = await projectHandoffEndpoints(runtime, source.root, source.workspaceId);
    if (projection.status !== 'ready' || (projection.findings || []).some((item) => item.severity === 'error')) {
      throw new Error(`tiinex.package-builder.discovery-material-source-unqualified:${source.workspaceId}:
${presentActionableFindings(projection.findings || [], projection.status)}`);
    }
    return { source, candidates: endpointCandidatesForExplicitSource(source, projection.candidates || []) };
  });
  for (const { source, candidates } of projectedDiscovery) {
    for (const candidate of candidates) {
      const reference = String(candidate.reference || candidate.target || '').trim();
      const artifactPath = String(candidate.artifactPath || '').replace(/\\/g, '/').replace(/^\/+/, '');
      if (!reference || !artifactPath) continue;
      const sourcePath = safeTarget(source.root, artifactPath);
      const existing = bindings[reference];
      if (existing && (path.resolve(existing.sourcePath) !== sourcePath || existing.provenance.workspaceId !== source.workspaceId || existing.provenance.path !== artifactPath)) {
        throw new Error(`tiinex.package-builder.discovery-material-reference-ambiguous:${reference}`);
      }
      bindings[reference] = { sourcePath, referenceTarget: reference, provenance: { workspaceId: source.workspaceId, path: artifactPath } };
    }
  }
  return bindings;
}

async function handoffRouteChoicesForSources(runtime: Awaited<ReturnType<typeof prepareBundledRuntime>>, sources: WorkspaceSource[]): Promise<RouteChoice[]> {
  const groups = await mapBounded(sources, 4, async (source) => {
    const projected = await projectHandoffLeaves(runtime, [source.root]);
    if (projected.status !== 'ready' || (projected.findings || []).some((item) => item.severity === 'error')) {
      throw new Error(`tiinex.package-builder.handoff-routes-unqualified:${source.workspaceId}:
${presentActionableFindings(projected.findings || [], projected.status)}`);
    }
    return handoffRouteCandidatesForExplicitSource(source, projected.candidates || [], projected.leaves || []).map((candidate) => {
      const base = { pointerless: false, workspaceId: source.workspaceId, path: candidate.path };
      return { id: routeChoiceKey(base), ...base, label: candidate.title || candidate.path, description: `${candidate.from} → ${candidate.to}`, detail: `${source.workspaceId}: ${candidate.path}
${candidate.purpose || ''}`, from: candidate.from, to: candidate.to, leaf: candidate.leaf } as RouteChoice;
    });
  });
  return groups.flat();
}

export async function loadHandoffRouteChoicesForSource(extensionPath: string, source: HandoffEndpointSource): Promise<RouteChoice[]> {
  const workspaceId = String(source.workspaceId || '').trim();
  const root = path.resolve(String(source.root || '').trim());
  if (!workspaceId || !root) throw new Error('tiinex.package-builder.handoff-route-source-invalid');
  const runtime = await prepareHostCoreRuntime(extensionPath, [root]);
  try {
    const workspaceProjection = await projectWorkspacePackageSources(runtime, [root]);
    const matches = (workspaceProjection.candidates || []).filter((item) => item.workspaceId === workspaceId);
    if (workspaceProjection.status !== 'ready' || matches.length !== 1) {
      throw new Error(`tiinex.package-builder.handoff-route-source-unqualified:${workspaceId}`);
    }
    return handoffRouteChoicesForSources(runtime, [{ ...matches[0], root }]);
  } finally { await runtime.dispose(); }
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

export async function loadPartyReferenceChoicesForSources(extensionPath: string, sources: PartyReferenceSource[]): Promise<HandoffEndpointChoice[]> {
  const explicit = sources.map((source) => ({ workspaceId: String(source.workspaceId || '').trim(), root: path.resolve(String(source.root || '').trim()) }));
  if (!explicit.length) return [];
  if (explicit.some((source) => !source.workspaceId || !source.root)) throw new Error('tiinex.package-builder.endpoint-source-invalid');
  const byWorkspaceId = new Map<string, string[]>();
  for (const source of explicit) byWorkspaceId.set(source.workspaceId, [...(byWorkspaceId.get(source.workspaceId) || []), source.root]);
  const ambiguous = [...byWorkspaceId.entries()].find(([, roots]) => new Set(roots).size > 1);
  if (ambiguous) throw new Error(`tiinex.package-builder.endpoint-source-workspace-ambiguous:${ambiguous[0]}`);
  const context = await cachedOperatorContext(extensionPath, explicit.map((source) => source.root));
  const groups = explicit.map((source) => {
    const candidates = (context.endpoints || []).filter((candidate: any) => candidate.workspaceId === source.workspaceId && sameRepositoryRoot(String(candidate.hostRoot || ''), source.root));
    return endpointCandidatesForExplicitSource(source, candidates as HandoffEndpointChoice[]);
  });
  return mergeExactHandoffEndpointChoices(groups);
}


export interface OperatorPartyScopeProjection {
  target: string;
  displayName: string;
  kind: 'role' | 'party';
  schemaId: string;
  workspaceId: string;
  artifactPath: string;
  qualification: string;
  recipientLabels: string[];
  recipientTargets: string[];
  recipientLabelAmbiguities: string[];
  basis: string[];
  expansionState: string;
  boundary?: string;
}

export interface OperatorPartySurface {
  candidates: HandoffEndpointAuthoringCandidate[];
  scopes: OperatorPartyScopeProjection[];
}

export async function loadOperatorPartySurfaceForSources(extensionPath: string, sources: PartyReferenceSource[]): Promise<OperatorPartySurface> {
  const candidates = await loadPartyAuthoringReferenceChoicesForSources(extensionPath, sources);
  if (!sources.length) return { candidates, scopes: [] };
  const roots = [...new Set(sources.map((source) => path.resolve(String(source.root || '').trim())).filter(Boolean))];
  const context = await cachedOperatorContext(extensionPath, roots);
  const allowedTargets = new Set(candidates.map((candidate) => String(candidate.target || '').trim()).filter(Boolean));
  const scopes = ((context.operatorPartyScopes || []) as OperatorPartyScopeProjection[])
    .filter((scope) => allowedTargets.has(String(scope.target || '').trim()))
    .map((scope) => ({
      ...scope,
      target: String(scope.target || ''), displayName: String(scope.displayName || ''), kind: scope.kind, schemaId: String(scope.schemaId || ''), workspaceId: String(scope.workspaceId || ''), artifactPath: String(scope.artifactPath || ''), qualification: String(scope.qualification || ''),
      recipientLabels: Array.isArray(scope.recipientLabels) ? scope.recipientLabels.map(String) : [],
      recipientTargets: Array.isArray(scope.recipientTargets) ? scope.recipientTargets.map(String) : [],
      recipientLabelAmbiguities: Array.isArray(scope.recipientLabelAmbiguities) ? scope.recipientLabelAmbiguities.map(String) : [],
      basis: Array.isArray(scope.basis) ? scope.basis.map(String) : [],
      expansionState: String(scope.expansionState || 'self-only')
    }));
  return { candidates, scopes };
}

export async function loadPartyAuthoringReferenceChoicesForSources(extensionPath: string, sources: PartyReferenceSource[], currentRoleLeavesOnly = false): Promise<HandoffEndpointAuthoringCandidate[]> {
  const explicit = sources.map((source) => ({ workspaceId: String(source.workspaceId || '').trim(), root: path.resolve(String(source.root || '').trim()) }));
  if (!explicit.length) return [];
  if (explicit.some((source) => !source.workspaceId || !source.root)) throw new Error('tiinex.package-builder.endpoint-source-invalid');
  const byWorkspaceId = new Map<string, string[]>();
  for (const source of explicit) byWorkspaceId.set(source.workspaceId, [...(byWorkspaceId.get(source.workspaceId) || []), source.root]);
  const ambiguous = [...byWorkspaceId.entries()].find(([, roots]) => new Set(roots).size > 1);
  if (ambiguous) throw new Error(`tiinex.package-builder.endpoint-source-workspace-ambiguous:${ambiguous[0]}`);
  const context = await cachedOperatorContext(extensionPath, explicit.map((source) => source.root));
  const groups = explicit.map((source) => {
    const workspace = (context.workspaces || []).find((item) => item.workspaceId === source.workspaceId && sameRepositoryRoot(String(item.hostRoot || ''), source.root));
    const projectedAuthoring = ((context.authoringReferenceCandidates || []) as any[])
      .filter((candidate: any) => candidate.workspaceId === source.workspaceId && sameRepositoryRoot(String(candidate.hostRoot || ''), source.root));
    const sourceCandidates = currentRoleLeavesOnly
      ? ([
          ...((workspace?.currentRoleEndpoints || []) as HandoffEndpointAuthoringCandidate[]),
          ...((workspace?.currentRoleAuthoringEndpoints || []) as HandoffEndpointAuthoringCandidate[])
        ])
      : projectedAuthoring.length
        ? projectedAuthoring
        : [
            ...(context.endpoints || []).filter((candidate: any) => candidate.workspaceId === source.workspaceId && sameRepositoryRoot(String(candidate.hostRoot || ''), source.root)),
            ...((context.authoringEndpoints || []) as any[]).filter((candidate: any) => candidate.workspaceId === source.workspaceId && sameRepositoryRoot(String(candidate.hostRoot || ''), source.root))
          ];
    return endpointCandidatesForAuthoringSource(source, sourceCandidates as HandoffEndpointAuthoringCandidate[]);
  });
  return mergeHandoffEndpointAuthoringChoices(groups);
}


/** Backward-compatible Handoff names. Role/Party discovery itself is reusable authoring capability, not Handoff-owned semantics. */
export async function loadHandoffEndpointChoicesForSources(extensionPath: string, sources: HandoffEndpointSource[]): Promise<HandoffEndpointChoice[]> {
  return loadPartyReferenceChoicesForSources(extensionPath, sources);
}

export async function loadHandoffAuthoringEndpointChoicesForSources(extensionPath: string, sources: HandoffEndpointSource[], currentRoleLeavesOnly = false): Promise<HandoffEndpointAuthoringCandidate[]> {
  return loadPartyAuthoringReferenceChoicesForSources(extensionPath, sources, currentRoleLeavesOnly);
}

/** Compatibility surface for callers that have not yet supplied an explicit source set.
 * It resolves each visible VS Code Workspace independently, then projects only the
 * representative qualified Workspace roots rather than aggregating repository-wide
 * endpoint discovery. New semantic authoring paths should pass exact sources directly. */
export async function loadHandoffEndpointChoices(extensionPath: string): Promise<HandoffEndpointChoice[]> {
  const choices = await loadLocalWorkspaceChoices(extensionPath);
  return loadPartyReferenceChoicesForSources(extensionPath, choices.map((item) => ({ workspaceId: item.workspaceId, root: item.root })));
}

export async function announceBuiltCarrier(outputPath: string, label: string, note = ''): Promise<void> {
  const target = path.resolve(outputPath);
  if (extensionHostAcceptanceEnabled()) {
    recordExtensionHostAcceptanceEvent('carrier-built-announcement', { outputPath: target, label, note });
    return;
  }
  const insideWorkspace = (vscode.workspace.workspaceFolders || []).some((folder: vscode.WorkspaceFolder) => repositoryContainsPath(folder.uri.fsPath, target));
  const revealAction = insideWorkspace ? 'Reveal in Explorer' : 'Open Folder';
  const action = await vscode.window.showInformationMessage(`Tiinex ${label} built.${note ? ` ${note}` : ''}`, revealAction, 'Copy path');
  if (action === 'Reveal in Explorer') await vscode.commands.executeCommand('revealInExplorer', vscode.Uri.file(target));
  else if (action === 'Open Folder') await revealFileInNativeFolder(target);
  else if (action === 'Copy path') await vscode.env.clipboard.writeText(target);
}

function routeRoutingTexts(receipt: any, routeInputs: Array<{ route: RouteChoice }>, fallback = ''): PackageRouteRouting[] {
  const shared = Array.isArray(receipt?.humanOutput?.sharedRouting?.routes) ? receipt.humanOutput.sharedRouting.routes : [];
  if (shared.length) {
    const projectionById = new Map<string, {
      workspaceId?: string;
      workspaceRelativeHandoffPath?: string;
      workspaceRelativePath?: string;
      to?: string;
      parties?: { to?: string };
    }>((Array.isArray(receipt?.carrierProjection?.routes) ? receipt.carrierProjection.routes : [])
      .map((item: any) => [String(item?.id || item?.routeId || ''), item] as const)
      .filter(([id]: readonly [string, any]) => Boolean(id)));
    const inputByLocation = new Map(routeInputs.map((entry) => [`${String(entry.route.workspaceId || '')}\u0000${String(entry.route.path || '').replace(/\\/g, '/')}`, entry.route]));
    return shared.map((item: any) => {
      const routeId = String(item.routeId || '');
      const projected = projectionById.get(routeId);
      const workspaceId = String(projected?.workspaceId || item.workspaceId || '').trim();
      const handoffPath = String(projected?.workspaceRelativeHandoffPath || projected?.workspaceRelativePath || item.workspaceRelativeHandoffPath || '').replace(/\\/g, '/').trim();
      const route = inputByLocation.get(`${workspaceId}\u0000${handoffPath}`);
      return {
        routeId,
        workspaceId,
        handoffPath,
        recipientLabel: String(route?.to || projected?.to || projected?.parties?.to || '').trim(),
        text: String(item.transportText || '').trim()
      };
    }).filter((item: PackageRouteRouting) => item.routeId && item.workspaceId && item.handoffPath && item.text);
  }
  const primary = routeInputs.find((entry) => String(entry.route.id || '') === String(receipt?.humanOutput?.primary?.routeId || ''))?.route || routeInputs[0]?.route;
  const text = String(fallback || receipt?.humanOutput?.normalInlineRouting?.content || '').trim();
  return primary && text ? [{ routeId: primary.id, workspaceId: primary.workspaceId || '', handoffPath: primary.path || '', recipientLabel: String(primary.to || '').trim(), text }] : [];
}

export function routeChoiceKeyForHandoff(workspaceId: string, pathValue: string): string { return routeChoiceKey({ pointerless: false, workspaceId, path: pathValue }); }

function routeChoiceFromKey(keyValue: string): RouteChoice {
  const key = String(keyValue || '').trim();
  if (key === 'workspace-carrier:none') return { id: key, pointerless: true, label: 'No Handoff pointer', description: 'No Handoff pointer' };
  if (!key.startsWith('handoff:')) throw new Error('tiinex.operator.route-selection-unresolved');
  const rest = key.slice('handoff:'.length);
  const separator = rest.indexOf(':');
  if (separator <= 0 || separator === rest.length - 1) throw new Error('tiinex.operator.route-selection-unresolved');
  const workspaceId = rest.slice(0, separator).trim();
  const routePath = rest.slice(separator + 1).replace(/\\/g, '/').trim();
  if (!workspaceId || !routePath) throw new Error('tiinex.operator.route-selection-unresolved');
  return { id: key, pointerless: false, workspaceId, path: routePath, label: routePath, description: `${workspaceId}: ${routePath}` };
}

async function handoffArgs(selected: WorkspaceSource[], primaryRoute: RouteChoice, routes: Array<{ route: RouteChoice; participantRoles: PackageParticipantRole[]; endpointRoles: PackageEndpointRoleBinding[] }>, scratch: string, packageParentPath = '', packageMajorReason = '', packageParentRoutePointer = '', packageParentRouteId = '', packageConsolidation = false, carrierPrefix = '', materialBindings: Record<string, any> = {}, projectedFilename = '', existingFilenames: string[] = []): Promise<string[]> {
  if (!primaryRoute.workspaceId || !primaryRoute.path) throw new Error('tiinex.package-builder.route-unresolved');
  const primary = selected.find((item) => item.workspaceId === primaryRoute.workspaceId);
  if (!primary) throw new Error('tiinex.package-builder.route-workspace-not-selected');
  const ordered = [primary, ...selected.filter((item) => item.workspaceId !== primary.workspaceId)];
  const descriptorsPath = path.join(scratch, 'workspaces.json');
  const targetsPath = path.join(scratch, 'workspace-targets.json');
  await writeFile(descriptorsPath, JSON.stringify({ workspaces: ordered.slice(1).map((item) => ({ id: item.workspaceId, root: item.root })) }), 'utf8');
  await writeFile(targetsPath, JSON.stringify(ordered.slice(1).map((item) => ({ workspaceId: item.workspaceId, path: item.workspaceTargetPath }))), 'utf8');
  const selector = `${primaryRoute.workspaceId}:${primaryRoute.path}`;
  const args = [primary.root, '--handoff', primaryRoute.path, '--route', selector, '--workspace-id', primary.workspaceId, '--workspace-target', primary.workspaceTargetPath, '--workspace-roots', descriptorsPath, '--workspace-targets', targetsPath, '--tooling-bootstrap', 'embedded'];
  if (!packageParentPath) {
    // A fresh Handoff carrier is a Major/root carrier in shared Core. The canonical
    // bootstrap runtime carries a Tiinex-foundation fallback profile, which is not
    // operator policy for an arbitrary VS Code Workspace. Bind the operator's exact
    // Outgoing Workspace selection explicitly instead of inheriting that unrelated
    // runtime fallback. This does not weaken Major closure: every selected Workspace
    // remains required as a complete replacement-capable snapshot.
    const workspaceIds = [...new Set(selected.map((item) => String(item.workspaceId || '').trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b));
    if (!workspaceIds.length) throw new Error('tiinex.package-builder.root-carrier-profile-workspaces-empty');
    const profilePath = path.join(scratch, 'carrier-profile.json');
    await writeFile(profilePath, JSON.stringify({
      id: 'tiinex-vscode-explicit-outgoing-workspaces-v1',
      requiredMajorWorkspaceIds: workspaceIds,
      source: 'explicit-vscode-outgoing-workspace-selection'
    }), 'utf8');
    args.push('--carrier-profile', profilePath);
  }
  if (packageMajorReason && packageConsolidation) throw new Error('tiinex.package-builder.package-major-consolidation-conflict');
  const progressed = await appendHostCarrierProgressionArgs(args, scratch, {
    packageParentPath,
    packageMajorReason,
    carrierPrefix,
    existingFilenames,
    prefixPolicy: 'always',
    rootPolicy: 'implicit-root'
  });
  args.splice(0, args.length, ...progressed);
  if (packageConsolidation) {
    if (!packageParentPath) throw new Error('tiinex.package-builder.package-consolidation-parent-required');
    args.push('--package-consolidation');
  } else {
    if (packageParentRoutePointer) args.push('--package-parent-route-pointer', packageParentRoutePointer);
    if (packageParentRouteId) args.push('--package-parent-route-id', packageParentRouteId);
  }
  if (String(projectedFilename || '').trim()) args.push('--projected-filename', checkedCarrierFilename(String(projectedFilename || '').trim()));
  if (Object.keys(materialBindings).length) {
    const bindingsPath = path.join(scratch, 'material-bindings.json');
    await writeFile(bindingsPath, JSON.stringify(materialBindings), 'utf8');
    args.push('--material-bindings', bindingsPath);
  }
  if (routes.length > 1 || routes.some((item) => item.participantRoles.length || item.endpointRoles.length)) {
    const routesPath = path.join(scratch, 'workspace-routes.json');
    await writeFile(routesPath, JSON.stringify({ routes: routes.map(({ route, participantRoles, endpointRoles }) => ({
      workspaceId: route.workspaceId,
      path: route.path,
      participantRoles: participantRoles.map((item) => ({ label: item.authoringLabel || item.label, workspaceId: item.workspaceId, path: item.path, reference: item.reference })),
      endpointRoles: endpointRoles.map((item) => ({ party: item.party, label: item.label, workspaceId: item.workspaceId, path: item.path, reference: item.reference }))
    })) }), 'utf8');
    args.push('--workspace-routes', routesPath);
  }
  return args;
}

async function prepareSelectedCoreManufactureRuntime(extensionPath: string, input: PackageBuildInput, scratch: string): Promise<Awaited<ReturnType<typeof prepareBundledRuntime>>> {
  const override = (input.workspaceSourceOverrides || []).find((item) => String(item.workspaceId || '').trim() === 'core');
  const incoming = (input.incomingWorkspaceSources || []).find((item) => String(item.workspaceId || '').trim() === 'core');
  if (override?.root && incoming?.packagePath) throw new Error('tiinex.package-builder.core-source-ambiguous');
  if (override?.root) return prepareSelectedHostCoreRuntime(extensionPath, String(override.root), openWorkspaceRoots(), nodeExecutable());
  if (incoming?.packagePath && incoming?.archivePath) {
    const archive = await readExactZipEntryFromFile(path.resolve(incoming.packagePath), String(incoming.archivePath));
    const root = path.join(scratch, 'selected-core-runtime');
    await mkdir(root, { recursive: true });
    await extractZipBuffer(archive, root);
    return prepareSelectedHostCoreRuntime(extensionPath, root, openWorkspaceRoots(), nodeExecutable());
  }
  return prepareHostCoreRuntime(extensionPath, openWorkspaceRoots(), nodeExecutable());
}

function participantProjectionFromCoreResult(projection: any): PackageParticipantProjection {
  const findings = (Array.isArray(projection?.findings) ? projection.findings : []).map((item: any) => ({
    severity: String(item?.severity || ''), code: String(item?.code || ''), message: String(item?.message || '')
  }));
  if (projection?.status !== 'ready' || projection?.participantAuthority?.state === 'blocked') {
    return { state: 'blocked', roles: [], detail: presentActionableFindings(projection?.findings || [], projection?.status || 'blocked'), findings };
  }
  const roles = (projection?.participantAuthority?.participants || []).map((item: any) => ({
    label: String(item?.label || '').trim(),
    authoringLabel: String(item?.authoringLabel || item?.label || '').trim() || undefined,
    reference: String(item?.reference || '').trim(), workspaceId: String(item?.workspaceId || '').trim(), path: String(item?.path || '').trim()
  }));
  if (roles.some((item: PackageParticipantRole) => !item.label || !item.reference || !item.workspaceId || !item.path)) {
    return { state: 'blocked', roles: [], detail: 'Core participant projection was incomplete.', findings };
  }
  if (!roles.length) return { state: 'not-established', roles: [], detail: 'Core did not establish any additional semantic participant Role for this current work.', findings };
  return { state: 'qualified', roles, detail: `${roles.length} Core-qualified semantic participant Role${roles.length === 1 ? '' : 's'}.`, findings };
}

async function projectExactRouteParticipants(
  runtime: Awaited<ReturnType<typeof prepareBundledRuntime>>,
  selectedSources: WorkspaceSource[],
  route: RouteChoice,
  participantRoles: PackageParticipantRole[],
  scratch: string,
  input: PackageBuildInput,
  materialBindings: Record<string, MaterialBinding> = {}
): Promise<PackageParticipantProjection> {
  const args = await handoffArgs(
    selectedSources,
    route,
    [{ route, participantRoles, endpointRoles: [] }],
    scratch,
    String(input.packageParentPath || ''),
    String(input.packageMajorReason || '').trim(),
    String(input.packageParentRoutePointer || ''),
    String(input.packageParentRouteId || ''),
    input.packageConsolidation === true,
    String(input.carrierPrefix || '').trim(),
    materialBindings
  );
  return participantProjectionFromCoreResult(await projectHandoffParticipants(runtime, args));
}

export async function projectHandoffPackageParticipants(extensionPath: string, input: PackageBuildInput): Promise<PackageParticipantProjection> {
  const scratch = await mkdtemp(path.join(os.tmpdir(), 'tiinex-vscode-participant-projection-'));
  let runtime: Awaited<ReturnType<typeof prepareBundledRuntime>> | null = null;
  try {
    reportProgress(input, 'Preparing qualified Core runtime…');
    runtime = await prepareSelectedCoreManufactureRuntime(extensionPath, input, scratch);
    const route = routeChoiceFromKey(input.routeId);
    if (route.pointerless || !route.workspaceId || !route.path) {
      return { state: 'not-established', roles: [], detail: 'Pointerless Workspace transport has no Handoff participant projection.', findings: [] };
    }
    reportProgress(input, 'Qualifying selected Workspace sources…');
    const incomingSources = await qualifyIncomingWorkspaceSources(runtime, scratch, input.incomingWorkspaceSources || []);
    const overrideSources = await qualifyWorkspaceSourceOverrides(runtime, input.workspaceSourceOverrides || []);
    const discoverySources = await qualifyWorkspaceSourceOverrides(runtime, input.discoveryWorkspaceSourceOverrides || []);
    const sourceById = new Map<string, WorkspaceSource>();
    for (const item of incomingSources) sourceById.set(item.workspaceId, item);
    for (const item of overrideSources) sourceById.set(item.workspaceId, item);
    const requestedWorkspaceIds = [...new Set(input.workspaceIds.map((item) => String(item || '').trim()).filter(Boolean))].sort();
    const selectedSources = requestedWorkspaceIds.map((workspaceId) => sourceById.get(workspaceId)).filter((item): item is WorkspaceSource => Boolean(item));
    const selectedIds = new Set(selectedSources.map((item) => item.workspaceId));
    const missingWorkspaceIds = requestedWorkspaceIds.filter((item) => !selectedIds.has(item));
    if (missingWorkspaceIds.length && !input.packageParentPath) throw new Error(`tiinex.package-builder.workspace-id-unresolved:${missingWorkspaceIds.join(',')}`);
    if (!selectedSources.length) throw new Error('tiinex.package-builder.no-local-workspace-source');
    if (!selectedSources.some((item) => item.workspaceId === route.workspaceId) && !input.packageParentPath) throw new Error(`tiinex.package-builder.route-workspace-not-selected:${route.workspaceId}`);
    const selectedRouteInput = (input.routeInputs || []).find((item) => item.routeId === input.routeId);
    const materialBindings = await materialBindingsForDiscoverySources(runtime, selectedSources, discoverySources);
    reportProgress(input, 'Projecting Core-qualified participant authority…');
    return await projectExactRouteParticipants(runtime, selectedSources, route, selectedRouteInput?.participantRoles || [], scratch, input, materialBindings);
  } catch (error) {
    return { state: 'blocked', roles: [], findings: [], detail: String(error instanceof Error ? error.message : error) };
  } finally {
    await cleanupScratch(scratch);
    if (runtime) await runtime.dispose();
  }
}

export async function buildHandoffPackageFromForm(extensionPath: string, input: PackageBuildInput): Promise<PackageBuildResult> {
  const scratch = await mkdtemp(path.join(os.tmpdir(), 'tiinex-vscode-package-builder-'));
  // Manufacture must execute the exact explicitly selected Core source, whether
  // that source is Local or carried by an Incoming package. Core deliberately
  // fails closed when runtime bytes differ from the carried Core source; the host
  // must bind the selected source instead of weakening that gate.
  let runtime: Awaited<ReturnType<typeof prepareBundledRuntime>> | null = null;
  try {
    reportProgress(input, 'Preparing qualified Core runtime…');
    runtime = await prepareSelectedCoreManufactureRuntime(extensionPath, input, scratch);
    reportProgress(input, 'Qualifying selected Workspace sources…');
    const incomingSources = await qualifyIncomingWorkspaceSources(runtime, scratch, input.incomingWorkspaceSources || []);
    const overrideSources = await qualifyWorkspaceSourceOverrides(runtime, input.workspaceSourceOverrides || []);
    const discoverySources = await qualifyWorkspaceSourceOverrides(runtime, input.discoveryWorkspaceSourceOverrides || []);
    const requestedWorkspaceIds = [...new Set(input.workspaceIds.map((item) => String(item || '').trim()).filter(Boolean))].sort();
    const explicitSourceById = new Map<string, WorkspaceSource>();
    for (const item of incomingSources) explicitSourceById.set(item.workspaceId, item);
    for (const item of overrideSources) explicitSourceById.set(item.workspaceId, item);
    const unresolvedExplicitIds = requestedWorkspaceIds.filter((workspaceId) => !explicitSourceById.has(workspaceId));
    // Normal VS Code Outgoing supplies exact selected roots. Avoid a second
    // repository-wide operator-context scan when those exact sources already
    // close the request; retain the shared fallback only for legacy callers.
    const current = unresolvedExplicitIds.length
      ? await loadModelWithRuntime(runtime)
      : { sources: [] as WorkspaceSource[], routes: [] as RouteChoice[] };
    const sourceById = new Map<string, WorkspaceSource>(current.sources.map((item) => [item.workspaceId, item]));
    for (const [workspaceId, item] of explicitSourceById) sourceById.set(workspaceId, item);
    const requestedRouteShape = routeChoiceFromKey(input.routeId);
    const requestedRouteInputs = input.routeInputs?.length ? input.routeInputs : [{ routeId: input.routeId }];
    const requestedRouteWorkspaceIds = new Set(
      requestedRouteInputs
        .map((item) => routeChoiceFromKey(item.routeId))
        .filter((item) => !item.pointerless && item.workspaceId)
        .map((item) => String(item.workspaceId))
    );
    if (!requestedRouteShape.pointerless && requestedRouteShape.workspaceId) requestedRouteWorkspaceIds.add(String(requestedRouteShape.workspaceId));
    const routeSources = [...incomingSources, ...overrideSources].filter((source) => requestedRouteWorkspaceIds.has(source.workspaceId));
    const sourceRoutes = requestedRouteShape.pointerless
      ? []
      : await (async () => {
          reportProgress(input, 'Qualifying selected Handoff route Workspaces…');
          return handoffRouteChoicesForSources(runtime, routeSources);
        })();
    const pointerlessRoute: RouteChoice = { id: routeChoiceKey({ pointerless: true }), pointerless: true, label: 'No Handoff pointer', description: 'Workspace transport only — no Handoff semantics' };
    const routeMap = new Map<string, RouteChoice>([[pointerlessRoute.id, pointerlessRoute]]);
    for (const item of [...current.routes, ...sourceRoutes]) routeMap.set(item.id, item);
    const availableRoutes = [...routeMap.values()];
    const route = exactRouteByKey(availableRoutes, input.routeId);
    const uniqueRouteInputs = new Map<string, PackageRouteInput>();
    for (const item of requestedRouteInputs) uniqueRouteInputs.set(item.routeId, item);
    if (!uniqueRouteInputs.has(input.routeId)) uniqueRouteInputs.set(input.routeId, { routeId: input.routeId });
    const routeInputs = [...uniqueRouteInputs.values()].map((item) => ({ route: exactRouteByKey(availableRoutes, item.routeId), participantRoles: item.participantRoles || [], endpointRoles: item.endpointRoles || [] }));
    const selectedSources = requestedWorkspaceIds.map((workspaceId) => sourceById.get(workspaceId)).filter((item): item is WorkspaceSource => Boolean(item));
    const selectedIds = new Set(selectedSources.map((item) => item.workspaceId));
    const missingWorkspaceIds = requestedWorkspaceIds.filter((item) => !selectedIds.has(item));
    if (missingWorkspaceIds.length && !input.packageParentPath) throw new Error(`tiinex.package-builder.workspace-id-unresolved:${missingWorkspaceIds.join(',')}`);
    if (!selectedSources.length) throw new Error('tiinex.package-builder.no-local-workspace-source');
    const materialBindings = await materialBindingsForDiscoverySources(runtime, selectedSources, discoverySources);
    if (route.pointerless) {
      const existingCarrierNames = input.outputDirectory ? await existingCarrierFilenames(String(input.outputDirectory)) : [];
      const args = await workspaceCarrierArgs(selectedSources, scratch, String(input.expectedCarrierFilename || ''), String(input.packageParentPath || ''), String(input.packageMajorReason || '').trim(), String(input.carrierPrefix || '').trim(), existingCarrierNames);
      // Manufacture once into a disposable stage. The returned Core receipt plus
      // physical bytes are the exact qualification boundary; a separate dry-run
      // preview duplicated the same expensive Core work without adding authority.
      const folder = await outputDirectory(input, 'Select Tiinex outgoing folder');
      const stage = path.join(scratch, 'manufactured');
      reportProgress(input, 'Manufacturing and qualifying carrier…');
      const built = await manufactureHandoffPackage(runtime, [...args, '--output-dir', stage]);
      if (built.status !== 'ready' || !built.primaryOutput?.path || built?.carrierProjection?.mode !== 'workspace' || (built?.carrierProjection?.routes || []).length !== 0) throw new Error(`tiinex.package-builder.workspace-manufacture-blocked:\n${receiptBlocker(built)}`);
      assertExpectedCarrierDimension(built, String(input.expectedCarrierDimension || ''));
      assertExpectedCarrierFilename(built, String(input.expectedCarrierFilename || ''));
      assertExactWorkspaceSelection(built, requestedWorkspaceIds);
      const coreFilename = checkedCarrierFilename(String(built.humanOutput?.primary?.filename || ''));
      if (path.basename(built.primaryOutput.path) !== coreFilename || path.resolve(path.dirname(built.primaryOutput.path)) !== path.resolve(stage)) throw new Error('tiinex.package-builder.output-path-mismatch');
      const routingText = String(built?.humanOutput?.normalInlineRouting?.content || '').trim();
      if (!routingText) throw new Error('tiinex.package-builder.workspace-transport-text-missing');
      reportProgress(input, 'Projecting destination filename through Core…');
      const filename = await destinationCarrierFilename(runtime, built.primaryOutput.path, folder, coreFilename);
      reportProgress(input, 'Publishing carrier…');
      const outputPath = await publishCarrierFile(built.primaryOutput.path, folder, filename);
      return { outputPath, routingText, routeRoutingTexts: [], autoCopiedTransportText: false, routeId: route.id, routeIds: [route.id], workspaceIds: selectedSources.map((item) => item.workspaceId) };
    }
    if (!route.workspaceId || !selectedSources.some((item) => item.workspaceId === route.workspaceId)) throw new Error('tiinex.package-builder.route-workspace-not-selected');
    for (const item of routeInputs) {
      if (item.route.pointerless || !item.route.workspaceId || !item.route.path) throw new Error('tiinex.package-builder.handoff-route-required');
      if (!selectedSources.some((source) => source.workspaceId === item.route.workspaceId) && !input.packageParentPath) throw new Error(`tiinex.package-builder.route-workspace-not-selected:${item.route.workspaceId}`);
    }
    // Explicit participant choices are operator input; the semantic participant set
    // is Core output. Re-project every attached route immediately before manufacture
    // and replace any stale controller snapshot with the exact current Core-qualified set.
    const qualifiedRouteInputs: Array<{ route: RouteChoice; participantRoles: PackageParticipantRole[]; endpointRoles: PackageEndpointRoleBinding[] }> = [];
    for (const item of routeInputs) {
      reportProgress(input, `Requalifying Core participants for ${item.route.label || item.route.path || item.route.id}…`);
      const participantProjection = await projectExactRouteParticipants(runtime, selectedSources, item.route, item.participantRoles, scratch, input, materialBindings);
      if (participantProjection.state === 'blocked') throw new Error(`tiinex.package-builder.participant-projection-blocked:${item.route.id}:
${participantProjection.detail}`);
      qualifiedRouteInputs.push({ route: item.route, participantRoles: [...participantProjection.roles], endpointRoles: item.endpointRoles });
    }
    const args = await handoffArgs(selectedSources, route, qualifiedRouteInputs, scratch, String(input.packageParentPath || ''), String(input.packageMajorReason || '').trim(), String(input.packageParentRoutePointer || ''), String(input.packageParentRouteId || ''), input.packageConsolidation === true, String(input.carrierPrefix || '').trim(), materialBindings, String(input.expectedCarrierFilename || '').trim(), input.outputDirectory ? await existingCarrierFilenames(String(input.outputDirectory)) : []);
    // Core owns routed Handoff bytes plus continuation/allocation truth. The host
    // only consumes and cross-checks the returned allocation/lineage projection.
    // Destination existence is a host fact; Core projects any transport-only collision name.
    reportProgress(input, 'Running Core route/allocation preflight and package preview…');
    const topologyPreview = await manufactureHandoffPackage(runtime, args);
    if (topologyPreview.status !== 'ready' || topologyPreview.transportExecutable === false) throw new Error(`tiinex.package-builder.preview-blocked:\n${receiptBlocker(topologyPreview)}`);
    assertExactWorkspaceSelection(topologyPreview, requestedWorkspaceIds);
    if (input.packageParentPath && !input.packageMajorReason) qualifiedCarrierAllocationFromManufactureReceipt(topologyPreview);

    // VS Code's route key is host UI state, not a Core transport selector. For a
    // multi-route carrier Core deliberately returns selection-required until one
    // exact qualified route is selected for human presentation. Resolve that
    // selector only from Core's own route projection; never reconstruct a Core id.
    let manufactureArgs = args;
    if (!humanOutputMatchesRoute(topologyPreview, route)) {
      const coreRouteSelector = qualifiedCoreRouteSelector(topologyPreview, route);
      manufactureArgs = withCoreRouteSelector(args, coreRouteSelector);
    }
    const folder = await outputDirectory(input, 'Select Tiinex outgoing folder');
    const stage = path.join(scratch, 'manufactured');
    // The topology pass is required to consume Core's exact route selector and
    // continuation allocation. Once that selector is known, manufacture directly
    // into the disposable stage and validate that exact finished receipt instead
    // of paying for a second route-selected dry run plus the real manufacture.
    reportProgress(input, 'Manufacturing and requalifying finished carrier…');
    const built = await manufactureHandoffPackage(runtime, [...manufactureArgs, '--output-dir', stage]);
    if (built.status !== 'ready' || !built.primaryOutput?.path || !humanOutputMatchesRoute(built, route)) throw new Error(`tiinex.package-builder.manufacture-blocked:
${receiptBlocker(built)}`);
    assertExactWorkspaceSelection(built, requestedWorkspaceIds);
    if (input.packageParentPath && !input.packageMajorReason) assertStableQualifiedCarrierAllocation(topologyPreview, built);
    assertExpectedCarrierFilename(built, String(input.expectedCarrierFilename || ''));
    const coreFilename = qualifiedCoreCarrierFilename(built);
    const routing = String(built?.humanOutput?.normalInlineRouting?.content || '').trim();
    if (!routing) throw new Error('tiinex.package-builder.routing-text-missing');
    const routeTexts = routeRoutingTexts(built, routeInputs, routing);
    if (routeTexts.length !== routeInputs.length) throw new Error('tiinex.package-builder.routing-text-route-count-mismatch');
    const builtCoreFilename = checkedCarrierFilename(String(built.humanOutput?.primary?.filename || ''));
    if (path.basename(built.primaryOutput.path) !== builtCoreFilename || path.resolve(path.dirname(built.primaryOutput.path)) !== path.resolve(stage)) throw new Error('tiinex.package-builder.output-path-mismatch');
    reportProgress(input, 'Projecting destination filename through Core…');
    const filename = await destinationCarrierFilename(runtime, built.primaryOutput.path, folder, coreFilename);
    reportProgress(input, 'Publishing qualified carrier…');
    const outputPath = await publishCarrierFile(built.primaryOutput.path, folder, filename);
    const autoCopied = routeTexts.length === 1;
    if (autoCopied) await vscode.env.clipboard.writeText(routeTexts[0].text);
    return { outputPath, routingText: autoCopied ? routeTexts[0].text : '', routeRoutingTexts: routeTexts, autoCopiedTransportText: autoCopied, routeId: route.id, routeIds: routeInputs.map((item) => item.route.id), workspaceIds: selectedSources.map((item) => item.workspaceId) };
  } finally { await cleanupScratch(scratch); if (runtime) await runtime.dispose(); }
}
