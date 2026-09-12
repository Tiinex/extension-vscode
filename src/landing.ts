import os from 'node:os';
import path from 'node:path';
import { copyFile, lstat, mkdir, mkdtemp, rm } from 'node:fs/promises';
import * as vscode from 'vscode';
import { preferredNodeExecutable } from './host/nodeExecutable';
import { ignoredPathCollisions, safeRelativePath, safeTarget } from './core/paths';
import { preferredRepositoryParent, routesPreferredForRole } from './core/receiveUx';
import { sameRepositoryRoot } from './core/repositoryPath';
import { normalizePostStagePolicy } from './core/gitOperator';
import {
  commitWorkingTree,
  discardWorkingTree,
  listIgnoredFiles,
  listTrackedFiles,
  LocalRepositoryFact,
  repositoryFact,
  stageLandingChanges,
  stashWorkingTree,
  switchToExistingLocalBranch
} from './host/git';
import { extractZipBuffer, inspectZipBuffer, readExactZipEntryFromFile, sha256Hex } from './host/zip';
import { groundPackageForReview, orientPackage, prepareBundledRuntime, preparePackageRuntime, projectWorkspaceLanding } from './tiinex/bootstrap';
import { LandingPlan, LandingWorkspace, OrientResult } from './tiinex/types';
import { implicitQualifiedRoute, qualifiedRoutes, QualifiedRouteReceipt, receivedHandoffContext, ReceivedHandoffContext, withWorkspaceRoots } from './core/receivedHandoff';
import { addRepositoryToCurrentWorkspace, repositoryRoots, setRepositoryInput } from './vscode/gitApi';

interface PreparedWorkspace { plan: LandingWorkspace; archive: Buffer; incomingFiles: string[]; ignoredFiles: string[]; trackedFiles: string[] }
export interface LandingResult { received: ReceivedHandoffContext | null; workspaceRoots: Record<string, string>; affectedWorkspaceIds: string[] }
type StagePolicy = 'no' | 'yes';
type DirtyAction = 'stash' | 'commit' | 'discard' | 'skip';

function nodeExecutable(): string { return preferredNodeExecutable(vscode.workspace.getConfiguration('tiinex').get('nodePath', '').toString().trim()); }
function stagePolicy(): StagePolicy { return vscode.workspace.getConfiguration('tiinex.landing').get('stage', 'yes').toString() === 'no' ? 'no' : 'yes'; }
function postStagePolicy(): string { return normalizePostStagePolicy(vscode.workspace.getConfiguration('tiinex.git').get('postStagePolicy', 'do-nothing')); }
function rolePreference(): string { return vscode.workspace.getConfiguration('tiinex').get('operator.role', '').toString().trim(); }
function message(error: unknown): string { return error instanceof Error ? error.message : String(error); }
function findingsText(plan: LandingPlan): string { return plan.findings.filter((item) => item.severity === 'error').map((item) => `${item.code}: ${item.message}`).join('\n') || `Landing plan status: ${plan.status}`; }

function mergeFact(facts: LocalRepositoryFact[], fact: LocalRepositoryFact): LocalRepositoryFact[] {
  return [...facts.filter((item) => !sameRepositoryRoot(item.root, fact.root)), fact];
}

async function collectRepositoryFacts(extraRoots: string[] = []): Promise<LocalRepositoryFact[]> {
  const roots = [...await repositoryRoots()];
  for (const root of extraRoots) if (!roots.some((item) => sameRepositoryRoot(item, root))) roots.push(root);
  const facts: LocalRepositoryFact[] = [];
  for (const root of roots) facts.push(await repositoryFact(root));
  return facts;
}

async function resolveAmbiguousSelections(plan: LandingPlan, facts: LocalRepositoryFact[], selections: Record<string, string>, skipped: Set<string>): Promise<void> {
  for (const workspace of plan.workspaces.filter((item) => item.state === 'ambiguous' && !skipped.has(item.workspaceId))) {
    const candidates = (workspace.candidateRepositoryIds || []).map((id) => facts.find((fact) => fact.id === id)).filter((value): value is LocalRepositoryFact => Boolean(value));
    if (!candidates.length) { skipped.add(workspace.workspaceId); continue; }
    const selected = await vscode.window.showQuickPick([
      ...candidates.map((repo) => ({ label: path.basename(repo.root), description: repo.root, detail: repo.repository, repo })),
      { label: 'Skip this Workspace', description: 'Do not land this Workspace', detail: '', repo: null }
    ], { placeHolder: `Choose the local repository for ${workspace.title || workspace.workspaceId}`, canPickMany: false, ignoreFocusOut: true });
    if (!selected?.repo) { skipped.add(workspace.workspaceId); continue; }
    selections[workspace.workspaceId] = selected.repo.id;
  }
}

async function validateSelectedRepository(
  packagePath: string,
  runtime: Awaited<ReturnType<typeof prepareBundledRuntime>>,
  workspaceId: string,
  fact: LocalRepositoryFact,
  facts: LocalRepositoryFact[],
  selections: Record<string, string>
): Promise<LandingWorkspace | null> {
  const candidateSelections = { ...selections, [workspaceId]: fact.id };
  const candidateFacts = mergeFact(facts, fact);
  const projected = await projectWorkspaceLanding(runtime, packagePath, candidateFacts, candidateSelections, [workspaceId]);
  const workspace = projected.workspaces.find((item) => item.workspaceId === workspaceId) || null;
  return workspace?.repository?.root && sameRepositoryRoot(workspace.repository.root, fact.root) ? workspace : null;
}

async function selectMissingRepository(
  packagePath: string,
  runtime: Awaited<ReturnType<typeof prepareBundledRuntime>>,
  workspace: LandingWorkspace,
  facts: LocalRepositoryFact[],
  selections: Record<string, string>
): Promise<LocalRepositoryFact | null> {
  const defaultParent = preferredRepositoryParent(facts.map((item) => item.root));
  while (true) {
    const selected = await vscode.window.showOpenDialog({
      canSelectFiles: false,
      canSelectFolders: true,
      canSelectMany: false,
      title: `Locate existing Git repository for ${workspace.title || workspace.workspaceId}`,
      defaultUri: defaultParent ? vscode.Uri.file(defaultParent) : undefined,
      openLabel: 'Use Repository'
    });
    if (!selected?.length) return null;
    let fact: LocalRepositoryFact;
    try { fact = await repositoryFact(selected[0].fsPath); }
    catch (error) {
      const action = await vscode.window.showWarningMessage(`That folder is not a usable Git repository for Tiinex Receive.\n\n${message(error)}`, { modal: true }, 'Choose Another', 'Skip Workspace');
      if (action !== 'Choose Another') return null;
      continue;
    }
    const qualified = await validateSelectedRepository(packagePath, runtime, workspace.workspaceId, fact, facts, selections);
    if (!qualified) {
      const action = await vscode.window.showWarningMessage(`The selected repository does not match the qualified origin for ${workspace.workspaceId}. No source files were changed.`, { modal: true }, 'Choose Another', 'Skip Workspace');
      if (action !== 'Choose Another') return null;
      continue;
    }
    return fact;
  }
}

async function skipUntargetableWorkspaces(plan: LandingPlan, skipped: Set<string>): Promise<void> {
  for (const workspace of plan.workspaces.filter((item) => ['not-targetable', 'unavailable'].includes(item.state) && !skipped.has(item.workspaceId))) {
    await vscode.window.showWarningMessage(
      `${workspace.title || workspace.workspaceId} cannot be mapped to a local repository because the qualified Workspace material does not expose exactly one usable repository origin. Tiinex will not invent that identity.`,
      { modal: true },
      'Skip Workspace'
    );
    skipped.add(workspace.workspaceId);
  }
}

async function addMissingWorkspaces(
  packagePath: string,
  runtime: Awaited<ReturnType<typeof prepareBundledRuntime>>,
  plan: LandingPlan,
  facts: LocalRepositoryFact[],
  selections: Record<string, string>,
  skipped: Set<string>
): Promise<LocalRepositoryFact[]> {
  let currentFacts = [...facts];
  for (const workspace of plan.workspaces.filter((item) => item.state === 'unmatched' && !skipped.has(item.workspaceId))) {
    const action = await vscode.window.showInformationMessage(
      `${workspace.title || workspace.workspaceId} is carried by this Handoff Package but is not present in the current VS Code multi-root workspace.`,
      { modal: true },
      'Add Repository',
      'Skip Workspace'
    );
    if (action !== 'Add Repository') { skipped.add(workspace.workspaceId); continue; }
    const fact = await selectMissingRepository(packagePath, runtime, workspace, currentFacts, selections);
    if (!fact) { skipped.add(workspace.workspaceId); continue; }
    const addition = await addRepositoryToCurrentWorkspace(fact.root);
    if (addition.added && !addition.savedWorkspace) {
      await vscode.window.showInformationMessage(`Added ${path.basename(fact.root)} to the current multi-root session. Save the VS Code workspace to persist it as a .code-workspace entry.`);
    }
    // VS Code persists folder additions in a saved .code-workspace using its native workspace-folder writer,
    // which keeps portable relative folder paths when the workspace file and repository can be relativized.
    currentFacts = mergeFact(currentFacts, fact);
    selections[workspace.workspaceId] = fact.id;
  }
  return currentFacts;
}

async function chooseDirtyAction(workspace: LandingWorkspace): Promise<DirtyAction> {
  const root = workspace.repository?.root || workspace.workspaceId;
  const action = await vscode.window.showWarningMessage(
    `${workspace.title || workspace.workspaceId} has local changes:\n\n${root}\n\nChoose what Tiinex should do before replacing the qualified Workspace source. Ignored files are preserved by the landing step.`,
    { modal: true },
    'Stash',
    'Commit',
    'Discard',
    'Skip Workspace'
  );
  if (action === 'Stash') return 'stash';
  if (action === 'Commit') return 'commit';
  if (action === 'Discard') return 'discard';
  return 'skip';
}

async function cleanDirtyWorkspace(workspace: LandingWorkspace): Promise<boolean> {
  const root = workspace.repository?.root;
  if (!root) return false;
  const action = await chooseDirtyAction(workspace);
  if (action === 'skip') return false;
  if (action === 'stash') await stashWorkingTree(root);
  if (action === 'commit') await commitWorkingTree(root, nodeExecutable());
  if (action === 'discard') await discardWorkingTree(root);
  return true;
}

async function resolveBranchAndDirty(plan: LandingPlan, skipped: Set<string>): Promise<void> {
  for (const workspace of plan.workspaces) {
    if (skipped.has(workspace.workspaceId) || !workspace.repository?.root) continue;
    const reasons = new Set(workspace.reasons || []);
    if (reasons.has('ref-branch-mismatch')) {
      const targetBranch = String(workspace.source?.ref || '').trim();
      const action = await vscode.window.showWarningMessage(
        `${workspace.title || workspace.workspaceId} is on branch ${workspace.repository.branch || '(detached)'}, while the qualified Workspace source declares ${targetBranch || '(none)'}.`,
        { modal: true },
        'Switch Branch',
        'Skip Workspace'
      );
      if (action !== 'Switch Branch') { skipped.add(workspace.workspaceId); continue; }
      if (reasons.has('dirty-worktree') && !await cleanDirtyWorkspace(workspace)) { skipped.add(workspace.workspaceId); continue; }
      await switchToExistingLocalBranch(workspace.repository.root, targetBranch);
      continue;
    }
    if (reasons.has('dirty-worktree') && !await cleanDirtyWorkspace(workspace)) skipped.add(workspace.workspaceId);
  }
}

async function acknowledgeUnassertedBranches(plan: LandingPlan, skipped: Set<string>): Promise<void> {
  for (const workspace of plan.workspaces) {
    if (skipped.has(workspace.workspaceId) || workspace.state !== 'ready' || !workspace.repository?.root) continue;
    const declaredRef = String(workspace.source?.ref || '').trim();
    if (declaredRef) continue;
    const action = await vscode.window.showWarningMessage(
      `${workspace.title || workspace.workspaceId} matches a qualified repository origin, but its Workspace source declares no Ref.\n\nCurrent branch: ${workspace.repository.branch || '(detached HEAD)'}\nDeclared Ref: (none)\nRepository: ${workspace.repository.repository || workspace.source?.repository || '(unknown)'}\n\nTiinex cannot assert branch equivalence for this Workspace.`,
      { modal: true },
      'Use Current Branch',
      'Skip Workspace'
    );
    if (action !== 'Use Current Branch') skipped.add(workspace.workspaceId);
  }
}

interface ReadyWorkspacePick extends vscode.QuickPickItem { workspaceId: string }

async function selectReadyWorkspaces(plan: LandingPlan, skipped: Set<string>): Promise<void> {
  const ready = plan.workspaces.filter((workspace) => workspace.state === 'ready' && workspace.repository?.root && !skipped.has(workspace.workspaceId));
  if (!ready.length) return;
  const items: ReadyWorkspacePick[] = ready.map((workspace) => ({
    workspaceId: workspace.workspaceId,
    label: workspace.title || workspace.workspaceId,
    description: `${workspace.repository?.branch || '(detached)'} → ${String(workspace.source?.ref || '').trim() || '(Ref unasserted)'}`,
    detail: `${workspace.repository?.root || ''}\nOrigin: ${workspace.repository?.repository || workspace.source?.repository || '(unknown)'}`
  }));
  const selected = await vscode.window.showQuickPick(items, {
    canPickMany: true,
    ignoreFocusOut: true,
    placeHolder: 'Select every Workspace Tiinex may replace. Unselected Workspaces are skipped.'
  });
  const selectedIds = new Set((selected || []).map((item: ReadyWorkspacePick) => item.workspaceId));
  for (const workspace of ready) if (!selectedIds.has(workspace.workspaceId)) skipped.add(workspace.workspaceId);
}

function readySignature(plan: LandingPlan): string {
  return JSON.stringify(plan.affected.map((item) => ({ workspaceId: item.workspaceId, archivePackagePath: item.archivePackagePath, sha256: item.archiveSha256, repositoryId: item.repository?.id, root: item.repository?.root })).sort((a, b) => a.workspaceId.localeCompare(b.workspaceId)));
}

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
    // A clean Git worktree has no non-ignored untracked paths. Removing all tracked files therefore
    // leaves only .git plus ignored local material before the qualified full-source snapshot is overlaid.
    for (const tracked of prepared.trackedFiles) await rm(safeTarget(root, tracked), { recursive: true, force: true });
    for (const relative of prepared.incomingFiles) {
      const target = safeTarget(root, relative);
      await mkdir(path.dirname(target), { recursive: true });
      await copyFile(safeTarget(temp, relative), target);
    }
  } finally { await rm(temp, { recursive: true, force: true }); }
}

async function offerCommitMessage(root: string, commitMessage: string): Promise<void> {
  try { await setRepositoryInput(root, commitMessage); } catch { /* Git API may still be discovering a newly added workspace folder. */ }
  const action = await vscode.window.showInformationMessage(`Tiinex staged the received Workspace in ${path.basename(root)}. Use Tiinex Commit from Source Control to review/commit it.`, 'Copy Commit Message');
  if (action === 'Copy Commit Message') await vscode.env.clipboard.writeText(commitMessage);
}

function trustedLandingCommitMessage(plan: LandingPlan, root: string): string {
  const workspaceIds = plan.affected
    .filter((item) => item.repository?.root && sameRepositoryRoot(item.repository.root, root))
    .map((item) => item.workspaceId)
    .sort();
  if (!workspaceIds.length) throw new Error(`tiinex.landing.commit-message-workspace-unresolved:${root}`);
  return `Tiinex Receive: ${workspaceIds.join(', ')}`;
}

function protectedIgnoredByRoot(prepared: PreparedWorkspace[]): Map<string, string[]> {
  const out = new Map<string, Set<string>>();
  for (const item of prepared) {
    const root = item.plan.repository?.root;
    if (!root) continue;
    let target = [...out.keys()].find((candidate) => sameRepositoryRoot(candidate, root));
    if (!target) { target = root; out.set(target, new Set()); }
    const set = out.get(target)!;
    for (const relative of item.ignoredFiles) set.add(relative);
  }
  return new Map([...out.entries()].map(([root, values]) => [root, [...values].sort()]));
}

async function postLandingGit(plan: LandingPlan, prepared: PreparedWorkspace[]): Promise<{ staged: number }> {
  if (stagePolicy() === 'no') return { staged: 0 };
  const roots = [...new Set(plan.affected.map((item) => item.repository?.root).filter((value): value is string => Boolean(value)))];
  const protectedByRoot = protectedIgnoredByRoot(prepared);
  const changedRoots: string[] = [];
  for (const root of roots) {
    const protectedPaths = [...protectedByRoot.entries()].find(([candidate]) => sameRepositoryRoot(candidate, root))?.[1] || [];
    if (!await stageLandingChanges(root, protectedPaths)) continue;
    changedRoots.push(root);
    if (postStagePolicy() === 'do-nothing') await offerCommitMessage(root, trustedLandingCommitMessage(plan, root));
    // The registered Git-state watcher normally observes index changes itself.
    // Explicitly scheduling the same debounced path makes Receive deterministic
    // even if VS Code's built-in Git extension has not refreshed the index yet.
    void vscode.commands.executeCommand('tiinex.git.observePostStage', root);
  }
  return { staged: changedRoots.length };
}

function routeForGrounding(orientation: OrientResult, preferred: QualifiedRouteReceipt[]): QualifiedRouteReceipt | null {
  const implicit = implicitQualifiedRoute(orientation);
  if (implicit) return implicit;
  if (preferred.length === 1) return preferred[0];
  const routes = qualifiedRoutes(orientation);
  return routes.length === 1 ? routes[0] : null;
}

function policySummary(): string { return `Post-landing policy: stage=${stagePolicy()}, postStage=${postStagePolicy()}. Handoff preview is controlled separately by Incoming. Shared Tiinex Tooling qualifies package/Workspace targeting; the VS Code host owns only explicit local UX and Git actions.`; }

export async function landHandoffPackage(packagePath: string, extensionPath: string, requestedWorkspaceIds: string[] = []): Promise<LandingResult | null> {
  const ingressRuntime = await preparePackageRuntime(packagePath, nodeExecutable());
  let sharedRuntime: Awaited<ReturnType<typeof prepareBundledRuntime>> | null = null;
  try {
    const orientation = await orientPackage(ingressRuntime, packagePath);
    const preferredRoutes = routesPreferredForRole(qualifiedRoutes(orientation), rolePreference());
    const groundingRoute = routeForGrounding(orientation, preferredRoutes);
    const receivedBeforeLanding = groundingRoute
      ? receivedHandoffContext(packagePath, orientation, await groundPackageForReview(ingressRuntime, packagePath, groundingRoute.pointerPath), groundingRoute.id)
      : null;
    sharedRuntime = await prepareBundledRuntime(extensionPath, nodeExecutable());

    const requested = [...new Set(requestedWorkspaceIds.map((item) => String(item || '').trim()).filter(Boolean))].sort();
    let facts = await collectRepositoryFacts();
    const selections: Record<string, string> = {};
    const skipped = new Set<string>();

    let discoveryPlan = await projectWorkspaceLanding(sharedRuntime, packagePath, facts, selections, requested);
    await skipUntargetableWorkspaces(discoveryPlan, skipped);
    await resolveAmbiguousSelections(discoveryPlan, facts, selections, skipped);
    facts = await addMissingWorkspaces(packagePath, sharedRuntime, discoveryPlan, facts, selections, skipped);

    discoveryPlan = await projectWorkspaceLanding(sharedRuntime, packagePath, facts, selections, requested);
    await resolveBranchAndDirty(discoveryPlan, skipped);

    const knownRoots = facts.map((item) => item.root);
    facts = await collectRepositoryFacts(knownRoots);
    discoveryPlan = await projectWorkspaceLanding(sharedRuntime, packagePath, facts, selections, requested);
    for (const workspace of discoveryPlan.workspaces) {
      if (!skipped.has(workspace.workspaceId) && workspace.state !== 'ready') {
        skipped.add(workspace.workspaceId);
        await vscode.window.showWarningMessage(`Skipping ${workspace.title || workspace.workspaceId}: ${workspace.reasons.join(', ') || workspace.state}. Other qualified Workspaces can continue.`);
      }
    }
    await acknowledgeUnassertedBranches(discoveryPlan, skipped);
    if (!requested.length) await selectReadyWorkspaces(discoveryPlan, skipped);

    const selectedWorkspaceIds = discoveryPlan.workspaces.filter((item) => item.state === 'ready' && !skipped.has(item.workspaceId)).map((item) => item.workspaceId).sort();
    if (!selectedWorkspaceIds.length) {
      const received = receivedBeforeLanding ? withWorkspaceRoots(receivedBeforeLanding, {}) : null;
      await vscode.window.showInformationMessage('Tiinex Receive finished with no selected Workspace landings. No repository source was replaced; qualified carrier/Handoff context remains available.');
      return { received, workspaceRoots: {}, affectedWorkspaceIds: [] };
    }

    const initialPlan = await projectWorkspaceLanding(sharedRuntime, packagePath, facts, selections, selectedWorkspaceIds);
    if (initialPlan.status !== 'ready' || initialPlan.affected.length !== selectedWorkspaceIds.length) throw new Error(`tiinex.landing.plan-blocked:\n${findingsText(initialPlan)}`);
    const initialPrepared: PreparedWorkspace[] = [];
    for (const workspace of initialPlan.affected) initialPrepared.push(await prepareWorkspace(packagePath, workspace));
    const mapping = initialPlan.affected.map((item) => `${item.workspaceId} → ${item.repository?.root || '(unresolved)'}`).join('\n');
    const confirmed = await vscode.window.showWarningMessage(`${initialPlan.confirmation.statement}\n\n${mapping}\n\n${policySummary()}`, { modal: true }, 'Receive Qualified Workspaces');
    if (confirmed !== 'Receive Qualified Workspaces') return null;

    facts = await collectRepositoryFacts(knownRoots);
    const finalPlan = await projectWorkspaceLanding(sharedRuntime, packagePath, facts, selections, selectedWorkspaceIds);
    if (finalPlan.status !== 'ready' || readySignature(finalPlan) !== readySignature(initialPlan)) throw new Error('tiinex.landing.plan-changed-after-confirmation');
    const finalPrepared: PreparedWorkspace[] = [];
    for (const workspace of finalPlan.affected) finalPrepared.push(await prepareWorkspace(packagePath, workspace));
    for (const prepared of finalPrepared) await applyWorkspaceSnapshot(prepared);

    const git = await postLandingGit(finalPlan, finalPrepared);
    const workspaceRoots: Record<string, string> = {};
    for (const workspace of finalPlan.workspaces) if (workspace.repository?.root) workspaceRoots[workspace.workspaceId] = workspace.repository.root;

    const opened = { opened: 0, preferred: preferredRoutes };
    const qualifiedReceived = receivedBeforeLanding ? withWorkspaceRoots(receivedBeforeLanding, workspaceRoots) : null;

    await vscode.window.showInformationMessage(`Tiinex received ${finalPrepared.length} Workspace${finalPrepared.length === 1 ? '' : 's'}; staged ${git.staged}; post-stage policy ${postStagePolicy()}; opened ${opened.opened} Handoff artifact${opened.opened === 1 ? '' : 's'}.`);
    return { received: qualifiedReceived, workspaceRoots, affectedWorkspaceIds: finalPlan.affected.map((item) => item.workspaceId).sort() };
  } finally {
    await sharedRuntime?.dispose();
    await ingressRuntime.dispose();
  }
}
