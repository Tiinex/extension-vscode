export interface ExactHandoffEndpointCandidate {
  id: string;
  target: string;
  reference: string;
  kind: 'role' | 'party';
  label: string;
  authoringLabel?: string;
  workspaceId: string;
  artifactPath: string;
  schemaId: string;
  qualification: string;
}


export interface HandoffEndpointAuthoringCandidate extends Omit<ExactHandoffEndpointCandidate, 'reference' | 'qualification'> {
  reference?: string;
  qualification: 'qualified-exact' | 'authoring-assist';
  qualificationBoundary?: string;
}


export function exactHandoffEndpointMarkdownLink(candidate: Pick<ExactHandoffEndpointCandidate, 'reference' | 'authoringLabel' | 'label'>): string {
  const label = String(candidate.authoringLabel || candidate.label || '').trim();
  const target = String(candidate.reference || '').trim();
  if (!label || /[\]\r\n]/u.test(label)) throw new Error('tiinex.authoring.endpoint-link-label-invalid');
  if (!target || /[)\s]/u.test(target)) throw new Error('tiinex.authoring.endpoint-link-target-invalid');
  return `[${label}](${target})`;
}


export interface ExactHandoffEndpointSelectionValue {
  label?: string;
  value?: string;
  kind?: string;
  reference?: string;
}

function endpointFieldContainer(values: Record<string, unknown>, field: string): Record<string, unknown> {
  if (Object.prototype.hasOwnProperty.call(values, field)) return values;
  const matches = Object.values(values).filter((value): value is Record<string, unknown> =>
    Boolean(value && typeof value === 'object' && !Array.isArray(value) && Object.prototype.hasOwnProperty.call(value, field))
  );
  if (matches.length !== 1) throw new Error(`tiinex.authoring.field-container-${matches.length ? 'ambiguous' : 'unresolved'}:${field}`);
  return matches[0];
}

function deleteEndpointReference(values: Record<string, unknown>, field: string): void {
  delete values[field];
  for (const value of Object.values(values)) {
    if (value && typeof value === 'object' && !Array.isArray(value)) delete (value as Record<string, unknown>)[field];
  }
}

export function applyExactHandoffEndpointSelection(
  values: Record<string, unknown>,
  field: 'From' | 'To' | 'Return To',
  selected: ExactHandoffEndpointSelectionValue | null | undefined
): void {
  if (!selected) {
    deleteEndpointReference(values, `${field} Reference`);
    return;
  }
  const reference = String(selected.reference || '').trim();
  const label = String(selected.value || selected.label || '').trim();
  if (!reference || !label) throw new Error(`tiinex.authoring.endpoint-selection-incomplete:${field}`);
  const container = endpointFieldContainer(values, field);
  container[field] = label;
  container[`${field} Reference`] = exactHandoffEndpointMarkdownLink({
    reference,
    authoringLabel: label,
    label: String(selected.label || label).trim()
  });
  if (field !== 'Return To') {
    const kind = String(selected.kind || '').trim();
    if (!kind) throw new Error(`tiinex.authoring.endpoint-selection-incomplete:${field}`);
    container[`${field} Kind`] = kind;
  }
}

export interface ExplicitHandoffEndpointSource {
  workspaceId: string;
  root: string;
}

function normalizedRelativeArtifactPath(value: string): string {
  const normalized = String(value || '').replace(/\\/g, '/').replace(/^\.\//, '').trim();
  if (!normalized || normalized.startsWith('/') || normalized.startsWith('../') || normalized.includes('/../')) return '';
  return normalized;
}

/**
 * Host-side source scoping only. Core owns endpoint qualification and meaning;
 * the VS Code host owns which exact Workspace root the operator selected.
 * Nested repositories/fixtures beneath that root are therefore not promoted
 * into the selected Workspace's live endpoint surface merely by discovery.
 */
export function endpointCandidatesForExplicitSource(
  source: ExplicitHandoffEndpointSource,
  candidates: ExactHandoffEndpointCandidate[]
): ExactHandoffEndpointCandidate[] {
  const workspaceId = String(source.workspaceId || '').trim();
  if (!workspaceId) return [];
  const byExactIdentity = new Map<string, ExactHandoffEndpointCandidate>();
  for (const candidate of candidates || []) {
    const artifactPath = normalizedRelativeArtifactPath(candidate.artifactPath);
    if (!artifactPath || !artifactPath.startsWith('.topics/')) continue;
    if (String(candidate.workspaceId || '').trim() !== workspaceId) continue;
    if (candidate.qualification !== 'qualified-exact') continue;
    const reference = String(candidate.reference || candidate.target || '').trim();
    if (!reference) continue;
    const exact = { ...candidate, artifactPath, reference };
    const key = `${exact.workspaceId}\u0000${exact.artifactPath}\u0000${exact.kind}\u0000${exact.reference}`;
    if (!byExactIdentity.has(key)) byExactIdentity.set(key, exact);
  }
  return [...byExactIdentity.values()].sort((a, b) =>
    a.label.localeCompare(b.label) ||
    a.kind.localeCompare(b.kind) ||
    a.workspaceId.localeCompare(b.workspaceId) ||
    a.artifactPath.localeCompare(b.artifactPath) ||
    a.reference.localeCompare(b.reference)
  );
}

export function endpointCandidatesForAuthoringSource(
  source: ExplicitHandoffEndpointSource,
  candidates: HandoffEndpointAuthoringCandidate[]
): HandoffEndpointAuthoringCandidate[] {
  const workspaceId = String(source.workspaceId || '').trim();
  if (!workspaceId) return [];
  const byIdentity = new Map<string, HandoffEndpointAuthoringCandidate>();
  for (const candidate of candidates || []) {
    const artifactPath = normalizedRelativeArtifactPath(candidate.artifactPath);
    if (!artifactPath || !artifactPath.startsWith('.topics/')) continue;
    if (String(candidate.workspaceId || '').trim() !== workspaceId) continue;
    if (!['qualified-exact', 'authoring-assist'].includes(String(candidate.qualification || ''))) continue;
    // Core's exact endpoint projection owns the qualified Workspace coordinate in
    // `target`; some projections intentionally leave the convenience `reference`
    // field empty. Preserve that exact target as the authoring Reference only for
    // qualified-exact candidates. Authoring-assist candidates must stay reference-
    // unresolved rather than being silently upgraded by the host.
    const reference = candidate.qualification === 'qualified-exact'
      ? String(candidate.reference || candidate.target || '').trim()
      : String(candidate.reference || '').trim();
    const key = `${workspaceId}\u0000${artifactPath}\u0000${candidate.kind}\u0000${reference}\u0000${candidate.label}`;
    if (!byIdentity.has(key)) byIdentity.set(key, { ...candidate, artifactPath, ...(reference ? { reference } : {}) });
  }
  return [...byIdentity.values()].sort((a, b) => a.label.localeCompare(b.label) || a.kind.localeCompare(b.kind) || a.workspaceId.localeCompare(b.workspaceId) || a.artifactPath.localeCompare(b.artifactPath));
}

export function mergeHandoffEndpointAuthoringChoices(groups: HandoffEndpointAuthoringCandidate[][]): HandoffEndpointAuthoringCandidate[] {
  const byIdentity = new Map<string, HandoffEndpointAuthoringCandidate>();
  for (const candidate of groups.flat()) {
    const key = `${candidate.workspaceId}\u0000${candidate.artifactPath}\u0000${candidate.kind}\u0000${candidate.label}`;
    const existing = byIdentity.get(key);
    if (!existing || (existing.qualification !== 'qualified-exact' && candidate.qualification === 'qualified-exact')) byIdentity.set(key, candidate);
  }
  return [...byIdentity.values()].sort((a, b) =>
    (a.qualification === 'qualified-exact' ? 0 : 1) - (b.qualification === 'qualified-exact' ? 0 : 1)
    || a.label.localeCompare(b.label)
    || a.kind.localeCompare(b.kind)
    || a.workspaceId.localeCompare(b.workspaceId)
    || a.artifactPath.localeCompare(b.artifactPath)
  );
}

export function mergeExactHandoffEndpointChoices(groups: ExactHandoffEndpointCandidate[][]): ExactHandoffEndpointCandidate[] {
  const byExactIdentity = new Map<string, ExactHandoffEndpointCandidate>();
  for (const candidate of groups.flat()) {
    const key = `${candidate.workspaceId}\u0000${candidate.artifactPath}\u0000${candidate.kind}\u0000${candidate.reference}`;
    if (!byExactIdentity.has(key)) byExactIdentity.set(key, candidate);
  }
  // Intentionally never key by human label. Same-label exact candidates remain
  // distinct so the operator can see and resolve the ambiguity explicitly.
  return [...byExactIdentity.values()].sort((a, b) =>
    a.label.localeCompare(b.label) ||
    a.kind.localeCompare(b.kind) ||
    a.workspaceId.localeCompare(b.workspaceId) ||
    a.artifactPath.localeCompare(b.artifactPath) ||
    a.reference.localeCompare(b.reference)
  );
}
