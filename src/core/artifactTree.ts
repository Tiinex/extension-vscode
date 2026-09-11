import path from 'node:path';

export type ArtifactKind = 'handoff' | 'task' | 'role' | 'workspace' | 'pointer' | 'schema' | 'validator' | 'artifact';
export type TreeProjectionMode = 'logical' | 'files';
export type TreeLineageMode = 'leaves' | 'lineage';

export interface IndexedArtifact {
  id: string;
  workspaceId: string;
  path: string;
  carrierPath: string;
  markdown: string;
  schemaId: string;
  title: string;
  kind: ArtifactKind;
  parentTarget: string;
  createdAt: string;
  roleLabel: string;
}

export interface CurrentRoleArtifact {
  label: string;
  reference: string;
  workspaceId: string;
  path: string;
  createdAt: string;
  artifact: IndexedArtifact;
  source: 'artifact' | 'carrier-cache';
}

export function schemaIdFromMarkdown(markdown: string): string {
  const current = sectionAfter(markdown, /^\s*-\s+Current\s*$/m);
  const match = current.match(/^\s*-\s+Current Schema:\s*(?:\[[^\]]+\]\([^)]+\)|`?([^`\s]+)`?)\s*$/m);
  if (match?.[1]) return cleanSchemaId(match[1]);
  const linked = current.match(/^\s*-\s+Current Schema:\s*\[([^\]]+)\]\([^)]+\)\s*$/m);
  return cleanSchemaId(linked?.[1] || '');
}

export function titleFromMarkdown(markdown: string, fallback = ''): string {
  let fence = '';
  for (const line of markdown.replace(/^\uFEFF/, '').split(/\r?\n/)) {
    const marker = line.match(/^ {0,3}(`{3,}|~{3,})(.*)$/);
    if (fence) {
      if (marker && marker[1][0] === fence[0] && marker[1].length >= fence.length && !marker[2].trim()) fence = '';
      continue;
    }
    if (marker) { fence = marker[1]; continue; }
    const heading = line.match(/^ {0,3}#\s+(.+?)\s*#*\s*$/);
    if (!heading) continue;
    const title = heading[1].trim();
    if (/^Continuity Integrity$/i.test(title)) break;
    if (/^Continuity Context$/i.test(title)) continue;
    return title;
  }
  return String(fallback).trim();
}

export function parentTargetFromMarkdown(markdown: string): string {
  const parent = sectionAfter(markdown, /^\s*-\s+Parent\s*$/m, /^\s*-\s+Current\s*$/m);
  const match = parent.match(/^\s*-\s+Trace:\s*\[[^\]]*\]\(([^)]+)\)\s*$/m);
  return normalizeReferenceTarget(match?.[1] || '');
}

export function createdAtFromMarkdown(markdown: string): string {
  const current = sectionAfter(markdown, /^\s*-\s+Current\s*$/m);
  return String(current.match(/^\s*-\s+Created At:\s*(.+?)\s*$/m)?.[1] || '').trim();
}

export function roleLabelFromMarkdown(markdown: string): string {
  return String(markdown.match(/^\s*-\s+Role Label:\s*(.+?)\s*$/m)?.[1] || '').trim();
}

export function artifactKind(schemaId: string, artifactPath = ''): ArtifactKind {
  const schema = cleanSchemaId(schemaId).toLowerCase();
  if (schema === 'tiinex.handoff.v1') return 'handoff';
  if (schema === 'tiinex.task.v1') return 'task';
  if (schema === 'tiinex.party.role.v1') return 'role';
  if (schema === 'tiinex.workspace.v1') return 'workspace';
  if (schema === 'tiinex.pointer.v1') return 'pointer';
  if (schema.includes('schema')) return 'schema';
  if (schema.includes('validator')) return 'validator';
  if (/\.workspace\.md$/i.test(artifactPath)) return 'workspace';
  return 'artifact';
}

export function makeIndexedArtifact(input: {
  workspaceId?: string;
  path: string;
  carrierPath?: string;
  markdown: string;
}): IndexedArtifact | null {
  const artifactPath = normalizePath(input.path);
  const schemaId = schemaIdFromMarkdown(input.markdown);
  if (!schemaId) return null;
  const workspaceId = String(input.workspaceId || '').trim();
  return {
    id: `${workspaceId || 'carrier'}::${artifactPath}`,
    workspaceId,
    path: artifactPath,
    carrierPath: normalizePath(input.carrierPath || artifactPath),
    markdown: input.markdown,
    schemaId,
    title: titleFromMarkdown(input.markdown, path.posix.basename(artifactPath)),
    kind: artifactKind(schemaId, artifactPath),
    parentTarget: parentTargetFromMarkdown(input.markdown),
    createdAt: createdAtFromMarkdown(input.markdown),
    roleLabel: roleLabelFromMarkdown(input.markdown)
  };
}

export function leafArtifacts(artifacts: IndexedArtifact[]): IndexedArtifact[] {
  const parentIds = new Set<string>();
  const byPath = new Map(artifacts.map((artifact) => [`${artifact.workspaceId}::${normalizePath(artifact.path)}`, artifact]));
  for (const artifact of artifacts) {
    const parent = resolveParentPath(artifact);
    if (!parent) continue;
    const key = `${artifact.workspaceId}::${parent}`;
    if (byPath.has(key)) parentIds.add(key);
  }
  return artifacts.filter((artifact) => !parentIds.has(`${artifact.workspaceId}::${normalizePath(artifact.path)}`));
}

export function artifactsForLineageMode(artifacts: IndexedArtifact[], mode: TreeLineageMode): IndexedArtifact[] {
  return mode === 'lineage' ? [...artifacts] : leafArtifacts(artifacts);
}

export function currentRoleArtifacts(artifacts: IndexedArtifact[]): CurrentRoleArtifact[] {
  const candidates = artifacts.filter((artifact) => artifact.kind === 'role' && artifact.roleLabel);
  const byLabel = new Map<string, IndexedArtifact[]>();
  for (const artifact of candidates) {
    const key = artifact.roleLabel.toLocaleLowerCase();
    byLabel.set(key, [...(byLabel.get(key) || []), artifact]);
  }
  const result: CurrentRoleArtifact[] = [];
  for (const group of byLabel.values()) {
    group.sort((a, b) => compareCreatedAt(b.createdAt, a.createdAt) || b.path.localeCompare(a.path));
    const artifact = group[0];
    result.push({
      label: artifact.roleLabel,
      reference: `${artifact.workspaceId}::${artifact.path}`,
      workspaceId: artifact.workspaceId,
      path: artifact.path,
      createdAt: artifact.createdAt,
      artifact,
      source: 'artifact'
    });
  }
  return result.sort((a, b) => a.label.localeCompare(b.label));
}


export function currentRoleChoices(artifacts: IndexedArtifact[]): CurrentRoleArtifact[] {
  const direct = currentRoleArtifacts(artifacts);
  const byLabel = new Map(direct.map((item) => [item.label.toLocaleLowerCase(), item]));
  const cached = artifacts
    .map(endpointRoleCacheChoice)
    .filter((item): item is CurrentRoleArtifact => Boolean(item));
  const cachedByLabel = new Map<string, CurrentRoleArtifact[]>();
  for (const item of cached) {
    const key = item.label.toLocaleLowerCase();
    if (byLabel.has(key)) continue;
    cachedByLabel.set(key, [...(cachedByLabel.get(key) || []), item]);
  }
  for (const [key, group] of cachedByLabel) {
    group.sort((a, b) => compareCreatedAt(b.createdAt, a.createdAt) || b.reference.localeCompare(a.reference));
    byLabel.set(key, group[0]);
  }
  return [...byLabel.values()].sort((a, b) => a.label.localeCompare(b.label));
}

function endpointRoleCacheChoice(artifact: IndexedArtifact): CurrentRoleArtifact | null {
  if (artifact.kind !== 'pointer') return null;
  if (markdownField(artifact.markdown, 'Carrier Role').toLocaleLowerCase() !== 'endpoint-role') return null;
  const label = markdownField(artifact.markdown, 'Role Label Hint');
  const reference = markdownField(artifact.markdown, 'Role Reference');
  if (!label || !reference || !/^[a-z0-9._-]+::[^\s]+$/i.test(reference)) return null;
  const separator = reference.indexOf('::');
  const workspaceId = markdownField(artifact.markdown, 'Target Workspace Id') || reference.slice(0, separator);
  const innerPath = normalizePath(markdownField(artifact.markdown, 'Target Inner Path') || reference.slice(separator + 2));
  return {
    label,
    reference,
    workspaceId,
    path: innerPath,
    createdAt: artifact.createdAt,
    artifact,
    source: 'carrier-cache'
  };
}

export function logicalGroupForArtifact(artifact: IndexedArtifact): string {
  if (artifact.kind === 'handoff') return 'Handoffs';
  if (artifact.kind === 'task') return 'Tasks';
  if (artifact.kind === 'role') return 'Roles';
  if (artifact.kind === 'workspace') return 'Workspaces';
  if (artifact.kind === 'pointer') return 'Pointers';
  if (artifact.kind === 'schema') return 'Schemas';
  if (artifact.kind === 'validator') return 'Validators';
  return 'Artifacts';
}

export function alphabeticalWorkspaceIds<T extends { workspaceId: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.workspaceId.localeCompare(b.workspaceId, undefined, { sensitivity: 'base' }));
}

export function normalizePath(value: string): string {
  return String(value || '').replace(/\\/g, '/').replace(/^\.\//, '').replace(/^\/+|\/+$/g, '');
}

function normalizeReferenceTarget(value: string): string {
  const raw = String(value || '').trim().split('#')[0].split('?')[0];
  if (!raw || /^(?:https?:|[a-z][a-z0-9+.-]*:)/i.test(raw) || raw.includes('::')) return raw;
  try { return decodeURIComponent(raw); } catch { return raw; }
}

function resolveParentPath(artifact: IndexedArtifact): string {
  const target = artifact.parentTarget;
  if (!target || target.includes('::') || /^(?:https?:|[a-z][a-z0-9+.-]*:)/i.test(target)) return '';
  return normalizePath(path.posix.normalize(path.posix.join(path.posix.dirname(artifact.path), target)));
}


function markdownField(markdown: string, name: string): string {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = markdown.match(new RegExp(`^\\s*-\\s+${escaped}:\\s*(.+?)\\s*$`, 'mi'));
  return String(match?.[1] || '').trim().replace(/^`|`$/g, '');
}

function cleanSchemaId(value: string): string {
  const raw = String(value || '').trim();
  if (!raw) return '';
  const match = raw.match(/tiinex\.[a-z0-9._-]+/i);
  return match ? match[0] : raw.replace(/^`|`$/g, '');
}

function compareCreatedAt(a: string, b: string): number {
  const av = Date.parse(a.replace(' ', 'T'));
  const bv = Date.parse(b.replace(' ', 'T'));
  if (Number.isFinite(av) && Number.isFinite(bv) && av !== bv) return av - bv;
  return a.localeCompare(b);
}

function sectionAfter(markdown: string, start: RegExp, stop?: RegExp): string {
  const match = start.exec(markdown);
  if (!match) return '';
  const rest = markdown.slice(match.index + match[0].length);
  if (!stop) return rest;
  const end = stop.exec(rest);
  return end ? rest.slice(0, end.index) : rest;
}
