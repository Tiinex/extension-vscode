'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ts=require('typescript');
const source=fs.readFileSync(path.join(__dirname,'../src/vscode/incomingWorkspacePicker.ts'),'utf8');
const js=ts.transpileModule(source,{fileName:'incomingWorkspacePicker.ts',compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
let picker;
const vscode={window:{createQuickPick(){
 const listeners={selection:[],accept:[],hide:[]}; let selected=[];
 picker={items:[],busy:false,placeholder:'',shown:false,disposed:false,
  set selectedItems(v){selected=v;for(const h of listeners.selection)h(v)},get selectedItems(){return selected},
  onDidChangeSelection(fn){listeners.selection.push(fn);return {dispose(){}}},
  onDidAccept(fn){listeners.accept.push(fn);return {dispose(){}}},
  onDidHide(fn){listeners.hide.push(fn);return {dispose(){}}},
  show(){this.shown=true},dispose(){this.disposed=true},
  accept(){for(const fn of listeners.accept)fn()},
  select(v){this.selectedItems=v}
 };
 return picker;
}}};
const mod={exports:{}};
new Function('require','module','exports',js)((id)=>{if(id==='vscode')return vscode;throw Error('unexpected dependency '+id)},mod,mod.exports);
const {pickIncomingWorkspaces}=mod.exports;
const choices=Array.from({length:17},(_,i)=>({workspaceId:`workspace-${i}`,label:`Workspace ${i}`,description:'',detail:''}));
const tick=()=>new Promise(resolve=>setImmediate(resolve));
(async()=>{
 let finish; const pending=new Promise(resolve=>finish=resolve);
 const p=pickIncomingWorkspaces(choices,()=>pending,'Review Replace Plan');
 assert.equal(picker.shown,true);
 assert.equal(picker.busy,true);
 assert.equal(picker.selectedItems.length,0,'all 17 must never be default-selected during qualification');
 finish(new Set(choices.slice(0,16).map(x=>x.workspaceId))); await tick();
 assert.deepEqual(picker.selectedItems.map(x=>x.workspaceId),['workspace-16']);
 picker.accept(); assert.deepEqual(await p,['workspace-16']);
 let settle;const late=new Promise(resolve=>settle=resolve);
 const q=pickIncomingWorkspaces(choices,()=>late,'Review Replace Plan');
 assert.equal(picker.selectedItems.length,0);
 picker.select([picker.items[4]]);settle(new Set(choices.slice(0,16).map(x=>x.workspaceId)));await tick();
 assert.deepEqual(picker.selectedItems.map(x=>x.workspaceId),['workspace-4'],'preserve explicit choice after async completion');
 picker.accept();assert.deepEqual(await q,['workspace-4']);
 const failed=pickIncomingWorkspaces(choices,async()=>{throw Error('offline')},'Review');await tick();
 assert.equal(picker.selectedItems.length,0,'no unsafe fallback to all on comparison failure');
 assert.match(picker.placeholder,/unavailable/); picker.select([picker.items[1]]);picker.accept();assert.deepEqual(await failed,['workspace-1']);
 console.log('PASS Replace picker: zero speculative defaults, exact-one late defaults, preserve manual edits, fail-closed fallback');
})().catch(e=>{console.error(e);process.exitCode=1});
