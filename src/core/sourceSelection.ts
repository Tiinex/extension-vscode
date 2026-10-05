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

export type OutgoingSourcePresetMode = 'incoming-only' | 'none' | 'prefer-local' | 'prefer-incoming' | 'local-only';

export const OUTGOING_SOURCE_PRESET_MODES: OutgoingSourcePresetMode[] = [
  'incoming-only',
  'none',
  'prefer-local',
  'prefer-incoming',
  'local-only'
];

export function outgoingSourcePresetLabel(mode: OutgoingSourcePresetMode): string {
  if (mode === 'incoming-only') return 'Incoming only';
  if (mode === 'none') return 'None';
  if (mode === 'prefer-local') return 'Prefer Local';
  if (mode === 'prefer-incoming') return 'Prefer Incoming';
  return 'Local only';
}

export function projectOutgoingSourcePreset(
  mode: OutgoingSourcePresetMode,
  orderedSources: PrioritizedWorkspaceSource[],
  parentIncomingKeys: string[]
): string[] {
  if (mode === 'none') return [];
  const parentKeys = new Set(parentIncomingKeys.map((item) => String(item || '').trim()).filter(Boolean));
  const localByWorkspace = new Map<string, PrioritizedWorkspaceSource>();
  const incomingByWorkspace = new Map<string, PrioritizedWorkspaceSource>();
  const preferEarlier = (current: PrioritizedWorkspaceSource | undefined, candidate: PrioritizedWorkspaceSource): PrioritizedWorkspaceSource =>
    !current || candidate.priority < current.priority || (candidate.priority === current.priority && candidate.key.localeCompare(current.key) < 0) ? candidate : current;
  for (const source of orderedSources) {
    if (!source.workspaceId) continue;
    if (source.source === 'local') localByWorkspace.set(source.workspaceId, preferEarlier(localByWorkspace.get(source.workspaceId), source));
    if (source.source === 'incoming' && parentKeys.has(source.key)) incomingByWorkspace.set(source.workspaceId, preferEarlier(incomingByWorkspace.get(source.workspaceId), source));
  }
  const workspaceIds = [...new Set([...localByWorkspace.keys(), ...incomingByWorkspace.keys()])].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
  const selected: string[] = [];
  for (const workspaceId of workspaceIds) {
    const local = localByWorkspace.get(workspaceId);
    const incoming = incomingByWorkspace.get(workspaceId);
    const winner = mode === 'incoming-only' ? incoming
      : mode === 'local-only' ? local
        : mode === 'prefer-local' ? (local || incoming)
          : (incoming || local);
    if (winner) selected.push(winner.key);
  }
  return selected;
}

export function detectOutgoingSourcePreset(
  selectedKeys: string[],
  orderedSources: PrioritizedWorkspaceSource[],
  parentIncomingKeys: string[]
): OutgoingSourcePresetMode | null {
  const normalized = [...new Set(selectedKeys.map((item) => String(item || '').trim()).filter(Boolean))].sort();
  for (const mode of OUTGOING_SOURCE_PRESET_MODES) {
    const projected = projectOutgoingSourcePreset(mode, orderedSources, parentIncomingKeys).sort();
    if (normalized.length === projected.length && normalized.every((key, index) => key === projected[index])) return mode;
  }
  return null;
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
    // Outgoing selection expresses an explicit operator choice. If the current
    // selection adds a competing source for this Workspace, that newly selected
    // source wins. Byte-identical Incoming preference is only a fallback when
    // there is no new selection intent (for example when normalizing an existing
    // baseline). Guided Entry dedupe has its own embedded-wins projection in Core.
    const winner = explicitlyAdded || byteIdenticalEmbedded || [...sources].sort((a, b) => a.priority - b.priority || a.key.localeCompare(b.key))[0];
    for (const source of sources) if (source.key !== winner.key) selected.delete(source.key);
    selected.add(winner.key);
  }
  return [...selected];
}

