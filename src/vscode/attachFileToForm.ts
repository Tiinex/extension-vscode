import * as vscode from 'vscode';
import path from 'node:path';
import { stat } from 'node:fs/promises';
import { ArtifactAuthoringModel } from '../core/artifactAuthoringModel';
import { qualifiedFileAttachmentFields } from '../core/formAttachmentFields';
import { localArtifactReference } from '../core/artifactReferencePicker';
import { DeferredFormAttachment } from '../core/deferredFormAttachment';
import { suggestedMaterialKind, suggestedMaterialEntryName } from '../core/fileAttachmentPresentation';

export interface OpenAuthoringFileTarget {
  panel: any;
  model: ArtifactAuthoringModel;
  workspaceId: string;
  root: string;
  targetDirectory: string;
  isLocal?: boolean;
  pendingAttachments?: DeferredFormAttachment[];
}

/** Presentation-only host event. A reference never moves material or qualifies its claims. */
export async function attachFileToOpenForm(resource: vscode.Uri | undefined, forms: OpenAuthoringFileTarget[], extensionPath = ''): Promise<void> {
  if (!resource || resource.scheme !== 'file') throw new Error('tiinex.authoring.attach.file-required');
  const info = await stat(resource.fsPath);
  if (!info.isFile()) throw new Error('tiinex.authoring.attach.file-required');
  const eligible = forms.map((form) => ({ form, fields: qualifiedFileAttachmentFields(form.model) }))
    .filter(({ form, fields }) => fields.length && form.panel?.webview && form.root && form.workspaceId);
  if (!eligible.length) {
    await vscode.window.showInformationMessage('Open an artifact form with a Core-qualified file reference field before using Attach to Form.');
    return;
  }
  const formChoice = eligible.length === 1 ? eligible[0] : (await vscode.window.showQuickPick(
    eligible.map((item) => ({ label: item.form.panel.title || item.form.model.label, description: item.form.workspaceId, item })),
    { title: 'Attach to Form · choose open form', placeHolder: 'Select the artifact form receiving the file' }
  ))?.item;
  if (!formChoice) return;
  const fields = formChoice.fields;
  const field = fields.length === 1 ? fields[0] : (await vscode.window.showQuickPick(
    fields.map((item) => ({ label: item.label, description: item.append ? 'Append reference' : 'Set reference', item })),
    { title: 'Attach to Form · choose qualified field', placeHolder: 'Select the receiving file reference field' }
  ))?.item;
  if (!field) return;
  // Non-artifact files retain their current location by default. Asset relocation
  // is a separate Core-owned transaction and must never be guessed by the host.
  let attachedPath = path.resolve(resource.fsPath);
  let deferred = false;
  if (!resource.fsPath.endsWith('.trace.md')) {
    const move = await vscode.window.showQuickPick([
      { label: 'No — keep the file at its current location', value: 'no', picked: true },
      { label: 'Yes — move when this artifact is created', value: 'yes', description: 'Core allocates the filename from the artifact’s planned lineage at Preview/Create' }
    ], { title: 'Attach to Form · move this file?', placeHolder: 'No (recommended): add a reference without moving the file' });
    if (!move) return;
    if (move.value === 'yes') {
      if (!formChoice.form.isLocal) throw new Error('tiinex.authoring.deferred-attachment-local-workspace-required');
      // The source remains untouched until the final Core artifact path is
      // qualified. Preview/Create will project one combined journaled plan.
      const relative = path.relative(path.resolve(formChoice.form.root), attachedPath).replace(/\\/g, '/');
      if (!relative || relative === '..' || relative.startsWith('../') || path.isAbsolute(relative)) throw new Error('tiinex.authoring.deferred-attachment-outside-workspace');
      deferred = true;
    }
  }
  // The existing picker rejects paths outside the selected qualified Workspace.
  // Do not silently copy/move external files or create fragile absolute references.
  const reference = localArtifactReference(formChoice.form.root, formChoice.form.targetDirectory, attachedPath);
  const delivered = await formChoice.form.panel.webview.postMessage({
    type: 'authoring-file-attached', field: field.fieldKey, sectionKey: field.sectionKey,
    reference, append: field.append, deferred,
    entryNameSuggestion: suggestedMaterialEntryName(path.basename(attachedPath)),
    materialKindSuggestion: suggestedMaterialKind(path.basename(attachedPath))
  });
  if (delivered && deferred) {
    const pending = formChoice.form.pendingAttachments || (formChoice.form.pendingAttachments = []);
    if (!pending.some((item) => item.sourcePath === attachedPath && item.sourceReference === reference && item.sectionKey === field.sectionKey && item.fieldKey === field.fieldKey))
      pending.push({ sourcePath: attachedPath, sourceReference: reference, sectionKey: field.sectionKey, fieldKey: field.fieldKey });
  }
}
