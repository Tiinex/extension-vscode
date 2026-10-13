'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');const fs=require('node:fs');const vm=require('node:vm');const ts=require('typescript');
const source=fs.readFileSync(path.join(__dirname,'../src/diagnostics.ts'),'utf8');
const start=source.indexOf('  async locateParent('),end=source.indexOf('  private async codeActions(',start);
assert.ok(start>0&&end>start);
const js=ts.transpileModule(`class Harness { ${source.slice(start,end)} } module.exports=Harness;`,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText;
const pinned='https://github.com/Tiinex/business/blob/'+'a'.repeat(40)+'/.topics/initiatives/001-parent.trace.md';
const read={target:pinned,repository:'Tiinex/business',commit:'a'.repeat(40),path:'.topics/initiatives/001-parent.trace.md',markdown:'# Continuity Context\n',sha256:'b'.repeat(64)};
let remoteAvailable=true,applied=0,requested=0;
const right={id:'relocate-selected-parent-and-self-seal',kind:'replace-document',qualification:'deterministic-shared-core',sourceSha256:'original-sha',replacementMarkdown:'updated'};
const runtime={module:{exports:{}},exports:{},path,message:String,eligible:()=>true,digest:()=> 'original-sha',
 vscode:{Uri:{file:p=>({fsPath:p})},window:{showOpenDialog:async()=>[{fsPath:'/other/.topics/initiatives/001-parent.trace.md'}],showWarningMessage:async()=>{}},workspace:{applyEdit:async()=>{applied++;return true}}},
 materialRootForResource:async()=>'/core',relativeRepositoryPath:(root,target)=>{const rel=path.relative(root,target);if(rel.startsWith('../'))throw Error('outside');return rel;},
 repositoryRootForResource:async()=>'/other',publishedParentFromLocalChoice:async()=>{if(!remoteAvailable)throw Error('repository not published');return read},
 resolveVersionBearingPermalinks:async()=>[],
 projectEditorAssistanceSelectedParent:async(...args)=>{requested++;assert.equal(args[4],'');assert.deepEqual(JSON.parse(JSON.stringify(args[7])),[read]);assert.equal(args[8],pinned);return {documents:[{actions:[right]}]}}
};
vm.runInNewContext(js,runtime);
const d={fileName:'/core/.topics/work/001-child.trace.md',getText:()=> 'original'};
(async()=>{
 const h=new runtime.module.exports();h.runtime=async()=>({});h.workspaceEditForAction=async()=>({state:'ready',edit:{verified:true}});h.refresh=async()=>{};
 assert.equal(await h.locateParent(d),'applied');assert.equal(applied,1);assert.equal(requested,1);
 remoteAvailable=false;
 assert.equal(await h.locateParent(d),'blocked');assert.equal(applied,1);assert.equal(requested,1);
 console.log('PASS cross-Workspace human picker passes only pinned remote material to Core, blocks unavailable/unpublished refs without edits');
})().catch(err=>{console.error(err);process.exitCode=1});
