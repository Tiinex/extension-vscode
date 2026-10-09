import path from 'node:path';
import { localArtifactReference } from './artifactReferencePicker';

/** A pending form move is neither an asset mutation nor lineage authority.
 * The exact destination is determined by Core *after* authoring projection. */
export interface DeferredFormAttachment {
  sourcePath: string;
  sourceReference: string;
  sectionKey: string;
  fieldKey: string;
}

export function plannedArtifactLineage(artifactPath: string): { directory: string; dimension: string } {
  const normalized = String(artifactPath || '').replace(/\\/g, '/');
  const name = path.posix.basename(normalized);
  const match = /^(\d+(?:-\d+)*)-[a-z0-9][a-z0-9-]*\.trace\.md$/i.exec(name);
  const directory = path.posix.dirname(normalized);
  if (!match || !/^(?:0*[1-9]\d*)(?:-0*[1-9]\d*)*$/.test(match[1])
    || !(directory === '.topics' || directory.startsWith('.topics/')))
    throw new Error('tiinex.authoring.attachment-artifact-lineage-not-qualified');
  return { directory, dimension: match[1] };
}

function rewriteScopedValue(value: unknown, reference: string, replacement: string, fieldKey: string): { value: unknown; matches: number } {
  if (!value || typeof value !== 'object') return { value, matches: 0 };
  if (Array.isArray(value)) {
    let matches = 0;
    const next = value.map((entry) => {
      if (entry && typeof entry === 'object' && !Array.isArray(entry) && 'fields' in entry) {
        const result = rewriteScopedValue((entry as {fields: unknown}).fields, reference, replacement, fieldKey);
        matches += result.matches;
        return { ...entry, fields: result.value };
      }
      return entry;
    });
    return { value: next, matches };
  }
  const o = value as Record<string, unknown>;
  const current = o[fieldKey];
  if (typeof current !== 'string' || !current.includes(reference)) return { value, matches: 0 };
  const matches = current.split(reference).length - 1;
  return { value: { ...o, [fieldKey]: current.replaceAll(reference, replacement) }, matches };
}

/** A removed provisional reference is not moved. Never silently replace an
 * unrelated user-edited field. Each active source maps to a Core output path. */
export function resolveDeferredFormReferences(
  values: Record<string, unknown>, pending: readonly DeferredFormAttachment[],
  workspaceRoot: string, artifactPath: string,
  relocatedPaths: ReadonlyMap<string, string>
): { values: Record<string, unknown>; active: readonly DeferredFormAttachment[] } {
  const { directory } = plannedArtifactLineage(artifactPath);
  let result: Record<string, unknown> = { ...values };
  const active: DeferredFormAttachment[] = [];
  for (const asset of pending) {
    const target = relocatedPaths.get(asset.sourcePath);
    if (!target) throw new Error('tiinex.authoring.attachment-relocation-target-missing');
    const newReference = localArtifactReference(workspaceRoot, directory, path.resolve(workspaceRoot, target));
    let changed: { value: unknown; matches: number };
    if (Object.prototype.hasOwnProperty.call(result, asset.sectionKey) && result[asset.sectionKey] && typeof result[asset.sectionKey] === 'object') {
      changed = rewriteScopedValue(result[asset.sectionKey], asset.sourceReference, newReference, asset.fieldKey);
      if (changed.matches) result[asset.sectionKey] = changed.value;
    } else {
      changed = rewriteScopedValue(result, asset.sourceReference, newReference, asset.fieldKey);
      if (changed.matches) result = changed.value as Record<string, unknown>;
    }
    if (changed.matches) active.push(asset);
  }
  return { values: result, active };
}

export function activeDeferredFormAttachments(values: Record<string, unknown>, pending: readonly DeferredFormAttachment[]): DeferredFormAttachment[] {
  return pending.filter((asset) => {
    const content = Object.prototype.hasOwnProperty.call(values, asset.sectionKey) ? values[asset.sectionKey] : values;
    const contains = (value: unknown): boolean => {
      if (typeof value === 'string') return value.includes(asset.sourceReference);
      if (Array.isArray(value)) return value.some(contains);
      if (value && typeof value === 'object') return Object.entries(value).some(([key,item])=>key===asset.fieldKey && typeof item==='string' ? item.includes(asset.sourceReference) : typeof item==='object' ? contains(item) : false);
      return false;
    };
    return contains(content);
  });
}
