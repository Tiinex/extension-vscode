import { mkdir, readFile, readdir, realpath, rename, rm, stat, symlink, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const unlink = args.includes('--unlink');
const extensionsDirOverride = valueAfter('--extensions-dir') || process.env.TIINEX_VSCODE_EXTENSIONS_DIR || '';
const vscodeExecutable = valueAfter('--vscode-executable') || process.env.TIINEX_VSCODE_EXECUTABLE || '';
const packageJson = JSON.parse(await readFile(path.join(ROOT, 'package.json'), 'utf8'));
const extensionId = `${packageJson.publisher}.${packageJson.name}`;
const extensionsDir = path.resolve(extensionsDirOverride || inferExtensionsDir(vscodeExecutable));
const linkPath = path.join(extensionsDir, `${extensionId}-${packageJson.version}`);
const stateDir = path.resolve(process.env.TIINEX_DEV_STATE_DIR || path.join(os.homedir(), '.tiinex', 'dev-links'));
const statePath = path.join(stateDir, `${extensionId}.json`);
const markerDir = path.join(ROOT, '.tiinex-dev');
const markerPath = path.join(markerDir, 'linked.json');

if (unlink) {
  await unlinkCheckout();
} else {
  await linkCheckout();
}

function valueAfter(name) {
  const index = args.indexOf(name);
  return index >= 0 && index + 1 < args.length ? args[index + 1] : '';
}

function inferExtensionsDir(executable) {
  if (process.env.VSCODE_PORTABLE) return path.join(process.env.VSCODE_PORTABLE, 'extensions');
  const flavor = `${executable} ${process.env.TERM_PROGRAM || ''}`.toLowerCase();
  if (flavor.includes('insider')) return path.join(os.homedir(), '.vscode-insiders', 'extensions');
  return path.join(os.homedir(), '.vscode', 'extensions');
}

async function readJson(file) {
  try { return JSON.parse(await readFile(file, 'utf8')); } catch { return null; }
}

async function existingExtensionEntries() {
  const matches = [];
  let names = [];
  try { names = await readdir(extensionsDir); } catch { return matches; }
  for (const name of names) {
    const candidate = path.join(extensionsDir, name);
    let info;
    try { info = await stat(candidate); } catch { continue; }
    if (!info.isDirectory()) continue;
    const manifest = await readJson(path.join(candidate, 'package.json'));
    if (!manifest) continue;
    if (`${manifest.publisher || ''}.${manifest.name || ''}` === extensionId) matches.push(candidate);
  }
  return matches;
}

async function resolvesToRepo(candidate) {
  try { return path.resolve(await realpath(candidate)) === ROOT; } catch { return false; }
}

async function linkCheckout() {
  const previous = await readJson(statePath);
  if (previous?.repoRoot && path.resolve(previous.repoRoot) !== ROOT) {
    throw new Error(`tiinex.dev-link.already-owned-by-other-checkout:${previous.repoRoot}`);
  }

  await mkdir(extensionsDir, { recursive: true });
  await mkdir(stateDir, { recursive: true });
  const backups = Array.isArray(previous?.backups) ? [...previous.backups] : [];
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupRoot = path.join(os.homedir(), '.tiinex', 'dev-extension-backups', extensionId, timestamp);

  for (const candidate of await existingExtensionEntries()) {
    if (await resolvesToRepo(candidate)) continue;
    const destination = path.join(backupRoot, path.basename(candidate));
    await mkdir(path.dirname(destination), { recursive: true });
    await rename(candidate, destination);
    backups.push({ original: candidate, backup: destination });
  }

  let currentTarget = '';
  try { currentTarget = await realpath(linkPath); } catch { currentTarget = ''; }
  if (currentTarget && path.resolve(currentTarget) !== ROOT) {
    throw new Error(`tiinex.dev-link.target-occupied:${linkPath}`);
  }
  if (!currentTarget) {
    try { await rm(linkPath, { force: true }); } catch { /* broken link cleanup */ }
    await symlink(ROOT, linkPath, process.platform === 'win32' ? 'junction' : 'dir');
  }

  const state = {
    schema: 'tiinex.vscode.dev-link.v1',
    extensionId,
    version: packageJson.version,
    repoRoot: ROOT,
    extensionsDir,
    linkPath,
    backups,
    linkedAt: new Date().toISOString()
  };
  await writeFile(statePath, `${JSON.stringify(state, null, 2)}\n`, 'utf8');
  await mkdir(markerDir, { recursive: true });
  await writeFile(markerPath, `${JSON.stringify({ extensionId, repoRoot: ROOT, extensionsDir, linkPath }, null, 2)}\n`, 'utf8');

  console.log(`Linked ${extensionId} -> ${ROOT}`);
  console.log(`VS Code extensions dir: ${extensionsDir}`);
  if (backups.length) console.log(`Preserved ${backups.length} previous installed copy/copies outside the extensions directory.`);
  console.log('One-time step: restart the Extension Host (or VS Code) once so the linked checkout becomes the running extension.');
  console.log('After that, use the default build task; successful builds will offer Restart Extensions automatically.');
}

async function unlinkCheckout() {
  const state = await readJson(statePath);
  if (!state) {
    await rm(markerDir, { recursive: true, force: true });
    console.log(`No linked ${extensionId} development checkout is recorded.`);
    return;
  }
  if (path.resolve(state.repoRoot || '') !== ROOT) throw new Error(`tiinex.dev-unlink.wrong-checkout:${state.repoRoot || 'unknown'}`);

  const linkIsOurs = await resolvesToRepo(state.linkPath);
  const conflicts = [];
  for (const item of state.backups || []) {
    if (linkIsOurs && path.resolve(item.original) === path.resolve(state.linkPath)) continue;
    try { await stat(item.original); conflicts.push(item.original); } catch { /* available */ }
  }
  if (conflicts.length) throw new Error(`tiinex.dev-unlink.restore-target-occupied:${conflicts.join(',')}`);

  if (linkIsOurs) await rm(state.linkPath, { force: true });
  for (const item of [...(state.backups || [])].reverse()) {
    await mkdir(path.dirname(item.original), { recursive: true });
    await rename(item.backup, item.original);
  }
  await rm(statePath, { force: true });
  await rm(markerDir, { recursive: true, force: true });
  console.log(`Unlinked ${extensionId} development checkout and restored preserved installed copies.`);
  console.log('Restart the Extension Host (or VS Code) once to finish returning to the installed extension.');
}
