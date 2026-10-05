import { cp, mkdir, mkdtemp, readFile, rm, writeFile, access } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const CHECKOUTS = path.resolve(ROOT, '..');
const CORE_ROOT = path.resolve(process.env.TIINEX_TEST_CORE_ROOT || path.join(CHECKOUTS, 'core'));
const CORE_TARGET = path.join(ROOT, 'node_modules', '@tiinex', 'core');
const CONTENT_ROOTS = String(process.env.TIINEX_TEST_CONTENT_ROOTS || '')
  .split(path.delimiter).map((item) => item.trim()).filter(Boolean).map((item) => path.resolve(item));
const DEFAULT_CONTENT_ROOTS = [path.join(CHECKOUTS, 'native'), path.join(CHECKOUTS, 'interop-openai')].map((item) => path.resolve(item));
const MODE_PATH = path.join(ROOT, '.vscode', 'link', 'dependency-mode.json');

function run(command, args, cwd, stdio = 'inherit') {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd, stdio, shell: process.platform === 'win32' });
    child.on('error', reject);
    child.on('exit', (code) => code === 0 ? resolve() : reject(new Error(`${command} exited ${code}`)));
  });
}
async function exists(target) { try { await access(target); return true; } catch { return false; } }
async function manifest(root) { return JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8')); }
async function lockedCoreVersion() {
  const lock = JSON.parse(await readFile(path.join(ROOT, 'package-lock.json'), 'utf8'));
  const version = String(lock?.packages?.['node_modules/@tiinex/core']?.version || '').trim();
  if (!version) throw new Error('tiinex.test-core-fixture.locked-version-missing');
  return version;
}
async function qualifiedContentRoots() {
  const candidates = CONTENT_ROOTS.length ? CONTENT_ROOTS : DEFAULT_CONTENT_ROOTS;
  const out = [];
  for (const root of candidates) {
    if (!await exists(path.join(root, 'package.json'))) continue;
    const item = await manifest(root);
    const name = String(item?.name || '').trim();
    if (name && name !== '@tiinex/core') out.push({ root, name, version: String(item.version || '0.0.0') });
  }
  return out;
}
async function copyPackageSurface(sourceRoot, targetRoot) {
  const item = await manifest(sourceRoot);
  const names = new Set(['package.json', 'README.md', 'LICENSE', 'NOTICE', ...(item.files || [])]);
  await mkdir(targetRoot, { recursive: true });
  for (const name of names) {
    const source = path.join(sourceRoot, name);
    if (!await exists(source)) continue;
    await cp(source, path.join(targetRoot, name), { recursive: true });
  }
}
async function packPackage(sourceRoot, scratch, versionOverride = '') {
  const stage = path.join(scratch, `stage-${path.basename(sourceRoot)}-${Math.random().toString(16).slice(2)}`);
  await copyPackageSurface(sourceRoot, stage);
  const manifestPath = path.join(stage, 'package.json');
  const item = JSON.parse(await readFile(manifestPath, 'utf8'));
  if (versionOverride) item.version = versionOverride;
  await writeFile(manifestPath, `${JSON.stringify(item, null, 2)}\n`, 'utf8');
  const output = [];
  await new Promise((resolve, reject) => {
    const child = spawn('npm', ['pack', stage, '--pack-destination', scratch, '--silent'], { cwd: scratch, shell: process.platform === 'win32' });
    child.stdout.on('data', (chunk) => output.push(String(chunk)));
    child.stderr.pipe(process.stderr);
    child.on('error', reject);
    child.on('exit', (code) => code === 0 ? resolve() : reject(new Error(`npm pack exited ${code}`)));
  });
  const name = output.join('').trim().split(/\r?\n/).filter(Boolean).at(-1);
  if (!name) throw new Error(`tiinex.test-core-fixture.pack-output-missing:${item.name}`);
  return { name: String(item.name), version: String(item.version), tgz: path.join(scratch, name) };
}
async function createInstalledComposition(scratch, lockedVersion, content) {
  const packages = [await packPackage(CORE_ROOT, scratch, lockedVersion)];
  for (const item of content) packages.push(await packPackage(item.root, scratch));
  const installRoot = path.join(scratch, 'install-root');
  await mkdir(installRoot, { recursive: true });
  const dependencies = Object.fromEntries(packages.map((item) => [item.name, `file:${item.tgz}`]));
  await writeFile(path.join(installRoot, 'package.json'), `${JSON.stringify({ name: 'tiinex-test-composition', private: true, version: '0.0.0', dependencies }, null, 2)}\n`, 'utf8');
  await run('npm', ['install', '--ignore-scripts', '--offline', '--package-lock=false', '--omit=dev'], installRoot);
  return { installRoot, packages };
}

const scratch = await mkdtemp(path.join(os.tmpdir(), 'tiinex-installed-composition-test-'));
const backups = new Map();
let hadMode = false;
const modeBackup = path.join(scratch, 'dependency-mode.json');
try {
  const coreManifest = await manifest(CORE_ROOT);
  if (coreManifest?.name !== '@tiinex/core') throw new Error(`tiinex.test-core-fixture.core-root-invalid:${CORE_ROOT}`);
  const lockedVersion = await lockedCoreVersion();
  const content = await qualifiedContentRoots();
  const installed = await createInstalledComposition(scratch, lockedVersion, content);

  for (const item of installed.packages) {
    const target = path.join(ROOT, 'node_modules', ...item.name.split('/'));
    const backup = path.join(scratch, 'backup', ...item.name.split('/'));
    const had = await exists(target);
    backups.set(item.name, { target, backup, had });
    if (had) await cp(target, backup, { recursive: true });
    await rm(target, { recursive: true, force: true });
    await mkdir(path.dirname(target), { recursive: true });
    await cp(path.join(installed.installRoot, 'node_modules', ...item.name.split('/')), target, { recursive: true });
  }

  hadMode = await exists(MODE_PATH);
  if (hadMode) await cp(MODE_PATH, modeBackup);
  await mkdir(path.dirname(MODE_PATH), { recursive: true });
  await writeFile(MODE_PATH, `${JSON.stringify({
    mode: 'all-latest', coreRoot: '../core',
    contentPackages: content.map((item) => ({ name: item.name, root: path.relative(ROOT, item.root).replace(/\\/g, '/') }))
  }, null, 2)}\n`, 'utf8');

  const installedContentRoots = content.map((item) => path.join(ROOT, 'node_modules', ...item.name.split('/')));
  const bootstrapPath = path.join(scratch, 'runtime-content.bootstrap.mjs');
  await writeFile(bootstrapPath, `import path from 'node:path';
import { pathToFileURL } from 'node:url';
const coreRoot = ${JSON.stringify(CORE_TARGET)};
const contentRoots = ${JSON.stringify(installedContentRoots)};
process.env.TIINEX_CONTENT_ROOTS = contentRoots.join(path.delimiter);
const moduleUrl = pathToFileURL(path.join(coreRoot, 'src', 'tooling', 'portable', 'adapters', 'node', 'portableRuntime.initialize.js')).href;
const { initializePortableNodeRuntime } = await import(moduleUrl);
const runtime = await initializePortableNodeRuntime({ runtimeRoot: coreRoot, contentRoots, discoverBundled: false, discoverInstalled: false });
if (!['ready','qualified'].includes(runtime.status)) throw new Error('tiinex.test.runtime-bootstrap.failed:' + runtime.status + ':' + JSON.stringify(runtime.findings || []));
`, 'utf8');

  console.log(`Tiinex test composition: local Core packed as lockfile ${lockedVersion}; content sources installed through local npm tarballs: ${content.map((item) => item.name).join(', ') || '(none)'}.`);
  await run(process.execPath, ['--import', bootstrapPath, 'test/run.mjs'], ROOT);
} finally {
  for (const { target, backup, had } of backups.values()) {
    await rm(target, { recursive: true, force: true });
    if (had) {
      await mkdir(path.dirname(target), { recursive: true });
      await cp(backup, target, { recursive: true });
    }
  }
  await rm(MODE_PATH, { force: true });
  if (hadMode) {
    await mkdir(path.dirname(MODE_PATH), { recursive: true });
    await cp(modeBackup, MODE_PATH);
  }
  await rm(scratch, { recursive: true, force: true });
}
