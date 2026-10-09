'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const vm = require('node:vm');
const { pathToFileURL } = require('node:url');
const ts = require('typescript');
const repo = path.resolve(__dirname, '..');
const coreRoot = process.env.TIINEX_TEST_CORE_ROOT || path.resolve(repo, '../core');
const events = [];
const answers = { input: '001-1-1', consent: 'Apply reviewed plan', choice: [], moveYes: false, operation: 'move' };
const vscode = {
  Uri: { file: file => ({ scheme: 'file', fsPath: file }) },
  workspace: { openTextDocument: async value => { events.push('preview'); return value; } },
  window: {
    showOpenDialog: async () => answers.choice,
    showQuickPick: async items => answers.moveYes && items[0]?.value==='no' ? items[1] : items.some(x=>x.operation===answers.operation) ? items.find(x=>x.operation===answers.operation) : items[0],
    showInputBox: async () => answers.input,
    showWarningMessage: async (...args) => { events.push('confirm'); return answers.consent; },
    showInformationMessage: async text => { events.push('applied:' + text); },
    showTextDocument: async () => { events.push('show'); }
  }
};
function transpile(file) {
  const output = ts.transpileModule(fs.readFileSync(file, 'utf8'), { fileName: file, compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, esModuleInterop: true }, reportDiagnostics: true });
  assert.deepEqual(output.diagnostics.filter(d => d.category === ts.DiagnosticCategory.Error), []);
  return output.outputText;
}
const modules = new Map();
function load(rel) {
  const file=path.resolve(repo,'src',rel+'.ts'); if(modules.has(file))return modules.get(file);
  const m={exports:{}};modules.set(file,m.exports);
  const myRequire=(id)=>id==='vscode'?vscode:id==='../host/corePackageBinding'?{qualifyInstalledCore:async()=>({root:coreRoot})}:id==='./lineageMaintenance'?load('vscode/lineageMaintenance'):id==='./lineageMaintenanceInventory'?load('vscode/lineageMaintenanceInventory'):id==='../core/formAttachmentFields'?{qualifiedFileAttachmentFields:()=>[{fieldKey:'Material',sectionKey:'Evidence Material',label:'Material',append:true}]}:id==='../core/artifactReferencePicker'?load('core/artifactReferencePicker'):id==='../core/deferredFormAttachment'?load('core/deferredFormAttachment'):require(id);
  const wrapper=new Function('require','module','exports','__filename','__dirname',transpile(file));
  wrapper(myRequire,m,m.exports,file,path.dirname(file));modules.set(file,m.exports);return m.exports;
}
async function main(){
 const core=await import(pathToFileURL(path.join(coreRoot,'src/public/node.js')).href);
 const {sealC14nV2Self}=await import(pathToFileURL(path.join(coreRoot,'src/integrity/integrity.c14nV2.js')).href);
 const host=load('vscode/lineageMaintenance');
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'tiinex-vscode-lineage-host-'));
 try {
  fs.mkdirSync(path.join(root,'.topics','assets'),{recursive:true});
  fs.mkdirSync(path.join(root,'.topics','review'),{recursive:true});
  const source=path.join(root,'.topics/assets/demo.png');const original=Buffer.from([0,12,255,24,33,77]);fs.writeFileSync(source,original);
  const workspace={workspaceId:'fixture',root};
  answers.consent=undefined;
  let result=await host.relocateOrdinaryFileForForm('unused',workspace,vscode.Uri.file(source),'.topics/review',core);
  assert.equal(result,undefined);assert.deepEqual(fs.readFileSync(source),original);assert.ok(events.includes('preview'));assert.ok(events.includes('confirm'));
  events.length=0;answers.consent='Apply reviewed plan';
  result=await host.relocateOrdinaryFileForForm('unused',workspace,vscode.Uri.file(source),'.topics/review',core);
  assert.equal(result,path.join(root,'.topics/review/001-1-1-demo-01.png'));
  assert.deepEqual(fs.readFileSync(result),original);assert.equal(fs.existsSync(source),false);
  assert.ok(events.some(x=>x.startsWith('applied:')));
  assert.equal(fs.existsSync(path.join(root,'.tiinex/lineage-maintenance.lock')),false);
  console.log('PASS ordinary asset: cancel no mutation, Preview+Apply, exact relocated path/bytes, lock cleanup');
  // Use a real self-sealed native Tiinex Markdown artifact for Explorer path.
  const artifactPath=path.join(root,'.topics/assets/001-task.trace.md');
  const md=`# Continuity Context\n\n- Envelope Schema: tiinex.root.v1\n- Current\n  - Current Schema: tiinex.task.v1\n  - Summary: Tested\n\n---\n\n# Tested\n\n## Objective\n\nTested.\n\n---\n\n# Continuity Integrity\n\n- sha256-base64url-c14n-v2\n  - Towards: self\n  - Value: `;
  fs.writeFileSync(artifactPath, sealC14nV2Self(md).markdown+'\n');
  answers.choice=[vscode.Uri.file(path.join(root,'.topics/review'))];events.length=0;
  await host.moveArtifactFromExplorer('unused',vscode.Uri.file(artifactPath),[workspace],core);
  assert.equal(fs.existsSync(artifactPath),false);
  assert.equal(fs.existsSync(path.join(root,'.topics/review/001-task.trace.md')),true);
  console.log('PASS artifact: Explorer Preview+Apply using real Core plan, self-seal, exact local file move');
  let blocked=false;try{await host.moveArtifactFromExplorer('unused',vscode.Uri.file(path.join(root,'.topics/review/001-task.trace.md')),[{workspaceId:'wrong',root:os.tmpdir()}],core);}catch{blocked=true;}assert.equal(blocked,true);
  console.log('PASS negative: unqualified Workspace refused');
  const second=path.join(root,'.topics/assets/second.png');fs.writeFileSync(second,Buffer.from([80,78,71,55]));
  // No injected Core override: exercises the exact qualified physical Core ESM
  // binding that will run in the transpiled CommonJS extension.
  answers.consent='Apply reviewed plan';answers.moveYes=true;
  const outgoing=[];
  const attach=load('vscode/attachFileToForm');
  const pending=[];
  await attach.attachFileToOpenForm(vscode.Uri.file(second),[{panel:{webview:{postMessage:async message=>{outgoing.push(message);return true}}},model:{label:'Evidence'},workspaceId:'fixture',root,targetDirectory:'.topics/review',isLocal:true,pendingAttachments:pending}],'unused');
  assert.equal(outgoing.length,1);
  assert.equal(outgoing[0].type,'authoring-file-attached');
  assert.equal(outgoing[0].field,'Material');
  assert.equal(outgoing[0].deferred,true);
  assert.match(outgoing[0].reference,/\.\.\/assets\/second\.png/);
  assert.equal(pending.length,1);
  assert.equal(fs.existsSync(second),true,'Attach never moves source before Create');
  console.log('PASS Attach to Form: Yes records pending reference; source remains byte-exact and unmoved');
  fs.mkdirSync(path.join(root,'.topics/chain'),{recursive:true});
  const mkArtifact=(name,label)=>{const p=path.join(root,'.topics/chain',name);fs.writeFileSync(p,sealC14nV2Self(md.replaceAll('Tested',label)).markdown+'\n');return p;};
  const insert=mkArtifact('009-insert.trace.md','Insert');const target=mkArtifact('001-target.trace.md','Target');
  answers.operation='prepend';answers.choice=[vscode.Uri.file(target)];
  await host.moveArtifactFromExplorer('unused',vscode.Uri.file(insert),[workspace],core);
  assert.ok(fs.existsSync(path.join(root,'.topics/chain/001-insert.trace.md')));
  assert.ok(fs.existsSync(path.join(root,'.topics/chain/001-1-target.trace.md')));
  console.log('PASS artifact Prepend: actual Core parent chain mutation and coordinate rebase');
  const normalize=mkArtifact('010-unclean.trace.md','Unclean');
  answers.operation='normalize-directory';
  await host.moveArtifactFromExplorer('unused',vscode.Uri.file(normalize),[workspace],core);
  assert.ok(fs.existsSync(path.join(root,'.topics/chain/001-insert.trace.md')));
  assert.ok(!fs.existsSync(normalize));
  console.log('PASS Normalize Directory: exact Core namespace compaction');


 }finally{fs.rmSync(root,{recursive:true,force:true});}
}
main().catch(e=>{console.error(e);process.exitCode=1});
