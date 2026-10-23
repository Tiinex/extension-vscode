export const BOOTSTRAP_REPLACEMENT_PREFIX = 'tiinex-bootstrap-replacement';
export const EMPTY_HANDOFF_PREFIX = 'tiinex-empty';
export const BOOTSTRAP_REPLACEMENT_SUFFIX = '.handoff-package.zip';

function nextBootstrapOnlyFilename(prefix: string, names: string[] = []): string {
  let highest = 0;
  const pattern = new RegExp(`^${prefix}-(\\d+)\\.handoff-package\\.zip$`, 'i');
  for (const name of names || []) {
    const match = String(name || '').match(pattern);
    if (!match) continue;
    const value = Number(match[1]);
    if (Number.isSafeInteger(value) && value > highest) highest = value;
  }
  return `${prefix}-${String(highest + 1).padStart(3, '0')}${BOOTSTRAP_REPLACEMENT_SUFFIX}`;
}

export function nextBootstrapReplacementFilename(names: string[] = []): string {
  return nextBootstrapOnlyFilename(BOOTSTRAP_REPLACEMENT_PREFIX, names);
}

export function nextEmptyHandoffFilename(names: string[] = []): string {
  return nextBootstrapOnlyFilename(EMPTY_HANDOFF_PREFIX, names);
}

export function bootstrapOnlyCarrierKind(filename: string): 'replacement' | 'empty' | '' {
  if (/^tiinex-bootstrap-replacement(?:-|\.|$)/i.test(filename)) return 'replacement';
  if (/^tiinex-empty-\d+\.handoff-package\.zip$/i.test(filename)) return 'empty';
  return '';
}
