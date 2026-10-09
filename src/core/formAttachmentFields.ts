import { ArtifactAuthoringModel } from './artifactAuthoringModel';

export interface QualifiedAttachmentField { sectionKey: string; fieldKey: string; label: string; append: boolean }

/** Only Core-exposed workspace-file-reference controls accept file attachments. */
export function qualifiedFileAttachmentFields(model: ArtifactAuthoringModel): QualifiedAttachmentField[] {
  return model.sections.flatMap((section) => section.fields
    .filter((field) => field.affordance?.control === 'workspace-file-reference-picker')
    .map((field) => ({ sectionKey: section.key, fieldKey: field.key,
      label: `${section.label} → ${field.label}`, append: field.affordance?.append === true })));
}
