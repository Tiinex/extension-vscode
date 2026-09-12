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
