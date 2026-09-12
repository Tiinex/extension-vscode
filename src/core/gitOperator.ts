import { sameRepositoryRoot } from './repositoryPath';

export interface GitOperatorRepositoryFact {
  root: string;
  repository: string;
  branch: string;
  clean: boolean;
}

export interface GitOperatorCandidate {
  id: string;
  root: string;
  repository: string;
  branch: string;
  clean: boolean;
  workspaceIds: string[];
}

/**
 * Derive the Git batch surface only from repositories that Core already projected
 * as qualified local Workspace context. VS Code repository discovery alone is
 * intentionally insufficient authority for this operator flow.
 */
export function projectGitOperatorCandidates(workspaces: any[], facts: GitOperatorRepositoryFact[]): GitOperatorCandidate[] {
  const byRoot = new Map<string, GitOperatorCandidate>();
  for (const workspace of workspaces || []) {
    const workspaceId = String(workspace?.workspaceId || '').trim();
    const root = String(workspace?.localRepository?.root || workspace?.hostRoot || '').trim();
    if (!workspaceId || !root) continue;
    const matches = facts.filter((fact) => sameRepositoryRoot(fact.root, root));
    if (matches.length !== 1) continue;
    const fact = matches[0];
    let candidate = [...byRoot.values()].find((item) => sameRepositoryRoot(item.root, fact.root));
    if (!candidate) {
      candidate = {
        id: fact.root,
        root: fact.root,
        repository: fact.repository,
        branch: fact.branch,
        clean: fact.clean,
        workspaceIds: []
      };
      byRoot.set(candidate.id, candidate);
    }
    if (!candidate.workspaceIds.includes(workspaceId)) candidate.workspaceIds.push(workspaceId);
  }
  return [...byRoot.values()]
    .map((item) => ({ ...item, workspaceIds: [...item.workspaceIds].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' })) }))
    .sort((a, b) => (a.workspaceIds[0] || a.root).localeCompare(b.workspaceIds[0] || b.root, undefined, { sensitivity: 'base' }));
}

export type GitOperatorOutcomeState = 'blocked' | 'skipped' | 'commit-failed' | 'committed-local' | 'push-failed' | 'pushed';

export interface GitOperatorOutcome {
  id: string;
  label: string;
  root: string;
  branch: string;
  upstream: string;
  state: GitOperatorOutcomeState;
  message?: string;
  commitSha?: string;
  detail?: string;
}

function stateLabel(state: GitOperatorOutcomeState): string {
  if (state === 'blocked') return 'BLOCKED';
  if (state === 'skipped') return 'SKIPPED';
  if (state === 'commit-failed') return 'COMMIT FAILED';
  if (state === 'committed-local') return 'COMMITTED LOCALLY';
  if (state === 'push-failed') return 'PUSH FAILED';
  return 'PUSHED';
}

export function gitOperatorResultMarkdown(outcomes: GitOperatorOutcome[]): string {
  const counts = new Map<GitOperatorOutcomeState, number>();
  for (const outcome of outcomes) counts.set(outcome.state, (counts.get(outcome.state) || 0) + 1);
  const summary = [
    `Pushed: ${counts.get('pushed') || 0}`,
    `Committed locally: ${counts.get('committed-local') || 0}`,
    `Blocked/failed: ${(counts.get('blocked') || 0) + (counts.get('commit-failed') || 0) + (counts.get('push-failed') || 0)}`,
    `Skipped: ${counts.get('skipped') || 0}`
  ].join(' · ');
  const lines = ['# Tiinex Git Operator Result', '', summary, ''];
  for (const outcome of outcomes) {
    lines.push(`## ${outcome.label}`, '');
    lines.push(`- Result: ${stateLabel(outcome.state)}`);
    lines.push(`- Root: \`${outcome.root}\``);
    lines.push(`- Branch: ${outcome.branch || '(unresolved)'}`);
    lines.push(`- Upstream: ${outcome.upstream || '(unresolved)'}`);
    if (outcome.commitSha) lines.push(`- Commit: \`${outcome.commitSha}\``);
    if (outcome.message) lines.push(`- Commit message: ${outcome.message.split(/\r?\n/)[0]}`);
    if (outcome.detail) lines.push(`- Detail: ${outcome.detail}`);
    lines.push('');
  }
  return `${lines.join('\n')}\n`;
}

export type PostStagePolicy = 'do-nothing' | 'commit' | 'commit-push';

export function normalizePostStagePolicy(value: unknown): PostStagePolicy {
  const policy = String(value || '').trim().toLowerCase();
  if (policy === 'commit') return 'commit';
  if (policy === 'commit-push') return 'commit-push';
  return 'do-nothing';
}

export function gitAutomationBlockerText(error: unknown): string {
  const text = error instanceof Error ? error.message : String(error || 'unknown');
  if (text.startsWith('tiinex.git.no-qualified-tiinex-artifact')) return 'no qualified Tiinex artifact is staged; source-only staging is left for explicit manual commit';
  if (text.startsWith('tiinex.git.unresolved-conflicts:')) return `unresolved Git conflicts remain (${text.slice('tiinex.git.unresolved-conflicts:'.length)})`;
  if (text.startsWith('tiinex.git.unresolved-conflict-markers:')) return `staged files still contain ordinary conflict markers (${text.slice('tiinex.git.unresolved-conflict-markers:'.length)})`;
  if (text.startsWith('tiinex.git.unstaged-remainder:')) return `unstaged changes remain (${text.slice('tiinex.git.unstaged-remainder:'.length)})`;
  if (text.startsWith('tiinex.git.working-state-changed-during-preparation') || text.startsWith('tiinex.git.staged-state-changed-during-preparation')) return 'the repository changed while Tiinex was validating/deriving the commit; a later stable Git event must re-evaluate it';
  if (text.startsWith('tiinex.git.missing-upstream')) return 'the current branch has no upstream, so automatic Commit + Push is blocked before commit';
  if (text.startsWith('tiinex.git.pre-operation-upstream-not-aligned:')) return `the upstream is not exactly aligned before Commit + Push (${text.slice('tiinex.git.pre-operation-upstream-not-aligned:'.length).replace(':', ' ahead / ')} behind)`;
  if (text.startsWith('tiinex.git.push-')) return `push safety blocked publication (${text})`;
  if (text.startsWith('tiinex.git.no-staged-changes')) return 'no staged changes remain';
  return text;
}
