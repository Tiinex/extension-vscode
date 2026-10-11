'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const cp = require('node:child_process');
const ts = require('typescript');
const { createRequire } = require('node:module');
require.extensions['.ts'] = function(module, filename) {
  const code = ts.transpileModule(fs.readFileSync(filename,'utf8'), {compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText;
  module._compile(code,filename);
};
const { listDeletedTiinexArtifacts } = require('../src/host/git.ts');
const { deletedReductionLeaves, renderDeletedReductionSourceContext, historicalParentPath, historicalDeclaredV2 } = require('../src/core/reductionDeletionPrefill.ts');
function git(cwd,...args){return cp.execFileSync('git',args,{cwd,encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim()}
function makeRepo(root,id){fs.mkdirSync(root,{recursive:true});git(root,'init','-q');git(root,'config','user.email','example@example.com');git(root,'config','user.name','Fixture');git(root,'remote','add','origin',`https://github.com/Tiinex/${id}.git`);return root}
const hash='A'.repeat(43);
function artifact(root,id,parent){const file=`.topics/work/experiments/${id}-artifact.trace.md`,pathAbs=path.join(root,file);fs.mkdirSync(path.dirname(pathAbs),{recursive:true});const parentBlock=parent?`- Parent\n  - Trace: [parent](${parent}-artifact.trace.md)\n`:'';fs.writeFileSync(pathAbs,`# Continuity Context\n\n${parentBlock}- Current\n  - Current Schema: tiinex.evidence.v1\n---\n# ${id}\n# Continuity Integrity\n\n- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/${'0'.repeat(40)}/validator.md)\n  - Towards: self\n  - Value: ${hash}\n`);return file}
test('real Git: staged and unstaged deletion leaf-only, no sibling and no mutation', async t=>{const dir=fs.mkdtempSync(path.join(os.tmpdir(),'tiinex-reduction-git-'));t.after(()=>fs.rmSync(dir,{force:true,recursive:true}));const business=makeRepo(path.join(dir,'business'),'business'), vscode=makeRepo(path.join(dir,'extension-vscode'),'extension-vscode');
const listBusiness=[['001',null],['001-1','001'],['001-1-1','001-1'],['001-1-1-1','001-1-1'],['001-1-1-2','001-1-1'],['002',null],['003',null]];
const listVscode=[['001',null],['001-1','001'],['001-1-1','001-1'],['001-1-1-1','001-1-1']];
const filesB=listBusiness.map(([id,parent])=>artifact(business,id,parent)), filesV=listVscode.map(([id,parent])=>artifact(vscode,id,parent));git(business,'add','-A');git(business,'commit','-qm','fixture');git(vscode,'add','-A');git(vscode,'commit','-qm','fixture');
for(const file of filesB.slice(0,6))fs.unlinkSync(path.join(business,file));for(const file of filesV)fs.unlinkSync(path.join(vscode,file));
// Mix staged and unstaged deletions: both must be included exactly once.
git(business,'add','--',filesB[0],filesB[1]);
const b=await listDeletedTiinexArtifacts(business,'business');const v=await listDeletedTiinexArtifacts(vscode,'vscode');assert.equal(b.length,6);assert.equal(v.length,4);
const leaves=deletedReductionLeaves([...b,...v]);assert.deepEqual(leaves.map(x=>`${x.workspaceId}:${path.posix.basename(x.path).split('-artifact')[0]}`),['business:001-1-1-1','business:001-1-1-2','business:002','vscode:001-1-1-1']);
assert(leaves.every(x=>x.declaredV2===hash));assert(leaves.every(x=>x.permalink.startsWith('https://github.com/Tiinex/')));
const view=renderDeletedReductionSourceContext([...b,...v]);assert.equal((view.match(/blob\//g)||[]).length,4);assert(!view.includes('[001-1-1-artifact.trace.md]('));assert(!view.includes('003-artifact'));
assert.equal(git(business,'status','--porcelain').split('\n').length,6);assert(fs.existsSync(path.join(business,filesB[6])));
});
test('source extraction never infers lineage from similar filenames',()=>{assert.equal(historicalParentPath('# Hi\n- Current\n', '.topics/a/001-1.trace.md'),'');assert.equal(historicalDeclaredV2('# Continuity Integrity\n- [sha256-base64url-c14n-v2](x)\n  - Towards: self\n  - Value: '+hash),hash)});
test('missing Git is a recoverable read-only error',async t=>{const dir=fs.mkdtempSync(path.join(os.tmpdir(),'tiinex-reduction-nogit-'));t.after(()=>fs.rmSync(dir,{recursive:true,force:true}));await assert.rejects(()=>listDeletedTiinexArtifacts(dir,'no-git'))});
