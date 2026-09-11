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
try {
  await mkdir(path.join(fixture, '.topics', '.workspaces'), { recursive: true });
  for (const name of ['tiinex-extension-vscode.workspace.md', 'tiinex-vscode.workspace.md']) {
    await cp(path.join(root, '.topics', '.workspaces', name), path.join(fixture, '.topics', '.workspaces', name));
  }
  await writeFile(path.join(fixture, 'README.md'), '# Package integration fixture\n');
  const git = (...args) => run('git', args, { cwd: fixture });
  await git('init', '-q');
  await git('config', 'user.name', 'Tiinex Test');
  await git('config', 'user.email', 'tiinex@example.invalid');
  await git('remote', 'add', 'origin', 'https://github.com/Tiinex/extension-vscode.git');
  await git('add', '-A');
  await git('commit', '-qm', 'fixture');
  Module._load = function(request, parent, isMain) {
    return request === 'vscode' ? vscode : originalLoad.call(this, request, parent, isMain);
  };
  const { buildHandoffPackageFromForm } = require('../dist/packageBuilder.js');
  const { prepareBundledRuntime, runTiinexJson } = require('../dist/tiinex/bootstrap.js');
  const { extractZipBuffer } = require('../dist/host/zip.js');
  const filename = 'business-001-9-2.handoff-package.zip';
  const input = { routeId: 'workspace-carrier:none', workspaceIds: ['extension-vscode'], outputDirectory: output, expectedCarrierFilename: filename };
  const built = await buildHandoffPackageFromForm(root, input);
  assert.equal(path.basename(built.outputPath), filename);
  assert.deepEqual(await readdir(output), [filename]);
  assert.equal(built.routingText, '');
  pass('real extension package builder writes the displayed pointerless filename');
  const runtime = await prepareBundledRuntime(root, process.execPath);
  try {
    const orientation = await runTiinexJson(runtime, ['orient-handoff-package', built.outputPath]);
    assert.equal(orientation.status, 'ready');
    assert.deepEqual(orientation.workspaces.map(w => w.id), ['extension-vscode']);
    assert.deepEqual(orientation.routes, []);
    assert.equal(orientation.carrierLineage.dimension, '001');
    pass('result re-orients with exact Workspace selection and no invented Handoff or lineage');
  } finally { await runtime.dispose(); }
  const originalBytes = await readFile(built.outputPath);
  const retry = await buildHandoffPackageFromForm(root, input);
  assert.equal(retry.outputPath, built.outputPath);
  assert.deepEqual(await readFile(retry.outputPath), originalBytes);
  await writeFile(path.join(fixture, 'README.md'), '# Different payload\n');
  await assert.rejects(buildHandoffPackageFromForm(root, input), /output-exists-different/);
  assert.deepEqual(await readFile(built.outputPath), originalBytes);
  pass('exact retry is idempotent and different payload cannot overwrite the existing carrier');
  const packed = await run(process.execPath, ['scripts/package-vsix.mjs'], { cwd: root, maxBuffer: 16 * 1024 * 1024 });
  const receipt = JSON.parse(packed.stdout.trim());
  assert.equal(receipt.status, 'ready');
  const installed = path.join(scratch, 'vsix');
  await extractZipBuffer(await readFile(receipt.output), installed);
  const installedRoot = path.join(installed, 'extension');
  await readFile(path.join(installedRoot, 'package-lock.json'));
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
