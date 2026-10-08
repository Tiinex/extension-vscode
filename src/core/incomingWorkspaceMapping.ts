import { sameRepositoryRoot } from './repositoryPath';
import { representativeWorkspaceChoicesForRoot } from './workspaceChoice';

export interface IncomingQualifiedWorkspaceCandidate {
  workspaceId: string;
  workspaceTargetPath: string;
  title?: string;
  repository?: string;
  ref?: string;
  sourceKind?: string;
  /** Absolute, independently qualified host source path, when supplied. */
  hostRoot?: string;
  /** Qualified Workspace-relative snapshot path; NEVER a host repository locator. */
  rootPath?: string;
  localRepository?: { root?: string } | null;
}

export interface IncomingRootChoice {
  workspaceId: string;
  title?: string;
  repository: string;
  ref: string;
  root: string;
  workspaceTargetPath: string;
  sourceKind?: string;
}

/**
 * A per-root Core projection is scoped to one explicit host Workspace root.
 * Use the caller's exact root as host identity (or a Core-projected hostRoot,
 * when present). rootPath is relative to the qualified Workspace snapshot,
 * often '.', and MUST NOT participate in host path comparisons.
 *
 * Canonical .topics/.workspaces selection and ambiguity remain fail-closed.
 */
export function qualifiedIncomingRootChoices(
  root: string,
  candidates: readonly IncomingQualifiedWorkspaceCandidate[],
  sameRoot: typeof sameRepositoryRoot = sameRepositoryRoot
): IncomingRootChoice[] {
  const scoped = candidates.filter((item) =>
    Boolean(item.workspaceId && item.workspaceTargetPath)
    && (!item.hostRoot || sameRoot(item.hostRoot, root)));
  return representativeWorkspaceChoicesForRoot(root, scoped).map((item) => ({
    workspaceId: item.workspaceId, title: item.title,
    repository: item.repository || '', ref: item.ref || '',
    root, workspaceTargetPath: item.workspaceTargetPath,
    sourceKind: item.sourceKind
  }));
}

/** Do not guess a winner from duplicate qualified Workspace identities. */
export function exactIncomingWorkspaceMap(choices: readonly IncomingRootChoice[]): Map<string, IncomingRootChoice> {
  const byId = new Map<string, IncomingRootChoice>();
  for (const item of choices) {
    const previous = byId.get(item.workspaceId);
    if (previous) throw new Error(`tiinex.incoming.workspace-id-ambiguous:${item.workspaceId}:roots=${previous.root};${item.root}`);
    byId.set(item.workspaceId, item);
  }
  return byId;
}
