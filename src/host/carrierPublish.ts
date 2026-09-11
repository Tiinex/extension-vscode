import path from 'node:path';
import { constants } from 'node:fs';
import { copyFile, link, lstat, mkdir, mkdtemp, readFile, rm } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { checkedCarrierFilename } from '../core/carrierFilename';

/** Complete the file in destination-local staging, then link it into place.
 * No overwrite, no partially copied final filename, no silent fallback to clobber.
 * Filesystems without hard links fail closed; Windows/VS Code acceptance is separate.
 */
export async function publishCarrierFile(source: string, folder: string, filename: string): Promise<string> {
  const name = checkedCarrierFilename(filename);
  const destination = path.resolve(folder, name);
  await mkdir(path.dirname(destination), { recursive: true });
  const stage = await mkdtemp(path.join(path.dirname(destination), '.tiinex-publish-'));
  const candidate = path.join(stage, 'candidate.zip');
  try {
    await copyFile(source, candidate, constants.COPYFILE_EXCL);
    try { await link(candidate, destination); }
    catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
        throw new Error(`tiinex.package-builder.output-publish-failed:${(error as NodeJS.ErrnoException).code || 'unknown'}`);
      }
      const info = await lstat(destination);
      if (!info.isFile() || info.isSymbolicLink()) throw new Error('tiinex.package-builder.output-exists-different');
      const [existing, prepared] = await Promise.all([readFile(destination), readFile(candidate)]);
      const hash = (bytes: Buffer) => createHash('sha256').update(bytes).digest('hex');
      if (existing.length !== prepared.length || hash(existing) !== hash(prepared)) throw new Error('tiinex.package-builder.output-exists-different');
    }
    return destination;
  } finally { await rm(stage, { recursive: true, force: true }); }
}
