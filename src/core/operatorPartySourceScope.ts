// Host-only source selection: target identity is qualified from Core candidates,
// never inferred from directory or repository names.
export interface OperatorPartySourceChoice { workspaceId: string; root: string }

export function scopedOperatorPartySources<T extends OperatorPartySourceChoice>(choices: T[], target: string): T[] {
  const ref = String(target || '').trim();
  const separator = ref.indexOf('::');
  if (separator <= 0) return choices; // Legacy target shapes: independently qualify all roots.
  const workspaceId = ref.slice(0, separator);
  return choices.filter((choice) => choice.workspaceId === workspaceId);
}
