import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const packageJson = JSON.parse(await readFile(path.join(ROOT, 'package.json'), 'utf8'));
const OUT = path.join(ROOT, 'dist', `tiinex-vscode-${packageJson.version}.vsix`);
const CORE_NAME = '@tiinex/core';
const table=(()=>{const t=new Uint32Array(256);for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=(c&1)?0xedb88320^(c>>>1):c>>>1;t[n]=c>>>0;}return t;})();

// Remove any previous candidate before dependency qualification so a failed build
// cannot leave a stale VSIX looking current.
await rm(OUT, { force: true });

const corePackageJsonPath = require.resolve(`${CORE_NAME}/package.json`, { paths: [ROOT] });
const coreRoot = path.dirname(corePackageJsonPath);
const corePackage = JSON.parse(await readFile(corePackageJsonPath, 'utf8'));
const declaredCoreRange = packageJson.dependencies?.[CORE_NAME] ?? packageJson.devDependencies?.[CORE_NAME] ?? null;
if (!declaredCoreRange) throw new Error('tiinex.vsix.core-dependency-missing');
if (corePackage.name !== CORE_NAME) throw new Error(`tiinex.vsix.core-name-mismatch:${corePackage.name || 'unknown'}`);
const lockfile = JSON.parse(await readFile(path.join(ROOT, 'package-lock.json'), 'utf8'));
const lockedCoreVersion = lockfile.packages?.[`node_modules/${CORE_NAME}`]?.version ?? null;
if (!lockedCoreVersion) throw new Error('tiinex.vsix.core-lock-missing');
if (corePackage.version !== lockedCoreVersion) throw new Error(`tiinex.vsix.core-version-mismatch:${corePackage.version || 'unknown'}:${lockedCoreVersion}`);
const coreEntrypoint = require.resolve(`${CORE_NAME}/portable-entry`, { paths: [ROOT] });
const coreEntrypointRelative = safeContainedRelative(coreRoot, coreEntrypoint);

const files = [];
for (const relative of ['LICENSE', 'NOTICE', 'README.md', 'package.json']) files.push([`extension/${relative}`, await readFile(path.join(ROOT, relative))]);
for (const relative of await walk(path.join(ROOT, 'dist'))) {
  if (relative.endsWith('.vsix')) continue;
  files.push([`extension/dist/${relative}`, await readFile(path.join(ROOT, 'dist', relative))]);
}
const coreFiles = [];
for (const relative of await walk(coreRoot)) {
  const data = await readFile(path.join(coreRoot, relative));
  coreFiles.push([relative, data]);
  files.push([`extension/node_modules/@tiinex/core/${relative}`, data]);
}
for (const relative of await walk(path.join(ROOT, 'media'))) files.push([`extension/media/${relative}`, await readFile(path.join(ROOT, 'media', relative))]);

const coreRepresentation = representationReceipt(coreFiles);
const contentTypes = `<?xml version="1.0" encoding="utf-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="json" ContentType="application/json"/><Default Extension="js" ContentType="application/javascript"/><Default Extension="mjs" ContentType="application/javascript"/><Default Extension="map" ContentType="application/json"/><Default Extension="md" ContentType="text/markdown"/><Default Extension="txt" ContentType="text/plain"/><Default Extension="" ContentType="application/octet-stream"/><Override PartName="/extension.vsixmanifest" ContentType="text/xml"/></Types>`;
const manifest = `<?xml version="1.0" encoding="utf-8"?><PackageManifest Version="2.0.0" xmlns="http://schemas.microsoft.com/developer/vsx-schema/2011"><Metadata><Identity Language="en-US" Id="${escapeXml(packageJson.name)}" Version="${escapeXml(packageJson.version)}" Publisher="${escapeXml(packageJson.publisher)}"/><DisplayName>${escapeXml(packageJson.displayName)}</DisplayName><Description xml:space="preserve">${escapeXml(packageJson.description)}</Description><Tags>Tiinex</Tags><Categories>Other</Categories><Properties><Property Id="Microsoft.VisualStudio.Code.Engine" Value="${escapeXml(packageJson.engines.vscode)}"/></Properties></Metadata><Installation><InstallationTarget Id="Microsoft.VisualStudio.Code"/></Installation><Dependencies/><Assets><Asset Type="Microsoft.VisualStudio.Code.Manifest" Path="extension/package.json" Addressable="true"/></Assets></PackageManifest>`;
files.unshift(['extension.vsixmanifest', Buffer.from(manifest)], ['[Content_Types].xml', Buffer.from(contentTypes)]);
files.sort((a,b)=>a[0].localeCompare(b[0]));
await mkdir(path.dirname(OUT), { recursive: true });
const bytes = zipStored(files);
await writeFile(OUT, bytes);
const candidateSha256 = createHash('sha256').update(bytes).digest('hex');
console.log(JSON.stringify({
  status: 'ready',
  output: OUT,
  bytes: bytes.length,
  sha256: candidateSha256,
  entries: files.length,
  runtime: {
    package: CORE_NAME,
    version: corePackage.version,
    declaredRange: declaredCoreRange,
    lockedVersion: lockedCoreVersion,
    portableEntrypoint: coreEntrypointRelative,
    files: coreRepresentation.files,
    bytes: coreRepresentation.bytes,
    representationSha256: coreRepresentation.sha256
  },
  freshness: 'prior-candidate-removed-before-runtime-qualification'
}));

async function walk(root) {
  const out=[];
  async function visit(dir, prefix='') {
    for (const name of (await readdir(dir)).sort()) {
      const abs=path.join(dir,name); const rel=prefix ? `${prefix}/${name}` : name;
      const info=await stat(abs);
      if (info.isDirectory()) await visit(abs,rel); else if (info.isFile()) out.push(rel);
    }
  }
  await visit(root); return out;
}
function safeContainedRelative(root, target) {
  const relative = path.relative(path.resolve(root), path.resolve(target)).replace(/\\/g, '/');
  if (!relative || relative === '..' || relative.startsWith('../') || path.isAbsolute(relative)) throw new Error('tiinex.vsix.core-entrypoint-outside-package');
  return relative;
}
function representationReceipt(items) {
  const h=createHash('sha256'); let bytes=0;
  for (const [name,data0] of [...items].sort((a,b)=>a[0].localeCompare(b[0]))) {
    const data=Buffer.from(data0); bytes+=data.length;
    h.update(Buffer.from(name.replace(/\\/g,'/'),'utf8')); h.update(Buffer.from([0]));
    h.update(createHash('sha256').update(data).digest());
  }
  return { files: items.length, bytes, sha256: h.digest('hex') };
}
function zipStored(items) {
  const locals=[]; const centrals=[]; let offset=0;
  for (const [name,data0] of items) {
    const data=Buffer.from(data0); const n=Buffer.from(name.replace(/\\/g,'/')); const crc=crc32(data);
    const local=Buffer.alloc(30+n.length); local.writeUInt32LE(0x04034b50,0); local.writeUInt16LE(20,4); local.writeUInt16LE(0x800,6); local.writeUInt16LE(0,8); local.writeUInt16LE(0,10); local.writeUInt16LE(0,12); local.writeUInt32LE(crc,14); local.writeUInt32LE(data.length,18); local.writeUInt32LE(data.length,22); local.writeUInt16LE(n.length,26); n.copy(local,30);
    locals.push(local,data);
    const central=Buffer.alloc(46+n.length); central.writeUInt32LE(0x02014b50,0); central.writeUInt16LE(0x0314,4); central.writeUInt16LE(20,6); central.writeUInt16LE(0x800,8); central.writeUInt16LE(0,10); central.writeUInt16LE(0,12); central.writeUInt16LE(0,14); central.writeUInt32LE(crc,16); central.writeUInt32LE(data.length,20); central.writeUInt32LE(data.length,24); central.writeUInt16LE(n.length,28); central.writeUInt16LE(0,30); central.writeUInt16LE(0,32); central.writeUInt16LE(0,34); central.writeUInt16LE(0,36); central.writeUInt32LE((0o100644 * 65536) >>> 0,38); central.writeUInt32LE(offset,42); n.copy(central,46); centrals.push(central); offset += local.length+data.length;
  }
  const centralOffset=offset; const centralBytes=centrals.reduce((n,b)=>n+b.length,0); const eocd=Buffer.alloc(22); eocd.writeUInt32LE(0x06054b50,0); eocd.writeUInt16LE(items.length,8); eocd.writeUInt16LE(items.length,10); eocd.writeUInt32LE(centralBytes,12); eocd.writeUInt32LE(centralOffset,16);
  return Buffer.concat([...locals,...centrals,eocd]);
}
function escapeXml(value) { return String(value).replace(/[&<>"']/g,(c)=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;' }[c])); }
function crc32(data){let c=0xffffffff;for(const b of data)c=table[(c^b)&255]^(c>>>8);return(c^0xffffffff)>>>0;}
