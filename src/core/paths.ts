import path from 'node:path';

export function safeRelativePath(value: string): string {
  const raw = String(value || '').replace(/\\/g, '/');
  if (!raw || raw.includes('\0') || raw.startsWith('/') || /^[A-Za-z]:\//.test(raw)) throw new Error(`tiinex.path.unsafe:${value}`);
  const segments = raw.split('/').filter((segment) => segment && segment !== '.');
  if (!segments.length || segments.some((segment) => segment === '..')) throw new Error(`tiinex.path.unsafe:${value}`);
  return segments.join('/');
}

export function safeTarget(root: string, relative: string): string {
  const normalized = safeRelativePath(relative);
  const target = path.resolve(root, ...normalized.split('/'));
  const rel = path.relative(path.resolve(root), target);
  if (!rel || rel === '..' || rel.startsWith(`..${path.sep}`) || path.isAbsolute(rel)) throw new Error(`tiinex.path.outside-root:${relative}`);
  return target;
}

export function ignoredPathCollisions(incomingPaths: string[], ignoredPaths: string[]): string[] {
  const incoming = incomingPaths.map(safeRelativePath);
  const ignored = ignoredPaths.map(safeRelativePath);
  const collisions = new Set<string>();
  for (const source of incoming) {
    for (const local of ignored) {
      if (source === local || source.startsWith(`${local}/`) || local.startsWith(`${source}/`)) {
        collisions.add(`${source} <-> ${local}`);
      }
    }
  }
  return [...collisions].sort();
}
