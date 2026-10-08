import { stat } from 'node:fs/promises';
import path from 'node:path';

/** Host-only source presence check. The qualified carrier/index is still owned by Core. */
export async function incomingSourceStatus(input: { packagePath: string; bytes: number; mtimeMs: number }): Promise<'current' | 'missing' | 'changed'> {
  try {
    const file = await stat(path.resolve(input.packagePath));
    if (!file.isFile()) return 'missing';
    return file.size === input.bytes && file.mtimeMs === input.mtimeMs ? 'current' : 'changed';
  } catch (error) {
    if ((error as NodeJS.ErrnoException)?.code === 'ENOENT' || (error as NodeJS.ErrnoException)?.code === 'ENOTDIR') return 'missing';
    // An unreadable source must never be mistaken for a byte-exact carrier.
    throw error;
  }
}

export function incomingSourceUnavailableMessage(status: 'missing' | 'changed'): string {
  return status === 'missing'
    ? 'The carrier file is no longer available at its original path. Restore it and refresh Incoming, or close this entry.'
    : 'The carrier file changed after qualification. Refresh Incoming to qualify the new bytes before taking an action.';
}
