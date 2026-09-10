import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDiscoverySessionEvent, isHandoffPackagePath, waitForStableProbe } from '../dist/core/stableFile.js';
import { workspaceCarrierArgs } from '../dist/core/packageArgs.js';
import { exactRouteByKey, exactWorkspaceIds, routeChoiceKey } from '../dist/core/operatorModel.js';
import { handoffAuthoringDefaults } from '../dist/core/operatorUx.js';
import { presentOperatorError } from '../dist/core/operatorError.js';
import { LatestWinsKeyedQueue } from '../dist/core/latestWinsQueue.js';
import { canonicalRepositoryRoot, relativeRepositoryPath, repositoryContainsPath, sameRepositoryRoot } from '../dist/core/repositoryPath.js';
import { ignoredPathCollisions, safeRelativePath, safeTarget } from '../dist/core/paths.js';
import { preferredRepositoryParent, routesPreferredForRole } from '../dist/core/receiveUx.js';
import { alphabeticalWorkspaceIds, artifactsForLineageMode, currentRoleArtifacts, currentRoleChoices, makeIndexedArtifact } from '../dist/core/artifactTree.js';
import { receivedHandoffContext, withWorkspaceRoots } from '../dist/core/receivedHandoff.js';
import { operatorMatchedWorkspaceIds, resolvePrioritizedWorkspaceDuplicates } from '../dist/core/sourceSelection.js';
import { comparePackageRecency, inheritedOutgoingLabel } from '../dist/core/outgoingUx.js';
import { projectArtifactAuthoringModel } from '../dist/core/artifactAuthoringModel.js';
import { planWorkspaceSession, validateWorkspaceTargetMapping } from '../dist/core/workspaceSession.js';
import { checkIgnoredPaths, commitWorkingTree, dirtyWorkingTreePaths, discardWorkingTree, generateTiinexCommitMessage, listStagedPaths, mergeCommitNoCommit, payloadCheckoutEligibility, preflightExistingLocalBranch, pushExactLandingCommit, stageCommitPush, stageLandingChanges, stageLandingCommit, stashWorkingTree } from '../dist/host/git.js';
import { preferredNodeExecutable } from '../dist/host/nodeExecutable.js';
import { compareIncomingWorkspaceToLocal, createHandoffDraft, inspectArtifactCreationContract, parseBootstrapDescriptor, prepareBundledRuntime, projectArtifactSchemaGuide, runTiinexJson, projectEditorAssistanceText, projectHandoffAuthoringPlan, projectHandoffEndpoints, projectOperatorContext, projectStagedValidation, projectWorkspaceLanding, projectWorkspacePackageSources } from '../dist/tiinex/bootstrap.js';

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
  assert.equal(inheritedOutgoingLabel('business-001-1-2-anchor-to-anchor.handoff-package.zip', '001-1-2'), 'business-001-1-2');
  assert.equal(inheritedOutgoingLabel('001-3-anchor-to-anchor.handoff-package.zip', '001-3'), '001-3');
  const items = [
    { filename: 'older.handoff-package.zip', mtimeMs: 10 },
    { filename: 'newer-b.handoff-package.zip', mtimeMs: 20 },
    { filename: 'newer-a.handoff-package.zip', mtimeMs: 20 }
  ].sort(comparePackageRecency);
  assert.deepEqual(items.map((item) => item.filename), ['newer-a.handoff-package.zip', 'newer-b.handoff-package.zip', 'older.handoff-package.zip']);
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

await test('extension contributes stable Discovery, Incoming and Outgoing TreeView actions', async () => {
  const fs = await import('node:fs/promises');
  const manifest = JSON.parse(await fs.readFile(path.resolve(HERE, '..', 'package.json'), 'utf8'));
  const container = manifest.contributes?.viewsContainers?.activitybar?.find((item) => item.id === 'tiinex');
  assert.equal(container?.title, 'Tiinex');
  assert.equal(container?.icon, 'media/tiinex.svg');
  const views = manifest.contributes?.views?.tiinex || [];
  assert.deepEqual(views.map((item) => item.id), ['tiinex.discovery', 'tiinex.incoming', 'tiinex.outgoing']);
  assert.equal(views.some((item) => item.type === 'webview'), false);
  const commands = new Map((manifest.contributes?.commands || []).map((item) => [item.command, item]));
  assert.equal(commands.get('tiinex.discovery.setIncoming')?.icon, '$(arrow-down)');
  assert.equal(commands.get('tiinex.outgoing.new')?.icon, '$(add)');
  assert.equal(commands.get('tiinex.outgoing.selectWorkspaces')?.icon, '$(list-selection)');
  assert.equal(commands.get('tiinex.outgoing.package')?.title, 'Pack');
  assert.equal(commands.get('tiinex.outgoing.package')?.icon, '$(package)');
  assert.equal(commands.get('tiinex.incoming.merge')?.title, 'Merge');
  assert.equal(commands.get('tiinex.incoming.merge')?.icon, '$(git-merge)');
  assert.equal(commands.get('tiinex.incoming.replace')?.title, 'Replace');
  assert.equal(commands.get('tiinex.incoming.replace')?.icon, '$(replace-all)');
  assert.equal(commands.get('tiinex.discovery.toggleDelta')?.icon, '$(diff)');
  assert.equal(commands.get('tiinex.incoming.toggleDelta')?.icon, '$(diff)');
  assert.equal(commands.get('tiinex.outgoing.copyTransportText')?.icon, '$(copy)');
  const titleMenus = manifest.contributes?.menus?.['view/title'] || [];
  const titleCommands = new Set(titleMenus.map((item) => item.command));
  for (const command of ['tiinex.discovery.toggleDelta', 'tiinex.discovery.selectFolder', 'tiinex.discovery.refresh', 'tiinex.incoming.toggleDelta', 'tiinex.incoming.refresh', 'tiinex.outgoing.new', 'tiinex.outgoing.selectWorkspaces', 'tiinex.outgoing.selectFolder', 'tiinex.outgoing.refresh']) assert.equal(titleCommands.has(command), true);
  assert.equal(titleCommands.has('tiinex.outgoing.package'), false);
  assert.equal(titleCommands.has('tiinex.incoming.mergeSelected'), false);
  assert.equal(titleCommands.has('tiinex.outgoing.newBlank'), false);
  assert.equal(titleCommands.has('tiinex.outgoing.newFromIncoming'), false);
  const groupOrder = (command) => Number(String(titleMenus.find((item) => item.command === command)?.group || '').split('@')[1]);
  assert.ok(groupOrder('tiinex.discovery.toggleProjection') < groupOrder('tiinex.discovery.selectFolder'));
  assert.ok(groupOrder('tiinex.discovery.toggleLineage') < groupOrder('tiinex.discovery.selectFolder'));
  assert.ok(groupOrder('tiinex.discovery.selectFolder') < groupOrder('tiinex.discovery.refresh'));
  assert.ok(groupOrder('tiinex.outgoing.new') < groupOrder('tiinex.outgoing.selectWorkspaces'));
  assert.ok(groupOrder('tiinex.outgoing.selectWorkspaces') < groupOrder('tiinex.outgoing.toggleProjection'));
  assert.ok(groupOrder('tiinex.outgoing.toggleLineage') < groupOrder('tiinex.outgoing.selectFolder'));
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
  const postLandingStart = source.indexOf('async function postLandingGit');
  const stageDisabledGate = source.indexOf("if (stagePolicy() === 'no')", postLandingStart);
  const stageLandingCall = source.indexOf('stageLandingChanges(root, protectedPaths)', postLandingStart);
  assert.ok(stageDisabledGate >= 0 && stageLandingCall > stageDisabledGate);
  assert.match(source, /Post-landing policies: stage=\$\{stagePolicy\(\)\}, commit=\$\{policy\('commit'\)\}, push=\$\{policy\('push'\)\}/);
  assert.match(source, /Select every Workspace Tiinex may replace/);
  assert.match(source, /canPickMany: true/);
  assert.match(source, /trustedLandingCommitMessage/);
  assert.doesNotMatch(source, /generateTiinexCommitMessage/);
  assert.doesNotMatch(source, /requiredWorkspaceIds\.every/);
  const landingCommitBlock = gitSource.slice(gitSource.indexOf('export async function stageLandingCommit'), gitSource.indexOf('export async function pushExactLandingCommit'));
  assert.doesNotMatch(landingCommitBlock, /generateTiinexCommitMessage|tiinex-commit-message|nodeExecutable/);
  assert.match(source, /pushable = \[\.\.\.commits\.entries\(\)\]\.filter/);
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

await test('Parent-driven Handoff defaults reduce boilerplate without inferring endpoint identity', async () => {
  const defaults = handoffAuthoringDefaults('.topics/tooling/023.task.trace.md', '023.task.trace.md');
  assert.equal(defaults.title, 'Continue 023.task.trace.md');
  assert.match(defaults.purpose, /023\.task\.trace\.md/);
  assert.equal(defaults.transferKind, 'work-and-responsibility');
  assert.match(defaults.doesNotMean, /does not grant authority/);
  assert.equal(Object.hasOwn(defaults, 'from'), false);
  assert.equal(Object.hasOwn(defaults, 'to'), false);
});

await test('native tree operator keeps projection choices separate from canonical item actions', async () => {
  const fs = await import('node:fs/promises');
  const source = await fs.readFile(path.resolve(HERE, '..', 'src', 'operatorTrees.ts'), 'utf8');
  assert.match(source, /TreeProjectionMode/);
  assert.match(source, /TreeLineageMode/);
  assert.match(source, /toggleProjection\('discovery'\)/);
  assert.match(source, /toggleLineage\('discovery'\)/);
  assert.match(source, /contextValue = applied \? 'tiinex\.incomingWorkspaceApplied' : 'tiinex\.incomingWorkspace'/);
  assert.match(source, /tiinex\.incomingWorkspaceArchiveApplied/);
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

await test('Discovery indexes explicit folders and auto-refresh never invokes landing', async () => {
  const fs = await import('node:fs/promises');
  const tree = await fs.readFile(path.resolve(HERE, '..', 'src', 'operatorTrees.ts'), 'utf8');
  const index = await fs.readFile(path.resolve(HERE, '..', 'src', 'carrierIndex.ts'), 'utf8');
  assert.match(tree, /You need to select a discovery folder/);
  assert.match(tree, /Select Tiinex discovery folder/);
  assert.match(tree, /discovery\.autoRefresh/);
  assert.match(tree, /discovery\.latestToIncoming/);
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

await test('installed Core 0.1.1 exposes Handoff reference fields as validation-only authoring gaps', async () => {
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
  assert.match(authoring, /path-planner-capability-gap/);
  assert.match(model, /intentionally knows no artifact-specific field[\s\S]*semantics/);
  assert.doesNotMatch(model, /\bFrom\b|\bTo\b|Transfers|Required Context/);
  assert.match(panel, /Schema and validation are projected by Tiinex Core/);
  assert.match(panel, /Core authoring boundary/);
  assert.match(panel, /not currently bound by Core creation/);
  assert.match(panel, /applyAssist/);
  assert.match(panel, /assistCapabilityErrors/);
  assert.match(panel, /cannot be written by the current Core creation contract/);
  assert.match(panel, /Additional carrier Roles/);
  assert.match(panel, /Attach to Outgoing/);
  assert.match(panel, /Preview/);
  assert.match(panel, /repeatable-section/);
  assert.match(panel, /fieldAssists/);
  assert.match(tree, /loadArtifactAuthoringModel\(this\.extensionPath, 'tiinex\.handoff\.v1'\)/);
  assert.match(tree, /openArtifactAuthoringPanel/);
  assert.match(tree, /ensureOutgoingAuthoringRoot/);
  assert.match(tree, /Incoming payloads are materialized only into extension-owned staging/);
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
  assert.match(tree, /const outputDirectory = this\.outgoingFolder\(\) \|\| await this\.selectOutgoingFolder\(\)/);
  assert.match(tree, /outputDirectory,/);
  assert.match(tree, /ConfigurationTarget\.Global/);
  const previewCall = tree.indexOf("title: 'Tiinex preparing Handoff preview'");
  const writeCall = tree.indexOf('writePreparedArtifactDraft(this.extensionPath, prepared.draft)');
  assert.ok(previewCall >= 0 && writeCall > previewCall);
  const packageBuilder = await fs.readFile(path.resolve(HERE, '..', 'src', 'packageBuilder.ts'), 'utf8');
  assert.match(packageBuilder, /PackageRouteInput/);
  assert.match(packageBuilder, /workspace-routes\.json/);
  assert.match(packageBuilder, /participantRoles/);
  assert.match(packageBuilder, /workspaceSourceOverrides/);
  assert.match(packageBuilder, /Select Tiinex outgoing folder/);
  assert.match(packageBuilder, /showOpenDialog/);
  assert.match(packageBuilder, /workspaceFolders \|\| \[\]/);
  assert.match(packageBuilder, /revealInExplorer/);
  assert.match(packageBuilder, /revealFileInOS/);
  assert.match(packageBuilder, /routeRoutingTexts/);
  assert.match(packageBuilder, /routeTexts\.length === 1/);
  assert.match(tree, /copyOutgoingTransportText/);
  assert.match(tree, /Pack Outgoing first\. Exact transport text/);
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
  assert.match(tree, /Duplicate sources removed; the higher group wins/);
  assert.match(tree, /LOCAL first, then INCOMING newest → oldest/);
  assert.match(tree, /\$\(repo\) LOCAL · VS CODE/);
  assert.match(tree, /\$\(archive\) INCOMING \$\{incomingIndex \+ 1\}/);
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
  assert.match(tree, /readCarrierWorkspaceFile/);
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
  const finalConfirm = apply.indexOf("'Execute Plan'");
  const execution = apply.indexOf('for (const plan of plans)', finalConfirm);
  assert.ok(finalConfirm >= 0 && execution > finalConfirm);
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

await test('installed @tiinex/core 0.1.1 public portable entry replaces the tracked shared snapshot', async () => {
  const fs = await import('node:fs/promises');
  const root = path.resolve(HERE, '..');
  const manifest = JSON.parse(await fs.readFile(path.join(root, 'package.json'), 'utf8'));
  assert.equal(manifest.dependencies?.['@tiinex/core'], '0.1.1');
  assert.equal(Object.hasOwn(manifest.scripts || {}, 'sync:shared-core'), false);
  await assert.rejects(fs.access(path.join(root, 'shared-core')));
  const runtime = await prepareBundledRuntime(root, process.execPath);
  try {
    assert.match(runtime.root, /node_modules[\\/]@tiinex[\\/]core$/);
    assert.match(runtime.entrypoint, /node_modules[\\/]@tiinex[\\/]core[\\/]tools[\\/]tiinex-portable\.mjs$/);
    const corePackage = JSON.parse(await fs.readFile(path.join(runtime.root, 'package.json'), 'utf8'));
    assert.equal(corePackage.name, '@tiinex/core');
    assert.equal(corePackage.version, '0.1.1');
    assert.equal(corePackage.exports?.['./portable-entry'], './tools/tiinex-portable.mjs');
  } finally { await runtime.dispose(); }
});

await test('public Core portable entry exposes every VS Code-used shared operation', async () => {
  const runtime = await prepareBundledRuntime(path.resolve(HERE, '..'), process.execPath);
  try {
    const catalog = await runTiinexJson(runtime, ['operations']);
    const names = new Set((catalog.operations || []).map((item) => item.name));
    for (const name of ['orient-handoff-package', 'compare-source-frontiers', 'project-workspace-landing', 'project-editor-assistance', 'project-authoring-parent', 'project-operator-context', 'project-staged-validation', 'project-handoff-endpoints', 'project-handoff-authoring-plan', 'create-local-draft', 'manufacture-handoff-package']) assert.equal(names.has(name), true, name);
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
    const args = await workspaceCarrierArgs([
      { workspaceId: 'vscode', root: '/repo-vscode', workspaceTargetPath: 'extensions/tiinex' },
      { workspaceId: 'site', root: '/repo-site', workspaceTargetPath: '.' }
    ], scratch);
    assert.deepEqual(args.slice(0, 5), ['/repo-site', '--carrier-mode', 'workspace', '--workspace-id', 'site']);
    assert.equal(args.includes('--handoff'), false);
    assert.equal(args.includes('--route'), false);
    assert.equal(args[args.indexOf('--tooling-bootstrap') + 1], 'embedded');
    const descriptor = JSON.parse(await fs.readFile(args[args.indexOf('--workspace-roots') + 1], 'utf8'));
    assert.deepEqual(descriptor, { workspaces: [{ id: 'vscode', root: '/repo-vscode', workspaceTargetPath: 'extensions/tiinex' }] });
    assert.equal(args.includes('--workspace-targets'), false);
  } finally { await fs.rm(scratch, { recursive: true, force: true }); }
});

await test('native package and authoring wrappers preserve exact shared CLI operation shapes', async () => {
  const runtime = { root: '/runtime', entrypoint: '/runtime/tiinex-portable.mjs', nodeExecutable: 'node', dispose: async () => undefined };
  const fx = fakeRunner((key) => {
    if (key.includes('project-workspace-package-sources')) return { code: 0, stdout: JSON.stringify({ status: 'ready', candidates: [] }), stderr: '' };
    if (key.includes('project-handoff-authoring-plan')) return { code: 0, stdout: JSON.stringify({ status: 'ready', mode: 'continuation', path: '.topics/child--handoff.trace.md' }), stderr: '' };
    if (key.includes('project-handoff-endpoints')) return { code: 0, stdout: JSON.stringify({ status: 'ready', workspaceId: 'business', candidates: [{ id: 'business::.topics/roles/loom.role.trace.md', target: 'business::.topics/roles/loom.role.trace.md', reference: 'business::.topics/roles/loom.role.trace.md', kind: 'role', label: 'Loom', workspaceId: 'business', artifactPath: '.topics/roles/loom.role.trace.md', schemaId: 'tiinex.party.role.v1', qualification: 'qualified-exact' }] }), stderr: '' };
    if (key.includes('create-local-draft')) return { code: 0, stdout: JSON.stringify({ status: 'created-local', draft: { markdown: '# sealed' }, findingSummary: { counts: { error: 0 } } }), stderr: '' };
    return undefined;
  });
  await projectWorkspacePackageSources(runtime, ['/repo-a', '/repo-b'], fx.runner);
  assert.deepEqual(fx.calls[0].args.slice(1), ['project-workspace-package-sources', '/repo-a', '/repo-b', '--compact']);
  await projectHandoffAuthoringPlan(runtime, '/repo-a', 'Child', '.topics/parent.trace.md', fx.runner);
  const planArgs = fx.calls[1].args;
  assert.equal(planArgs[1], 'project-handoff-authoring-plan');
  assert.equal(planArgs[planArgs.indexOf('--title') + 1], 'Child');
  assert.equal(planArgs[planArgs.indexOf('--parent') + 1], '.topics/parent.trace.md');
  const endpoints = await projectHandoffEndpoints(runtime, '/repo-business', 'business', fx.runner);
  const endpointArgs = fx.calls[2].args;
  assert.deepEqual(endpointArgs.slice(1), ['project-handoff-endpoints', '/repo-business', '--workspace-id', 'business', '--compact']);
  assert.equal(endpoints.candidates[0].reference, 'business::.topics/roles/loom.role.trace.md');
  await createHandoffDraft(runtime, '/repo-a', '.topics/root--handoff.trace.md', 'Root', { Purpose: 'x' }, null, 'create-artifact', fx.runner);
  const rootArgs = fx.calls[3].args;
  assert.equal(rootArgs[rootArgs.indexOf('--transition') + 1], 'create-artifact');
  assert.equal(rootArgs.includes('--parent'), false);
  await createHandoffDraft(runtime, '/repo-a', '.topics/child--handoff.trace.md', 'Child', { Purpose: 'x' }, { path: 'parent' }, 'continue-from-record', fx.runner);
  const childArgs = fx.calls[4].args;
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
