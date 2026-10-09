import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const entry = path.join(path.dirname(fileURLToPath(import.meta.url)), 'package-vsix.mjs');
const command = spawnSync(process.execPath, [entry], { stdio: 'inherit', env: { ...process.env, TIINEX_VSIX_RELEASE: '1' } });
if (command.error) throw command.error;
process.exitCode = command.status ?? 1;
