import assert from 'node:assert/strict';
import { readFile, mkdtemp, mkdir, symlink, writeFile, rm } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { collectVscodeSkillEntries } from '../scripts/skill-packaging.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const manifest=JSON.parse(await readFile(path.join(root,'package.json'),'utf8'));
const entries=await collectVscodeSkillEntries(root,manifest);
assert.ok(entries.some(([name,body])=>name==='extension/skills/tiinex-discovery/SKILL.md' && body.includes('name: tiinex-discovery')));
const unique = new Set(entries.map(([name])=>name));assert.equal(unique.size,entries.length);
const source = await readFile(path.join(root,'scripts/package-vsix.mjs'),'utf8');
assert.match(source,/files\.push\(\.\.\.await collectVscodeSkillEntries\(ROOT, packagedManifest\)\)/);
const temp=await mkdtemp(path.join(os.tmpdir(),'tiinex-vsix-skill-test-'));
try {
  const dir=path.join(temp,'skills','ti-test');await mkdir(dir,{recursive:true});
  await writeFile(path.join(dir,'SKILL.md'),'---\nname: ti-test\n---\n');
  await mkdir(path.join(dir,'references'));await writeFile(path.join(dir,'references','guide.md'),'hello');
  const local={contributes:{chatSkills:[{path:'./skills/ti-test/SKILL.md'}]}};
  assert.deepEqual((await collectVscodeSkillEntries(temp,local)).map(([name])=>name),[
    'extension/skills/ti-test/SKILL.md','extension/skills/ti-test/references/guide.md'
  ]);
  await assert.rejects(()=>collectVscodeSkillEntries(temp,{contributes:{chatSkills:[{path:'./skills/../../outside/SKILL.md'}]}}),/declaration-unsafe/);
  await assert.rejects(()=>collectVscodeSkillEntries(temp,{contributes:{chatSkills:[...local.contributes.chatSkills,...local.contributes.chatSkills]}}),/declaration-duplicate/);
  await symlink('/etc/passwd',path.join(dir,'references','password'));
  await assert.rejects(()=>collectVscodeSkillEntries(temp,local),/symlink-denied/);
  const parent=path.join(temp,'symlink-parent');await mkdir(parent);await symlink(path.join(temp,'skills'),path.join(parent,'skills'));
  await assert.rejects(()=>collectVscodeSkillEntries(parent,local),/skills-root-unsafe/);

}finally {await rm(temp,{recursive:true,force:true});}
console.log('PASS real VSIX pack-list includes all declared skill files and blocks unsafe declarations, duplicate trees and symlinks');
