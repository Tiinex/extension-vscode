export const BOOTSTRAP_REPLACEMENT_PREFIX = 'tiinex-bootstrap-replacement';
export const BOOTSTRAP_REPLACEMENT_SUFFIX = '.handoff-package.zip';

export function nextBootstrapReplacementFilename(names: string[] = []): string {
  let highest = 0;
  const pattern = new RegExp(`^${BOOTSTRAP_REPLACEMENT_PREFIX}-(\\d+)\\.handoff-package\\.zip$`, 'i');
  for (const name of names || []) {
    const match = String(name || '').match(pattern);
    if (!match) continue;
    const value = Number(match[1]);
    if (Number.isSafeInteger(value) && value > highest) highest = value;
  }
  return `${BOOTSTRAP_REPLACEMENT_PREFIX}-${String(highest + 1).padStart(3, '0')}${BOOTSTRAP_REPLACEMENT_SUFFIX}`;
}
