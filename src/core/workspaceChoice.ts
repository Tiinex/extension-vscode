import path from 'node:path';

export interface WorkspaceChoiceCandidate {
  workspaceId: string;
  workspaceTargetPath: string;
}

export function representativeWorkspaceChoicesForRoot<T extends WorkspaceChoiceCandidate>(root: string, candidates: T[]): T[] {
  if (candidates.length <= 1) return [...candidates];
  const rootName = normalizeToken(path.basename(path.resolve(String(root || '').trim())));
  if (!rootName) return [...candidates];
  const exactWorkspaceId = candidates.filter((item) => normalizeToken(item.workspaceId) === rootName);
  if (exactWorkspaceId.length === 1) return exactWorkspaceId;
  const expectedBasenames = new Set([`${rootName}.workspace.md`, `tiinex-${rootName}.workspace.md`]);
  const exactTargetBasename = candidates.filter((item) => expectedBasenames.has(normalizeToken(path.posix.basename(String(item.workspaceTargetPath || '').replace(/\\/g, '/')))));
  if (exactTargetBasename.length === 1) return exactTargetBasename;
  return [...candidates];
}

function normalizeToken(value: string): string {
  return String(value || '').trim().replace(/\\/g, '/').toLocaleLowerCase();
}