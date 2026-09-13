import path from 'node:path';
import * as vscode from 'vscode';
import { gitAutomationBlockerText, isTiinexArtifactPath, normalizePostStagePolicy, PostStagePolicy } from './core/gitOperator';
import {
  commitPreparedReviewedStaged,
  listReviewedStagedPaths,
  listUnstagedPaths,
  prepareReviewedStagedCommit,
  PreparedReviewedStagedCommit,
  pushExactReviewedStagedCommit
} from './host/git';
import { preferredNodeExecutable } from './host/nodeExecutable';
import { presentActionableFindings } from './core/findingPresentation';
import { prepareBundledRuntime, projectStagedValidation } from './tiinex/bootstrap';
import { repositoryRootFromScmContext, setRepositoryInput, watchGitRepositoryStates } from './vscode/gitApi';

const DEBOUNCE_MS = 750;

function nodeExecutable(): string {
  return preferredNodeExecutable(vscode.workspace.getConfiguration('tiinex').get('nodePath', '').toString().trim());
}

export function configuredPostStagePolicy(): PostStagePolicy {
  return normalizePostStagePolicy(vscode.workspace.getConfiguration('tiinex.git').get('postStagePolicy', 'ask'));
}

function validationBlocker(result: any): string {
  return presentActionableFindings(result.findings || [], `${result.status || 'unknown'}/${result.state || 'unknown'}`);
}

async function validateStagedWithRuntime(runtime: Awaited<ReturnType<typeof prepareBundledRuntime>>, root: string, stagedPaths: string[]): Promise<any> {
  const result = await projectStagedValidation(runtime, root, stagedPaths);
  if (result.status !== 'ready' || result.state === 'blocked' || result.blockingFindingCount > 0) {
    throw new Error(`tiinex.staged-validation.blocked:\n${validationBlocker(result)}`);
  }
  return result;
}

function pushBlockerLabel(value: string): string {
  if (!value) return '';
  if (value === 'tiinex.git.missing-upstream') return 'no upstream is configured';
  if (value.startsWith('tiinex.git.pre-operation-upstream-not-aligned:')) {
    const [ahead, behind] = value.slice('tiinex.git.pre-operation-upstream-not-aligned:'.length).split(':');
    return `upstream is not aligned (${ahead || '0'} ahead / ${behind || '0'} behind before this commit)`;
  }
  return value;
}

async function chooseStagingMode(root: string): Promise<'existing' | 'all' | null> {
  const staged = await listReviewedStagedPaths(root);
  const unstaged = await listUnstagedPaths(root);
  if (!staged.length && !unstaged.length) {
    await vscode.window.showInformationMessage(`Tiinex Commit: ${path.basename(root)} has no staged or unstaged changes.`);
    return null;
  }
  if (staged.length && !unstaged.length) return 'existing';
  if (!staged.length) {
    const choice = await vscode.window.showQuickPick([
      { label: 'Stage All and review', description: `${unstaged.length} unstaged path${unstaged.length === 1 ? '' : 's'}`, value: 'all' as const },
      { label: 'Cancel', description: 'Leave the repository unchanged', value: null }
    ], { title: `Tiinex Commit · ${path.basename(root)}`, placeHolder: 'No staged changes exist. Stage All explicitly to continue.', ignoreFocusOut: true });
    return choice?.value ?? null;
  }
  const choice = await vscode.window.showQuickPick([
    { label: 'Use existing staged changes', description: `${staged.length} staged · ${unstaged.length} unstaged path${unstaged.length === 1 ? '' : 's'} will remain`, value: 'existing' as const },
    { label: 'Stage All changes', description: `Include all ${staged.length + unstaged.length} changed path references`, value: 'all' as const },
    { label: 'Cancel', description: 'Leave the repository unchanged', value: null }
  ], { title: `Tiinex Commit · ${path.basename(root)}`, placeHolder: 'Choose exactly what Tiinex may prepare for review.', ignoreFocusOut: true });
  return choice?.value ?? null;
}

async function reviewManualCommit(root: string, prepared: PreparedReviewedStagedCommit): Promise<{ message: string; outcome: 'leave' | 'commit' | 'commit-push' } | null> {
  const message = await vscode.window.showInputBox({
    title: `Tiinex Commit · ${path.basename(root)}`,
    prompt: `Review the commit message for ${prepared.stagedPaths.length} staged path${prepared.stagedPaths.length === 1 ? '' : 's'}.`,
    value: prepared.message,
    ignoreFocusOut: true,
    validateInput: (value) => value.trim() ? null : 'Commit message is required.'
  });
  if (message === undefined) return null;

  const items: Array<vscode.QuickPickItem & { outcome: 'leave' | 'commit' | 'commit-push' }> = [
    { label: 'Leave staged', description: 'Do not create a commit; keep the reviewed message in Source Control.', outcome: 'leave' },
    { label: 'Commit', description: 'Create exactly the reviewed local commit without pushing.', outcome: 'commit' }
  ];
  if (prepared.pushEligible) {
    items.push({ label: 'Commit + Push', description: `Create the reviewed commit, then push only that exact commit to ${prepared.upstream}.`, outcome: 'commit-push' });
  }
  const unavailable = prepared.pushEligible ? '' : ` Commit + Push unavailable: ${pushBlockerLabel(prepared.pushBlocker)}.`;
  const choice = await vscode.window.showQuickPick(items, {
    title: `Tiinex Commit · ${path.basename(root)}`,
    placeHolder: `Choose the explicit outcome.${unavailable}`,
    ignoreFocusOut: true
  });
  return choice ? { message: message.trim(), outcome: choice.outcome } : null;
}

/** Normal per-repository SCM flow. Explicit manual mode may commit source-only staging. */
export async function manualRepositoryCommitCommand(extensionPath: string, scmContext?: unknown): Promise<void> {
  const root = await repositoryRootFromScmContext(scmContext, 'Select the Git repository for Tiinex Commit');
  const mode = await chooseStagingMode(root);
  if (!mode) return;

  const runtime = await prepareBundledRuntime(extensionPath, nodeExecutable());
  let prepared: PreparedReviewedStagedCommit;
  try {
    prepared = await prepareReviewedStagedCommit(root, nodeExecutable(), {
      stageAll: mode === 'all',
      requireNoUnstaged: false,
      requireQualifiedTiinex: false,
      requirePushSafety: false
    }, async (stagedPaths) => {
      const validation = await validateStagedWithRuntime(runtime, root, stagedPaths);
      return { state: validation.state, stagedTiinexPaths: validation.stagedTiinexPaths, ignoredStagedPaths: validation.ignoredStagedPaths };
    });
  } finally {
    await runtime.dispose();
  }

  const review = await reviewManualCommit(root, prepared);
  if (!review) return;
  if (review.outcome === 'leave') {
    await setRepositoryInput(root, review.message);
    await vscode.window.showInformationMessage(`Tiinex left ${prepared.stagedPaths.length} staged path${prepared.stagedPaths.length === 1 ? '' : 's'} unchanged in ${path.basename(root)}.`);
    return;
  }

  const commit = await commitPreparedReviewedStaged(root, prepared, review.message);
  if (review.outcome === 'commit') {
    await vscode.window.showInformationMessage(`Tiinex committed ${commit.commitSha.slice(0, 12)} locally in ${path.basename(root)}.`);
    return;
  }
  try {
    await pushExactReviewedStagedCommit(root, commit);
    await vscode.window.showInformationMessage(`Tiinex committed and pushed ${commit.commitSha.slice(0, 12)} from ${path.basename(root)} to ${commit.upstream}.`);
  } catch (error) {
    await vscode.window.showWarningMessage(`Tiinex created ${commit.commitSha.slice(0, 12)} locally but did not push it: ${gitAutomationBlockerText(error)}`, { modal: true });
  }
}

export async function registerGitAutomation(context: vscode.ExtensionContext, extensionPath: string): Promise<void> {
  const output = vscode.window.createOutputChannel('Tiinex Git');
  context.subscriptions.push(output);
  const timers = new Map<string, ReturnType<typeof setTimeout>>();
  const running = new Set<string>();
  const pending = new Set<string>();
  const lastReported = new Map<string, string>();
  const lastPromptedAsk = new Map<string, string>();

  const log = (root: string, text: string): void => output.appendLine(`[${new Date().toISOString()}] ${path.basename(root) || root}: ${text}`);
  const reportBlocker = async (root: string, error: unknown): Promise<void> => {
    const detail = gitAutomationBlockerText(error);
    if (detail === 'no staged changes remain') return;
    const key = `${root}\0${detail}`;
    if (lastReported.get(root) === key) return;
    lastReported.set(root, key);
    log(root, `post-stage automation skipped: ${detail}`);
    if (String(error instanceof Error ? error.message : error).startsWith('tiinex.git.no-qualified-tiinex-artifact')) {
      await vscode.window.showInformationMessage(`Tiinex did not auto-commit ${path.basename(root)}: ${detail}. Use Tiinex Commit from Source Control for an explicit source-only commit.`);
    } else {
      await vscode.window.showWarningMessage(`Tiinex post-stage automation stopped for ${path.basename(root)}: ${detail}.`);
    }
  };

  type PreparedPostStage = { root: string; prepared: PreparedReviewedStagedCommit; promptKey: string };
  type PostStageBatch = { roots: string[]; policy: PostStagePolicy };
  const batches = new Map<string, PostStageBatch>();
  const suppressedRoots = new Map<string, number>();
  let batchSequence = 0;

  const suppress = (roots: string[]): void => {
    for (const root of roots) {
      suppressedRoots.set(root, (suppressedRoots.get(root) || 0) + 1);
      const timer = timers.get(root);
      if (timer) clearTimeout(timer);
      timers.delete(root);
      pending.delete(root);
    }
  };
  const release = (roots: string[]): void => {
    for (const root of roots) {
      const next = (suppressedRoots.get(root) || 1) - 1;
      if (next > 0) suppressedRoots.set(root, next);
      else suppressedRoots.delete(root);
    }
  };
  const isSuppressed = (root: string): boolean => (suppressedRoots.get(root) || 0) > 0;

  const prepareAutomatic = async (root: string, policy: PostStagePolicy): Promise<PreparedPostStage | null> => {
    const staged = await listReviewedStagedPaths(root);
    if (!staged.length) {
      lastReported.delete(root);
      lastPromptedAsk.delete(root);
      return null;
    }
    // Post-stage Git policy owns Git history, not Tiinex qualification. Detect
    // Tiinex material from the explicit staged path selection only; qualification
    // remains strict at manufacture/Recovery/acceptance/release boundaries.
    if (!staged.some(isTiinexArtifactPath)) {
      lastReported.delete(root);
      lastPromptedAsk.delete(root);
      return null;
    }
    const prepared = await prepareReviewedStagedCommit(root, nodeExecutable(), {
      stageAll: false,
      requireNoUnstaged: true,
      requireQualifiedTiinex: false,
      requirePushSafety: policy === 'commit-push',
      requireNoConflictMarkers: true
    });
    const promptKey = `${prepared.headBefore}\0${prepared.statusSnapshot}\0${prepared.stagedDiffSnapshot}`;
    return { root, prepared, promptKey };
  };

  const commitPreparedSet = async (items: PreparedPostStage[], push: boolean): Promise<Array<{ item: PreparedPostStage; commit: Awaited<ReturnType<typeof commitPreparedReviewedStaged>> }>> => {
    const committed: Array<{ item: PreparedPostStage; commit: Awaited<ReturnType<typeof commitPreparedReviewedStaged>> }> = [];
    for (const item of items) {
      const commit = await commitPreparedReviewedStaged(item.root, item.prepared, item.prepared.message);
      committed.push({ item, commit });
    }
    if (push) {
      for (const entry of committed) await pushExactReviewedStagedCommit(entry.item.root, entry.commit);
    }
    return committed;
  };

  const evaluateBatch = async (batch: PostStageBatch, stagedRoots: string[]): Promise<void> => {
    const roots = [...new Set(stagedRoots.map((item) => String(item || '').trim()).filter((item) => item && batch.roots.includes(item)))];
    if (!roots.length || batch.policy === 'do-nothing') return;
    const items: PreparedPostStage[] = [];
    try {
      for (const root of roots) {
        const item = await prepareAutomatic(root, batch.policy);
        if (item) items.push(item);
      }
    } catch (error) {
      for (const root of roots) await reportBlocker(root, error);
      return;
    }
    if (!items.length) return;

    if (batch.policy === 'ask') {
      const alreadyHandled = items.every((item) => lastPromptedAsk.get(item.root) === item.promptKey);
      if (alreadyHandled) {
        log('Incoming', `post-stage Ask already handled for unchanged ${items.length}-repository operation`);
        return;
      }
      // Mark every repository before presenting the modal so SCM events emitted
      // while it is open cannot queue duplicate per-repository prompts.
      for (const item of items) lastPromptedAsk.set(item.root, item.promptKey);
      const repoNames = items.map((item) => path.basename(item.root)).join(', ');
      const accepted = await vscode.window.showInformationMessage(
        `Tiinex Incoming staged ${items.length} repositor${items.length === 1 ? 'y' : 'ies'} (${repoNames}). Choose one Git outcome for this entire Merge/Replace operation.`,
        { modal: true },
        'Commit',
        'Commit + Push',
        'Cancel'
      );
      if (accepted !== 'Commit' && accepted !== 'Commit + Push') {
        log('Incoming', `post-stage Ask cancelled; ${items.length} repositories remain staged`);
        return;
      }
      if (accepted === 'Commit + Push') {
        const blocked = items.filter((item) => !item.prepared.pushEligible);
        if (blocked.length) {
          const details = blocked.map((item) => `${path.basename(item.root)}: ${pushBlockerLabel(item.prepared.pushBlocker)}`).join('; ');
          log('Incoming', `post-stage Ask left all staging unchanged; Commit + Push unavailable: ${details}`);
          await vscode.window.showWarningMessage(`Tiinex left the entire Incoming operation staged. Commit + Push is unavailable for: ${details}.`, { modal: true });
          return;
        }
      }
      try {
        const committed = await commitPreparedSet(items, accepted === 'Commit + Push');
        for (const { item } of committed) lastReported.delete(item.root);
        const verb = accepted === 'Commit + Push' ? 'committed and pushed' : 'committed locally';
        log('Incoming', `post-stage Ask ${verb} across ${committed.length} repositories`);
        await vscode.window.showInformationMessage(`Tiinex ${verb} ${committed.length} repositor${committed.length === 1 ? 'y' : 'ies'} for the Incoming operation.`);
      } catch (error) {
        const detail = gitAutomationBlockerText(error);
        log('Incoming', `post-stage Ask operation stopped after an accepted action: ${detail}`);
        await vscode.window.showWarningMessage(`Tiinex could not finish the selected Incoming Git outcome across every repository: ${detail}. Review Source Control for the exact per-repository state.`, { modal: true });
      }
      return;
    }

    try {
      await commitPreparedSet(items, batch.policy === 'commit-push');
      for (const item of items) lastReported.delete(item.root);
      log('Incoming', `post-stage ${batch.policy} completed silently across ${items.length} repositories`);
    } catch (error) {
      const detail = gitAutomationBlockerText(error);
      log('Incoming', `post-stage ${batch.policy} stopped: ${detail}`);
      await vscode.window.showWarningMessage(`Tiinex post-stage ${batch.policy} stopped during the Incoming operation: ${detail}. Review Source Control for the exact per-repository state.`, { modal: true });
    }
  };

  const evaluate = async (root: string): Promise<void> => {
    const policy = configuredPostStagePolicy();
    if (policy === 'do-nothing' || isSuppressed(root)) return;
    if (running.has(root)) return;
    running.add(root);
    try {
      const item = await prepareAutomatic(root, policy);
      if (!item) return;
      const { prepared, promptKey } = item;

      if (policy === 'ask') {
        if (lastPromptedAsk.get(root) === promptKey) {
          log(root, `post-stage ask already handled for unchanged staged state (${prepared.stagedPaths.length} path${prepared.stagedPaths.length === 1 ? '' : 's'})`);
          return;
        }
        // Mark before presenting the modal so Git/SCM events emitted while it is
        // open cannot queue a duplicate prompt for the exact same staged state.
        lastPromptedAsk.set(root, promptKey);
        const firstLine = prepared.message.split(/\r?\n/)[0];
        const accepted = await vscode.window.showInformationMessage(
          `Tiinex staged state is ready in ${path.basename(root)}. Choose the Git outcome for "${firstLine}" from ${prepared.stagedPaths.length} staged path${prepared.stagedPaths.length === 1 ? '' : 's'}.`,
          { modal: true },
          'Commit',
          'Commit + Push',
          'Cancel'
        );
        if (accepted === 'Commit + Push' && !prepared.pushEligible) {
          lastReported.delete(root);
          const detail = pushBlockerLabel(prepared.pushBlocker);
          log(root, `post-stage ask left staging unchanged; Commit + Push unavailable: ${detail}`);
          await vscode.window.showWarningMessage(`Tiinex left staging unchanged in ${path.basename(root)}: Commit + Push is unavailable because ${detail}.`, { modal: true });
          return;
        }
        if (accepted !== 'Commit' && accepted !== 'Commit + Push') {
          lastReported.delete(root);
          log(root, `post-stage ask cancelled with ${prepared.stagedPaths.length} staged path${prepared.stagedPaths.length === 1 ? '' : 's'} unchanged`);
          return;
        }

        const commit = await commitPreparedReviewedStaged(root, prepared, prepared.message);
        if (accepted === 'Commit + Push') {
          try {
            await pushExactReviewedStagedCommit(root, commit);
          } catch (error) {
            const detail = gitAutomationBlockerText(error);
            lastReported.delete(root);
            log(root, `post-stage ask committed ${commit.commitSha.slice(0, 12)} locally; push stopped: ${detail}`);
            await vscode.window.showWarningMessage(`Tiinex committed ${commit.commitSha.slice(0, 12)} locally in ${path.basename(root)} but did not push it: ${detail}.`, { modal: true });
            return;
          }
          lastReported.delete(root);
          log(root, `post-stage ask committed and pushed ${commit.commitSha.slice(0, 12)} to ${commit.upstream}`);
          await vscode.window.showInformationMessage(`Tiinex committed and pushed ${commit.commitSha.slice(0, 12)} for ${path.basename(root)} to ${commit.upstream}.`);
          return;
        }
        lastReported.delete(root);
        log(root, `post-stage ask committed ${commit.commitSha.slice(0, 12)} locally`);
        await vscode.window.showInformationMessage(`Tiinex committed ${commit.commitSha.slice(0, 12)} locally for ${path.basename(root)}.`);
        return;
      }

      const commit = await commitPreparedReviewedStaged(root, prepared, prepared.message);
      if (policy === 'commit-push') {
        try {
          await pushExactReviewedStagedCommit(root, commit);
        } catch (error) {
          const detail = gitAutomationBlockerText(error);
          lastReported.delete(root);
          log(root, `post-stage automation committed ${commit.commitSha.slice(0, 12)} locally; push stopped: ${detail}`);
          await vscode.window.showWarningMessage(`Tiinex auto-committed ${commit.commitSha.slice(0, 12)} locally in ${path.basename(root)} but did not push it: ${detail}.`, { modal: true });
          return;
        }
      }
      lastReported.delete(root);
      const action = policy === 'commit-push' ? `committed and pushed ${commit.commitSha.slice(0, 12)} to ${commit.upstream}` : `committed ${commit.commitSha.slice(0, 12)} locally`;
      log(root, `post-stage automation ${action}`);
    } catch (error) {
      await reportBlocker(root, error);
    } finally {
      running.delete(root);
      if (pending.delete(root)) schedule(root);
    }
  };

  const schedule = (root: string): void => {
    const resolved = String(root || '').trim();
    if (!resolved || configuredPostStagePolicy() === 'do-nothing' || isSuppressed(resolved)) return;
    if (running.has(resolved)) { pending.add(resolved); return; }
    const existing = timers.get(resolved);
    if (existing) clearTimeout(existing);
    timers.set(resolved, setTimeout(() => {
      timers.delete(resolved);
      void evaluate(resolved);
    }, DEBOUNCE_MS));
  };

  context.subscriptions.push(vscode.commands.registerCommand('tiinex.git.beginPostStageBatch', (rootsInput: string[]) => {
    const roots = [...new Set((Array.isArray(rootsInput) ? rootsInput : []).map((item) => String(item || '').trim()).filter(Boolean))];
    const id = `incoming-${Date.now()}-${++batchSequence}`;
    const policy = configuredPostStagePolicy();
    batches.set(id, { roots, policy });
    suppress(roots);
    log('Incoming', `post-stage batch ${id} began for ${roots.length} repositories with policy ${policy}`);
    return id;
  }));
  context.subscriptions.push(vscode.commands.registerCommand('tiinex.git.completePostStageBatch', async (idInput: string, stagedRootsInput: string[]) => {
    const id = String(idInput || '').trim();
    const batch = batches.get(id);
    if (!batch) return;
    batches.delete(id);
    try {
      await evaluateBatch(batch, Array.isArray(stagedRootsInput) ? stagedRootsInput : []);
    } finally {
      release(batch.roots);
    }
  }));
  context.subscriptions.push(vscode.commands.registerCommand('tiinex.git.cancelPostStageBatch', (idInput: string) => {
    const id = String(idInput || '').trim();
    const batch = batches.get(id);
    if (!batch) return;
    batches.delete(id);
    release(batch.roots);
    log('Incoming', `post-stage batch ${id} cancelled without automatic Git action`);
  }));

  context.subscriptions.push(vscode.commands.registerCommand('tiinex.git.observePostStage', (root: string) => schedule(root)));
  context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(async (event) => {
    if (!event.affectsConfiguration('tiinex.git.postStagePolicy')) return;
    lastPromptedAsk.clear();
    log('configuration', `post-stage policy changed to ${configuredPostStagePolicy()}`);
  }));

  try {
    const watcher = await watchGitRepositoryStates((repository) => schedule(repository.rootUri.fsPath));
    context.subscriptions.push(watcher);
    log('watcher', `repository state watcher active (${DEBOUNCE_MS}ms debounce)`);
  } catch (error) {
    log('watcher', `unavailable: ${error instanceof Error ? error.message : String(error)}`);
  }

  context.subscriptions.push(new vscode.Disposable(() => {
    for (const timer of timers.values()) clearTimeout(timer);
    timers.clear();
    pending.clear();
  }));
}
