export type ArtifactAuthoringCandidateCapability = 'party-reference';

export const PARTY_REFERENCE_CANDIDATE_SOURCE = 'qualified-party-artifacts';
export const LEGACY_HANDOFF_ENDPOINT_CANDIDATE_SOURCE = 'qualified-handoff-endpoints';

const CAPABILITIES = new Map<string, ArtifactAuthoringCandidateCapability>([
  [PARTY_REFERENCE_CANDIDATE_SOURCE, 'party-reference'],
  [LEGACY_HANDOFF_ENDPOINT_CANDIDATE_SOURCE, 'party-reference']
]);

/**
 * Schema/runtime authoring affordances name candidate sources; the host maps
 * those source identities to reusable discovery capabilities. Artifact types
 * consume the capability by declaration and do not need host-specific code.
 */
export function artifactAuthoringCandidateCapability(candidateSource: unknown): ArtifactAuthoringCandidateCapability | null {
  return CAPABILITIES.get(String(candidateSource || '').trim()) || null;
}

export function isPartyReferenceCandidateSource(candidateSource: unknown): boolean {
  return artifactAuthoringCandidateCapability(candidateSource) === 'party-reference';
}


export interface PartyReferenceAuthoringCandidate {
  label?: string;
  authoringLabel?: string;
  kind?: string;
  reference?: string;
  qualification?: string;
}

export interface PartyReferenceTargetField {
  required?: boolean;
  allowedValues?: readonly string[];
}

/**
 * Project one reusable Party-reference candidate into a schema-declared fill.
 * Readable authoring-assist material may help with a human label, but it must
 * never upgrade identity authority. When the target schema exposes an explicit
 * `unknown` value, use that as the fail-closed semantic kind until an exact
 * qualified candidate is selected. Future artifact types can reuse this without
 * Handoff-specific field names.
 */
export function partyReferenceAuthoringFillValue(
  source: unknown,
  candidate: PartyReferenceAuthoringCandidate,
  targetField?: PartyReferenceTargetField
): string {
  const sourceKey = String(source || '').trim();
  const exact = String(candidate?.qualification || '').trim() === 'qualified-exact';
  if (sourceKey === 'label') return String(candidate?.authoringLabel || candidate?.label || '').trim();
  if (sourceKey === 'reference') return exact ? String(candidate?.reference || '').trim() : '';
  if (sourceKey === 'kind') {
    if (exact) return String(candidate?.kind || '').trim();
    const unknown = (targetField?.allowedValues || []).find((item) => String(item || '').trim().toLowerCase() === 'unknown');
    return String(unknown || '').trim();
  }
  return '';
}

/** A non-exact candidate is hidden when a required fill cannot stay fail-closed. */
export function partyReferenceCandidateSatisfiesAffordance(
  fills: Record<string, string> | undefined,
  candidate: PartyReferenceAuthoringCandidate,
  fields: ReadonlyMap<string, PartyReferenceTargetField>
): boolean {
  for (const [target, source] of Object.entries(fills || {})) {
    const field = fields.get(target);
    if (field?.required && !partyReferenceAuthoringFillValue(source, candidate, field)) return false;
  }
  return true;
}
