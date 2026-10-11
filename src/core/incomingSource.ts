import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';

export interface IncomingQualifiedSource {
  packagePath: string;
  bytes: number;
  mtimeMs: number;
  /** sha256 of the exact carrier bytes at qualification time (not an artifact checksum). */
  sourceSha256?: string;
}

/**
 * A changed filesystem timestamp is not necessarily changed package bytes.
 * Verify the exact original SHA-256 before invalidating a qualified Incoming
 * card. Actual byte changes stay blocked until explicit Refresh requalifies.
 */
async function sha256File(filename: string): Promise<string> {
  const digest = createHash('sha256');
  for await (const chunk of createReadStream(filename)) digest.update(chunk);
  return digest.digest('hex');
}

/** Host-only source presence check. Qualification of the carrier and its Workspaces remains Core-owned. */
export async function incomingSourceStatus(input: IncomingQualifiedSource, options: { verifyBytes?: boolean } = {}): Promise<'current' | 'missing' | 'changed'> {
  const filename = path.resolve(input.packagePath);
  try {
    const before = await stat(filename);
    if (!before.isFile()) return 'missing';
    if (before.size !== input.bytes) return 'changed';
    if (!options.verifyBytes && before.mtimeMs === input.mtimeMs) return 'current';
    if (!/^[a-f0-9]{64}$/i.test(input.sourceSha256 || '')) return 'changed';
    const digest = await sha256File(filename);
    const after = await stat(filename);
    // Do not accept bytes if the file changed while it was being read.
    if (!after.isFile() || after.size !== before.size || after.mtimeMs !== before.mtimeMs) return 'changed';
    return digest === input.sourceSha256?.toLowerCase() ? 'current' : 'changed';
  } catch (error) {
    if ((error as NodeJS.ErrnoException)?.code === 'ENOENT' || (error as NodeJS.ErrnoException)?.code === 'ENOTDIR') return 'missing';
    // An unreadable source must never be mistaken for a byte-exact carrier.
    throw error;
  }
}

export function incomingSourceUnavailableMessage(status: 'missing' | 'changed'): string {
  return status === 'missing'
    ? 'The carrier file is no longer available at its original path. Restore it and refresh Incoming, or close this entry.'
    : 'The carrier bytes differ from the qualified package. Refresh Incoming to qualify the changed bytes before taking an action.';
}
