import assert from 'node:assert/strict';
import path from 'node:path';
import os from 'node:os';
import Module, { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { mkdtemp, mkdir, cp, writeFile, readFile, readdir, rm } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const run = promisify(execFile);
const scratch = await mkdtemp(path.join(os.tmpdir(), 'tiinex-real-pack-'));
const fixture = path.join(scratch, 'fixture');
const output = path.join(scratch, 'outgoing');
const originalLoad = Module._load;
let cases = 0;
const pass = (text) => { cases++; console.log(`PASS ${text}`); };
const vscode = {
  workspace: {
    getConfiguration: () => ({ get: (_key, fallback) => fallback }),
    workspaceFolders: [{ uri: { fsPath: fixture } }]
  },
  extensions: { getExtension: () => ({ isActive: true, exports: { getAPI: () => ({ repositories: [{ rootUri: { fsPath: fixture } }] }) } }) },
  env: { clipboard: { writeText: async () => {} } },
  Uri: { file: (fsPath) => ({ fsPath }) },
  window: { showOpenDialog: async () => { throw new Error('unexpected folder prompt'); } }
};

async function listFiles(root) {
  const out = [];
  async function visit(dir, prefix = '') {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
      if (entry.isDirectory()) await visit(path.join(dir, entry.name), rel);
      else if (entry.isFile()) out.push(rel);
    }
  }
  await visit(root);
  return out.sort();
}


try {
  await mkdir(path.join(fixture, '.topics', '.workspaces'), { recursive: true });
  for (const name of ['tiinex-vscode.workspace.md']) {
    await cp(path.join(root, '.topics', '.workspaces', name), path.join(fixture, '.topics', '.workspaces', name));
  }
  await writeFile(path.join(fixture, 'README.md'), '# Package integration fixture\n');
  await writeFile(path.join(fixture, '.gitignore'), '*.handoff-package.zip\n', 'utf8');
  const git = (...args) => run('git', args, { cwd: fixture });
  await git('init', '-q');
  await git('config', 'user.name', 'Tiinex Test');
  await git('config', 'user.email', 'tiinex@example.invalid');
  await git('remote', 'add', 'origin', 'https://github.com/Tiinex/vscode.git');
  await git('add', '-A');
  await git('commit', '-qm', 'fixture');
  await writeFile(path.join(fixture, 'bootstrap-999.handoff-package.zip'), 'ignored generated carrier', 'utf8');
  Module._load = function(request, parent, isMain) {
    return request === 'vscode' ? vscode : originalLoad.call(this, request, parent, isMain);
  };
  const { buildHandoffPackageFromForm, loadHandoffRouteChoicesForSource } = require('../dist/packageBuilder.js');
  const { prepareBundledRuntime, preparePackageRuntimeWithRecovery, runTiinexJson } = require('../dist/tiinex/bootstrap.js');
  const { extractZipBuffer, inspectZipBuffer, readExactZipEntryFromBuffer } = require('../dist/host/zip.js');
  const filename = 'business-001-9-2.handoff-package.zip';
  const input = { routeId: 'workspace-carrier:none', workspaceIds: ['vscode'], outputDirectory: output, expectedCarrierFilename: filename };
  const built = await buildHandoffPackageFromForm(root, input);
  assert.equal(path.basename(built.outputPath), filename);
  assert.deepEqual(await readdir(output), [filename]);
  assert.match(built.routingText, /Start:\n001-1-READ-BEFORE-PROCEEDING\.trace\.md/);
  assert.match(built.routingText, /pointerless Workspace carrier/);
  assert.doesNotMatch(built.routingText, /Continue from:/i);
  const builtOuter = await readFile(built.outputPath);
  const builtOuterEntries = await inspectZipBuffer(builtOuter);
  const workspaceArchive = builtOuterEntries.find((item) => !item.directory && /vscode\.workspace\.zip$/i.test(item.path));
  assert.ok(workspaceArchive, 'pointerless carrier must contain the selected Workspace archive');
  const workspaceBytes = await readExactZipEntryFromBuffer(builtOuter, workspaceArchive.path);
  const workspacePaths = (await inspectZipBuffer(workspaceBytes)).filter((item) => !item.directory).map((item) => item.path);
  assert.equal(workspacePaths.includes('bootstrap-999.handoff-package.zip'), false, 'shared Core enumeration must exclude .gitignored generated carrier bytes');
  assert.equal(workspacePaths.includes('.gitignore'), true, 'the durable ignore policy file remains part of the Workspace snapshot');
  pass('real extension package builder writes the displayed pointerless filename and shared Core applies .gitignore to the nested Workspace snapshot');
  const runtime = await prepareBundledRuntime(root, process.execPath);
  try {
    const orientation = await runTiinexJson(runtime, ['orient-handoff-package', built.outputPath]);
    assert.equal(orientation.status, 'ready');
    assert.deepEqual(orientation.workspaces.map(w => w.id), ['vscode']);
    assert.deepEqual(orientation.routes, []);
    assert.equal(orientation.carrierLineage.dimension, '001');
    pass('result re-orients with exact Workspace selection and no invented Handoff or lineage');
  } finally { await runtime.dispose(); }
  const packagePrepared = await preparePackageRuntimeWithRecovery(built.outputPath, root, process.execPath);
  try {
    assert.equal(packagePrepared.recovery.state, 'package-bootstrap');
    assert.equal(packagePrepared.orientation.status, 'ready');
    assert.match(packagePrepared.runtime.entrypoint.replace(/\\/g, '/'), /tiinex-vscode-bootstrap-[^/]+\/tiinex\.bootstrap\/runtime\/tools\/tiinex-portable\.mjs$/);
    pass('freshly packed carrier starts from its embedded current-Core bootstrap using the manifest-root coordinate');
  } finally { await packagePrepared.runtime.dispose(); }
  const renamedParentDir = path.join(scratch, 'renamed-parent');
  const renamedParent = path.join(renamedParentDir, 'tiinex-core-vscode-003-1.handoff-package.zip');
  const renamedChildOutput = path.join(scratch, 'renamed-child-outgoing');
  await mkdir(renamedParentDir, { recursive: true });
  await cp(built.outputPath, renamedParent);
  const renamedChildFilename = 'tiinex-core-vscode-003-1-1.handoff-package.zip';
  const renamedChild = await buildHandoffPackageFromForm(root, {
    routeId: 'workspace-carrier:none',
    workspaceIds: ['vscode'],
    packageParentPath: renamedParent,
    outputDirectory: renamedChildOutput,
    expectedCarrierFilename: renamedChildFilename
  });
  assert.equal(path.basename(renamedChild.outputPath), renamedChildFilename);
  const renamedChildOrientation = await runTiinexJson(runtime, ['orient-handoff-package', renamedChild.outputPath, '--full']);
  assert.equal(renamedChildOrientation.status, 'ready');
  assert.equal(renamedChildOrientation.carrierLineage.parentDimension, '001');
  assert.equal(renamedChildOrientation.carrierLineage.dimension, '001-1');
  assert.notEqual(path.basename(renamedChild.outputPath, '.handoff-package.zip'), renamedChildOrientation.carrierLineage.dimension);
  pass('renamed transport parent continues its exact external filename while qualified carrier lineage advances independently');
  const routedFixture = path.join(scratch, 'routed-fixture');
  const routedOutput = path.join(scratch, 'routed-outgoing');
  await cp(path.join(root, 'test', 'extension-host', 'fixtures', 'source-workspace'), routedFixture, { recursive: true });
  const routedGit = (...args) => run('git', args, { cwd: routedFixture });
  await routedGit('init', '-q');
  await routedGit('config', 'user.name', 'Tiinex Test');
  await routedGit('config', 'user.email', 'tiinex@example.invalid');
  await routedGit('remote', 'add', 'origin', 'https://github.com/Tiinex/extension-host-acceptance.git');
  await routedGit('add', '-A');
  await routedGit('commit', '-qm', 'fixture');
  const routedChoices = await loadHandoffRouteChoicesForSource(root, { workspaceId: 'extension-host-acceptance', root: routedFixture });
  assert.equal(routedChoices.length, 2);
  const participantByRoute = new Map([
    [routedChoices[0].id, {
      label: 'Sigma Role — fixture presentation', authoringLabel: 'Sigma',
      reference: 'extension-host-acceptance::.topics/roles/sigma-role.trace.md',
      workspaceId: 'extension-host-acceptance', path: '.topics/roles/sigma-role.trace.md'
    }],
    [routedChoices[1].id, {
      label: 'Pilot Role — fixture presentation', authoringLabel: 'Pilot',
      reference: 'extension-host-acceptance::.topics/roles/pilot-role.trace.md',
      workspaceId: 'extension-host-acceptance', path: '.topics/roles/pilot-role.trace.md'
    }]
  ]);
  const routed = await buildHandoffPackageFromForm(root, {
    routeId: routedChoices[0].id,
    routeInputs: routedChoices.map((route) => ({ routeId: route.id, participantRoles: [participantByRoute.get(route.id)] })),
    workspaceIds: ['extension-host-acceptance'],
    workspaceSourceOverrides: [{ workspaceId: 'extension-host-acceptance', root: routedFixture }],
    carrierPrefix: 'business-001',
    packageParentPath: built.outputPath,
    outputDirectory: routedOutput,
    expectedCarrierFilename: 'business-001-9-2-1.handoff-package.zip'
  });
  assert.equal(path.basename(routed.outputPath), 'business-001-9-2-1.handoff-package.zip');
  assert.equal(routed.routeIds.length, 2);
  assert.equal(routed.routeRoutingTexts.length, 2);
  assert.deepEqual(routed.routeRoutingTexts.map((item) => [item.workspaceId, item.handoffPath, item.recipientLabel]), [
    ['extension-host-acceptance', '.topics/handoffs/acceptance-route-one.trace.md', 'Loom'],
    ['extension-host-acceptance', '.topics/handoffs/acceptance-route-two.trace.md', 'Kodax']
  ]);
  const routedOrientation = await runTiinexJson(runtime, ['orient-handoff-package', routed.outputPath, '--full']);
  assert.equal(routedOrientation.status, 'ready');
  assert.deepEqual(routedOrientation.workspaces.map((item) => item.id), ['extension-host-acceptance']);
  assert.deepEqual(routedOrientation.routes.map((item) => [item.workspaceId, item.workspaceRelativeHandoffPath, item.from, item.to]), [
    ['extension-host-acceptance', '.topics/handoffs/acceptance-route-one.trace.md', 'Anchor', 'Loom'],
    ['extension-host-acceptance', '.topics/handoffs/acceptance-route-two.trace.md', 'Anchor', 'Kodax']
  ]);
  const routedEntries = await inspectZipBuffer(await readFile(routed.outputPath));
  const routedPaths = routedEntries.filter((item) => !item.directory).map((item) => item.path);
  assert.equal(routedPaths.filter((item) => /-handoff-pointer\.trace\.md$/.test(item)).length, 2);
  assert.ok(routedPaths.some((item) => /-sigma-role-pointer\.trace\.md$/.test(item)), 'Sigma participant Role pointer must be a physical carrier file');
  assert.ok(routedPaths.some((item) => /-pilot-role-pointer\.trace\.md$/.test(item)), 'Pilot participant Role pointer must be a physical carrier file');
  pass('multi-route Pack preserves Core-qualified routes and physical Handoff/participant pointer files in the finished carrier');

  const originalBytes = await readFile(built.outputPath);
  // Bootstrap manifest v2 records exact bundle manufacture time, so rebuilding the
  // same source is a new bundle identity even when runtime composition is equal.
  // The canonical output remains immutable; Core projects a transport-only OS-style
  // collision name without creating a new carrier lineage sibling.
  const duplicate = await buildHandoffPackageFromForm(root, input);
  assert.deepEqual(await readFile(built.outputPath), originalBytes);
  assert.notEqual(path.resolve(duplicate.outputPath), path.resolve(built.outputPath));
  assert.match(path.basename(duplicate.outputPath), / \(1\)\.handoff-package\.zip$/);
  assert.doesNotMatch(path.basename(duplicate.outputPath), /--2/);
  const duplicateOrientation = await runTiinexJson(runtime, ['orient-handoff-package', duplicate.outputPath, '--full']);
  assert.equal(duplicateOrientation.carrierLineage.dimension, '001');

  await writeFile(path.join(fixture, 'README.md'), '# Different payload\n');
  const changed = await buildHandoffPackageFromForm(root, input);
  assert.deepEqual(await readFile(built.outputPath), originalBytes);
  assert.match(path.basename(changed.outputPath), / \(2\)\.handoff-package\.zip$/);
  assert.doesNotMatch(path.basename(changed.outputPath), /--3/);
  const changedOrientation = await runTiinexJson(runtime, ['orient-handoff-package', changed.outputPath, '--full']);
  assert.equal(changedOrientation.carrierLineage.dimension, '001');
  pass('destination collisions preserve canonical bytes and use Core-projected OS-style filenames without changing carrier lineage');
  const packed = await run(process.execPath, ['scripts/package-vsix.mjs'], { cwd: root, maxBuffer: 16 * 1024 * 1024 });
  const receipt = JSON.parse(packed.stdout.trim());
  assert.equal(receipt.status, 'ready');
  const installed = path.join(scratch, 'vsix');
  await extractZipBuffer(await readFile(receipt.output), installed);
  const installedRoot = path.join(installed, 'extension');
  await readFile(path.join(installedRoot, 'package-lock.json'));
  const packagedCoreRoot = path.join(installedRoot, 'node_modules', '@tiinex', 'core');
  const packagedCorePaths = (await listFiles(packagedCoreRoot)).map((item) => item.replace(/\\/g, '/'));
  assert.ok(packagedCorePaths.includes('package.json'));
  assert.ok(packagedCorePaths.includes('tools/tiinex-portable.mjs'));
  assert.ok(packagedCorePaths.some((item) => item.startsWith('src/')));
  assert.equal(packagedCorePaths.some((item) => item.startsWith('.topics/')), false, 'VSIX must honor Core package files contract and omit Core continuity source');
  assert.equal(packagedCorePaths.some((item) => item.startsWith('test/')), false, 'VSIX must omit Core tests');
  assert.equal(packagedCorePaths.some((item) => item.startsWith('.github/')), false, 'VSIX must omit Core repository automation');
  assert.equal(packagedCorePaths.length, receipt.runtime.files);
  // Load from the extracted VSIX, not from the development checkout.
  const installedBootstrap = require(path.join(installedRoot, 'dist', 'tiinex', 'bootstrap.js'));
  const packagedRuntime = await installedBootstrap.prepareBundledRuntime(installedRoot, process.execPath);
  try {
    assert.equal(path.relative(installedRoot, packagedRuntime.root), path.join('node_modules', '@tiinex', 'core'));
    const catalog = await installedBootstrap.runTiinexJson(packagedRuntime, ['operations']);
    assert.ok(catalog.operations.some(op => op.name === 'manufacture-handoff-package'));
  } finally { await packagedRuntime.dispose(); }
  await rm(receipt.output, { force: true });
  pass('extracted VSIX loads its bundled lockfile and runs its own public Core entrypoint');
} finally {
  Module._load = originalLoad;
  await rm(scratch, { recursive: true, force: true });
}
console.log(`${cases}/${cases} package integration scenarios passed. Windows/VS Code UI acceptance remains separate.`);
