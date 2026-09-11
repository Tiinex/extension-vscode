import os from 'node:os';
import path from 'node:path';
import { access, copyFile, lstat, mkdir, mkdtemp, readFile, readdir, readlink, rm } from 'node:fs/promises';
import * as vscode from 'vscode';
import { preferredNodeExecutable } from './host/nodeExecutable';
import { IndexedCarrierPackage, IndexedCarrierWorkspace } from './carrierIndex';
import { loadLocalWorkspaceChoices, PackageWorkspaceChoice } from './packageBuilder';
import { compareIncomingWorkspaceToLocal, prepareBundledRuntime, projectWorkspacePackageSources, SourceFrontierComparisonResult, WorkspacePackageSourcesResult } from './tiinex/bootstrap';
import { extractZipBuffer, inspectZipBuffer, readExactZipEntryFromFile } from './host/zip';
import { safeRelativePath, safeTarget } from './core/paths';
import {
  changedPathsBetween,
  checkIgnoredPaths,
  commitWorkingTreeWithMessage,
  dirtyWorkingTreePaths,
  generateTiinexCommitMessage,
  localBranchExists,
  listIgnoredFiles,
  mergeBase,
  mergeCommitNoCommit,
  repositoryFact,
  resolveCommit,
  stashWorkingTree,
  switchToExistingLocalBranch
} from './host/git';
import { runChecked, runProcess } from './host/process';

export type IncomingApplyStrategy = 'merge' | 'replace';
type DirtyResolution = 'none' | 'preserve' | 'stash' | 'commit';
type MergeMode = 'git-native' | 'file-safe';
type WorkspaceCandidate = WorkspacePackageSourcesResult['candidates'][number];

let incomingApplyRunning = false;

async function withIncomingApplyMutex<T>(work: () => Promise<T>): Promise<T | null> {
  if (incomingApplyRunning) {
    await vscode.window.showWarningMessage('Tiinex Incoming merge/replace is already running. Wait for it to finish before starting another.');
    return null;
  }
  incomingApplyRunning = true;
  try {
    return await work();
  } finally {
    incomingApplyRunning = false;
  }
}

interface SnapshotMaterial {
  workspace: IndexedCarrierWorkspace;
  root: string;
  files: string[];
  candidate: WorkspaceCandidate;
}

interface WorkspaceComparisonSummary {
  state: string;
  added: number;
  modified: number;
  removed: number;
  total: number;
}

interface WorkspaceApplyPlan {
  workspaceId: string;
  label: string;
  local: PackageWorkspaceChoice;
  snapshot: SnapshotMaterial;
  comparison: WorkspaceComparisonSummary;
  strategy: IncomingApplyStrategy;
  hasGit: boolean;
  localBranch: string;
  incomingRef: string;
  switchBranch: boolean;
  dirtyResolution: DirtyResolution;
  commitMessage: string;
  mergeMode: MergeMode;
  incomingCommit: string;
  changedPaths: string[];
  safePreserveMerge: boolean;
  preOperationIgnoredPaths: string[];
  mutationPrecondition: string;
}

export interface IncomingApplyResult {
  affectedWorkspaceIds: string[];
  conflictWorkspaceIds: string[];
}

interface TreeInventory {
  files: string[];
  symlinks: string[];
}

interface FileMergeAnalysis {
  writes: string[];
  conflicts: string[];
  protectedPaths: string[];
}

function nodeExecutable(): string { return preferredNodeExecutable(vscode.workspace.getConfiguration('tiinex').get('nodePath', '').toString().trim()); }
function normalized(value: string): string { return String(value || '').replace(/\\/g, '/').replace(/^\.\//, '').replace(/^\/+|\/+$/g, ''); }
function pathOverlap(a: string, b: string): boolean { const left = normalized(a); const right = normalized(b); return left === right || left.startsWith(`${right}/`) || right.startsWith(`${left}/`); }
function overlapAny(left: string[], right: string[]): boolean { return left.some((a) => right.some((b) => pathOverlap(a, b))); }
function shortError(error: unknown): string { const value = error instanceof Error ? error.message : String(error); return value.split(/\r?\n/)[0] || value; }

function sourceComparisonSummary(result: SourceFrontierComparisonResult, workspaceId: string): WorkspaceComparisonSummary {
  const workspace = (result.workspaces || []).find((item) => item.workspaceId === workspaceId);
  if (!workspace) throw new Error(`tiinex.incoming-apply.compare-workspace-missing:${workspaceId}`);
  const counts = workspace.delta?.counts || {};
  return {
    state: String(workspace.state || ''),
    added: Number(counts.added || 0),
    modified: Number(counts.byteChanged || 0),
    removed: Number(counts.removed || 0),
    total: Number(counts.total || 0)
  };
}

function sourceComparisonLabel(summary: WorkspaceComparisonSummary): string {
  if (summary.state === 'exact') return '✓ exact';
  return `+${summary.added}  ~${summary.modified}  -${summary.removed}`;
}

async function exists(file: string): Promise<boolean> { try { await access(file); return true; } catch { return false; } }

async function mutationPrecondition(root: string): Promise<string> {
  const fact = await repositoryFact(root);
  const head = await resolveCommit(root, 'HEAD');
  const dirty = await dirtyWorkingTreePaths(root);
  const paths: Array<{ path: string; state: string; sha256?: string; target?: string }> = [];
  for (const relative of dirty) {
    const absolute = safeTarget(root, relative);
    try {
      const info = await lstat(absolute);
      if (info.isSymbolicLink()) paths.push({ path: relative, state: 'symlink', target: await readlink(absolute) });
      else if (info.isFile()) paths.push({ path: relative, state: 'file', sha256: await fileSha(absolute) });
      else if (info.isDirectory()) paths.push({ path: relative, state: 'directory' });
      else paths.push({ path: relative, state: 'other' });
    } catch (error) {
      if ((error as NodeJS.ErrnoException)?.code === 'ENOENT') paths.push({ path: relative, state: 'missing' });
      else throw error;
    }
  }
  return JSON.stringify({
    root: path.resolve(root),
    repository: fact.repository,
    branch: fact.branch,
    head,
    clean: fact.clean,
    paths
  });
}

async function assertMutationPreconditions(plans: WorkspaceApplyPlan[]): Promise<void> {
  for (const plan of plans) {
    if (!plan.hasGit) throw new Error(`tiinex.incoming-apply.git-repository-required:${plan.workspaceId}`);
    const current = await mutationPrecondition(plan.local.root);
    if (current !== plan.mutationPrecondition) {
      throw new Error(`tiinex.incoming-apply.local-state-changed-after-review:${plan.workspaceId}`);
    }
  }
}


async function isGitWorkspace(root: string): Promise<boolean> {
  return exists(path.join(root, '.git'));
}

async function qualifyWorkspaceRoot(runtime: Awaited<ReturnType<typeof prepareBundledRuntime>>, root: string, workspaceId: string): Promise<WorkspaceCandidate> {
  const projected = await projectWorkspacePackageSources(runtime, [root]);
  const matches = (projected.candidates || []).filter((item) => item.workspaceId === workspaceId);
  if (projected.status !== 'ready' || matches.length !== 1) throw new Error(`tiinex.incoming-apply.workspace-unqualified:${workspaceId}`);
  return matches[0];
}

async function materializeSnapshot(runtime: Awaited<ReturnType<typeof prepareBundledRuntime>>, packagePath: string, workspace: IndexedCarrierWorkspace, scratch: string, ordinal: number): Promise<SnapshotMaterial> {
  if (!workspace.archivePath) throw new Error(`tiinex.incoming-apply.archive-missing:${workspace.workspaceId}`);
  const archive = await readExactZipEntryFromFile(packagePath, workspace.archivePath);
  const entries = await inspectZipBuffer(archive);
  const files = entries.filter((entry) => !entry.directory).map((entry) => safeRelativePath(entry.path));
  if (files.some((item) => item === '.git' || item.startsWith('.git/'))) throw new Error(`tiinex.incoming-apply.incoming-git-path:${workspace.workspaceId}`);
  const root = path.join(scratch, `i${ordinal}`);
  await extractZipBuffer(archive, root);
  const candidate = await qualifyWorkspaceRoot(runtime, root, workspace.workspaceId);
  return { workspace, root, files, candidate };
}

async function walkTree(root: string, current = root, prefix = ''): Promise<TreeInventory> {
  const files: string[] = [];
  const symlinks: string[] = [];
  const entries = await readdir(current, { withFileTypes: true });
  for (const entry of entries) {
    const relative = normalized(prefix ? `${prefix}/${entry.name}` : entry.name);
    if (!prefix && entry.name === '.git') continue;
    const absolute = path.join(current, entry.name);
    const info = await lstat(absolute);
    if (info.isSymbolicLink()) { symlinks.push(relative); continue; }
    if (info.isDirectory()) {
      const nested = await walkTree(root, absolute, relative);
      files.push(...nested.files); symlinks.push(...nested.symlinks);
    } else if (info.isFile()) files.push(relative);
  }
  return { files: files.sort(), symlinks: symlinks.sort() };
}

async function ignoredPathsWithoutRepository(root: string, candidates: string[], scratch: string): Promise<string[]> {
  if (!candidates.length) return [];
  const gitRoot = path.join(scratch, `ignore-${Math.random().toString(36).slice(2)}`);
  await runChecked('git', ['init', '--quiet', gitRoot]);
  const gitDir = path.join(gitRoot, '.git');
  const result = await runProcess('git', ['--git-dir', gitDir, '--work-tree', root, 'check-ignore', '--no-index', '-z', '--stdin'], { cwd: root, input: `${candidates.join('\0')}\0` });
  if (result.code !== 0 && result.code !== 1) throw new Error(`tiinex.incoming-apply.check-ignore-failed:${result.stderr.trim() || result.stdout.trim() || result.code}`);
  return result.stdout.split('\0').map(normalized).filter(Boolean).sort();
}

async function ignoredPaths(root: string, candidates: string[], hasGit: boolean, scratch: string): Promise<string[]> {
  return hasGit ? checkIgnoredPaths(root, candidates) : ignoredPathsWithoutRepository(root, candidates, scratch);
}

async function fileSha(file: string): Promise<string> {
  const { createHash } = await import('node:crypto');
  return createHash('sha256').update(await readFile(file)).digest('hex');
}

async function analyzeFileMerge(localRoot: string, snapshot: SnapshotMaterial, hasGit: boolean, scratch: string, preOperationIgnoredPaths: string[] = []): Promise<FileMergeAnalysis> {
  const local = await walkTree(localRoot);
  const allPaths = [...new Set([...local.files, ...local.symlinks, ...snapshot.files])];
  const ignored = new Set([...preOperationIgnoredPaths, ...await ignoredPaths(localRoot, allPaths, hasGit, scratch)]);
  const protectedPaths = [...new Set([...local.symlinks, ...allPaths.filter((item) => ignored.has(item))])].sort();
  const localFiles = new Set(local.files.filter((item) => !ignored.has(item)));
  const writes: string[] = [];
  const conflicts: string[] = [];
  for (const relative of snapshot.files) {
    if (ignored.has(relative)) continue;
    if (protectedPaths.some((item) => pathOverlap(item, relative))) { conflicts.push(relative); continue; }
    if (!localFiles.has(relative)) { writes.push(relative); continue; }
    const [left, right] = await Promise.all([fileSha(safeTarget(localRoot, relative)), fileSha(safeTarget(snapshot.root, relative))]);
    if (left !== right) conflicts.push(relative);
  }
  return { writes: writes.sort(), conflicts: [...new Set(conflicts)].sort(), protectedPaths };
}

async function listGitCommitTree(root: string, commit: string): Promise<Map<string, string> | null> {
  const result = await runProcess('git', ['ls-tree', '-r', '-z', '--full-tree', commit], { cwd: root });
  if (result.code !== 0) return null;
  const out = new Map<string, string>();
  for (const record of result.stdout.split('\0').filter(Boolean)) {
    const match = record.match(/^\d+\s+blob\s+([a-f0-9]+)\t(.+)$/);
    if (!match) return null;
    out.set(normalized(match[2]), match[1].toLowerCase());
  }
  return out;
}

async function hashSnapshotForRepository(repositoryRoot: string, snapshotRoot: string, files: string[]): Promise<Map<string, string>> {
  const out = new Map<string, string>();
  for (let offset = 0; offset < files.length; offset += 64) {
    const chunk = files.slice(offset, offset + 64);
    const args = ['hash-object', '--no-filters', '--', ...chunk.map((item) => safeTarget(snapshotRoot, item))];
    const result = await runChecked('git', args, { cwd: repositoryRoot });
    const hashes = result.stdout.split(/\r?\n/).map((item) => item.trim().toLowerCase()).filter(Boolean);
    if (hashes.length !== chunk.length) throw new Error('tiinex.incoming-apply.snapshot-hash-count-mismatch');
    chunk.forEach((item, index) => out.set(item, hashes[index]));
  }
  return out;
}

async function exactIncomingCommit(root: string, snapshot: SnapshotMaterial, incomingRef: string): Promise<string> {
  if (!incomingRef) return '';
  const refs = [...new Set([incomingRef, `refs/heads/${incomingRef}`, `refs/remotes/origin/${incomingRef}`, `origin/${incomingRef}`])];
  const snapshotHashes = await hashSnapshotForRepository(root, snapshot.root, snapshot.files);
  for (const ref of refs) {
    const commit = await resolveCommit(root, ref);
    if (!commit) continue;
    const tree = await listGitCommitTree(root, commit);
    if (!tree || tree.size !== snapshotHashes.size) continue;
    let same = true;
    for (const [file, hash] of snapshotHashes) if (tree.get(file) !== hash) { same = false; break; }
    if (same) return commit;
  }
  return '';
}

async function chooseStrategy(label: string, comparison: WorkspaceComparisonSummary): Promise<IncomingApplyStrategy | 'skip' | null> {
  const selected = await vscode.window.showQuickPick([
    { label: '$(git-merge) Merge', description: 'Preserve both sides when that can be proven safe.', strategy: 'merge' as const },
    { label: '$(replace-all) Replace', description: 'Incoming becomes the non-ignored local working tree.', strategy: 'replace' as const },
    { label: '$(circle-slash) Skip', description: 'Do not change this Workspace.', strategy: 'skip' as const }
  ], { title: `${label} · ${sourceComparisonLabel(comparison)}`, placeHolder: 'Merge / Replace', ignoreFocusOut: true });
  return selected?.strategy ?? null;
}

async function chooseDirtyResolution(plan: WorkspaceApplyPlan): Promise<{ resolution: DirtyResolution; switchToMerge: boolean } | null> {
  if (!plan.hasGit) return { resolution: 'none', switchToMerge: false };
  const fact = await repositoryFact(plan.local.root);
  if (fact.clean) return { resolution: 'none', switchToMerge: false };
  const branchDiffers = Boolean(plan.incomingRef && fact.branch !== plan.incomingRef);
  const canPreserve = !branchDiffers && plan.safePreserveMerge && !overlapAny(await dirtyWorkingTreePaths(plan.local.root), plan.changedPaths);
  const options: Array<vscode.QuickPickItem & { resolution: DirtyResolution; switchToMerge?: boolean }> = [];
  if (canPreserve) options.push({
    label: plan.strategy === 'replace' ? '$(git-merge) Preserve + Merge instead' : '$(git-merge) Preserve + Merge',
    description: 'Dirty paths do not overlap the proven Git merge path set.', resolution: 'preserve', switchToMerge: plan.strategy === 'replace'
  });
  options.push(
    { label: '$(archive) Stash local changes', description: 'Preserve tracked + untracked work in Git stash before execution.', resolution: 'stash' },
    { label: '$(git-commit) Commit local changes', description: 'Commit first; execution waits for the final confirmation.', resolution: 'commit' }
  );
  const selected = await vscode.window.showQuickPick(options, { title: `${plan.label} · local changes`, placeHolder: 'Choose a safe precondition, or Esc to cancel everything', ignoreFocusOut: true });
  return selected ? { resolution: selected.resolution, switchToMerge: Boolean(selected.switchToMerge) } : null;
}

async function confirmBranchSwitch(plan: WorkspaceApplyPlan): Promise<boolean | null> {
  if (!plan.hasGit || !plan.incomingRef || plan.localBranch === plan.incomingRef) return false;
  if (!await localBranchExists(plan.local.root, plan.incomingRef)) {
    await vscode.window.showWarningMessage(`${plan.label}: Incoming branch ${plan.incomingRef} is not available as a local branch. No changes were made.`, { modal: true }, 'Cancel');
    return null;
  }
  const targetCommit = await resolveCommit(plan.local.root, `refs/heads/${plan.incomingRef}`);
  const targetTree = targetCommit ? await listGitCommitTree(plan.local.root, targetCommit) : null;
  const ignoredLocal = await listIgnoredFiles(plan.local.root);
  const ignoredCollisions = targetTree ? ignoredLocal.filter((ignored) => [...targetTree.keys()].some((tracked) => pathOverlap(ignored, tracked))) : [];
  if (ignoredCollisions.length) {
    await vscode.window.showWarningMessage(
      `${plan.label}: branch switch is blocked because ${ignoredCollisions.length} ignored local path${ignoredCollisions.length === 1 ? '' : 's'} would collide with tracked content on ${plan.incomingRef}. Tiinex will not overwrite ignored material.`,
      { modal: true },
      'Cancel'
    );
    return null;
  }
  const choice = await vscode.window.showWarningMessage(
    `${plan.label}: switch branch ${plan.localBranch || '(detached)'} → ${plan.incomingRef}?\n\nNo mutation occurs until the final Execute step.`,
    { modal: true },
    'Switch Branch',
    'Cancel'
  );
  return choice === 'Switch Branch' ? true : null;
}

async function preparePlan(
  runtime: Awaited<ReturnType<typeof prepareBundledRuntime>>,
  local: PackageWorkspaceChoice,
  snapshot: SnapshotMaterial,
  comparison: WorkspaceComparisonSummary,
  strategy: IncomingApplyStrategy,
  scratch: string
): Promise<WorkspaceApplyPlan | null> {
  const localCandidate = await qualifyWorkspaceRoot(runtime, local.root, snapshot.workspace.workspaceId);
  if (snapshot.candidate.repositoryIdentity && localCandidate.repositoryIdentity && snapshot.candidate.repositoryIdentity !== localCandidate.repositoryIdentity) {
    throw new Error(`tiinex.incoming-apply.repository-identity-mismatch:${snapshot.workspace.workspaceId}`);
  }
  const hasGit = await isGitWorkspace(local.root);
  if (!hasGit) throw new Error(`tiinex.incoming-apply.git-repository-required:${snapshot.workspace.workspaceId}`);
  const fact = await repositoryFact(local.root);
  const incomingRef = String(snapshot.candidate.ref || snapshot.workspace.ref || '').trim();
  const localBranch = String(fact?.branch || '').trim();
  const localInventory = await walkTree(local.root);
  const ignoreCandidates = [...new Set([...localInventory.files, ...localInventory.symlinks, ...snapshot.files])];
  const preOperationIgnoredPaths = await ignoredPaths(local.root, ignoreCandidates, hasGit, scratch);
  let incomingCommit = hasGit ? await exactIncomingCommit(local.root, snapshot, incomingRef) : '';
  let changedPaths: string[] = [];
  let mergeMode: MergeMode = incomingCommit ? 'git-native' : 'file-safe';
  if (incomingCommit) {
    const base = await mergeBase(local.root, 'HEAD', incomingCommit);
    if (!base) { incomingCommit = ''; mergeMode = 'file-safe'; }
    else {
      changedPaths = await changedPathsBetween(local.root, base, incomingCommit);
      if (overlapAny(changedPaths, preOperationIgnoredPaths)) { incomingCommit = ''; mergeMode = 'file-safe'; changedPaths = []; }
    }
  }
  let actualStrategy = strategy;
  let safePreserveMerge = mergeMode === 'git-native';
  if (mergeMode === 'file-safe') {
    const analysis = await analyzeFileMerge(local.root, snapshot, hasGit, scratch, preOperationIgnoredPaths);
    safePreserveMerge = analysis.conflicts.length === 0;
    if (safePreserveMerge) changedPaths = analysis.writes;
    if (actualStrategy === 'merge' && analysis.conflicts.length) {
      const sample = analysis.conflicts.slice(0, 5).join(', ');
      const choice = await vscode.window.showWarningMessage(
        `${snapshot.workspace.label || snapshot.workspace.workspaceId}: a common Git base is not provable and ${analysis.conflicts.length} overlapping file${analysis.conflicts.length === 1 ? '' : 's'} differ (${sample}${analysis.conflicts.length > 5 ? ', …' : ''}).\n\nTiinex will not guess a winner.`,
        { modal: true },
        'Use Replace',
        'Skip Workspace',
        'Cancel'
      );
      if (choice === 'Use Replace') actualStrategy = 'replace';
      else if (choice === 'Skip Workspace') return null;
      else throw new Error('tiinex.incoming-apply.cancelled');
    }
  }
  const plan: WorkspaceApplyPlan = {
    workspaceId: snapshot.workspace.workspaceId,
    label: snapshot.workspace.label || snapshot.workspace.workspaceId,
    local,
    snapshot,
    comparison,
    strategy: actualStrategy,
    hasGit,
    localBranch,
    incomingRef,
    switchBranch: false,
    dirtyResolution: 'none',
    commitMessage: '',
    mergeMode,
    incomingCommit,
    changedPaths,
    safePreserveMerge,
    preOperationIgnoredPaths,
    mutationPrecondition: ''
  };
  const dirty = await chooseDirtyResolution(plan);
  if (!dirty) throw new Error('tiinex.incoming-apply.cancelled');
  plan.dirtyResolution = dirty.resolution;
  if (dirty.switchToMerge) plan.strategy = 'merge';
  const switchBranch = await confirmBranchSwitch(plan);
  if (switchBranch === null) throw new Error('tiinex.incoming-apply.cancelled');
  plan.switchBranch = switchBranch;
  plan.mutationPrecondition = await mutationPrecondition(plan.local.root);
  return plan;
}

async function copyIncomingFiles(snapshot: SnapshotMaterial, localRoot: string, files: string[]): Promise<void> {
  for (const relative of files) {
    const target = safeTarget(localRoot, relative);
    await mkdir(path.dirname(target), { recursive: true });
    await copyFile(safeTarget(snapshot.root, relative), target);
  }
}

async function applyFileMerge(plan: WorkspaceApplyPlan, scratch: string): Promise<boolean> {
  const analysis = await analyzeFileMerge(plan.local.root, plan.snapshot, plan.hasGit, scratch, plan.preOperationIgnoredPaths);
  if (analysis.conflicts.length) throw new Error(`tiinex.incoming-apply.merge-conflicts:${plan.workspaceId}:${analysis.conflicts.join(',')}`);
  if (!analysis.writes.length) return false;
  const written: string[] = [];
  try {
    for (const relative of analysis.writes) {
      const target = safeTarget(plan.local.root, relative);
      await mkdir(path.dirname(target), { recursive: true });
      await copyFile(safeTarget(plan.snapshot.root, relative), target);
      written.push(relative);
    }
    return true;
  } catch (error) {
    for (const relative of written.reverse()) await rm(safeTarget(plan.local.root, relative), { recursive: true, force: true });
    throw error;
  }
}

async function applyReplace(plan: WorkspaceApplyPlan, scratch: string): Promise<boolean> {
  const local = await walkTree(plan.local.root);
  const all = [...new Set([...local.files, ...local.symlinks, ...plan.snapshot.files])];
  const ignored = new Set([...plan.preOperationIgnoredPaths, ...await ignoredPaths(plan.local.root, all, plan.hasGit, scratch)]);
  const protectedPaths = [...new Set([...local.symlinks, ...all.filter((item) => ignored.has(item))])].sort();
  const incomingFiles = plan.snapshot.files.filter((item) => !ignored.has(item));
  const collisions = incomingFiles.filter((item) => protectedPaths.some((protectedPath) => pathOverlap(item, protectedPath)));
  if (collisions.length) throw new Error(`tiinex.incoming-apply.ignored-or-symlink-collision:${plan.workspaceId}:${collisions.join(',')}`);
  const replaceable = local.files.filter((item) => !ignored.has(item));
  const backupRoot = path.join(scratch, `b${Math.max(0, plan.snapshot.files.length)}`);
  for (const relative of replaceable) {
    const target = safeTarget(backupRoot, relative);
    await mkdir(path.dirname(target), { recursive: true });
    await copyFile(safeTarget(plan.local.root, relative), target);
  }
  let mutated = false;
  try {
    for (const relative of replaceable) { await rm(safeTarget(plan.local.root, relative), { recursive: true, force: true }); mutated = true; }
    for (const relative of incomingFiles) {
      const target = safeTarget(plan.local.root, relative);
      await rm(target, { recursive: true, force: true });
      await mkdir(path.dirname(target), { recursive: true });
      await copyFile(safeTarget(plan.snapshot.root, relative), target);
      mutated = true;
    }
    return mutated;
  } catch (error) {
    for (const relative of incomingFiles) await rm(safeTarget(plan.local.root, relative), { recursive: true, force: true });
    await copyIncomingFiles({ ...plan.snapshot, root: backupRoot }, plan.local.root, replaceable);
    throw error;
  }
}

async function executePlan(plan: WorkspaceApplyPlan, scratch: string): Promise<{ affected: boolean; conflicts: boolean }> {
  if (plan.hasGit) {
    if (plan.dirtyResolution === 'stash') await stashWorkingTree(plan.local.root);
    else if (plan.dirtyResolution === 'commit') {
      plan.commitMessage = await generateTiinexCommitMessage(plan.local.root, nodeExecutable());
      await commitWorkingTreeWithMessage(plan.local.root, plan.commitMessage);
    }
    if (plan.switchBranch) await switchToExistingLocalBranch(plan.local.root, plan.incomingRef);
  }
  if (plan.strategy === 'merge' && plan.mergeMode === 'git-native' && plan.incomingCommit) {
    const result = await mergeCommitNoCommit(plan.local.root, plan.incomingCommit);
    return { affected: !result.alreadyUpToDate || result.conflicts.length > 0, conflicts: result.conflicts.length > 0 };
  }
  if (plan.strategy === 'merge') return { affected: await applyFileMerge(plan, scratch), conflicts: false };
  return { affected: await applyReplace(plan, scratch), conflicts: false };
}

function planSummary(plans: WorkspaceApplyPlan[]): string {
  return plans.map((plan) => {
    const strategy = plan.strategy === 'merge' ? '↔ Merge' : '⇄ Replace';
    const mode = plan.strategy === 'merge' ? (plan.mergeMode === 'git-native' ? 'Git-native' : 'file-safe') : 'snapshot';
    const pre = plan.dirtyResolution === 'none' ? '' : ` · ${plan.dirtyResolution}`;
    const branch = plan.switchBranch ? ` · branch → ${plan.incomingRef}` : '';
    const delta = ` · ${sourceComparisonLabel(plan.comparison)}`;
    return `${strategy}  ${plan.label}  (${mode}${pre}${branch}${delta})`;
  }).join('\n');
}

export async function applyIncomingWorkspaces(extensionPath: string, index: IndexedCarrierPackage, workspaceIds: string[], forcedStrategy?: IncomingApplyStrategy): Promise<IncomingApplyResult | null> {
  const requested = [...new Set(workspaceIds.map((item) => String(item || '').trim()).filter(Boolean))];
  if (!requested.length) return { affectedWorkspaceIds: [], conflictWorkspaceIds: [] };
  return withIncomingApplyMutex(async () => {
    const scratch = await mkdtemp(path.join(os.tmpdir(), 'ti-'));
    const runtime = await prepareBundledRuntime(extensionPath, nodeExecutable());
    try {
      return await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: 'Tiinex applying Incoming',
          cancellable: false
        },
        async (progress) => {
          progress.report({ message: 'Loading local workspaces...' });
          const locals = await loadLocalWorkspaceChoices(extensionPath);
          const localById = new Map(locals.map((item) => [item.workspaceId, item]));
          const plans: WorkspaceApplyPlan[] = [];
          const exactWorkspaceIds: string[] = [];
          let ordinal = 0;
          for (const workspaceId of requested) {
            const workspace = index.workspaces.find((item) => item.workspaceId === workspaceId);
            if (!workspace) throw new Error(`tiinex.incoming-apply.workspace-missing:${workspaceId}`);
            const local = localById.get(workspaceId);
            if (!local) {
              const choice = await vscode.window.showWarningMessage(`${workspace.label || workspaceId}: no qualified local VS Code Workspace with the same identity is open.`, { modal: true }, 'Skip Workspace', 'Cancel');
              if (choice === 'Skip Workspace') continue;
              return null;
            }

            progress.report({ message: `Comparing ${workspace.label || workspaceId}...` });
            let comparisonResult: SourceFrontierComparisonResult;
            try {
              comparisonResult = await compareIncomingWorkspaceToLocal(runtime, index.packagePath, local.root, workspaceId);
            } catch (error) {
              const detail = shortError(error);
              if (detail.startsWith('tiinex.source-frontier.compare-blocked:')) {
                throw new Error(`tiinex.incoming-apply.shared-compare-blocked:${detail.slice('tiinex.source-frontier.compare-blocked:'.length)}`);
              }
              throw new Error(`tiinex.incoming-apply.shared-compare-unavailable:${detail}`);
            }
            const comparison = sourceComparisonSummary(comparisonResult, workspaceId);
            if (comparison.state === 'exact') {
              exactWorkspaceIds.push(workspaceId);
              continue;
            }
            if (comparison.state !== 'changed') {
              const choice = await vscode.window.showWarningMessage(
                `${workspace.label || workspaceId}: shared source comparison is ${comparison.state || 'unavailable'}. Tiinex will not choose a merge winner without qualified byte-source evidence.`,
                { modal: true },
                'Skip Workspace',
                'Cancel'
              );
              if (choice === 'Skip Workspace') continue;
              return null;
            }

            const strategy = forcedStrategy || await chooseStrategy(workspace.label || workspaceId, comparison);
            if (!strategy) return null;
            if (strategy === 'skip') continue;
            progress.report({ message: `Preparing ${strategy === 'merge' ? 'merge' : 'replace'} plan for ${workspace.label || workspaceId}...` });
            const snapshot = await materializeSnapshot(runtime, index.packagePath, workspace, scratch, ordinal++);
            try {
              const plan = await preparePlan(runtime, local, snapshot, comparison, strategy, scratch);
              if (plan) plans.push(plan);
            } catch (error) {
              if (shortError(error).includes('tiinex.incoming-apply.cancelled')) return null;
              throw error;
            }
          }
          if (!plans.length) {
            if (exactWorkspaceIds.length) await vscode.window.showInformationMessage(`Tiinex comparison: ${exactWorkspaceIds.join(', ')} already match Incoming exactly.`);
            return { affectedWorkspaceIds: [], conflictWorkspaceIds: [] };
          }
          const mutationScope = plans.map((plan) => `• ${plan.label}: ${plan.local.root}`).join('\n');
          const requiresFinalConfirm = plans.some((plan) => plan.strategy === 'merge');
          if (requiresFinalConfirm) {
            const confirmed = await vscode.window.showWarningMessage(
              `Execute Incoming plan?\n\n${planSummary(plans)}\n\nMutation scope:\n${mutationScope}\n\nSafety: only these Workspace roots can change. .git is never replaced; ignored paths and symlinks are protected. Local Git state is re-checked after confirmation before mutation. Dirty work can only be preserved, stashed, or committed here — this flow never resets/cleans it. Nothing above has mutated local source.${plans.length > 1 ? '\n\nMulti-repo note: execution is guarded per repository but is not a cross-repository atomic transaction.' : ''}`,
              { modal: true },
              'Execute Plan',
              'Cancel'
            );
            if (confirmed !== 'Execute Plan') return null;
          }
          progress.report({ message: 'Re-checking mutation preconditions...' });
          await assertMutationPreconditions(plans);
          try {
            await vscode.commands.executeCommand('workbench.view.explorer');
            for (const plan of plans) await vscode.commands.executeCommand('revealInExplorer', vscode.Uri.file(plan.local.root));
          } catch {
            // Explorer reveal is best effort and must not block a checked mutation.
          }
          const affectedWorkspaceIds: string[] = [];
          const conflictWorkspaceIds: string[] = [];
          for (const plan of plans) {
            progress.report({ message: `${plan.strategy === 'merge' ? 'Merging' : 'Replacing'} ${plan.label}...` });
            const result = await executePlan(plan, scratch);
            if (result.affected) affectedWorkspaceIds.push(plan.workspaceId);
            if (result.conflicts) {
              conflictWorkspaceIds.push(plan.workspaceId);
              await vscode.commands.executeCommand('workbench.view.scm');
            }
          }
          if (conflictWorkspaceIds.length) {
            await vscode.window.showWarningMessage(`Tiinex left real Git merge conflicts in ${conflictWorkspaceIds.join(', ')}. Resolve them with VS Code Source Control / Merge Editor, then commit when ready.`);
          }
          return { affectedWorkspaceIds, conflictWorkspaceIds };
        }
      );
    } finally {
      await runtime.dispose();
      await rm(scratch, { recursive: true, force: true });
    }
  });
}
