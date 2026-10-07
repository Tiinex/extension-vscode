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
 * Operator Party recipient scope is a presentation preference only. If it matches
 * no qualified route recipient, keep every route visible rather than treating the
 * host preference as semantic authority.
 */
export function routesPreferredForPartyScope<T extends RouteEndpointLabels>(routes: T[], recipientLabels: string[]): T[] {
  const scope = new Set((recipientLabels || []).map((value) => String(value || '').trim().toLocaleLowerCase()).filter(Boolean));
  if (!scope.size) return [...routes];
  const matches = routes.filter((route) => scope.has(String(route.to || '').trim().toLocaleLowerCase()));
  return matches.length ? matches : [...routes];
}
