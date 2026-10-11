'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const ts=require('typescript');
const source=fs.readFileSync(path.join(__dirname,'../src/operatorTrees.ts'),'utf8');
const start=source.indexOf('  private async guidedHandoffTransportText(');
const end=source.indexOf('  private async guidedEntryTransportText(',start);
assert(start>0&&end>start);
const code=`class Harness { ${source.slice(start,end)} } module.exports=Harness;`;
const compiled=ts.transpileModule(code,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}});
const calls=[];let response;
const mock={module:{exports:{}},exports:{},
 vscode:{workspace:{workspaceFolders:[],},window:{showQuickPick:async(items,opts)=>{calls.push(['pick',items,opts]);return response===undefined ? undefined : items.find(item=>item.id===response.id);}}},
 prepareHostCoreRuntime:async()=>({dispose:async()=>calls.push(['dispose'])}),nodeExecutable:()=>'/node',
 projectWorkspaceCarrierEntry:async(_r,_p,mode,_instruction,_role,_participants,route)=>{
  calls.push(['catalog',mode,route]);return {status:'ready',state:'catalog',targets:[
   {id:'NONE',targetKind:'none',label:'Generic / no target'},
   {id:'target:chatgpt',label:'ChatGPT Web',targetKind:'interactive-web-host'}]};
 },
 projectTransportCompletion:async(_r,_p,selection)=>{
  calls.push(['receipt',selection]);return {status:'ready',clipboardText:'exact Core text'};
 }
};
vm.runInNewContext(compiled.outputText,mock);
(async()=>{
 const harness=new mock.module.exports();harness.extensionPath='/extension';
 const item={packagePath:'/pkg.zip'};const route='qualified-route';
 response={id:'target:chatgpt',kind:'interactive-web-host'};
 const actual=await harness.guidedHandoffTransportText(item,route);
 assert.equal(actual.clipboardText,'exact Core text');
 assert.equal(calls.filter(x=>x[0]==='pick').length,1,'Where is the only prompt');
 assert.equal(calls.find(x=>x[0]==='pick')[2].title,'Guided Handoff · Where');
 assert.deepEqual(JSON.parse(JSON.stringify(calls.find(x=>x[0]==='receipt')[1])),{route,targetEntryId:'target:chatgpt'});
 calls.length=0;response={id:'NONE',kind:'none'};await harness.guidedHandoffTransportText(item,route);
 assert.deepEqual(JSON.parse(JSON.stringify(calls.find(x=>x[0]==='receipt')[1])),{route,targetEntryId:''});
 calls.length=0;response=undefined;assert.equal(await harness.guidedHandoffTransportText(item,route),null);
 assert.equal(calls.filter(x=>x[0]==='receipt').length,0,'cancel does not project clipboard');
 assert.doesNotMatch(source.slice(source.indexOf('  private async guidedEntryTransport('),source.indexOf('  private async copyTransportText(')),/return this\.copyTransportText/,'Guided Entry must not delegate to Guided Handoff');
 console.log('PASS formal Guided Handoff prompts only Where, Generic, Cancel, and immutable route');
})().catch(e=>{console.error(e);process.exitCode=1});
