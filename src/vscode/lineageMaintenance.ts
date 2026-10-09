import * as vscode from 'vscode';
import path from 'node:path';
import { lstat } from 'node:fs/promises';
import { qualifyInstalledCore } from '../host/corePackageBinding';
import { discoverWorkspaceArtifactCandidates } from './lineageMaintenanceInventory';

export interface QualifiedLocalWorkspace { workspaceId: string; root: string }

interface CoreLineage {
  projectPortableLineageMaintenance(request: unknown): any;
  inspectPortableAssetRelocationWorkspace(request: unknown): Promise<any>;
  applyPortableLineageMaintenancePlan(plan: unknown, options: unknown): Promise<any>;
}

/** Core is loaded from the same exactly-qualified binding as host package tools.
 * Never copy its planning/rebinding/transaction semantics into VS Code. */
async function boundCore(extensionPath: string): Promise<CoreLineage> {
  const binding = await qualifyInstalledCore(extensionPath);
  const entry = path.join(binding.root, 'src/public/node.js');
  // The extension compiles to CommonJS. TypeScript rewrites dynamic import()
  // to require(), which does not accept file:// URLs; load the qualified
  // Node >=22 ESM Core entry by its physical absolute filename.
  return require(entry) as CoreLineage;
}

function safeWithin(root: string, absolute: string): string {
  const rel = path.relative(path.resolve(root), path.resolve(absolute)).replace(/\\/g, '/');
  if (!rel || rel === '..' || rel.startsWith('../') || path.posix.isAbsolute(rel) || /^[A-Za-z]:/.test(rel)) throw new Error('Selected file/directory is outside the qualified Workspace.');
  return rel;
}
function topicsDirectory(relative: string): boolean { return relative === '.topics' || relative.startsWith('.topics/'); }
function findings(plan: any): string { return (plan?.findings || []).filter((item: any) => item.severity === 'error').map((item: any) => String(item.message || item.code)).slice(0, 4).join('\n') || 'Core did not qualify this operation.'; }
function concisePreview(plan: any, kind: string): string {
  const changes = (plan?.changes || []).filter((item: any) => item.pathChanged || item.bytesChanged);
  return `# Tiinex · ${kind} preview\n\nCore plan: ${plan.schema}\n\nChanges: ${changes.length} · Path changes: ${plan.summary?.pathChanges || 0} · Rewritten material: ${plan.summary?.byteChanges || 0}\n\n` +
    changes.map((c: any) => `- ${c.fromPath} → ${c.toPath}${c.bytesChanged ? ' · contents updated' : ''}`).join('\n') +
    '\n\nThis is a preview only. Apply requalifies exact source bytes and destinations, uses a durable transaction journal and blocks on drift.\n';
}
async function confirmPreview(plan: any, kind: string): Promise<boolean> {
  if (plan?.status !== 'ready' || !plan?.executable) {
    await vscode.window.showWarningMessage(`${kind} blocked by Core:\n${findings(plan)}`, { modal: true });
    return false;
  }
  const doc = await vscode.workspace.openTextDocument({ language: 'markdown', content: concisePreview(plan, kind) });
  await vscode.window.showTextDocument(doc, { preview: true, preserveFocus: true });
  return (await vscode.window.showWarningMessage(`${kind}: apply ${plan.changes.filter((c: any) => c.pathChanged || c.bytesChanged).length} reviewed changes?`, { modal: true, detail: 'Review the Tiinex plan before confirming. Apply is local-only; unchanged or stale source blocks the transaction.' }, 'Apply reviewed plan')) === 'Apply reviewed plan';
}
async function applied(core: CoreLineage, plan: any, workspace: QualifiedLocalWorkspace): Promise<boolean> {
  const result = await core.applyPortableLineageMaintenancePlan(plan, { workspaceRoots: { [workspace.workspaceId]: workspace.root } });
  if (result.status !== 'ready') { await vscode.window.showWarningMessage(`Tiinex apply blocked: ${findings(result)}${result.recoveryRequired ? '\nRecovery required: preserve the .tiinex transaction journal.' : ''}`, { modal: true }); return false; }
  await vscode.window.showInformationMessage(`Tiinex applied ${plan.changes.filter((c: any) => c.pathChanged || c.bytesChanged).length} qualified file changes.`);
  return true;
}

/** Exposed Explorer action. The selected artifact must belong to exactly one
 * qualified local Workspace. No hidden selection or parent mutation. */
export async function moveArtifactFromExplorer(extensionPath: string, resource: vscode.Uri | undefined, choices: QualifiedLocalWorkspace[], coreOverride?: CoreLineage): Promise<void> {
  if (!resource || resource.scheme !== 'file' || !resource.fsPath.endsWith('.trace.md')) throw new Error('Select a Tiinex .trace.md artifact.');
  const info = await lstat(resource.fsPath);
  if (!info.isFile() || info.isSymbolicLink()) throw new Error('A real local artifact file is required.');
  const candidates = choices.filter((item) => { try { return topicsDirectory(safeWithin(item.root, resource.fsPath)); } catch { return false; } });
  if (candidates.length !== 1) throw new Error('Exactly one qualified local Workspace must own the selected artifact.');
  const selected = candidates[0];
  const oldPath = safeWithin(selected.root, resource.fsPath);
  // VS Code reserves QuickPickItem.kind for separator metadata. Use a separate
  // domain-specific discriminator and an explicit generic so TypeScript cannot
  // infer the readonly string-array showQuickPick overload.
  type LineageOperation = 'move' | 'prepend' | 'normalize-directory';
  interface OperationChoice extends vscode.QuickPickItem { operation: LineageOperation }
  const selectedMode = await vscode.window.showQuickPick<OperationChoice>([
    { label: 'Move to directory', description: 'Core preserves semantic Parent and reassigns directory-local coordinates', operation: 'move' },
    { label: 'Prepend before artifact', description: 'Core rewrites the declared Parent chain after explicit selection', operation: 'prepend' },
    { label: 'Normalize this directory', description: 'Core compacts the directory-local numeric coordinates', operation: 'normalize-directory' }
  ], { title: 'Tiinex Move/Rebase · choose operation', placeHolder: 'Core will project a reviewable, fail-closed transaction' });
  if (!selectedMode) return;
  let operation: any;
  if (selectedMode.operation === 'move') {
    const chosen = await vscode.window.showOpenDialog({ canSelectFiles: false, canSelectFolders: true, canSelectMany: false, defaultUri: vscode.Uri.file(path.dirname(resource.fsPath)), title: 'Move/Rebase · destination inside this Workspace .topics', openLabel: 'Preview destination' });
    if (!chosen?.[0]) return;
    const targetDirectory = safeWithin(selected.root, chosen[0].fsPath);
    if (!topicsDirectory(targetDirectory)) throw new Error('Target must remain inside this Workspace .topics.');
    operation = { kind: 'move', workspaceId: selected.workspaceId, selectedPaths: [oldPath], targetDirectory };
  } else if (selectedMode.operation === 'prepend') {
    const chosen = await vscode.window.showOpenDialog({ canSelectFiles: true, canSelectFolders: false, canSelectMany: false, defaultUri: vscode.Uri.file(path.dirname(resource.fsPath)), title: 'Prepend · select the artifact to insert before', openLabel: 'Preview prepend' });
    if (!chosen?.[0]) return;
    const targetPath = safeWithin(selected.root, chosen[0].fsPath);
    if (!targetPath.endsWith('.trace.md') || !topicsDirectory(targetPath)) throw new Error('Select a Tiinex artifact inside this Workspace .topics.');
    operation = { kind: 'prepend', workspaceId: selected.workspaceId, orderedPaths: [oldPath], targetPath };
  } else {
    operation = { kind: 'normalize-directory', workspaceId: selected.workspaceId, targetDirectory: path.posix.dirname(oldPath) };
  }
  const core = coreOverride || await boundCore(extensionPath);
  const inventory = await discoverWorkspaceArtifactCandidates(selected.root);
  if (inventory.unqualified.length) throw new Error(`Cannot prove a complete artifact namespace: ${inventory.unqualified.slice(0, 3).join(', ')}`);
  if (!inventory.materials.some((item) => item.path === oldPath)) throw new Error('Selected artifact is not present in the exact Workspace representation.');
  const plan = core.projectPortableLineageMaintenance({ operation, materials: inventory.materials.map((item) => ({ ...item, workspaceId: selected.workspaceId })), representationCoverage: 'complete' });
  if (!await confirmPreview(plan, `Artifact ${selectedMode.label}`)) return;
  await applied(core, plan, selected);
}

/** Returns a path only after exact Core inspection, user preview/confirmation
 * and durable Apply all succeed. No mutation on cancel/block. */
export async function relocateOrdinaryFileForForm(extensionPath: string, workspace: QualifiedLocalWorkspace, resource: vscode.Uri, targetDirectory: string, coreOverride?: CoreLineage): Promise<string | undefined> {
  const oldPath = safeWithin(workspace.root, resource.fsPath);
  if (!topicsDirectory(targetDirectory) || oldPath.endsWith('.trace.md')) throw new Error('Ordinary file relocation requires a .topics target and non-artifact source.');
  const coordinate = await vscode.window.showInputBox({ title: 'Attach to Form · exact target lineage', prompt: 'Enter the qualified numeric dimension for the intended artifact (e.g. 001-1-1). The artifact has not been created, so Tiinex will not guess it.', placeHolder: '001-1-1', validateInput: (value) => /^(?:0*[1-9]\d*)(?:-0*[1-9]\d*)*$/.test(value) ? undefined : 'Enter a positive numeric lineage dimension.' });
  if (!coordinate) return undefined;
  const core = coreOverride || await boundCore(extensionPath);
  const plan = await core.inspectPortableAssetRelocationWorkspace({ workspaceRoot: workspace.root, workspaceId: workspace.workspaceId, assetPaths: [oldPath], targetDirectory, lineageDimension: coordinate });
  if (!await confirmPreview(plan, 'Attach to Form · file relocation')) return undefined;
  const change = plan.changes.find((item: any) => item.kind === 'binary-asset' && item.fromPath === oldPath);
  if (!change) throw new Error('Core returned no exact relocated asset identity.');
  if (!await applied(core, plan, workspace)) return undefined;
  return path.resolve(workspace.root, change.toPath);
}

/** Node Core binds to an exact local qualified package. The Create path uses
 * the same inspection and Apply; no local path rewriting is implemented here. */
export async function inspectDeferredAssetRelocation(extensionPath: string, workspace: QualifiedLocalWorkspace, assetPaths: string[], targetDirectory: string, lineageDimension: string, artifactCreation?: {path:string;markdown:string}): Promise<any> {
  const core = await boundCore(extensionPath);
  return core.inspectPortableAssetRelocationWorkspace({ workspaceRoot: workspace.root, workspaceId: workspace.workspaceId,
    assetPaths, targetDirectory, lineageDimension, ...(artifactCreation ? { artifactCreation } : {}) });
}

export async function applyDeferredArtifactAndAssets(extensionPath: string, workspace: QualifiedLocalWorkspace, plan: any): Promise<boolean> {
  if (!await confirmPreview(plan, 'Create artifact and relocate attached files')) return false;
  const core = await boundCore(extensionPath);
  const result = await core.applyPortableLineageMaintenancePlan(plan, { workspaceRoots: { [workspace.workspaceId]: workspace.root } });
  if (result.status !== 'ready') {
    await vscode.window.showWarningMessage(`Tiinex combined Create blocked: ${findings(result)}${result.transaction?.recoveryRequired ? '\nKeep the Tiinex transaction journal for recovery.' : ''}`, { modal: true });
    throw new Error(`tiinex.authoring.deferred-attachment-apply-blocked:${(result.findings || []).map((f:any)=>f.code).join(',')}`);
  }
  return true;
}
