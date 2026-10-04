import { access, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const statePath = path.join(root, '.vscode', 'link', 'dependency-mode.json');
const requested = String(process.argv[2] || 'install').trim().toLowerCase();
const dryRun = process.env.TIINEX_DEPENDENCY_MODE_DRY_RUN === '1';

async function readJson(file) { return JSON.parse(await readFile(file, 'utf8')); }
async function exists(file) { try { await access(file); return true; } catch { return false; } }
async function state() {
  try { return normalizeState(await readJson(statePath)); }
  catch { return normalizeState({ mode: 'published' }); }
}
async function save(next) {
  const value = normalizeState(next);
  await mkdir(path.dirname(statePath), { recursive: true });
  await writeFile(statePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
  return value;
}
function normalizeState(value = {}) {
  const mode = ['published', 'local', 'all-local', 'all-latest'].includes(String(value.mode || '')) ? String(value.mode) : 'published';
  return {
    schema: 'tiinex.vscode.dependency-mode.v2',
    mode,
    coreRoot: String(value.coreRoot || '../core'),
    packages: Array.isArray(value.packages) ? value.packages.map(normalizePackageRecord).filter((item) => item.name) : [],
    contentPackages: Array.isArray(value.contentPackages) ? value.contentPackages.map(normalizePackageRecord).filter((item) => item.name) : []
  };
}
function normalizePackageRecord(value = {}) {
  return { name: String(value.name || '').trim(), root: String(value.root || '').trim() };
}
function npm(args) {
  if (dryRun) { console.log(`[dry-run] npm ${args.join(' ')}`); return Promise.resolve(); }
  return new Promise((resolve, reject) => {
    const child = spawn('npm', args, { cwd: root, stdio: 'inherit', shell: process.platform === 'win32' });
    child.on('exit', (code) => code === 0 ? resolve() : reject(new Error(`npm exited ${code}`)));
    child.on('error', reject);
  });
}

async function siblingPackages() {
  const parent = path.dirname(root);
  const entries = await readdir(parent, { withFileTypes: true });
  const out = new Map();
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const packageRoot = path.join(parent, entry.name);
    const manifestPath = path.join(packageRoot, 'package.json');
    if (!await exists(manifestPath)) continue;
    let manifest;
    try { manifest = await readJson(manifestPath); } catch { continue; }
    const name = String(manifest?.name || '').trim();
    if (!name || (name !== 'tiinex-vscode' && !name.startsWith('@tiinex/') && !name.startsWith('tiinex-'))) continue;
    out.set(name, { name, root: packageRoot, manifest });
  }
  return out;
}

function declaredDependencyNames(manifest = {}) {
  return [...new Set([
    ...Object.keys(manifest.dependencies || {}),
    ...Object.keys(manifest.optionalDependencies || {})
  ])].sort();
}
function isTiinexPackageName(name = '') {
  const value = String(name || '').trim();
  return value.startsWith('@tiinex/') || value.startsWith('tiinex-');
}

async function dependencyPlan() {
  const manifest = await readJson(path.join(root, 'package.json'));
  const siblings = await siblingPackages();
  const queue = declaredDependencyNames(manifest).filter(isTiinexPackageName);
  const graph = new Map();
  while (queue.length) {
    const name = queue.shift();
    if (graph.has(name)) continue;
    const local = siblings.get(name) || null;
    graph.set(name, { name, root: local ? relativeRoot(local.root) : '' });
    if (local) for (const child of declaredDependencyNames(local.manifest).filter(isTiinexPackageName)) if (!graph.has(child)) queue.push(child);
  }
  const content = [...siblings.values()]
    .filter((item) => item.name !== manifest.name && item.manifest?.tiinex?.contentSource && typeof item.manifest.tiinex.contentSource === 'object')
    .sort((a, b) => a.name.localeCompare(b.name));
  return {
    packages: [...graph.values()].sort((a, b) => a.name.localeCompare(b.name)),
    contentPackages: content.map((item) => ({ name: item.name, root: relativeRoot(item.root) }))
  };
}

function relativeRoot(value) {
  const relative = path.relative(root, value).replace(/\\/g, '/');
  return relative || '.';
}
function localSpec(record) { return `file:${record.root}`; }
function latestSpec(record) { return `${record.name}@latest`; }

async function installSpecs(specs) {
  const unique = [...new Set(specs.filter(Boolean))];
  if (!unique.length) return;
  await npm(['install', '--no-save', '--package-lock=false', '--install-links', ...unique]);
}
async function installForMode(current) {
  await npm(['install']);
  if (current.mode === 'local') {
    await npm(['pack', '--dry-run', current.coreRoot || '../core']);
    await installSpecs([`file:${current.coreRoot || '../core'}`]);
    return;
  }
  if (current.mode === 'all-local') {
    await installSpecs([...current.packages, ...current.contentPackages].map(localSpec));
    return;
  }
  if (current.mode === 'all-latest') {
    await installSpecs([...current.packages, ...current.contentPackages].map(latestSpec));
  }
}

async function switchCoreLocal() {
  const next = await save({ mode: 'local', coreRoot: '../core' });
  await npm(['pack', '--dry-run', next.coreRoot]);
  await installSpecs([`file:${next.coreRoot}`]);
  console.log('Tiinex Core mode: local');
}
async function switchCorePublished() {
  await save({ mode: 'published', coreRoot: '../core' });
  await installSpecs(['@tiinex/core@latest']);
  console.log('Tiinex Core mode: published');
}
async function switchAll(mode) {
  const previous = await state();
  const plan = await dependencyPlan();
  if (mode === 'all-latest') {
    const byName = new Map([...previous.contentPackages, ...plan.contentPackages].map((item) => [item.name, item]));
    plan.contentPackages = [...byName.values()].sort((a, b) => a.name.localeCompare(b.name));
  }
  if (mode === 'all-local') {
    const missing = plan.packages.filter((item) => !item.root).map((item) => item.name);
    if (missing.length) throw new Error(`Tiinex local dependencies missing sibling checkout: ${missing.join(', ')}`);
  }
  const next = await save({ mode, coreRoot: plan.packages.find((item) => item.name === '@tiinex/core')?.root || '../core', ...plan });
  await npm(['install']);
  const records = [...next.packages, ...next.contentPackages];
  await installSpecs(records.map(mode === 'all-local' ? localSpec : latestSpec));
  console.log(`Tiinex dependency mode: ${mode}`);
  console.log(`Packages: ${next.packages.map((item) => item.name).join(', ') || '(none)'}`);
  console.log(`Content sources: ${next.contentPackages.map((item) => item.name).join(', ') || '(none)'}`);
}

if (requested === 'local') await switchCoreLocal();
else if (requested === 'published' || requested === 'latest') await switchCorePublished();
else if (requested === 'all-local') await switchAll('all-local');
else if (requested === 'all-latest') await switchAll('all-latest');
else if (requested === 'install') { const current = await state(); await installForMode(current); console.log(`Tiinex dependency mode preserved: ${current.mode}`); }
else if (requested === 'status') console.log(JSON.stringify(await state(), null, 2));
else throw new Error(`Unknown mode: ${requested}`);
