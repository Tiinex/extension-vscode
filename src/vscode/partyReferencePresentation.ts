export interface PartyReferenceWorkspacePresentation {
  workspaceId: string;
  title?: string;
}

export interface PartyReferencePresentationCandidate {
  label: string;
  authoringLabel?: string;
  kind: 'role' | 'party' | 'unknown';
  workspaceId: string;
  schemaId?: string;
  path?: string;
  artifactPath?: string;
}

export interface PresentedPartyReference<T extends PartyReferencePresentationCandidate = PartyReferencePresentationCandidate> {
  candidate: T;
  label: string;
  description: string;
  workspaceLabel: string;
  kindLabel: 'Roles' | 'Organizations' | 'Groups' | 'People' | 'Parties' | 'Other';
  groupLabel: string;
}

export interface PartyReferencePresentationGroup<T extends PartyReferencePresentationCandidate = PartyReferencePresentationCandidate> {
  label: string;
  workspaceLabel: string;
  kindLabel: 'Roles' | 'Organizations' | 'Groups' | 'People' | 'Parties' | 'Other';
  items: PresentedPartyReference<T>[];
}

function workspaceDisplayName(workspaceId: string, workspaces: PartyReferenceWorkspacePresentation[]): string {
  const workspace = workspaces.find((item) => String(item.workspaceId || '').trim() === workspaceId);
  return String(workspace?.title || workspaceId || 'Workspace').trim() || 'Workspace';
}

function kindDisplayName(candidate: PartyReferencePresentationCandidate): PresentedPartyReference['kindLabel'] {
  if (candidate.kind === 'role') return 'Roles';
  if (candidate.kind !== 'party') return 'Other';
  const schemaId = String(candidate.schemaId || '').trim().toLowerCase();
  if (schemaId === 'tiinex.party.organization.v1') return 'Organizations';
  if (schemaId === 'tiinex.party.group.v1') return 'Groups';
  if (schemaId === 'tiinex.party.person.v1') return 'People';
  return 'Parties';
}

function candidatePath(candidate: PartyReferencePresentationCandidate): string {
  return String(candidate.path || candidate.artifactPath || '').replace(/\\/g, '/').trim();
}

export function presentPartyReferenceCandidates<T extends PartyReferencePresentationCandidate>(
  candidates: T[],
  workspaces: PartyReferenceWorkspacePresentation[] = []
): PresentedPartyReference<T>[] {
  const workspaceOrder = new Map(workspaces.map((item, index) => [String(item.workspaceId || '').trim(), index]));
  const presented = candidates.map((candidate) => {
    const workspaceId = String(candidate.workspaceId || '').trim();
    const workspaceLabel = workspaceDisplayName(workspaceId, workspaces);
    const kindLabel = kindDisplayName(candidate);
    return {
      candidate,
      label: String(candidate.authoringLabel || candidate.label || '').trim() || String(candidate.label || '').trim(),
      description: candidatePath(candidate),
      workspaceLabel,
      kindLabel,
      groupLabel: `${workspaceLabel} · ${kindLabel}`
    } satisfies PresentedPartyReference<T>;
  });
  const kindOrder = (value: PresentedPartyReference<T>['kindLabel']): number => {
    if (value === 'Roles') return 0;
    if (value === 'Organizations') return 1;
    if (value === 'Groups') return 2;
    if (value === 'People') return 3;
    if (value === 'Parties') return 4;
    return 5;
  };
  return presented.sort((a, b) => {
    const aw = workspaceOrder.get(String(a.candidate.workspaceId || '').trim()) ?? Number.MAX_SAFE_INTEGER;
    const bw = workspaceOrder.get(String(b.candidate.workspaceId || '').trim()) ?? Number.MAX_SAFE_INTEGER;
    return aw - bw
      || a.workspaceLabel.localeCompare(b.workspaceLabel, undefined, { sensitivity: 'base' })
      || kindOrder(a.kindLabel) - kindOrder(b.kindLabel)
      || a.label.localeCompare(b.label, undefined, { sensitivity: 'base' })
      || a.description.localeCompare(b.description, undefined, { sensitivity: 'base' });
  });
}

export function groupPartyReferenceCandidates<T extends PartyReferencePresentationCandidate>(
  candidates: T[],
  workspaces: PartyReferenceWorkspacePresentation[] = []
): PartyReferencePresentationGroup<T>[] {
  const groups: PartyReferencePresentationGroup<T>[] = [];
  for (const item of presentPartyReferenceCandidates(candidates, workspaces)) {
    let group = groups[groups.length - 1];
    if (!group || group.label !== item.groupLabel) {
      group = { label: item.groupLabel, workspaceLabel: item.workspaceLabel, kindLabel: item.kindLabel, items: [] };
      groups.push(group);
    }
    group.items.push(item);
  }
  return groups;
}
