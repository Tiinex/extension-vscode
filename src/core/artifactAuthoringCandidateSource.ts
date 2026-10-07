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
 * Core may independently qualify a bounded Workspace/path as an internal authoring
 * Reference even when the candidate remains semantic authoring-assist. The host
 * preserves that Core-supplied resolution aid without upgrading identity authority.
 * Party/Role kind is likewise Core-projected independently of semantic endpoint
 * authority. Future artifact types can reuse this without Handoff-specific names.
 */
export function partyReferenceAuthoringFillValue(
  source: unknown,
  candidate: PartyReferenceAuthoringCandidate,
  targetField?: PartyReferenceTargetField
): string {
  const sourceKey = String(source || '').trim();
  if (sourceKey === 'label') return String(candidate?.authoringLabel || candidate?.label || '').trim();
  if (sourceKey === 'reference') return String(candidate?.reference || '').trim();
  if (sourceKey === 'kind') {
    const kind = String(candidate?.kind || '').trim();
    const allowed = (targetField?.allowedValues || []).map((item) => String(item || '').trim());
    if (kind && (!allowed.length || allowed.some((item) => item.toLowerCase() === kind.toLowerCase()))) return kind;
    const unknown = allowed.find((item) => item.toLowerCase() === 'unknown');
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
