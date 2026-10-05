import path from 'node:path';
import { writeFile } from 'node:fs/promises';

export type CarrierPrefixPolicy = 'major-only' | 'always';
export type RootCarrierPolicy = 'explicit-new-root' | 'implicit-root';

export interface HostCarrierProgressionObservation {
  packageParentPath?: string;
  packageMajorReason?: string;
  carrierPrefix?: string;
  existingFilenames?: readonly string[];
  prefixPolicy: CarrierPrefixPolicy;
  rootPolicy: RootCarrierPolicy;
}

/**
 * Serialize only host-observed/operator-selected carrier progression facts for Core.
 *
 * The host may report Parent selection, an explicit Major request/reason, the carrier
 * prefix and exact filenames observed in the output directory. It must never compute
 * the next Major itself. Both pointerless and routed manufacture use this seam so Core
 * sees the same frontier facts for the same operation state.
 */
export async function appendHostCarrierProgressionArgs(
  baseArgs: readonly string[],
  scratch: string,
  observation: HostCarrierProgressionObservation
): Promise<string[]> {
  const args = [...baseArgs];
  const parent = String(observation.packageParentPath || '').trim();
  const majorReason = String(observation.packageMajorReason || '').trim();
  const prefix = String(observation.carrierPrefix || '').trim();

  if (parent) args.push('--package-parent', path.resolve(parent));

  if (majorReason) {
    if (!prefix) throw new Error('tiinex.package-builder.package-major-prefix-required');
    args.push('--package-major', '--major-reason', majorReason, '--carrier-prefix', prefix);
    const namesPath = path.join(scratch, 'carrier-existing-filenames.json');
    const existingFilenames = [...new Set((observation.existingFilenames || []).map((item) => String(item || '').trim()).filter(Boolean))]
      .sort((a, b) => a.localeCompare(b));
    await writeFile(namesPath, JSON.stringify({ existingFilenames }), 'utf8');
    args.push('--carrier-existing-filenames', namesPath);
  } else if (observation.prefixPolicy === 'always' && prefix) {
    args.push('--carrier-prefix', prefix);
  }

  if (!parent && !majorReason && observation.rootPolicy === 'explicit-new-root') args.push('--new-root');
  return args;
}
