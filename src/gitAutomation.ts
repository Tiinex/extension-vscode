import path from 'node:path';
import * as vscode from 'vscode';
import { gitAutomationBlockerText, normalizePostStagePolicy, PostStagePolicy } from './core/gitOperator';
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
  return normalizePostStagePolicy(vscode.workspace.getConfiguration('tiinex.git').get('postStagePolicy', 'do-nothing'));
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

  const evaluate = async (root: string): Promise<void> => {
    const policy = configuredPostStagePolicy();
    if (policy === 'do-nothing') return;
    if (running.has(root)) return;
    running.add(root);
    try {
      const staged = await listReviewedStagedPaths(root);
      if (!staged.length) { lastReported.delete(root); return; }
      const runtime = await prepareBundledRuntime(extensionPath, nodeExecutable());
      let prepared: PreparedReviewedStagedCommit;
      try {
        prepared = await prepareReviewedStagedCommit(root, nodeExecutable(), {
          stageAll: false,
          requireNoUnstaged: true,
          requireQualifiedTiinex: true,
          requirePushSafety: policy === 'commit-push'
        }, async (stagedPaths) => {
          const validation = await validateStagedWithRuntime(runtime, root, stagedPaths);
          return { state: validation.state, stagedTiinexPaths: validation.stagedTiinexPaths, ignoredStagedPaths: validation.ignoredStagedPaths };
        });
      } finally {
        await runtime.dispose();
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
      await vscode.window.showInformationMessage(`Tiinex ${action} for ${path.basename(root)}.`);
    } catch (error) {
      await reportBlocker(root, error);
    } finally {
      running.delete(root);
      if (pending.delete(root)) schedule(root);
    }
  };

  const schedule = (root: string): void => {
    const resolved = String(root || '').trim();
    if (!resolved || configuredPostStagePolicy() === 'do-nothing') return;
    if (running.has(resolved)) { pending.add(resolved); return; }
    const existing = timers.get(resolved);
    if (existing) clearTimeout(existing);
    timers.set(resolved, setTimeout(() => {
      timers.delete(resolved);
      void evaluate(resolved);
    }, DEBOUNCE_MS));
  };

  context.subscriptions.push(vscode.commands.registerCommand('tiinex.git.observePostStage', (root: string) => schedule(root)));
  context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(async (event) => {
    if (!event.affectsConfiguration('tiinex.git.postStagePolicy')) return;
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
