import path from 'node:path';
import { repositoryContainsPath, sameRepositoryRoot } from './repositoryPath';

export type WorkspaceSessionTransition = 'none' | 'single-root-unavailable' | 'dedicated-multi-root';


export interface WorkspaceTargetMapping {
  workspaceId: string;
  root: string;
}

export interface WorkspaceTargetValidation {
  status: 'ready' | 'blocked';
  duplicateRoots: readonly { root: string; workspaceIds: readonly string[] }[];
  overlappingRoots: readonly { parentRoot: string; childRoot: string }[];
}

/**
 * Validate repository roots as mutation units before any VS Code session transition.
 *
 * One full-source Incoming Workspace per repository root is the only unambiguous
 * host-side mutation shape today. Nested repository roots are also blocked because
 * two independent replace/merge plans could otherwise touch overlapping byte trees.
 * A future shared Tiinex contract may explicitly qualify either shape; until then the
 * host fails closed rather than choosing mutation precedence.
 */
export function validateWorkspaceTargetMapping(targets: WorkspaceTargetMapping[]): WorkspaceTargetValidation {
  const normalized = targets
    .map((item) => ({ workspaceId: String(item.workspaceId || '').trim(), root: path.resolve(String(item.root || '').trim()) }))
    .filter((item) => item.workspaceId && item.root);
  const groups: Array<{ root: string; workspaceIds: string[] }> = [];
  for (const item of normalized) {
    let group = groups.find((candidate) => sameRepositoryRoot(candidate.root, item.root));
    if (!group) { group = { root: item.root, workspaceIds: [] }; groups.push(group); }
    if (!group.workspaceIds.includes(item.workspaceId)) group.workspaceIds.push(item.workspaceId);
  }
  const duplicateRoots = groups
    .filter((item) => item.workspaceIds.length > 1)
    .map((item) => Object.freeze({ root: item.root, workspaceIds: Object.freeze([...item.workspaceIds].sort()) }));
  const overlappingRoots: Array<{ parentRoot: string; childRoot: string }> = [];
  for (let left = 0; left < groups.length; left += 1) {
    for (let right = left + 1; right < groups.length; right += 1) {
      const a = groups[left].root;
      const b = groups[right].root;
      if (sameRepositoryRoot(a, b)) continue;
      if (repositoryContainsPath(a, b)) overlappingRoots.push(Object.freeze({ parentRoot: a, childRoot: b }));
      else if (repositoryContainsPath(b, a)) overlappingRoots.push(Object.freeze({ parentRoot: b, childRoot: a }));
    }
  }
  return Object.freeze({
    status: duplicateRoots.length || overlappingRoots.length ? 'blocked' : 'ready',
    duplicateRoots: Object.freeze(duplicateRoots),
    overlappingRoots: Object.freeze(overlappingRoots)
  });
}

export interface WorkspaceSessionPlan {
  transition: WorkspaceSessionTransition;
  targetRoots: readonly string[];
  missingRoots: readonly string[];
  distinctTargetRootCount: number;
}

function uniqueRoots(values: string[]): string[] {
  const roots: string[] = [];
  for (const value of values) {
    const resolved = path.resolve(String(value || '').trim());
    if (!value || roots.some((item) => sameRepositoryRoot(item, resolved))) continue;
    roots.push(resolved);
  }
  return roots;
}

/**
 * Decide whether an Incoming operation can stay in the current VS Code session.
 *
 * The number that matters is distinct repository roots, not carried Workspace count:
 * selected artifacts may refer to the same repository identity, but ambiguous
 * multiple-full-snapshot mutation of one root is validated separately. We never
 * turn a single-repository operation into multi-root just because more artifacts
 * were selected.
 */
export function planWorkspaceSession(openRoots: string[], requestedTargetRoots: string[]): WorkspaceSessionPlan {
  const targetRoots = uniqueRoots(requestedTargetRoots);
  const currentRoots = uniqueRoots(openRoots);
  const missingRoots = targetRoots.filter((root) => !currentRoots.some((open) => sameRepositoryRoot(open, root)));
  const distinctTargetRootCount = targetRoots.length;
  const transition: WorkspaceSessionTransition = missingRoots.length === 0
    ? 'none'
    : distinctTargetRootCount > 1
      ? 'dedicated-multi-root'
      : 'single-root-unavailable';
  return Object.freeze({ transition, targetRoots: Object.freeze(targetRoots), missingRoots: Object.freeze(missingRoots), distinctTargetRootCount });
}
