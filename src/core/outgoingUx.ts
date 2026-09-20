export interface TimedPackageLike {
  filename: string;
  mtimeMs: number;
}

/** Shared ordering for Discovery and open Incoming packages: newest package first. */
export function comparePackageRecency(a: TimedPackageLike, b: TimedPackageLike): number {
  return b.mtimeMs - a.mtimeMs || a.filename.localeCompare(b.filename);
}


/** Stable operator prefix for a fresh root carrier. Any trailing 3-digit carrier-like
 * suffix is treated as presentation noise so one fresh root cannot become `002-001`.
 */
export function rootOutgoingPrefix(value: string): string {
  return String(value || '').trim().toLocaleLowerCase().normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-(\d{3})$/, '') || 'tiinex';
}

/** Human display label for a fresh root. Carrier Major 001 is the only numeric lineage token. */
export function rootOutgoingLabel(value: string): string {
  return `${rootOutgoingPrefix(value)}-001`;
}

/** Recover the stable operator prefix from a qualified carrier filename and its
 * exact carrier dimension. Endpoint labels and other transport presentation
 * segments after the dimension are deliberately ignored.
 */
export function carrierPrefixForDimension(filename: string, carrierDimension: string): string {
  const dimension = String(carrierDimension || '').trim().toLocaleLowerCase();
  const stem = String(filename || '').trim().replace(/\.handoff-package\.zip$/i, '').toLocaleLowerCase();
  if (!stem || !dimension) return '';
  if (stem === dimension || stem.startsWith(`${dimension}-`)) return '';
  const marker = `-${dimension}`;
  let index = stem.lastIndexOf(marker);
  while (index >= 0) {
    const after = stem.slice(index + marker.length);
    if (!after || after.startsWith('-')) return stem.slice(0, index);
    index = stem.lastIndexOf(marker, index - 1);
  }
  return '';
}

export interface QualifiedCarrierFrontierCandidate {
  packagePath: string;
  filename: string;
  dimension: string;
  mtimeMs: number;
}

export type QualifiedCarrierFrontierSelection =
  | { state: 'none' }
  | { state: 'ambiguous' }
  | { state: 'ready'; candidate: QualifiedCarrierFrontierCandidate };

/** Choose the one safe same-prefix frontier that may be advanced as the next
 * explicit Major. Parallel branches at the highest Major are intentionally
 * ambiguous: the host must not silently choose one and discard the other.
 */
export function chooseNextMajorParent(prefixValue: string, candidates: QualifiedCarrierFrontierCandidate[]): QualifiedCarrierFrontierSelection {
  const prefix = rootOutgoingPrefix(prefixValue);
  const qualified = candidates.map((candidate) => {
    const dimension = String(candidate.dimension || '').trim();
    const major = Number.parseInt(dimension.match(/^(\d{3})(?:-|$)/)?.[1] || '', 10);
    return { ...candidate, dimension, major };
  }).filter((candidate) => candidate.dimension && Number.isFinite(candidate.major) && carrierPrefixForDimension(candidate.filename, candidate.dimension) === prefix);
  if (!qualified.length) return { state: 'none' };
  qualified.sort((a, b) => b.major - a.major || b.dimension.split('-').length - a.dimension.split('-').length || b.mtimeMs - a.mtimeMs || a.filename.localeCompare(b.filename));
  const highestMajor = qualified[0].major;
  const frontier = qualified.filter((item) => item.major === highestMajor);
  const chosen = frontier[0];
  const chainCompatible = frontier.every((item) => item.dimension === chosen.dimension || item.dimension.startsWith(`${chosen.dimension}-`) || chosen.dimension.startsWith(`${item.dimension}-`));
  if (!chainCompatible) return { state: 'ambiguous' };
  return { state: 'ready', candidate: chosen };
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

/** Human-output collision suffix only. This never changes carrier lineage. */
export function carrierFilenameForCollisionInstance(filename: string, instance = 1): string {
  const value = String(filename || '').trim();
  const ordinal = Number.isFinite(Number(instance)) && Number(instance) > 1 ? Math.trunc(Number(instance)) : 1;
  if (ordinal <= 1) return value;
  const suffix = '.handoff-package.zip';
  return value.toLocaleLowerCase().endsWith(suffix)
    ? `${value.slice(0, -suffix.length)}--${ordinal}${suffix}`
    : `${value}--${ordinal}`;
}
