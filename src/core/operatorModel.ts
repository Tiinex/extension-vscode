export interface RouteIdentity {
  pointerless: boolean;
  workspaceId?: string;
  path?: string;
}

export function routeChoiceKey(route: RouteIdentity): string {
  if (route.pointerless) return 'workspace-carrier:none';
  const workspaceId = String(route.workspaceId || '').trim();
  const path = String(route.path || '').trim().replace(/\\/g, '/');
  if (!workspaceId || !path) throw new Error('tiinex.operator.route-key-incomplete');
  return `handoff:${workspaceId}:${path}`;
}

export function exactRouteByKey<T extends RouteIdentity>(routes: T[], key: string): T {
  const matches = routes.filter((route) => routeChoiceKey(route) === key);
  if (matches.length !== 1) throw new Error(matches.length ? 'tiinex.operator.route-selection-ambiguous' : 'tiinex.operator.route-selection-unresolved');
  return matches[0];
}

export function exactWorkspaceIds<T extends { workspaceId: string }>(available: T[], requested: string[]): T[] {
  const ids = [...new Set(requested.map((value) => String(value || '').trim()).filter(Boolean))];
  if (!ids.length) throw new Error('tiinex.operator.workspace-selection-empty');
  const selected = ids.map((id) => {
    const matches = available.filter((item) => item.workspaceId === id);
    if (matches.length !== 1) throw new Error(matches.length ? `tiinex.operator.workspace-selection-ambiguous:${id}` : `tiinex.operator.workspace-selection-unresolved:${id}`);
    return matches[0];
  });
  return selected.sort((a, b) => a.workspaceId.localeCompare(b.workspaceId));
}

export function normalizedTransferName(value: string): string {
  const normalized = String(value || '').trim().replace(/\s+/g, '-');
  if (!normalized) throw new Error('tiinex.operator.transfer-name-required');
  return normalized;
}
