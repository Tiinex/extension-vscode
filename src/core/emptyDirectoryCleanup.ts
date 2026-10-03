import { readdir, rmdir } from 'node:fs/promises';
import path from 'node:path';
import { safeTarget } from './paths';

function normalized(value: string): string {
  return String(value || '').replace(/\\/g, '/').replace(/^\.\//, '').replace(/^\/+|\/+$/g, '');
}

function depth(value: string): number {
  return normalized(value).split('/').filter(Boolean).length;
}

function isWithin(relative: string, ancestor: string): boolean {
  const child = normalized(relative);
  const parent = normalized(ancestor);
  if (!child || !parent) return false;
  return child === parent || child.startsWith(`${parent}/`);
}

export interface EmptyDirectoryCleanupPlan {
  root: string;
  directories: string[];
}

export interface EmptyDirectoryCleanupOptions {
  /** Exact directories that may be traversed but must not themselves be removed. */
  preserveDirectories?: string[];
  /** Directory subtrees that must not be traversed or mutated at all. */
  excludedSubtrees?: string[];
}

export const DEFAULT_EMPTY_DIRECTORY_PRESERVE = ['.topics', '.topics/.workspaces'];
export const DEFAULT_EMPTY_DIRECTORY_EXCLUDES = ['.git', '.hg', '.svn'];

/**
 * Discover directories that are empty now or become empty after their empty descendants are removed.
 * Symlinks and every non-directory entry count as material. Excluded subtrees count as material too.
 */
export async function planEmptyDirectoryCleanup(
  root: string,
  options: EmptyDirectoryCleanupOptions = {}
): Promise<EmptyDirectoryCleanupPlan> {
  const preserve = new Set([
    ...DEFAULT_EMPTY_DIRECTORY_PRESERVE,
    ...(options.preserveDirectories || [])
  ].map(normalized).filter(Boolean));
  const excluded = [...new Set([
    ...DEFAULT_EMPTY_DIRECTORY_EXCLUDES,
    ...(options.excludedSubtrees || [])
  ].map(normalized).filter(Boolean))];
  const directories: string[] = [];

  async function walk(relative: string): Promise<boolean> {
    if (relative && excluded.some((item) => isWithin(relative, item))) return false;
    const absolute = relative ? safeTarget(root, relative) : path.resolve(root);
    const entries = await readdir(absolute, { withFileTypes: true });
    let becomesEmpty = true;

    for (const entry of entries) {
      const child = normalized(relative ? `${relative}/${entry.name}` : entry.name);
      if (excluded.some((item) => isWithin(child, item))) {
        becomesEmpty = false;
        continue;
      }
      if (!entry.isDirectory()) {
        // Files, symlinks, sockets, junction-like dirents, etc. are material and are never followed.
        becomesEmpty = false;
        continue;
      }
      const childBecomesEmpty = await walk(child);
      if (!childBecomesEmpty) becomesEmpty = false;
    }

    if (!relative) return false; // workspace root is never removable
    if (!becomesEmpty) return false;
    if (preserve.has(normalized(relative))) return false;
    directories.push(normalized(relative));
    return true;
  }

  await walk('');
  return {
    root: path.resolve(root),
    directories: directories.sort((left, right) => depth(right) - depth(left) || right.localeCompare(left))
  };
}

/**
 * Apply a previously discovered plan with bounded empty-directory rmdir only.
 * If concurrent work makes a directory non-empty, it is skipped instead of forced.
 */
export async function applyEmptyDirectoryCleanup(plan: EmptyDirectoryCleanupPlan): Promise<string[]> {
  const removed: string[] = [];
  for (const relative of [...new Set(plan.directories.map(normalized).filter(Boolean))]
    .sort((left, right) => depth(right) - depth(left) || right.localeCompare(left))) {
    try {
      await rmdir(safeTarget(plan.root, relative));
      removed.push(relative);
    } catch (error) {
      const code = (error as NodeJS.ErrnoException)?.code;
      if (code === 'ENOENT' || code === 'ENOTEMPTY' || code === 'EEXIST') continue;
      throw error;
    }
  }
  return removed;
}

/** Return child workspace roots that must be excluded while cleaning a parent workspace root. */
export function nestedWorkspaceRootExclusions(root: string, workspaceRoots: string[]): string[] {
  const absoluteRoot = path.resolve(root);
  const result: string[] = [];
  for (const candidate of workspaceRoots) {
    const absoluteCandidate = path.resolve(candidate);
    if (absoluteCandidate === absoluteRoot) continue;
    const relative = path.relative(absoluteRoot, absoluteCandidate);
    if (!relative || relative === '..' || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) continue;
    result.push(normalized(relative));
  }
  return [...new Set(result)].sort((left, right) => left.localeCompare(right));
}
