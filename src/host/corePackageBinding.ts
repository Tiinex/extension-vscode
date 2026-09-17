import path from 'node:path';
import { readFile, access, stat } from 'node:fs/promises';

export interface CorePackageBinding {
  root: string;
  entrypoint: string;
  packageJsonPath: string;
  declaredRange: string;
  lockedVersion: string;
  version: string;
  bindingMode: 'sibling-source' | 'installed-package';
}

async function isDirectory(target: string): Promise<boolean> {
  try { return (await stat(target)).isDirectory(); }
  catch { return false; }
}

async function qualifySiblingCoreSource(extensionPath: string, declaredRange: string, lockedVersion: string): Promise<CorePackageBinding | null> {
  // Local Tiinex development is intentionally source-first: when both the
  // extension and Core are real sibling Git checkouts, the bridge executes the
  // one Core implementation directly instead of silently falling back to an
  // older registry package. Installed VSIX layouts do not contain these sibling
  // Git roots and therefore use the packaged dependency path below.
  if (!await isDirectory(path.join(extensionPath, '.git'))) return null;
  const root = path.resolve(extensionPath, '..', 'core');
  if (!await isDirectory(path.join(root, '.git'))) return null;
  const packageJsonPath = path.join(root, 'package.json');
  let corePackage: any;
  try { corePackage = JSON.parse(await readFile(packageJsonPath, 'utf8')); }
  catch { return null; }
  if (corePackage?.name !== '@tiinex/core') return null;
  const version = String(corePackage.version || '').trim();
  if (!version) return null;
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

  const sibling = await qualifySiblingCoreSource(extensionPath, declaredRange, lockedVersion);
  if (sibling) return sibling;

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
  if (version !== lockedVersion) throw new Error(`tiinex.core-package.version-mismatch:${version || 'unknown'}:${lockedVersion}`);
  const root = path.dirname(packageJsonPath);
  const relative = path.relative(root, entrypoint);
  if (!relative || relative === '..' || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) throw new Error('tiinex.core-package.entrypoint-outside-package');
  await access(entrypoint);
  return { root, entrypoint, packageJsonPath, declaredRange, lockedVersion, version, bindingMode: 'installed-package' };
}
