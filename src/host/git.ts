import path from 'node:path';
import { access } from 'node:fs/promises';
import { nodeProcessEnvironment, ProcessRunner, runChecked, runProcess } from './process';
import { sameRepositoryRoot } from '../core/repositoryPath';

export interface LocalRepositoryFact {
  id: string;
  root: string;
  repository: string;
  branch: string;
  clean: boolean;
}

function splitZero(value: string): string[] { return value.split('\0').map((item) => item.trim()).filter(Boolean); }

export async function repositoryFact(root: string, runner: ProcessRunner = runProcess): Promise<LocalRepositoryFact> {
  const resolved = path.resolve(root);
  const top = await runChecked('git', ['rev-parse', '--show-toplevel'], { cwd: resolved }, runner);
  if (!sameRepositoryRoot(top.stdout.trim(), resolved)) throw new Error(`tiinex.git.root-mismatch:${resolved}`);
  const remote = await runner('git', ['config', '--get', 'remote.origin.url'], { cwd: resolved });
  if (remote.code !== 0 && remote.code !== 1) throw new Error(`tiinex.git.remote-query-failed:${resolved}`);
  const branch = await runner('git', ['symbolic-ref', '--quiet', '--short', 'HEAD'], { cwd: resolved });
  if (branch.code !== 0 && branch.code !== 1) throw new Error(`tiinex.git.branch-query-failed:${resolved}`);
  const status = await runChecked('git', ['status', '--porcelain=v1', '-z', '--untracked-files=all'], { cwd: resolved }, runner);
  return { id: resolved, root: resolved, repository: remote.stdout.trim(), branch: branch.code === 0 ? branch.stdout.trim() : '', clean: status.stdout.length === 0 };
}

export async function listTrackedFiles(root: string, runner: ProcessRunner = runProcess): Promise<string[]> {
  const result = await runChecked('git', ['ls-files', '-z'], { cwd: root }, runner);
  return splitZero(result.stdout);
}

export async function listIgnoredFiles(root: string, runner: ProcessRunner = runProcess): Promise<string[]> {
  const result = await runChecked('git', ['ls-files', '--others', '-i', '--exclude-standard', '-z'], { cwd: root }, runner);
  return splitZero(result.stdout);
}

export async function listStagedPaths(root: string, runner: ProcessRunner = runProcess): Promise<string[]> {
  const result = await runChecked('git', ['diff', '--cached', '--name-only', '--diff-filter=ACMR', '-z'], { cwd: root }, runner);
  return splitZero(result.stdout).map((item) => item.replace(/\\/g, '/'));
}

export async function generateTiinexCommitMessage(root: string, nodeExecutable: string, runner: ProcessRunner = runProcess): Promise<string> {
  const helper = path.join(root, 'tools', 'tiinex-commit-message.mjs');
  try { await access(helper); } catch { throw new Error(`tiinex.git.commit-helper-missing:${helper}`); }
  const result = await runChecked(nodeExecutable, [helper], { cwd: root, env: nodeProcessEnvironment() }, runner);
  const message = result.stdout.trim();
  if (!message) throw new Error('tiinex.git.commit-message-empty');
  return message;
}

function safeBranchName(value: string): string {
  const branch = String(value || '').trim();
  if (!branch || branch.startsWith('-') || branch.endsWith('.') || branch.includes('..') || branch.includes('@{') || /[\s~^:?*\\\[]/.test(branch)) throw new Error(`tiinex.git.branch-name-unsafe:${branch || '(empty)'}`);
  return branch;
}

export async function preflightExistingLocalBranch(root: string, expectedBranch: string, runner: ProcessRunner = runProcess): Promise<string> {
  const branch = safeBranchName(expectedBranch);
  const fact = await repositoryFact(root, runner);
  if (!fact.clean) throw new Error('tiinex.git.branch-switch-dirty-worktree');
  const valid = await runner('git', ['check-ref-format', '--branch', branch], { cwd: root });
  if (valid.code !== 0) throw new Error(`tiinex.git.branch-name-invalid:${branch}`);
  const exists = await runner('git', ['show-ref', '--verify', '--quiet', `refs/heads/${branch}`], { cwd: root });
  if (exists.code !== 0) throw new Error(`tiinex.git.branch-not-local:${branch}`);
  return branch;
}

export async function switchToExistingLocalBranch(root: string, expectedBranch: string, runner: ProcessRunner = runProcess): Promise<void> {
  const branch = await preflightExistingLocalBranch(root, expectedBranch, runner);
  await runChecked('git', ['switch', branch], { cwd: root }, runner);
  const after = await repositoryFact(root, runner);
  if (!after.clean || after.branch !== branch) throw new Error(`tiinex.git.branch-switch-verification-failed:${branch}`);
}

export async function stashWorkingTree(root: string, runner: ProcessRunner = runProcess): Promise<void> {
  const before = await repositoryFact(root, runner);
  if (before.clean) return;
  await runChecked('git', ['stash', 'push', '--include-untracked', '-m', 'Tiinex Receive: preserve local work before Workspace landing'], { cwd: root }, runner);
  if (!(await repositoryFact(root, runner)).clean) throw new Error('tiinex.git.stash-verification-failed');
}

export interface WorkingTreeCommitResult { message: string; commitSha: string }

export async function commitWorkingTree(root: string, nodeExecutable: string, runner: ProcessRunner = runProcess): Promise<WorkingTreeCommitResult> {
  if ((await repositoryFact(root, runner)).clean) throw new Error('tiinex.git.no-local-changes');
  await runChecked('git', ['add', '-A'], { cwd: root }, runner);
  const diff = await runner('git', ['diff', '--cached', '--quiet'], { cwd: root });
  if (diff.code === 0) throw new Error('tiinex.git.no-staged-changes');
  if (diff.code !== 1) throw new Error(`tiinex.git.staged-diff-failed:${diff.stderr.trim() || diff.stdout.trim() || diff.code}`);
  const message = await generateTiinexCommitMessage(root, nodeExecutable, runner);
  await runChecked('git', ['commit', '-m', message], { cwd: root }, runner);
  const head = await runChecked('git', ['rev-parse', 'HEAD'], { cwd: root }, runner);
  const commitSha = head.stdout.trim().toLowerCase();
  if (!/^[a-f0-9]{40,64}$/.test(commitSha)) throw new Error('tiinex.git.commit-sha-invalid');
  if (!(await repositoryFact(root, runner)).clean) throw new Error('tiinex.git.local-commit-verification-failed');
  return { message, commitSha };
}

export async function discardWorkingTree(root: string, runner: ProcessRunner = runProcess): Promise<void> {
  if ((await repositoryFact(root, runner)).clean) return;
  await runChecked('git', ['reset', '--hard', 'HEAD'], { cwd: root }, runner);
  // -f/-d removes untracked non-ignored material; ignored paths remain preserved.
  await runChecked('git', ['clean', '-fd'], { cwd: root }, runner);
  if (!(await repositoryFact(root, runner)).clean) throw new Error('tiinex.git.discard-verification-failed');
}

async function currentBranch(root: string, runner: ProcessRunner): Promise<string> {
  const branchResult = await runner('git', ['symbolic-ref', '--quiet', '--short', 'HEAD'], { cwd: root });
  if (branchResult.code !== 0 || !branchResult.stdout.trim()) throw new Error('tiinex.git.detached-head');
  return branchResult.stdout.trim();
}

async function optionalUpstream(root: string, runner: ProcessRunner): Promise<string> {
  const upstreamResult = await runner('git', ['rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{u}'], { cwd: root });
  if (upstreamResult.code === 1 || upstreamResult.code === 128) return '';
  if (upstreamResult.code !== 0) throw new Error('tiinex.git.upstream-query-failed');
  return upstreamResult.stdout.trim();
}

async function branchAndUpstream(root: string, runner: ProcessRunner): Promise<{ branch: string; upstream: string }> {
  const branch = await currentBranch(root, runner);
  const upstream = await optionalUpstream(root, runner);
  if (!upstream) throw new Error('tiinex.git.missing-upstream');
  return { branch, upstream };
}

async function aheadBehind(root: string, runner: ProcessRunner): Promise<{ ahead: number; behind: number }> {
  const ahead = await runChecked('git', ['rev-list', '--count', '@{u}..HEAD'], { cwd: root }, runner);
  const behind = await runChecked('git', ['rev-list', '--count', 'HEAD..@{u}'], { cwd: root }, runner);
  return { ahead: Number(ahead.stdout.trim() || 0), behind: Number(behind.stdout.trim() || 0) };
}

function protectedLandingPaths(values: string[]): string[] {
  const out = new Set<string>();
  for (const value of values) {
    const relative = String(value || '').replace(/\\/g, '/').replace(/^\.\//, '');
    if (!relative || relative === '.' || relative === '..' || relative.startsWith('../') || path.posix.isAbsolute(relative)) throw new Error(`tiinex.git.protected-path-invalid:${relative || '(empty)'}`);
    if (relative === '.git' || relative.startsWith('.git/')) throw new Error(`tiinex.git.protected-path-git:${relative}`);
    out.add(relative);
  }
  return [...out].sort();
}

async function excludeProtectedLandingPaths(root: string, protectedPaths: string[], runner: ProcessRunner): Promise<void> {
  const protectedSet = new Set(protectedLandingPaths(protectedPaths));
  if (!protectedSet.size) return;
  const stagedBefore = new Set(await listStagedPaths(root, runner));
  const leakedBefore = [...protectedSet].filter((item) => stagedBefore.has(item));
  for (let offset = 0; offset < leakedBefore.length; offset += 100) {
    await runChecked('git', ['reset', '--', ...leakedBefore.slice(offset, offset + 100)], { cwd: root }, runner);
  }
  const stagedAfter = new Set(await listStagedPaths(root, runner));
  const leakedAfter = [...protectedSet].filter((item) => stagedAfter.has(item));
  if (leakedAfter.length) throw new Error(`tiinex.git.protected-ignored-staged:${leakedAfter.join(',')}`);
}

export async function stageLandingChanges(root: string, protectedPaths: string[] = [], runner: ProcessRunner = runProcess): Promise<boolean> {
  await runChecked('git', ['add', '-A'], { cwd: root }, runner);
  await excludeProtectedLandingPaths(root, protectedPaths, runner);
  const diff = await runner('git', ['diff', '--cached', '--quiet'], { cwd: root });
  if (diff.code === 0) return false;
  if (diff.code !== 1) throw new Error(`tiinex.git.staged-diff-failed:${diff.stderr.trim() || diff.stdout.trim() || diff.code}`);
  return true;
}

export interface LandingCommitResult {
  branch: string;
  upstream: string;
  message: string;
  commitSha: string;
  pushEligible: boolean;
}

export async function stageLandingCommit(root: string, commitMessage: string, protectedPaths: string[] = [], runner: ProcessRunner = runProcess): Promise<LandingCommitResult> {
  const message = String(commitMessage || '').trim();
  if (!message) throw new Error('tiinex.git.landing-commit-message-empty');
  const fact = await repositoryFact(root, runner);
  if (fact.clean) throw new Error('tiinex.git.no-landing-changes');
  const branch = await currentBranch(root, runner);
  const upstream = await optionalUpstream(root, runner);
  let pushEligible = false;
  if (upstream) {
    const base = await aheadBehind(root, runner);
    pushEligible = base.ahead === 0 && base.behind === 0;
  }
  if (!await stageLandingChanges(root, protectedPaths, runner)) throw new Error('tiinex.git.no-staged-changes');
  await runChecked('git', ['commit', '-m', message], { cwd: root }, runner);
  const head = await runChecked('git', ['rev-parse', 'HEAD'], { cwd: root }, runner);
  const commitSha = head.stdout.trim().toLowerCase();
  if (!/^[a-f0-9]{40,64}$/.test(commitSha)) throw new Error('tiinex.git.commit-sha-invalid');
  return { branch, upstream, message, commitSha, pushEligible };
}

export async function pushExactLandingCommit(root: string, commit: LandingCommitResult, runner: ProcessRunner = runProcess): Promise<void> {
  if (!commit.upstream) throw new Error('tiinex.git.push-missing-upstream');
  if (!commit.pushEligible) throw new Error('tiinex.git.push-prelanding-upstream-not-aligned');
  const current = await branchAndUpstream(root, runner);
  if (current.branch !== commit.branch) throw new Error('tiinex.git.push-branch-changed');
  if (current.upstream !== commit.upstream) throw new Error('tiinex.git.push-upstream-changed');
  const head = await runChecked('git', ['rev-parse', 'HEAD'], { cwd: root }, runner);
  if (head.stdout.trim().toLowerCase() !== commit.commitSha) throw new Error('tiinex.git.push-head-changed');
  const relation = await aheadBehind(root, runner);
  if (relation.ahead !== 1 || relation.behind !== 0) throw new Error(`tiinex.git.push-unrelated-ahead:${relation.ahead}:${relation.behind}`);
  await runChecked('git', ['push'], { cwd: root }, runner);
}

export interface StageCommitPushResult { branch: string; upstream: string; message: string; commitSha?: string }

export async function stageCommitPush(root: string, nodeExecutable: string, runner: ProcessRunner = runProcess, validateStaged?: (stagedPaths: string[]) => Promise<void>): Promise<StageCommitPushResult> {
  // Preserve the explicit manual command while applying the same upstream safety as automatic post-landing flow.
  const { branch, upstream } = await branchAndUpstream(root, runner);
  await runChecked('git', ['add', '-A'], { cwd: root }, runner);
  const diff = await runner('git', ['diff', '--cached', '--quiet'], { cwd: root });
  if (diff.code === 0) throw new Error('tiinex.git.no-staged-changes');
  if (diff.code !== 1) throw new Error(`tiinex.git.staged-diff-failed:${diff.stderr.trim() || diff.stdout.trim() || diff.code}`);
  if (validateStaged) await validateStaged(await listStagedPaths(root, runner));
  const message = await generateTiinexCommitMessage(root, nodeExecutable, runner);
  await runChecked('git', ['commit', '-m', message], { cwd: root }, runner);
  const head = await runChecked('git', ['rev-parse', 'HEAD'], { cwd: root }, runner);
  const commitSha = head.stdout.trim().toLowerCase();
  await runChecked('git', ['push'], { cwd: root }, runner);
  return { branch, upstream, message, commitSha };
}
