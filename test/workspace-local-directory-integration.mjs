import assert from 'node:assert/strict';
import Module, { createRequire } from 'node:module';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const run = promisify(execFile);
const scratch = await mkdtemp(path.join(os.tmpdir(), 'tiinex-vscode-local-directory-'));
const fixture = path.join(scratch, 'ordinary-folder');
const gitFixture = path.join(scratch, 'git-without-origin');
const output = path.join(scratch, 'out');
const directOutput = path.join(scratch, 'direct-out');
const gitOutput = path.join(scratch, 'git-out');
const originalLoad = Module._load;
let cases = 0;
const pass = (text) => { cases += 1; console.log(`PASS ${text}`); };

const vscode = {
  workspace: {
    getConfiguration: () => ({ get: (_key, fallback) => fallback }),
    workspaceFolders: [{ uri: { fsPath: fixture } }]
  },
  extensions: { getExtension: () => undefined },
  env: { clipboard: { writeText: async () => {} } },
  Uri: { file: (fsPath) => ({ fsPath }) },
  window: { showOpenDialog: async () => { throw new Error('unexpected folder prompt'); } }
};

async function git(cwd, ...args) { return (await run('git', args, { cwd })).stdout; }

try {
  await mkdir(fixture, { recursive: true });
  Module._load = function(request, parent, isMain) {
    return request === 'vscode' ? vscode : originalLoad.call(this, request, parent, isMain);
  };
  const { initializeWorkspaceDirectory } = require('../dist/workspaceInitialization.js');
  const { loadLocalWorkspaceChoices, buildHandoffPackageFromForm } = require('../dist/packageBuilder.js');
  const { prepareBundledRuntime, runTiinexJson } = require('../dist/tiinex/bootstrap.js');
  const { inspectZipBuffer, readExactZipEntryFromBuffer } = require('../dist/host/zip.js');

  const created = await initializeWorkspaceDirectory(root, fixture);
  assert.equal(created.status, 'ready', JSON.stringify(created.findings || [], null, 2));
  assert.equal(created.sourceDetection?.sourceKind, 'local-directory');
  assert.equal(created.sourceDetection?.repository, '');
  const descriptor = await readFile(created.writeReceipt.path, 'utf8');
  assert.match(descriptor, /### Local directory source/);
  assert.doesNotMatch(descriptor, /- Repository:/);
  pass('actual VS Code initialization adapter turns an ordinary folder into a qualified local-directory Workspace using native Core schema material');

  const bindingFixture = path.join(scratch, 'binding-fixture');
  const brokenExtension = path.join(scratch, 'extension-without-installed-core');
  await mkdir(bindingFixture, { recursive: true });
  await mkdir(brokenExtension, { recursive: true });
  const localCoreRoot = path.dirname(require.resolve('@tiinex/core/package.json'));
  const boundCreated = await initializeWorkspaceDirectory(brokenExtension, bindingFixture, [localCoreRoot]);
  assert.equal(boundCreated.status, 'ready', JSON.stringify(boundCreated.findings || [], null, 2));
  assert.equal(boundCreated.sourceDetection?.sourceKind, 'local-directory');
  pass('Workspace initialization prefers an explicitly open Local Core source even when the extension has no usable installed Core binding');

  await writeFile(path.join(fixture, '.gitignore'), '*.handoff-package.zip\n*.zip\n!assets/keep.zip\ncache/\n', 'utf8');
  await writeFile(path.join(fixture, 'README.md'), '# ordinary folder\n', 'utf8');
  await writeFile(path.join(fixture, 'bootstrap-999.handoff-package.zip'), 'generated carrier', 'utf8');
  await mkdir(path.join(fixture, 'assets'), { recursive: true });
  await writeFile(path.join(fixture, 'assets', 'keep.zip'), 'explicit negation keeps this', 'utf8');
  await mkdir(path.join(fixture, 'cache'), { recursive: true });
  await writeFile(path.join(fixture, 'cache', 'hidden.txt'), 'ignored cache', 'utf8');

  const choices = await loadLocalWorkspaceChoices(root);
  assert.equal(choices.length, 1, JSON.stringify(choices, null, 2));
  assert.equal(choices[0].root, fixture);
  assert.equal(choices[0].sourceKind, 'local-directory');
  assert.equal(choices[0].repository, '');
  pass('VS Code Discovery consumes the qualified non-Git Workspace candidate without Git/origin host authority');

  const runtime = await prepareBundledRuntime(root, process.execPath);
  let direct;
  try {
    direct = await runTiinexJson(runtime, [
      'manufacture-handoff-package', fixture,
      '--carrier-mode', 'workspace',
      '--workspace-id', created.workspaceId,
      '--workspace-target', created.writeReceipt.workspaceRelativePath,
      '--tooling-bootstrap', 'embedded',
      '--new-root',
      '--output-dir', directOutput,
      '--compact'
    ]);
    assert.equal(direct.status, 'ready', JSON.stringify(direct.findings || [], null, 2));
  } finally { await runtime.dispose(); }

  const built = await buildHandoffPackageFromForm(root, {
    routeId: 'workspace-carrier:none',
    workspaceIds: [choices[0].workspaceId],
    workspaceSourceOverrides: [{ workspaceId: choices[0].workspaceId, root: fixture }],
    outputDirectory: output
  });
  const outer = await readFile(built.outputPath);
  const outerEntries = await inspectZipBuffer(outer);
  const workspaceArchive = outerEntries.find((item) => !item.directory && item.path.endsWith('.workspace.zip'));
  assert.ok(workspaceArchive);
  const nested = await readExactZipEntryFromBuffer(outer, workspaceArchive.path);
  const nestedPaths = (await inspectZipBuffer(nested)).filter((item) => !item.directory).map((item) => item.path);
  assert.equal(nestedPaths.includes('bootstrap-999.handoff-package.zip'), false);
  assert.equal(nestedPaths.includes('cache/hidden.txt'), false);
  assert.equal(nestedPaths.includes('assets/keep.zip'), true);
  assert.equal(nestedPaths.includes('.gitignore'), true);
  assert.equal(nestedPaths.includes('README.md'), true);
  pass('VS Code Pack delegates source selection to shared Core: .gitignore omission and negation are both honored');

  const directOuter = await readFile(direct.primaryOutput.path);
  const directEntries = await inspectZipBuffer(directOuter);
  const directWorkspaceArchive = directEntries.find((item) => !item.directory && item.path.endsWith('.workspace.zip'));
  assert.ok(directWorkspaceArchive);
  const directNested = await readExactZipEntryFromBuffer(directOuter, directWorkspaceArchive.path);
  assert.deepEqual(nested, directNested);
  pass('portable CLI and VS Code host manufacture byte-identical nested Workspace snapshots from the same root');

  await mkdir(gitFixture, { recursive: true });
  await git(gitFixture, 'init', '-q');
  await git(gitFixture, 'config', 'user.name', 'Tiinex Test');
  await git(gitFixture, 'config', 'user.email', 'tiinex@example.invalid');
  await writeFile(path.join(gitFixture, '.gitignore'), '*.zip\n', 'utf8');
  await writeFile(path.join(gitFixture, 'tracked.zip'), 'tracked despite ignore', 'utf8');
  await writeFile(path.join(gitFixture, 'README.md'), '# git no origin\n', 'utf8');
  await git(gitFixture, 'add', '.gitignore', 'README.md');
  await git(gitFixture, 'add', '-f', 'tracked.zip');
  await git(gitFixture, 'commit', '-qm', 'fixture');
  await writeFile(path.join(gitFixture, 'generated.zip'), 'ignored untracked', 'utf8');

  const gitCreated = await initializeWorkspaceDirectory(root, gitFixture);
  assert.equal(gitCreated.status, 'ready', JSON.stringify(gitCreated.findings || [], null, 2));
  assert.equal(gitCreated.sourceDetection?.sourceKind, 'local-directory');
  assert.equal(gitCreated.sourceDetection?.repository, '');
  const gitDescriptor = await readFile(gitCreated.writeReceipt.path, 'utf8');
  assert.match(gitDescriptor, /### Local directory source/);
  assert.doesNotMatch(gitDescriptor, /- Repository:/);
  vscode.workspace.workspaceFolders = [{ uri: { fsPath: gitFixture } }];
  const gitChoices = await loadLocalWorkspaceChoices(root);
  assert.equal(gitChoices.length, 1);
  const gitBuilt = await buildHandoffPackageFromForm(root, {
    routeId: 'workspace-carrier:none',
    workspaceIds: [gitChoices[0].workspaceId],
    workspaceSourceOverrides: [{ workspaceId: gitChoices[0].workspaceId, root: gitFixture }],
    outputDirectory: gitOutput
  });
  const gitOuter = await readFile(gitBuilt.outputPath);
  const gitOuterEntries = await inspectZipBuffer(gitOuter);
  const gitWorkspaceArchive = gitOuterEntries.find((item) => !item.directory && item.path.endsWith('.workspace.zip'));
  const gitNested = await readExactZipEntryFromBuffer(gitOuter, gitWorkspaceArchive.path);
  const gitNestedPaths = (await inspectZipBuffer(gitNested)).filter((item) => !item.directory).map((item) => item.path);
  assert.equal(gitNestedPaths.includes('tracked.zip'), true);
  assert.equal(gitNestedPaths.includes('generated.zip'), false);
  pass('Git checkout without origin initializes locally and shared Core preserves tracked ignored files while omitting ignored untracked files');
} finally {
  Module._load = originalLoad;
  await rm(scratch, { recursive: true, force: true });
}

console.log(`${cases}/${cases} local-directory integration scenarios passed.`);
