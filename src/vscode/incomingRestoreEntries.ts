import path from 'node:path';

/** Lightweight presentation entries only: no stored path carries Core qualification. */
export interface StoredIncomingRestorationEntry {
  packagePath: string;
  reviewDecision?: 'accepted' | 'rejected' | '';
}
export interface IncomingRestorationEntry extends StoredIncomingRestorationEntry {
  filename: string;
}

/** Deduplicate persisted paths without interpreting any file contents or route identity. */
export function incomingRestorationEntries(records: readonly StoredIncomingRestorationEntry[]): IncomingRestorationEntry[] {
  const entries = new Map<string, IncomingRestorationEntry>();
  for (const record of records) {
    const input = String(record?.packagePath || '').trim();
    if (!input) continue;
    const packagePath = path.resolve(input);
    if (!entries.has(packagePath)) entries.set(packagePath, {
      packagePath,
      filename: path.basename(packagePath),
      ...(record.reviewDecision === 'accepted' || record.reviewDecision === 'rejected' ? { reviewDecision: record.reviewDecision } : {})
    });
  }
  return [...entries.values()];
}
