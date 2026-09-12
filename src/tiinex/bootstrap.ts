import { qualifyInstalledCore } from '../host/corePackageBinding';
import os from 'node:os';
import path from 'node:path';
import { mkdir, mkdtemp, rm, writeFile, access, readFile } from 'node:fs/promises';
import { extractZipBuffer, readExactZipEntryFromFile, sha256Hex } from '../host/zip';
import { nodeProcessEnvironment, ProcessRunner, runChecked, runProcess } from '../host/process';
import { preferredNodeExecutable } from '../host/nodeExecutable';
import { LandingPlan, OrientResult } from './types';

const START_ENTRY = '001-1-READ-BEFORE-PROCEEDING.trace.md';
const DEFAULT_ENTRYPOINT = 'runtime/tools/tiinex-portable.mjs';

export interface PackageRuntime {
  root: string;
  entrypoint: string;
  nodeExecutable: string;
  dispose(): Promise<void>;
}

interface BootstrapDescriptor { packagePath: string; bytes: number; sha256: string; entrypoint: string }

function markdownLinkTarget(markdown: string, label: RegExp): string {
  const lines = markdown.split(/\r?\n/);
  for (const line of lines) {
    if (!label.test(line)) continue;
    const match = line.match(/\[[^\]]+\]\(([^)]+)\)/);
    if (match) return match[1].trim();
  }
  return '';
}

function firstMatch(markdown: string, patterns: RegExp[]): string {
  for (const pattern of patterns) {
    const match = markdown.match(pattern);
    if (match?.[1]) return match[1].trim();
  }
  return '';
}

export function parseBootstrapDescriptor(startMarkdown: string, bootstrapTraceMarkdown: string): BootstrapDescriptor {
  const tracePath = markdownLinkTarget(startMarkdown, /portable tooling bootstrap|bootstrap payload trace/i) || firstMatch(startMarkdown, [/Bootstrap Payload Trace\s*:\s*`?([^`\s]+)`?/i]);
  if (!tracePath) throw new Error('tiinex.bootstrap.trace-path-missing');
  const packagePath = markdownLinkTarget(bootstrapTraceMarkdown, /bootstrap payload|location/i) || firstMatch(bootstrapTraceMarkdown, [/(?:Payload|Location|Bootstrap Payload)\s*:\s*`?([^`\s]+\.zip)`?/i]);
  const bytesText = firstMatch(bootstrapTraceMarkdown, [/(?:Byte Size|Bytes)\s*:\s*`?([0-9]+)`?/i]);
  const sha256 = firstMatch(bootstrapTraceMarkdown, [/(?:Integrity Value|SHA-?256)\s*:\s*`?([a-f0-9]{64})`?/i]).toLowerCase();
  const entrypoint = firstMatch(startMarkdown, [/(?:Bootstrap Entrypoint|Tooling Entrypoint)\s*:\s*`?([^`\s]+\.mjs)`?/i]) || DEFAULT_ENTRYPOINT;
  const bytes = Number(bytesText);
  if (!packagePath || !Number.isSafeInteger(bytes) || bytes <= 0 || !/^[a-f0-9]{64}$/.test(sha256)) throw new Error('tiinex.bootstrap.descriptor-invalid');
  return { packagePath, bytes, sha256, entrypoint };
}

export async function preparePackageRuntime(packagePath: string, nodeExecutable = preferredNodeExecutable()): Promise<PackageRuntime> {
  const start = (await readExactZipEntryFromFile(packagePath, START_ENTRY)).toString('utf8');
  const tracePath = markdownLinkTarget(start, /portable tooling bootstrap|bootstrap payload trace/i) || firstMatch(start, [/Bootstrap Payload Trace\s*:\s*`?([^`\s]+)`?/i]);
  if (!tracePath) throw new Error('tiinex.bootstrap.trace-path-missing');
  const trace = (await readExactZipEntryFromFile(packagePath, tracePath)).toString('utf8');
  const descriptor = parseBootstrapDescriptor(start, trace);
  const payload = await readExactZipEntryFromFile(packagePath, descriptor.packagePath);
  if (payload.byteLength !== descriptor.bytes) throw new Error(`tiinex.bootstrap.byte-size-mismatch:${payload.byteLength}:${descriptor.bytes}`);
  if (sha256Hex(payload) !== descriptor.sha256) throw new Error('tiinex.bootstrap.sha256-mismatch');
  const root = await mkdtemp(path.join(os.tmpdir(), 'tiinex-vscode-bootstrap-'));
  try {
    await extractZipBuffer(payload, root);
    const entrypoint = path.resolve(root, ...descriptor.entrypoint.replace(/\\/g, '/').split('/'));
    const rel = path.relative(root, entrypoint);
    if (!rel || rel.startsWith(`..${path.sep}`) || path.isAbsolute(rel)) throw new Error('tiinex.bootstrap.entrypoint-outside-runtime');
    await access(entrypoint);
    return { root, entrypoint, nodeExecutable, dispose: () => rm(root, { recursive: true, force: true }) };
  } catch (error) {
    await rm(root, { recursive: true, force: true });
    throw error;
  }
}


export async function prepareBundledRuntime(extensionPath: string, nodeExecutable = preferredNodeExecutable()): Promise<PackageRuntime> {
  const binding = await qualifyInstalledCore(extensionPath);
  return { root: binding.root, entrypoint: binding.entrypoint, nodeExecutable, dispose: async () => undefined };
}

function messageOf(error: unknown): string { return error instanceof Error ? error.message : String(error); }

export async function runTiinexJson<T>(runtime: PackageRuntime, args: string[], runner: ProcessRunner = runProcess): Promise<T> {
  const commandArgs = [runtime.entrypoint, ...args];
  const result = await runner(runtime.nodeExecutable, commandArgs, { env: nodeProcessEnvironment() });
  const text = result.stdout.trim();

  // Portable Tooling deliberately uses non-zero exit codes when a valid machine
  // receipt contains qualification errors. Preserve that structured receipt so
  // the host can surface the real fail-closed reason instead of degrading it to
  // a generic child-process failure. Only execution failures without valid JSON
  // are process failures.
  if (text) {
    try { return JSON.parse(text) as T; }
    catch {
      if (result.code !== 0) throw new Error(`tiinex.process.failed:${runtime.nodeExecutable}:${commandArgs.join(' ')}:${result.stderr.trim() || text.slice(0, 200) || result.code}`);
      throw new Error(`tiinex.bootstrap.invalid-json:${text.slice(0, 200)}`);
    }
  }
  if (result.code !== 0) throw new Error(`tiinex.process.failed:${runtime.nodeExecutable}:${commandArgs.join(' ')}:${result.stderr.trim() || result.code}`);
  throw new Error('tiinex.bootstrap.empty-output');
}

export async function orientPackage(runtime: PackageRuntime, packagePath: string, runner: ProcessRunner = runProcess): Promise<OrientResult> {
  const result = await runTiinexJson<OrientResult>(runtime, ['orient-handoff-package', packagePath, '--full'], runner);
  if (String(result.status || '').toLowerCase() !== 'ready') throw new Error(`tiinex.package.not-ready:${String(result.status || 'unknown')}`);
  return result;
}

export interface GroundingResult {
  status: string;
  readiness?: { state?: string };
  authority?: { route?: { id?: string; pointerPath?: string; workspaceId?: string } };
  currentWork?: { frontier?: Array<{ id?: string; path?: string; title?: string; declaredStatus?: string }> };
  requiredContext?: { declared?: number; matchedInWorkspaceSnapshots?: number; items?: unknown[] };
  findings?: Array<{ severity?: string; code?: string; message?: string }>;
  [key: string]: unknown;
}

export async function groundPackageForReview(runtime: PackageRuntime, packagePath: string, routePointerPath: string, runner: ProcessRunner = runProcess): Promise<GroundingResult> {
  const route = String(routePointerPath || '').trim();
  if (!route) throw new Error('tiinex.ground.route-required');
  const result = await runTiinexJson<GroundingResult>(runtime, ['ground', packagePath, '--route', route, '--include-current-work'], runner);
  if (String(result.status || '').toLowerCase() !== 'ready') throw new Error(`tiinex.ground.not-ready:${String(result.status || 'unknown')}`);
  return result;
}

export async function projectWorkspaceLanding(
  runtime: PackageRuntime,
  packagePath: string,
  repositories: unknown,
  selections: Record<string, string> = {},
  workspaceIds: string[] = [],
  runner: ProcessRunner = runProcess
): Promise<LandingPlan> {
  const scratch = await mkdtemp(path.join(os.tmpdir(), 'tiinex-vscode-plan-'));
  try {
    const descriptorPath = path.join(scratch, 'repositories.json');
    await writeFile(descriptorPath, JSON.stringify(repositories), 'utf8');
    const args = ['project-workspace-landing', packagePath, '--repositories', descriptorPath];
    if (Object.keys(selections).length) {
      const selectionsPath = path.join(scratch, 'selections.json');
      await writeFile(selectionsPath, JSON.stringify(selections), 'utf8');
      args.push('--selections', selectionsPath);
    }
    if (workspaceIds.length) args.push('--workspaces', workspaceIds.join(','));
    args.push('--compact');
    return await runTiinexJson<LandingPlan>(runtime, args, runner);
  } finally {
    await rm(scratch, { recursive: true, force: true });
  }
}

export interface SourceFrontierComparisonResult {
  status: string;
  state: string;
  mode: string;
  workspaces: Array<{
    workspaceId: string;
    state: string;
    delta?: {
      counts?: { added?: number; removed?: number; byteChanged?: number; total?: number };
      added?: string[];
      removed?: string[];
      byteChanged?: string[];
      omitted?: number;
    } | null;
  }>;
  counts?: {
    exact?: number;
    changed?: number;
    onlyLeft?: number;
    onlyRight?: number;
    locked?: number;
    unavailable?: number;
    qualificationError?: number;
    workspaces?: number;
    pathChanges?: number;
  };
  findingSummary?: { status?: string; counts?: { error?: number; warning?: number; info?: number; total?: number } };
  actionableFindings?: Array<{ severity?: string; code?: string; message?: string }>;
  boundary?: string;
}

export async function compareIncomingWorkspaceToLocal(
  runtime: PackageRuntime,
  packagePath: string,
  localRoot: string,
  workspaceId: string,
  runner: ProcessRunner = runProcess
): Promise<SourceFrontierComparisonResult> {
  const id = String(workspaceId || '').trim();
  if (!packagePath || !localRoot || !id) throw new Error('tiinex.source-frontier.compare-input-required');
  const result = await runTiinexJson<SourceFrontierComparisonResult>(runtime, [
    'compare-source-frontiers',
    '--left-kind', 'local-workspace',
    '--left', localRoot,
    '--left-id', id,
    '--right-kind', 'handoff-package',
    '--right', packagePath,
    '--right-select', id
  ], runner);
  if (String(result.status || '').toLowerCase() !== 'ready') {
    const finding = (result.actionableFindings || [])[0];
    throw new Error(`tiinex.source-frontier.compare-blocked:${finding?.code || result.state || 'unknown'}`);
  }
  if (!(result.workspaces || []).some((item) => item.workspaceId === id)) {
    throw new Error(`tiinex.source-frontier.workspace-missing:${id}`);
  }
  return result;
}

export interface EditorAssistanceResult {
  status: string;
  documents: Array<{
    path: string;
    schemaId: string;
    validator: { state: string; authorityState?: string; authorityBasis?: string; authorityFindings?: string[] };
    diagnostics: Array<{ severity: string; code: string; message: string; line: number | null; locationState: string; locationBasis: string }>;
    actions: Array<{ id: string; title: string; kind: string; qualification: string; sourceSha256: string; replacementMarkdown: string; diagnosticCodes?: string[] }>;
  }>;
}
export interface HandoffLeafCandidate { path: string; title: string; from: string; to: string; purpose: string; qualification: string; leaf?: boolean }
export interface HandoffLeavesResult {
  status: string;
  candidates?: HandoffLeafCandidate[];
  leaves: HandoffLeafCandidate[];
  pointerless: { selectionLabel: string; packageRole: string; manufactureState: string; blockerCode: string; consequence: string };
}

export async function projectEditorAssistance(runtime: PackageRuntime, materialRoot: string, focusPath: string, runner: ProcessRunner = runProcess): Promise<EditorAssistanceResult> {
  if (!materialRoot || !focusPath) throw new Error('tiinex.editor-assistance.material-root-or-focus-missing');
  return runTiinexJson<EditorAssistanceResult>(runtime, ['project-editor-assistance', materialRoot, '--focus', focusPath, '--compact'], runner);
}

export async function projectEditorAssistanceText(runtime: PackageRuntime, materialRoot: string, focusPath: string, markdown: string, runner: ProcessRunner = runProcess): Promise<EditorAssistanceResult> {
  const scratch = await mkdtemp(path.join(os.tmpdir(), 'tiinex-vscode-editor-'));
  const overlay = path.join(scratch, 'overlay.md');
  try {
    await writeFile(overlay, String(markdown ?? ''), 'utf8');
    return await runTiinexJson<EditorAssistanceResult>(runtime, ['project-editor-assistance', materialRoot, '--focus', focusPath, '--overlay', overlay, '--compact'], runner);
  } finally {
    await rm(scratch, { recursive: true, force: true });
  }
}

export async function projectHandoffLeaves(runtime: PackageRuntime, roots: string[], runner: ProcessRunner = runProcess): Promise<HandoffLeavesResult> {
  if (!roots.length) throw new Error('tiinex.handoff-leaves.workspace-required');
  return runTiinexJson<HandoffLeavesResult>(runtime, ['project-handoff-leaves', ...roots, '--compact'], runner);
}

export async function projectAuthoringParent(runtime: PackageRuntime, parentPath: string, runner: ProcessRunner = runProcess): Promise<any> {
  const result = await runTiinexJson<any>(runtime, ['project-authoring-parent', parentPath, '--compact'], runner);
  if (result.status !== 'ready' || !result.parentRecord) throw new Error(`tiinex.authoring.parent-blocked:${result.status || 'unknown'}`);
  return result.parentRecord;
}

export interface WorkspacePackageSourcesResult {
  status: string;
  candidates: Array<{ workspaceId: string; workspaceTargetPath: string; title: string; qualification: string; repository: string; repositoryIdentity: string; ref: string; rootPath: string; sourceKind: string; localRepository?: { id: string; root: string; repository: string; repositoryIdentity: string; branch: string; clean: boolean } | null }>;
  findings?: Array<{ severity: string; code: string; message: string }>;
}

export interface OperatorContextResult {
  status: string;
  roots: Array<{ id: string; root: string; repository?: unknown; workspaces?: unknown[] }>;
  workspaces: Array<WorkspacePackageSourcesResult['candidates'][number] & { hostRootId?: string; hostRoot?: string; handoffLeaves?: unknown[]; endpoints?: unknown[] }>;
  handoffLeaves: Array<HandoffLeavesResult['leaves'][number] & { workspaceId: string; hostRootId?: string; hostRoot?: string }>;
  endpoints: HandoffEndpointProjectionResult['candidates'];
  pointerless?: { selectionLabel?: string; consequence?: string };
  findings?: Array<{ severity: string; code: string; message: string }>;
}

export interface StagedValidationResult {
  status: string;
  state: string;
  stagedPaths: string[];
  stagedTiinexPaths: string[];
  ignoredStagedPaths: string[];
  closurePaths: string[];
  findings: Array<{ severity: string; code: string; message: string; context?: unknown }>;
  blockingFindingCount: number;
}

export async function projectWorkspacePackageSources(runtime: PackageRuntime, roots: string[], repositories: unknown = null, runner: ProcessRunner = runProcess): Promise<WorkspacePackageSourcesResult> {
  if (!roots.length) throw new Error('tiinex.workspace-package-sources.workspace-required');
  if (typeof repositories === 'function') { runner = repositories as ProcessRunner; repositories = null; }
  if (!repositories) return runTiinexJson<WorkspacePackageSourcesResult>(runtime, ['project-workspace-package-sources', ...roots, '--compact'], runner);
  const scratch = await mkdtemp(path.join(os.tmpdir(), 'tiinex-vscode-workspace-sources-'));
  try {
    const repositoriesPath = path.join(scratch, 'repositories.json');
    await writeFile(repositoriesPath, JSON.stringify(repositories), 'utf8');
    return await runTiinexJson<WorkspacePackageSourcesResult>(runtime, ['project-workspace-package-sources', ...roots, '--repositories', repositoriesPath, '--compact'], runner);
  } finally { await rm(scratch, { recursive: true, force: true }); }
}


export async function projectOperatorContext(runtime: PackageRuntime, roots: string[], repositories: unknown = null, runner: ProcessRunner = runProcess): Promise<OperatorContextResult> {
  if (!roots.length) throw new Error('tiinex.operator-context.workspace-required');
  const scratch = await mkdtemp(path.join(os.tmpdir(), 'tiinex-vscode-operator-context-'));
  try {
    const rootsPath = path.join(scratch, 'roots.json');
    await writeFile(rootsPath, JSON.stringify({ roots: roots.map((root) => ({ id: root, root })) }), 'utf8');
    const args = ['project-operator-context', ...roots, '--workspace-roots', rootsPath];
    if (repositories) {
      const repositoriesPath = path.join(scratch, 'repositories.json');
      await writeFile(repositoriesPath, JSON.stringify(repositories), 'utf8');
      args.push('--repositories', repositoriesPath);
    }
    args.push('--compact');
    return await runTiinexJson<OperatorContextResult>(runtime, args, runner);
  } finally {
    await rm(scratch, { recursive: true, force: true });
  }
}

export async function projectStagedValidation(runtime: PackageRuntime, root: string, stagedPaths: string[], runner: ProcessRunner = runProcess): Promise<StagedValidationResult> {
  if (!root) throw new Error('tiinex.staged-validation.root-required');
  const scratch = await mkdtemp(path.join(os.tmpdir(), 'tiinex-vscode-staged-validation-'));
  try {
    const stagedPath = path.join(scratch, 'staged.json');
    await writeFile(stagedPath, JSON.stringify({ stagedPaths }), 'utf8');
    return await runTiinexJson<StagedValidationResult>(runtime, ['project-staged-validation', root, '--staged', stagedPath, '--compact'], runner);
  } finally {
    await rm(scratch, { recursive: true, force: true });
  }
}

export interface HandoffEndpointProjectionResult {
  status: string;
  workspaceId: string;
  candidates: Array<{ id: string; target: string; reference: string; kind: 'role' | 'party'; label: string; workspaceId: string; artifactPath: string; schemaId: string; qualification: string }>;
  findings?: Array<{ severity: string; code: string; message: string }>;
}

export async function projectHandoffEndpoints(runtime: PackageRuntime, root: string, workspaceId: string, runner: ProcessRunner = runProcess): Promise<HandoffEndpointProjectionResult> {
  if (!root || !workspaceId) throw new Error('tiinex.handoff-endpoints.workspace-required');
  return runTiinexJson<HandoffEndpointProjectionResult>(runtime, ['project-handoff-endpoints', root, '--workspace-id', workspaceId, '--compact'], runner);
}

export interface ArtifactCreationContractResult {
  status?: string;
  contract: any;
  validation?: any;
  qualification?: string;
  findings?: Array<{ severity?: string; code?: string; message?: string }>;
}

export interface ArtifactSchemaGuideResult {
  status?: string;
  guide: any;
  findings?: Array<{ severity?: string; code?: string; message?: string }>;
}

export async function inspectArtifactCreationContract(runtime: PackageRuntime, schemaId: string, transitionType = 'create-artifact', runner: ProcessRunner = runProcess): Promise<ArtifactCreationContractResult> {
  if (!schemaId) throw new Error('tiinex.authoring.schema-required');
  return runTiinexJson<ArtifactCreationContractResult>(runtime, ['inspect-creation-contract', '--schema', schemaId, '--transition', transitionType, '--compact'], runner);
}

export async function projectArtifactSchemaGuide(runtime: PackageRuntime, schemaId: string, task: 'create' | 'continue' = 'create', runner: ProcessRunner = runProcess): Promise<ArtifactSchemaGuideResult> {
  if (!schemaId) throw new Error('tiinex.authoring.schema-required');
  return runTiinexJson<ArtifactSchemaGuideResult>(runtime, ['schema-guide', '--schema', schemaId, '--task', task, '--detail', 'compact', '--compact'], runner);
}

export interface ArtifactMaterializationSchemaCandidate {
  schemaId: string;
  label: string;
  role?: string;
  transitionType?: string;
  status?: string;
  binding?: unknown;
}

export interface ArtifactMaterializationParentCandidate {
  id: string;
  path: string;
  title?: string;
  schemaId?: string;
  sourceMode?: string;
  boundary?: string;
  role?: string;
  explicitOnly?: boolean;
}

export interface ArtifactMaterializationPlanResult {
  status: string;
  candidateSchemas?: ArtifactMaterializationSchemaCandidate[];
  parentCandidates?: ArtifactMaterializationParentCandidate[];
  proposals?: Array<{
    id?: string;
    status?: string;
    schemaId?: string;
    path?: string;
    parent?: unknown;
    parentKind?: string;
    clarificationNeeds?: Array<{ code?: string; statement?: string }>;
    findings?: Array<{ severity?: string; code?: string; message?: string }>;
  }>;
  clarificationNeeds?: Array<{ proposalId?: string; code?: string; statement?: string }>;
  findings?: Array<{ severity?: string; code?: string; message?: string }>;
  findingSummary?: { counts?: { error?: number; warning?: number; info?: number; total?: number } };
}

/**
 * Ask Core to expose the currently creatable schema catalog and, when supplied,
 * plan one or more schema-generic artifact creations including exact Parent and
 * path allocation. VS Code never reimplements schema path/lineage policy here.
 */
export async function projectArtifactMaterialization(
  runtime: PackageRuntime,
  materialRoot: string,
  proposals: unknown[] = [],
  runner: ProcessRunner = runProcess
): Promise<ArtifactMaterializationPlanResult> {
  const args = ['prepare-materialization', materialRoot];
  if (!proposals.length) {
    args.push('--compact');
    return runTiinexJson<ArtifactMaterializationPlanResult>(runtime, args, runner);
  }
  const scratch = await mkdtemp(path.join(os.tmpdir(), 'tiinex-vscode-materialization-'));
  try {
    const proposalPath = path.join(scratch, 'proposals.json');
    await writeFile(proposalPath, JSON.stringify({ proposals }), 'utf8');
    args.push('--proposals', proposalPath, '--compact');
    return await runTiinexJson<ArtifactMaterializationPlanResult>(runtime, args, runner);
  } finally {
    await rm(scratch, { recursive: true, force: true });
  }
}

export async function createArtifactDraft(
  runtime: PackageRuntime,
  schemaId: string,
  materialRoot: string,
  childPath: string,
  _title: string,
  values: unknown,
  parentRecord: unknown = null,
  transition: 'create-artifact' | 'continue-from-record' = parentRecord ? 'continue-from-record' : 'create-artifact',
  runner: ProcessRunner = runProcess
): Promise<any> {
  if (!schemaId) throw new Error('tiinex.authoring.schema-required');
  const scratch = await mkdtemp(path.join(os.tmpdir(), 'tiinex-vscode-author-'));
  try {
    const valuesPath = path.join(scratch, 'values.json');
    const isolatedMaterialRoot = path.join(scratch, 'material');
    await mkdir(isolatedMaterialRoot, { recursive: true });
    await writeFile(valuesPath, JSON.stringify(values), 'utf8');
    // Title is a materialization/path-planning hint, not a schema-generic render input.
    // Core derives concrete artifact title/summary representation from the schema values;
    // forcing a host title can contradict bindings such as Task Summary -> body title.
    const args = ['create-local-draft', isolatedMaterialRoot, '--schema', schemaId, '--transition', transition, '--path', childPath, '--values', valuesPath];
    if (transition === 'continue-from-record') {
      if (!parentRecord) throw new Error('tiinex.authoring.parent-required');
      const parentPath = path.join(scratch, 'parent.json');
      await writeFile(parentPath, JSON.stringify(parentRecord), 'utf8');
      args.push('--parent', parentPath);
    }
    args.push('--compact');
    return await runTiinexJson<any>(runtime, args, runner);
  } finally { await rm(scratch, { recursive: true, force: true }); }
}

export async function manufactureHandoffPackage(runtime: PackageRuntime, args: string[], runner: ProcessRunner = runProcess): Promise<any> {
  const result = await runner(runtime.nodeExecutable, [runtime.entrypoint, 'manufacture-handoff-package', ...args, '--compact'], { env: nodeProcessEnvironment() });
  if (![0, 2].includes(result.code)) throw new Error(`tiinex.manufacture.process-failed:${result.stderr.trim() || result.stdout.trim() || result.code}`);
  let parsed: any;
  try { parsed = JSON.parse(result.stdout.trim()); } catch { throw new Error('tiinex.manufacture.invalid-json'); }
  return parsed;
}
