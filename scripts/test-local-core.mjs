import { createHash } from 'node:crypto';
import { cp, mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = parseArgs(process.argv.slice(2));
if (!args.core) throw new Error('tiinex.local-core-acceptance.core-source-required');
const coreRoot = path.resolve(args.core);
const corePackagePath = path.join(coreRoot, 'package.json');
const corePackage = JSON.parse(await readFile(corePackagePath, 'utf8'));
if (corePackage.name !== '@tiinex/core') throw new Error(`tiinex.local-core-acceptance.core-package-name-invalid:${corePackage.name || 'unknown'}`);

const sourceManifestPath = path.join(ROOT, 'package.json');
const sourceLockPath = path.join(ROOT, 'package-lock.json');
const sourceManifestBefore = sha256(await readFile(sourceManifestPath));
const sourceLockBefore = sha256(await readFile(sourceLockPath));
const scratch = await mkdtemp(path.join(os.tmpdir(), 'tiinex-vscode-local-core-acceptance-'));
const harnessRoot = path.join(scratch, 'extension');
const packagesRoot = path.join(scratch, 'packages');
let kept = false;

try {
  await mkdir(packagesRoot, { recursive: true });
  await cp(ROOT, harnessRoot, {
    recursive: true,
    filter(source) {
      const relative = path.relative(ROOT, source);
      if (!relative) return true;
      const first = relative.split(path.sep)[0];
      return !['.git', '.tiinex', 'node_modules', 'dist', '.site-publish'].includes(first);
    }
  });

  const pack = await run(npmExecutable(), ['pack', coreRoot, '--pack-destination', packagesRoot, '--json', '--ignore-scripts'], { cwd: scratch, capture: true });
  let packResult;
  try { packResult = JSON.parse(pack.stdout); }
  catch { throw new Error(`tiinex.local-core-acceptance.pack-invalid-json:${pack.stdout.slice(0, 200)}`); }
  const filename = String(packResult?.[0]?.filename || '').trim();
  if (!filename) throw new Error('tiinex.local-core-acceptance.pack-filename-missing');
  const tarballPath = path.join(packagesRoot, filename);
  const tarballSha256 = sha256(await readFile(tarballPath));
  const localSpec = `file:${path.relative(harnessRoot, tarballPath).replace(/\\/g, '/')}`;

  const manifestPath = path.join(harnessRoot, 'package.json');
  const lockPath = path.join(harnessRoot, 'package-lock.json');
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  manifest.dependencies = { ...(manifest.dependencies || {}), '@tiinex/core': localSpec };
  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');

  const lock = JSON.parse(await readFile(lockPath, 'utf8'));
  if (!lock.packages?.['']) throw new Error('tiinex.local-core-acceptance.lock-root-missing');
  lock.packages[''].dependencies = { ...(lock.packages[''].dependencies || {}), '@tiinex/core': localSpec };
  delete lock.packages['node_modules/@tiinex/core'];
  await writeFile(lockPath, `${JSON.stringify(lock, null, 2)}\n`, 'utf8');

  await run(npmExecutable(), ['install', '--ignore-scripts', '--no-audit', '--no-fund'], { cwd: harnessRoot });

  const installedPackagePath = path.join(harnessRoot, 'node_modules', '@tiinex', 'core', 'package.json');
  const installedPackage = JSON.parse(await readFile(installedPackagePath, 'utf8'));
  if (installedPackage.name !== '@tiinex/core') throw new Error('tiinex.local-core-acceptance.installed-name-mismatch');
  if (String(installedPackage.version || '') !== String(corePackage.version || '')) {
    throw new Error(`tiinex.local-core-acceptance.installed-version-mismatch:${installedPackage.version || 'unknown'}:${corePackage.version || 'unknown'}`);
  }
  const harnessLock = JSON.parse(await readFile(lockPath, 'utf8'));
  const installedRecord = harnessLock.packages?.['node_modules/@tiinex/core'];
  if (!installedRecord || installedRecord.link === true || String(installedRecord.version || '') !== String(corePackage.version || '')) {
    throw new Error('tiinex.local-core-acceptance.lock-binding-unqualified');
  }
  if (String(harnessLock.packages?.['']?.dependencies?.['@tiinex/core'] || '') !== localSpec) {
    throw new Error('tiinex.local-core-acceptance.lock-declaration-mismatch');
  }

  await run(npmExecutable(), ['run', 'validate'], { cwd: harnessRoot, env: { TIINEX_LOCAL_CORE_ACCEPTANCE: '1' } });

  const sourceManifestAfter = sha256(await readFile(sourceManifestPath));
  const sourceLockAfter = sha256(await readFile(sourceLockPath));
  if (sourceManifestAfter !== sourceManifestBefore || sourceLockAfter !== sourceLockBefore) {
    throw new Error('tiinex.local-core-acceptance.durable-manifest-or-lock-mutated');
  }

  const receipt = {
    status: 'ready',
    boundary: 'Disposable exact-local-source Core installation; no publication and no durable extension manifest/lockfile mutation.',
    core: {
      sourceRoot: coreRoot,
      name: corePackage.name,
      version: String(corePackage.version || ''),
      tarball: filename,
      tarballSha256,
      installedVersion: String(installedPackage.version || ''),
      installSpec: localSpec
    },
    extension: {
      sourceRoot: ROOT,
      sourceManifestSha256: sourceManifestAfter,
      sourceLockSha256: sourceLockAfter,
      validation: 'npm run validate'
    },
    harness: args.keep ? harnessRoot : '(disposed)'
  };
  console.log(JSON.stringify(receipt, null, 2));
  kept = Boolean(args.keep);
} finally {
  if (!kept) await rm(scratch, { recursive: true, force: true });
}

function parseArgs(values) {
  const out = { core: '', keep: false };
  for (let i = 0; i < values.length; i += 1) {
    const value = values[i];
    if (value === '--core') { out.core = String(values[++i] || ''); continue; }
    if (value === '--keep') { out.keep = true; continue; }
    throw new Error(`tiinex.local-core-acceptance.argument-unsupported:${value}`);
  }
  return out;
}

function npmExecutable() { return process.platform === 'win32' ? 'npm.cmd' : 'npm'; }
function sha256(bytes) { return createHash('sha256').update(bytes).digest('hex'); }

function run(command, commandArgs, { cwd, capture = false, env = {} } = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, commandArgs, {
      cwd,
      env: { ...process.env, npm_config_audit: 'false', npm_config_fund: 'false', ...env },
      stdio: capture ? ['ignore', 'pipe', 'pipe'] : 'inherit'
    });
    let stdout = '';
    let stderr = '';
    if (capture) {
      child.stdout.setEncoding('utf8');
      child.stderr.setEncoding('utf8');
      child.stdout.on('data', (chunk) => { stdout += chunk; });
      child.stderr.on('data', (chunk) => { stderr += chunk; });
    }
    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) { resolve({ code, stdout, stderr }); return; }
      reject(new Error(`tiinex.local-core-acceptance.command-failed:${command} ${commandArgs.join(' ')}:${code}:${stderr.trim() || stdout.trim()}`));
    });
  });
}
