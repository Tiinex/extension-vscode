import { ArtifactAuthoringModel } from './artifactAuthoringModel';

/** Preserve only exact same-named, same-shaped Core-qualified inputs. A source
 * claim/question cannot silently become a Transition Purpose, Role or Effect. */
export function compatibleTransitionSeed(values: Record<string, unknown>, model: ArtifactAuthoringModel): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const section of model.sections) {
    const source = values[section.key];
    if (section.kind === 'fields' || section.kind === 'body') {
      for (const field of section.fields) {
        const direct = values[field.key];
        if (typeof direct === 'string' && direct.trim()) out[field.key] = direct;
      }
    } else if (section.kind === 'group' && source && typeof source === 'object' && !Array.isArray(source)) {
      const fields = Object.fromEntries(section.fields.filter(field => typeof (source as Record<string, unknown>)[field.key] === 'string')
        .map(field => [field.key, (source as Record<string, unknown>)[field.key]]));
      if (Object.keys(fields).length) out[section.key] = fields;
    } else if (section.kind === 'repeatable') {
      if (source === 'none' && section.allowNone) out[section.key] = 'none';
      if (Array.isArray(source)) out[section.key] = source.filter((entry: any) => entry && typeof entry.name === 'string' && entry.fields && typeof entry.fields === 'object')
        .map((entry: any) => ({ name: entry.name, fields: Object.fromEntries(section.fields.filter(field => typeof entry.fields[field.key] === 'string')
          .map(field => [field.key, entry.fields[field.key]])) }));
    } else if (section.kind === 'composite' && source && typeof source === 'object' && !Array.isArray(source)) {
      const validParts = new Set((section.parts || []).map(part => part.key));
      const parts = Object.fromEntries(Object.entries(source).filter(([key, value]) => validParts.has(key) && (Array.isArray(value) || value === 'none')));
      if (Object.keys(parts).length) out[section.key] = parts;
    }
  }
  return out;
}

/** Human-readable source material, not a serializer or authorized transition. */
export function sourceScalarPreview(values: Record<string, unknown>): { label: string; value: string }[] {
  const result: { label: string; value: string }[] = [];
  function walk(value: unknown, label: string, depth: number) {
    if (depth > 5 || result.length >= 80) return;
    if (typeof value === 'string') { if (value.trim() && value !== 'none') result.push({ label, value }); return; }
    if (Array.isArray(value)) { value.forEach((item, index) => walk(item, `${label} [${index+1}]`, depth+1)); return; }
    if (value && typeof value === 'object') for (const [key, nested] of Object.entries(value)) walk(nested, label ? `${label} · ${key}` : key, depth+1);
  }
  walk(values, '', 0);
  return result;
}
