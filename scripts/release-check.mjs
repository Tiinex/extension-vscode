import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const manifest = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'));
const errors = [];
const warnings = [];

for (const field of ['name', 'displayName', 'description', 'version', 'publisher', 'license', 'repository', 'homepage', 'bugs']) {
  if (!manifest[field] || (typeof manifest[field] === 'string' && !manifest[field].trim())) errors.push(`manifest.${field} missing`);
}
if (!/^[a-z0-9][a-z0-9-]*$/.test(String(manifest.name || ''))) errors.push('manifest.name must be lowercase and Marketplace-safe');
if (!/^\d+\.\d+\.\d+$/.test(String(manifest.version || ''))) errors.push('manifest.version must be major.minor.patch');
if (manifest.license !== 'Apache-2.0') errors.push('manifest.license must use the Apache-2.0 SPDX identifier');
if (!manifest.engines?.vscode || manifest.engines.vscode === '*') errors.push('manifest.engines.vscode must declare a bounded VS Code range');
if (!Array.isArray(manifest.keywords) || manifest.keywords.length < 3) errors.push('manifest.keywords should contain searchable Marketplace terms');
if (!Array.isArray(manifest.categories) || !manifest.categories.length) errors.push('manifest.categories missing');
if (manifest.pricing !== 'Free' && manifest.pricing !== 'Trial') errors.push('manifest.pricing must be Free or Trial');
if (!manifest.galleryBanner?.color || !['dark', 'light'].includes(manifest.galleryBanner?.theme)) errors.push('manifest.galleryBanner must declare color and dark/light theme');
if (manifest.capabilities?.untrustedWorkspaces?.supported !== false) errors.push('manifest must explicitly disable untrusted Workspaces for local Tooling/Git mutation safety');
if (manifest.capabilities?.virtualWorkspaces?.supported !== false) errors.push('manifest must explicitly disable virtual Workspaces for local filesystem/Node/Git requirements');
if (manifest.icon && /\.svg$/i.test(manifest.icon)) errors.push('Marketplace top-level icon cannot be SVG');
if (manifest.icon) {
  await required(manifest.icon);
  const iconBytes = await readFile(path.join(root, manifest.icon));
  if (iconBytes.length < 24 || iconBytes.subarray(1, 4).toString('ascii') !== 'PNG') errors.push('Marketplace top-level icon must be a PNG');
  else {
    const width = iconBytes.readUInt32BE(16);
    const height = iconBytes.readUInt32BE(20);
    if (width < 128 || height < 128) errors.push(`Marketplace icon must be at least 128x128; got ${width}x${height}`);
  }
}
for (const file of ['README.md', 'CHANGELOG.md', 'SUPPORT.md', 'LICENSE', 'NOTICE', '.vscodeignore']) await required(file);

const readme = await readFile(path.join(root, 'README.md'), 'utf8');
const changelog = await readFile(path.join(root, 'CHANGELOG.md'), 'utf8');
for (const [name, markdown] of [['README.md', readme], ['CHANGELOG.md', changelog]]) {
  for (const match of markdown.matchAll(/!\[[^\]]*\]\(([^)]+)\)/g)) {
    const target = match[1].trim();
    if (/^http:\/\//i.test(target)) errors.push(`${name}: image URL must use https: ${target}`);
    if (/\.svg(?:[?#]|$)/i.test(target) && /^https?:\/\//i.test(target)) warnings.push(`${name}: remote SVG images can be rejected by vsce unless provider is trusted: ${target}`);
  }
}

const vscodeignore = await readFile(path.join(root, '.vscodeignore'), 'utf8');
for (const pattern of ['src/**', 'test/**', 'scripts/**', '.topics/**', '.vscode/**', 'dist-audit/**']) {
  if (!vscodeignore.split(/\r?\n/).includes(pattern)) errors.push(`.vscodeignore missing ${pattern}`);
}
const gitignore = await readFile(path.join(root, '.gitignore'), 'utf8');
if (!gitignore.split(/\r?\n/).includes('dist-audit/')) errors.push('.gitignore missing dist-audit/');

// Release automation is intentionally identity-neutral here. Microsoft is retiring
// global Azure DevOps PAT publishing; the CI workflow should supply Entra/workload
// identity credentials rather than committing a long-lived secret contract.
if (!manifest.scripts?.validate) errors.push('scripts.validate missing');


const result = { status: errors.length ? 'blocked' : 'ready', errors, warnings };
console.log(JSON.stringify(result, null, 2));
if (errors.length) process.exitCode = 1;

async function required(relative) {
  try { await access(path.join(root, relative)); }
  catch { errors.push(`required file missing: ${relative}`); }
}
