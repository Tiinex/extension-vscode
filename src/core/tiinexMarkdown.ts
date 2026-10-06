export const TIINEX_ENVELOPE_HEADING = '# Continuity Context';

export function hasTiinexEnvelopeFirstLine(value: string): boolean {
  const firstLine = String(value || '').replace(/^\uFEFF/, '').split(/\r?\n/, 1)[0].trim();
  return firstLine === TIINEX_ENVELOPE_HEADING;
}
