import path from 'node:path';
import { readFile, access, stat, realpath } from 'node:fs/promises';


interface CoreDependencyModeState { mode: 'local' | 'published'; coreRoot?: string }
async function dependencyMode(extensionPath: string): Promise<{ checkoutRoot: string; state: CoreDependencyModeState | null }> {
  let checkoutRoot: string;
  try { checkoutRoot = await realpath(extensionPath); } catch { checkoutRoot = path.resolve(extensionPath); }
  try {
    const raw = JSON.parse(await readFile(path.join(checkoutRoot, '.vscode', 'link', 'dependency-mode.json'), 'utf8'));
    const mode = String(raw?.mode || '').trim().toLowerCase();
    if (mode === 'local' || mode === 'published') return { checkoutRoot, state: { mode, coreRoot: String(raw?.coreRoot || '../core') } as CoreDependencyModeState };
  } catch { /* legacy checkout without explicit mode */ }
  return { checkoutRoot, state: null };
}
async function qualifyExplicitLocalCore(checkoutRoot: string, state: CoreDependencyModeState, declaredRange: string, lockedVersion: string): Promise<CorePackageBinding> {
  const root = path.resolve(checkoutRoot, state.coreRoot || '../core');
  const packageJsonPath = path.join(root,'package.json');
  const manifest = JSON.parse(await readFile(packageJsonPath,'utf8'));
  if (manifest?.name !== '@tiinex/core') throw new Error('tiinex.core-mode.local.package-name-mismatch');
  const entrypoint = path.join(root,'tools','tiinex-portable.mjs'); await access(entrypoint);
  return { root, entrypoint, packageJsonPath, declaredRange, lockedVersion, version:String(manifest.version||''), bindingMode:'sibling-source' };
}

export interface CorePackageBinding {
  root: string;
  entrypoint: string;
  packageJsonPath: string;
  declaredRange: string;
  lockedVersion: string;
  version: string;
  bindingMode: 'sibling-source' | 'installed-package';
}

async function hasGitMetadata(target: string): Promise<boolean> {
  try {
    const info = await stat(path.join(target, '.git'));
    return info.isDirectory() || info.isFile();
  } catch { return false; }
}

async function qualifySiblingCoreSource(
  extensionPath: string,
  declaredRange: string,
  lockedVersion: string,
  installedVersion: string
): Promise<CorePackageBinding | null> {
  // VS Code development installs this checkout through a junction under
  // ~/.vscode/extensions. Resolve that host path back to the real checkout
  // before looking for the ordinary sibling `../core` repository. This keeps
  // Local mode stable across Extension Host restarts.
  let checkoutRoot: string;
  try { checkoutRoot = await realpath(extensionPath); }
  catch { checkoutRoot = path.resolve(extensionPath); }
  if (!await hasGitMetadata(checkoutRoot)) return null;

  const root = path.resolve(checkoutRoot, '..', 'core');
  if (!await hasGitMetadata(root)) return null;
  const packageJsonPath = path.join(root, 'package.json');
  let corePackage: any;
  try { corePackage = JSON.parse(await readFile(packageJsonPath, 'utf8')); }
  catch { return null; }
  if (corePackage?.name !== '@tiinex/core') return null;
  const version = String(corePackage.version || '').trim();
  if (!version || version !== installedVersion) return null;
  const entrypoint = path.join(root, 'tools', 'tiinex-portable.mjs');
  await access(entrypoint);
  return { root, entrypoint, packageJsonPath, declaredRange, lockedVersion, version, bindingMode: 'sibling-source' };
}

/** Shared packaging/runtime check. Published/install layouts qualify the exact
 * declaration + lock + installed package tuple. Local Tiinex linked-checkout
 * development may instead bind directly to the sibling Core source checkout;
 * that is still one Core implementation, not extension-owned semantics.
 */
export async function qualifyInstalledCore(extensionPath: string): Promise<CorePackageBinding> {
  const name = '@tiinex/core';
  const manifest = JSON.parse(await readFile(path.join(extensionPath, 'package.json'), 'utf8'));
  const declaredRange = String(manifest.dependencies?.[name] || '').trim();
  if (!declaredRange) throw new Error('tiinex.core-package.dependency-missing');
  let lock: any;
  try { lock = JSON.parse(await readFile(path.join(extensionPath, 'package-lock.json'), 'utf8')); }
  catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') throw new Error('tiinex.core-package.lockfile-missing');
    throw error;
  }
  const lockedDeclaration = String(lock?.packages?.['']?.dependencies?.[name] || '').trim();
  if (lockedDeclaration !== declaredRange) throw new Error('tiinex.core-package.lockfile-declaration-mismatch');
  const record = lock?.packages?.[`node_modules/${name}`];
  const lockedVersion = String(record?.version || '').trim();
  if (!lockedVersion || record?.link === true) throw new Error('tiinex.core-package.locked-version-missing');

  const mode = await dependencyMode(extensionPath);
  if (mode.state?.mode === 'local') return qualifyExplicitLocalCore(mode.checkoutRoot, mode.state, declaredRange, lockedVersion);

  let packageJsonPath: string;
  let entrypoint: string;
  try {
    packageJsonPath = require.resolve(`${name}/package.json`, { paths: [extensionPath] });
    entrypoint = require.resolve(`${name}/portable-entry`, { paths: [extensionPath] });
  } catch (error) {
    throw new Error(`tiinex.core-package.unavailable:${error instanceof Error ? error.message : String(error)}`);
  }
  const corePackage = JSON.parse(await readFile(packageJsonPath, 'utf8'));
  if (corePackage.name !== name) throw new Error('tiinex.core-package.name-mismatch');
  const version = String(corePackage.version || '').trim();
  if (version !== lockedVersion) {
    if (mode.state?.mode === 'published') throw new Error(`tiinex.core-package.version-mismatch:${version || 'unknown'}:${lockedVersion}`);
    const sibling = await qualifySiblingCoreSource(extensionPath, declaredRange, lockedVersion, version);
    if (sibling) return sibling;
    throw new Error(`tiinex.core-package.version-mismatch:${version || 'unknown'}:${lockedVersion}`);
  }
  const root = path.dirname(packageJsonPath);
  const relative = path.relative(root, entrypoint);
  if (!relative || relative === '..' || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) throw new Error('tiinex.core-package.entrypoint-outside-package');
  await access(entrypoint);
  return { root, entrypoint, packageJsonPath, declaredRange, lockedVersion, version, bindingMode: 'installed-package' };
}
