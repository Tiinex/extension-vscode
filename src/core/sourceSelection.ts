export interface QualifiedRouteLike {
  workspaceId?: string;
  from?: string;
  to?: string;
}

export interface PrioritizedWorkspaceSource {
  key: string;
  workspaceId: string;
  priority: number;
  source?: 'local' | 'incoming';
  byteIdentical?: boolean;
}

export interface DuplicateResolution {
  selectedKeys: string[];
  deselectedKeys: string[];
  duplicateWorkspaceIds: string[];
}

export function operatorMatchedWorkspaceIds(routes: QualifiedRouteLike[], roleLabel: string): string[] {
  const role = String(roleLabel || '').trim().toLocaleLowerCase();
  if (!role) return [];
  const ids = new Set<string>();
  for (const route of routes || []) {
    const matches = String(route.to || '').trim().toLocaleLowerCase() === role;
    const workspaceId = String(route.workspaceId || '').trim();
    if (matches && workspaceId) ids.add(workspaceId);
  }
  return [...ids];
}

export function resolvePrioritizedWorkspaceDuplicates(selectedKeys: string[], orderedSources: PrioritizedWorkspaceSource[]): DuplicateResolution {
  const selected = new Set(selectedKeys.map((item) => String(item || '').trim()).filter(Boolean));
  const sourceByKey = new Map(orderedSources.map((item) => [item.key, item]));
  const byWorkspace = new Map<string, PrioritizedWorkspaceSource[]>();
  for (const key of selected) {
    const source = sourceByKey.get(key);
    if (!source?.workspaceId) continue;
    byWorkspace.set(source.workspaceId, [...(byWorkspace.get(source.workspaceId) || []), source]);
  }
  const keep = new Set<string>(selected);
  const deselected = new Set<string>();
  const duplicateWorkspaceIds: string[] = [];
  for (const [workspaceId, sources] of byWorkspace) {
    if (sources.length < 2) continue;
    duplicateWorkspaceIds.push(workspaceId);
    sources.sort((a, b) => a.priority - b.priority || a.key.localeCompare(b.key));
    for (const source of sources.slice(1)) {
      keep.delete(source.key);
      deselected.add(source.key);
    }
  }
  return {
    selectedKeys: [...keep],
    deselectedKeys: [...deselected],
    duplicateWorkspaceIds: duplicateWorkspaceIds.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }))
  };
}

export function preferByteIdenticalEmbeddedSelections(selectedKeys: string[], orderedSources: PrioritizedWorkspaceSource[]): string[] {
  const selected = new Set(selectedKeys.map((item) => String(item || '').trim()).filter(Boolean));
  const sourceByKey = new Map(orderedSources.map((item) => [item.key, item]));
  const embeddedByWorkspace = new Map<string, PrioritizedWorkspaceSource>();
  for (const source of orderedSources) {
    if (source.source !== 'incoming' || source.byteIdentical !== true || !source.workspaceId) continue;
    const current = embeddedByWorkspace.get(source.workspaceId);
    if (!current || source.priority < current.priority || (source.priority === current.priority && source.key.localeCompare(current.key) < 0)) embeddedByWorkspace.set(source.workspaceId, source);
  }
  const out = new Set<string>();
  for (const key of selected) {
    const source = sourceByKey.get(key);
    if (!source) { out.add(key); continue; }
    const embedded = source.source === 'local' ? embeddedByWorkspace.get(source.workspaceId) : null;
    out.add(embedded?.key || key);
  }
  return [...out];
}

export function resolveExclusiveWorkspaceSourceSelection(
  previousKeys: string[],
  selectedKeys: string[],
  orderedSources: PrioritizedWorkspaceSource[]
): string[] {
  const previous = new Set(previousKeys.map((item) => String(item || '').trim()).filter(Boolean));
  const selected = new Set(selectedKeys.map((item) => String(item || '').trim()).filter(Boolean));
  const sourceByKey = new Map(orderedSources.map((item) => [item.key, item]));
  const newlySelected = new Set([...selected].filter((key) => !previous.has(key)));
  const byWorkspace = new Map<string, PrioritizedWorkspaceSource[]>();
  for (const key of selected) {
    const source = sourceByKey.get(key);
    if (!source?.workspaceId) continue;
    byWorkspace.set(source.workspaceId, [...(byWorkspace.get(source.workspaceId) || []), source]);
  }

  for (const sources of byWorkspace.values()) {
    if (sources.length < 2) continue;
    const byteIdenticalEmbedded = sources
      .filter((item) => item.source === 'incoming' && item.byteIdentical === true)
      .sort((a, b) => a.priority - b.priority || a.key.localeCompare(b.key))[0];
    const explicitlyAdded = sources
      .filter((item) => newlySelected.has(item.key))
      .sort((a, b) => a.priority - b.priority || a.key.localeCompare(b.key))[0];
    const winner = byteIdenticalEmbedded || explicitlyAdded || [...sources].sort((a, b) => a.priority - b.priority || a.key.localeCompare(b.key))[0];
    for (const source of sources) if (source.key !== winner.key) selected.delete(source.key);
    selected.add(winner.key);
  }
  return [...selected];
}

