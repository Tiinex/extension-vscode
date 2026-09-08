import os from 'node:os';
import path from 'node:path';
import { copyFile, lstat, mkdir, mkdtemp, rm } from 'node:fs/promises';
import * as vscode from 'vscode';
import { ignoredPathCollisions, safeRelativePath, safeTarget } from './core/paths';
import { LandingCommitResult, listIgnoredFiles, listTrackedFiles, LocalRepositoryFact, preflightExistingLocalBranch, pushExactLandingCommit, repositoryFact, stageLandingCommit, switchToExistingLocalBranch } from './host/git';
import { extractZipBuffer, inspectZipBuffer, readExactZipEntryFromFile, sha256Hex } from './host/zip';
import { orientPackage, prepareBundledRuntime, preparePackageRuntime, projectWorkspaceLanding } from './tiinex/bootstrap';
import { LandingPlan, LandingWorkspace, OrientResult } from './tiinex/types';
import { repositoryRoots } from './vscode/gitApi';

interface PreparedWorkspace { plan: LandingWorkspace; archive: Buffer; incomingFiles: string[]; ignoredFiles: string[]; trackedFiles: string[] }
type Policy = 'no' | 'ask' | 'yes';

function nodeExecutable(): string { return vscode.workspace.getConfiguration('tiinex').get('nodePath', '').toString().trim() || process.execPath; }
function policy(name: 'commit' | 'push' | 'openHandoff'): Policy { const value = vscode.workspace.getConfiguration('tiinex.landing').get(name, 'no').toString(); return value === 'ask' || value === 'yes' ? value : 'no'; }
async function collectRepositoryFacts(): Promise<LocalRepositoryFact[]> { const facts: LocalRepositoryFact[] = []; for (const root of await repositoryRoots()) facts.push(await repositoryFact(root)); return facts; }
function findingsText(plan: LandingPlan): string { return plan.findings.filter((item) => item.severity === 'error').map((item) => `${item.code}: ${item.message}`).join('\n') || `Landing plan status: ${plan.status}`; }

async function resolveSelections(plan: LandingPlan, facts: LocalRepositoryFact[], existing: Record<string, string>): Promise<Record<string, string>> {
  const selections = { ...existing };
  for (const workspace of plan.workspaces.filter((item) => item.state === 'ambiguous')) {
    const candidates = (workspace.candidateRepositoryIds || []).map((id) => facts.find((fact) => fact.id === id)).filter((value): value is LocalRepositoryFact => Boolean(value));
    if (!candidates.length) throw new Error(`tiinex.landing.ambiguous-without-candidates:${workspace.workspaceId}`);
    const selected = await vscode.window.showQuickPick(candidates.map((repo) => ({ label: repo.root, description: repo.repository, repo })), { placeHolder: `Select the local Git repository for qualified Workspace ${workspace.workspaceId}`, canPickMany: false, ignoreFocusOut: true });
    if (!selected) throw new Error('tiinex.landing.repository-selection-cancelled');
    selections[workspace.workspaceId] = selected.repo.id;
  }
  return selections;
}

async function planUntilResolved(packagePath: string, runtime: Awaited<ReturnType<typeof prepareBundledRuntime>>, facts: LocalRepositoryFact[]): Promise<{ plan: LandingPlan; selections: Record<string, string> }> {
  let selections: Record<string, string> = {};
  for (let pass = 0; pass < 3; pass += 1) {
    const plan = await projectWorkspaceLanding(runtime, packagePath, facts, selections);
    if (!plan.workspaces.some((item) => item.state === 'ambiguous')) return { plan, selections };
    selections = await resolveSelections(plan, facts, selections);
  }
  throw new Error('tiinex.landing.selection-did-not-converge');
}

async function qualifyRequiredBranches(packagePath: string, runtime: Awaited<ReturnType<typeof prepareBundledRuntime>>, current: { plan: LandingPlan; selections: Record<string, string> }): Promise<{ plan: LandingPlan; selections: Record<string, string> }> {
  const mismatches = current.plan.workspaces.filter((item) => item.state === 'blocked' && item.reasons?.length && item.reasons.every((reason) => reason === 'ref-branch-mismatch'));
  if (!mismatches.length) return current;
  for (const item of mismatches) {
    if (!item.repository?.root || !item.source?.ref) throw new Error(`tiinex.landing.branch-switch-target-unresolved:${item.workspaceId}`);
    await preflightExistingLocalBranch(item.repository.root, item.source.ref);
  }
  const text = mismatches.map((item) => `${item.workspaceId}: ${item.repository?.branch || '(detached)'} → ${item.source?.ref}`).join('\n');
  const accepted = await vscode.window.showWarningMessage(`Qualified Workspace sources require these existing local branches before landing:\n\n${text}\n\nAll branch switches are preflighted clean and local. Declining aborts the whole landing before Workspace writes.`, { modal: true }, 'Switch Required Branches');
  if (accepted !== 'Switch Required Branches') throw new Error('tiinex.landing.branch-switch-declined');
  for (const item of mismatches) await switchToExistingLocalBranch(item.repository!.root, item.source!.ref!);
  const facts = await collectRepositoryFacts();
  return { plan: await projectWorkspaceLanding(runtime, packagePath, facts, current.selections), selections: current.selections };
}

function readySignature(plan: LandingPlan): string { return JSON.stringify(plan.affected.map((item) => ({ workspaceId: item.workspaceId, archivePackagePath: item.archivePackagePath, sha256: item.archiveSha256, repositoryId: item.repository?.id, root: item.repository?.root })).sort((a, b) => a.workspaceId.localeCompare(b.workspaceId))); }

async function prepareWorkspace(packagePath: string, workspace: LandingWorkspace): Promise<PreparedWorkspace> {
  if (!workspace.repository?.root) throw new Error(`tiinex.landing.repository-missing:${workspace.workspaceId}`);
  const archive = await readExactZipEntryFromFile(packagePath, workspace.archivePackagePath);
  if (archive.byteLength !== workspace.archiveBytes) throw new Error(`tiinex.landing.archive-byte-size-mismatch:${workspace.workspaceId}`);
  if (sha256Hex(archive) !== String(workspace.archiveSha256 || '').toLowerCase()) throw new Error(`tiinex.landing.archive-sha256-mismatch:${workspace.workspaceId}`);
  const entries = await inspectZipBuffer(archive);
  const incomingFiles = entries.filter((entry) => !entry.directory).map((entry) => safeRelativePath(entry.path));
  if (incomingFiles.some((item) => item === '.git' || item.startsWith('.git/'))) throw new Error(`tiinex.landing.incoming-git-path:${workspace.workspaceId}`);
  const trackedFiles = (await listTrackedFiles(workspace.repository.root)).map(safeRelativePath);
  const ignoredFiles = (await listIgnoredFiles(workspace.repository.root)).map(safeRelativePath);
  const collisions = ignoredPathCollisions(incomingFiles, ignoredFiles);
  if (collisions.length) throw new Error(`tiinex.landing.ignored-collision:${workspace.workspaceId}:${collisions.join(',')}`);
  for (const tracked of trackedFiles) {
    const target = safeTarget(workspace.repository.root, tracked);
    try { if ((await lstat(target)).isDirectory()) throw new Error(`tiinex.landing.tracked-directory-unsupported:${workspace.workspaceId}:${tracked}`); }
    catch (error) { if ((error as NodeJS.ErrnoException)?.code !== 'ENOENT') throw error; }
  }
  return { plan: workspace, archive, incomingFiles, ignoredFiles, trackedFiles };
}

async function applyWorkspaceSnapshot(prepared: PreparedWorkspace): Promise<void> {
  const root = prepared.plan.repository?.root;
  if (!root) throw new Error(`tiinex.landing.repository-missing:${prepared.plan.workspaceId}`);
  if (!(await repositoryFact(root)).clean) throw new Error(`tiinex.landing.worktree-changed-before-write:${prepared.plan.workspaceId}`);
  const collisions = ignoredPathCollisions(prepared.incomingFiles, (await listIgnoredFiles(root)).map(safeRelativePath));
  if (collisions.length) throw new Error(`tiinex.landing.ignored-collision-before-write:${prepared.plan.workspaceId}:${collisions.join(',')}`);
  const temp = await mkdtemp(path.join(os.tmpdir(), `tiinex-vscode-${prepared.plan.workspaceId}-`));
  try {
    await extractZipBuffer(prepared.archive, temp);
    for (const tracked of prepared.trackedFiles) await rm(safeTarget(root, tracked), { force: true });
    for (const relative of prepared.incomingFiles) { const target = safeTarget(root, relative); await mkdir(path.dirname(target), { recursive: true }); await copyFile(safeTarget(temp, relative), target); }
  } finally { await rm(temp, { recursive: true, force: true }); }
}

async function askPolicy(value: Policy, message: string, action: string): Promise<boolean> {
  if (value === 'yes') return true;
  if (value === 'no') return false;
  return await vscode.window.showWarningMessage(message, { modal: true }, action) === action;
}

async function postLandingGit(plan: LandingPlan): Promise<{ commits: Map<string, LandingCommitResult>; pushed: number }> {
  const roots = [...new Set(plan.affected.map((item) => item.repository?.root).filter((value): value is string => Boolean(value)))];
  const commits = new Map<string, LandingCommitResult>();
  const commitPolicy = policy('commit');
  if (await askPolicy(commitPolicy, `Create one Tiinex commit for landing changes in ${roots.length} affected repositor${roots.length === 1 ? 'y' : 'ies'}?\n\n${roots.join('\n')}`, 'Commit Landing Changes')) {
    for (const root of roots) if (!(await repositoryFact(root)).clean) commits.set(root, await stageLandingCommit(root, nodeExecutable()));
  }
  const pushPolicy = policy('push');
  if (!commits.size) {
    if (pushPolicy !== 'no') await vscode.window.showInformationMessage('Tiinex did not push: no exact landing-created commit exists in this run.');
    return { commits, pushed: 0 };
  }
  let pushed = 0;
  const detail = [...commits.entries()].map(([root, item]) => `${root}\n  ${item.commitSha} → ${item.upstream}`).join('\n');
  if (await askPolicy(pushPolicy, `Push exactly these landing-created commits to their unchanged configured upstreams?\n\n${detail}`, 'Push Exact Landing Commits')) {
    for (const [root, commit] of commits) { await pushExactLandingCommit(root, commit); pushed += 1; }
  }
  return { commits, pushed };
}

function selectedRoute(orientation: OrientResult): any | null {
  const id = String((orientation as any)?.selection?.implicitRouteId || (orientation as any)?.entrypoint?.projection?.selection?.implicitRouteId || '');
  if (!id) return null;
  const routes = Array.isArray((orientation as any)?.routes) ? (orientation as any).routes : [];
  const matches = routes.filter((item: any) => item?.id === id && item?.state === 'qualified');
  return matches.length === 1 ? matches[0] : null;
}

async function openSelectedHandoff(orientation: OrientResult, plan: LandingPlan): Promise<boolean> {
  const openPolicy = policy('openHandoff');
  if (openPolicy === 'no') return false;
  const route = selectedRoute(orientation);
  if (!route) return false;
  const workspace = plan.affected.find((item) => item.workspaceId === route.workspaceId);
  if (!workspace?.repository?.root || !route.workspaceRelativeHandoffPath) throw new Error('tiinex.landing.selected-handoff-target-unresolved');
  if (!await askPolicy(openPolicy, `Open the exact selected qualified Handoff after landing?\n\n${route.workspaceRelativeHandoffPath}`, 'Open Handoff')) return false;
  const target = safeTarget(workspace.repository.root, safeRelativePath(route.workspaceRelativeHandoffPath));
  const document = await vscode.workspace.openTextDocument(target);
  await vscode.window.showTextDocument(document, { preview: false });
  return true;
}

function policySummary(): string { return `Post-landing policies: commit=${policy('commit')}, push=${policy('push')}, openHandoff=${policy('openHandoff')}. The shared landing plan itself never commits or pushes.`; }

export async function landHandoffPackage(packagePath: string, extensionPath: string): Promise<void> {
  const ingressRuntime = await preparePackageRuntime(packagePath, nodeExecutable());
  const sharedRuntime = await prepareBundledRuntime(extensionPath, nodeExecutable());
  try {
    const orientation = await orientPackage(ingressRuntime, packagePath);
    const initialFacts = await collectRepositoryFacts();
    let initial = await planUntilResolved(packagePath, sharedRuntime, initialFacts);
    initial = await qualifyRequiredBranches(packagePath, sharedRuntime, initial);
    if (initial.plan.status !== 'ready' || !initial.plan.affected.length) throw new Error(`tiinex.landing.plan-blocked:\n${findingsText(initial.plan)}`);
    const initialPrepared: PreparedWorkspace[] = [];
    for (const workspace of initial.plan.affected) initialPrepared.push(await prepareWorkspace(packagePath, workspace));
    const mapping = initial.plan.affected.map((item) => `${item.workspaceId} → ${item.repository?.root || '(unresolved)'}`).join('\n');
    const confirmed = await vscode.window.showWarningMessage(`${initial.plan.confirmation.statement}\n\n${mapping}\n\n${policySummary()}`, { modal: true }, 'Land Qualified Workspaces');
    if (confirmed !== 'Land Qualified Workspaces') return;
    const finalFacts = await collectRepositoryFacts();
    const finalPlan = await projectWorkspaceLanding(sharedRuntime, packagePath, finalFacts, initial.selections);
    if (finalPlan.status !== 'ready' || readySignature(finalPlan) !== readySignature(initial.plan)) throw new Error('tiinex.landing.plan-changed-after-confirmation');
    const finalPrepared: PreparedWorkspace[] = [];
    for (const workspace of finalPlan.affected) finalPrepared.push(await prepareWorkspace(packagePath, workspace));
    for (const prepared of finalPrepared) await applyWorkspaceSnapshot(prepared);
    const git = await postLandingGit(finalPlan);
    const opened = await openSelectedHandoff(orientation, finalPlan);
    await vscode.window.showInformationMessage(`Tiinex landed ${finalPrepared.length} qualified Workspace${finalPrepared.length === 1 ? '' : 's'}; created ${git.commits.size} landing commit${git.commits.size === 1 ? '' : 's'}, pushed ${git.pushed}, opened Handoff=${opened ? 'yes' : 'no'}.`);
  } finally { await sharedRuntime.dispose(); await ingressRuntime.dispose(); }
}
