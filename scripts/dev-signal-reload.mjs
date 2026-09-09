import { randomUUID } from 'node:crypto';
import { readFile, realpath, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const markerDir = path.join(ROOT, '.tiinex-dev');
const markerPath = path.join(markerDir, 'linked.json');
const reloadPath = path.join(markerDir, 'reload.json');

let marker;
try { marker = JSON.parse(await readFile(markerPath, 'utf8')); }
catch {
  console.log('Tiinex local build complete. No linked development checkout is active; run the "Tiinex: Link this checkout" task once for in-place reload prompts.');
  process.exit(0);
}

let linkedTarget = '';
try { linkedTarget = await realpath(marker.linkPath); } catch { linkedTarget = ''; }
if (!linkedTarget || path.resolve(linkedTarget) !== ROOT) {
  console.log('Tiinex local build complete, but the recorded development link is not active. Run "Tiinex: Link this checkout" again.');
  process.exit(0);
}

await writeFile(reloadPath, `${JSON.stringify({ generation: randomUUID(), builtAt: new Date().toISOString() })}\n`, 'utf8');
console.log('Tiinex linked build complete. The running Tiinex extension will offer Restart Extensions.');
