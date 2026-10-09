import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';
const require = createRequire(import.meta.url);
const extensionRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const explicit = String(process.env.TIINEX_TEST_CORE_ROOT || '').trim();
const installed = explicit || path.dirname(require.resolve('@tiinex/core/package.json'));
const testFile = path.join(extensionRoot, 'test/lineageMaintenance.integration.cjs');
const child = spawnSync(process.execPath, [testFile], {
  stdio: 'inherit', env: { ...process.env, TIINEX_TEST_CORE_ROOT: installed }
});
if (child.error) throw child.error;
process.exitCode = child.status ?? 1;
