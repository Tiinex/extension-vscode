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
  const prefix = markerIndex >= 0 ? stem.slice(0, markerIndex) : '';
  return `${prefix ? `${prefix}-` : ''}${dimension}${suffix}`.toLocaleLowerCase();
}
