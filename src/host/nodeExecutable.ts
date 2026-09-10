import path from 'node:path';

/**
 * Resolve the executable used for Tiinex's Node-based portable tooling.
 *
 * In a VS Code extension host `process.execPath` is commonly Code.exe rather
 * than node.exe. Spawning that executable as a Node surrogate has proven
 * unreliable in the ordinary Windows main host. Prefer the user's explicit
 * `tiinex.nodePath`; otherwise use the current executable only when it is
 * actually Node, and fall back to Node on PATH.
 */
export function preferredNodeExecutable(
  configured = '',
  hostExecutable = process.execPath,
  platform: NodeJS.Platform = process.platform
): string {
  const explicit = String(configured || '').trim();
  if (explicit) return explicit;
  const pathApi = platform === 'win32' ? path.win32 : path.posix;
  const basename = pathApi.basename(String(hostExecutable || '')).toLocaleLowerCase();
  if (basename === 'node' || basename === 'node.exe') return hostExecutable;
  return platform === 'win32' ? 'node.exe' : 'node';
}
