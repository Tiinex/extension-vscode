export interface ExplicitHandoffRouteSource {
  workspaceId: string;
  root: string;
}

export interface CoreHandoffRouteCandidate {
  path: string;
  title: string;
  from: string;
  to: string;
  purpose: string;
  qualification: string;
  leaf?: boolean;
}

export interface ExactHandoffRouteCandidate extends CoreHandoffRouteCandidate {
  workspaceId: string;
  path: string;
  leaf: boolean;
}

function normalizedRelativeArtifactPath(value: string): string {
  const normalized = String(value || '').replace(/\\/g, '/').replace(/^\.\//, '').trim();
  if (!normalized || normalized.startsWith('/') || normalized.startsWith('../') || normalized.includes('/../')) return '';
  return normalized;
}

/**
 * Host-side source scoping only. Core owns Handoff qualification and lineage;
 * the VS Code host owns which exact Workspace root the operator selected.
 * A recursively discovered nested repository/fixture is therefore never
 * promoted into the selected Workspace's live Handoff surface by the host.
 */
export function handoffRouteCandidatesForExplicitSource(
  source: ExplicitHandoffRouteSource,
  candidates: CoreHandoffRouteCandidate[],
  leaves: CoreHandoffRouteCandidate[] = []
): ExactHandoffRouteCandidate[] {
  const workspaceId = String(source.workspaceId || '').trim();
  if (!workspaceId) return [];

  const exactLeafPaths = new Set((leaves || [])
    .filter((item) => item.qualification === 'qualified-exact')
    .map((item) => normalizedRelativeArtifactPath(item.path))
    .filter((item) => item.startsWith('.topics/')));
  const sourceCandidates = (candidates || []).length ? candidates : leaves;
  const byExactPath = new Map<string, ExactHandoffRouteCandidate>();

  for (const candidate of sourceCandidates || []) {
    const artifactPath = normalizedRelativeArtifactPath(candidate.path);
    if (!artifactPath || !artifactPath.startsWith('.topics/')) continue;
    if (candidate.qualification !== 'qualified-exact') continue;
    const exact: ExactHandoffRouteCandidate = {
      ...candidate,
      workspaceId,
      path: artifactPath,
      leaf: Boolean(candidate.leaf || exactLeafPaths.has(artifactPath))
    };
    if (!byExactPath.has(artifactPath)) byExactPath.set(artifactPath, exact);
  }

  return [...byExactPath.values()].sort((a, b) =>
    a.title.localeCompare(b.title) ||
    a.path.localeCompare(b.path) ||
    a.from.localeCompare(b.from) ||
    a.to.localeCompare(b.to)
  );
}
