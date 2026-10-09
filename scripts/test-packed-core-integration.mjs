/** Offline Core package -> clean temp installation -> actual VS Code host tests.
 * This gate exercises the consumer's npm package, not a sibling source import.
 * No registry access, publishing, or source directory mutation is involved.
 */
import { mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const exec = promisify(execFile);
const workspace = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const core = path.resolve(process.env.TIINEX_TEST_CORE_ROOT || path.join(workspace, '..', 'core'));
const native = String(process.env.TIINEX_TEST_NATIVE_ROOT || '').trim();
const docs = String(process.env.TIINEX_TEST_DOCS_ROOT || '').trim();
if (!native || !docs) throw new Error('packed-core-integration.requires-explicit-native-and-docs-roots');
const packageInfo = JSON.parse(await readFile(path.join(core, 'package.json'),'utf8'));
if (packageInfo.name !== '@tiinex/core') throw new Error('packed-core-integration.source-not-core');
const temp = await mkdtemp(path.join(tmpdir(),'tiinex-packed-core-'));
try {
  const { stdout } = await exec('npm', ['pack', '--offline', '--ignore-scripts', '--silent', '--pack-destination',temp],{cwd:core,maxBuffer:4*1024*1024});
  const name = stdout.trim().split(/\r?\n/).filter(Boolean).at(-1);
  const tarball = path.join(temp,name || '');
  if (!name?.endsWith('.tgz') || !(await readdir(temp)).includes(name)) throw new Error('packed-core-integration.tarball-missing');
  const app=path.join(temp,'consumer');
  await (await import('node:fs/promises')).mkdir(app);
  await writeFile(path.join(app,'package.json'),JSON.stringify({name:'tiinex-offline-consumer',private:true,version:'0.0.0',type:'module'}));
  await exec('npm',['install','--offline','--ignore-scripts','--no-audit','--no-fund','--package-lock=false','--no-save',tarball],{cwd:app,maxBuffer:4*1024*1024});
  const installed=path.join(app,'node_modules','@tiinex','core');
  const installedInfo=JSON.parse(await readFile(path.join(installed,'package.json'),'utf8'));
  if (installedInfo.name !== packageInfo.name || installedInfo.version !== packageInfo.version) throw new Error('packed-core-integration.package-identity-drift');
  const cli=await exec(process.execPath,[path.join(installed,'tools','tiinex-portable.mjs'),'inspect-agent-capabilities','--query','lineage','--compact'],{cwd:app,maxBuffer:4*1024*1024});
  const agent=JSON.parse(cli.stdout);
  if (agent.status!=='ready' || agent.operation!=='inspect-agent-capabilities' || !agent.operations?.length || agent.operations.some(x=>x.hostExecution!=='not-qualified')) throw new Error('packed-core-integration.agent-abi-mismatch');
  const env={...process.env,TIINEX_TEST_CORE_ROOT:installed,TIINEX_TEST_NATIVE_ROOT:native,TIINEX_TEST_DOCS_ROOT:docs};
  for(const script of ['test:authoring-boundaries','test:transition-roundtrip']) {
    const result=await exec('npm',['run',script],{cwd:workspace,env,maxBuffer:8*1024*1024});
    process.stdout.write(result.stdout);
    if (result.stderr) process.stderr.write(result.stderr);
  }
  console.log(`PASS offline npm Core .tgz (${packageInfo.version}) -> isolated installation -> host P0 + agent + Transition integration`);
} finally { await rm(temp,{recursive:true,force:true}); }
