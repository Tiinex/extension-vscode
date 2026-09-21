import { access, cp, mkdir, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FIXTURE_ROOT = path.join(ROOT, 'test', 'extension-host', 'fixtures');
const FIXTURE_SOURCE = path.join(FIXTURE_ROOT, 'source-workspace');
const FIXTURE_PACKAGE = path.join(FIXTURE_ROOT, 'incoming-pointerless.handoff-package.zip');
const FIXTURE_MANIFEST = path.join(FIXTURE_ROOT, 'manifest.json');
const args = parseArgs(process.argv.slice(2));
const cli = await resolveVsCodeCli(args.cli || process.env.TIINEX_VSCODE_CLI || '');
if (!cli) throw new Error('tiinex.extension-host.vscode-cli-unavailable');
await run(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run', 'build'], { cwd: ROOT });
await access(path.join(ROOT, 'dist', 'extension.js')).catch(() => { throw new Error('tiinex.extension-host.dist-unavailable:build-did-not-emit-extension'); });
const fixture = await verifyFixture();

const modes = args.mode === 'both' ? ['local', 'published'] : [args.mode];
const scratch = await mkdtemp(path.join(os.tmpdir(), 'tiinex-vscode-extension-host-'));
const modePath = path.join(ROOT, '.vscode', 'link', 'dependency-mode.json');
let priorMode = null;
try { priorMode = await readFile(modePath); } catch { /* absent */ }

try {
  await mkdir(path.dirname(modePath), { recursive: true });
  for (const mode of modes) {
    if (mode === 'local') await assertLocalCore(args.localCore);
    else await assertPublishedCore();
    const state = mode === 'local' ? { mode, coreRoot: path.resolve(args.localCore) } : { mode };
    await writeFile(modePath, `${JSON.stringify(state, null, 2)}\n`, 'utf8');

    const userData = path.join(scratch, `user-${mode}`);
    const extensionsDir = path.join(scratch, `extensions-${mode}`);
    const workspace = path.join(scratch, `workspace-${mode}`);
    const outputDir = path.join(scratch, `outgoing-${mode}`);
    await mkdir(userData, { recursive: true });
    await mkdir(extensionsDir, { recursive: true });
    await mkdir(outputDir, { recursive: true });
    await cp(FIXTURE_SOURCE, workspace, { recursive: true, force: true });
    await initializeFixtureRepository(workspace);

    for (let restart = 1; restart <= args.restarts; restart += 1) {
      await run(cli, [
        '--disable-extensions', '--skip-welcome', '--skip-release-notes', '--disable-workspace-trust',
        `--user-data-dir=${userData}`, `--extensions-dir=${extensionsDir}`,
        `--extensionDevelopmentPath=${ROOT}`,
        `--extensionTestsPath=${path.join(ROOT, 'test', 'extension-host', 'suite.cjs')}`,
        workspace
      ], {
        cwd: ROOT,
        env: {
          TIINEX_EXTENSION_HOST_ACCEPTANCE: '1',
          TIINEX_EXTENSION_HOST_ACCEPTANCE_MODE: mode,
          TIINEX_EXTENSION_HOST_ACCEPTANCE_RESTART: String(restart),
          TIINEX_EXTENSION_HOST_FIXTURE_PACKAGE: FIXTURE_PACKAGE,
          TIINEX_EXTENSION_HOST_FIXTURE_MANIFEST: FIXTURE_MANIFEST,
          TIINEX_EXTENSION_HOST_WORKSPACE_ROOT: workspace,
          TIINEX_EXTENSION_HOST_WORKSPACE_ID: fixture.workspaceId,
          TIINEX_EXTENSION_HOST_OUTPUT_DIR: outputDir
        }
      });
    }
  }
} finally {
  if (priorMode) await writeFile(modePath, priorMode);
  else await rm(modePath, { force: true });
  if (!args.keepScratch) await rm(scratch, { recursive: true, force: true });
  else console.log(`Tiinex Extension Host scratch retained: ${scratch}`);
}

async function verifyFixture() {
  const manifest = JSON.parse(await readFile(FIXTURE_MANIFEST, 'utf8'));
  const bytes = await readFile(FIXTURE_PACKAGE);
  const actual = createHash('sha256').update(bytes).digest('hex');
  if (actual !== String(manifest?.package?.sha256 || '')) throw new Error(`tiinex.extension-host.fixture-sha256-mismatch:${actual}`);
  if (!manifest.workspaceId || !Array.isArray(manifest.handoffs) || manifest.handoffs.length !== 2 || !Array.isArray(manifest.participants) || manifest.participants.length < 1) {
    throw new Error('tiinex.extension-host.fixture-manifest-invalid');
  }
  const declaredFiles = Object.keys(manifest.sourceFiles || {}).sort();
  const actualFiles = (await listFiles(FIXTURE_SOURCE)).sort();
  if (JSON.stringify(actualFiles) !== JSON.stringify(declaredFiles)) throw new Error('tiinex.extension-host.fixture-source-file-set-mismatch');
  for (const relative of declaredFiles) {
    const actualFileSha = createHash('sha256').update(await readFile(path.join(FIXTURE_SOURCE, ...relative.split('/')))).digest('hex');
    if (actualFileSha !== String(manifest.sourceFiles[relative] || '')) throw new Error(`tiinex.extension-host.fixture-source-sha256-mismatch:${relative}`);
  }
  return manifest;
}

async function listFiles(root, current = root) {
  const out = [];
  for (const entry of await readdir(current, { withFileTypes: true })) {
    const absolute = path.join(current, entry.name);
    if (entry.isDirectory()) out.push(...await listFiles(root, absolute));
    else if (entry.isFile()) out.push(path.relative(root, absolute).replace(/\\/g, '/'));
  }
  return out;
}

async function initializeFixtureRepository(workspace) {
  await writeFile(path.join(workspace, 'landing-marker.txt'), 'local-before-landing\n', 'utf8');
  await run('git', ['init', '--quiet'], { cwd: workspace, capture: true });
  await run('git', ['config', 'user.email', 'extension-host@example.invalid'], { cwd: workspace, capture: true });
  await run('git', ['config', 'user.name', 'Tiinex Extension Host'], { cwd: workspace, capture: true });
  await run('git', ['add', '-A'], { cwd: workspace, capture: true });
  await run('git', ['commit', '--quiet', '-m', 'fixture baseline'], { cwd: workspace, capture: true });
}

async function assertLocalCore(localCore) {
  if (!localCore) throw new Error('tiinex.extension-host.local-core-required');
  const pkg = JSON.parse(await readFile(path.join(path.resolve(localCore), 'package.json'), 'utf8').catch(() => { throw new Error('tiinex.extension-host.local-core-package-unavailable'); }));
  if (pkg.name !== '@tiinex/core') throw new Error(`tiinex.extension-host.local-core-package-invalid:${pkg.name || ''}`);
  await access(path.join(path.resolve(localCore), 'tools', 'tiinex-portable.mjs')).catch(() => { throw new Error('tiinex.extension-host.local-core-tooling-unavailable'); });
}

async function assertPublishedCore() {
  const lock = JSON.parse(await readFile(path.join(ROOT, 'package-lock.json'), 'utf8'));
  const expected = String(lock?.packages?.['node_modules/@tiinex/core']?.version || '');
  if (!expected) throw new Error('tiinex.extension-host.published-core-lock-unqualified');
  const installed = JSON.parse(await readFile(path.join(ROOT, 'node_modules', '@tiinex', 'core', 'package.json'), 'utf8').catch(() => { throw new Error(`tiinex.extension-host.published-core-unavailable:expected=${expected}`); }));
  if (String(installed.version || '') !== expected) throw new Error(`tiinex.extension-host.published-core-version-mismatch:expected=${expected}:actual=${installed.version || ''}`);
}

function parseArgs(values) {
  const out = { mode: 'both', localCore: process.env.TIINEX_LOCAL_CORE_ROOT || '', cli: '', restarts: 2, keepScratch: false };
  for (let i = 0; i < values.length; i += 1) {
    const value = values[i];
    if (value === '--mode') { out.mode = String(values[++i] || ''); continue; }
    if (value === '--local-core') { out.localCore = String(values[++i] || ''); continue; }
    if (value === '--cli') { out.cli = String(values[++i] || ''); continue; }
    if (value === '--restarts') { out.restarts = Number(values[++i] || 0); continue; }
    if (value === '--keep-scratch') { out.keepScratch = true; continue; }
    throw new Error(`tiinex.extension-host.argument-unsupported:${value}`);
  }
  if (!['local', 'published', 'both'].includes(out.mode)) throw new Error(`tiinex.extension-host.mode-invalid:${out.mode}`);
  if (!Number.isInteger(out.restarts) || out.restarts < 2) throw new Error('tiinex.extension-host.restarts-must-be-at-least-2');
  return out;
}

async function resolveVsCodeCli(explicit) {
  const candidates = [...new Set([explicit, 'code', 'code-insiders', 'codium'].filter(Boolean))];
  for (const candidate of candidates) {
    try { await run(candidate, ['--version'], { cwd: ROOT, capture: true }); return candidate; }
    catch { /* try next */ }
  }
  return '';
}

function run(command, commandArgs, { cwd, env = {}, capture = false } = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, commandArgs, {
      cwd,
      env: { ...process.env, ...env },
      stdio: capture ? ['ignore', 'pipe', 'pipe'] : 'inherit'
    });
    let stdout = '';
    let stderr = '';
    if (capture) {
      child.stdout.setEncoding('utf8'); child.stderr.setEncoding('utf8');
      child.stdout.on('data', (chunk) => { stdout += chunk; });
      child.stderr.on('data', (chunk) => { stderr += chunk; });
    }
    child.on('error', reject);
    child.on('close', (code) => code === 0
      ? resolve({ code, stdout, stderr })
      : reject(new Error(`tiinex.extension-host.command-failed:${command}:${code}:${stderr.trim() || stdout.trim()}`)));
  });
}
