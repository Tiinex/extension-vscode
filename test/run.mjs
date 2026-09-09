import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDiscoverySessionEvent, isHandoffPackagePath, waitForStableProbe } from '../dist/core/stableFile.js';
import { workspaceCarrierArgs } from '../dist/core/packageArgs.js';
import { exactRouteByKey, exactWorkspaceIds, routeChoiceKey } from '../dist/core/operatorModel.js';
import { handoffAuthoringDefaults } from '../dist/core/operatorUx.js';
import { operatorClientScript } from '../dist/core/operatorWebview.js';
import { presentOperatorError } from '../dist/core/operatorError.js';
import { LatestWinsKeyedQueue } from '../dist/core/latestWinsQueue.js';
import { canonicalRepositoryRoot, relativeRepositoryPath, repositoryContainsPath, sameRepositoryRoot } from '../dist/core/repositoryPath.js';
import { ignoredPathCollisions, safeRelativePath, safeTarget } from '../dist/core/paths.js';
import { preferredRepositoryParent, routesPreferredForRole } from '../dist/core/receiveUx.js';
import { receivedHandoffContext, withWorkspaceRoots } from '../dist/core/receivedHandoff.js';
import { commitWorkingTree, discardWorkingTree, generateTiinexCommitMessage, listStagedPaths, preflightExistingLocalBranch, pushExactLandingCommit, stageCommitPush, stageLandingChanges, stageLandingCommit, stashWorkingTree } from '../dist/host/git.js';
import { createHandoffDraft, parseBootstrapDescriptor, prepareBundledRuntime, runTiinexJson, projectEditorAssistanceText, projectHandoffAuthoringPlan, projectHandoffEndpoints, projectOperatorContext, projectStagedValidation, projectWorkspaceLanding, projectWorkspacePackageSources } from '../dist/tiinex/bootstrap.js';

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

await test('extension contributes immediately discoverable Tiinex Activity Bar operator view and shared-qualified artifact transition', async () => {
  const fs = await import('node:fs/promises');
  const manifest = JSON.parse(await fs.readFile(path.resolve(HERE, '..', 'package.json'), 'utf8'));
  const container = manifest.contributes?.viewsContainers?.activitybar?.find((item) => item.id === 'tiinex');
  assert.equal(container?.title, 'Tiinex');
  assert.equal(container?.icon, 'media/tiinex.svg');
  const view = manifest.contributes?.views?.tiinex?.find((item) => item.id === 'tiinex.operator');
  assert.equal(view?.type, 'webview');
  assert.equal(view?.visibility, 'visible');
  const command = manifest.contributes?.commands?.find((item) => item.command === 'tiinex.createHandoffFromArtifact');
  assert.equal(command?.enablement, 'tiinex.activeArtifactCanCreateHandoff');
  const context = manifest.contributes?.menus?.['editor/context']?.find((item) => item.command === 'tiinex.createHandoffFromArtifact');
  assert.match(context?.when || '', /tiinex\.activeArtifactCanCreateHandoff/);
  assert.equal(Boolean(manifest.contributes?.problemMatchers), false);
  assert.equal(Boolean(manifest.contributes?.taskDefinitions), false);
});

await test('Receive settings expose role filtering and the linked same-window development loop without requiring per-edit VSIX installation', async () => {
  const fs = await import('node:fs/promises');
  const root = path.resolve(HERE, '..');
  const manifest = JSON.parse(await fs.readFile(path.join(root, 'package.json'), 'utf8'));
  assert.equal(manifest.contributes.configuration.properties['tiinex.operator.role'].type, 'string');
  assert.equal(manifest.contributes.configuration.properties['tiinex.landing.openHandoff'].default, 'yes');
  assert.match(manifest.scripts['dev:link'], /dev-link-extension/);
  assert.match(manifest.scripts['dev:setup'], /tsc -p tsconfig\.json.*dev-link-extension/);
  assert.match(manifest.scripts['dev:build'], /dev-signal-reload/);
  assert.match(manifest.scripts['dev:unlink'], /--unlink/);
  assert.equal(Object.hasOwn(manifest.scripts, 'watch'), false);
  const tasks = JSON.parse(await fs.readFile(path.join(root, '.vscode', 'tasks.json'), 'utf8'));
  assert.ok(tasks.tasks.some((item) => item.label === 'Tiinex: Link this checkout' && item.script === 'dev:setup' && item.options?.env?.TIINEX_VSCODE_EXECUTABLE === '${execPath}'));
  assert.ok(tasks.tasks.some((item) => item.label === 'Tiinex: Build linked extension' && item.group?.isDefault === true));
  assert.ok(tasks.tasks.some((item) => item.label === 'Tiinex: Unlink this checkout' && item.args?.includes('--unlink')));
  await assert.rejects(fs.stat(path.join(root, '.vscode', 'launch.json')));
  const reload = await fs.readFile(path.join(root, 'src', 'devReload.ts'), 'utf8');
  assert.match(reload, /Restart Extensions/);
  assert.match(reload, /workbench\.action\.restartExtensionHost/);
  const extension = await fs.readFile(path.join(root, 'src', 'extension.ts'), 'utf8');
  assert.match(extension, /registerLinkedDevReload\(context, extensionPath\)/);
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
  assert.match(source, /Select every Workspace Tiinex may replace/);
  assert.match(source, /canPickMany: true/);
  assert.match(source, /trustedLandingCommitMessage/);
  assert.doesNotMatch(source, /generateTiinexCommitMessage/);
  assert.doesNotMatch(source, /requiredWorkspaceIds\.every/);
  const landingCommitBlock = gitSource.slice(gitSource.indexOf('export async function stageLandingCommit'), gitSource.indexOf('export async function pushExactLandingCommit'));
  assert.doesNotMatch(landingCommitBlock, /generateTiinexCommitMessage|tiinex-commit-message|nodeExecutable/);
  assert.match(source, /pushable = \[\.\.\.commits\.entries\(\)\]\.filter/);
  assert.match(source, /routesPreferredForRole/);
  assert.match(source, /markdown\.showPreview/);
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

await test('operator UI auto-loads package options and keeps low-frequency Handoff fields collapsed', async () => {
  const fs = await import('node:fs/promises');
  const source = await fs.readFile(path.resolve(HERE, '..', 'src', 'operatorView.ts'), 'utf8');
  assert.match(source, /if \(this\.section === 'package'\) await this\.ensurePackageModel\(\)/);
  assert.doesNotMatch(source, /Load qualified options/);
  assert.match(source, /<details class=\"card\"><summary>Advanced transfer details/);
  assert.match(source, /Required Context, Reference Context, Retained Responsibilities/);
  assert.doesNotMatch(source, />From Kind<|>To Kind</);
  assert.match(source, /type=\"hidden\" name=\"fromKind\"/);
  assert.match(source, /type=\"hidden\" name=\"toKind\"/);
  const packageBuilder = await fs.readFile(path.resolve(HERE, '..', 'src', 'packageBuilder.ts'), 'utf8');
  assert.match(packageBuilder, /Reveal in File Explorer/);
  assert.match(source, /this\.packageModel = null;/);
});

await test('automatic discovery is session-scoped, never startup-backlog-scoped, and keeps manual historical landing explicit', async () => {
  const fs = await import('node:fs/promises');
  const source = await fs.readFile(path.resolve(HERE, '..', 'src', 'inbox.ts'), 'utf8');
  for (const state of ['disabled', 'watching', 'candidate-found', 'candidate-invalid', 'landing-awaiting-confirmation', 'landed', 'ignored', 'blocked']) assert.match(source, new RegExp(state));
  assert.match(source, /sessionStartedAtMs = Date\.now\(\)/);
  assert.match(source, /const observedAtMs = Date\.now\(\)/);
  assert.match(source, /isDiscoverySessionEvent\(observedAtMs, this\.sessionStartedAtMs\)/);
  assert.doesNotMatch(source, /initialScan/);
  assert.doesNotMatch(source, /readdir\(/);
  assert.match(source, /Historical inbox carriers are not surfaced automatically/);
  assert.match(source, /Tiinex: Receive Handoff Package/);
  assert.match(source, /this\.seen\.has\(filePath\)/);
  assert.match(source, /'Review \/ Receive'/);
  assert.match(source, /'Ignore'/);
  assert.match(source, /this\.setState\('landed'/);
  assert.match(source, /this\.setState\('ignored'/);
  assert.match(source, /this\.setState\('blocked'/);
  assert.equal(isDiscoverySessionEvent(1000, 1000), true);
  assert.equal(isDiscoverySessionEvent(1001, 1000), true);
  assert.equal(isDiscoverySessionEvent(999, 1000), false);
  assert.equal(isDiscoverySessionEvent(1000, 0), false);
});

await test('operator webview client script parses and binds every visible primary action', async () => {
  const script = operatorClientScript({ routes: [{ id: 'route', pointerless: false, from: 'Anchor', to: 'Loom' }], workspaces: [{ workspaceId: 'site' }] }, 3, 4);
  assert.doesNotThrow(() => new Function(script));
  for (const type of ['section', 'landPackage', 'refreshDiagnostics', 'showProblems', 'openSettings', 'selectInbox', 'useActiveParent', 'clearParent', 'openPackageBuilder', 'returnToAuthoring', 'reloadPackage', 'createHandoff', 'buildPackage']) {
    assert.match(script, new RegExp(`type:'${type}'`));
  }
  assert.match(script, /\\nWorkspaces:/);
  assert.doesNotMatch(script, /selected\.to\+'\n'/);
});

await test('native Handoff authoring preserves qualified Role/Party references and keeps unknown explicit', async () => {
  const fs = await import('node:fs/promises');
  const authoring = await fs.readFile(path.resolve(HERE, '..', 'src', 'authoring.ts'), 'utf8');
  const operator = await fs.readFile(path.resolve(HERE, '..', 'src', 'core', 'operatorWebview.ts'), 'utf8');
  assert.match(authoring, /if \(kind === 'unknown'\) return ''/);
  assert.match(authoring, /\^\[a-z0-9\._-\]\+::/);
  assert.match(authoring, /'From Reference': fromReference/);
  assert.match(authoring, /'To Reference': toReference/);
  assert.match(operator, /chosen\?\.value==='__unknown__'/);
  assert.match(operator, /kind\.value=chosen\.dataset\.kind\|\|''/);
  assert.match(operator, /reference\.value=chosen\.value/);
  assert.match(operator, /reference\.value=''/);
  const view = await fs.readFile(path.resolve(HERE, '..', 'src', 'operatorView.ts'), 'utf8');
  assert.equal((view.match(/name=\"from\"/g) || []).length, 1);
  assert.equal((view.match(/name=\"to\"/g) || []).length, 1);
  assert.match(view, /Additional context or participants belong in their declared schema fields/);
  assert.doesNotMatch(operator, /option\.disabled=option\.dataset\.kind/);
});

await test('first-video cancellation is neutral while technical failure detail stays behind an explicit details action', async () => {
  const cancelled = presentOperatorError(new Error('tiinex.authoring.cancelled'));
  assert.equal(cancelled.cancelled, true);
  assert.equal(cancelled.summary, 'Cancelled — no changes were made.');
  assert.doesNotMatch(cancelled.summary, /blocked|error|stack/i);
  const failed = presentOperatorError(new Error('tiinex.process-failed: command exploded\ninternal stack detail'));
  assert.equal(failed.cancelled, false);
  assert.match(failed.summary, /Shared Tiinex Tooling could not complete/);
  assert.doesNotMatch(failed.summary, /command exploded|internal stack detail/);
  assert.match(failed.detail, /command exploded/);
  const fs = await import('node:fs/promises');
  const source = await fs.readFile(path.resolve(HERE, '..', 'src', 'operatorView.ts'), 'utf8');
  assert.match(source, /createOutputChannel\('Tiinex'\)/);
  assert.match(source, /showErrorMessage\(presentation\.summary, 'Show details'\)/);
  assert.doesNotMatch(source, /Tiinex operator action blocked:/);
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
    for (const name of ['orient-handoff-package', 'project-workspace-landing', 'project-editor-assistance', 'project-authoring-parent', 'project-operator-context', 'project-staged-validation', 'project-handoff-endpoints', 'project-handoff-authoring-plan', 'create-local-draft', 'manufacture-handoff-package']) assert.equal(names.has(name), true, name);
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
