export interface TransitionPresetCandidate {
  representationKey?: string;
  canonicalIdentifier: string;
  version?: string;
  label: string;
  purpose?: string;
  sourcePath?: string;
  /** Core-provided material provenance (never used by the host for semantic merging). */
  semanticPath?: string;
  representationSha256?: string;
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
  // Core treats representations from different origins as distinct even when
  // their Canonical Identifier and Version happen to match. Only a truly
  // repeated representation may be collapsed by the host presentation.
  const representation = String(candidate.representationKey || '').trim();
  const path = String(candidate.sourcePath || '').trim();
  const identity = `${String(candidate.canonicalIdentifier || '').trim()}\u0000${String(candidate.version || '').trim()}`;
  return representation ? `representation:${representation}` : path ? `origin:${path}\u0000${identity}` : `identity:${identity}`;
}

/** Core qualifies and collapses byte-identical semantic-package aliases.
 * The presentation layer only de-duplicates repeat delivery of the *same*
 * Core representation, never makes competing provenance/binding decisions. */
export function dedupeTransitionPresetCandidates<T extends TransitionPresetCandidate>(candidates: readonly T[]): T[] {
  const byRepresentation = new Map<string, T>();
  for (const candidate of candidates) {
    if (!String(candidate.canonicalIdentifier || '').trim()) continue;
    const key = stableKey(candidate);
    if (!byRepresentation.has(key)) byRepresentation.set(key, candidate);
  }
  return [...byRepresentation.values()].sort((a, b) =>
    String(a.label || a.canonicalIdentifier).localeCompare(String(b.label || b.canonicalIdentifier), undefined, { sensitivity: 'base' })
    || stableKey(a).localeCompare(stableKey(b))
  );
}

export function qualifiedTransitionPresetCandidates<T extends TransitionPresetCandidate>(candidates: readonly T[]): T[] {
  return dedupeTransitionPresetCandidates(candidates.filter((candidate) =>
    candidate.authoringProfile?.state === 'qualified'
    && candidate.authoringProfile?.boundary?.explicitSelectionRequired === true
    && candidate.authoringProfile?.boundary?.recommendation === 'not-projected'
    && candidate.authoringProfile?.boundary?.executionAuthorized === false
    && Boolean(candidate.authoringProfile?.defaults)
    && Object.keys(candidate.authoringProfile?.defaults || {}).length > 0
  ));
}

/** One UI projection for exactly Core-qualified, non-executable Transition
 * authoring guidance. Selection does not invoke or authorize a Transition. */
export function projectTransitionAuthoringPresets(candidates: readonly TransitionPresetCandidate[]) {
  const qualified = qualifiedTransitionPresetCandidates(candidates);
  const labelCounts = new Map<string, number>();
  for (const candidate of qualified) {
    const label = candidate.label || candidate.canonicalIdentifier;
    labelCounts.set(label, (labelCounts.get(label) || 0) + 1);
  }
  return {
    templates: [
      { id: 'manual', label: 'Manual / custom', description: 'Do not apply Transition defaults. Fill the Core-required creation contract directly.', defaults: {} },
      ...qualified.map((candidate) => {
        const label = candidate.label || candidate.canonicalIdentifier;
        const origin = stableKey(candidate);
        return {
          id: `transition:${encodeURIComponent(origin)}`,
          label: (labelCounts.get(label) || 0) > 1 ? `${label} — ${candidate.sourcePath || candidate.representationKey || origin}` : label,
          description: candidate.purpose || 'Core-qualified Transition preset.',
          defaults: candidate.authoringProfile?.defaults || {}
        };
      })
    ],
    selectedTemplateId: 'manual',
    templateLabel: 'Preset / intent'
  };
}
