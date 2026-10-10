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

/** Conservative authoring draft, NOT a reusable preset. The operator must
 * explicitly supply the Transition semantics and qualify its Generation Binding
 * and Companion before a future form may offer it as a preset. Source form
 * values are displayed for explicit mapping only, never persisted separately. */
export function manualOnlyTransitionSeed(sourceTitle: string, model: ArtifactAuthoringModel): Record<string, unknown> {
  const label = String(sourceTitle || 'Source form').trim().replace(/[\r\n\t]+/g,' ').slice(0,100) || 'Source form';
  const slug = label.normalize('NFKD').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,56) || 'source-form';
  const values: Record<string,unknown> = {
    Name: `Define transition for ${label}`,
    Version: '1.0.0',
    'Canonical Identifier': `tiinex.local.transition-${slug}.v1`,
    'Semantic Boundary': 'Draft definition only. The operator must explicitly specify Purpose, roles, and any applicable Generation Binding and Companion.',
    'Input Roles': 'none',
    'Output Roles': 'none',
    'Lifecycle And Continuity Effects': { 'Lifecycle Effects': 'none', 'Parent Effects': 'none' },
    'Relation Effects': 'none',
    'Applicability Meaning': 'Not qualified as an authoring preset until the intended output, generation authority and attachment are proven.',
    'Placement Intent': {'Destination Bindings':'none','Output Placements':'none'},
    'Interpretation Limits': {
      'Does Not Prove': 'Source-form values are not verified by this draft; it also does not prove a qualified generation binding or schema-companion attachment.',
      'Must Not Be Inferred': 'No role, parent change, side effect, automatic execution or cross-Workspace authority is granted.'
    }
  };
  // Only send fields/sections actually represented by this Core-projected
  // definition model. Never inject a hidden field into host authoring values.
  return compatibleTransitionSeed(values,model);
}
