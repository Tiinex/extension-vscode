import path from 'node:path';
import { localArtifactReference } from '../core/artifactReferencePicker';
import { DeferredFormAttachment, activeDeferredFormAttachments, plannedArtifactLineage, resolveDeferredFormReferences } from '../core/deferredFormAttachment';
import { ArtifactAuthoringSubmission } from '../artifactAuthoringPanel';
import { PreparedArtifactDraft } from '../authoring';
import { inspectDeferredAssetRelocation } from './lineageMaintenance';

/** A staged source is never moved during Attach or Preview. Core projects the
 * ordinary asset filenames from the same qualified artifact coordinate that
 * the artifact authoring contract allocated. The actual operation is one
 * combined durable Core transaction during Create. */
export async function prepareDeferredFormTransaction(
  extensionPath: string,
  workspace: { workspaceId: string; root: string },
  submission: ArtifactAuthoringSubmission,
  pending: readonly DeferredFormAttachment[],
  prepare: (submission: ArtifactAuthoringSubmission) => Promise<PreparedArtifactDraft>
): Promise<{ draft: PreparedArtifactDraft; plan: any; replacements: { before: string; after: string }[] } | null> {
  const active = activeDeferredFormAttachments(submission.values, pending);
  if (!active.length) return null;
  const initial = await prepare(submission);
  if (path.resolve(initial.root) !== path.resolve(workspace.root) || initial.workspaceId !== workspace.workspaceId)
    throw new Error('tiinex.authoring.deferred-attachment-workspace-mismatch');
  const { dimension, directory } = plannedArtifactLineage(initial.path);
  const assetPaths = [...new Set(active.map((item) => {
    const relative = path.relative(workspace.root, item.sourcePath).replace(/\\/g,'/');
    if (!relative || relative === '..' || relative.startsWith('../') || path.isAbsolute(relative) || relative.endsWith('.trace.md'))
      throw new Error('tiinex.authoring.deferred-attachment-source-unqualified');
    return relative;
  }))];
  const first = await inspectDeferredAssetRelocation(extensionPath, workspace, assetPaths, directory, dimension);
  if (first.status !== 'ready' || !first.executable) throw new Error(`tiinex.authoring.deferred-attachment-plan-blocked:${(first.findings||[]).map((f:any)=>f.code).join(',')}`);
  const relocated = new Map<string,string>();
  for (const change of first.changes || []) if (change.kind === 'binary-asset') relocated.set(path.resolve(workspace.root,change.fromPath),change.toPath);
  const projected = resolveDeferredFormReferences(submission.values, active, workspace.root, initial.path, relocated);
  if (projected.active.length !== active.length) throw new Error('tiinex.authoring.deferred-attachment-source-reference-changed');
  const updatedSubmission = { ...submission, values: projected.values };
  const draft = await prepare(updatedSubmission);
  if (draft.path !== initial.path) throw new Error('tiinex.authoring.deferred-attachment-lineage-changed-during-projection');
  const plan = await inspectDeferredAssetRelocation(extensionPath, workspace, assetPaths, directory, dimension, { path: draft.path, markdown: draft.markdown });
  if (plan.status !== 'ready' || !plan.executable) throw new Error(`tiinex.authoring.deferred-attachment-atomic-plan-blocked:${(plan.findings||[]).map((f:any)=>f.code).join(',')}`);
  if (plan.changes.filter((item:any)=>item.kind==='artifact-create').length !== 1) throw new Error('tiinex.authoring.deferred-attachment-artifact-not-staged');
  const changes = (plan.changes || []).filter((item:any)=>item.kind==='binary-asset');
  for (const item of changes) if (relocated.get(path.resolve(workspace.root,item.fromPath)) !== item.toPath)
    throw new Error('tiinex.authoring.deferred-attachment-assets-changed-during-projection');
  return { draft, plan, replacements: active.map((item) => ({ before: item.sourceReference, after: localArtifactReference(workspace.root, directory, path.resolve(workspace.root, relocated.get(item.sourcePath)!)) })) };
}
