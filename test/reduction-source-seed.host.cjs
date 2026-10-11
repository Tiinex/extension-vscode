'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const ts = require('typescript');
const s = fs.readFileSync(path.join(__dirname, '../src/operatorTrees.ts'), 'utf8');
const start = s.indexOf('  private async reductionSourceContextSeed(');
const end = s.indexOf('  private async pickArtifactSchema(', start);
assert(start > 0 && end > start);
const compiled = ts.transpileModule('class Harness { ' + s.slice(start,end) + ' } module.exports = Harness;', {compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}});
const choices=[{workspaceId:'native',root:'/tmp/native'},{workspaceId:'vscode',root:'/tmp/vscode'}];
let selection='none', unresolved=false, answer='Continue manually';
const calls=[];const messages=[];
const environment={module:{exports:{}},exports:{},
  vscode:{ProgressLocation:{Notification:15},window:{showQuickPick:async (xs)=>xs.find(x=>x.scope===selection),withProgress:async (_opts,fn)=>fn(),showWarningMessage:async (...args)=>{messages.push(args[0]);return answer;},showInformationMessage:async(...args)=>{messages.push(args[0]);}}},
  listDeletedTiinexArtifacts:async(root,id)=>{calls.push(id);if(unresolved&&id==='native')throw new Error('git unavailable');return [{workspaceId:id,path:'.topics/work/001.trace.md',parentPath:'',permalink:`https://github.com/Tiinex/${id}/blob/${'a'.repeat(40)}/.topics/work/001.trace.md`,declaredV2:'A'.repeat(43)}];},
  renderDeletedReductionSourceContext:items=>items.map(x=>x.workspaceId).join(','),
  shortMessage:e=>e.message,
};
vm.runInNewContext(compiled.outputText,environment);
(async()=>{
const h = new environment.module.exports();h.localWorkspaceChoices=async()=>choices;
selection='none';assert.deepEqual(JSON.stringify(await h.reductionSourceContextSeed(choices[0])),'{}');assert.equal(calls.length,0);
selection='workspace';assert.equal((await h.reductionSourceContextSeed(choices[0]))['Source Context'],'native');assert.deepEqual(calls,['native']);
selection='multi';assert.equal((await h.reductionSourceContextSeed(choices[0]))['Source Context'],'native,vscode');assert.deepEqual(calls,['native','native','vscode']);
selection='multi';unresolved=true;answer='Continue manually';assert.equal((await h.reductionSourceContextSeed(choices[0]))['Source Context'],'vscode');assert(messages.some(x=>x.includes('unavailable')));
answer='Cancel';assert.equal(await h.reductionSourceContextSeed(choices[0]),null);
console.log('PASS Reduction source choice: none, single, multi, partial Git fallback, cancel');
})().catch(e=>{console.error(e);process.exitCode=1});
