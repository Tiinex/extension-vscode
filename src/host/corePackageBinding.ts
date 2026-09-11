import path from 'node:path';
import { readFile, access } from 'node:fs/promises';

export interface CorePackageBinding {
  root: string;
  entrypoint: string;
  packageJsonPath: string;
  declaredRange: string;
  lockedVersion: string;
  version: string;
}

/** Shared packaging/runtime check. npm resolves ranges; this verifies that the
 * reviewed declaration, lockfile and installed package have not drifted apart.
 * It does not certify installed bytes against registry integrity or grant trust.
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
  return { root, entrypoint, packageJsonPath, declaredRange, lockedVersion, version };
}
