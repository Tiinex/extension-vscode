import { qualifyInstalledCore } from '../host/corePackageBinding';
import os from 'node:os';
import path from 'node:path';
import { mkdir, mkdtemp, rm, writeFile, access, readFile, realpath } from 'node:fs/promises';
import { extractZipBuffer, readExactZipEntryFromFile, sha256Hex } from '../host/zip';
import { nodeProcessEnvironment, ProcessRunner, runChecked, runProcess } from '../host/process';
import { preferredNodeExecutable } from '../host/nodeExecutable';
import { LandingPlan, OrientResult } from './types';

const BOOTSTRAP_MANIFEST_ROOT = 'tiinex.bootstrap';
const BOOTSTRAP_MANIFEST_PATH = `${BOOTSTRAP_MANIFEST_ROOT}/manifest.json`;
const DEFAULT_ENTRYPOINT = 'runtime/tools/tiinex-portable.mjs';

export interface PackageRuntime {
  root: string;
  entrypoint: string;
  nodeExecutable: string;
  contentRoots?: readonly string[];
  compositionRoot?: string;
  dispose(): Promise<void>;
}

interface BootstrapDescriptor { packagePath: string; bytes: number; sha256: string; entrypoint: string }

interface DependencyModePackage { name?: string; root?: string }
interface DependencyModeState {
  mode?: string;
  coreRoot?: string;
  packages?: DependencyModePackage[];
  contentPackages?: DependencyModePackage[];
}

async function dependencyModeState(extensionPath: string): Promise<{ checkoutRoot: string; state: DependencyModeState | null }> {
  let checkoutRoot: string;
  try { checkoutRoot = await realpath(extensionPath); }
  catch { checkoutRoot = path.resolve(extensionPath); }
  try {
    return { checkoutRoot, state: JSON.parse(await readFile(path.join(checkoutRoot, '.vscode', 'link', 'dependency-mode.json'), 'utf8')) as DependencyModeState };
  } catch { return { checkoutRoot, state: null }; }
}

async function dependencyModeRuntime(extensionPath: string): Promise<{ coreRoot: string; contentRoots: string[] }> {
  const { checkoutRoot, state } = await dependencyModeState(extensionPath);
  const mode = String(state?.mode || '').trim();
  const local = mode === 'local' || mode === 'all-local';
  const all = mode === 'all-local' || mode === 'all-latest';
  const coreRoot = local && state?.coreRoot ? path.resolve(checkoutRoot, String(state.coreRoot)) : '';
  const contentRoots: string[] = [];
  if (all) {
    for (const item of state?.contentPackages || []) {
      const name = String(item?.name || '').trim();
      const configuredRoot = String(item?.root || '').trim();
      if (!name) continue;
      const target = mode === 'all-local' && configuredRoot
        ? path.resolve(checkoutRoot, configuredRoot)
        : path.resolve(checkoutRoot, 'node_modules', ...name.split('/'));
      try { await access(path.join(target, 'package.json')); contentRoots.push(target); }
      catch { /* Dependency-mode state is advisory until npm install materializes the selected package. */ }
    }
  }
  return { coreRoot, contentRoots: normalizeContentRoots(contentRoots) };
}

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

interface QualifiedBootstrapInspection { status?: string; descriptorPath?: string; payloadPath?: string; entrypoint?: string }

function parseBootstrapPayloadDescriptor(bootstrapTraceMarkdown: string): Omit<BootstrapDescriptor, 'entrypoint'> {
  const packagePath = markdownLinkTarget(bootstrapTraceMarkdown, /bootstrap payload|location/i) || firstMatch(bootstrapTraceMarkdown, [/(?:Payload|Location|Bootstrap Payload)\s*:\s*`?([^`\s]+\.zip)`?/i]);
  const bytesText = firstMatch(bootstrapTraceMarkdown, [/(?:Byte Size|Bytes)\s*:\s*`?([0-9]+)`?/i]);
  const sha256 = firstMatch(bootstrapTraceMarkdown, [/(?:Integrity Value|SHA-?256)\s*:\s*`?([a-f0-9]{64})`?/i]).toLowerCase();
  const bytes = Number(bytesText);
  if (!packagePath || !Number.isSafeInteger(bytes) || bytes <= 0 || !/^[a-f0-9]{64}$/.test(sha256)) throw new Error('tiinex.bootstrap.descriptor-invalid');
  return { packagePath, bytes, sha256 };
}

/**
 * Materialize the carrier's embedded runtime only from bootstrap coordinates
 * already qualified by shared Core orientation. The VS Code host does not
 * discover Start, infer carrier lineage, or guess package-local filenames.
 */
export async function preparePackageRuntime(
  packagePath: string,
  nodeExecutable = preferredNodeExecutable(),
  bootstrapInspection: QualifiedBootstrapInspection | null = null
): Promise<PackageRuntime> {
  const descriptorPath = String(bootstrapInspection?.descriptorPath || '').trim();
  const payloadPath = String(bootstrapInspection?.payloadPath || '').trim();
  if (String(bootstrapInspection?.status || '').toLowerCase() !== 'valid' || !descriptorPath || !payloadPath) throw new Error('tiinex.bootstrap.qualified-coordinates-required');
  const trace = (await readExactZipEntryFromFile(packagePath, descriptorPath)).toString('utf8');
  const payloadDescriptor = parseBootstrapPayloadDescriptor(trace);
  if (payloadDescriptor.packagePath !== payloadPath) throw new Error(`tiinex.bootstrap.payload-path-mismatch:${payloadDescriptor.packagePath}:${payloadPath}`);
  const payload = await readExactZipEntryFromFile(packagePath, payloadPath);
  if (payload.byteLength !== payloadDescriptor.bytes) throw new Error(`tiinex.bootstrap.byte-size-mismatch:${payload.byteLength}:${payloadDescriptor.bytes}`);
  if (sha256Hex(payload) !== payloadDescriptor.sha256) throw new Error('tiinex.bootstrap.sha256-mismatch');
  const root = await mkdtemp(path.join(os.tmpdir(), 'tiinex-vscode-bootstrap-'));
  try {
    await extractZipBuffer(payload, root);

    // Core's bootstrap contract defines one manifest root, `tiinex.bootstrap/`.
    // The manifest entrypoint is relative to that root, not to the ZIP extraction
    // root. Read the exact declared manifest instead of flattening those two
    // coordinate systems or searching the extracted payload.
    const manifestPath = path.resolve(root, ...BOOTSTRAP_MANIFEST_PATH.split('/'));
    let manifest: any;
    try { manifest = JSON.parse(await readFile(manifestPath, 'utf8')); }
    catch (error) { throw new Error(`tiinex.bootstrap.manifest-invalid:${error instanceof Error ? error.message : String(error)}`); }
    const runtimeEntrypoint = String(manifest?.entrypoint || '').trim();
    if (!runtimeEntrypoint || runtimeEntrypoint !== DEFAULT_ENTRYPOINT) throw new Error(`tiinex.bootstrap.entrypoint-invalid:${runtimeEntrypoint || 'missing'}`);
    const manifestRoot = path.resolve(root, BOOTSTRAP_MANIFEST_ROOT);
    const entrypoint = path.resolve(manifestRoot, ...runtimeEntrypoint.replace(/\\/g, '/').split('/'));
    const rel = path.relative(manifestRoot, entrypoint);
    if (!rel || rel === '..' || rel.startsWith(`..${path.sep}`) || path.isAbsolute(rel)) throw new Error('tiinex.bootstrap.entrypoint-outside-runtime');
    await access(entrypoint);
    return { root, entrypoint, nodeExecutable, dispose: () => rm(root, { recursive: true, force: true }) };
  } catch (error) {
    await rm(root, { recursive: true, force: true });
    throw error;
  }
}


export async function prepareWorkspaceCoreRuntime(rootValue: string, nodeExecutable = preferredNodeExecutable(), contentRoots: string[] = []): Promise<PackageRuntime> {
  const root = path.resolve(String(rootValue || '').trim());
  if (!root) throw new Error('tiinex.core-source-runtime.root-required');
  let manifest: any;
  try { manifest = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8')); }
  catch (error) { throw new Error(`tiinex.core-source-runtime.package-invalid:${error instanceof Error ? error.message : String(error)}`); }
  if (String(manifest?.name || '') !== '@tiinex/core') throw new Error('tiinex.core-source-runtime.package-name-mismatch');
  const entrypoint = path.resolve(root, 'tools', 'tiinex-portable.mjs');
  const relative = path.relative(root, entrypoint);
  if (!relative || relative === '..' || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) throw new Error('tiinex.core-source-runtime.entrypoint-outside-root');
  await access(entrypoint);
  return { root, entrypoint, nodeExecutable, contentRoots: normalizeContentRoots(contentRoots), compositionRoot: root, dispose: async () => undefined };
}


async function canonicalHostRoot(value: string): Promise<string> {
  const resolved = path.resolve(String(value || '').trim());
  if (!resolved) return '';
  let physical = resolved;
  try { physical = await realpath(resolved); }
  catch { /* A candidate may disappear between host discovery and runtime selection. */ }
  return process.platform === 'win32' ? physical.toLowerCase() : physical;
}

async function uniquePhysicalRoots(values: readonly string[] = []): Promise<string[]> {
  const roots = new Map<string, string>();
  for (const value of values) {
    const raw = String(value || '').trim();
    if (!raw) continue;
    const resolved = path.resolve(raw);
    const key = await canonicalHostRoot(resolved);
    if (!key || roots.has(key)) continue;
    let physical = resolved;
    try { physical = await realpath(resolved); }
    catch { /* Preserve the resolved host coordinate if realpath is temporarily unavailable. */ }
    roots.set(key, physical);
  }
  return [...roots.values()];
}

async function hostContentRoots(extensionPath: string, candidateRoots: readonly string[] = []): Promise<string[]> {
  const mode = await dependencyModeRuntime(extensionPath);
  const roots = await uniquePhysicalRoots([...candidateRoots, ...mode.contentRoots]);
  const content: string[] = [];
  for (const root of roots) {
    try {
      const manifest = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'));
      if (String(manifest?.name || '').trim() === '@tiinex/core') continue;
    } catch { /* Non-package Workspace roots can still be Tiinex content roots. */ }
    content.push(root);
  }
  return content;
}

export async function prepareSelectedHostCoreRuntime(
  extensionPath: string,
  selectedCoreRoot: string,
  candidateRoots: string[] = [],
  nodeExecutable = preferredNodeExecutable()
): Promise<PackageRuntime> {
  const selectedRoots = await uniquePhysicalRoots([selectedCoreRoot]);
  const selected = selectedRoots[0] || '';
  if (!selected) throw new Error('tiinex.core-source-runtime.selected-root-required');
  let manifest: any;
  try { manifest = JSON.parse(await readFile(path.join(selected, 'package.json'), 'utf8')); }
  catch (error) { throw new Error(`tiinex.core-source-runtime.package-invalid:${error instanceof Error ? error.message : String(error)}`); }
  if (String(manifest?.name || '').trim() !== '@tiinex/core') throw new Error('tiinex.core-source-runtime.package-name-mismatch');
  // Source selection is already explicit at this boundary. Other open Core roots
  // are host/environment facts, not competing runtime candidates for this
  // manufacture. Keep only non-Core roots as content composition inputs.
  const contentRoots = await hostContentRoots(extensionPath, candidateRoots);
  return prepareWorkspaceCoreRuntime(selected, nodeExecutable, contentRoots);
}

export async function prepareHostCoreRuntime(extensionPath: string, candidateRoots: string[] = [], nodeExecutable = preferredNodeExecutable()): Promise<PackageRuntime> {
  const mode = await dependencyModeRuntime(extensionPath);
  // A linked VS Code checkout can expose the same physical repository through
  // the dependency-mode coordinate, an open Workspace coordinate and a
  // junction/symlink coordinate. Collapse those host aliases before deciding
  // whether more than one Core implementation is present.
  const roots = await uniquePhysicalRoots([...candidateRoots, ...mode.contentRoots]);
  const coreRoots: string[] = [];
  if (mode.coreRoot) coreRoots.push(mode.coreRoot);
  for (const root of roots) {
    try {
      const manifest = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'));
      if (String(manifest?.name || '').trim() === '@tiinex/core') coreRoots.push(root);
    } catch { /* non-Core host root */ }
  }
  const uniqueCoreRoots = await uniquePhysicalRoots(coreRoots);
  if (uniqueCoreRoots.length > 1) throw new Error(`tiinex.core-source-runtime.ambiguous:${uniqueCoreRoots.join(',')}`);
  const contentRoots = await hostContentRoots(extensionPath, roots);
  if (uniqueCoreRoots.length === 1) return prepareWorkspaceCoreRuntime(uniqueCoreRoots[0], nodeExecutable, contentRoots);
  return prepareBundledRuntime(extensionPath, nodeExecutable, contentRoots);
}

export async function prepareBundledRuntime(extensionPath: string, nodeExecutable = preferredNodeExecutable(), contentRoots: string[] = []): Promise<PackageRuntime> {
  const mode = await dependencyModeRuntime(extensionPath);
  const binding = await qualifyInstalledCore(extensionPath);
  return { root: binding.root, entrypoint: binding.entrypoint, nodeExecutable, contentRoots: normalizeContentRoots([...contentRoots, ...mode.contentRoots]), compositionRoot: extensionPath, dispose: async () => undefined };
}

function normalizeContentRoots(values: readonly string[] = []): string[] {
  return [...new Set(values.map((item) => String(item || '').trim()).filter(Boolean).map((item) => path.resolve(item)))];
}

function messageOf(error: unknown): string { return error instanceof Error ? error.message : String(error); }

export async function runTiinexJson<T>(runtime: PackageRuntime, args: string[], runner: ProcessRunner = runProcess): Promise<T> {
  const commandArgs = [runtime.entrypoint, ...args];
  const env = nodeProcessEnvironment();
  const contentRoots = normalizeContentRoots(runtime.contentRoots || []);
  if (contentRoots.length) env.TIINEX_CONTENT_ROOTS = contentRoots.join(path.delimiter);
  const result = await runner(runtime.nodeExecutable, commandArgs, { cwd: runtime.compositionRoot || runtime.root, env });
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


export interface GitCommitProvenanceResult {
  schema: string;
  status: string;
  repositoryLabel: string;
  title: string;
  message: string;
  tree: string;
  entries: Array<{ status: string; statusCode: string; statusLabel: string; path: string; previousPath: string; schemaId: string; schemaLabel: string }>;
}

/** Shared Core-owned staged Git provenance projection. The host supplies only the repository coordinate. */
export async function projectGitCommitProvenance(runtime: PackageRuntime, root: string, repositoryLabel = '', runner: ProcessRunner = runProcess): Promise<GitCommitProvenanceResult> {
  const args = ['project-git-commit-provenance', root, '--json', '--compact'];
  if (repositoryLabel.trim()) args.push('--label', repositoryLabel.trim());
  return runTiinexJson<GitCommitProvenanceResult>(runtime, args, runner);
}


export interface PreparedPackageRuntimeResult {
  runtime: PackageRuntime;
  orientation: OrientResult;
  recovery: { state: 'package-bootstrap' | 'host-bootstrap-recovery'; detail: string };
}

export async function inspectPackageOrientation(runtime: PackageRuntime, packagePath: string, runner: ProcessRunner = runProcess): Promise<OrientResult> {
  return runTiinexJson<OrientResult>(runtime, ['orient-handoff-package', packagePath, '--full'], runner);
}

export async function preparePackageRuntimeWithRecovery(
  packagePath: string,
  extensionPath: string,
  nodeExecutable = preferredNodeExecutable(),
  runner: ProcessRunner = runProcess
): Promise<PreparedPackageRuntimeResult> {
  // Shared host Core is the only package-orientation authority available before
  // the carrier runtime is extracted. It qualifies the exact package-local
  // bootstrap coordinates; the host then verifies/extracts only those bytes and
  // re-orients with the embedded runtime.
  const bundled = await prepareBundledRuntime(extensionPath, nodeExecutable);
  let hostOrientation: OrientResult;
  try {
    hostOrientation = await inspectPackageOrientation(bundled, packagePath, runner);
  } catch (error) {
    await bundled.dispose();
    throw error;
  }

  let packageRuntime: PackageRuntime | null = null;
  let packageFailure = '';
  const bootstrapInspection = (hostOrientation as any)?.bootstrapInspection || null;
  if (String(hostOrientation.status || '').toLowerCase() === 'ready' && String(bootstrapInspection?.status || '').toLowerCase() === 'valid') {
    try {
      packageRuntime = await preparePackageRuntime(packagePath, nodeExecutable, bootstrapInspection);
      const orientation = await inspectPackageOrientation(packageRuntime, packagePath, runner);
      if (String(orientation.status || '').toLowerCase() === 'ready') {
        await bundled.dispose();
        return { runtime: packageRuntime, orientation, recovery: { state: 'package-bootstrap', detail: 'qualified shared-Core coordinates; verified package bootstrap' } };
      }
      packageFailure = `tiinex.package.not-ready:${String(orientation.status || 'unknown')}`;
    } catch (error) {
      packageFailure = messageOf(error);
    }
    if (packageRuntime) await packageRuntime.dispose();
  } else {
    packageFailure = `tiinex.package.bootstrap-not-qualified:${String(bootstrapInspection?.status || hostOrientation.status || 'unknown')}`;
  }

  const recovery = (hostOrientation as any)?.bootstrapRecovery || null;
  if (recovery?.state === 'eligible' && recovery?.eligibleWithQualifiedHostBootstrap === true) {
    return { runtime: bundled, orientation: hostOrientation, recovery: { state: 'host-bootstrap-recovery', detail: packageFailure || 'package bootstrap unavailable' } };
  }
  const blocking = Array.isArray(recovery?.blockingFindingCodes) ? recovery.blockingFindingCodes.join(',') : '';
  const ignored = Array.isArray(recovery?.ignoredFindingCodes) ? recovery.ignoredFindingCodes.join(',') : '';
  const artifact = String(recovery?.packageBootstrap?.artifactPath || bootstrapInspection?.descriptorPath || '');
  const detail = [
    `package=${packageFailure || String(hostOrientation.status || 'blocked')}`,
    `recovery=${String(recovery?.state || 'unavailable')}`,
    artifact ? `bootstrap=${artifact}` : '',
    blocking ? `blocking=${blocking}` : '',
    ignored ? `ignored=${ignored}` : ''
  ].filter(Boolean).join(';');
  await bundled.dispose();
  throw new Error(`tiinex.bootstrap.recovery-ineligible:${detail}`);
}

export async function orientPackage(runtime: PackageRuntime, packagePath: string, runner: ProcessRunner = runProcess): Promise<OrientResult> {
  const result = await runTiinexJson<OrientResult>(runtime, ['orient-handoff-package', packagePath, '--full'], runner);
  if (String(result.status || '').toLowerCase() !== 'ready') throw new Error(`tiinex.package.not-ready:${String(result.status || 'unknown')}`);
  return result;
}

export interface PackageTransportProjectionResult {
  status: string;
  carrierInspection?: {
    status?: string;
    format?: string;
    entrypoint?: { path?: string; status?: string } | null;
    routes?: Array<{ pointerPath?: string; workspaceId?: string; workspaceRelativeHandoffPath?: string }>;
    findingSummary?: unknown;
    findings?: Array<{ severity?: string; code?: string; message?: string }>;
  };
  primary?: { kind?: string; filename?: string; routeId?: string; workspaceId?: string; workspaceRelativeHandoffPath?: string } | null;
  normalInlineRouting?: { content?: string } | null;
  sharedRouting?: { routes?: Array<{ routeId?: string; workspaceId?: string; workspaceRelativeHandoffPath?: string; transportText?: string }> } | null;
  presentation?: { kind?: string; label?: string; recipientLabel?: string; recipientProjectionAuthority?: string } | null;
  selectedRoute?: { id?: string; workspaceId?: string; workspaceRelativePath?: string; parties?: { from?: string; to?: string } } | null;
  humanOutput?: {
    status?: string;
    primary?: { kind?: string; filename?: string; routeId?: string; workspaceId?: string; workspaceRelativeHandoffPath?: string } | null;
    normalInlineRouting?: { content?: string } | null;
    sharedRouting?: { routes?: Array<{ routeId?: string; workspaceId?: string; workspaceRelativeHandoffPath?: string; transportText?: string }> } | null;
    presentation?: { kind?: string; label?: string; recipientLabel?: string; recipientProjectionAuthority?: string } | null;
    selectedRoute?: { id?: string; workspaceId?: string; workspaceRelativePath?: string; parties?: { from?: string; to?: string } } | null;
    findings?: Array<{ severity?: string; code?: string; message?: string }>;
  };
  findings?: Array<{ severity?: string; code?: string; message?: string }>;
  [key: string]: unknown;
}

/**
 * Regenerate transport presentation from the exact finished carrier bytes.
 * The caller may select one exact qualified route, but never supplies any
 * Start/Continue text or recipient semantics itself.
 */
export async function projectPackageTransport(
  runtime: PackageRuntime,
  packagePath: string,
  route = '',
  runner: ProcessRunner = runProcess
): Promise<PackageTransportProjectionResult> {
  const target = String(packagePath || '').trim();
  if (!target) throw new Error('tiinex.transport.package-required');
  const args = ['project-handoff-carrier-output', target];
  const selector = String(route || '').trim();
  if (selector) args.push('--route', selector);
  args.push('--compact');
  const projected = await runTiinexJson<PackageTransportProjectionResult>(runtime, args, runner);
  // Current Core projects human transport output at the operation-result top level.
  // Older host builds consumed a nested humanOutput shape. Normalize only the
  // representation boundary here so every VS Code caller consumes Core's exact
  // projected values without reconstructing transport semantics.
  if (!projected.humanOutput) {
    projected.humanOutput = {
      status: projected.status,
      primary: projected.primary || null,
      normalInlineRouting: projected.normalInlineRouting || null,
      sharedRouting: projected.sharedRouting || null,
      presentation: projected.presentation || null,
      selectedRoute: projected.selectedRoute || null,
      findings: projected.findings || []
    };
  }
  return projected;
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
    diagnostics: Array<{ severity: string; code: string; message: string; line: number | null; sourceRange?: { startLine: number; startColumn: number; endLine: number; endColumn: number } | null; locationState: string; locationBasis: string }>;
    actions: Array<{ id: string; title: string; kind: string; qualification: string; sourceSha256: string; replacementMarkdown: string; replacements?: Array<{ path: string; sourceSha256: string; replacementMarkdown: string }>; diagnosticCodes?: string[] }>;
  }>;
}
export interface HandoffLeafCandidate { path: string; title: string; from: string; to: string; purpose: string; qualification: string; leaf?: boolean }
export interface HandoffLeavesResult {
  status: string;
  candidates?: HandoffLeafCandidate[];
  leaves: HandoffLeafCandidate[];
  findings?: Array<{ severity: string; code: string; message: string }>;
  pointerless: { selectionLabel: string; packageRole: string; manufactureState: string; blockerCode: string; consequence: string };
}

export async function projectEditorAssistance(runtime: PackageRuntime, materialRoot: string, focusPath: string, referenceResolutionsOrRunner: any[] | ProcessRunner = [], runner: ProcessRunner = runProcess): Promise<EditorAssistanceResult> {
  if (!materialRoot || !focusPath) throw new Error('tiinex.editor-assistance.material-root-or-focus-missing');
  const referenceResolutions = typeof referenceResolutionsOrRunner === 'function' ? [] : referenceResolutionsOrRunner;
  const effectiveRunner = typeof referenceResolutionsOrRunner === 'function' ? referenceResolutionsOrRunner : runner;
  if (!referenceResolutions.length) return runTiinexJson<EditorAssistanceResult>(runtime, ['project-editor-assistance', materialRoot, '--focus', focusPath, '--compact'], effectiveRunner);
  const scratch = await mkdtemp(path.join(os.tmpdir(), 'tiinex-vscode-editor-'));
  const resolutions = path.join(scratch, 'reference-resolutions.json');
  try {
    await writeFile(resolutions, JSON.stringify(referenceResolutions), 'utf8');
    return await runTiinexJson<EditorAssistanceResult>(runtime, ['project-editor-assistance', materialRoot, '--focus', focusPath, '--reference-resolutions', resolutions, '--compact'], effectiveRunner);
  } finally {
    await rm(scratch, { recursive: true, force: true });
  }
}

export async function projectEditorAssistanceText(runtime: PackageRuntime, materialRoot: string, focusPath: string, markdown: string, referenceResolutionsOrRunner: any[] | ProcessRunner = [], runner: ProcessRunner = runProcess): Promise<EditorAssistanceResult> {
  const referenceResolutions = typeof referenceResolutionsOrRunner === 'function' ? [] : referenceResolutionsOrRunner;
  const effectiveRunner = typeof referenceResolutionsOrRunner === 'function' ? referenceResolutionsOrRunner : runner;
  const scratch = await mkdtemp(path.join(os.tmpdir(), 'tiinex-vscode-editor-'));
  const overlay = path.join(scratch, 'overlay.md');
  const resolutions = path.join(scratch, 'reference-resolutions.json');
  try {
    await writeFile(overlay, String(markdown ?? ''), 'utf8');
    const args = ['project-editor-assistance', materialRoot, '--focus', focusPath, '--overlay', overlay];
    if (referenceResolutions.length) {
      await writeFile(resolutions, JSON.stringify(referenceResolutions), 'utf8');
      args.push('--reference-resolutions', resolutions);
    }
    args.push('--compact');
    return await runTiinexJson<EditorAssistanceResult>(runtime, args, effectiveRunner);
  } finally {
    await rm(scratch, { recursive: true, force: true });
  }
}

export async function projectHandoffLeaves(runtime: PackageRuntime, roots: string[], runner: ProcessRunner = runProcess): Promise<HandoffLeavesResult> {
  if (!roots.length) throw new Error('tiinex.handoff-leaves.workspace-required');
  return runTiinexJson<HandoffLeavesResult>(runtime, ['project-handoff-leaves', ...roots, '--compact'], runner);
}

export async function projectAuthoringParent(runtime: PackageRuntime, parentPath: string, reference = '', runner: ProcessRunner = runProcess): Promise<any> {
  const args = ['project-authoring-parent', parentPath];
  if (reference) args.push('--reference', reference);
  args.push('--compact');
  const result = await runTiinexJson<any>(runtime, args, runner);
  if (result.status !== 'ready' || !result.parentRecord) {
    const findings = (result.findings || []).map((item: any) => `${item.code || 'finding'}: ${item.message || ''}`.trim()).filter(Boolean);
    const detail = findings.length ? `\n${findings.join('\n')}` : '';
    throw new Error(`tiinex.authoring.parent-blocked:${result.status || 'unknown'}${detail}`);
  }
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

export interface TransitionCatalogDefinition {
  representationKey?: string;
  path: string;
  humanLabel?: string;
  canonicalIdentifier: string;
  version?: string;
  purpose?: string;
  semanticBoundary?: string;
  identityQualification?: string;
  representationQualification?: string;
  outputSchemaIds?: string[];
  inputSchemaIds?: string[];
  source?: { locator?: { kind?: string; localPath?: string; archivePath?: string; entryPath?: string } };
}

export interface TransitionCatalogResult {
  status?: string;
  schema?: string;
  candidates: TransitionCatalogDefinition[];
  counts?: { discovered?: number; readQualified?: number; projectedCandidates?: number };
  boundary?: Record<string, unknown>;
  limitations?: string[];
  findings?: Array<{ severity?: string; code?: string; message?: string }>;
}

/**
 * Ask Core to discover/read-qualify Transition Definitions from explicit local
 * material roots. Discovery does not grant applicability or execution authority.
 */
export async function projectTransitionCatalog(
  runtime: PackageRuntime,
  roots: string[],
  outputSchemaId = '',
  inputSchemaId = '',
  runner: ProcessRunner = runProcess
): Promise<TransitionCatalogResult> {
  const materialRoots = [...new Set((roots || []).map((root) => String(root || '').trim()).filter(Boolean))];
  if (!materialRoots.length) throw new Error('tiinex.transition-catalog.material-root-required');
  const args = ['project-transition-catalog', ...materialRoots];
  if (String(outputSchemaId || '').trim()) args.push('--output-schema', String(outputSchemaId).trim());
  if (String(inputSchemaId || '').trim()) args.push('--input-schema', String(inputSchemaId).trim());
  args.push('--compact');
  return runTiinexJson<TransitionCatalogResult>(runtime, args, runner);
}

export interface TransitionNeighborhoodDefinition extends TransitionCatalogDefinition {
  attachmentQualification?: string;
  authoringProfile?: {
    state?: string;
    reason?: string;
    generationQualification?: string;
    defaults?: Record<string, unknown>;
    boundary?: {
      explicitSelectionRequired?: boolean;
      recommendation?: string;
      ordering?: string;
      transitionApplicability?: string;
      executionAuthorized?: boolean;
      defaultsAreAuthoringGuidance?: boolean;
    };
  };
  attachmentProvenance?: Array<{
    packageManifestPath?: string;
    packageQualification?: string;
    schemaPath?: string;
    companionRepresentationKeys?: string[];
    attachmentName?: string;
    attachmentParticipation?: string;
  }>;
}

export interface TransitionNeighborhoodResult extends Omit<TransitionCatalogResult, 'candidates' | 'counts'> {
  candidates: TransitionNeighborhoodDefinition[];
  counts?: { discovered?: number; readQualified?: number; attachedCandidates?: number };
}

/**
 * Ask Core for the schema-local Transition candidate neighborhood explicitly
 * attached through supplied Semantic Package + Schema Transition Companion
 * material. Attachment remains read-only context: it does not grant current
 * applicability, execution authority, recommendation, or ordering.
 */
export async function projectTransitionNeighborhood(
  runtime: PackageRuntime,
  roots: string[],
  outputSchemaId: string,
  inputSchemaId = '',
  runner: ProcessRunner = runProcess
): Promise<TransitionNeighborhoodResult> {
  const materialRoots = [...new Set((roots || []).map((root) => String(root || '').trim()).filter(Boolean))];
  if (!materialRoots.length) throw new Error('tiinex.transition-neighborhood.material-root-required');
  const targetSchema = String(outputSchemaId || '').trim();
  if (!targetSchema) throw new Error('tiinex.transition-neighborhood.output-schema-required');
  const args = ['project-transition-neighborhood', ...materialRoots, '--output-schema', targetSchema];
  if (String(inputSchemaId || '').trim()) args.push('--input-schema', String(inputSchemaId).trim());
  args.push('--compact');
  return runTiinexJson<TransitionNeighborhoodResult>(runtime, args, runner);
}

export interface HandoffEndpointProjectionResult {
  status: string;
  workspaceId: string;
  candidates: Array<{ id: string; target: string; reference: string; kind: 'role' | 'party'; label: string; authoringLabel?: string; workspaceId: string; artifactPath: string; schemaId: string; qualification: string }>;
  currentRoleCandidates?: Array<{ id: string; target: string; reference: string; kind: 'role'; label: string; authoringLabel?: string; workspaceId: string; artifactPath: string; schemaId: string; qualification: string; currentLeaf?: boolean }>;
  authoringCandidates?: Array<{ id: string; target: string; reference?: string; kind: 'role' | 'party'; label: string; authoringLabel?: string; workspaceId: string; artifactPath: string; schemaId: string; qualification: 'qualified-exact' | 'authoring-assist'; qualificationBoundary?: string }>;
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
  title: string,
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
    // Core owns rendering semantics. Handoff creation explicitly accepts an
    // operator Title that Core renders as H1/Summary; other schemas keep deriving
    // title/summary from their own creation bindings (for example Task Summary).
    const args = ['create-local-draft', isolatedMaterialRoot, '--schema', schemaId, '--transition', transition, '--path', childPath, '--values', valuesPath];
    if (schemaId === 'tiinex.handoff.v1' && String(title || '').trim()) args.push('--title', String(title).trim());
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

async function runManufactureHandoffPackage(runtime: PackageRuntime, args: string[], compact: boolean, runner: ProcessRunner = runProcess): Promise<any> {
  const commandArgs = [runtime.entrypoint, 'manufacture-handoff-package', ...args, ...(compact ? ['--compact'] : [])];
  const env = nodeProcessEnvironment();
  const contentRoots = normalizeContentRoots(runtime.contentRoots || []);
  if (contentRoots.length) env.TIINEX_CONTENT_ROOTS = contentRoots.join(path.delimiter);
  const result = await runner(runtime.nodeExecutable, commandArgs, { cwd: runtime.compositionRoot || runtime.root, env });
  if (![0, 2].includes(result.code)) {
    const raw = result.stderr.trim() || result.stdout.trim() || String(result.code);
    let reason = raw;
    try { reason = String(JSON.parse(raw)?.error || raw); } catch { /* preserve raw process detail */ }
    throw new Error(`tiinex.manufacture.process-failed:${reason}`);
  }
  let parsed: any;
  try { parsed = JSON.parse(result.stdout.trim()); } catch { throw new Error('tiinex.manufacture.invalid-json'); }
  return parsed;
}


export interface CarrierMajorAllocationResult {
  status: string;
  state: 'ready' | 'blocked';
  reasonCode?: string;
  prefix?: string;
  highestObservedMajor?: number;
  nextMajorDimension?: string;
  parentOptional?: boolean;
}

export async function projectHandoffCarrierMajorAllocation(
  runtime: PackageRuntime,
  prefix: string,
  existingFilenames: string[],
  runner: ProcessRunner = runProcess
): Promise<CarrierMajorAllocationResult> {
  const scratch = await mkdtemp(path.join(os.tmpdir(), 'tiinex-vscode-major-allocation-'));
  try {
    const namesPath = path.join(scratch, 'names.json');
    await writeFile(namesPath, JSON.stringify({ existingFilenames }), 'utf8');
    return await runTiinexJson<CarrierMajorAllocationResult>(runtime, [
      'project-handoff-carrier-major-allocation',
      '--prefix', String(prefix || '').trim(),
      '--existing', namesPath,
      '--compact'
    ], runner);
  } finally { await rm(scratch, { recursive: true, force: true }); }
}

export interface WorkspaceSessionRoleProjectionResult {
  status: string;
  state?: string;
  reasonCode?: string;
  workspaceId?: string;
  workspaceTargetPath?: string;
  materialRoot?: string;
  candidates?: Array<{ id?: string; target?: string; workspaceCoordinate?: string; reference?: string; referenceQualification?: string; kind?: 'role'; label?: string; workspaceId?: string; artifactPath?: string; schemaId?: string; qualification?: string; schemaAuthority?: string; currentLeaf?: boolean }>;
  findings?: Array<{ severity?: string; code?: string; message?: string }>;
}

export interface WorkspaceCarrierTargetOption {
  id?: string;
  label?: string;
  targetKind?: string;
  targetHandle?: string;
  canonicalTargetIdentifier?: string;
  provider?: string;
  host?: string;
  summary?: string;
  sourceKind?: string;
  workspaceId?: string;
  artifactPath?: string;
  canonicalIdentifier?: string;
  schemaId?: string;
  schemaLineage?: string[];
  provides?: string[];
  limitations?: string[];
}

export interface WorkspaceCarrierEntryProjectionResult {
  status: string;
  state?: string;
  reasonCode?: string;
  modes?: Array<{ id?: string; label?: string; requiresInstruction?: boolean; summary?: string; sourceKind?: string; workspaceId?: string; artifactPath?: string; canonicalIdentifier?: string; version?: string }>;
  targets?: WorkspaceCarrierTargetOption[];
  targetOptions?: WorkspaceCarrierTargetOption[];
  targetOptional?: boolean;
  targetEntryId?: string;
  targetOption?: WorkspaceCarrierTargetOption | null;
  entries?: Array<{ id?: string; label?: string; summary?: string; sourceKind?: string; workspaceId?: string; artifactPath?: string; canonicalIdentifier?: string; version?: string; entryKind?: string }>;
  entryId?: string;
  mode?: string;
  startPath?: string;
  transportText?: string;
  primaryRole?: { label?: string; reference?: string } | null;
  participants?: Array<{ label?: string; reference?: string }>;
  boundary?: string;
}

export async function projectWorkspaceSessionRoles(
  runtime: PackageRuntime,
  root: string,
  workspaceId: string,
  runner: ProcessRunner = runProcess
): Promise<WorkspaceSessionRoleProjectionResult> {
  if (!root || !workspaceId) throw new Error('tiinex.workspace-session-roles.workspace-required');
  return runTiinexJson<WorkspaceSessionRoleProjectionResult>(runtime, ['project-workspace-session-roles', root, '--workspace-id', workspaceId, '--compact'], runner);
}

export async function projectWorkspaceCarrierEntry(
  runtime: PackageRuntime,
  packagePath: string,
  mode = '',
  customInstruction = '',
  primaryRole: unknown = null,
  participants: unknown[] = [],
  route = '',
  targetEntryId: string | ProcessRunner = '',
  runner: ProcessRunner = runProcess
): Promise<WorkspaceCarrierEntryProjectionResult> {
  const selectedTargetEntryId = typeof targetEntryId === 'function' ? '' : String(targetEntryId || '').trim();
  const selectedRunner = typeof targetEntryId === 'function' ? targetEntryId : runner;
  const scratch = await mkdtemp(path.join(os.tmpdir(), 'tiinex-vscode-workspace-entry-'));
  try {
    const args = ['project-workspace-carrier-entry', packagePath];
    if (mode) args.push('--mode', mode);
    if (route) args.push('--route', route);
    if (selectedTargetEntryId) args.push('--target-entry-id', selectedTargetEntryId);
    if (customInstruction) args.push('--custom-instruction', customInstruction);
    if (primaryRole) {
      const rolePath = path.join(scratch, 'primary-role.json');
      await writeFile(rolePath, JSON.stringify({ primaryRole }), 'utf8');
      args.push('--primary-role', rolePath);
    }
    if (participants.length) {
      const participantsPath = path.join(scratch, 'participants.json');
      await writeFile(participantsPath, JSON.stringify({ participants }), 'utf8');
      args.push('--participants', participantsPath);
    }
    args.push('--compact');
    return await runTiinexJson<WorkspaceCarrierEntryProjectionResult>(runtime, args, selectedRunner);
  } finally { await rm(scratch, { recursive: true, force: true }); }
}

export interface CarrierMajorFrontierCandidate {
  packagePath: string;
  filename: string;
  packageSha256: string;
  carrierLineage: { prefix?: string; dimension?: string };
}

export interface CarrierMajorFrontierResult {
  status: string;
  state: 'none' | 'ready' | 'ambiguous' | 'blocked';
  reasonCode?: string;
  selected?: { packagePath?: string; filename?: string; packageSha256?: string; prefix?: string; dimension?: string; major?: number } | null;
  nextMajorDimension?: string;
}

export async function projectHandoffCarrierMajorFrontier(
  runtime: PackageRuntime,
  prefix: string,
  candidates: CarrierMajorFrontierCandidate[],
  runner: ProcessRunner = runProcess
): Promise<CarrierMajorFrontierResult> {
  const scratch = await mkdtemp(path.join(os.tmpdir(), 'tiinex-vscode-major-frontier-'));
  try {
    const candidatesPath = path.join(scratch, 'candidates.json');
    await writeFile(candidatesPath, JSON.stringify({ candidates }), 'utf8');
    return await runTiinexJson<CarrierMajorFrontierResult>(runtime, ['project-handoff-carrier-major-frontier', '--prefix', String(prefix || '').trim(), '--candidates', candidatesPath, '--compact'], runner);
  } finally { await rm(scratch, { recursive: true, force: true }); }
}



export interface CarrierTransportNameResult {
  status: string;
  state: 'ready' | 'blocked';
  mode: 'continuation' | 'major' | string;
  reasonCode?: string;
  parentFilename?: string;
  filename?: string;
  ordinalOrMajor?: number;
  prefix?: string;
}

export async function projectHandoffCarrierTransportName(
  runtime: PackageRuntime,
  parentFilename: string,
  mode: 'continuation' | 'major',
  ordinal = 1,
  existingFilenames: string[] = [],
  runner: ProcessRunner = runProcess
): Promise<CarrierTransportNameResult> {
  const scratch = await mkdtemp(path.join(os.tmpdir(), 'tiinex-vscode-carrier-transport-name-'));
  try {
    const args = ['project-handoff-carrier-transport-name', '--parent-filename', String(parentFilename || '').trim(), '--mode', mode, '--ordinal', String(ordinal)];
    if (existingFilenames.length) {
      const namesPath = path.join(scratch, 'names.json');
      await writeFile(namesPath, JSON.stringify({ existingFilenames }), 'utf8');
      args.push('--existing', namesPath);
    }
    args.push('--compact');
    return await runTiinexJson<CarrierTransportNameResult>(runtime, args, runner);
  } finally { await rm(scratch, { recursive: true, force: true }); }
}

export interface CarrierOutputCollisionResult {
  status: string;
  state: 'canonical-free' | 'collision-suffixed' | 'blocked';
  reasonCode?: string;
  filename?: string;
  collisionInstance?: number;
}

export async function projectHandoffCarrierOutputCollision(
  runtime: PackageRuntime,
  filename: string,
  existingFilenames: string[],
  runner: ProcessRunner = runProcess
): Promise<CarrierOutputCollisionResult> {
  const scratch = await mkdtemp(path.join(os.tmpdir(), 'tiinex-vscode-carrier-collision-'));
  try {
    const namesPath = path.join(scratch, 'names.json');
    await writeFile(namesPath, JSON.stringify({ existingFilenames }), 'utf8');
    return await runTiinexJson<CarrierOutputCollisionResult>(runtime, ['project-handoff-carrier-output-collision', '--filename', String(filename || '').trim(), '--existing', namesPath, '--compact'], runner);
  } finally { await rm(scratch, { recursive: true, force: true }); }
}

export async function projectHandoffParticipants(runtime: PackageRuntime, args: string[], runner: ProcessRunner = runProcess): Promise<any> {
  return runTiinexJson<any>(runtime, ['project-handoff-participants', ...args, '--compact'], runner);
}

export async function manufactureHandoffPackage(runtime: PackageRuntime, args: string[], runner: ProcessRunner = runProcess): Promise<any> {
  return runManufactureHandoffPackage(runtime, args, true, runner);
}

export async function manufactureHandoffPackageDetailed(runtime: PackageRuntime, args: string[], runner: ProcessRunner = runProcess): Promise<any> {
  return runManufactureHandoffPackage(runtime, args, false, runner);
}
