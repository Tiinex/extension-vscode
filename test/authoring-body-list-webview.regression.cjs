'use strict';
const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');
const vm=require('node:vm');const ts=require('typescript');
const file=path.join(__dirname,'../src/artifactAuthoringPanel.ts');
const output=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText;
const model={schemaId:'tiinex.reduction.v1', label:'Reduction',sections:[
 {kind:'body',key:'Carry-Forward State',label:'Carry-Forward State',fields:[{key:'Carry-Forward State',label:'Carry-Forward State',required:true,multiline:true,allowedValues:[],help:''}]},
 {kind:'fields',key:'Identifier',label:'Identifier',fields:[{key:'Identifier',label:'Identifier',required:true,multiline:false,allowedValues:[],help:''}]}
]};
let webview;
const scope={module:{exports:{}},exports:{},require:module=>{
 if(module==='vscode') return {window:{createWebviewPanel:()=>({webview:webview={onDidReceiveMessage:()=>{},postMessage:async()=>{}}})}};
 if(module.includes('transitionSourceSeed')) return {sourceScalarPreview:()=>[]};
 throw new Error(module);
},Date,Math,console};
scope.exports=scope.module.exports;
vm.runInNewContext(output,scope);
scope.module.exports.openArtifactAuthoringPanel({model,workspaces:[{workspaceId:'vscode',label:'VSCode',description:'Local'}],selectedWorkspaceId:'vscode',attachAvailable:false,attachDefault:false},{});
assert(webview.html.includes('data-target-id="Carry-Forward-State-Carry-Forward-State"'));
assert.equal((webview.html.match(/class="secondary body-to-list"/g)||[]).length,1,'only free Markdown body field has a list control');
const script=webview.html.match(/<script[^>]*>([\s\S]*?)<\/script>/);
assert(script,'actual Webview client script exists');
new vm.Script(script[1],{filename:'embedded-ArtifactAuthoringPanel.js'});
assert(script[1].includes('formatFreeBodyLinesAsBullets'));
assert(webview.html.includes('Convert lines to bullets'));
console.log('PASS actual authoring Webview HTML JS parses; free section-body-only list action');
