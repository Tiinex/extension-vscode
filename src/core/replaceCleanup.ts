import { mkdir, rmdir } from 'node:fs/promises';
import { safeTarget } from './paths';

function normalized(value: string): string {
  return String(value || '').replace(/\\/g, '/').replace(/^\.\//, '').replace(/^\/+|\/+$/g, '');
}

function pathOverlap(a: string, b: string): boolean {
  const left = normalized(a);
  const right = normalized(b);
  if (!left || !right) return false;
  return left === right || left.startsWith(`${right}/`) || right.startsWith(`${left}/`);
}

function depth(value: string): number { return normalized(value).split('/').filter(Boolean).length; }

export async function restorePrunedReplaceDirectories(root: string, directories: string[]): Promise<void> {
  const ordered = [...new Set(directories.map(normalized).filter(Boolean))]
    .sort((left, right) => depth(left) - depth(right) || left.localeCompare(right));
  for (const relative of ordered) await mkdir(safeTarget(root, relative), { recursive: true });
}

export async function pruneEmptyReplaceDirectories(root: string, directories: string[], protectedPaths: string[] = []): Promise<string[]> {
  const protectedSet = [...new Set(protectedPaths.map(normalized).filter(Boolean))];
  const ordered = [...new Set(directories.map(normalized).filter(Boolean))]
    .sort((left, right) => depth(right) - depth(left) || right.localeCompare(left));
  const removed: string[] = [];
  try {
    for (const relative of ordered) {
      if (protectedSet.some((protectedPath) => pathOverlap(relative, protectedPath))) continue;
      try {
        await rmdir(safeTarget(root, relative));
        removed.push(relative);
      } catch (error) {
        const code = (error as NodeJS.ErrnoException)?.code;
        if (code === 'ENOENT' || code === 'ENOTEMPTY' || code === 'EEXIST') continue;
        throw error;
      }
    }
    return removed;
  } catch (error) {
    await restorePrunedReplaceDirectories(root, removed).catch(() => undefined);
    throw error;
  }
}
