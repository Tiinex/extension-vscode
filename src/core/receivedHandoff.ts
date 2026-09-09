import path from 'node:path';

export type ReceivedControlKind = 'handoff' | 'task';

export interface ReceivedControlArtifact {
  id: string;
  kind: ReceivedControlKind;
  workspaceId: string;
  path: string;
  title: string;
}

export interface ReceivedHandoffContext {
  packagePath: string;
  routeId: string;
  routePointerPath: string;
  workspaceId: string;
  handoffPath: string;
  from: string;
  to: string;
  groundingState: string;
  carriedWorkspaceIds: string[];
  requiredWorkspaceIds: string[];
  controls: ReceivedControlArtifact[];
  workspaceRoots: Record<string, string>;
}

export interface QualifiedRouteReceipt {
  id: string;
  state: string;
  workspaceId: string;
  workspaceRelativeHandoffPath: string;
  pointerPath: string;
  from: string;
  to: string;
  requiredClosure?: {
    state?: string;
    requiredCount?: number;
    qualifiedCount?: number;
    requirements?: Array<{ state?: string; resolution?: { workspaceId?: string } }>;
  };
}

function text(value: unknown): string { return String(value ?? '').trim(); }

export function qualifiedRoutes(orientation: any): QualifiedRouteReceipt[] {
  const routes = Array.isArray(orientation?.routes) ? orientation.routes : [];
  return routes
    .filter((item: any) => text(item?.state).toLowerCase() === 'qualified')
    .map((item: any) => ({
      id: text(item?.id),
      state: text(item?.state),
      workspaceId: text(item?.workspaceId),
      workspaceRelativeHandoffPath: text(item?.workspaceRelativeHandoffPath),
      pointerPath: text(item?.pointerPath),
      from: text(item?.from),
      to: text(item?.to),
      requiredClosure: item?.requiredClosure
    }))
    .filter((item: QualifiedRouteReceipt) => Boolean(item.id && item.workspaceId && item.workspaceRelativeHandoffPath && item.pointerPath));
}

export function exactQualifiedRoute(orientation: any, routeId: string): QualifiedRouteReceipt {
  const id = text(routeId);
  const matches = qualifiedRoutes(orientation).filter((item) => item.id === id);
  if (matches.length !== 1) throw new Error(matches.length ? 'tiinex.receive.route-selection-ambiguous' : 'tiinex.receive.route-selection-unresolved');
  return matches[0];
}

export function implicitQualifiedRoute(orientation: any): QualifiedRouteReceipt | null {
  const id = text(orientation?.selection?.implicitRouteId);
  if (!id) return null;
  return exactQualifiedRoute(orientation, id);
}

function requiredWorkspaceIds(route: QualifiedRouteReceipt): string[] {
  const closure = route.requiredClosure;
  const requirements = Array.isArray(closure?.requirements) ? closure!.requirements! : [];
  if (text(closure?.state).toLowerCase() !== 'qualified') throw new Error('tiinex.receive.required-context-unqualified');
  const requiredCount = Number(closure?.requiredCount ?? requirements.length);
  const qualifiedCount = Number(closure?.qualifiedCount ?? requirements.filter((item) => text(item?.state).toLowerCase() === 'qualified').length);
  if (!Number.isSafeInteger(requiredCount) || !Number.isSafeInteger(qualifiedCount) || requiredCount !== qualifiedCount || requiredCount !== requirements.length) throw new Error('tiinex.receive.required-context-incomplete');
  const ids = requirements.map((item) => {
    if (text(item?.state).toLowerCase() !== 'qualified') throw new Error('tiinex.receive.required-context-unqualified');
    const workspaceId = text(item?.resolution?.workspaceId);
    if (!workspaceId) throw new Error('tiinex.receive.required-context-workspace-missing');
    return workspaceId;
  });
  return [...new Set(ids)].sort();
}

function workspaceRelativeControlPath(value: unknown, workspaceIds: string[]): { workspaceId: string; path: string } {
  const projected = text(value).replace(/\\/g, '/').replace(/^\.\//, '');
  const matches = workspaceIds
    .map((workspaceId) => ({ workspaceId, prefix: `${workspaceId}/` }))
    .filter((item) => projected.startsWith(item.prefix));
  if (matches.length !== 1) throw new Error(matches.length ? 'tiinex.receive.current-work-workspace-ambiguous' : 'tiinex.receive.current-work-workspace-unresolved');
  const relative = projected.slice(matches[0].prefix.length);
  if (!relative || relative.startsWith('../') || path.posix.isAbsolute(relative)) throw new Error('tiinex.receive.current-work-path-invalid');
  return { workspaceId: matches[0].workspaceId, path: relative };
}

export function receivedHandoffContext(packagePath: string, orientation: any, grounding: any, routeId: string): ReceivedHandoffContext {
  if (text(grounding?.status).toLowerCase() !== 'ready') throw new Error(`tiinex.receive.grounding-not-ready:${text(grounding?.status) || 'unknown'}`);
  const route = exactQualifiedRoute(orientation, routeId);
  if (text(grounding?.authority?.route?.id) !== route.id || text(grounding?.authority?.route?.pointerPath) !== route.pointerPath || text(grounding?.authority?.route?.workspaceId) !== route.workspaceId) throw new Error('tiinex.receive.grounding-route-mismatch');
  const readiness = text(grounding?.readiness?.state);
  if (!readiness.startsWith('grounded-to-')) throw new Error(`tiinex.receive.grounding-state-invalid:${readiness || 'unknown'}`);

  const workspaceIds: string[] = Array.isArray(orientation?.workspaces)
    ? orientation.workspaces.map((item: any) => text(item?.id || item?.workspaceId)).filter(Boolean)
    : [];
  if (!workspaceIds.includes(route.workspaceId)) workspaceIds.push(route.workspaceId);

  const controls: ReceivedControlArtifact[] = [];
  const current = Array.isArray(grounding?.currentWork?.frontier) ? grounding.currentWork.frontier : [];
  for (const item of current) {
    const target = workspaceRelativeControlPath(item?.path || item?.id, workspaceIds);
    const id = text(item?.id || item?.path);
    if (!id) throw new Error('tiinex.receive.current-work-id-missing');
    controls.push({ id: `task:${id}`, kind: 'task', workspaceId: target.workspaceId, path: target.path, title: text(item?.title) || target.path });
  }
  controls.push({ id: `handoff:${route.id}`, kind: 'handoff', workspaceId: route.workspaceId, path: route.workspaceRelativeHandoffPath, title: `${route.from || 'unknown'} → ${route.to || 'unknown'}` });

  return {
    packagePath: path.resolve(packagePath),
    routeId: route.id,
    routePointerPath: route.pointerPath,
    workspaceId: route.workspaceId,
    handoffPath: route.workspaceRelativeHandoffPath,
    from: route.from,
    to: route.to,
    groundingState: readiness,
    carriedWorkspaceIds: [...new Set(workspaceIds)].sort(),
    requiredWorkspaceIds: requiredWorkspaceIds(route),
    controls,
    workspaceRoots: {}
  };
}

export function withWorkspaceRoots(context: ReceivedHandoffContext, roots: Record<string, string>): ReceivedHandoffContext {
  const normalized: Record<string, string> = {};
  for (const [workspaceId, root] of Object.entries(roots || {})) {
    const id = text(workspaceId);
    const value = text(root);
    if (id && value) normalized[id] = path.resolve(value);
  }
  return { ...context, workspaceRoots: normalized };
}

export function receivedControlTarget(context: ReceivedHandoffContext, controlId: string): { artifact: ReceivedControlArtifact; absolutePath: string } {
  const matches = context.controls.filter((item) => item.id === text(controlId));
  if (matches.length !== 1) throw new Error(matches.length ? 'tiinex.receive.control-selection-ambiguous' : 'tiinex.receive.control-selection-unresolved');
  const artifact = matches[0];
  const root = context.workspaceRoots[artifact.workspaceId];
  if (!root) throw new Error(`tiinex.receive.control-workspace-not-landed:${artifact.workspaceId}`);
  const absolutePath = path.resolve(root, ...artifact.path.replace(/\\/g, '/').split('/'));
  const relative = path.relative(path.resolve(root), absolutePath);
  if (!relative || relative === '..' || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) throw new Error('tiinex.receive.control-target-outside-workspace');
  return { artifact, absolutePath };
}
