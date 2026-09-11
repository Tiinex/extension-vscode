/** A transport label, never a path or semantic Handoff/lineage declaration. */
export function checkedCarrierFilename(value: string): string {
  const name = String(value || '');
  if (!name || name !== name.trim() || !name.endsWith('.handoff-package.zip') ||
      /[<>:"/\\|?*\x00-\x1f\x7f]/.test(name) || /[. ]$/.test(name) ||
      /^(?:con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(name) ||
      Buffer.byteLength(name, 'utf8') > 255) {
    throw new Error('tiinex.package-builder.carrier-filename-invalid');
  }
  return name;
}
