import path from 'node:path';

export type HostPlatform = NodeJS.Platform | 'win32' | 'linux' | 'darwin';

function pathApi(platform: HostPlatform): typeof path.win32 | typeof path.posix {
  return platform === 'win32' ? path.win32 : path.posix;
}

export function canonicalRepositoryRoot(value: string, platform: HostPlatform = process.platform): string {
  const api = pathApi(platform);
  const resolved = api.resolve(String(value || '').trim());
  const normalized = resolved.replace(/[\\/]+/g, '/').replace(/\/$/, '');
  return platform === 'win32' ? normalized.toLowerCase() : normalized;
}

export function sameRepositoryRoot(a: string, b: string, platform: HostPlatform = process.platform): boolean {
  return canonicalRepositoryRoot(a, platform) === canonicalRepositoryRoot(b, platform);
}

export function repositoryContainsPath(root: string, candidate: string, platform: HostPlatform = process.platform): boolean {
  const api = pathApi(platform);
  const canonicalRoot = canonicalRepositoryRoot(root, platform);
  const canonicalCandidate = canonicalRepositoryRoot(candidate, platform);
  const relative = api.relative(canonicalRoot, canonicalCandidate).replace(/\\/g, '/');
  return relative === '' || (!relative.startsWith('../') && relative !== '..' && !api.isAbsolute(relative));
}

export function relativeRepositoryPath(root: string, candidate: string, platform: HostPlatform = process.platform): string {
  if (!repositoryContainsPath(root, candidate, platform)) throw new Error('tiinex.repository.resource-outside-root');
  const api = pathApi(platform);
  return api.relative(canonicalRepositoryRoot(root, platform), canonicalRepositoryRoot(candidate, platform)).replace(/\\/g, '/');
}
