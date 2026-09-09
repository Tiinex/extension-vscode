import path from 'node:path';

export interface RouteEndpointLabels { from?: string; to?: string }

function pathApi(platform: NodeJS.Platform): typeof path.posix | typeof path.win32 {
  return platform === 'win32' ? path.win32 : path.posix;
}

/**
 * Pick the immediate parent directory shared by the largest number of repository roots.
 * This is a host-navigation preference only; ties are deterministic.
 */
export function preferredRepositoryParent(repositoryRoots: string[], platform: NodeJS.Platform = process.platform): string {
  const api = pathApi(platform);
  const counts = new Map<string, { display: string; count: number }>();
  for (const root of repositoryRoots.map((item) => String(item || '').trim()).filter(Boolean)) {
    const resolved = api.resolve(root);
    const parent = api.dirname(resolved);
    const key = platform === 'win32' ? parent.toLowerCase() : parent;
    const current = counts.get(key);
    if (current) current.count += 1;
    else counts.set(key, { display: parent, count: 1 });
  }
  return [...counts.values()]
    .sort((a, b) => b.count - a.count || a.display.length - b.display.length || a.display.localeCompare(b.display))[0]?.display || '';
}

/**
 * Role text is a presentation filter only. If it matches no qualified route endpoint,
 * the caller should keep every route visible rather than interpreting the text as authority.
 */
export function routesPreferredForRole<T extends RouteEndpointLabels>(routes: T[], roleText: string): T[] {
  const role = String(roleText || '').trim().toLocaleLowerCase();
  if (!role) return [...routes];
  const matches = routes.filter((route) => [route.from, route.to].some((value) => String(value || '').trim().toLocaleLowerCase() === role));
  return matches.length ? matches : [...routes];
}
