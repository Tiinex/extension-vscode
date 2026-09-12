import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDiscoverySessionEvent, isHandoffPackagePath, waitForStableProbe } from '../dist/core/stableFile.js';
import { workspaceCarrierArgs } from '../dist/core/packageArgs.js';
import { exactRouteByKey, exactWorkspaceIds, routeChoiceKey } from '../dist/core/operatorModel.js';
import { presentOperatorError } from '../dist/core/operatorError.js';
import { LatestWinsKeyedQueue } from '../dist/core/latestWinsQueue.js';
import { canonicalRepositoryRoot, relativeRepositoryPath, repositoryContainsPath, sameRepositoryRoot } from '../dist/core/repositoryPath.js';
import { ignoredPathCollisions, safeRelativePath, safeTarget } from '../dist/core/paths.js';
import { preferredRepositoryParent, routesPreferredForRole } from '../dist/core/receiveUx.js';
import { alphabeticalWorkspaceIds, artifactsForLineageMode, currentRoleArtifacts, currentRoleChoices, makeIndexedArtifact } from '../dist/core/artifactTree.js';
import { artifactReferenceAvailable, markdownLinkTargets, materialTargetKey, resolveArtifactReference } from '../dist/core/artifactNavigation.js';
import { receivedHandoffContext, withWorkspaceRoots } from '../dist/core/receivedHandoff.js';
import { operatorMatchedWorkspaceIds, resolvePrioritizedWorkspaceDuplicates } from '../dist/core/sourceSelection.js';
import { comparePackageRecency, inheritedOutgoingLabel } from '../dist/core/outgoingUx.js';
import { projectArtifactAuthoringModel } from '../dist/core/artifactAuthoringModel.js';
import { artifactCreationReady, requireArtifactCreationReady } from '../dist/core/artifactAuthoringQualification.js';
import { mergeTransportRouteSelection, selectedTransportRouteIds, transportPrepared, transportPreparedKey } from '../dist/core/transportQueue.js';
import { gitAutomationBlockerText, gitOperatorResultMarkdown, normalizePostStagePolicy, projectGitOperatorCandidates } from '../dist/core/gitOperator.js';
import { planWorkspaceSession, validateWorkspaceTargetMapping } from '../dist/core/workspaceSession.js';
import { representativeWorkspaceChoicesForRoot } from '../dist/core/workspaceChoice.js';
import { checkIgnoredPaths, commitPreparedGitOperator, commitPreparedReviewedStaged, commitWorkingTree, deriveGitOperatorCommitMessage, dirtyWorkingTreePaths, discardWorkingTree, generateTiinexCommitMessage, listStagedPaths, mergeCommitNoCommit, payloadCheckoutEligibility, preflightExistingLocalBranch, prepareGitOperatorCommit, prepareReviewedStagedCommit, pushExactGitOperatorCommit, pushExactLandingCommit, pushExactReviewedStagedCommit, stageCommitPush, stageLandingChanges, stageLandingCommit, stashWorkingTree } from '../dist/host/git.js';
import { preferredNodeExecutable } from '../dist/host/nodeExecutable.js';
import { copyFileToClipboard } from '../dist/host/fileClipboard.js';
import { compareIncomingWorkspaceToLocal, createArtifactDraft, inspectArtifactCreationContract, parseBootstrapDescriptor, prepareBundledRuntime, projectArtifactMaterialization, projectArtifactSchemaGuide, runTiinexJson, projectEditorAssistanceText, projectHandoffEndpoints, projectOperatorContext, projectPackageTransport, projectStagedValidation, projectWorkspaceLanding, projectWorkspacePackageSources } from '../dist/tiinex/bootstrap.js';

const HERE = path.dirname(fileURLToPath(import.meta.url));
let count = 0;
async function test(name, fn) {
  await fn();
  count += 1;
  console.log(`✓ ${name}`);
}
async function rejectsCode(fn, code) {
  await assert.rejects(fn, (error) => String(error?.message || error).includes(code));
}


await test('artifact navigation resolves relative, qualified and external links without guessing', async () => {
  const handoffPath = '.topics/refactor/orchestration/001-3-6-4-1-1-anchor-to-kodax.trace.md';
  const taskPath = '.topics/refactor/orchestration/001-3-6-4-1-task.trace.md';
  const local = resolveArtifactReference('extension-vscode', handoffPath, '001-3-6-4-1-task.trace.md#objective');
  assert.deepEqual(local, { kind: 'relative', raw: '001-3-6-4-1-task.trace.md#objective', workspaceId: 'extension-vscode', path: taskPath, fragment: 'objective' });
  const cross = resolveArtifactReference('extension-vscode', taskPath, 'business::.topics/initiatives/root.trace.md');
  assert.equal(cross.kind, 'workspace');
  assert.equal(cross.workspaceId, 'business');
  assert.equal(cross.path, '.topics/initiatives/root.trace.md');
  const carrierRelative = resolveArtifactReference('@carrier', 'routes/001-pointer.trace.md', '../001-workspace.workspace.md');
  assert.deepEqual(carrierRelative, { kind: 'relative', raw: '../001-workspace.workspace.md', workspaceId: '@carrier', path: '001-workspace.workspace.md', fragment: '' });
  const http = resolveArtifactReference('extension-vscode', taskPath, 'https://github.com/Tiinex/docs/blob/abc/file.md');
  assert.equal(http.kind, 'external');
  assert.equal(http.external, 'https://github.com/Tiinex/docs/blob/abc/file.md');
  assert.equal(resolveArtifactReference('extension-vscode', taskPath, 'command:workbench.action.closeActiveEditor').kind, 'invalid');
  assert.equal(resolveArtifactReference('extension-vscode', '.topics/x.trace.md', '../../../../outside.md').kind, 'invalid');
  const available = new Set([
    materialTargetKey('extension-vscode', taskPath),
    materialTargetKey('business', '.topics/initiatives/root.trace.md'),
    materialTargetKey('@carrier', '001-workspace.workspace.md')
  ]);
  assert.equal(artifactReferenceAvailable(local, available), true);
  assert.equal(artifactReferenceAvailable(cross, available), true);
  assert.equal(artifactReferenceAvailable(carrierRelative, available), true);
  assert.equal(artifactReferenceAvailable(resolveArtifactReference('extension-vscode', taskPath, 'missing.trace.md'), available), false);
});

await test('artifact navigation integration is source-backed instead of ephemeral-preview-backed', async () => {
  const fs = await import('node:fs/promises');
  const root = path.resolve(HERE, '..');
  const tree = await fs.readFile(path.join(root, 'src', 'operatorTrees.ts'), 'utf8');
  assert.match(tree, /const MATERIAL_SCHEME = 'tiinex-material'/);
  assert.match(tree, /readExactZipEntryFromBuffer\(source\.outer/);
  assert.match(tree, /availableTargets/);
  assert.match(tree, /vscode\.Uri\.file\(absolute\)/);
  assert.match(tree, /registerDocumentLinkProvider\(\{ scheme: 'file', language: 'markdown' \}/);
  assert.match(tree, /loadLocalWorkspaceChoices\(this\.extensionPath\)/);
  const openArtifact = tree.slice(tree.indexOf('private async openArtifactNode'), tree.indexOf('private async openWorkspaceMarkdownNode'));
  assert.match(openArtifact, /openLocalMarkdown/);
  assert.match(openArtifact, /openCarrierMarkdown/);
  assert.doesNotMatch(openArtifact, /openVirtualMarkdown/);
  const materialProvider = tree.slice(tree.indexOf('class MaterialProvider'), tree.indexOf('export class TiinexOperatorTrees'));
  assert.doesNotMatch(materialProvider, /Preview content is no longer available/);
});

await test('artifact navigation extracts inline Markdown targets but ignores fenced examples and images', async () => {
  const markdown = '# Handoff\n[Parent](../parent.trace.md) and [Business](business::.topics/root.trace.md)\n![image](ignore.png)\n```md\n[Example](ignore.trace.md)\n```\n';
  assert.deepEqual(markdownLinkTargets(markdown).map((item) => item.target), ['../parent.trace.md', 'business::.topics/root.trace.md']);
});

await test('Windows multi-root comparison treats equivalent Git API and git.exe roots as the same repository', async () => {
  const apiRoot = 'C:\\Users\\micro\\Documents\\Repos\\Tiinex\\business';
  const gitRoot = 'c:/Users/micro/Documents/Repos/Tiinex/business/';
  assert.equal(sameRepositoryRoot(apiRoot, gitRoot, 'win32'), true);
  assert.equal(canonicalRepositoryRoot(apiRoot, 'win32'), 'c:/users/micro/documents/repos/tiinex/business');
  assert.equal(repositoryContainsPath(apiRoot, 'C:/Users/micro/Documents/Repos/Tiinex/business/.topics/x.trace.md', 'win32'), true);
  assert.equal(relativeRepositoryPath(apiRoot, 'C:/Users/micro/Documents/Repos/Tiinex/business/.topics/x.trace.md', 'win32'), '.topics/x.trace.md');
  assert.equal(repositoryContainsPath(apiRoot, 'C:/Users/micro/Documents/Repos/Tiinex/site/x', 'win32'), false);
});

await test('Incoming repository session stays single-root for one repo and opens multi-root only for multiple repo targets', async () => {
  assert.equal(planWorkspaceSession(['/repos/a'], ['/repos/a']).transition, 'none');
  assert.equal(planWorkspaceSession(['/repos/a'], ['/repos/a', '/repos/a']).distinctTargetRootCount, 1);
  assert.equal(planWorkspaceSession(['/repos/a'], ['/repos/b']).transition, 'single-root-unavailable');
  const multi = planWorkspaceSession(['/repos/a'], ['/repos/a', '/repos/b']);
  assert.equal(multi.transition, 'dedicated-multi-root');
  assert.deepEqual(multi.missingRoots, [path.resolve('/repos/b')]);
  assert.equal(planWorkspaceSession(['/repos/a', '/repos/b'], ['/repos/a', '/repos/b']).transition, 'none');
});

await test('Incoming mutation roots fail closed when full Workspace snapshots alias or overlap', async () => {
  assert.equal(validateWorkspaceTargetMapping([
    { workspaceId: 'a', root: '/repos/a' },
    { workspaceId: 'b', root: '/repos/b' }
  ]).status, 'ready');
  const aliased = validateWorkspaceTargetMapping([
    { workspaceId: 'a', root: '/repos/shared' },
    { workspaceId: 'b', root: '/repos/shared' }
  ]);
  assert.equal(aliased.status, 'blocked');
  assert.deepEqual(aliased.duplicateRoots[0].workspaceIds, ['a', 'b']);
  const nested = validateWorkspaceTargetMapping([
    { workspaceId: 'parent', root: '/repos/project' },
    { workspaceId: 'child', root: '/repos/project/vendor/child' }
  ]);
  assert.equal(nested.status, 'blocked');
  assert.equal(nested.overlappingRoots.length, 1);
});

await test('VS Code main-host tooling avoids Code.exe for portable Node tooling unless explicitly overridden', async () => {
  assert.equal(preferredNodeExecutable('', 'C:\\Users\\Sigma\\AppData\\Local\\Programs\\Microsoft VS Code\\Code.exe', 'win32'), 'node.exe');
  assert.equal(preferredNodeExecutable('', 'C:\\Program Files\\nodejs\\node.exe', 'win32'), 'C:\\Program Files\\nodejs\\node.exe');
  assert.equal(preferredNodeExecutable('D:\\tools\\node.exe', 'C:\\VSCode\\Code.exe', 'win32'), 'D:\\tools\\node.exe');
  assert.equal(preferredNodeExecutable('', '/usr/bin/node', 'linux'), '/usr/bin/node');
});

await test('Receive UX chooses the most common repository parent and treats role text as presentation filtering only', async () => {
  const roots = [
    'C:\\Users\\Sigma\\Repos\\Tiinex\\business',
    'C:\\Users\\Sigma\\Repos\\Tiinex\\core',
    'C:\\Users\\Sigma\\Repos\\Tiinex\\docs',
    'D:\\scratch\\other'
  ];
  assert.equal(preferredRepositoryParent(roots, 'win32'), 'C:\\Users\\Sigma\\Repos\\Tiinex');
  const routes = [
    { id: 'a', from: 'Anchor', to: 'Sigma' },
    { id: 'b', from: 'Anchor', to: 'Loom' }
  ];
  assert.deepEqual(routesPreferredForRole(routes, 'sigma').map((item) => item.id), ['a']);
  assert.deepEqual(routesPreferredForRole(routes, 'nobody').map((item) => item.id), ['a', 'b']);
  assert.deepEqual(routesPreferredForRole(routes, '').map((item) => item.id), ['a', 'b']);
});

await test('Incoming operator defaults allow multiple matching Workspaces and Outgoing duplicate selection uses top-source priority', async () => {
  const matches = operatorMatchedWorkspaceIds([
    { workspaceId: 'business', from: 'Anchor', to: 'Sigma' },
    { workspaceId: 'vscode', from: 'Sigma', to: 'Anchor' },
    { workspaceId: 'core', from: 'Anchor', to: 'Loom' },
    { workspaceId: 'vscode', from: 'Other', to: 'Sigma' }
  ], 'sigma');
  assert.deepEqual(matches.sort(), ['business', 'vscode']);
  assert.deepEqual(operatorMatchedWorkspaceIds([{ workspaceId: 'vscode', from: 'Sigma', to: 'Anchor' }], 'Sigma'), []);
  assert.deepEqual(operatorMatchedWorkspaceIds([{ workspaceId: 'docs', from: 'Anchor', to: 'Loom' }], 'Sigma'), []);
  const resolution = resolvePrioritizedWorkspaceDuplicates(
    ['incoming-old:docs', 'incoming-new:docs', 'local:docs', 'incoming-new:core'],
    [
      { key: 'local:docs', workspaceId: 'docs', priority: 0 },
      { key: 'incoming-new:docs', workspaceId: 'docs', priority: 1 },
      { key: 'incoming-new:core', workspaceId: 'core', priority: 2 },
      { key: 'incoming-old:docs', workspaceId: 'docs', priority: 3 }
    ]
  );
  assert.deepEqual(resolution.selectedKeys.sort(), ['incoming-new:core', 'local:docs']);
  assert.deepEqual(resolution.deselectedKeys.sort(), ['incoming-new:docs', 'incoming-old:docs']);
  assert.deepEqual(resolution.duplicateWorkspaceIds, ['docs']);
});

await test('Outgoing source UX inherits Incoming carrier identity and shares Discovery time ordering', async () => {
  assert.equal(inheritedOutgoingLabel('business-001-1-2-anchor-to-anchor.handoff-package.zip', '001-1-2', 2), 'business-001-1-2-2');
  assert.equal(inheritedOutgoingLabel('001-3-anchor-to-anchor.handoff-package.zip', '001-3'), '001-3-1');
  const items = [
    { filename: 'older.handoff-package.zip', mtimeMs: 10 },
    { filename: 'newer-b.handoff-package.zip', mtimeMs: 20 },
    { filename: 'newer-a.handoff-package.zip', mtimeMs: 20 }
  ].sort(comparePackageRecency);
  assert.deepEqual(items.map((item) => item.filename), ['newer-a.handoff-package.zip', 'newer-b.handoff-package.zip', 'older.handoff-package.zip']);
});

await test('Outgoing workspace picker chooses one representative qualified Workspace per open VS Code root', async () => {
  const interop = representativeWorkspaceChoicesForRoot('/repos/interop-native', [
    { workspaceId: 'interop-native', workspaceTargetPath: '.topics/.workspaces/tiinex-interop-native.workspace.md' },
    { workspaceId: 'interop', workspaceTargetPath: '.topics/.workspaces/tiinex-interop.workspace.md' }
  ]);
  assert.deepEqual(interop.map((item) => item.workspaceId), ['interop-native']);

  const vscodeRoot = representativeWorkspaceChoicesForRoot('/repos/extension-vscode', [
    { workspaceId: 'extension-vscode', workspaceTargetPath: '.topics/.workspaces/tiinex-extension-vscode.workspace.md' },
    { workspaceId: 'vscode', workspaceTargetPath: '.topics/.workspaces/tiinex-vscode.workspace.md' }
  ]);
  assert.deepEqual(vscodeRoot.map((item) => item.workspaceId), ['extension-vscode']);

  const unchanged = representativeWorkspaceChoicesForRoot('/repos/single', [
    { workspaceId: 'single', workspaceTargetPath: '.topics/.workspaces/tiinex-single.workspace.md' }
  ]);
  assert.deepEqual(unchanged.map((item) => item.workspaceId), ['single']);
});

await test('package route identity is separate from Workspace inclusion and contains no authoring Parent state', async () => {
  const routes = [
    { pointerless: true, label: 'none' },
    { pointerless: false, workspaceId: 'site', path: '.topics/child.trace.md', label: 'child' }
  ];
  const pointerless = routeChoiceKey(routes[0]);
  const handoff = routeChoiceKey(routes[1]);
  assert.equal(pointerless, 'workspace-carrier:none');
  assert.equal(handoff, 'handoff:site:.topics/child.trace.md');
  assert.equal(exactRouteByKey(routes, handoff).label, 'child');
  const selected = exactWorkspaceIds([{ workspaceId: 'vscode' }, { workspaceId: 'site' }], ['vscode', 'site', 'site']);
  assert.deepEqual(selected.map((item) => item.workspaceId), ['site', 'vscode']);
  assert.throws(() => exactWorkspaceIds([{ workspaceId: 'site' }], ['business']), /workspace-selection-unresolved/);
});

await test('extension contributes stable Discovery, Incoming, Outgoing and Transport TreeView actions', async () => {
  const fs = await import('node:fs/promises');
  const manifest = JSON.parse(await fs.readFile(path.resolve(HERE, '..', 'package.json'), 'utf8'));
  const container = manifest.contributes?.viewsContainers?.activitybar?.find((item) => item.id === 'tiinex');
  assert.equal(container?.title, 'Tiinex');
  assert.equal(container?.icon, 'media/tiinex.svg');
  const views = manifest.contributes?.views?.tiinex || [];
  assert.deepEqual(views.map((item) => item.id), ['tiinex.discovery', 'tiinex.incoming', 'tiinex.outgoing', 'tiinex.transport']);
  assert.equal(views.some((item) => item.type === 'webview'), false);
  const commands = new Map((manifest.contributes?.commands || []).map((item) => [item.command, item]));
  assert.equal(commands.get('tiinex.discovery.setIncoming')?.icon, '$(arrow-down)');
  assert.equal(commands.get('tiinex.outgoing.new')?.icon, '$(add)');
  assert.equal(commands.get('tiinex.outgoing.selectWorkspaces')?.icon, '$(list-selection)');
  assert.equal(commands.get('tiinex.outgoing.package')?.title, 'Pack');
  assert.equal(commands.get('tiinex.outgoing.package')?.icon, '$(package)');
  assert.equal(commands.get('tiinex.discovery.clear')?.title, 'Tiinex: Clear Discovery');
  assert.equal(commands.get('tiinex.discovery.clear')?.icon, '$(clear-all)');
  assert.equal(commands.get('tiinex.incoming.merge')?.title, 'Merge');
  assert.equal(commands.get('tiinex.incoming.merge')?.icon, '$(git-merge)');
  assert.equal(commands.get('tiinex.incoming.replace')?.title, 'Replace');
  assert.equal(commands.get('tiinex.incoming.replace')?.icon, '$(replace-all)');
  assert.equal(commands.get('tiinex.discovery.displayOptions')?.icon, '$(settings)');
  assert.equal(commands.get('tiinex.incoming.displayOptions')?.icon, '$(settings)');
  assert.equal(commands.get('tiinex.outgoing.displayOptions')?.icon, '$(settings)');
  assert.equal(commands.get('tiinex.outgoing.copyTransportText')?.icon, '$(copy)');
  assert.equal(commands.get('tiinex.transport.refresh')?.icon, '$(refresh)');
  assert.equal(commands.get('tiinex.transport.send')?.title, 'Send to Transport');
  assert.equal(commands.get('tiinex.transport.copyPackage')?.title, 'Copy Package');
  assert.equal(commands.get('tiinex.transport.copyText')?.title, 'Copy Transport Text');
  assert.equal(commands.get('tiinex.transport.close')?.title, 'Close');
  assert.equal(manifest.contributes?.configuration?.properties?.['tiinex.discovery.autoClearDiscovery']?.enum?.join(','), 'no,yes');
  const titleMenus = manifest.contributes?.menus?.['view/title'] || [];
  const titleCommands = new Set(titleMenus.map((item) => item.command));
  for (const command of ['tiinex.discovery.displayOptions', 'tiinex.discovery.selectFolder', 'tiinex.discovery.clear', 'tiinex.discovery.refresh', 'tiinex.incoming.displayOptions', 'tiinex.incoming.refresh', 'tiinex.outgoing.new', 'tiinex.outgoing.selectWorkspaces', 'tiinex.outgoing.displayOptions', 'tiinex.outgoing.selectFolder', 'tiinex.outgoing.refresh', 'tiinex.transport.refresh']) assert.equal(titleCommands.has(command), true);
  for (const legacy of ['tiinex.discovery.toggleProjection', 'tiinex.discovery.toggleLineage', 'tiinex.discovery.toggleDelta', 'tiinex.incoming.toggleProjection', 'tiinex.incoming.toggleLineage', 'tiinex.incoming.toggleDelta', 'tiinex.outgoing.toggleProjection', 'tiinex.outgoing.toggleLineage']) assert.equal(titleCommands.has(legacy), false);
  assert.equal(titleCommands.has('tiinex.outgoing.package'), false);
  assert.equal(titleCommands.has('tiinex.incoming.mergeSelected'), false);
  assert.equal(titleCommands.has('tiinex.outgoing.newBlank'), false);
  assert.equal(titleCommands.has('tiinex.outgoing.newFromIncoming'), false);
  const groupOrder = (command) => Number(String(titleMenus.find((item) => item.command === command)?.group || '').split('@')[1]);
  assert.ok(groupOrder('tiinex.discovery.displayOptions') < groupOrder('tiinex.discovery.selectFolder'));
  assert.ok(groupOrder('tiinex.discovery.selectFolder') < groupOrder('tiinex.discovery.refresh'));
  assert.ok(groupOrder('tiinex.discovery.selectFolder') < groupOrder('tiinex.discovery.clear'));
  assert.ok(groupOrder('tiinex.discovery.clear') < groupOrder('tiinex.discovery.refresh'));
  assert.ok(groupOrder('tiinex.outgoing.new') < groupOrder('tiinex.outgoing.selectWorkspaces'));
  assert.ok(groupOrder('tiinex.outgoing.selectWorkspaces') < groupOrder('tiinex.outgoing.displayOptions'));
  assert.ok(groupOrder('tiinex.outgoing.displayOptions') < groupOrder('tiinex.outgoing.selectFolder'));
  assert.ok(groupOrder('tiinex.outgoing.selectFolder') < groupOrder('tiinex.outgoing.refresh'));
  const itemMenus = manifest.contributes?.menus?.['view/item/context'] || [];
  assert.ok(itemMenus.some((item) => item.command === 'tiinex.discovery.setIncoming' && /discoveryPackage/.test(item.when || '')));
  const incomingMergeMenu = itemMenus.find((item) => item.command === 'tiinex.incoming.merge');
  const incomingReplaceMenu = itemMenus.find((item) => item.command === 'tiinex.incoming.replace');
  for (const contextValue of ['tiinex.incomingPackage', 'tiinex.incomingWorkspace', 'tiinex.incomingWorkspaceArchive']) {
    assert.match(incomingMergeMenu?.when || '', new RegExp(contextValue));
    assert.match(incomingReplaceMenu?.when || '', new RegExp(contextValue));
  }
  assert.equal(incomingMergeMenu?.group, 'inline@1');
  assert.equal(incomingReplaceMenu?.group, 'inline@2');
  for (const exactContext of ['tiinex.incomingWorkspaceExact', 'tiinex.incomingWorkspaceArchiveExact']) {
    assert.doesNotMatch(incomingMergeMenu?.when || '', new RegExp(exactContext));
    assert.doesNotMatch(incomingReplaceMenu?.when || '', new RegExp(exactContext));
  }
  const incomingCloseMenu = itemMenus.find((item) => item.command === 'tiinex.incoming.close');
  assert.match(incomingCloseMenu?.when || '', /tiinex\.incomingPackage/);
  assert.match(incomingCloseMenu?.when || '', /tiinex\.incomingPackageLoading/);
  assert.equal(incomingCloseMenu?.group, 'inline@9');
  assert.ok(itemMenus.some((item) => item.command === 'tiinex.outgoing.package' && /outgoingRoot/.test(item.when || '') && !/canPackage/.test(item.when || '') && item.group === 'inline@1'));
  assert.ok(itemMenus.some((item) => item.command === 'tiinex.outgoing.close' && /outgoingRoot/.test(item.when || '')));
  assert.ok(itemMenus.some((item) => item.command === 'tiinex.outgoing.newHandoff' && /outgoingWorkspace/.test(item.when || '') && /outgoingWorkspaceArchive/.test(item.when || '') && item.group === 'inline@1'));
  assert.ok(itemMenus.some((item) => item.command === 'tiinex.outgoing.attachHandoff' && /outgoingHandoffUnattached/.test(item.when || '')));
  assert.ok(itemMenus.some((item) => item.command === 'tiinex.outgoing.detachHandoff' && /outgoingHandoffAttached/.test(item.when || '')));
  assert.ok(itemMenus.some((item) => item.command === 'tiinex.outgoing.copyTransportText' && /outgoingHandoffAttached/.test(item.when || '') && item.group === 'inline@1'));
  assert.ok(itemMenus.some((item) => item.command === 'tiinex.outgoing.omitWorkspacePayload' && /outgoingWorkspaceDescriptorEmbedded/.test(item.when || '')));
  assert.ok(itemMenus.some((item) => item.command === 'tiinex.outgoing.embedWorkspacePayload' && /outgoingWorkspaceDescriptorCheckout/.test(item.when || '')));
  assert.ok(itemMenus.some((item) => item.command === 'tiinex.transport.send' && /discoveryPackage/.test(item.when || '')));
  assert.ok(itemMenus.some((item) => item.command === 'tiinex.transport.send' && /incomingPackage/.test(item.when || '')));
  assert.ok(itemMenus.some((item) => item.command === 'tiinex.transport.send' && /discoveryResolvedHandoff/.test(item.when || '')));
  assert.ok(itemMenus.some((item) => item.command === 'tiinex.transport.send' && /incomingResolvedHandoff/.test(item.when || '')));
  assert.ok(itemMenus.some((item) => item.command === 'tiinex.transport.copyPackage' && /transportPackage/.test(item.when || '') && item.group === 'inline@1'));
  assert.ok(itemMenus.some((item) => item.command === 'tiinex.transport.copyText' && /transportPackage/.test(item.when || '') && item.group === 'inline@2'));
  assert.ok(itemMenus.some((item) => item.command === 'tiinex.transport.close' && /transportPackage/.test(item.when || '') && item.group === 'inline@9'));
  assert.ok(itemMenus.some((item) => item.command === 'tiinex.transport.copyPackage' && /transportRoute/.test(item.when || '')));
  assert.ok(itemMenus.some((item) => item.command === 'tiinex.transport.copyText' && /transportRoute/.test(item.when || '')));
  const explorerMenus = manifest.contributes?.menus?.['explorer/context'] || [];
  assert.ok(explorerMenus.some((item) => item.submenu === 'tiinex.explorer.actions' && item.group === '1_tiinex@1'));
  assert.ok((manifest.contributes?.submenus || []).some((item) => item.id === 'tiinex.explorer.actions' && item.label === 'Tiinex'));
  const tiinexExplorerMenus = manifest.contributes?.menus?.['tiinex.explorer.actions'] || [];
  assert.ok(tiinexExplorerMenus.some((item) => item.command === 'tiinex.artifact.newHandoff' && /explorerResourceIsFolder/.test(item.when || '')));
  assert.ok(tiinexExplorerMenus.some((item) => item.command === 'tiinex.artifact.attachHandoff' && item.when === '!explorerResourceIsFolder && resourceExtname == .md'));
  assert.equal(commands.get('tiinex.artifact.attachHandoff')?.title, 'Attach Handoff to Outgoing');
  assert.equal(commands.get('tiinex.artifact.attachHandoff')?.icon, '$(link)');
  const treeSource = await fs.readFile(path.resolve(HERE, '..', 'src', 'operatorTrees.ts'), 'utf8');
  assert.match(treeSource, /label: '\$\(add\) Blank'/);
  assert.doesNotMatch(treeSource, /actionNode\('incoming'[\s\S]*Review Merge Plan/);
  assert.doesNotMatch(treeSource, /actionNode\('incoming'[\s\S]*Review Replace Plan/);
  assert.doesNotMatch(treeSource, /actionNode\('outgoing'[\s\S]*Pack…/);
  assert.doesNotMatch(treeSource, /actionNode\('outgoing'[\s\S]*New Handoff…/);
  assert.match(treeSource, /revealOutgoingPanel/);
  assert.match(treeSource, /workbench\.view\.extension\.tiinex/);
  assert.match(treeSource, /filter\(\(workspace\) => !state\.appliedWorkspaceIds\.has\(workspace\.workspaceId\)\)/);
  assert.match(treeSource, /No Outgoing carrier is open\. Create one and continue attaching this Handoff\?/);
  assert.match(treeSource, /packageParentPath = await this\.pickOutgoingParent\(\)/);
  assert.match(treeSource, /this\.sortIncomingByDiscoveryOrder\(\)/);
  assert.match(treeSource, /showDisplayOptions\('incoming'\)/);
  assert.match(treeSource, /canPickMany: true/);
  assert.match(treeSource, /tiinex\.incomingWorkspaceExact/);
  assert.match(treeSource, /qualified match/);
  assert.match(treeSource, /queueTransportPackage\(built\.outputPath, '', true\)/);
  assert.match(treeSource, /projectPackageTransport\(runtime, resolved/);
  assert.match(treeSource, /tiinex\.transport\.queue\.v1/);
  assert.match(treeSource, /tiinex\.transport\.prepared\.v1/);
  assert.doesNotMatch(treeSource, /Cold start: read Start directly/);
  assert.doesNotMatch(treeSource, /chooseOutgoingCarrierParent/);
  assert.equal(Boolean(manifest.contributes?.problemMatchers), false);
  const extensionSource = await fs.readFile(path.resolve(HERE, '..', 'src', 'extension.ts'), 'utf8');
  assert.match(extensionSource, /trees\.beginHandoffAuthoring\(\)/);
  assert.doesNotMatch(extensionSource, /Use the \+ action on an Outgoing Workspace/);
  assert.equal(Boolean(manifest.contributes?.taskDefinitions), false);
});

await test('Discovery settings are non-mutating and default build chains install -> link -> build', async () => {
  const fs = await import('node:fs/promises');
  const root = path.resolve(HERE, '..');
  const manifest = JSON.parse(await fs.readFile(path.join(root, 'package.json'), 'utf8'));
  const properties = manifest.contributes.configuration.properties;
  assert.equal(properties['tiinex.operator.role'].type, 'string');
  assert.equal(properties['tiinex.discovery.folder'].default, '');
  assert.equal(properties['tiinex.discovery.autoRefresh'].default, false);
  assert.equal(properties['tiinex.discovery.latestToIncoming'].default, false);
  assert.equal(properties['tiinex.incoming.autoShowRoleHandoff'].default, 'ask');
  assert.deepEqual(properties['tiinex.incoming.autoShowRoleHandoff'].enum, ['no', 'ask', 'yes']);
  assert.match(properties['tiinex.incoming.autoShowRoleHandoff'].description, /one or more qualified Handoff routes/);
  assert.equal(properties['tiinex.landing.stage'].default, 'yes');
  assert.deepEqual(properties['tiinex.landing.stage'].enum, ['no', 'yes']);
  assert.equal(Object.hasOwn(properties, 'tiinex.handoffInbox.path'), false);
  assert.equal(Object.hasOwn(properties, 'tiinex.handoff.discovery'), false);
  assert.equal(Object.hasOwn(properties, 'tiinex.landing.openHandoff'), false);
  assert.match(manifest.scripts['dev:link'], /ensure-windows-main-host-dev-extension-link\.ps1/);
  assert.match(manifest.scripts['dev:build'], /npm run build/);
  assert.match(manifest.scripts['dev:unlink'], /ensure-windows-main-host-dev-extension-link\.ps1 -Unlink/);
  assert.equal(manifest.scripts['dev:setup'], 'npm run dev:link');
  const tasks = JSON.parse(await fs.readFile(path.join(root, '.vscode', 'tasks.json'), 'utf8'));
  for (const item of tasks.tasks) {
    if (item.type === 'npm') assert.ok(typeof item.script === 'string' && Object.hasOwn(manifest.scripts, item.script), `VS Code task ${item.label} references missing npm script ${item.script}`);
    if (item.command === 'powershell') {
      const fileIndex = item.args?.indexOf('-File') ?? -1;
      if (fileIndex >= 0) await fs.stat(path.join(root, item.args[fileIndex + 1]));
    }
  }
  const install = tasks.tasks.find((item) => item.label === 'Tiinex: npm install');
  const link = tasks.tasks.find((item) => item.label === 'Tiinex: Link this checkout');
  const build = tasks.tasks.find((item) => item.label === 'Tiinex: Build linked extension');
  assert.equal(install.command, 'npm install');
  assert.deepEqual(link.dependsOn, ['Tiinex: npm install']);
  assert.equal(link.dependsOrder, 'sequence');
  assert.deepEqual(build.dependsOn, ['Tiinex: Link this checkout']);
  assert.equal(build.dependsOrder, 'sequence');
  assert.equal(build.group?.isDefault, true);
  assert.ok(tasks.tasks.some((item) => item.label === 'Tiinex: Unlink this checkout' && item.args?.includes('-Unlink')));
  const linker = await fs.readFile(path.join(root, 'scripts', 'ensure-windows-main-host-dev-extension-link.ps1'), 'utf8');
  assert.match(linker, /targetId = 'tiinex\.tiinex-vscode'/);
  assert.match(linker, /extensionsJsonPath/);
  assert.match(linker, /New-Item -ItemType Junction/);
  assert.match(linker, /\.vscode\\link/);
  assert.match(linker, /\[AllowEmptyCollection\(\)\]\[object\[\]\]\$PreviousEntries/);
  assert.match(linker, /\[AllowEmptyCollection\(\)\]\[object\[\]\]\$Entries/);
  const gitignore = await fs.readFile(path.join(root, '.gitignore'), 'utf8');
  assert.match(gitignore, /^\.vscode\/link\/$/m);
});

await test('Receive orchestration keeps Workspace mutation explicit and makes unasserted branch state visible', async () => {
  const fs = await import('node:fs/promises');
  const source = await fs.readFile(path.resolve(HERE, '..', 'src', 'landing.ts'), 'utf8');
  const gitSource = await fs.readFile(path.resolve(HERE, '..', 'src', 'host', 'git.ts'), 'utf8');
  const gitApi = await fs.readFile(path.resolve(HERE, '..', 'src', 'vscode', 'gitApi.ts'), 'utf8');
  for (const text of ['Add Repository', 'Skip Workspace', 'Switch Branch', 'Stash', 'Commit', 'Discard', 'Copy Commit Message', 'Use Current Branch', 'Declared Ref: (none)']) assert.match(source, new RegExp(text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  assert.match(source, /preferredRepositoryParent/);
  assert.match(source, /projectWorkspaceLanding\(runtime, packagePath, candidateFacts, candidateSelections, \[workspaceId\]\)/);
  assert.match(source, /stageLandingChanges\(root, protectedPaths\)/);
  assert.match(source, /function stagePolicy\(\): StagePolicy/);
  assert.match(source, /function postStagePolicy\(\): string/);
  const postLandingStart = source.indexOf('async function postLandingGit');
  const stageDisabledGate = source.indexOf("if (stagePolicy() === 'no')", postLandingStart);
  const stageLandingCall = source.indexOf('stageLandingChanges(root, protectedPaths)', postLandingStart);
  assert.ok(stageDisabledGate >= 0 && stageLandingCall > stageDisabledGate);
  assert.match(source, /Post-landing policy: stage=\$\{stagePolicy\(\)\}, postStage=\$\{postStagePolicy\(\)\}/);
  assert.match(source, /tiinex\.git\.observePostStage/);
  assert.match(source, /Use Tiinex Commit from Source Control/);
  assert.match(source, /Select every Workspace Tiinex may replace/);
  assert.match(source, /canPickMany: true/);
  assert.match(source, /trustedLandingCommitMessage/);
  assert.doesNotMatch(source, /generateTiinexCommitMessage/);
  assert.doesNotMatch(source, /policy\('commit'\)|policy\('push'\)|pushable = \[\.\.\.commits\.entries/);
  assert.doesNotMatch(source, /requiredWorkspaceIds\.every/);
  const landingCommitBlock = gitSource.slice(gitSource.indexOf('export async function stageLandingCommit'), gitSource.indexOf('export async function pushExactLandingCommit'));
  assert.doesNotMatch(landingCommitBlock, /generateTiinexCommitMessage|tiinex-commit-message|nodeExecutable/);
  assert.match(source, /routesPreferredForRole/);
  assert.doesNotMatch(source, /openReceivedHandoffs|landing\.openHandoff/);
  assert.doesNotMatch(source, /openTextDocument\([^\n]*pointerPath/);
  assert.match(gitApi, /workspace\.updateWorkspaceFolders/);
  assert.match(gitApi, /workspace\.workspaceFile/);
});

await test('received carrier context stays qualified when only a subset of carried Workspaces is landed locally', async () => {
  const orientation = {
    workspaces: [{ id: 'business' }, { id: 'core' }, { id: 'extension-vscode' }],
    routes: [{
      id: 'route-1', state: 'qualified', workspaceId: 'extension-vscode',
      workspaceRelativeHandoffPath: '.topics/handoff.trace.md', pointerPath: '001-pointer.trace.md', from: 'Anchor', to: 'Sigma',
      requiredClosure: { state: 'qualified', requiredCount: 2, qualifiedCount: 2, requirements: [
        { state: 'qualified', resolution: { workspaceId: 'business' } },
        { state: 'qualified', resolution: { workspaceId: 'extension-vscode' } }
      ] }
    }]
  };
  const grounding = {
    status: 'ready', readiness: { state: 'grounded-to-act' },
    authority: { route: { id: 'route-1', pointerPath: '001-pointer.trace.md', workspaceId: 'extension-vscode' } },
    currentWork: { frontier: [{ id: 'extension-vscode/.topics/task.trace.md', path: 'extension-vscode/.topics/task.trace.md', title: 'Task' }] }
  };
  const received = receivedHandoffContext('/carrier.zip', orientation, grounding, 'route-1');
  const partial = withWorkspaceRoots(received, { 'extension-vscode': '/repos/vscode' });
  assert.deepEqual(partial.carriedWorkspaceIds, ['business', 'core', 'extension-vscode']);
  assert.deepEqual(partial.requiredWorkspaceIds, ['business', 'extension-vscode']);
  assert.deepEqual(partial.workspaceRoots, { 'extension-vscode': path.resolve('/repos/vscode') });
});

await test('native tree operator keeps projection choices separate from canonical item actions', async () => {
  const fs = await import('node:fs/promises');
  const source = await fs.readFile(path.resolve(HERE, '..', 'src', 'operatorTrees.ts'), 'utf8');
  assert.match(source, /TreeProjectionMode/);
  assert.match(source, /TreeLineageMode/);
  assert.match(source, /showDisplayOptions\('discovery'\)/);
  assert.match(source, /showDisplayOptions\('incoming'\)/);
  assert.match(source, /showDisplayOptions\('outgoing'\)/);
  assert.match(source, /contextValue = applied \? 'tiinex\.incomingWorkspaceApplied' : exact \? 'tiinex\.incomingWorkspaceExact' : 'tiinex\.incomingWorkspace'/);
  assert.match(source, /tiinex\.incomingWorkspaceArchiveApplied/);
  assert.match(source, /tiinex\.incomingWorkspaceArchiveExact/);
  assert.match(source, /contextValue = 'tiinex\.outgoingWorkspace'/);
  assert.match(source, /logicalWorkspaceRootChildren/);
  assert.match(source, /fileArtifactRoots/);
  assert.match(source, /workspaceState\.get<TreeProjectionMode>\(`tiinex\.tree\.\$\{section\}\.projection`, 'files'\)/);
  assert.match(source, /workspaceState\.get<TreeLineageMode>\(`tiinex\.tree\.\$\{section\}\.lineage`, 'lineage'\)/);
  assert.match(source, /this\.discoveryView\.description = this\.modeLabel\('discovery'\)/);
  assert.match(source, /this\.incomingView\.description = this\.modeLabel\('incoming'\)/);
  assert.match(source, /this\.outgoingView\.description = this\.modeLabel\('outgoing'\)/);
  assert.doesNotMatch(source, /WebviewViewProvider|registerWebviewViewProvider/);
  const extension = await fs.readFile(path.resolve(HERE, '..', 'src', 'extension.ts'), 'utf8');
  assert.match(extension, /new TiinexOperatorTrees/);
  assert.doesNotMatch(extension, /HandoffInboxWatcher|TiinexOperatorView|registerWebviewViewProvider/);
  for (const retired of ['src/operatorView.ts', 'src/inbox.ts', 'src/core/operatorWebview.ts']) {
    await assert.rejects(() => fs.stat(path.resolve(HERE, '..', retired)), { code: 'ENOENT' });
  }
  const manifest = JSON.parse(await fs.readFile(path.resolve(HERE, '..', 'package.json'), 'utf8'));
  const titles = new Map(manifest.contributes.commands.map((item) => [item.command, item.title]));
  assert.equal(titles.get('tiinex.openOperator'), 'Tiinex: Open Operator');
  assert.equal(titles.get('tiinex.landHandoffPackage'), 'Tiinex: Open Handoff Package as Incoming');
  assert.equal(titles.get('tiinex.buildHandoffPackage'), 'Tiinex: Package Outgoing');
  const hiddenPalette = new Set((manifest.contributes.menus.commandPalette || []).filter((item) => item.when === 'false').map((item) => item.command));
  for (const command of ['tiinex.discovery.setIncoming', 'tiinex.incoming.mergeReplace', 'tiinex.incoming.close', 'tiinex.outgoing.close', 'tiinex.outgoing.newHandoff', 'tiinex.outgoing.previewDraft', 'tiinex.outgoing.writeDraft', 'tiinex.outgoing.includeRoute', 'tiinex.outgoing.excludeRoute']) assert.equal(hiddenPalette.has(command), true);
  const contributedCommands = new Set(manifest.contributes.commands.map((item) => item.command));
  assert.equal(contributedCommands.has('tiinex.incoming.mergeWorkspace'), false);
  assert.equal(contributedCommands.has('tiinex.outgoing.new'), true);
  assert.equal(contributedCommands.has('tiinex.incoming.mergeReplace'), true);
  assert.equal(contributedCommands.has('tiinex.outgoing.selectWorkspaces'), true);
});

await test('operator README and deterministic GIF runbook describe the stabilized Major 001 surfaces', async () => {
  const fs = await import('node:fs/promises');
  const root = path.resolve(HERE, '..');
  const readme = await fs.readFile(path.join(root, 'README.md'), 'utf8');
  const capture = await fs.readFile(path.join(root, 'docs', 'GIF-CAPTURE.md'), 'utf8');
  const manifest = JSON.parse(await fs.readFile(path.join(root, 'package.json'), 'utf8'));
  const lock = JSON.parse(await fs.readFile(path.join(root, 'package-lock.json'), 'utf8'));
  assert.match(readme, /one \*\*Display Options\*\* control/);
  assert.match(readme, /green \*\*qualified match\*\*/);
  assert.match(readme, /docs\/GIF-CAPTURE\.md/);
  assert.match(readme, /"@tiinex\/core": "\^0\.7\.0"/);
  if (process.env.TIINEX_LOCAL_CORE_ACCEPTANCE === '1') {
    assert.match(manifest.dependencies['@tiinex/core'], /^file:/);
    assert.equal(lock.packages[''].dependencies['@tiinex/core'], manifest.dependencies['@tiinex/core']);
    assert.equal(lock.packages['node_modules/@tiinex/core'].link === true, false);
    const installedCore = JSON.parse(await fs.readFile(path.join(root, 'node_modules', '@tiinex', 'core', 'package.json'), 'utf8'));
    assert.equal(lock.packages['node_modules/@tiinex/core'].version, installedCore.version);
  } else {
    assert.equal(manifest.dependencies['@tiinex/core'], '^0.7.0');
    assert.equal(lock.packages['node_modules/@tiinex/core'].version, '0.7.0');
  }
  for (const section of ['Clip 1 — Display Options', 'Clip 2 — Incoming exact qualified match', 'Clip 3 — Outgoing Handoff and Pack safety', 'Clip 4 — Staging and commit-message ergonomics']) assert.match(capture, new RegExp(section));
  assert.match(capture, /does not replace the required Sigma Windows observation/);
  assert.match(capture, /exact current Tiinex primary-logo bytes/);
});

await test('Discovery indexes explicit folders and auto-refresh never invokes landing', async () => {
  const fs = await import('node:fs/promises');
  const tree = await fs.readFile(path.resolve(HERE, '..', 'src', 'operatorTrees.ts'), 'utf8');
  const index = await fs.readFile(path.resolve(HERE, '..', 'src', 'carrierIndex.ts'), 'utf8');
  assert.match(tree, /You need to select a discovery folder/);
  assert.match(tree, /Select Tiinex discovery folder/);
  assert.match(tree, /discovery\.autoRefresh/);
  assert.match(tree, /discovery\.latestToIncoming/);
  assert.match(tree, /refreshDiscovery\(false, false\)/);
  assert.match(tree, /watch\(folder/);
  assert.match(tree, /discoveryIdentity/);
  assert.match(tree, /current\.mtimeMs === existing\.mtimeMs && current\.size === existing\.bytes/);
  assert.match(index, /\.handoff-package\.zip/);
  assert.doesNotMatch(tree, /Downloads[\\/]Tiinex Inbox/);
  const refreshStart = tree.indexOf('private async refreshDiscovery');
  const refreshEnd = tree.indexOf('private async discoveryChildren', refreshStart);
  assert.doesNotMatch(tree.slice(refreshStart, refreshEnd), /landHandoffPackage/);
  const discoveryStart = tree.indexOf('private async discoveryChildren');
  const incomingStart = tree.indexOf('private async setIncoming', discoveryStart);
  assert.doesNotMatch(tree.slice(discoveryStart, incomingStart), /landHandoffPackage/);
  assert.equal(isDiscoverySessionEvent(1000, 1000), true);
  assert.equal(isDiscoverySessionEvent(999, 1000), false);
});

await test('artifact-tree helpers keep latest Roles, lineage leaves and alphabetical Workspace siblings deterministic', async () => {
  const roleOld = makeIndexedArtifact({ workspaceId: 'business', path: '.topics/roles/001.trace.md', markdown: '# Continuity Context\n\n- Current\n  - Current Schema: tiinex.party.role.v1\n  - Created At: 2026-01-01 00:00:00\n\n---\n\n# Sigma old\n\n- Role Label: Sigma\n' });
  const roleNew = makeIndexedArtifact({ workspaceId: 'business', path: '.topics/roles/001-1.trace.md', markdown: '# Continuity Context\n\n- Parent\n  - Trace: [001.trace.md](001.trace.md)\n- Current\n  - Current Schema: tiinex.party.role.v1\n  - Created At: 2026-02-01 00:00:00\n\n---\n\n# Sigma current\n\n- Role Label: Sigma\n' });
  assert.ok(roleOld && roleNew);
  const roles = currentRoleArtifacts([roleOld, roleNew]);
  assert.equal(roles.length, 1);
  assert.equal(roles[0].path, '.topics/roles/001-1.trace.md');
  assert.deepEqual(artifactsForLineageMode([roleOld, roleNew], 'lineage').map((item) => item.path), ['.topics/roles/001.trace.md', '.topics/roles/001-1.trace.md']);
  assert.deepEqual(artifactsForLineageMode([roleOld, roleNew], 'leaves').map((item) => item.path), ['.topics/roles/001-1.trace.md']);
  const cached = makeIndexedArtifact({ path: '001-endpoint-role.trace.md', markdown: '# Continuity Context\n\n- Current\n  - Current Schema: tiinex.pointer.v1\n  - Created At: 2026-03-01 00:00:00\n\n---\n\n# Endpoint Role Pointer — Sigma\n\n## Current Read\n\n- Carrier Role: endpoint-role\n- Role Label Hint: Sigma\n- Role Reference: `business::.topics/roles/001.trace.md`\n- Target Workspace Id: `business`\n- Target Inner Path: `.topics/roles/001.trace.md`\n' });
  const cacheOnly = makeIndexedArtifact({ path: '001-other-endpoint-role.trace.md', markdown: '# Continuity Context\n\n- Current\n  - Current Schema: tiinex.pointer.v1\n  - Created At: 2026-03-01 00:00:00\n\n---\n\n# Endpoint Role Pointer — Reviewer\n\n## Current Read\n\n- Carrier Role: endpoint-role\n- Role Label Hint: Reviewer\n- Role Reference: `business::.topics/roles/009-reviewer.trace.md`\n- Target Workspace Id: `business`\n- Target Inner Path: `.topics/roles/009-reviewer.trace.md`\n' });
  assert.ok(cached && cacheOnly);
  const choices = currentRoleChoices([roleOld, roleNew, cached, cacheOnly]);
  assert.deepEqual(choices.map((item) => [item.label, item.reference, item.source]), [
    ['Reviewer', 'business::.topics/roles/009-reviewer.trace.md', 'carrier-cache'],
    ['Sigma', 'business::.topics/roles/001-1.trace.md', 'artifact']
  ]);
  const sorted = alphabeticalWorkspaceIds([{ workspaceId: 'vscode' }, { workspaceId: 'Business' }, { workspaceId: 'core' }]);
  assert.deepEqual(sorted.map((item) => item.workspaceId), ['Business', 'core', 'vscode']);
});


await test('generic authoring exposes only Core-executable ordinary fields and reports schema-only optional gaps', async () => {
  const contract = {
    status: 'ready',
    target: { schemaId: 'tiinex.example.v1', label: 'Example' },
    transitionType: 'create-artifact',
    creation: {
      inputBindings: [
        { input: 'Required', kind: 'ordinary-field', section: 'Parties', field: 'Required', requirement: 'required' },
        { input: 'Group', kind: 'ordinary-group', section: 'Group', requiredFields: ['A'], optionalFields: ['B'] }
      ]
    }
  };
  const guide = {
    schemaId: 'tiinex.example.v1',
    factoryDescriptor: { sections: [
      { group: 'Parties', requiredFields: ['Required'], optionalFields: ['Optional Schema Field'], fieldConstraints: [] },
      { group: 'Group', requiredFields: ['A'], optionalFields: ['B'], fieldConstraints: [] }
    ] }
  };
  const model = projectArtifactAuthoringModel({ contract }, { guide });
  assert.deepEqual(model.sections.find((section) => section.key === 'Parties')?.fields.map((field) => field.key), ['Required']);
  assert.deepEqual(model.sections.find((section) => section.key === 'Group')?.fields.map((field) => field.key), ['A', 'B']);
  assert.deepEqual(model.capabilityGaps, [{ section: 'Parties', fields: ['Optional Schema Field'], reason: 'schema-optional-fields-not-bound-for-creation' }]);
});


await test('generic authoring trusts shared Core draft status/severity and preserves exact finding details', async () => {
  const omission = {
    status: 'blocked',
    draft: null,
    findings: [{ severity: 'error', code: 'schema.reference.exact-target-omitted', message: 'Envelope Schema must use the qualified immutable target.' }],
    findingSummary: { counts: { error: 1 } }
  };
  assert.equal(artifactCreationReady(omission), false);
  assert.throws(() => requireArtifactCreationReady(omission), /schema\.reference\.exact-target-omitted:[^\n]*qualified immutable target/);

  const contradiction = {
    status: 'created-invalid',
    draft: { markdown: '# candidate' },
    findings: [{ severity: 'error', code: 'schema.reference.material-identity-contradiction', message: 'Resolved material belongs to another schema.' }],
    findingSummary: { counts: { error: 1 } }
  };
  assert.equal(artifactCreationReady(contradiction), false);
  assert.throws(() => requireArtifactCreationReady(contradiction), /schema\.reference\.material-identity-contradiction:[^\n]*another schema/);

  const warningOnly = {
    status: 'created-degraded',
    draft: { markdown: '# preserved candidate' },
    findings: [{ severity: 'warning', code: 'schema.reference.historical-reference-debt', message: 'Preserve existing bytes.' }],
    findingSummary: { counts: { error: 0 } }
  };
  assert.equal(artifactCreationReady(warningOnly), true);
  assert.doesNotThrow(() => requireArtifactCreationReady(warningOnly));

  const fs = await import('node:fs/promises');
  const hostGate = await fs.readFile(path.resolve(HERE, '..', 'src', 'core', 'artifactAuthoringQualification.ts'), 'utf8');
  assert.doesNotMatch(hostGate, /schema\.reference\.(?:exact-target-omitted|material-identity-contradiction)/);
  assert.doesNotMatch(hostGate, /markdown-link|plain-schema-id/);
});

await test('create-local-draft wrapper returns shared Core blocking findings unchanged for host presentation', async () => {
  const runtime = { root: '/runtime', entrypoint: '/runtime/tiinex-portable.mjs', nodeExecutable: 'node', dispose: async () => undefined };
  const fx = fakeRunner((key) => {
    if (key.includes('create-local-draft')) return {
      code: 2,
      stdout: JSON.stringify({
        status: 'blocked',
        draft: null,
        findings: [{ severity: 'error', code: 'schema.reference.exact-target-omitted', message: 'Current Schema exact target is required.' }],
        findingSummary: { counts: { error: 1 } }
      }),
      stderr: ''
    };
    return undefined;
  });
  const result = await createArtifactDraft(runtime, 'tiinex.task.v1', '/repo', '.topics/task.trace.md', 'Task proof', { Summary: 'proof' }, null, 'create-artifact', fx.runner);
  assert.equal(result.status, 'blocked');
  assert.equal(result.findings[0].code, 'schema.reference.exact-target-omitted');
  assert.equal(result.findings[0].message, 'Current Schema exact target is required.');
  assert.throws(() => requireArtifactCreationReady(result), /ERROR schema\.reference\.exact-target-omitted: Current Schema exact target is required\./);
});

await test('Git Operator candidates come only from Core-qualified Workspace context and coalesce aliases by repository root', async () => {
  const candidates = projectGitOperatorCandidates([
    { workspaceId: 'vscode', localRepository: { root: '/repos/extension-vscode' } },
    { workspaceId: 'extension-vscode', hostRoot: '/repos/extension-vscode/' },
    { workspaceId: 'site', localRepository: { root: '/repos/site' } },
    { workspaceId: 'unmatched', localRepository: { root: '/repos/not-open' } }
  ], [
    { root: '/repos/extension-vscode', repository: 'origin-vscode', branch: 'main', clean: false },
    { root: '/repos/site', repository: 'origin-site', branch: 'refactor', clean: false },
    { root: '/repos/unqualified-open-repo', repository: 'origin-other', branch: 'main', clean: false }
  ]);
  assert.deepEqual(candidates.map((item) => ({ root: item.root, ids: item.workspaceIds })), [
    { root: '/repos/extension-vscode', ids: ['extension-vscode', 'vscode'] },
    { root: '/repos/site', ids: ['site'] }
  ]);
});

await test('Git Operator result report preserves exact per-repository partial outcomes', async () => {
  const report = gitOperatorResultMarkdown([
    { id: 'a', label: 'extension-vscode', root: '/repos/a', branch: 'main', upstream: 'origin/main', state: 'pushed', commitSha: 'a'.repeat(40), message: 'Tiinex: A' },
    { id: 'b', label: 'site', root: '/repos/b', branch: 'main', upstream: 'origin/main', state: 'push-failed', commitSha: 'b'.repeat(40), detail: 'tiinex.git.push-head-changed' },
    { id: 'c', label: 'core', root: '/repos/c', branch: 'main', upstream: '', state: 'blocked', detail: 'tiinex.git.missing-upstream' }
  ]);
  assert.match(report, /Pushed: 1 · Committed locally: 0 · Blocked\/failed: 2 · Skipped: 0/);
  assert.match(report, /## extension-vscode[\s\S]*Result: PUSHED/);
  assert.match(report, /## site[\s\S]*Result: PUSH FAILED[\s\S]*push-head-changed/);
  assert.match(report, /## core[\s\S]*Result: BLOCKED[\s\S]*missing-upstream/);
});

await test('post-stage Git policy is singular, SCM-first, debounced and keeps legacy commands fallback-only', async () => {
  const fs = await import('node:fs/promises');
  const root = path.resolve(HERE, '..');
  const manifest = JSON.parse(await fs.readFile(path.join(root, 'package.json'), 'utf8'));
  const automation = await fs.readFile(path.join(root, 'src', 'gitAutomation.ts'), 'utf8');
  const extension = await fs.readFile(path.join(root, 'src', 'extension.ts'), 'utf8');
  const gitApi = await fs.readFile(path.join(root, 'src', 'vscode', 'gitApi.ts'), 'utf8');
  const properties = manifest.contributes?.configuration?.properties || {};
  assert.equal(properties['tiinex.landing.commit'], undefined);
  assert.equal(properties['tiinex.landing.push'], undefined);
  assert.deepEqual(properties['tiinex.git.postStagePolicy']?.enum, ['do-nothing', 'commit', 'commit-push']);
  assert.equal(properties['tiinex.git.postStagePolicy']?.default, 'do-nothing');
  const scm = manifest.contributes?.menus?.['scm/sourceControl'] || [];
  assert.ok(scm.some((item) => item.command === 'tiinex.git.commitRepository' && item.when === 'scmProvider == git'));
  const palette = manifest.contributes?.menus?.commandPalette || [];
  assert.ok(palette.some((item) => item.command === 'tiinex.stageCommitPush' && item.when === 'false'));
  assert.ok(palette.some((item) => item.command === 'tiinex.generateCommitMessage' && item.when === 'false'));
  assert.match(extension, /registerCommand\('tiinex\.git\.commitRepository'/);
  assert.match(extension, /registerGitAutomation\(context, extensionPath\)/);
  assert.match(automation, /const DEBOUNCE_MS = 750/);
  assert.match(automation, /watchGitRepositoryStates/);
  assert.match(automation, /stageAll:\s*false/);
  assert.match(automation, /requireNoUnstaged:\s*true/);
  assert.match(automation, /requireQualifiedTiinex:\s*true/);
  assert.match(automation, /requirePushSafety:\s*policy === 'commit-push'/);
  assert.match(automation, /auto-committed[\s\S]*locally[\s\S]*but did not push it/);
  assert.match(automation, /requireQualifiedTiinex:\s*false/);
  for (const label of ['Use existing staged changes', 'Stage All changes', 'Leave staged', 'Commit + Push']) assert.match(automation, new RegExp(label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  assert.match(gitApi, /scmContextRepositoryRoot/);
  assert.match(gitApi, /repository\.state\.onDidChange/);
  assert.equal(normalizePostStagePolicy('commit'), 'commit');
  assert.equal(normalizePostStagePolicy('commit-push'), 'commit-push');
  assert.equal(normalizePostStagePolicy('anything-else'), 'do-nothing');
  assert.match(gitAutomationBlockerText(new Error('tiinex.git.no-qualified-tiinex-artifact')), /source-only staging/);
  assert.match(gitAutomationBlockerText(new Error('tiinex.git.unstaged-remainder:src\/a.ts')), /unstaged changes remain/);
});

await test('reviewed staged preparation rejects conflicts before explicit Stage All', async () => {
  const fx = fakeRunner((key) => {
    if (key === 'git diff --name-only --diff-filter=U -z') return { code: 0, stdout: 'conflicted.ts\0', stderr: '' };
    return { code: 0, stdout: '', stderr: '' };
  });
  await rejectsCode(() => prepareReviewedStagedCommit('/repo', 'node', {
    stageAll: true, requireNoUnstaged: false, requireQualifiedTiinex: false, requirePushSafety: false
  }, undefined, fx.runner), 'tiinex.git.unresolved-conflicts:conflicted.ts');
  assert.equal(fx.calls.some((call) => call.command === 'git' && call.args[0] === 'add'), false);
});

await test('automatic reviewed staging refuses source-only closure and never commits it', async () => {
  const sha = 'a'.repeat(40);
  const fx = fakeRunner((key) => {
    if (key === 'git diff --name-only --diff-filter=U -z') return { code: 0, stdout: '', stderr: '' };
    if (key === 'git symbolic-ref --quiet --short HEAD') return { code: 0, stdout: 'main\n', stderr: '' };
    if (key === 'git rev-parse --abbrev-ref --symbolic-full-name @{u}') return { code: 0, stdout: 'origin/main\n', stderr: '' };
    if (key === 'git rev-parse HEAD') return { code: 0, stdout: sha + '\n', stderr: '' };
    if (key === 'git diff --cached --name-only -z') return { code: 0, stdout: 'src/a.ts\0', stderr: '' };
    if (key === 'git diff --name-only -z' || key === 'git ls-files --others --exclude-standard -z') return { code: 0, stdout: '', stderr: '' };
    if (key.startsWith('git rev-list --count ')) return { code: 0, stdout: '0\n', stderr: '' };
    if (key === 'git status --porcelain=v1 -z --untracked-files=all') return { code: 0, stdout: 'M  src/a.ts\0', stderr: '' };
    if (key === 'git diff --cached --raw -z --no-renames') return { code: 0, stdout: 'raw\0', stderr: '' };
    return { code: 0, stdout: '', stderr: '' };
  });
  await rejectsCode(() => prepareReviewedStagedCommit('/repo', 'node', {
    stageAll: false, requireNoUnstaged: true, requireQualifiedTiinex: true, requirePushSafety: false
  }, async () => ({ state: 'ready', stagedTiinexPaths: [], ignoredStagedPaths: [] }), fx.runner), 'tiinex.git.no-qualified-tiinex-artifact');
  assert.equal(fx.calls.some((call) => call.command === 'git' && call.args[0] === 'commit'), false);
  assert.equal(fx.calls.some((call) => call.command === 'git' && call.args[0] === 'push'), false);
});

await test('automatic reviewed staging fails closed while relevant unstaged changes remain', async () => {
  const sha = 'a'.repeat(40);
  const fx = fakeRunner((key) => {
    if (key === 'git diff --name-only --diff-filter=U -z') return { code: 0, stdout: '', stderr: '' };
    if (key === 'git symbolic-ref --quiet --short HEAD') return { code: 0, stdout: 'main\n', stderr: '' };
    if (key === 'git rev-parse --abbrev-ref --symbolic-full-name @{u}') return { code: 0, stdout: 'origin/main\n', stderr: '' };
    if (key === 'git rev-parse HEAD') return { code: 0, stdout: sha + '\n', stderr: '' };
    if (key === 'git diff --cached --name-only -z') return { code: 0, stdout: '.topics/a.trace.md\0', stderr: '' };
    if (key === 'git diff --name-only -z') return { code: 0, stdout: 'src/pending.ts\0', stderr: '' };
    if (key === 'git ls-files --others --exclude-standard -z') return { code: 0, stdout: '', stderr: '' };
    return { code: 0, stdout: '', stderr: '' };
  });
  await rejectsCode(() => prepareReviewedStagedCommit('/repo', 'node', {
    stageAll: false, requireNoUnstaged: true, requireQualifiedTiinex: true, requirePushSafety: false
  }, async () => ({ state: 'ready', stagedTiinexPaths: ['.topics/a.trace.md'], ignoredStagedPaths: [] }), fx.runner), 'tiinex.git.unstaged-remainder:src/pending.ts');
  assert.equal(fx.calls.some((call) => call.args[0] === 'commit'), false);
});

await test('reviewed staged preparation re-verifies exact working fingerprint after validation and message derivation', async () => {
  const fs = await import('node:fs/promises');
  const os = await import('node:os');
  const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'tiinex-reviewed-drift-'));
  const sha = 'a'.repeat(40);
  let statusReads = 0;
  const fx = fakeRunner((key) => {
    if (key === 'git diff --name-only --diff-filter=U -z') return { code: 0, stdout: '', stderr: '' };
    if (key === 'git symbolic-ref --quiet --short HEAD') return { code: 0, stdout: 'main\n', stderr: '' };
    if (key === 'git rev-parse --abbrev-ref --symbolic-full-name @{u}') return { code: 0, stdout: 'origin/main\n', stderr: '' };
    if (key === 'git rev-parse HEAD') return { code: 0, stdout: sha + '\n', stderr: '' };
    if (key === 'git diff --cached --name-only -z') return { code: 0, stdout: '.topics/a.trace.md\0', stderr: '' };
    if (key.startsWith('git rev-list --count ')) return { code: 0, stdout: '0\n', stderr: '' };
    if (key === 'git status --porcelain=v1 -z --untracked-files=all') return { code: 0, stdout: (++statusReads === 1 ? 'M  .topics/a.trace.md\0' : 'MM .topics/a.trace.md\0'), stderr: '' };
    if (key === 'git diff --cached --raw -z --no-renames') return { code: 0, stdout: 'raw\0', stderr: '' };
    return { code: 0, stdout: '', stderr: '' };
  });
  try {
    await rejectsCode(() => prepareReviewedStagedCommit(tmp, 'node', {
      stageAll: false, requireNoUnstaged: false, requireQualifiedTiinex: true, requirePushSafety: false
    }, async () => ({ state: 'ready', stagedTiinexPaths: ['.topics/a.trace.md'], ignoredStagedPaths: [] }), fx.runner), 'tiinex.git.working-state-changed-during-preparation');
    assert.equal(fx.calls.some((call) => call.args[0] === 'commit'), false);
  } finally { await fs.rm(tmp, { recursive: true, force: true }); }
});

await test('explicit reviewed source-only flow can commit locally without an upstream but cannot imply push', async () => {
  const fs = await import('node:fs/promises');
  const os = await import('node:os');
  const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'tiinex-reviewed-manual-'));
  const pre = 'a'.repeat(40);
  const post = 'b'.repeat(40);
  let committed = false;
  const fx = fakeRunner((key) => {
    if (key === 'git diff --name-only --diff-filter=U -z') return { code: 0, stdout: '', stderr: '' };
    if (key === 'git symbolic-ref --quiet --short HEAD') return { code: 0, stdout: 'main\n', stderr: '' };
    if (key === 'git rev-parse --abbrev-ref --symbolic-full-name @{u}') return { code: 128, stdout: '', stderr: 'no upstream' };
    if (key === 'git rev-parse HEAD') return { code: 0, stdout: (committed ? post : pre) + '\n', stderr: '' };
    if (key === 'git diff --cached --name-only -z') return { code: 0, stdout: 'src/a.ts\0', stderr: '' };
    if (key === 'git status --porcelain=v1 -z --untracked-files=all') return { code: 0, stdout: 'M  src/a.ts\0', stderr: '' };
    if (key === 'git diff --cached --raw -z --no-renames') return { code: 0, stdout: 'raw-source\0', stderr: '' };
    if (key === 'git commit -m Tiinex: Update ' + path.basename(tmp)) { committed = true; return { code: 0, stdout: '', stderr: '' }; }
    return { code: 0, stdout: '', stderr: '' };
  });
  try {
    const prepared = await prepareReviewedStagedCommit(tmp, 'node', {
      stageAll: false, requireNoUnstaged: false, requireQualifiedTiinex: false, requirePushSafety: false
    }, async () => ({ state: 'ready', stagedTiinexPaths: [], ignoredStagedPaths: [] }), fx.runner);
    assert.equal(prepared.pushEligible, false);
    assert.equal(prepared.pushBlocker, 'tiinex.git.missing-upstream');
    assert.equal(prepared.message, `Tiinex: Update ${path.basename(tmp)}`);
    const commit = await commitPreparedReviewedStaged(tmp, prepared, prepared.message, fx.runner);
    assert.equal(commit.commitSha, post);
    await rejectsCode(() => pushExactReviewedStagedCommit(tmp, commit, fx.runner), 'tiinex.git.missing-upstream');
    assert.equal(fx.calls.some((call) => call.args[0] === 'push'), false);
  } finally { await fs.rm(tmp, { recursive: true, force: true }); }
});

await test('reviewed Commit + Push publishes only the exact same-operation commit', async () => {
  const fs = await import('node:fs/promises');
  const os = await import('node:os');
  const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'tiinex-reviewed-push-'));
  const pre = 'a'.repeat(40);
  const post = 'b'.repeat(40);
  let committed = false;
  let pushed = false;
  const fx = fakeRunner((key) => {
    if (key === 'git diff --name-only --diff-filter=U -z') return { code: 0, stdout: '', stderr: '' };
    if (key === 'git symbolic-ref --quiet --short HEAD') return { code: 0, stdout: 'main\n', stderr: '' };
    if (key === 'git rev-parse --abbrev-ref --symbolic-full-name @{u}') return { code: 0, stdout: 'origin/main\n', stderr: '' };
    if (key === 'git rev-parse HEAD') return { code: 0, stdout: (committed ? post : pre) + '\n', stderr: '' };
    if (key === 'git diff --cached --name-only -z') return { code: 0, stdout: '.topics/a.trace.md\0', stderr: '' };
    if (key === 'git rev-list --count @{u}..HEAD') return { code: 0, stdout: `${committed && !pushed ? 1 : 0}\n`, stderr: '' };
    if (key === 'git rev-list --count HEAD..@{u}') return { code: 0, stdout: '0\n', stderr: '' };
    if (key === 'git status --porcelain=v1 -z --untracked-files=all') return { code: 0, stdout: 'M  .topics/a.trace.md\0', stderr: '' };
    if (key === 'git diff --cached --raw -z --no-renames') return { code: 0, stdout: 'raw-tiinex\0', stderr: '' };
    if (key === 'git commit -m Tiinex: Update ' + path.basename(tmp)) { committed = true; return { code: 0, stdout: '', stderr: '' }; }
    if (key === 'git push') { pushed = true; return { code: 0, stdout: '', stderr: '' }; }
    return { code: 0, stdout: '', stderr: '' };
  });
  try {
    const prepared = await prepareReviewedStagedCommit(tmp, 'node', {
      stageAll: false, requireNoUnstaged: true, requireQualifiedTiinex: true, requirePushSafety: true
    }, async () => ({ state: 'ready', stagedTiinexPaths: ['.topics/a.trace.md'], ignoredStagedPaths: [] }), fx.runner);
    assert.equal(prepared.pushEligible, true);
    const commit = await commitPreparedReviewedStaged(tmp, prepared, prepared.message, fx.runner);
    await pushExactReviewedStagedCommit(tmp, commit, fx.runner);
    assert.equal(pushed, true);
    assert.equal(fx.calls.filter((call) => call.args[0] === 'push').length, 1);
  } finally { await fs.rm(tmp, { recursive: true, force: true }); }
});

await test('multi-repository Git command stays explicit, preserves the single-repo command, and requires one final exact-push confirmation', async () => {
  const fs = await import('node:fs/promises');
  const manifest = JSON.parse(await fs.readFile(path.resolve(HERE, '..', 'package.json'), 'utf8'));
  const extension = await fs.readFile(path.resolve(HERE, '..', 'src', 'extension.ts'), 'utf8');
  const command = await fs.readFile(path.resolve(HERE, '..', 'src', 'commit.ts'), 'utf8');
  const ids = new Set((manifest.contributes?.commands || []).map((item) => item.command));
  assert.equal(ids.has('tiinex.stageCommitPush'), true);
  assert.equal(ids.has('tiinex.stageCommitPushMany'), true);
  assert.equal(manifest.activationEvents.includes('onCommand:tiinex.stageCommitPushMany'), true);
  assert.match(extension, /registerCommand\('tiinex\.stageCommitPushMany'/);
  assert.match(command, /canPickMany:\s*true/);
  assert.match(command, /Push only the exact commits created by this Tiinex flow\?/);
  assert.match(command, /'Push Exact Commits'/);
  assert.match(command, /pushExactGitOperatorCommit/);
});

await test('Git Operator preparation rejects unrelated ahead state before staging', async () => {
  const fx = fakeRunner((key) => {
    if (key === 'git symbolic-ref --quiet --short HEAD') return { code: 0, stdout: 'main\n', stderr: '' };
    if (key === 'git rev-parse --abbrev-ref --symbolic-full-name @{u}') return { code: 0, stdout: 'origin/main\n', stderr: '' };
    if (key === 'git rev-list --count @{u}..HEAD') return { code: 0, stdout: '2\n', stderr: '' };
    if (key === 'git rev-list --count HEAD..@{u}') return { code: 0, stdout: '0\n', stderr: '' };
    return { code: 0, stdout: '', stderr: '' };
  });
  await rejectsCode(() => prepareGitOperatorCommit('/repo', 'node', undefined, fx.runner), 'tiinex.git.pre-operation-upstream-not-aligned:2:0');
  assert.equal(fx.calls.some((call) => call.command === 'git' && call.args[0] === 'add'), false);
});

await test('Git Operator preparation stages, validates, derives with the repository helper, and snapshots the reviewed state in order', async () => {
  const fs = await import('node:fs/promises');
  const os = await import('node:os');
  const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'tiinex-git-operator-prepare-'));
  await fs.mkdir(path.join(tmp, 'tools'), { recursive: true });
  const helper = path.join(tmp, 'tools', 'tiinex-commit-message.mjs');
  await fs.writeFile(helper, '// fixture');
  const sha = 'a'.repeat(40);
  const order = [];
  const fx = fakeRunner((key) => {
    if (key === 'git symbolic-ref --quiet --short HEAD') return { code: 0, stdout: 'main\n', stderr: '' };
    if (key === 'git rev-parse --abbrev-ref --symbolic-full-name @{u}') return { code: 0, stdout: 'origin/main\n', stderr: '' };
    if (key.startsWith('git rev-list --count ')) return { code: 0, stdout: '0\n', stderr: '' };
    if (key === 'git rev-parse HEAD') return { code: 0, stdout: sha + '\n', stderr: '' };
    if (key === 'git diff --cached --quiet') return { code: 1, stdout: '', stderr: '' };
    if (key === 'git diff --cached --name-only --diff-filter=ACMR -z') return { code: 0, stdout: '.topics/a.trace.md\0notes.txt\0', stderr: '' };
    if (key.startsWith('node ' + helper)) { order.push('helper'); return { code: 0, stdout: 'Tiinex: derived\n', stderr: '' }; }
    if (key === 'git status --porcelain=v1 -z --untracked-files=all') return { code: 0, stdout: 'M  .topics/a.trace.md\0M  notes.txt\0', stderr: '' };
    if (key === 'git diff --cached --raw -z --no-renames') return { code: 0, stdout: ':100644 100644 a b M\0.topics/a.trace.md\0', stderr: '' };
    return { code: 0, stdout: '', stderr: '' };
  });
  try {
    const prepared = await prepareGitOperatorCommit(tmp, 'node', async (paths) => {
      order.push('validate');
      assert.deepEqual(paths, ['.topics/a.trace.md', 'notes.txt']);
      return { state: 'ready', stagedTiinexPaths: ['.topics/a.trace.md'], ignoredStagedPaths: [] };
    }, fx.runner);
    const commands = fx.calls.map((call) => `${call.command} ${call.args.join(' ')}`);
    assert.equal(prepared.branch, 'main');
    assert.equal(prepared.upstream, 'origin/main');
    assert.equal(prepared.headBefore, sha);
    assert.equal(prepared.message, 'Tiinex: derived');
    assert.deepEqual(prepared.stagedTiinexPaths, ['.topics/a.trace.md']);
    assert.deepEqual(order, ['validate', 'helper']);
    assert.ok(commands.indexOf('git add -A') < commands.indexOf('git diff --cached --name-only --diff-filter=ACMR -z'));
    assert.ok(commands.indexOf('git diff --cached --name-only --diff-filter=ACMR -z') < commands.findIndex((item) => item.startsWith('node ')));
  } finally { await fs.rm(tmp, { recursive: true, force: true }); }
});

await test('Git Operator commit fails closed when working state changes after review', async () => {
  const prepared = {
    branch: 'main', upstream: 'origin/main', headBefore: 'a'.repeat(40), message: 'Tiinex: original', stagedPaths: ['a.txt'], stagedTiinexPaths: [], ignoredStagedPaths: [], validationState: 'ready', statusSnapshot: 'M  a.txt\0', stagedDiffSnapshot: 'raw-before'
  };
  const fx = fakeRunner((key) => {
    if (key === 'git symbolic-ref --quiet --short HEAD') return { code: 0, stdout: 'main\n', stderr: '' };
    if (key === 'git rev-parse --abbrev-ref --symbolic-full-name @{u}') return { code: 0, stdout: 'origin/main\n', stderr: '' };
    if (key === 'git rev-parse HEAD') return { code: 0, stdout: prepared.headBefore + '\n', stderr: '' };
    if (key.startsWith('git rev-list --count ')) return { code: 0, stdout: '0\n', stderr: '' };
    if (key === 'git status --porcelain=v1 -z --untracked-files=all') return { code: 0, stdout: 'MM a.txt\0', stderr: '' };
    return { code: 0, stdout: '', stderr: '' };
  });
  await rejectsCode(() => commitPreparedGitOperator('/repo', prepared, 'Tiinex: edited', fx.runner), 'tiinex.git.working-state-changed-after-review');
  assert.equal(fx.calls.some((call) => call.args[0] === 'commit'), false);
});

await test('Git Operator commit and push bind publication to exactly the reviewed commit', async () => {
  const pre = 'a'.repeat(40);
  const post = 'b'.repeat(40);
  let committed = false;
  let pushed = false;
  const prepared = {
    branch: 'main', upstream: 'origin/main', headBefore: pre, message: 'Tiinex: original', stagedPaths: ['a.txt'], stagedTiinexPaths: [], ignoredStagedPaths: [], validationState: 'ready', statusSnapshot: 'M  a.txt\0', stagedDiffSnapshot: 'raw-reviewed'
  };
  const fx = fakeRunner((key) => {
    if (key === 'git symbolic-ref --quiet --short HEAD') return { code: 0, stdout: 'main\n', stderr: '' };
    if (key === 'git rev-parse --abbrev-ref --symbolic-full-name @{u}') return { code: 0, stdout: 'origin/main\n', stderr: '' };
    if (key === 'git rev-parse HEAD') return { code: 0, stdout: (committed ? post : pre) + '\n', stderr: '' };
    if (key === 'git rev-list --count @{u}..HEAD') return { code: 0, stdout: `${committed && !pushed ? 1 : 0}\n`, stderr: '' };
    if (key === 'git rev-list --count HEAD..@{u}') return { code: 0, stdout: '0\n', stderr: '' };
    if (key === 'git status --porcelain=v1 -z --untracked-files=all') return { code: 0, stdout: prepared.statusSnapshot, stderr: '' };
    if (key === 'git diff --cached --raw -z --no-renames') return { code: 0, stdout: prepared.stagedDiffSnapshot, stderr: '' };
    if (key === 'git commit -m Tiinex: edited') { committed = true; return { code: 0, stdout: '', stderr: '' }; }
    if (key === 'git push') { pushed = true; return { code: 0, stdout: '', stderr: '' }; }
    return { code: 0, stdout: '', stderr: '' };
  });
  const commit = await commitPreparedGitOperator('/repo', prepared, 'Tiinex: edited', fx.runner);
  assert.equal(commit.commitSha, post);
  assert.equal(commit.message, 'Tiinex: edited');
  await pushExactGitOperatorCommit('/repo', commit, fx.runner);
  assert.equal(pushed, true);
  assert.equal(fx.calls.filter((call) => call.args[0] === 'push').length, 1);
});

await test('Git Operator exact push rejects a changed HEAD without pushing', async () => {
  const commit = { branch: 'main', upstream: 'origin/main', headBefore: 'a'.repeat(40), message: 'Tiinex: reviewed', commitSha: 'b'.repeat(40) };
  const fx = fakeRunner((key) => {
    if (key === 'git symbolic-ref --quiet --short HEAD') return { code: 0, stdout: 'main\n', stderr: '' };
    if (key === 'git rev-parse --abbrev-ref --symbolic-full-name @{u}') return { code: 0, stdout: 'origin/main\n', stderr: '' };
    if (key === 'git rev-parse HEAD') return { code: 0, stdout: 'c'.repeat(40) + '\n', stderr: '' };
    return { code: 0, stdout: '', stderr: '' };
  });
  await rejectsCode(() => pushExactGitOperatorCommit('/repo', commit, fx.runner), 'tiinex.git.push-head-changed');
  assert.equal(fx.calls.some((call) => call.args[0] === 'push'), false);
});

await test('generic Artifact Authoring renders Core contracts while Handoff host actions remain separate', async () => {
  const fs = await import('node:fs/promises');
  const authoring = await fs.readFile(path.resolve(HERE, '..', 'src', 'authoring.ts'), 'utf8');
  const model = await fs.readFile(path.resolve(HERE, '..', 'src', 'core', 'artifactAuthoringModel.ts'), 'utf8');
  const panel = await fs.readFile(path.resolve(HERE, '..', 'src', 'artifactAuthoringPanel.ts'), 'utf8');
  const tree = await fs.readFile(path.resolve(HERE, '..', 'src', 'operatorTrees.ts'), 'utf8');
  assert.match(authoring, /inspectArtifactCreationContract/);
  assert.match(authoring, /projectArtifactSchemaGuide/);
  assert.match(authoring, /projectArtifactAuthoringModel/);
  assert.match(authoring, /createArtifactDraft/);
  assert.match(authoring, /projectArtifactMaterialization/);
  assert.doesNotMatch(authoring, /createHandoffFromForm|prepareSimpleHandoffDraft|writePreparedSimpleHandoffDraft|projectHandoffAuthoringPlan|createHandoffDraft/);
  const bootstrap = await fs.readFile(path.resolve(HERE, '..', 'src', 'tiinex', 'bootstrap.ts'), 'utf8');
  assert.doesNotMatch(bootstrap, /projectHandoffAuthoringPlan|createHandoffDraft/);
  assert.doesNotMatch(authoring, /path-planner-capability-gap/);
  assert.match(model, /intentionally knows no artifact-specific field[\s\S]*semantics/);
  assert.doesNotMatch(model, /\bFrom\b|\bTo\b|Transfers|Required Context/);
  assert.match(panel, /Schema and validation are projected by Tiinex Core/);
  assert.match(panel, /Core authoring boundary/);
  assert.match(panel, /not currently bound by Core creation/);
  assert.match(panel, /applyAssist/);
  assert.match(panel, /assistCapabilityErrors/);
  assert.match(panel, /cannot be written by the current Core creation contract/);
  assert.doesNotMatch(panel, /Additional carrier Roles/);
  assert.match(panel, /Attach to Outgoing/);
  assert.match(panel, /Preview/);
  assert.match(panel, /repeatable-section/);
  assert.match(panel, /fieldAssists/);
  assert.match(tree, /beginArtifactAuthoring/);
  assert.match(tree, /loadArtifactAuthoringCatalog/);
  assert.match(tree, /pickArtifactSchema/);
  assert.match(tree, /pickArtifactParent/);
  assert.match(tree, /showArtifactAuthoring/);
  assert.match(tree, /loadArtifactAuthoringModel\(this\.extensionPath, schemaId, transition\)/);
  assert.match(tree, /schemaId === 'tiinex\.handoff\.v1' && options\.attachAvailable/);
  assert.match(tree, /qualifyExistingHandoff/);
  assert.doesNotMatch(tree, /handoffFieldAssists|handoffTemplates/);
  assert.match(tree, /openArtifactAuthoringPanel/);
  assert.match(tree, /ensureOutgoingAuthoringRoot/);
  assert.match(tree, /trackOutgoingHandoff/);
  assert.match(tree, /attachOutgoingHandoffNode/);
  assert.match(tree, /detachOutgoingHandoffNode/);
  assert.match(tree, /newHandoffFromExplorer/);
  assert.match(tree, /attachHandoffFromExplorer/);
  assert.match(tree, /decorateOutgoingWorkspaceFileNodes/);
  assert.match(tree, /Local Workspace source was not selected/);
  assert.match(tree, /routeId: routeChoiceKey\(\{ pointerless: true \}\)/);
  assert.doesNotMatch(tree, /This Outgoing continues an Incoming Handoff carrier, so Pack needs at least one attached Handoff route/);
  assert.match(tree, /refreshDiscoveryAfterPack/);
  assert.match(tree, /participantRoles: item\.participants/);
  assert.match(tree, /workspaceSourceOverrides/);
  assert.match(tree, /root: item\.stagedRoot \|\| item\.root/);
  assert.match(tree, /placeHolder: this\.outgoingProjectedFilename\(\)/);
  assert.match(tree, /const outputDirectory = this\.outgoingFolder\(\) \|\| await this\.selectOutgoingFolder\(this\.discoveryFolder\(\) \|\| undefined, false\)/);
  assert.match(tree, /defaultUri: defaultFolder \? vscode\.Uri\.file\(path\.resolve\(defaultFolder\)\) : undefined/);
  assert.match(tree, /outputDirectory,/);
  assert.match(tree, /ConfigurationTarget\.Global/);
  assert.match(tree, /Tiinex packing Workspace carrier/);
  assert.match(tree, /Tiinex packing Handoff carrier/);
  assert.match(tree, /this\.closeOutgoing\(\);/);
  assert.match(tree, /register\('tiinex\.outgoing\.selectFolder', \(\) => this\.selectOutgoingFolder\(this\.outgoingFolder\(\) \|\| this\.discoveryFolder\(\) \|\| undefined\)\)/);
  assert.match(tree, /private async selectOutgoingFolder\(defaultFolder\?: string, persist = true\): Promise<string>/);
  assert.match(tree, /if \(persist\) \{/);
  assert.match(tree, /await this\.selectOutgoingFolder\(this\.discoveryFolder\(\) \|\| undefined, false\)/);
  const workspaceClose = tree.indexOf('this.closeOutgoing();', tree.indexOf("Tiinex packing Workspace carrier"));
  const workspaceAnnounce = tree.indexOf("await announceBuiltCarrier(built.outputPath, 'Workspace carrier');");
  const handoffClose = tree.indexOf('this.closeOutgoing();', tree.indexOf("Tiinex packing Handoff carrier"));
  const handoffAnnounce = tree.indexOf("await announceBuiltCarrier(", tree.indexOf("Tiinex packing Handoff carrier"));
  assert.ok(workspaceClose >= 0 && workspaceAnnounce > workspaceClose);
  assert.ok(handoffClose >= 0 && handoffAnnounce > handoffClose);
  const previewCall = tree.indexOf('Tiinex preparing ${model.label} preview');
  const writeCall = tree.indexOf('writePreparedArtifactDraft(this.extensionPath, draft)');
  assert.ok(previewCall >= 0 && writeCall > previewCall);
  const packageBuilder = await fs.readFile(path.resolve(HERE, '..', 'src', 'packageBuilder.ts'), 'utf8');
  assert.match(packageBuilder, /PackageRouteInput/);
  assert.match(packageBuilder, /workspace-routes\.json/);
  assert.match(packageBuilder, /workspace-targets\.json/);
  assert.match(packageBuilder, /--workspace-targets/);
  assert.match(packageBuilder, /participantRoles/);
  assert.match(packageBuilder, /shouldExposeWorkspaceRoot/);
  assert.match(packageBuilder, /ignoredPathsWithoutRepository/);
  assert.match(packageBuilder, /workspaceSourceOverrides/);
  assert.match(packageBuilder, /Select Tiinex outgoing folder/);
  assert.match(packageBuilder, /showOpenDialog/);
  assert.match(packageBuilder, /workspaceFolders \|\| \[\]/);
  assert.match(packageBuilder, /revealInExplorer/);
  assert.match(packageBuilder, /revealFileInOS/);
  assert.match(packageBuilder, /routeRoutingTexts/);
  assert.match(packageBuilder, /routeTexts\.length === 1/);
  assert.match(tree, /qualifiedOutgoingWorkspaceSourceOverrides/);
  assert.doesNotMatch(packageBuilder, /Build qualified pointerless Workspace carrier\?|Build qualified Handoff carrier\?/);
  assert.match(tree, /copyOutgoingTransportText/);
  assert.match(tree, /Pack Outgoing first\. Exact transport text/);
  const manifest = JSON.parse(await fs.readFile(path.resolve(HERE, '..', 'package.json'), 'utf8'));
  assert.ok(manifest.contributes.commands.some((item) => item.command === 'tiinex.artifact.new'));
  assert.ok(manifest.activationEvents.includes('onCommand:tiinex.artifact.new'));
});

await test('generic materialization and draft wrappers stay schema-neutral for a non-Handoff Task', async () => {
  const fs = await import('node:fs/promises');
  const runtime = { root: '/runtime', entrypoint: '/runtime/tiinex-portable.mjs', nodeExecutable: 'node', dispose: async () => undefined };
  let proposalPath = '';
  const planFx = fakeRunner(async (_key, _index, call) => {
    assert.equal(call.args[1], 'prepare-materialization');
    assert.equal(call.args[2], '/repo');
    proposalPath = call.args[call.args.indexOf('--proposals') + 1];
    const body = JSON.parse(await fs.readFile(proposalPath, 'utf8'));
    assert.equal(body.proposals[0].schemaId, 'tiinex.task.v1');
    return { code: 0, stdout: JSON.stringify({ status: 'ready', candidateSchemas: [{ schemaId: 'tiinex.task.v1', label: 'Task', status: 'ready' }], parentCandidates: [], proposals: [{ id: 'proof', schemaId: 'tiinex.task.v1', status: 'ready', path: '.topics/task.trace.md' }] }), stderr: '' };
  });
  const proposal = { id: 'proof', schemaId: 'tiinex.task.v1', mode: 'root', title: 'Task proof', values: { Summary: 'proof' }, rationale: 'test', evidenceRefs: ['test'] };
  const planned = await projectArtifactMaterialization(runtime, '/repo', [proposal], planFx.runner);
  assert.equal(planned.proposals[0].path, '.topics/task.trace.md');
  assert.ok(planFx.calls[0].args.includes('--compact'));
  await assert.rejects(fs.access(proposalPath));

  let valuesPath = '';
  const draftFx = fakeRunner(async (_key, _index, call) => {
    assert.equal(call.args[1], 'create-local-draft');
    assert.equal(call.args[call.args.indexOf('--schema') + 1], 'tiinex.task.v1');
    assert.equal(call.args[call.args.indexOf('--path') + 1], '.topics/task.trace.md');
    assert.equal(call.args.includes('--title'), false);
    valuesPath = call.args[call.args.indexOf('--values') + 1];
    assert.deepEqual(JSON.parse(await fs.readFile(valuesPath, 'utf8')), { Summary: 'proof' });
    return { code: 0, stdout: JSON.stringify({ status: 'created-clean', draft: { path: '.topics/task.trace.md', markdown: '# Task proof\n' }, findingSummary: { counts: { error: 0 } } }), stderr: '' };
  });
  const created = await createArtifactDraft(runtime, 'tiinex.task.v1', '/repo', '.topics/task.trace.md', 'Task proof', { Summary: 'proof' }, null, 'create-artifact', draftFx.runner);
  assert.equal(created.status, 'created-clean');
  await assert.rejects(fs.access(valuesPath));
});

await test('Transport prepared state is keyed by immutable package SHA plus exact route selection', async () => {
  const sha = 'a'.repeat(64);
  assert.equal(transportPreparedKey(sha), `${sha}:@package`);
  assert.equal(transportPreparedKey(sha, 'route-2'), `${sha}:route-2`);
  assert.equal(transportPrepared({ packagePrepared: true, textPrepared: true }), true);
  assert.equal(transportPrepared({ packagePrepared: true, textPrepared: false }), false);
  assert.deepEqual(mergeTransportRouteSelection(undefined, 'route-b'), ['route-b']);
  assert.deepEqual(mergeTransportRouteSelection(['route-b'], 'route-a'), ['route-a', 'route-b']);
  assert.equal(mergeTransportRouteSelection(['route-a'], ''), null);
  assert.equal(mergeTransportRouteSelection(null, 'route-b'), null);
  assert.deepEqual(selectedTransportRouteIds(['route-c', 'route-a', 'route-b'], ['route-b', 'missing']), ['route-b']);
  assert.deepEqual(selectedTransportRouteIds(['route-c', 'route-a'], null), ['route-c', 'route-a']);
  assert.throws(() => transportPreparedKey('not-a-sha'), /tiinex\.transport\.sha256-invalid/);
});

await test('Transport package projection delegates exact generic and route transport text to Core CLI', async () => {
  const runtime = { root: '/runtime', entrypoint: '/runtime/tiinex-portable.mjs', nodeExecutable: 'node', dispose: async () => undefined };
  const fx = fakeRunner((_key, index, call) => {
    if (index === 0) {
      assert.deepEqual(call.args, ['/runtime/tiinex-portable.mjs', 'project-handoff-carrier-output', '/packages/a.zip', '--compact']);
      return { code: 0, stdout: JSON.stringify({ status: 'ready', humanOutput: { normalInlineRouting: { content: 'EXACT GENERIC' } } }), stderr: '' };
    }
    assert.deepEqual(call.args, ['/runtime/tiinex-portable.mjs', 'project-handoff-carrier-output', '/packages/a.zip', '--route', 'extension-vscode:.topics/route.trace.md', '--compact']);
    return { code: 0, stdout: JSON.stringify({ status: 'ready', humanOutput: { normalInlineRouting: { content: 'EXACT ROUTE' }, presentation: { recipientLabel: 'Sigma' } } }), stderr: '' };
  });
  const generic = await projectPackageTransport(runtime, '/packages/a.zip', '', fx.runner);
  const routed = await projectPackageTransport(runtime, '/packages/a.zip', 'extension-vscode:.topics/route.trace.md', fx.runner);
  assert.equal(generic.humanOutput.normalInlineRouting.content, 'EXACT GENERIC');
  assert.equal(routed.humanOutput.normalInlineRouting.content, 'EXACT ROUTE');
  assert.equal(routed.humanOutput.presentation.recipientLabel, 'Sigma');
});

await test('Transport file clipboard never reports a text-path fallback as file-copy success', async () => {
  const unsupported = await copyFileToClipboard('/tmp/package.zip', 'linux', async () => { throw new Error('must not run'); });
  assert.equal(unsupported.state, 'unsupported');
  const fx = fakeRunner((_key, _index, call) => {
    assert.equal(call.command, 'powershell.exe');
    assert.ok(call.args.includes('-STA'));
    assert.ok(call.args.includes('-EncodedCommand'));
    return { code: 0, stdout: '', stderr: '' };
  });
  const copied = await copyFileToClipboard('C:\\Temp\\carrier.zip', 'win32', fx.runner);
  assert.equal(copied.state, 'copied');
  assert.equal(fx.calls.length, 1);
});

await test('installed Core exposes Handoff reference fields as validation-only authoring gaps', async () => {
  const root = path.resolve(HERE, '..');
  const runtime = await prepareBundledRuntime(root, process.execPath);
  try {
    const [contract, guide] = await Promise.all([
      inspectArtifactCreationContract(runtime, 'tiinex.handoff.v1', 'create-artifact'),
      projectArtifactSchemaGuide(runtime, 'tiinex.handoff.v1', 'create')
    ]);
    const model = projectArtifactAuthoringModel(contract, guide);
    const parties = model.sections.find((section) => section.key === 'Handoff Parties');
    assert.ok(parties);
    assert.equal(parties.fields.some((field) => field.key === 'From Reference'), false);
    assert.equal(parties.fields.some((field) => field.key === 'To Reference'), false);
    const gap = model.capabilityGaps.find((item) => item.section === 'Handoff Parties');
    assert.ok(gap?.fields.includes('From Reference'));
    assert.ok(gap?.fields.includes('To Reference'));
  } finally { await runtime.dispose(); }
});

await test('installed Core preserves historical reference debt as warning and blocks the same omission prospectively', async () => {
  const { buildArtifactCreationContract } = await import('@tiinex/core/schemas/creation.contracts.js');
  const { renderArtifactCreationDraftMarkdown } = await import('@tiinex/core/schemas/creation.renderer.js');
  const { validateArtifact } = await import('@tiinex/core/validation/validateArtifact.js');
  const contract = buildArtifactCreationContract({ schemaId: 'tiinex.task.v1', transitionType: 'create-artifact' });
  const canonical = renderArtifactCreationDraftMarkdown(contract, {
    currentSchemaId: 'tiinex.task.v1',
    childPath: '.topics/local-core-acceptance.trace.md',
    bodyMarkdown: '# Local Core acceptance\n',
    title: 'Local Core acceptance',
    summary: 'Local Core acceptance',
    createdAt: '2026-09-12 10:00:00'
  });
  const plain = canonical.replace(/- Envelope Schema: \[tiinex\.root\.v1\]\([^\n]+\)/, '- Envelope Schema: tiinex.root.v1');
  assert.notEqual(plain, canonical, 'fixture must remove the exact Envelope Schema target');
  const historical = validateArtifact({ markdown: plain, schemaReferenceContext: 'historical' });
  const historicalFinding = historical.findings.find((item) => item.code === 'schema.reference.exact-target-omitted' && item.params?.field === 'Envelope Schema');
  assert.equal(historicalFinding?.severity, 'warning');
  assert.match(historicalFinding?.message || '', /Preserve the historical bytes/);
  const prospective = validateArtifact({ markdown: plain, schemaReferenceContext: 'candidate' });
  const prospectiveFinding = prospective.findings.find((item) => item.code === 'schema.reference.exact-target-omitted' && item.params?.field === 'Envelope Schema');
  assert.equal(prospectiveFinding?.severity, 'error');
  assert.match(prospectiveFinding?.message || '', /new candidate must use Markdown Link form/);
});


await test('Discovery and Incoming delta display is shared-compare-backed and never hides unqualified differences', async () => {
  const fs = await import('node:fs/promises');
  const tree = await fs.readFile(path.resolve(HERE, '..', 'src', 'operatorTrees.ts'), 'utf8');
  assert.match(tree, /toggleDelta\('discovery'\)/);
  assert.match(tree, /toggleDelta\('incoming'\)/);
  assert.match(tree, /compareIncomingWorkspaceToLocal/);
  assert.match(tree, /No Workspace delta against open local repositories/);
  assert.match(tree, /state: 'local-missing'/);
  assert.match(tree, /state: 'unavailable'/);
  assert.match(tree, /delta\.incomingPaths/);
  assert.doesNotMatch(tree, /delta.*source mutation/i);
});

await test('multi-Incoming and Merge/Replace remain selection-first, dry until final execute, and keep filesystem/Git safety explicit', async () => {
  const fs = await import('node:fs/promises');
  const tree = await fs.readFile(path.resolve(HERE, '..', 'src', 'operatorTrees.ts'), 'utf8');
  const apply = await fs.readFile(path.resolve(HERE, '..', 'src', 'incomingApply.ts'), 'utf8');
  assert.match(tree, /private incoming: IncomingState\[\] = \[\]/);
  assert.match(tree, /this\.incoming = \[state, \.\.\.this\.incoming\.filter/);
  assert.match(tree, /operatorMatchedWorkspaceIds/);
  assert.match(tree, /resolvePrioritizedWorkspaceDuplicates/);
  assert.match(tree, /placeHolder: this\.outgoingProjectedFilename\(\)/);
  assert.match(tree, /\$\(repo\) LOCAL · VS CODE/);
  assert.match(tree, /pickerItems\.push\(\{ label: sourceName, kind: vscode\.QuickPickItemKind\.Separator \}\)/);
  assert.match(tree, /seed\?\.kind === 'local'/);
  assert.match(tree, /seed\?\.kind === 'incoming'/);
  assert.match(tree, /this\.selectOutgoingWorkspaces\(packageParentPath/);
  assert.match(tree, /this\.outgoingProjectedFilename\(\)/);
  assert.match(tree, /const routes = qualifiedRoutes\(parent\.orientation\)/);
  assert.match(tree, /routes\.findIndex/);
  assert.match(tree, /this\.projection\('outgoing'\) === 'files'/);
  assert.match(tree, /outgoingCarrierFileChildren\(\)/);
  assert.match(tree, /001-1-READ-BEFORE-PROCEEDING\.trace\.md/);
  assert.match(tree, /001-2-bootstrap\.zip/);
  assert.match(tree, /001-tiinex-handoff-package\.trace\.md/);
  assert.match(tree, /Keep Incoming and Outgoing package roots visually identical/);
  assert.doesNotMatch(tree, /\$\{parentDimension\}-\?/);
  assert.doesNotMatch(tree, /: '…'/);
  assert.match(tree, /tooltipLines = \[projectedFilename, lineage\]/);
  assert.match(tree, /logicalWorkspaceGroupNode\(section, workspaceId, packagePath, 'files', 'Files'\)/);
  assert.match(tree, /logicalWorkspaceGroupNode\(section, workspaceId, packagePath, 'lineage', 'Lineage'\)/);
  assert.doesNotMatch(tree, /logicalWorkspaceGroupNode\(section, workspaceId, packagePath, 'handoffs', 'Handoffs'\)/);
  assert.match(tree, /visibleDiscoveredPackages\(\)/);
  assert.match(tree, /Loading…/);
  assert.match(tree, /loading~spin/);
  assert.match(tree, /workspacePayloadIncluded/);
  assert.match(tree, /logicalWorkspaceHandoffTargets/);
  assert.match(tree, /resolved-handoff:/);
  assert.match(tree, /logicalHandoffProvenance/);
  assert.match(tree, /pointerTargetChildren/);
  assert.match(tree, /workspaceFileTreeChildren/);
  assert.match(tree, /logicalLineageChildren/);
  assert.match(tree, /outgoingSeriesPrefix/);
  assert.match(tree, /nextOutgoingSeriesLabel/);
  assert.match(tree, /Outgoing prefix\. Shared Tooling owns the qualified package filename; Tiinex adds the 000-series suffix after you choose the prefix\./);
  assert.doesNotMatch(tree, /Outgoing label\. A new lineage starts at carrier major 001/);
  assert.match(tree, /this\.materialProvider\.uriFor/);
  assert.match(tree, /openWorkspaceMarkdownNode/);
  assert.match(tree, /revealIncomingRoute/);
  assert.match(tree, /VS Code operator selected stable multi-Workspace checkpoint/);
  assert.doesNotMatch(tree, /Why is this multi-Workspace state stable/);
  assert.match(tree, /bootstrapPayloadIncluded/);
  assert.match(tree, /payloadCheckoutEligibility/);
  assert.match(tree, /shared Core manufacture\/unpack support/);
  assert.match(tree, /artifactProjectionChildren\('outgoing', node, artifacts\)/);
  assert.match(tree, /applyIncomingWorkspaces/);
  assert.match(tree, /planWorkspaceSession/);
  assert.match(tree, /Open Multi-Repo Workspace/);
  assert.match(tree, /will not mutate a hidden repository/);
  assert.match(tree, /Continue the Incoming Review Plan in the new window/);
  assert.match(tree, /Review Plan/);
  const workspaceSession = await fs.readFile(path.resolve(HERE, '..', 'src', 'vscode', 'incomingWorkspaceSession.ts'), 'utf8');
  assert.match(workspaceSession, /globalStorage|storageRoot/);
  assert.match(workspaceSession, /\.code-workspace/);
  assert.match(workspaceSession, /tiinex-resume\.json/);
  assert.doesNotMatch(workspaceSession, /updateWorkspaceFolders/);
  assert.match(apply, /compareIncomingWorkspaceToLocal/);
  assert.match(apply, /sourceComparisonLabel/);
  assert.match(apply, /shared-compare-unavailable/);
  assert.match(apply, /shared-compare-blocked/);
  assert.match(apply, /Stash local changes/);
  assert.match(apply, /stashWorkingTree/);
  assert.doesNotMatch(apply, /discardWorkingTree|git clean|reset --hard/);
  assert.match(apply, /only these Workspace roots can change/);
  assert.match(apply, /ignored paths and symlinks are protected/);
  assert.match(apply, /local-state-changed-after-review/);
  assert.match(apply, /assertMutationPreconditions\(plans\)/);
  assert.match(apply, /not a cross-repository atomic transaction/);
  const packageBuilder = await fs.readFile(path.resolve(HERE, '..', 'src', 'packageBuilder.ts'), 'utf8');
  assert.match(packageBuilder, /carrier-dimension-shared-contract-mismatch/);
  assert.match(packageBuilder, /carrier-filename-shared-contract-mismatch/);
  assert.match(packageBuilder, /assertExpectedCarrierDimension\(preview/);
  assert.match(packageBuilder, /assertExpectedCarrierDimension\(built/);
  assert.match(packageBuilder, /assertExpectedCarrierFilename\(preview/);
  assert.match(packageBuilder, /assertExpectedCarrierFilename\(built/);
  assert.match(tree, /expectedCarrierFilename = this\.outgoingProjectedFilename\(\)/);
  assert.match(tree, /fileArtifactRoots\('discovery',[\s\S]*index\.packagePath/);
  assert.match(tree, /index\.carrierFiles/);
  assert.match(apply, /entry\.name === '\.git'/);
  assert.match(apply, /check-ignore/);
  assert.match(apply, /ignored-or-symlink-collision/);
  assert.match(apply, /mergeCommitNoCommit/);
  assert.match(apply, /workbench\.view\.scm/);
  assert.match(apply, /workbench\.view\.explorer/);
  assert.match(apply, /revealInExplorer/);
  assert.match(apply, /let incomingApplyRunning = false;/);
  assert.match(apply, /withIncomingApplyMutex/);
  assert.match(apply, /Tiinex applying Incoming/);
  assert.match(apply, /progress\.report\(\{ message:/);
  assert.match(apply, /const requiresFinalConfirm = plans\.some\(\(plan\) => plan\.strategy === 'merge'\)/);
  assert.match(apply, /if \(requiresFinalConfirm\) \{/);
  assert.match(apply, /'Execute Plan'/);
  assert.match(apply, /if \(confirmed !== 'Execute Plan'\) return null;/);
});

await test('tree errors keep compact summaries visible and full technical detail behind Show Details', async () => {
  const fs = await import('node:fs/promises');
  const tree = await fs.readFile(path.resolve(HERE, '..', 'src', 'operatorTrees.ts'), 'utf8');
  assert.match(tree, /shortMessage\(error\)/);
  assert.match(tree, /'Show Details'/);
  assert.match(tree, /error\.stack \|\| error\.message/);
  const extension = await fs.readFile(path.resolve(HERE, '..', 'src', 'extension.ts'), 'utf8');
  assert.doesNotMatch(extension, /runManualLanding|executeLanding|HandoffInboxWatcher/);
});

await test('latest-wins queue keeps active work serialized and collapses multiple pending values for the same key', async () => {
  const calls = [];
  let releaseFirst;
  const firstGate = new Promise((resolve) => { releaseFirst = resolve; });
  const queue = new LatestWinsKeyedQueue(async (value, key) => {
    calls.push([key, value]);
    if (value === 1) await firstGate;
    return value * 10;
  });
  const first = queue.enqueue('doc', 1);
  await new Promise((resolve) => setTimeout(resolve, 0));
  const second = queue.enqueue('doc', 2);
  const third = queue.enqueue('doc', 3);
  releaseFirst();
  assert.equal(await first, 10);
  assert.equal(await second, 30);
  assert.equal(await third, 30);
  assert.deepEqual(calls, [['doc', 1], ['doc', 3]]);
});

await test('watcher accepts only completed Handoff package names', async () => {
  assert.equal(isHandoffPackagePath('x.handoff-package.zip'), true);
  assert.equal(isHandoffPackagePath('x.zip'), false);
  assert.equal(isHandoffPackagePath('x.handoff-package.zip.part'), false);
});

await test('stable debounce requires consecutive unchanged probes', async () => {
  const probes = [
    { exists: true, size: 10, mtimeMs: 1 },
    { exists: true, size: 11, mtimeMs: 2 },
    { exists: true, size: 11, mtimeMs: 2 },
    { exists: true, size: 11, mtimeMs: 2 }
  ];
  let index = 0;
  let sleeps = 0;
  const stable = await waitForStableProbe(async () => probes[Math.min(index++, probes.length - 1)], async () => { sleeps += 1; }, { stableSamples: 3, intervalMs: 25, maxSamples: 6 });
  assert.equal(stable, true);
  assert.equal(sleeps, 3);
});

await test('safe landing paths reject traversal and absolute forms', async () => {
  for (const value of ['../x', '/x', 'C:\\x', 'a/../../x']) assert.throws(() => safeRelativePath(value));
  assert.equal(safeRelativePath('a\\b/c'), 'a/b/c');
  assert.equal(safeTarget('/tmp/tiinex-root', 'a/b'), path.resolve('/tmp/tiinex-root/a/b'));
});

await test('ignored preservation rejects direct and ancestor collisions only', async () => {
  assert.deepEqual(ignoredPathCollisions(['dist/app.js', 'src/a.ts'], ['.cache/x', 'dist/app.js']), ['dist/app.js <-> dist/app.js']);
  assert.deepEqual(ignoredPathCollisions(['dist'], ['dist/private.bin']), ['dist <-> dist/private.bin']);
  assert.deepEqual(ignoredPathCollisions(['src/a.ts'], ['.cache/x']), []);
});

await test('bootstrap descriptor binds exact package payload bytes and entrypoint', async () => {
  const start = '- Tooling Entrypoint: `runtime/tools/tiinex-portable.mjs`\n- Portable Tooling bootstrap: [001-2-bootstrap.trace.md](001-2-bootstrap.trace.md)';
  const trace = '- Byte Size: 42\n- Location: [001-2-bootstrap.zip](001-2-bootstrap.zip)\n- Integrity Value: ' + 'a'.repeat(64);
  assert.deepEqual(parseBootstrapDescriptor(start, trace), { packagePath: '001-2-bootstrap.zip', bytes: 42, sha256: 'a'.repeat(64), entrypoint: 'runtime/tools/tiinex-portable.mjs' });
});

await test('installed @tiinex/core public portable entry matches the lockfile-resolved runtime', async () => {
  const fs = await import('node:fs/promises');
  const root = path.resolve(HERE, '..');
  const manifest = JSON.parse(await fs.readFile(path.join(root, 'package.json'), 'utf8'));
  const declaredRange = String(manifest.dependencies?.['@tiinex/core'] || '').trim();
  assert.ok(declaredRange, '@tiinex/core must remain a declared runtime dependency');
  assert.equal(Object.hasOwn(manifest.scripts || {}, 'sync:shared-core'), false);
  await assert.rejects(fs.access(path.join(root, 'shared-core')));
  const runtime = await prepareBundledRuntime(root, process.execPath);
  try {
    assert.match(runtime.root, /node_modules[\\/]@tiinex[\\/]core$/);
    assert.match(runtime.entrypoint, /node_modules[\\/]@tiinex[\\/]core[\\/]tools[\\/]tiinex-portable\.mjs$/);
    const corePackage = JSON.parse(await fs.readFile(path.join(runtime.root, 'package.json'), 'utf8'));
    assert.equal(corePackage.name, '@tiinex/core');
    const lock = JSON.parse(await fs.readFile(path.join(root, 'package-lock.json'), 'utf8'));
    assert.equal(corePackage.version, lock.packages['node_modules/@tiinex/core'].version);
    assert.equal(corePackage.exports?.['./portable-entry'], './tools/tiinex-portable.mjs');
  } finally { await runtime.dispose(); }
});

await test('runtime binding rejects a missing lockfile, stale declaration and different installed version', async () => {
  const fs = await import('node:fs/promises');
  const root = path.resolve(HERE, '..');
  const scratch = await fs.mkdtemp(path.join((await import('node:os')).tmpdir(), 'tiinex-extension-binding-'));
  try {
    await fs.cp(path.join(root, 'node_modules', '@tiinex', 'core'), path.join(scratch, 'node_modules', '@tiinex', 'core'), { recursive: true });
    await fs.copyFile(path.join(root, 'package.json'), path.join(scratch, 'package.json'));
    await assert.rejects(prepareBundledRuntime(scratch, process.execPath), /lockfile-missing/);
    const lock = JSON.parse(await fs.readFile(path.join(root, 'package-lock.json'), 'utf8'));
    const validLock = JSON.stringify(lock);
    lock.packages[''].dependencies['@tiinex/core'] = 'mismatching-declaration';
    await fs.writeFile(path.join(scratch, 'package-lock.json'), JSON.stringify(lock));
    await assert.rejects(prepareBundledRuntime(scratch, process.execPath), /lockfile-declaration-mismatch/);
    await fs.writeFile(path.join(scratch, 'package-lock.json'), validLock);
    const runtime = await prepareBundledRuntime(scratch, process.execPath);
    await runtime.dispose();
    const corePath = path.join(scratch, 'node_modules', '@tiinex', 'core', 'package.json');
    const core = JSON.parse(await fs.readFile(corePath, 'utf8'));
    core.version = '999.0.0';
    await fs.writeFile(corePath, JSON.stringify(core));
    await assert.rejects(prepareBundledRuntime(scratch, process.execPath), /version-mismatch/);
  } finally { await fs.rm(scratch, { recursive: true, force: true }); }
});

await test('carrier names are labels and never filesystem paths', async () => {
  const { checkedCarrierFilename } = await import('../dist/core/carrierFilename.js');
  assert.equal(checkedCarrierFilename('business-001-1.handoff-package.zip'), 'business-001-1.handoff-package.zip');
  for (const bad of ['../a.handoff-package.zip', 'C:\\a.handoff-package.zip', 'a/b.handoff-package.zip', 'CON.handoff-package.zip', 'a:secret.handoff-package.zip', 'x\x00.handoff-package.zip', ' a.handoff-package.zip', 'a.handoff-package.zip ', 'file.zip']) {
    assert.throws(() => checkedCarrierFilename(bad), /carrier-filename-invalid/);
  }
});

await test('pointerless Pack passes the displayed filename and verifies both receipts', async () => {
  const fs = await import('node:fs/promises');
  const root = path.resolve(HERE, '..');
  const tree = await fs.readFile(path.join(root, 'src', 'operatorTrees.ts'), 'utf8');
  const start = tree.indexOf('if (!routes.length)', tree.indexOf('private async packageOutgoing'));
  const section = tree.slice(start, tree.indexOf('const selected', start));
  assert.match(section, /expectedCarrierFilename: this\.outgoingProjectedFilename\(\)/);
  const builder = await fs.readFile(path.join(root, 'src', 'packageBuilder.ts'), 'utf8');
  const branch = builder.slice(builder.indexOf('if (route.pointerless) {'), builder.indexOf('if (!route.workspaceId', builder.indexOf('if (route.pointerless) {')));
  assert.match(branch, /assertExpectedCarrierFilename\(preview/);
  assert.match(branch, /assertExpectedCarrierFilename\(built/);
  assert.match(branch, /assertExactWorkspaceSelection\(preview/);
  assert.match(branch, /assertExactWorkspaceSelection\(built/);
  assert.match(branch, /publishCarrierFile/);
});

await test('carrier publication does not overwrite different bytes and accepts an exact retry', async () => {
  const fs = await import('node:fs/promises');
  const { publishCarrierFile } = await import('../dist/host/carrierPublish.js');
  const scratch = await fs.mkdtemp(path.join((await import('node:os')).tmpdir(), 'tiinex-publish-test-'));
  try {
    const src = path.join(scratch, 'source.zip'); const out = path.join(scratch, 'output');
    await fs.writeFile(src, 'candidate');
    const target = await publishCarrierFile(src, out, 'a.handoff-package.zip');
    assert.equal(await publishCarrierFile(src, out, 'a.handoff-package.zip'), target);
    await fs.writeFile(src, 'different');
    await assert.rejects(publishCarrierFile(src, out, 'a.handoff-package.zip'), /output-exists-different/);
    assert.equal(await fs.readFile(target, 'utf8'), 'candidate');
    assert.deepEqual(await fs.readdir(out), ['a.handoff-package.zip']);
  } finally { await fs.rm(scratch, { recursive: true, force: true }); }
});

await test('title extraction skips the integrity footer and fenced examples', async () => {
  const { titleFromMarkdown } = await import('../dist/core/artifactTree.js');
  assert.equal(titleFromMarkdown('# My Handoff\n\n## Purpose\nHi\n---\n# Continuity Integrity\n'), 'My Handoff');
  assert.equal(titleFromMarkdown('# Continuity Context\n\n---\n# Real title\n---\n# Continuity Integrity\n'), 'Real title');
  assert.equal(titleFromMarkdown('```md\n# Example\n```\n# Actual title\n'), 'Actual title');
  assert.equal(titleFromMarkdown('# Continuity Context\n---\n# Continuity Integrity\n', 'fallback'), 'fallback');
});

await test('package collision and runtime drift errors suggest a non-destructive next step', async () => {
  assert.match(presentOperatorError(new Error('tiinex.package-builder.output-exists-different')).summary, /different package/);
  assert.match(presentOperatorError(new Error('tiinex.core-package.lockfile-missing')).summary, /npm ci/);
});

await test('public Core portable entry exposes every VS Code-used shared operation', async () => {
  const runtime = await prepareBundledRuntime(path.resolve(HERE, '..'), process.execPath);
  try {
    const catalog = await runTiinexJson(runtime, ['operations']);
    const names = new Set((catalog.operations || []).map((item) => item.name));
    for (const name of ['orient-handoff-package', 'compare-source-frontiers', 'project-workspace-landing', 'project-editor-assistance', 'project-authoring-parent', 'project-operator-context', 'project-staged-validation', 'project-handoff-endpoints', 'create-local-draft', 'manufacture-handoff-package']) assert.equal(names.has(name), true, name);
  } finally { await runtime.dispose(); }
});

await test('installed Core runtime executes real operator-context and staged-only validation projections', async () => {
  const root = path.resolve(HERE, '..');
  const runtime = await prepareBundledRuntime(root, process.execPath);
  try {
    const context = await projectOperatorContext(runtime, [root]);
    assert.equal(context.status, 'ready');
    assert.deepEqual(context.workspaces.map((item) => item.workspaceId), ['extension-vscode', 'vscode']);
    assert.equal((context.findings || []).some((item) => item.severity === 'error'), false);
    const staged = await projectStagedValidation(runtime, root, ['README.md']);
    assert.equal(staged.status, 'ready');
    assert.equal(staged.state, 'no-staged-tiinex');
    assert.deepEqual(staged.ignoredStagedPaths, ['README.md']);
    assert.equal(staged.blockingFindingCount, 0);
  } finally { await runtime.dispose(); }
});

await test('installed Core editor assistance withholds mixed-revision schema lineage while preserving qualified local authority', async () => {
  const fs = await import('node:fs/promises');
  const os = await import('node:os');
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'tiinex-vscode-editor-material-'));
  const runtime = await prepareBundledRuntime(path.resolve(HERE, '..'), process.execPath);
  try {
    await fs.mkdir(path.join(root, '.topics'), { recursive: true });
    const organizationPath = '.topics/org.trace.md';
    const organizationMarkdown = '# Continuity Context\n\n- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/911d4cf990e35ce25a56e8f376d296e327c48260/.topics/.schemas/tiinex.root.v1.schema.md)\n- Current\n  - Current Schema: [tiinex.party.organization.v1](https://github.com/Tiinex/docs/blob/911d4cf990e35ce25a56e8f376d296e327c48260/.topics/.schemas/party/organization/tiinex.party.organization.v1.schema.md)\n  - Created At: 2026-09-06 20:00:00\n  - Summary: fixture\n  - Status: accepted/local\n  - Why: fixture\n\n---\n\n# Organization\n';
    await fs.writeFile(path.join(root, organizationPath), organizationMarkdown, 'utf8');
    const organization = await projectEditorAssistanceText(runtime, root, organizationPath, organizationMarkdown);
    const orgDocument = organization.documents[0];
    assert.equal(orgDocument.validator.authorityState, 'unavailable');
    assert.equal(orgDocument.validator.authorityBasis, 'declared-current-schema-exact-source-target');
    assert.ok(orgDocument.validator.authorityFindings?.some((item) => /substitutes source authority/.test(item)));
    assert.ok(orgDocument.diagnostics.some((item) => item.code === 'audit.schema-authority.unqualified'));

    const rolePath = '.topics/role.trace.md';
    const roleMarkdown = '# Continuity Context\n\n- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)\n- Current\n  - Current Schema: [tiinex.party.role.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/party/role/tiinex.party.role.v1.schema.md)\n  - Created At: 2026-09-06 20:00:00\n  - Summary: fixture\n  - Status: accepted/local\n  - Why: fixture\n\n---\n\n# Role\n';
    await fs.writeFile(path.join(root, rolePath), roleMarkdown, 'utf8');
    const role = await projectEditorAssistanceText(runtime, root, rolePath, roleMarkdown);
    assert.equal(role.documents[0].validator.authorityState, 'qualified');
    assert.equal(role.documents[0].validator.authorityBasis, 'qualified-workspace-local-authority');

    const legacyIntegrityTarget = 'https://github.com/Tiinex/docs/blob/4cb7046454f1cf75333097fc1a3d4562838afc26/.topics/.validators/sha256-base64url-c14n-v2.validator.md';
    const preferredIntegrityTarget = 'https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md';
    const stalePath = '.topics/stale-integrity.trace.md';
    const staleMarkdown = `# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
  - Created At: 2026-09-06 20:00:00
  - Summary: fixture

---

# Root fixture

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](${legacyIntegrityTarget})
  - Towards: self
  - Value: pending
`;
    await fs.writeFile(path.join(root, stalePath), staleMarkdown, 'utf8');
    const staleIntegrity = await projectEditorAssistanceText(runtime, root, stalePath, staleMarkdown);
    const hygieneAction = staleIntegrity.documents[0].actions.find((item) => item.diagnosticCodes?.includes('integrity.method-reference.unqualified'));
    assert.ok(hygieneAction, 'shared editor assistance must project a deterministic method-reference hygiene repair');
    assert.equal(hygieneAction.replacementMarkdown.includes(legacyIntegrityTarget), false);
    assert.equal(hygieneAction.replacementMarkdown.includes(preferredIntegrityTarget), true);
  } finally { await runtime.dispose(); await fs.rm(root, { recursive: true, force: true }); }
});

await test('source-frontier compare wrapper uses current shared Core and exact explicit source kinds', async () => {
  const runtime = { root: '/runtime', entrypoint: '/runtime/tiinex-portable.mjs', nodeExecutable: 'node', dispose: async () => undefined };
  const fx = fakeRunner(() => ({
    code: 0,
    stdout: JSON.stringify({
      status: 'ready',
      state: 'changed',
      mode: 'two-way',
      workspaces: [{ workspaceId: 'core', state: 'changed', delta: { counts: { added: 1, removed: 2, byteChanged: 3, total: 6 }, added: ['new'], removed: ['old'], byteChanged: ['changed'] } }]
    }),
    stderr: ''
  }));
  const result = await compareIncomingWorkspaceToLocal(runtime, '/carrier.zip', '/repo-core', 'core', fx.runner);
  assert.equal(result.workspaces[0].delta.counts.total, 6);
  assert.deepEqual(fx.calls[0].args.slice(1), [
    'compare-source-frontiers',
    '--left-kind', 'local-workspace',
    '--left', '/repo-core',
    '--left-id', 'core',
    '--right-kind', 'handoff-package',
    '--right', '/carrier.zip',
    '--right-select', 'core'
  ]);
});

await test('structured Core qualification receipts survive non-zero CLI exit codes', async () => {
  const runtime = { root: '/runtime', entrypoint: '/runtime/tiinex-portable.mjs', nodeExecutable: 'Code.exe', dispose: async () => undefined };
  const blockedReceipt = { status: 'blocked', actionableFindings: [{ code: 'portable.source-frontier.fixture-blocked', severity: 'error', message: 'fixture' }] };
  const fx = fakeRunner(() => ({ code: 2, stdout: JSON.stringify(blockedReceipt), stderr: '' }));
  const parsed = await runTiinexJson(runtime, ['compare-source-frontiers'], fx.runner);
  assert.equal(parsed.status, 'blocked');
  assert.equal(fx.calls[0].env?.ELECTRON_RUN_AS_NODE, '1');

  const compareFx = fakeRunner(() => ({ code: 2, stdout: JSON.stringify(blockedReceipt), stderr: '' }));
  await assert.rejects(
    compareIncomingWorkspaceToLocal(runtime, '/carrier.zip', '/repo-core', 'core', compareFx.runner),
    /tiinex\.source-frontier\.compare-blocked:portable\.source-frontier\.fixture-blocked/
  );
});

await test('landing-plan descriptors use cleaned OS temp files and exact CLI flag shapes', async () => {
  const fx = fakeRunner(() => ({ code: 0, stdout: JSON.stringify({ status: 'ready', affected: [], findings: [] }), stderr: '' }));
  const runtime = { root: '/read-only-runtime', entrypoint: '/shared/tiinex-portable.mjs', nodeExecutable: 'node', dispose: async () => undefined };
  await projectWorkspaceLanding(runtime, '/carrier.zip', [{ id: 'repo' }], { site: 'repo' }, ['site', 'vscode'], fx.runner);
  const args = fx.calls[0].args;
  const repositoriesPath = args[args.indexOf('--repositories') + 1];
  const selectionsPath = args[args.indexOf('--selections') + 1];
  assert.equal(args[args.indexOf('--workspaces') + 1], 'site,vscode');
  assert.equal(repositoriesPath.startsWith('/read-only-runtime'), false);
  assert.equal(selectionsPath.startsWith('/read-only-runtime'), false);
  const fs = await import('node:fs/promises');
  await assert.rejects(fs.access(repositoriesPath));
  await assert.rejects(fs.access(selectionsPath));
});

function fakeRunner(script) {
  const calls = [];
  const runner = async (command, args, options = {}) => {
    calls.push({ command, args: [...args], cwd: options.cwd, env: options.env });
    const key = `${command} ${args.join(' ')}`;
    const value = typeof script === 'function' ? script(key, calls.length - 1, calls[calls.length - 1]) : script[key];
    return value ?? { code: 0, stdout: '', stderr: '' };
  };
  return { runner, calls };
}


await test('in-memory editor assistance stages exact unsaved overlay bytes only for the shared operation lifetime', async () => {
  const fs = await import('node:fs/promises');
  let stagedPath = '';
  const runtime = { root: '/runtime', entrypoint: '/runtime/tiinex-portable.mjs', nodeExecutable: 'node', dispose: async () => undefined };
  const markdown = '# Continuity Context\n\nunsaved bytes\n';
  const fx = fakeRunner(async (_key, _index, call) => {
    assert.equal(call.args[1], 'project-editor-assistance');
    assert.equal(call.args[2], '/repo');
    assert.equal(call.args[call.args.indexOf('--focus') + 1], '.topics/draft.trace.md');
    stagedPath = call.args[call.args.indexOf('--overlay') + 1];
    assert.equal(path.basename(stagedPath), 'overlay.md');
    assert.equal(await fs.readFile(stagedPath, 'utf8'), markdown);
    return { code: 0, stdout: JSON.stringify({ status: 'clean', documents: [] }), stderr: '' };
  });
  await projectEditorAssistanceText(runtime, '/repo', '.topics/draft.trace.md', markdown, fx.runner);
  await assert.rejects(fs.access(path.dirname(stagedPath)));
});

await test('diagnostics controller captures unsaved bytes before debounce and discards stale or closed-editor work', async () => {
  const fs = await import('node:fs/promises');
  const source = await fs.readFile(path.resolve(HERE, '..', 'src', 'diagnostics.ts'), 'utf8');
  assert.match(source, /onDidOpenTextDocument/);
  assert.match(source, /onDidChangeTextDocument/);
  assert.match(source, /onDidSaveTextDocument/);
  assert.match(source, /onDidCloseTextDocument/);
  assert.match(source, /CHANGE_DEBOUNCE_MS = 250/);
  assert.match(source, /projectEditorAssistanceText/);
  assert.match(source, /requestFor\(document, generation, 'in-memory', document\.getText\(\)\)/);
  assert.match(source, /document\.version === request\.version/);
  assert.ok((source.match(/this\.liveDocument\(request\)/g) || []).length >= 4);
  assert.doesNotMatch(source, /Save the artifact to run exact shared Tiinex validation/);
});

await test('native Quick Fixes are diagnostic-scoped and preserve deterministic shared-core replacement bytes', async () => {
  const fs = await import('node:fs/promises');
  const source = await fs.readFile(path.resolve(HERE, '..', 'src', 'diagnostics.ts'), 'utf8');
  assert.match(source, /item\.diagnosticCodes/);
  assert.match(source, /action\.diagnostics = matchingDiagnostics/);
  assert.match(source, /Document bytes changed after Tiinex qualification/);
  assert.match(source, /item\.replacementMarkdown/);
  assert.match(source, /deterministic-anchor/);
});

await test('pointerless package builder projects exact workspace-carrier args without route semantics', async () => {
  const fs = await import('node:fs/promises');
  const os = await import('node:os');
  const scratch = await fs.mkdtemp(path.join(os.tmpdir(), 'tiinex-vscode-pointerless-test-'));
  try {
    const projectedFilename = 'tiinex-vscode-001-6-2-1-2-1-1-1-1-1-1-1-1-1-1.handoff-package.zip';
    const args = await workspaceCarrierArgs([
      { workspaceId: 'vscode', root: '/repo-vscode', workspaceTargetPath: 'extensions/tiinex' },
      { workspaceId: 'site', root: '/repo-site', workspaceTargetPath: '.' }
    ], scratch, projectedFilename);
    assert.deepEqual(args.slice(0, 5), ['/repo-site', '--carrier-mode', 'workspace', '--workspace-id', 'site']);
    assert.equal(args.includes('--handoff'), false);
    assert.equal(args.includes('--route'), false);
    assert.equal(args[args.indexOf('--tooling-bootstrap') + 1], 'embedded');
    assert.equal(args[args.indexOf('--projected-filename') + 1], projectedFilename);
    const descriptor = JSON.parse(await fs.readFile(args[args.indexOf('--workspace-roots') + 1], 'utf8'));
    assert.deepEqual(descriptor, { workspaces: [{ id: 'vscode', root: '/repo-vscode' }] });
    const targets = JSON.parse(await fs.readFile(args[args.indexOf('--workspace-targets') + 1], 'utf8'));
    assert.deepEqual(targets, [{ workspaceId: 'vscode', path: 'extensions/tiinex' }]);
  } finally { await fs.rm(scratch, { recursive: true, force: true }); }
});

await test('native package and authoring wrappers preserve exact shared CLI operation shapes', async () => {
  const runtime = { root: '/runtime', entrypoint: '/runtime/tiinex-portable.mjs', nodeExecutable: 'node', dispose: async () => undefined };
  const fx = fakeRunner((key) => {
    if (key.includes('project-workspace-package-sources')) return { code: 0, stdout: JSON.stringify({ status: 'ready', candidates: [] }), stderr: '' };
    if (key.includes('project-handoff-endpoints')) return { code: 0, stdout: JSON.stringify({ status: 'ready', workspaceId: 'business', candidates: [{ id: 'business::.topics/roles/loom.role.trace.md', target: 'business::.topics/roles/loom.role.trace.md', reference: 'business::.topics/roles/loom.role.trace.md', kind: 'role', label: 'Loom', workspaceId: 'business', artifactPath: '.topics/roles/loom.role.trace.md', schemaId: 'tiinex.party.role.v1', qualification: 'qualified-exact' }] }), stderr: '' };
    if (key.includes('create-local-draft')) return { code: 0, stdout: JSON.stringify({ status: 'created-local', draft: { markdown: '# sealed' }, findingSummary: { counts: { error: 0 } } }), stderr: '' };
    return undefined;
  });
  await projectWorkspacePackageSources(runtime, ['/repo-a', '/repo-b'], fx.runner);
  assert.deepEqual(fx.calls[0].args.slice(1), ['project-workspace-package-sources', '/repo-a', '/repo-b', '--compact']);
  const endpoints = await projectHandoffEndpoints(runtime, '/repo-business', 'business', fx.runner);
  const endpointArgs = fx.calls[1].args;
  assert.deepEqual(endpointArgs.slice(1), ['project-handoff-endpoints', '/repo-business', '--workspace-id', 'business', '--compact']);
  assert.equal(endpoints.candidates[0].reference, 'business::.topics/roles/loom.role.trace.md');
  await createArtifactDraft(runtime, 'tiinex.task.v1', '/repo-a', '.topics/root-task.trace.md', 'Root', { Summary: 'Root' }, null, 'create-artifact', fx.runner);
  const rootArgs = fx.calls[2].args;
  assert.equal(rootArgs[rootArgs.indexOf('--schema') + 1], 'tiinex.task.v1');
  assert.equal(rootArgs[rootArgs.indexOf('--transition') + 1], 'create-artifact');
  assert.equal(rootArgs.includes('--parent'), false);
  await createArtifactDraft(runtime, 'tiinex.task.v1', '/repo-a', '.topics/child-task.trace.md', 'Child', { Summary: 'Child' }, { path: 'parent' }, 'continue-from-record', fx.runner);
  const childArgs = fx.calls[3].args;
  assert.equal(childArgs[childArgs.indexOf('--schema') + 1], 'tiinex.task.v1');
  assert.equal(childArgs[childArgs.indexOf('--transition') + 1], 'continue-from-record');
  assert.equal(childArgs.includes('--parent'), true);
});


await test('multi-root package-source projection passes every opened root and Git fact to one shared-core call', async () => {
  const runtime = { root: '/runtime', entrypoint: '/runtime/tiinex-portable.mjs', nodeExecutable: 'node', dispose: async () => undefined };
  const fx = fakeRunner(() => ({ code: 0, stdout: JSON.stringify({ status: 'ready', candidates: [] }), stderr: '' }));
  const facts = [
    { id: 'C:/repos/business', root: 'C:/repos/business', repository: 'git@github.com:Tiinex/business.git', branch: 'master', clean: true },
    { id: 'C:/repos/site', root: 'C:/repos/site', repository: 'git@github.com:Tiinex/site.git', branch: 'refactor', clean: true }
  ];
  await projectWorkspacePackageSources(runtime, ['C:/repos/business', 'C:/repos/site'], facts, fx.runner);
  const args = fx.calls[0].args;
  assert.deepEqual(args.slice(1, 4), ['project-workspace-package-sources', 'C:/repos/business', 'C:/repos/site']);
  const descriptorPath = args[args.indexOf('--repositories') + 1];
  const fs = await import('node:fs/promises');
  await assert.rejects(fs.access(descriptorPath));
});


await test('operator-context wrapper sends all roots plus explicit root and repository descriptors to shared Tooling', async () => {
  const runtime = { root: '/runtime', entrypoint: '/runtime/tiinex-portable.mjs', nodeExecutable: 'node', dispose: async () => undefined };
  let rootsDescriptor = null;
  let repositoriesDescriptor = null;
  let descriptorDirectory = '';
  const fs = await import('node:fs/promises');
  const fx = fakeRunner(async (_key, _index, call) => {
    assert.equal(call.args[1], 'project-operator-context');
    assert.deepEqual(call.args.slice(2, 4), ['/repo-business', '/repo-site']);
    const rootsPath = call.args[call.args.indexOf('--workspace-roots') + 1];
    descriptorDirectory = path.dirname(rootsPath);
    rootsDescriptor = JSON.parse(await fs.readFile(rootsPath, 'utf8'));
    repositoriesDescriptor = JSON.parse(await fs.readFile(call.args[call.args.indexOf('--repositories') + 1], 'utf8'));
    return { code: 0, stdout: JSON.stringify({ status: 'ready', roots: [], workspaces: [], handoffLeaves: [], endpoints: [], findings: [] }), stderr: '' };
  });
  const repositories = [{ id: '/repo-business', root: '/repo-business', repository: 'git@github.com:Tiinex/business.git' }];
  await projectOperatorContext(runtime, ['/repo-business', '/repo-site'], repositories, fx.runner);
  assert.deepEqual(rootsDescriptor, { roots: [{ id: '/repo-business', root: '/repo-business' }, { id: '/repo-site', root: '/repo-site' }] });
  assert.deepEqual(repositoriesDescriptor, repositories);
  await assert.rejects(fs.access(descriptorDirectory));
});

await test('staged-validation wrapper carries only explicit staged paths and cleans its descriptor', async () => {
  const runtime = { root: '/runtime', entrypoint: '/runtime/tiinex-portable.mjs', nodeExecutable: 'node', dispose: async () => undefined };
  const fs = await import('node:fs/promises');
  let descriptorPath = '';
  const fx = fakeRunner(async (_key, _index, call) => {
    assert.equal(call.args[1], 'project-staged-validation');
    assert.equal(call.args[2], '/repo');
    descriptorPath = call.args[call.args.indexOf('--staged') + 1];
    assert.deepEqual(JSON.parse(await fs.readFile(descriptorPath, 'utf8')), { stagedPaths: ['.topics/current.trace.md', 'README.md'] });
    return { code: 0, stdout: JSON.stringify({ status: 'ready', state: 'clean', stagedPaths: [], stagedTiinexPaths: [], ignoredStagedPaths: [], closurePaths: [], findings: [], blockingFindingCount: 0 }), stderr: '' };
  });
  await projectStagedValidation(runtime, '/repo', ['.topics/current.trace.md', 'README.md'], fx.runner);
  await assert.rejects(fs.access(path.dirname(descriptorPath)));
});

await test('staged path discovery is exact, null-delimited, and slash-normalized before shared validation', async () => {
  const fx = fakeRunner({ 'git diff --cached --name-only --diff-filter=ACMR -z': { code: 0, stdout: '.topics\\a.trace.md\0README.md\0', stderr: '' } });
  assert.deepEqual(await listStagedPaths('/repo', fx.runner), ['.topics/a.trace.md', 'README.md']);
  assert.deepEqual(fx.calls[0].args, ['diff', '--cached', '--name-only', '--diff-filter=ACMR', '-z']);
});

await test('Receive dirty-worktree helpers stash, discard, commit, and stage without touching ignored files through git clean -x', async () => {
  const fs = await import('node:fs/promises');
  const os = await import('node:os');
  const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'tiinex-receive-dirty-'));
  await fs.mkdir(path.join(tmp, 'tools'), { recursive: true });
  const helper = path.join(tmp, 'tools', 'tiinex-commit-message.mjs');
  await fs.writeFile(helper, '// fixture');
  const sha = 'c'.repeat(40);
  try {
    let dirty = true;
    const stashFx = fakeRunner((key) => {
      if (key === 'git rev-parse --show-toplevel') return { code: 0, stdout: tmp + '\n', stderr: '' };
      if (key === 'git config --get remote.origin.url') return { code: 0, stdout: 'git@github.com:Tiinex/core.git\n', stderr: '' };
      if (key === 'git symbolic-ref --quiet --short HEAD') return { code: 0, stdout: 'refactor\n', stderr: '' };
      if (key.startsWith('git status --porcelain')) return { code: 0, stdout: dirty ? ' M src/a.ts\0?? note.txt\0' : '', stderr: '' };
      if (key.startsWith('git stash push ')) { dirty = false; return { code: 0, stdout: 'Saved\n', stderr: '' }; }
      return { code: 0, stdout: '', stderr: '' };
    });
    await stashWorkingTree(tmp, stashFx.runner);
    assert.ok(stashFx.calls.some((call) => call.args[0] === 'stash' && call.args.includes('--include-untracked')));

    dirty = true;
    const discardFx = fakeRunner((key) => {
      if (key === 'git rev-parse --show-toplevel') return { code: 0, stdout: tmp + '\n', stderr: '' };
      if (key === 'git config --get remote.origin.url') return { code: 0, stdout: 'git@github.com:Tiinex/core.git\n', stderr: '' };
      if (key === 'git symbolic-ref --quiet --short HEAD') return { code: 0, stdout: 'refactor\n', stderr: '' };
      if (key.startsWith('git status --porcelain')) return { code: 0, stdout: dirty ? ' M src/a.ts\0' : '', stderr: '' };
      if (key === 'git clean -fd') { dirty = false; return { code: 0, stdout: '', stderr: '' }; }
      return { code: 0, stdout: '', stderr: '' };
    });
    await discardWorkingTree(tmp, discardFx.runner);
    assert.ok(discardFx.calls.some((call) => call.args.join(' ') === 'clean -fd'));
    assert.equal(discardFx.calls.some((call) => call.args.includes('-x')), false);

    dirty = true;
    const commitFx = fakeRunner((key) => {
      if (key === 'git rev-parse --show-toplevel') return { code: 0, stdout: tmp + '\n', stderr: '' };
      if (key === 'git config --get remote.origin.url') return { code: 0, stdout: 'git@github.com:Tiinex/core.git\n', stderr: '' };
      if (key === 'git symbolic-ref --quiet --short HEAD') return { code: 0, stdout: 'refactor\n', stderr: '' };
      if (key.startsWith('git status --porcelain')) return { code: 0, stdout: dirty ? ' M src/a.ts\0' : '', stderr: '' };
      if (key === 'git diff --cached --quiet') return { code: 1, stdout: '', stderr: '' };
      if (key.startsWith('node ' + helper)) return { code: 0, stdout: 'Tiinex: preserve local work\n', stderr: '' };
      if (key.startsWith('git commit -m ')) { dirty = false; return { code: 0, stdout: '', stderr: '' }; }
      if (key === 'git rev-parse HEAD') return { code: 0, stdout: sha + '\n', stderr: '' };
      return { code: 0, stdout: '', stderr: '' };
    });
    const committed = await commitWorkingTree(tmp, 'node', commitFx.runner);
    assert.equal(committed.commitSha, sha);

    const stageFx = fakeRunner((key) => key === 'git diff --cached --quiet' ? { code: 1, stdout: '', stderr: '' } : { code: 0, stdout: '', stderr: '' });
    assert.equal(await stageLandingChanges(tmp, [], stageFx.runner), true);
    assert.deepEqual(stageFx.calls.map((call) => call.args.join(' ')), ['add -A', 'diff --cached --quiet']);
  } finally { await fs.rm(tmp, { recursive: true, force: true }); }
});

await test('landing stage preserves pre-landing ignored files even when the incoming ignore rules stop ignoring them', async () => {
  const fs = await import('node:fs/promises');
  const os = await import('node:os');
  const { execFile } = await import('node:child_process');
  const { promisify } = await import('node:util');
  const run = promisify(execFile);
  const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'tiinex-preserved-ignore-'));
  const git = async (...args) => (await run('git', args, { cwd: tmp })).stdout;
  try {
    await git('init', '-q');
    await git('config', 'user.name', 'Tiinex Test');
    await git('config', 'user.email', 'tiinex@example.invalid');
    await fs.writeFile(path.join(tmp, '.gitignore'), '.env\n', 'utf8');
    await fs.writeFile(path.join(tmp, 'tracked.txt'), 'before\n', 'utf8');
    await git('add', '-A');
    await git('commit', '-q', '-m', 'baseline');
    await fs.writeFile(path.join(tmp, '.env'), 'SECRET=preserve-me\n', 'utf8');
    await fs.writeFile(path.join(tmp, '.gitignore'), '# incoming snapshot no longer ignores .env\n', 'utf8');
    await fs.writeFile(path.join(tmp, 'tracked.txt'), 'after\n', 'utf8');

    assert.equal(await stageLandingChanges(tmp, ['.env']), true);
    const staged = (await git('diff', '--cached', '--name-only')).trim().split(/\r?\n/).filter(Boolean).sort();
    assert.deepEqual(staged, ['.gitignore', 'tracked.txt']);
    const status = await git('status', '--porcelain=v1', '--untracked-files=all');
    assert.match(status, /\?\? \.env/);
    assert.equal(await fs.readFile(path.join(tmp, '.env'), 'utf8'), 'SECRET=preserve-me\n');
  } finally { await fs.rm(tmp, { recursive: true, force: true }); }
});

await test('checkout-only payload eligibility requires a clean exact HEAD published to upstream', async () => {
  const sha = 'c'.repeat(40);
  const clean = fakeRunner((key) => {
    if (key === 'git rev-parse --show-toplevel') return { code: 0, stdout: '/repo\n', stderr: '' };
    if (key === 'git config --get remote.origin.url') return { code: 0, stdout: 'git@github.com:Tiinex/site.git\n', stderr: '' };
    if (key === 'git symbolic-ref --quiet --short HEAD') return { code: 0, stdout: 'main\n', stderr: '' };
    if (key.startsWith('git status --porcelain')) return { code: 0, stdout: '', stderr: '' };
    if (key === 'git rev-parse --verify HEAD^{commit}') return { code: 0, stdout: `${sha}\n`, stderr: '' };
    if (key === 'git rev-parse --verify @{u}^{commit}') return { code: 0, stdout: `${sha}\n`, stderr: '' };
    return { code: 0, stdout: '', stderr: '' };
  });
  assert.deepEqual(await payloadCheckoutEligibility('/repo', clean.runner), { eligible: true, reason: 'qualified-exact-checkout', repository: 'git@github.com:Tiinex/site.git', ref: sha, branch: 'main' });

  const dirty = fakeRunner((key) => {
    if (key === 'git rev-parse --show-toplevel') return { code: 0, stdout: '/repo\n', stderr: '' };
    if (key === 'git config --get remote.origin.url') return { code: 0, stdout: 'git@github.com:Tiinex/site.git\n', stderr: '' };
    if (key === 'git symbolic-ref --quiet --short HEAD') return { code: 0, stdout: 'main\n', stderr: '' };
    if (key.startsWith('git status --porcelain')) return { code: 0, stdout: ' M src/a.ts\0', stderr: '' };
    return { code: 0, stdout: '', stderr: '' };
  });
  assert.equal((await payloadCheckoutEligibility('/repo', dirty.runner)).reason, 'workspace-is-dirty');
  assert.equal(dirty.calls.some((call) => call.args.join(' ') === 'rev-parse --verify HEAD^{commit}'), false);
});

await test('Git safety helpers honor .gitignore for future paths and report dirty paths exactly once', async () => {
  const fs = await import('node:fs/promises');
  const os = await import('node:os');
  const { execFile } = await import('node:child_process');
  const { promisify } = await import('node:util');
  const run = promisify(execFile);
  const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'tiinex-git-safety-'));
  const git = async (...args) => (await run('git', args, { cwd: tmp })).stdout;
  try {
    await git('init', '-q');
    await git('config', 'user.name', 'Tiinex Test');
    await git('config', 'user.email', 'tiinex@example.invalid');
    await fs.writeFile(path.join(tmp, '.gitignore'), 'ignored/\n*.secret\n', 'utf8');
    await fs.writeFile(path.join(tmp, 'tracked.txt'), 'base\n', 'utf8');
    await fs.writeFile(path.join(tmp, 'staged.txt'), 'base\n', 'utf8');
    await git('add', '-A');
    await git('commit', '-q', '-m', 'baseline');

    assert.deepEqual(await checkIgnoredPaths(tmp, ['ignored/future.txt', 'future.secret', 'visible.txt']), ['future.secret', 'ignored/future.txt']);

    await fs.writeFile(path.join(tmp, 'tracked.txt'), 'working\n', 'utf8');
    await fs.writeFile(path.join(tmp, 'staged.txt'), 'staged\n', 'utf8');
    await git('add', 'staged.txt');
    await fs.writeFile(path.join(tmp, 'new.txt'), 'untracked\n', 'utf8');
    assert.deepEqual(await dirtyWorkingTreePaths(tmp), ['new.txt', 'staged.txt', 'tracked.txt']);
  } finally { await fs.rm(tmp, { recursive: true, force: true }); }
});

await test('Git-native Incoming merge leaves real unmerged index entries for VS Code Merge Editor', async () => {
  const fs = await import('node:fs/promises');
  const os = await import('node:os');
  const { execFile } = await import('node:child_process');
  const { promisify } = await import('node:util');
  const run = promisify(execFile);
  const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'tiinex-git-conflict-'));
  const git = async (...args) => (await run('git', args, { cwd: tmp })).stdout;
  try {
    await git('init', '-q');
    await git('config', 'user.name', 'Tiinex Test');
    await git('config', 'user.email', 'tiinex@example.invalid');
    await fs.writeFile(path.join(tmp, 'conflict.txt'), 'base\n', 'utf8');
    await git('add', '-A');
    await git('commit', '-q', '-m', 'base');
    const baseBranch = (await git('branch', '--show-current')).trim();

    await git('switch', '-q', '-c', 'incoming');
    await fs.writeFile(path.join(tmp, 'conflict.txt'), 'incoming\n', 'utf8');
    await git('commit', '-qam', 'incoming');
    const incomingSha = (await git('rev-parse', 'HEAD')).trim();

    await git('switch', '-q', baseBranch);
    await fs.writeFile(path.join(tmp, 'conflict.txt'), 'local\n', 'utf8');
    await git('commit', '-qam', 'local');

    const result = await mergeCommitNoCommit(tmp, incomingSha);
    assert.deepEqual(result.conflicts, ['conflict.txt']);
    assert.equal(result.alreadyUpToDate, false);
    await fs.access(path.join(tmp, '.git', 'MERGE_HEAD'));
    const unresolved = (await git('diff', '--name-only', '--diff-filter=U')).trim().split(/\r?\n/).filter(Boolean);
    assert.deepEqual(unresolved, ['conflict.txt']);
    await git('merge', '--abort');
  } finally { await fs.rm(tmp, { recursive: true, force: true }); }
});

await test('branch preflight rejects dirty worktrees before branch mutation', async () => {
  const fx = fakeRunner((key) => {
    if (key === 'git rev-parse --show-toplevel') return { code: 0, stdout: '/repo\n', stderr: '' };
    if (key === 'git config --get remote.origin.url') return { code: 0, stdout: 'git@github.com:Tiinex/site.git\n', stderr: '' };
    if (key === 'git symbolic-ref --quiet --short HEAD') return { code: 0, stdout: 'main\n', stderr: '' };
    if (key.startsWith('git status --porcelain')) return { code: 0, stdout: ' M source.ts\0', stderr: '' };
    return { code: 0, stdout: '', stderr: '' };
  });
  await rejectsCode(() => preflightExistingLocalBranch('/repo', 'refactor', fx.runner), 'tiinex.git.branch-switch-dirty-worktree');
  assert.equal(fx.calls.some((call) => call.args[0] === 'switch'), false);
});

await test('landing commit uses a trusted supplied message and exact push rejects unrelated ahead commits', async () => {
  const fs = await import('node:fs/promises');
  const os = await import('node:os');
  const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'tiinex-landing-commit-'));
  const sha = 'a'.repeat(40);
  const fx = fakeRunner((key) => {
    if (key === 'git rev-parse --show-toplevel') return { code: 0, stdout: tmp + '\n', stderr: '' };
    if (key === 'git config --get remote.origin.url') return { code: 0, stdout: 'git@github.com:Tiinex/site.git\n', stderr: '' };
    if (key === 'git symbolic-ref --quiet --short HEAD') return { code: 0, stdout: 'refactor\n', stderr: '' };
    if (key.startsWith('git status --porcelain')) return { code: 0, stdout: ' M src/a.ts\0', stderr: '' };
    if (key === 'git rev-parse --abbrev-ref --symbolic-full-name @{u}') return { code: 0, stdout: 'origin/refactor\n', stderr: '' };
    if (key === 'git rev-list --count @{u}..HEAD') return { code: 0, stdout: '0\n', stderr: '' };
    if (key === 'git rev-list --count HEAD..@{u}') return { code: 0, stdout: '0\n', stderr: '' };
    if (key === 'git diff --cached --quiet') return { code: 1, stdout: '', stderr: '' };
    if (key === 'git rev-parse HEAD') return { code: 0, stdout: sha + '\n', stderr: '' };
    return { code: 0, stdout: '', stderr: '' };
  });
  try {
    const commit = await stageLandingCommit(tmp, 'Tiinex Receive: site', [], fx.runner);
    assert.equal(commit.commitSha, sha);
    assert.equal(commit.message, 'Tiinex Receive: site');
    assert.equal(fx.calls.some((call) => call.command === 'node'), false);
    const pushFx = fakeRunner((key) => {
      if (key === 'git symbolic-ref --quiet --short HEAD') return { code: 0, stdout: 'refactor\n', stderr: '' };
      if (key === 'git rev-parse --abbrev-ref --symbolic-full-name @{u}') return { code: 0, stdout: 'origin/refactor\n', stderr: '' };
      if (key === 'git rev-parse HEAD') return { code: 0, stdout: sha + '\n', stderr: '' };
      if (key === 'git rev-list --count @{u}..HEAD') return { code: 0, stdout: '2\n', stderr: '' };
      if (key === 'git rev-list --count HEAD..@{u}') return { code: 0, stdout: '0\n', stderr: '' };
      return { code: 0, stdout: '', stderr: '' };
    });
    await rejectsCode(() => pushExactLandingCommit(tmp, commit, pushFx.runner), 'tiinex.git.push-unrelated-ahead:2:0');
    assert.equal(pushFx.calls.some((call) => call.args[0] === 'push'), false);
  } finally { await fs.rm(tmp, { recursive: true, force: true }); }
});

await test('commit message delegates to repository helper instead of reimplementing derivation', async () => {
  const root = path.resolve(HERE, '..');
  const helper = path.join(root, 'tools', 'tiinex-commit-message.mjs');
  const { runner, calls } = fakeRunner((key) => key.includes(helper) ? { code: 0, stdout: 'Tiinex: qualified message\n', stderr: '' } : undefined);
  // The real helper is not present in this extension repo, so point at a temporary repository-like path containing one.
  const fs = await import('node:fs/promises');
  const os = await import('node:os');
  const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'tiinex-commit-test-'));
  await fs.mkdir(path.join(tmp, 'tools'), { recursive: true });
  await fs.writeFile(path.join(tmp, 'tools', 'tiinex-commit-message.mjs'), '// fixture');
  const actualHelper = path.join(tmp, 'tools', 'tiinex-commit-message.mjs');
  const fx = fakeRunner((key) => key.includes(actualHelper) ? { code: 0, stdout: 'Tiinex: qualified message\n', stderr: '' } : undefined);
  try {
    assert.equal(await generateTiinexCommitMessage(tmp, 'node', fx.runner), 'Tiinex: qualified message');
    assert.deepEqual(fx.calls[0].args, [actualHelper]);
    assert.equal(fx.calls[0].env?.ELECTRON_RUN_AS_NODE, '1');
  } finally { await fs.rm(tmp, { recursive: true, force: true }); }
  assert.equal(calls.length, 0);
});

await test('Stage Commit Push fails closed on detached HEAD', async () => {
  const fx = fakeRunner({ 'git symbolic-ref --quiet --short HEAD': { code: 1, stdout: '', stderr: '' } });
  await rejectsCode(() => stageCommitPush('/repo', 'node', fx.runner), 'tiinex.git.detached-head');
  assert.equal(fx.calls.length, 1);
});

await test('Stage Commit Push fails closed when upstream is missing', async () => {
  const fx = fakeRunner({
    'git symbolic-ref --quiet --short HEAD': { code: 0, stdout: 'main\n', stderr: '' },
    'git rev-parse --abbrev-ref --symbolic-full-name @{u}': { code: 1, stdout: '', stderr: '' }
  });
  await rejectsCode(() => stageCommitPush('/repo', 'node', fx.runner), 'tiinex.git.missing-upstream');
  assert.equal(fx.calls.length, 2);
});

await test('Stage Commit Push fails closed when staging yields no changes', async () => {
  const fx = fakeRunner({
    'git symbolic-ref --quiet --short HEAD': { code: 0, stdout: 'main\n', stderr: '' },
    'git rev-parse --abbrev-ref --symbolic-full-name @{u}': { code: 0, stdout: 'origin/main\n', stderr: '' },
    'git add -A': { code: 0, stdout: '', stderr: '' },
    'git diff --cached --quiet': { code: 0, stdout: '', stderr: '' }
  });
  await rejectsCode(() => stageCommitPush('/repo', 'node', fx.runner), 'tiinex.git.no-staged-changes');
  assert.equal(fx.calls.some((call) => call.args[0] === 'push'), false);
});


await test('Stage Commit Push validates the staged Tiinex path set before commit-message derivation or commit', async () => {
  const fs = await import('node:fs/promises');
  const os = await import('node:os');
  const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'tiinex-staged-gate-test-'));
  await fs.mkdir(path.join(tmp, 'tools'), { recursive: true });
  const helper = path.join(tmp, 'tools', 'tiinex-commit-message.mjs');
  await fs.writeFile(helper, '// fixture');
  const fx = fakeRunner((key) => {
    if (key === 'git symbolic-ref --quiet --short HEAD') return { code: 0, stdout: 'main\n', stderr: '' };
    if (key === 'git rev-parse --abbrev-ref --symbolic-full-name @{u}') return { code: 0, stdout: 'origin/main\n', stderr: '' };
    if (key === 'git diff --cached --quiet') return { code: 1, stdout: '', stderr: '' };
    if (key === 'git diff --cached --name-only --diff-filter=ACMR -z') return { code: 0, stdout: '.topics/current.trace.md\0notes.txt\0', stderr: '' };
    if (key.startsWith('node ' + helper)) return { code: 0, stdout: 'Tiinex: gated\n', stderr: '' };
    if (key === 'git rev-parse HEAD') return { code: 0, stdout: 'b'.repeat(40) + '\n', stderr: '' };
    return { code: 0, stdout: '', stderr: '' };
  });
  const order = [];
  try {
    await stageCommitPush(tmp, 'node', fx.runner, async (paths) => { order.push('validate'); assert.deepEqual(paths, ['.topics/current.trace.md', 'notes.txt']); });
    const commands = fx.calls.map((call) => `${call.command} ${call.args.join(' ')}`);
    assert.equal(order[0], 'validate');
    assert(commands.indexOf('git diff --cached --name-only --diff-filter=ACMR -z') < commands.findIndex((item) => item.startsWith('node ')));
    assert(commands.findIndex((item) => item.startsWith('node ')) < commands.findIndex((item) => item.startsWith('git commit -m ')));
  } finally { await fs.rm(tmp, { recursive: true, force: true }); }
});

await test('Stage Commit Push uses helper after staging and pushes only after successful commit', async () => {
  const fs = await import('node:fs/promises');
  const os = await import('node:os');
  const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'tiinex-push-test-'));
  await fs.mkdir(path.join(tmp, 'tools'), { recursive: true });
  const helper = path.join(tmp, 'tools', 'tiinex-commit-message.mjs');
  await fs.writeFile(helper, '// fixture');
  const fx = fakeRunner((key) => {
    if (key === 'git symbolic-ref --quiet --short HEAD') return { code: 0, stdout: 'main\n', stderr: '' };
    if (key === 'git rev-parse --abbrev-ref --symbolic-full-name @{u}') return { code: 0, stdout: 'origin/main\n', stderr: '' };
    if (key === 'git diff --cached --quiet') return { code: 1, stdout: '', stderr: '' };
    if (key.startsWith('node ' + helper)) return { code: 0, stdout: 'Tiinex: one\n\nBody', stderr: '' };
    return { code: 0, stdout: '', stderr: '' };
  });
  try {
    const result = await stageCommitPush(tmp, 'node', fx.runner);
    assert.equal(result.branch, 'main');
    assert.equal(result.upstream, 'origin/main');
    assert.equal(result.message, 'Tiinex: one\n\nBody');
    const commands = fx.calls.map((call) => `${call.command} ${call.args.join(' ')}`);
    assert(commands.indexOf('git add -A') < commands.findIndex((item) => item.startsWith('node ')));
    assert(commands.findIndex((item) => item.startsWith('git commit -m ')) < commands.indexOf('git push'));
  } finally { await fs.rm(tmp, { recursive: true, force: true }); }
});

console.log(`\n${count}/${count} Tiinex VS Code bridge core cases passed.`);
