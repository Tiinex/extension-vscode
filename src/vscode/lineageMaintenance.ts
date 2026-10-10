import * as vscode from 'vscode';
import path from 'node:path';
import { lstat, readdir, readFile } from 'node:fs/promises';
import { qualifyInstalledCore } from '../host/corePackageBinding';
import { discoverWorkspaceArtifactCandidates } from './lineageMaintenanceInventory';

export interface QualifiedLocalWorkspace { workspaceId: string; root: string }

interface CoreLineage {
  projectPortableLineageMaintenance(request: unknown): any;
  projectPortableMoveSelection(request: unknown): any;
  stableFingerprintBytes(bytes: Uint8Array): string;
  sha256Hex(bytes: Uint8Array): string;
  inspectPortableAssetRelocationWorkspace(request: unknown): Promise<any>;
  inspectPortableScopedMoveWorkspace(request: unknown): Promise<any>;
  inspectPortableCrossWorkspaceContinuity(request: unknown): Promise<any>;
  inspectPortableCrossWorkspaceStandaloneTransfer(request: unknown): Promise<any>;
  inspectPortableCrossWorkspaceAssetBundle(request: unknown): Promise<any>;
  inspectPortableCrossWorkspaceClosedGraph(request: unknown): Promise<any>;
  applyPortableCrossWorkspaceAssetBundle(plan: unknown): Promise<any>;
  applyPortableCrossWorkspaceStandaloneTransfer(plan: unknown): Promise<any>;
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
  if (!resource || resource.scheme !== 'file') throw new Error('Select a local Tiinex artifact or ordinary file.');
  const info = await lstat(resource.fsPath);
  if (!info.isFile() || info.isSymbolicLink()) throw new Error('A real local file is required.');
  const candidates = choices.filter((item) => { try { return topicsDirectory(safeWithin(item.root, resource.fsPath)); } catch { return false; } });
  if (candidates.length !== 1) throw new Error('Exactly one qualified local Workspace must own the selected artifact.');
  const selected = candidates[0];
  const oldPath = safeWithin(selected.root, resource.fsPath);
  if (!oldPath.endsWith('.trace.md')) {
    // Ordinary assets use Core's *existing* exact asset/reference inspection,
    // drift-checked Apply and recovery journal. No separate host move engine.
    const chosen = await vscode.window.showOpenDialog({ canSelectFiles: false, canSelectFolders: true,
      canSelectMany: false, defaultUri: vscode.Uri.file(path.dirname(resource.fsPath)),
      title: 'Move/Rebase · ordinary file destination', openLabel: 'Review asset destination' });
    if (!chosen?.[0]) return;
    const destination = safeWithin(selected.root, chosen[0].fsPath);
    if (!topicsDirectory(destination)) throw new Error('Target must remain inside this Workspace .topics.');
    await relocateOrdinaryFileForForm(extensionPath, selected, resource, destination, coreOverride, 'Move/Rebase · ordinary file');
    return;
  }
  // VS Code reserves QuickPickItem.kind for separator metadata. Use a separate
  // domain-specific discriminator and an explicit generic so TypeScript cannot
  // infer the readonly string-array showQuickPick overload.
  type LineageOperation = 'move' | 'prepend' | 'normalize-directory' | 'scoped';
  interface OperationChoice extends vscode.QuickPickItem { operation: LineageOperation }
  const selectedMode = await vscode.window.showQuickPick<OperationChoice>([
    { label: 'Move to directory', description: 'Core preserves semantic Parent and reassigns directory-local coordinates', operation: 'move' },
    { label: 'Select scope + artifact anchor', description: 'Alone / Assets / Leaves / Branch / Tree; Core qualifies Parent policy and exact placement', operation: 'scoped' },
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
  } else if (selectedMode.operation === 'scoped') {
    const core = coreOverride || await boundCore(extensionPath);
    interface ScopeChoice extends vscode.QuickPickItem { selectionScope: string }
    const scope = await vscode.window.showQuickPick<ScopeChoice>([
      {label:'Alone',selectionScope:'alone',description:'Only the selected artifact'},
      {label:'Alone + Assets',selectionScope:'alone-with-assets',description:'Artifact plus exact-dimension assets'},
      {label:'Self + Leaves',selectionScope:'self-and-leaves',description:'Artifact, semantic descendants and dimension-owned assets'},
      {label:'Branch',selectionScope:'branch',description:'Continue toward the fork, not including the fork'},
      {label:'Tree',selectionScope:'tree',description:'Qualified same-directory root and all its descendants'}
    ],{title:'Move/Rebase · select exact source scope'});
    if (!scope) return;
    const anchor = await vscode.window.showOpenDialog({canSelectFiles:true,canSelectFolders:false,canSelectMany:false,
      defaultUri:vscode.Uri.file(path.dirname(resource.fsPath)),title:'Move/Rebase · select destination artifact anchor',openLabel:'Choose artifact anchor'});
    if (!anchor?.[0]) return;
    // The chosen anchor may belong to another explicitly qualified local
    // Workspace. Never coerce its relative path into the source Workspace.
    const anchorOwners=choices.filter(w=>{try{return topicsDirectory(safeWithin(w.root,anchor[0].fsPath));}catch{return false;}});
    if(anchorOwners.length!==1)throw new Error('Target anchor must belong to exactly one qualified local Workspace.');
    const targetWorkspace=anchorOwners[0];
    const targetPath=safeWithin(targetWorkspace.root,anchor[0].fsPath);
    if(!targetPath.endsWith('.trace.md') || !topicsDirectory(targetPath)) throw new Error('A qualified artifact anchor is required.');
    interface PlacementChoice extends vscode.QuickPickItem { placement: string }
    const placement=await vscode.window.showQuickPick<PlacementChoice>([
      {label:'Same',description:'Place at the anchor level; preserve Parent',placement:'same'},
      {label:'Append',description:'Selection root becomes the anchor child if exact dimension can be preserved',placement:'append'},
      {label:'Prepend',description:'Selection takes anchor dimension; only straight chains',placement:'prepend'}
    ],{title:'Move/Rebase · placement'});
    if(!placement)return;
    let parentPolicy='keep';
    if(placement.placement!=='same') {
      interface ParentChoice extends vscode.QuickPickItem { policy: string }
      const parent=await vscode.window.showQuickPick<ParentChoice>([
        {label:'New Parent',description:'Core qualifies the new semantic Parent link and integrity',policy:'new'},
        {label:'Keep Parent',description:'Preserve exact semantic Parent; Core qualifies coordinate positioning, locator rewrite and integrity',policy:'keep'}
      ],{title:'Move/Rebase · semantic Parent policy'});
      if(!parent)return;parentPolicy=parent.policy;
    }
    if(targetWorkspace.workspaceId!==selected.workspaceId) {
      const request={
        sourceWorkspace:{workspaceId:selected.workspaceId,workspaceRoot:selected.root},
        targetWorkspace:{workspaceId:targetWorkspace.workspaceId,workspaceRoot:targetWorkspace.root},
        operation:{kind:'scoped-move',workspaceId:selected.workspaceId,targetWorkspaceId:targetWorkspace.workspaceId,
          selectedPath:oldPath,scope:scope.selectionScope,targetPath,placement:placement.placement,parentPolicy}
      };
      // Deliberately narrow executable vertical slice. The ALL-OTHER-CASES
      // inspector below still returns read-only Git/Parent recovery guidance.
      // Core, not VS Code, qualifies the entire closed Parent subtree and
      // recomputes every transferred child's exact Parent integrity value.
      if(scope.selectionScope==='self-and-leaves' && placement.placement==='same' && parentPolicy==='keep') {
        const candidate=await core.inspectPortableCrossWorkspaceClosedGraph(request);
        if(candidate.status==='ready' && candidate.executable) {
          const lines=(candidate.moves||[]).map((m:any)=>`${request.sourceWorkspace.workspaceId}::${m.fromPath} → ${request.targetWorkspace.workspaceId}::${m.toPath}`);
          const doc=await vscode.workspace.openTextDocument({language:'markdown',content:
            `# Tiinex · Closed cross-Workspace Parent graph\n\n${lines.join('\n')}\n\n`+
            'Core qualified every semantic Parent/Origin, C14n integrity and selected asset. This is a two-root compensated transaction; external readers and unknown third Workspaces remain outside scope.\n'});
          await vscode.window.showTextDocument(doc,{preview:true,preserveFocus:true});
          const confirm=await vscode.window.showWarningMessage('Apply qualified Cross-Workspace closed lineage graph?',
            {modal:true,detail:'Both local Workspaces change. Closed Parent graph only; no outside readers. Review each file and the safety limits.'},'Apply reviewed plan');
          if(confirm!=='Apply reviewed plan')return;
          const receipt=await core.applyPortableCrossWorkspaceAssetBundle(candidate);
          if(receipt.status!=='ready') {await vscode.window.showWarningMessage(`Cross-Workspace closed graph blocked: ${findings(receipt)}`,{modal:true});return;}
          await vscode.window.showInformationMessage(`Moved ${candidate.moves.length} closed lineage files across Workspaces.`);
          return;
        }
      }
      if(scope.selectionScope==='alone-with-assets' && placement.placement==='same' && parentPolicy==='keep') {
        const candidate=await core.inspectPortableCrossWorkspaceAssetBundle(request);
        if(candidate.status==='ready' && candidate.executable) {
          const lines=(candidate.moves||[]).map((m:any)=>`${request.sourceWorkspace.workspaceId}::${m.fromPath} → ${request.targetWorkspace.workspaceId}::${m.toPath}`);
          const doc=await vscode.workspace.openTextDocument({language:'markdown',content:
            `# Tiinex · Cross-Workspace bounded asset bundle\n\n${lines.join('\n')}\n\n`+
            'Exactly one Parentless artifact + its same-dimension assets. Core independently rechecks both roots and uses a mirrored journal, exact SHA and crash recovery.\n'});
          await vscode.window.showTextDocument(doc,{preview:true,preserveFocus:true});
          const confirm=await vscode.window.showWarningMessage('Apply bounded Cross-Workspace artifact + assets?',
            {modal:true,detail:'Both Workspaces will change. This checks only these two local Workspaces; other Workspaces/Git readers are NOT certified. Only exact reviewed files are transferred.'},'Apply reviewed plan');
          if(confirm!=='Apply reviewed plan')return;
          const receipt=await core.applyPortableCrossWorkspaceAssetBundle(candidate);
          if(receipt.status!=='ready') {await vscode.window.showWarningMessage(`Cross-Workspace asset bundle blocked: ${findings(receipt)}`,{modal:true});return;}
          await vscode.window.showInformationMessage(`Moved ${candidate.moves.length} files across Workspaces.`);
          return;
        }
      }
      if(scope.selectionScope==='alone' && placement.placement==='same' && parentPolicy==='keep') {
        const candidate=await core.inspectPortableCrossWorkspaceStandaloneTransfer(request);
        if(candidate.status==='ready' && candidate.executable) {
          const destination=`${candidate.move.targetWorkspaceId}::${candidate.move.toPath}`;
          const before=`${candidate.move.sourceWorkspaceId}::${candidate.move.fromPath}`;
          const doc=await vscode.workspace.openTextDocument({language:'markdown',content:
            `# Tiinex · Cross-Workspace standalone transfer

${before} → ${destination}

`+
            'Only Alone + Same + Keep Parent with no incoming references, Parent, children or selected assets. '+
            'Core rechecks both Workspace snapshots, locks both roots, journals and recovers partial writes.\n'});
          await vscode.window.showTextDocument(doc,{preview:true,preserveFocus:true});
          const confirm=await vscode.window.showWarningMessage('Apply bounded Cross-Workspace standalone transfer?',
            {modal:true,detail:'Both Workspaces are mutated. Keep source and target transaction journals if recovery is required.'},'Apply reviewed plan');
          if(confirm!=='Apply reviewed plan')return;
          const result=await core.applyPortableCrossWorkspaceStandaloneTransfer(candidate);
          if(result.status!=='ready') {
            await vscode.window.showWarningMessage(`Cross-Workspace Apply blocked: ${findings(result)}`,{modal:true});return;
          }
          await vscode.window.showInformationMessage(`Moved ${before} → ${destination}`);
          return;
        }
      }
      const inspection=await core.inspectPortableCrossWorkspaceContinuity({
        sourceWorkspace:{workspaceId:selected.workspaceId,workspaceRoot:selected.root},
        targetWorkspace:{workspaceId:targetWorkspace.workspaceId,workspaceRoot:targetWorkspace.root},
        operation:{kind:'scoped-move',workspaceId:selected.workspaceId,targetWorkspaceId:targetWorkspace.workspaceId,
          selectedPath:oldPath,scope:scope.selectionScope,targetPath,
          placement:placement.placement,parentPolicy}
      });
      // This is an evidence discovery/preview ONLY. Until Core explicitly
      // qualifies a two-root journal and exact reference rewrite, no Apply.
      const incoming=inspection.inboundReferences?.length || 0;
      const parents=inspection.outboundParentDependencies?.length || 0;
      const recovery=inspection.publicationRecovery?.attempts || [];
      const next=recovery.find((r:any)=>r.method==='host-repository-read');
      await vscode.window.showWarningMessage(`Cross-Workspace Move/Rebase is read-only:\n${findings(inspection)}\nIncoming references: ${incoming} · External Parents: ${parents}\n${next ? `Next: ${next.operation}.` : 'Use Core read-only Git/connector recovery where qualified.'}`,
        {modal:true});
      return;
    }
    // One Core-owned Workspace inventory and reference-closure receipt,
    // not a host-asserted 'complete' boolean or a duplicate graph engine.
    const inspection=await core.inspectPortableScopedMoveWorkspace({
      workspaceRoot:selected.root, workspaceId:selected.workspaceId,
      operation:{kind:'scoped-move',workspaceId:selected.workspaceId,selectedPath:oldPath,
        scope:scope.selectionScope,targetPath,targetDirectory:path.posix.dirname(targetPath),
        placement:placement.placement,parentPolicy}
    });
    if(inspection.status!=='ready') {
      await vscode.window.showWarningMessage(`Tiinex Move/Rebase blocked:\n${findings(inspection)}`,{modal:true});
      return;
    }
    const plan=inspection.plan;
    if(!await confirmPreview(plan,`${scope.label} · ${placement.label} · ${parentPolicy}`))return;
    await applied(core,plan,selected);
    return;
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
export async function relocateOrdinaryFileForForm(extensionPath: string, workspace: QualifiedLocalWorkspace, resource: vscode.Uri, targetDirectory: string, coreOverride?: CoreLineage, label = 'Attach to Form'): Promise<string | undefined> {
  const oldPath = safeWithin(workspace.root, resource.fsPath);
  if (!topicsDirectory(targetDirectory) || oldPath.endsWith('.trace.md')) throw new Error('Ordinary file relocation requires a .topics target and non-artifact source.');
  const coordinate = await vscode.window.showInputBox({ title: `${label} · exact target lineage`, prompt: 'Enter the qualified numeric dimension for the intended artifact (e.g. 001-1-1). The artifact has not been created, so Tiinex will not guess it.', placeHolder: '001-1-1', validateInput: (value) => /^(?:0*[1-9]\d*)(?:-0*[1-9]\d*)*$/.test(value) ? undefined : 'Enter a positive numeric lineage dimension.' });
  if (!coordinate) return undefined;
  const core = coreOverride || await boundCore(extensionPath);
  const plan = await core.inspectPortableAssetRelocationWorkspace({ workspaceRoot: workspace.root, workspaceId: workspace.workspaceId, assetPaths: [oldPath], targetDirectory, lineageDimension: coordinate });
  if (!await confirmPreview(plan, `${label} · file relocation`)) return undefined;
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
  // The author has already explicitly selected "move when this artifact is
  // created" for each file, then clicked Create. Opening a Markdown plan tab
  // and asking for consent again adds no authority. Core still validates the
  // exact plan, guards scope and checks for drift on Apply; genuine Move/Rebase
  // operations retain their explicit preview and confirmation.
  if (plan?.status !== 'ready' || !plan?.executable) {
    await vscode.window.showWarningMessage(`Tiinex combined Create blocked by Core:\n${findings(plan)}`, { modal: true });
    return false;
  }
  const core = await boundCore(extensionPath);
  const result = await core.applyPortableLineageMaintenancePlan(plan, { workspaceRoots: { [workspace.workspaceId]: workspace.root } });
  if (result.status !== 'ready') {
    await vscode.window.showWarningMessage(`Tiinex combined Create blocked: ${findings(result)}${result.transaction?.recoveryRequired ? '\nKeep the Tiinex transaction journal for recovery.' : ''}`, { modal: true });
    throw new Error(`tiinex.authoring.deferred-attachment-apply-blocked:${(result.findings || []).map((f:any)=>f.code).join(',')}`);
  }
  return true;
}
