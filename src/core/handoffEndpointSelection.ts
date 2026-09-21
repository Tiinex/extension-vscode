export interface ExactHandoffEndpointCandidate {
  id: string;
  target: string;
  reference: string;
  kind: 'role' | 'party';
  label: string;
  workspaceId: string;
  artifactPath: string;
  schemaId: string;
  qualification: string;
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
