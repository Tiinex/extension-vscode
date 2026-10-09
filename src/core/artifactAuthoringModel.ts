export type ArtifactAuthoringSectionKind = 'fields' | 'group' | 'repeatable' | 'body' | 'composite';

export interface ArtifactAuthoringAffordance {
  control: string;
  candidateSource?: string;
  displayLabel?: string;
  selectionKey?: string;
  manualAllowed?: boolean;
  append?: boolean;
  fills?: Record<string, string>;
}

export interface ArtifactAuthoringField {
  key: string;
  label: string;
  required: boolean;
  allowedValues: string[];
  allowedShapes: string[];
  help: string;
  sourceSchemaId?: string;
  sourceHelp?: {
    group: string; schemaPath: string; repository: string; commit: string;
    groupLine: number; fieldLine: number | null; contextScope: string; fieldRule?: string; excerpt: string;
  };
  multiline: boolean;
  affordance?: ArtifactAuthoringAffordance;
}

export interface ArtifactAuthoringSection {
  key: string;
  label: string;
  kind: ArtifactAuthoringSectionKind;
  required: boolean;
  allowNone: boolean;
  fields: ArtifactAuthoringField[];
  parts?: ArtifactAuthoringSection[];
}

export interface ArtifactAuthoringCapabilityGap {
  section: string;
  fields: string[];
  reason: 'schema-optional-fields-not-bound-for-creation';
}

export interface ArtifactAuthoringModel {
  schemaId: string;
  label: string;
  transitionType: string;
  status: string;
  contractId: string;
  sections: ArtifactAuthoringSection[];
  capabilityGaps: ArtifactAuthoringCapabilityGap[];
}

interface ConstraintLike {
  field?: string;
  allowedValues?: unknown[];
  allowedShapes?: unknown[];
  allowedShapeAuthorities?: Array<{ definition?: { humanMeaning?: string } }>;
}

function strings(values: unknown): string[] {
  return Array.isArray(values) ? values.map((value) => String(value || '').trim()).filter(Boolean) : [];
}

function constraintsBySection(guide: any): Map<string, Map<string, ConstraintLike>> {
  const out = new Map<string, Map<string, ConstraintLike>>();
  const descriptor = guide?.factoryDescriptor || {};
  // Ordinary groups live under `sections`, while repeatable declaration
  // sections carry their field domains under `declarations`. Hosts must
  // consume both from the same Core-owned Factory Descriptor; otherwise a
  // closed declaration field (for example Handoff Transfer Kind) silently
  // degrades into an unconstrained free-text control.
  for (const section of [...(descriptor?.sections || []), ...(descriptor?.declarations || [])]) {
    const name = String(section?.group || section?.title || '').trim();
    if (!name) continue;
    const fields = out.get(name) || new Map<string, ConstraintLike>();
    for (const constraint of section?.fieldConstraints || []) {
      const field = String(constraint?.field || '').trim();
      if (field && !fields.has(field)) fields.set(field, constraint);
    }
    out.set(name, fields);
  }
  return out;
}

function fieldModel(name: string, required: boolean, constraint: ConstraintLike | undefined, kind = '', affordance?: ArtifactAuthoringAffordance): ArtifactAuthoringField {
  const allowedValues = strings(constraint?.allowedValues);
  const allowedShapes = strings(constraint?.allowedShapes);
  const help = String(constraint?.allowedShapeAuthorities?.find((item) => item?.definition?.humanMeaning)?.definition?.humanMeaning || '').trim();
  return {
    key: name,
    label: name,
    required,
    allowedValues,
    allowedShapes,
    help,
    multiline: !allowedValues.length && (kind === 'section-body' || kind === 'root-current-summary-body-title'),
    affordance
  };
}

function addField(section: ArtifactAuthoringSection, field: ArtifactAuthoringField): void {
  if (!section.fields.some((item) => item.key === field.key)) section.fields.push(field);
}

function guideSection(guide: any, name: string): any {
  return (guide?.factoryDescriptor?.sections || []).find((section: any) => String(section?.group || section?.title || '').trim() === name);
}

/**
 * Mechanically projects the public Core creation contract + schema guide into
 * host controls. This layer intentionally knows no artifact-specific field
 * semantics: field domains, requiredness and repeatability all come from Core.
 */
export function projectArtifactAuthoringModel(contractResult: any, schemaGuideResult: any, fieldHelpResult?: any): ArtifactAuthoringModel {
  const contract = contractResult?.contract || contractResult?.result?.contract || contractResult || {};
  const guide = schemaGuideResult?.guide || schemaGuideResult?.result?.guide || schemaGuideResult || {};
  const schemaId = String(contract?.target?.schemaId || guide?.schemaId || '').trim();
  const label = String(contract?.target?.label || guide?.purpose || schemaId || 'Artifact').trim();
  const byConstraint = constraintsBySection(guide);
  const sections = new Map<string, ArtifactAuthoringSection>();
  const order: string[] = [];
  const capabilityGaps: ArtifactAuthoringCapabilityGap[] = [];
  const affordanceByInput = new Map<string, ArtifactAuthoringAffordance>();
  for (const item of contract?.creation?.authoringAffordances || []) {
    const input = String(item?.input || '').trim();
    if (!input) continue;
    affordanceByInput.set(input, {
      control: String(item?.control || '').trim(),
      candidateSource: String(item?.candidateSource || '').trim() || undefined,
      displayLabel: String(item?.displayLabel || '').trim() || undefined,
      selectionKey: String(item?.selectionKey || '').trim() || undefined,
      manualAllowed: item?.manualAllowed !== false,
      append: item?.append === true,
      fills: item?.fills ? Object.fromEntries(Object.entries(item.fills).map(([key, value]) => [String(key), String(value || '')])) : undefined
    });
  }

  const ensure = (key: string, kind: ArtifactAuthoringSectionKind, required: boolean, allowNone = false): ArtifactAuthoringSection => {
    const normalized = key || 'Artifact';
    const existing = sections.get(normalized);
    if (existing) {
      existing.required ||= required;
      existing.allowNone ||= allowNone;
      if (existing.kind === 'fields' && kind !== 'fields') existing.kind = kind;
      return existing;
    }
    const section: ArtifactAuthoringSection = { key: normalized, label: normalized, kind, required, allowNone, fields: [] };
    sections.set(normalized, section);
    order.push(normalized);
    return section;
  };

  for (const binding of contract?.creation?.inputBindings || []) {
    const input = String(binding?.input || '').trim();
    const sectionName = String(binding?.section || binding?.group || input || 'Artifact').trim();
    const constraints = byConstraint.get(sectionName) || new Map<string, ConstraintLike>();
    const kind = String(binding?.kind || '').trim();
    if (kind === 'unmapped') {
      // There is no qualified Core representation binding for this input.
      // Rendering it as an editable scalar silently loses user data on Create.
      capabilityGaps.push({ section: sectionName, fields: [input], reason: 'schema-optional-fields-not-bound-for-creation' });
      continue;
    }
    if (kind === 'composite-declaration-section') {
      const section = ensure(sectionName, 'composite', true, false);
      section.parts = (binding?.parts || []).map((part: any) => {
        const partName = String(part.section || part.input || '').trim();
        const partConstraints = byConstraint.get(String(part.group || partName)) || new Map<string, ConstraintLike>();
        const fields = [
          ...strings(part.requiredFields).map((field) => fieldModel(field, true, partConstraints.get(field), 'named-declaration-section', affordanceByInput.get(field))),
          ...strings(part.optionalFields).map((field) => fieldModel(field, false, partConstraints.get(field), 'named-declaration-section', affordanceByInput.get(field)))
        ];
        return { key: partName, label: partName, kind: 'repeatable' as const, required: true, allowNone: part.allowLiteralNone === true, fields };
      });
      continue;
    }
    if (kind === 'named-declaration-section') {
      const section = ensure(sectionName, 'repeatable', true, Boolean(binding?.allowLiteralNone));
      for (const field of strings(binding?.requiredFields)) addField(section, fieldModel(field, true, constraints.get(field), kind, affordanceByInput.get(field)));
      for (const field of strings(binding?.optionalFields)) addField(section, fieldModel(field, false, constraints.get(field), kind, affordanceByInput.get(field)));
      continue;
    }
    if (kind === 'ordinary-group') {
      const section = ensure(sectionName, 'group', true, false);
      for (const field of strings(binding?.requiredFields)) addField(section, fieldModel(field, true, constraints.get(field), kind, affordanceByInput.get(field)));
      for (const field of strings(binding?.optionalFields)) addField(section, fieldModel(field, false, constraints.get(field), kind, affordanceByInput.get(field)));
      continue;
    }
    if (kind === 'section-body' || kind === 'root-current-summary-body-title') {
      const section = ensure(sectionName || input, 'body', true, false);
      addField(section, fieldModel(input, true, constraints.get(input), kind, affordanceByInput.get(input)));
      continue;
    }
    const section = ensure(sectionName, 'fields', String(binding?.requirement || '') === 'required', false);
    const fieldName = String(binding?.field || input).trim();
    if (fieldName) addField(section, fieldModel(fieldName, String(binding?.requirement || '') === 'required', constraints.get(fieldName), kind, affordanceByInput.get(fieldName)));
  }

  // Schema guides can expose optional ordinary fields that the current Core
  // creation renderer does not bind. Showing those as editable would imply
  // values can be materialized when Core will silently omit them. Keep the
  // form limited to executable creation bindings and surface the gap instead.
  for (const key of order) {
    const section = sections.get(key)!;
    if (section.kind !== 'fields') continue;
    const guideValue = guideSection(guide, key);
    const unsupported = strings(guideValue?.optionalFields).filter((field) => !section.fields.some((item) => item.key === field));
    if (unsupported.length) capabilityGaps.push({ section: key, fields: unsupported, reason: 'schema-optional-fields-not-bound-for-creation' });
  }

  return {
    schemaId,
    label,
    transitionType: String(contract?.transitionType || 'create-artifact'),
    status: String(contract?.status || contractResult?.status || 'unknown'),
    contractId: String(contract?.id || ''),
    sections: order.map((key) => sections.get(key)!).filter((section) => section.fields.length || section.parts?.length)
      .map((section) => ({ ...section, fields: section.fields.map((field) => {
        // Match only exact Core-projected input/field identity. A group-level
        // excerpt is not automatically the source rule for an unrelated field.
        const qualified = (fieldHelpResult?.fields || []).find((entry: any) =>
          fieldHelpResult?.schemaId === schemaId &&
          entry.status === 'qualified' && entry.input === field.key &&
          entry.group === section.key && entry.field === field.key &&
          entry.source?.schemaId === schemaId &&
          entry.source?.fieldLine > 0 && entry.source?.contextScope === 'schema-validation-group'
        );
        const source = qualified?.source;
        const sourceHelp = source ? {
          group: String(qualified.group), schemaPath: String(source.schemaPath),
          repository: String(source.repository), commit: String(source.commit),
          groupLine: Number(source.groupLine), fieldLine: Number(source.fieldLine),
          contextScope: String(source.contextScope), fieldRule: String(source.fieldRule || ''), excerpt: String(source.excerpt || '')
        } : undefined;
        return { ...field, sourceSchemaId: schemaId, ...(sourceHelp ? { sourceHelp } : {}) };
      }) })),
    capabilityGaps
  };
}
