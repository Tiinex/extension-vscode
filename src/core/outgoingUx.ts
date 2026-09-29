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


