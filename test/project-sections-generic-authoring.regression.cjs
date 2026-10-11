'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const root=path.resolve(__dirname,'..');
function load(filename,requireFn=()=>{throw Error('unexpected module')}){const code=ts.transpileModule(fs.readFileSync(filename,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;const context={module:{exports:{}},exports:{},require:requireFn,Date,Math,console};context.exports=context.module.exports;vm.runInNewContext(code,context);return context.module.exports;}
const {projectArtifactAuthoringModel}=load(path.join(root,'src/core/artifactAuthoringModel.ts'));
const groups=['Project Identity','Project Purpose And Scope','Coordination State','Milestones And Outcomes'];
const contract={target:{schemaId:'tiinex.project.v1',label:'Project'},status:'ready',creation:{inputBindings:[...groups.map(group=>({input:group,kind:'ordinary-group',section:group,requiredFields:['Description','Boundary']})),{input:'Relevant Parties',kind:'ordinary-field',section:'Parties And Resources',field:'Relevant Parties'},{input:'Relevant Resources',kind:'ordinary-field',section:'Parties And Resources',field:'Relevant Resources'}]}};
const model=projectArtifactAuthoringModel(contract,{});
assert.equal(model.status,'ready');
for(const group of groups){const s=model.sections.find(x=>x.key===group);assert(s && s.kind==='group');assert.equal(s.fields.length,2);assert.deepEqual(Array.from(s.fields.map(f=>f.key)),['Description','Boundary'])}
let web;
const panel=load(path.join(root,'src/artifactAuthoringPanel.ts'),name=>name==='vscode'?{window:{createWebviewPanel:()=>({webview:web={onDidReceiveMessage:()=>{},postMessage:()=>{}}})}}:name.includes('transitionSourceSeed')?{sourceScalarPreview:()=>[]}:{});
panel.openArtifactAuthoringPanel({model,workspaces:[{workspaceId:'business',label:'Business',description:'LOCAL'}],selectedWorkspaceId:'business',attachAvailable:false,attachDefault:false},{});
for(const group of groups){assert(web.html.includes(`data-input="${group}"`));assert(web.html.includes(`id="${group.replaceAll(' ','-')}-Description"`));assert(web.html.includes(`id="${group.replaceAll(' ','-')}-Boundary"`))}
const script=web.html.match(/<script[^>]*>([\s\S]*?)<\/script>/);assert(script);new vm.Script(script[1]);assert(/values\[section\.dataset\.input\]=group/.test(script[1]));
console.log('PASS generic Project distinct section fields, form controls, structured host serialization');
