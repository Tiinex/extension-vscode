export interface TimedPackageLike {
  filename: string;
  mtimeMs: number;
}

/** Shared ordering for Discovery and open Incoming packages: newest package first. */
export function comparePackageRecency(a: TimedPackageLike, b: TimedPackageLike): number {
  return b.mtimeMs - a.mtimeMs || a.filename.localeCompare(b.filename);
}

/**
 * Outgoing display identity inherited from an Incoming carrier.
 * The qualified filename itself remains owned by shared Tooling.
 */
export function inheritedOutgoingLabel(filename: string, carrierDimension: string, handoffOrdinal = 1): string {
  const dimension = String(carrierDimension || '').trim();
  const ordinal = Number.isFinite(Number(handoffOrdinal)) && Number(handoffOrdinal) > 0 ? Math.trunc(Number(handoffOrdinal)) : 1;
  const suffix = `-${ordinal}`;
  const stem = String(filename || '').trim().replace(/\.handoff-package\.zip$/i, '');
  if (!dimension) return `${stem}${suffix}`.toLocaleLowerCase();
  if (stem === dimension || stem.startsWith(`${dimension}-`)) return `${dimension}${suffix}`.toLocaleLowerCase();
  const marker = `-${dimension}-`;
  const markerIndex = stem.indexOf(marker);
  const trailingMarker = `-${dimension}`;
  const prefix = markerIndex >= 0
    ? stem.slice(0, markerIndex)
    : stem.endsWith(trailingMarker)
      ? stem.slice(0, -trailingMarker.length)
      : '';
  return `${prefix ? `${prefix}-` : ''}${dimension}${suffix}`.toLocaleLowerCase();
}

/** Project a new explicit carrier Major from a user-visible inherited Outgoing label.
 * Transport-only identity: this does not declare semantic/artifact lineage.
 */
export function majorOutgoingLabel(filename: string, parentCarrierDimension: string, nextMajorCarrierDimension: string): string {
  const parent = String(parentCarrierDimension || '').trim();
  const major = String(nextMajorCarrierDimension || '').trim();
  const stem = String(filename || '').trim().replace(/\.handoff-package\.zip$/i, '').toLocaleLowerCase();
  if (!stem || !major) return stem;
  if (!parent) return major;

  if (stem === parent || stem.startsWith(`${parent}-`)) return major;
  const marker = `-${parent}`;
  let index = stem.lastIndexOf(marker);
  while (index >= 0) {
    const after = stem.slice(index + marker.length);
    if (!after || after.startsWith('-')) {
      const prefix = stem.slice(0, index);
      return `${prefix ? `${prefix}-` : ''}${major}`;
    }
    index = stem.lastIndexOf(marker, index - 1);
  }
  return `${stem}-${major}`;
}
