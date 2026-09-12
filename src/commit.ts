import * as vscode from 'vscode';
import { preferredNodeExecutable } from './host/nodeExecutable';
import {
  commitPreparedGitOperator,
  generateTiinexCommitMessage,
  GitOperatorCommitResult,
  listStagedPaths,
  prepareGitOperatorCommit,
  PreparedGitOperatorCommit,
  pushExactGitOperatorCommit,
  repositoryFact,
  stageCommitPush
} from './host/git';
import { prepareBundledRuntime, projectOperatorContext, projectStagedValidation } from './tiinex/bootstrap';
import { repositoryRoots, selectRepositoryRoot, setRepositoryInput } from './vscode/gitApi';
import { presentActionableFindings } from './core/findingPresentation';
import { GitOperatorCandidate, GitOperatorOutcome, gitOperatorResultMarkdown, projectGitOperatorCandidates } from './core/gitOperator';
import { GitOperatorReviewItem, reviewGitOperatorRepositories } from './gitOperatorPanel';

function nodeExecutable(): string {
  return preferredNodeExecutable(vscode.workspace.getConfiguration('tiinex').get('nodePath', '').toString().trim());
}

function stagedBlocker(result: any): string {
  return presentActionableFindings(result.findings || [], `${result.status || 'unknown'}/${result.state || 'unknown'}`);
}

async function validateStagedWithRuntime(runtime: Awaited<ReturnType<typeof prepareBundledRuntime>>, root: string, stagedPaths: string[]): Promise<any> {
  const result = await projectStagedValidation(runtime, root, stagedPaths);
  if (result.status !== 'ready' || result.state === 'blocked' || result.blockingFindingCount > 0) {
    throw new Error(`tiinex.staged-validation.blocked:\n${stagedBlocker(result)}`);
  }
  return result;
}

async function validateStaged(extensionPath: string, root: string, stagedPaths: string[]): Promise<void> {
  const runtime = await prepareBundledRuntime(extensionPath, nodeExecutable());
  try { await validateStagedWithRuntime(runtime, root, stagedPaths); }
  finally { await runtime.dispose(); }
}

export async function generateCommitMessageCommand(extensionPath: string): Promise<void> {
  const root = await selectRepositoryRoot('Select the Git repository whose staged Tiinex artifacts should drive the commit message');
  const stagedPaths = await listStagedPaths(root);
  await validateStaged(extensionPath, root, stagedPaths);
  const commitMessage = await generateTiinexCommitMessage(root, nodeExecutable());
  await setRepositoryInput(root, commitMessage);
  await vscode.window.showInformationMessage(`Tiinex commit message generated for ${root}. Review it in Source Control before committing.`);
}

export async function stageCommitPushCommand(extensionPath: string): Promise<void> {
  const root = await selectRepositoryRoot('Select the Git repository to stage, commit and push');
  const approved = await vscode.window.showWarningMessage(`Stage all changes, validate the staged Tiinex closure, derive the commit message from staged artifacts, commit, and push the configured upstream for ${root}?`, { modal: true }, 'Stage, Commit & Push');
  if (approved !== 'Stage, Commit & Push') return;
  const result = await stageCommitPush(root, nodeExecutable(), undefined, (stagedPaths) => validateStaged(extensionPath, root, stagedPaths));
  await vscode.window.showInformationMessage(`Tiinex pushed ${result.branch} to ${result.upstream}.`);
}

function errorText(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function candidateLabel(candidate: GitOperatorCandidate): string {
  return candidate.workspaceIds.length ? candidate.workspaceIds.join(', ') : candidate.root;
}

async function qualifiedGitOperatorCandidates(runtime: Awaited<ReturnType<typeof prepareBundledRuntime>>): Promise<GitOperatorCandidate[]> {
  const roots = await repositoryRoots();
  if (!roots.length) throw new Error('tiinex.git-operator.no-open-repositories');
  const facts = await Promise.all(roots.map((root) => repositoryFact(root)));
  const context = await projectOperatorContext(runtime, roots, facts);
  if (context.status !== 'ready' || (context.findings || []).some((item) => item.severity === 'error')) {
    throw new Error(`tiinex.git-operator.operator-context-blocked:\n${presentActionableFindings(context.findings || [], context.status)}`);
  }
  return projectGitOperatorCandidates(context.workspaces || [], facts);
}

async function presentGitOperatorResult(outcomes: GitOperatorOutcome[]): Promise<void> {
  const pushed = outcomes.filter((item) => item.state === 'pushed').length;
  const local = outcomes.filter((item) => item.state === 'committed-local').length;
  const failed = outcomes.filter((item) => ['blocked', 'commit-failed', 'push-failed'].includes(item.state)).length;
  const document = await vscode.workspace.openTextDocument({ language: 'markdown', content: gitOperatorResultMarkdown(outcomes) });
  await vscode.window.showTextDocument(document, { preview: true });
  await vscode.window.showInformationMessage(`Tiinex Git Operator: ${pushed} pushed · ${local} committed locally · ${failed} blocked/failed.`);
}

function reviewItem(candidate: GitOperatorCandidate, prepared: PreparedGitOperatorCommit | null, blocker = ''): GitOperatorReviewItem {
  return {
    id: candidate.id,
    label: candidateLabel(candidate),
    root: candidate.root,
    repository: candidate.repository,
    branch: prepared?.branch || candidate.branch,
    upstream: prepared?.upstream || '',
    stagedPaths: prepared?.stagedPaths || [],
    stagedTiinexPaths: prepared?.stagedTiinexPaths || [],
    validationState: prepared?.validationState || (blocker ? 'blocked' : 'unknown'),
    message: prepared?.message || '',
    blocker
  };
}

/**
 * Multi-repository Tiinex Git operator: qualified discovery -> explicit selection
 * -> stage/validate/derive -> combined review/edit -> commit -> one final exact
 * push confirmation. Repositories fail independently and results stay explicit.
 */
export async function stageCommitPushManyCommand(extensionPath: string): Promise<void> {
  const runtime = await prepareBundledRuntime(extensionPath, nodeExecutable());
  try {
    const candidates = (await qualifiedGitOperatorCandidates(runtime)).filter((item) => !item.clean);
    if (!candidates.length) {
      await vscode.window.showInformationMessage('Tiinex Git Operator found no changed repositories in the current qualified local Workspace context.');
      return;
    }

    const picks = candidates.map((candidate) => ({
      label: candidateLabel(candidate),
      description: `${candidate.branch || '(detached)'} · ${candidate.repository || 'no origin label'}`,
      detail: candidate.root,
      picked: true,
      candidate
    }));
    const selected = await vscode.window.showQuickPick(picks, {
      title: 'Tiinex Git Operator · Select repositories',
      placeHolder: 'Stage, validate and derive commit messages for the selected qualified repositories',
      canPickMany: true,
      ignoreFocusOut: true
    });
    if (!selected?.length) return;

    const prepared = new Map<string, PreparedGitOperatorCommit>();
    const blockers = new Map<string, string>();
    await vscode.window.withProgress({ location: vscode.ProgressLocation.Notification, title: 'Tiinex staging and validating repositories', cancellable: false }, async (progress) => {
      const increment = 100 / selected.length;
      for (const item of selected) {
        const candidate = item.candidate;
        progress.report({ message: candidateLabel(candidate), increment: 0 });
        try {
          const value = await prepareGitOperatorCommit(candidate.root, nodeExecutable(), async (stagedPaths) => {
            const validation = await validateStagedWithRuntime(runtime, candidate.root, stagedPaths);
            return {
              state: validation.state,
              stagedTiinexPaths: validation.stagedTiinexPaths,
              ignoredStagedPaths: validation.ignoredStagedPaths
            };
          });
          prepared.set(candidate.id, value);
        } catch (error) {
          blockers.set(candidate.id, errorText(error));
        }
        progress.report({ increment });
      }
    });

    const selectedCandidates = selected.map((item) => item.candidate);
    const reviews = selectedCandidates.map((candidate) => reviewItem(candidate, prepared.get(candidate.id) || null, blockers.get(candidate.id) || ''));
    const submission = await reviewGitOperatorRepositories(reviews);
    if (!submission) {
      const outcomes: GitOperatorOutcome[] = selectedCandidates.map((candidate) => ({
        id: candidate.id,
        label: candidateLabel(candidate),
        root: candidate.root,
        branch: prepared.get(candidate.id)?.branch || candidate.branch,
        upstream: prepared.get(candidate.id)?.upstream || '',
        state: blockers.has(candidate.id) ? 'blocked' : 'skipped',
        detail: blockers.get(candidate.id) || 'Review cancelled; staged changes were left intact and no commit or push was created.'
      }));
      await presentGitOperatorResult(outcomes);
      return;
    }

    const included = new Set(submission.includedIds || []);
    const outcomes: GitOperatorOutcome[] = [];
    const commits = new Map<string, GitOperatorCommitResult>();
    for (const candidate of selectedCandidates) {
      const preparedItem = prepared.get(candidate.id);
      const blocker = blockers.get(candidate.id) || '';
      if (blocker || !preparedItem) {
        outcomes.push({ id: candidate.id, label: candidateLabel(candidate), root: candidate.root, branch: candidate.branch, upstream: '', state: 'blocked', detail: blocker || 'Preparation did not produce a reviewable commit state.' });
        continue;
      }
      if (!included.has(candidate.id)) {
        outcomes.push({ id: candidate.id, label: candidateLabel(candidate), root: candidate.root, branch: preparedItem.branch, upstream: preparedItem.upstream, state: 'skipped', message: preparedItem.message, detail: 'Operator excluded this repository at review; staged changes remain intact.' });
        continue;
      }
      try {
        const commit = await commitPreparedGitOperator(candidate.root, preparedItem, submission.messages[candidate.id] || '');
        commits.set(candidate.id, commit);
        outcomes.push({ id: candidate.id, label: candidateLabel(candidate), root: candidate.root, branch: commit.branch, upstream: commit.upstream, state: 'committed-local', message: commit.message, commitSha: commit.commitSha });
      } catch (error) {
        outcomes.push({ id: candidate.id, label: candidateLabel(candidate), root: candidate.root, branch: preparedItem.branch, upstream: preparedItem.upstream, state: 'commit-failed', message: submission.messages[candidate.id] || preparedItem.message, detail: errorText(error) });
      }
    }

    if (!commits.size) {
      await presentGitOperatorResult(outcomes);
      return;
    }

    const pushLines = selectedCandidates
      .filter((candidate) => commits.has(candidate.id))
      .map((candidate) => {
        const commit = commits.get(candidate.id)!;
        return `${candidateLabel(candidate)}: ${commit.branch} → ${commit.upstream} · ${commit.commitSha.slice(0, 12)}`;
      });
    const pushChoice = await vscode.window.showWarningMessage(
      `Push only the exact commits created by this Tiinex flow?\n\n${pushLines.join('\n')}\n\nAny changed branch, upstream, HEAD or unrelated ahead/behind state blocks that repository independently.`,
      { modal: true },
      'Push Exact Commits',
      'Leave Commits Local'
    );
    if (pushChoice !== 'Push Exact Commits') {
      await presentGitOperatorResult(outcomes);
      return;
    }

    for (const candidate of selectedCandidates) {
      const commit = commits.get(candidate.id);
      if (!commit) continue;
      const outcome = outcomes.find((item) => item.id === candidate.id && item.state === 'committed-local');
      if (!outcome) continue;
      try {
        await pushExactGitOperatorCommit(candidate.root, commit);
        outcome.state = 'pushed';
      } catch (error) {
        outcome.state = 'push-failed';
        outcome.detail = errorText(error);
      }
    }
    await presentGitOperatorResult(outcomes);
  } finally {
    await runtime.dispose();
  }
}
