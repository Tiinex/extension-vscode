/** Host scheduling only: a changed local transport file merits *requalification*, not trust. */
export function blockedCarrierHasNewSource(
  previous: { phase?: string; mtimeMs?: number; bytes?: number } | null | undefined,
  observed: { mtimeMs: number; bytes: number } | null | undefined
): boolean {
  return Boolean(previous?.phase === 'blocked' && observed &&
    (previous.bytes !== observed.bytes || previous.mtimeMs !== observed.mtimeMs));
}
