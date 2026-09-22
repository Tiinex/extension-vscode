import path from 'node:path';

export interface WorkspaceChoiceCandidate {
  workspaceId: string;
  workspaceTargetPath: string;
}

export function representativeWorkspaceChoicesForRoot<T extends WorkspaceChoiceCandidate>(root: string, candidates: T[]): T[] {
  if (!candidates.length) return [];

  // An explicit VS Code Workspace root owns its own canonical Workspace artifact
  // namespace. Prefer the one exact direct `.topics/.workspaces/*.workspace.md`
  // artifact before any presentation fallback so nested fixtures/acceptance trees
  // cannot become live choices merely because Core can discover them recursively.
  const directWorkspaceArtifacts = candidates.filter((item) => /^\.topics\/\.workspaces\/[^/]+\.workspace\.md$/i.test(normalizePath(item.workspaceTargetPath)));
  if (directWorkspaceArtifacts.length === 1) return directWorkspaceArtifacts;

  // Legacy repositories may carry their Workspace artifact outside the canonical
  // directory. Keep the existing rename-friendly root-name fallback, but fail
  // closed if it cannot resolve exactly one representative choice.
  const rootName = normalizeToken(path.basename(path.resolve(String(root || '').trim())));
  if (!rootName) return [];
  const exactWorkspaceId = candidates.filter((item) => normalizeToken(item.workspaceId) === rootName);
  if (exactWorkspaceId.length === 1) return exactWorkspaceId;
  const expectedBasenames = new Set([`${rootName}.workspace.md`, `tiinex-${rootName}.workspace.md`]);
  const exactTargetBasename = candidates.filter((item) => expectedBasenames.has(normalizeToken(path.posix.basename(normalizePath(item.workspaceTargetPath)))));
  if (exactTargetBasename.length === 1) return exactTargetBasename;

  // Several equally plausible top-level Workspace artifacts are an operator-root
  // ambiguity, not permission to surface every recursively discovered candidate.
  return [];
}

function normalizePath(value: string): string {
  return String(value || '').trim().replace(/\\/g, '/').replace(/^\.\//, '');
}

function normalizeToken(value: string): string {
  return normalizePath(value).toLocaleLowerCase();
}
