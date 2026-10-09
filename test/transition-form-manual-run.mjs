import fs from 'node:fs';
import assert from 'node:assert/strict';
import path from 'node:path';
import os from 'node:os';
import {createRequire, Module} from 'node:module';
import {fileURLToPath} from 'node:url';
import {buildArtifactCreationContract} from '@tiinex/core/schemas/creation.contracts.js';
const require=createRequire(import.meta.url);
const ts=require('typescript');
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../src'); const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'tiinex-transition-form-'));
const output=process.env.TIINEX_MANUAL_FORM_OUTPUT || fs.mkdtempSync(path.join(os.tmpdir(),'tiinex-transition-html-'));fs.mkdirSync(output,{recursive:true});
for(const f of ['core/artifactAuthoringModel.ts','artifactAuthoringPanel.ts']){
 const source=fs.readFileSync(path.join(root,f),'utf8'); const result=ts.transpileModule(source,{fileName:f,reportDiagnostics:true,compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,esModuleInterop:true}});
 if(result.diagnostics?.some(d=>d.category===ts.DiagnosticCategory.Error))throw new Error(JSON.stringify(result.diagnostics));
 const dest=path.join(tmp,f.replace(/\.ts$/,'.js'));fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,result.outputText);
}
let panel;
const mock={ window:{activeTextEditor:null,createWebviewPanel(){panel={webview:{html:'',onDidReceiveMessage(handler){panel.receive=handler;return{dispose(){}}},postMessage:async()=>{}},onDidDispose:()=>{},dispose(){}};return panel}},ViewColumn:{One:1}};
const old=Module._load;Module._load=function(id,...args){if(id==='vscode')return mock;return old.call(this,id,...args)};
const {projectArtifactAuthoringModel}=require(path.join(tmp,'core/artifactAuthoringModel.js'));
const {openArtifactAuthoringPanel}=require(path.join(tmp,'artifactAuthoringPanel.js'));
for(const schemaId of ['tiinex.transition.definition.v1','tiinex.schema.transition.companion.v1','tiinex.evidence.v1']){
 const contract=buildArtifactCreationContract({schemaId});if(contract.status!=='ready')throw Error('not-ready:'+schemaId);
 const model=projectArtifactAuthoringModel(contract,{});
 const fake={model,workspaces:[{workspaceId:'test',label:'Local',description:'LOCAL'}],selectedWorkspaceId:'test',attachAvailable:false,attachDefault:false,enableSaveAsTransition:schemaId==='tiinex.evidence.v1',templates:[],initialValues:{},sourceContextLabel:'Test evidence'};
 const events=[];openArtifactAuthoringPanel(fake,{create:async()=>{},preview:async()=>{},saveTransition:async(payload)=>events.push(payload)});
 if(schemaId==='tiinex.evidence.v1'){await panel.receive({type:'save-transition',payload:{workspaceId:'test',title:'Partial Evidence',values:{'Supported Claim Or Question':{ 'Supported Claim Or Question':'What changed?' }}}});assert.equal(events.length,1);assert.equal(events[0].title,'Partial Evidence')}
 else {await panel.receive({type:'save-transition',payload:{workspaceId:'test',title:'Forbidden',values:{}}});assert.equal(events.length,0);}
 const html=panel.webview.html;
 fs.writeFileSync(path.join(output,`${schemaId.replaceAll('.','-')}-form-real.html`),html);
 console.log('HTML',schemaId,html.length,'MODEL',model.sections.map(s=>s.key+':'+s.kind+':'+(s.parts?.length||0)).join(', '));
}
Module._load=old;
console.log('OUTPUT_DIR',output);
