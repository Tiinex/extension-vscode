export interface TransitionPresetCandidate {
  representationKey?: string;
  canonicalIdentifier: string;
  version?: string;
  label: string;
  purpose?: string;
  sourcePath?: string;
  identityQualification?: string;
  authoringProfile?: {
    state?: string;
    reason?: string;
    generationQualification?: string;
    defaults?: Record<string, unknown>;
    boundary?: {
      explicitSelectionRequired?: boolean;
      recommendation?: string;
      executionAuthorized?: boolean;
      [key: string]: unknown;
    };
  };
}

function stableKey(candidate: TransitionPresetCandidate): string {
  return `${String(candidate.canonicalIdentifier || '').trim()}\u0000${String(candidate.version || '').trim()}`;
}

function preference(candidate: TransitionPresetCandidate): number {
  const key = String(candidate.representationKey || '').toLocaleLowerCase();
  if (key.includes('explicit')) return 0;
  if (key.includes('native')) return 1;
  return 2;
}

/**
 * Shared transition discovery can surface equivalent semantic definitions via
 * multiple representations. Human preset UX consumes one deterministic entry
 * per canonical transition identity without changing transition authority.
 */
export function dedupeTransitionPresetCandidates<T extends TransitionPresetCandidate>(candidates: readonly T[]): T[] {
  const byIdentity = new Map<string, T>();
  for (const candidate of candidates) {
    if (!String(candidate.canonicalIdentifier || '').trim()) continue;
    const key = stableKey(candidate);
    const existing = byIdentity.get(key);
    if (!existing || preference(candidate) < preference(existing)) byIdentity.set(key, candidate);
  }
  return [...byIdentity.values()].sort((a, b) =>
    String(a.label || a.canonicalIdentifier).localeCompare(String(b.label || b.canonicalIdentifier), undefined, { sensitivity: 'base' })
    || stableKey(a).localeCompare(stableKey(b))
  );
}

export function qualifiedTransitionPresetCandidates<T extends TransitionPresetCandidate>(candidates: readonly T[]): T[] {
  return dedupeTransitionPresetCandidates(candidates).filter((candidate) =>
    candidate.authoringProfile?.state === 'qualified'
    && candidate.authoringProfile?.boundary?.explicitSelectionRequired === true
    && candidate.authoringProfile?.boundary?.recommendation === 'not-projected'
    && candidate.authoringProfile?.boundary?.executionAuthorized === false
    && Boolean(candidate.authoringProfile?.defaults)
    && Object.keys(candidate.authoringProfile?.defaults || {}).length > 0
  );
}
