export interface HandoffAuthoringDefaults {
  title: string;
  purpose: string;
  transferName: string;
  transferKind: 'work-and-responsibility';
  description: string;
  boundary: string;
  signalMeaning: string;
  doesNotMean: string;
  mustNotClaim: string;
}

export function handoffAuthoringDefaults(parentPath = '', parentLabel = ''): HandoffAuthoringDefaults {
  const parent = String(parentPath || '').trim();
  const label = String(parentLabel || '').trim() || 'selected Parent';
  return {
    title: parent ? `Continue ${label}` : '',
    purpose: parent ? `Continue the bounded work represented by ${parent}.` : '',
    transferName: parent ? 'bounded-continuation' : 'bounded-transfer',
    transferKind: 'work-and-responsibility',
    description: parent ? 'Continue the bounded work represented by the selected Parent.' : 'Transfer the bounded work described by this Handoff.',
    boundary: 'bounded implementation/coordination only',
    signalMeaning: parent ? 'Return a qualified result for the bounded work transferred from the selected Parent.' : 'Return a qualified result for the bounded work transferred by this Handoff.',
    doesNotMean: 'This Handoff does not grant authority beyond its explicit transfers.',
    mustNotClaim: 'Transport placement, filenames, or operation imply acceptance or completion.'
  };
}
