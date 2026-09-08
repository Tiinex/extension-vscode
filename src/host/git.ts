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

async function branchAndUpstream(root: string, runner: ProcessRunner): Promise<{ branch: string; upstream: string }> {
  const branchResult = await runner('git', ['symbolic-ref', '--quiet', '--short', 'HEAD'], { cwd: root });
  if (branchResult.code !== 0 || !branchResult.stdout.trim()) throw new Error('tiinex.git.detached-head');
  const branch = branchResult.stdout.trim();
  const upstreamResult = await runner('git', ['rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{u}'], { cwd: root });
  if (upstreamResult.code !== 0 || !upstreamResult.stdout.trim()) throw new Error('tiinex.git.missing-upstream');
  return { branch, upstream: upstreamResult.stdout.trim() };
}

async function aheadBehind(root: string, runner: ProcessRunner): Promise<{ ahead: number; behind: number }> {
  const ahead = await runChecked('git', ['rev-list', '--count', '@{u}..HEAD'], { cwd: root }, runner);
  const behind = await runChecked('git', ['rev-list', '--count', 'HEAD..@{u}'], { cwd: root }, runner);
  return { ahead: Number(ahead.stdout.trim() || 0), behind: Number(behind.stdout.trim() || 0) };
}

export interface LandingCommitResult { branch: string; upstream: string; message: string; commitSha: string }

export async function stageLandingCommit(root: string, nodeExecutable: string, runner: ProcessRunner = runProcess): Promise<LandingCommitResult> {
  const fact = await repositoryFact(root, runner);
  if (fact.clean) throw new Error('tiinex.git.no-landing-changes');
  const { branch, upstream } = await branchAndUpstream(root, runner);
  const base = await aheadBehind(root, runner);
  if (base.ahead !== 0 || base.behind !== 0) throw new Error(`tiinex.git.upstream-not-aligned:${base.ahead}:${base.behind}`);
  await runChecked('git', ['add', '-A'], { cwd: root }, runner);
  const diff = await runner('git', ['diff', '--cached', '--quiet'], { cwd: root });
  if (diff.code === 0) throw new Error('tiinex.git.no-staged-changes');
  if (diff.code !== 1) throw new Error(`tiinex.git.staged-diff-failed:${diff.stderr.trim() || diff.stdout.trim() || diff.code}`);
  const message = await generateTiinexCommitMessage(root, nodeExecutable, runner);
  await runChecked('git', ['commit', '-m', message], { cwd: root }, runner);
  const head = await runChecked('git', ['rev-parse', 'HEAD'], { cwd: root }, runner);
  const commitSha = head.stdout.trim().toLowerCase();
  if (!/^[a-f0-9]{40,64}$/.test(commitSha)) throw new Error('tiinex.git.commit-sha-invalid');
  return { branch, upstream, message, commitSha };
}

export async function pushExactLandingCommit(root: string, commit: LandingCommitResult, runner: ProcessRunner = runProcess): Promise<void> {
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
