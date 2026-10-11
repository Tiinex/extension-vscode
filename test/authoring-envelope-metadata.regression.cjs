'use strict';
const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');const vm=require('node:vm');const ts=require('typescript');
const root=path.resolve(__dirname,'..');
function load(src,requireFn=()=>{throw Error('unexpected module');}){const js=ts.transpileModule(fs.readFileSync(src,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;const context={module:{exports:{}},exports:{},require:requireFn,Date,Math,console};context.exports=context.module.exports;vm.runInNewContext(js,context);return context.module.exports;}
const m=load(path.join(root,'src/core/artifactAuthoringModel.ts'));
const contract={target:{schemaId:'tiinex.reduction.v1'},status:'ready',creation:{inputBindings:[{input:'Summary',kind:'root-current-summary-body-title',section:''},{input:'Source Context',kind:'section-body',section:'Source Context'}]}};
const model=m.projectArtifactAuthoringModel(contract,{});
const summary=model.sections.find(x=>x.key==='Summary');const source=model.sections.find(x=>x.key==='Source Context');
assert(summary && !summary.fields[0].multiline,'one-line envelope Summary is never body multiline');assert(source.fields[0].multiline,'real Markdown section body stays multiline');
const qualified=m.projectArtifactAuthoringModel({target:{schemaId:'tiinex.test.v1'},status:'ready',creation:{inputBindings:[{input:'Steps',kind:'section-body',section:'Steps'}]}},{factoryDescriptor:{sections:[{group:'Steps',fieldConstraints:[{field:'Steps',allowedShapes:['hyphen bullet list']}]}]}});
assert.equal(qualified.sections[0].fields[0].autoBulletList,true,'only explicit schema list shape drives automatic bullets');assert.equal(source.fields[0].autoBulletList,false,'ordinary Reduction body is free Markdown');
let page;const p=load(path.join(root,'src/artifactAuthoringPanel.ts'),name=>{
 if(name==='vscode')return {window:{createWebviewPanel:()=>({webview:page={onDidReceiveMessage:()=>{},postMessage:()=>{}}})}};
 if(name.includes('transitionSourceSeed'))return {sourceScalarPreview:()=>[]};throw Error(name);
});
p.openArtifactAuthoringPanel({model,workspaces:[{workspaceId:'business',label:'Business',description:'LOCAL'}],selectedWorkspaceId:'business',attachAvailable:false,attachDefault:false},{});
assert(page.html.includes('id="why"'),'visible operator envelope Why input');assert(page.html.includes('id="Summary-Summary"') && /<input id="Summary-Summary"/.test(page.html),'Summary rendered as input not textarea');assert(!page.html.includes('data-target-id="Summary-Summary"'),'Summary has no bullet action');assert(page.html.includes('data-target-id="Source-Context-Source-Context"'),'free body still has explicit list action');
const script=page.html.match(/<script[^>]*>([\s\S]*?)<\/script>/);assert(script);new vm.Script(script[1]);assert(script[1].includes('values.Why=valueOf(q(\'#why\'))'),'Why reaches Core values and is not default text');
console.log('PASS schema-bound Summary singleline, Why exposed, typed list-only automation, body conversion preserved');
