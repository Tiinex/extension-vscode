'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const file = path.join(__dirname, '../src/operatorParty.ts');
const js = ts.transpileModule(fs.readFileSync(file,'utf8'), {fileName:file,reportDiagnostics:true,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}});
assert.equal((js.diagnostics||[]).filter(x=>x.category===ts.DiagnosticCategory.Error).length,0);
let report=[]; let releaseChoices; let qualified=0; let pickedItems;
const choicesPending=new Promise(resolve=>{releaseChoices=resolve;});
const vscode={
  QuickPickItemKind:{Separator:1},
  window:{
    withProgress(options,worker){report.push(`shown:${options.title}`);return worker({report({message}){report.push(message);}});},
    async showQuickPick(items){pickedItems=items;return items.find(item=>item.action==='none');},
    async showInputBox(){throw Error('unexpected manual entry');}
  },
  workspace:{getConfiguration(){return {inspect(){return {globalValue:''}},async update(){},};}},
  ConfigurationTarget:{Workspace:1,Global:2},
  ProgressLocation:{Notification:1}
};
const modules={
  vscode,
  './packageBuilder':{loadQualifiedLocalWorkspaceChoices:async()=>{throw Error('should use host-shared choices')},loadOperatorPartySurfaceForSources:async(_,sources)=>{qualified++;return {candidates:[],scopes:[]};}},
  './vscode/partyReferencePresentation':{groupPartyReferenceCandidates:()=>[]},
  './core/handoffEndpointSelection':{},
  './core/operatorPartySourceScope':{scopedOperatorPartySources:()=>[]},
  './core/orderedBoundedMap':{orderedBoundedMap:async(items,_,fn)=>Promise.all(items.map(fn))}
};
const moduleOut={exports:{}};
new Function('require','module','exports',js.outputText)(id=>{assert.ok(id in modules,`unexpected dependency ${id}`);return modules[id]},moduleOut,moduleOut.exports);
(async()=>{
  const result=moduleOut.exports.pickOperatorParty('/qualified/extension',()=>choicesPending);
  assert.deepEqual(report.slice(0,2),['shown:Tiinex · Finding qualified Roles and Parties','Discovering local Workspace sources…'], 'visible progress precedes waiting for Core');
  assert.equal(qualified,0,'no projection before Workspace choices resolved');
  releaseChoices([{workspaceId:'vscode',root:'/qualified/workspace'}]);
  const selected=await result;
  assert.equal(selected.state,'none');
  assert.equal(qualified,1,'one Core projection for one Workspace');
  assert.ok(report.some(item=>item.includes('Qualifying Roles')));
  assert.equal(pickedItems.length,2,'picker is populated only after Core projection');
  console.log('PASS Operator Party: immediate progress, waits for Core qualification, no extra Workspace discovery');
})().catch(error=>{console.error(error);process.exitCode=1});
