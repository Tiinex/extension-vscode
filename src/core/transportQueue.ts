export interface StoredTransportQueueItem {
  packagePath: string;
  /** null means every exact qualified route in the package is active. */
  routeIds: string[] | null;
  addedAt: number;
}

export interface TransportPreparedRecord {
  packagePrepared: boolean;
  textPrepared: boolean;
}

export function transportPreparedKey(packageSha256: string, routeId = ''): string {
  const digest = String(packageSha256 || '').trim().toLowerCase();
  if (!/^[a-f0-9]{64}$/.test(digest)) throw new Error('tiinex.transport.sha256-invalid');
  const route = String(routeId || '').trim() || '@package';
  return `${digest}:${route}`;
}

export function transportPrepared(record: TransportPreparedRecord | undefined): boolean {
  return Boolean(record?.packagePrepared && record?.textPrepared);
}

export function mergeTransportRouteSelection(existing: string[] | null | undefined, routeId = ''): string[] | null {
  // null is the stronger selection: the whole qualified package projection.
  if (existing === null) return null;
  const route = String(routeId || '').trim();
  if (!route) return null;
  const out = new Set((existing || []).map((item) => String(item || '').trim()).filter(Boolean));
  out.add(route);
  return [...out].sort((a, b) => a.localeCompare(b));
}

export function selectedTransportRouteIds(allRouteIds: string[], selection: string[] | null | undefined): string[] {
  const qualified = [...new Set(allRouteIds.map((item) => String(item || '').trim()).filter(Boolean))];
  if (selection == null) return qualified;
  const selected = new Set(selection.map((item) => String(item || '').trim()).filter(Boolean));
  return qualified.filter((item) => selected.has(item));
}
