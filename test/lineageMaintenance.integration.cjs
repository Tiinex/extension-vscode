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
const nativeRoot = process.env.TIINEX_TEST_NATIVE_ROOT || path.resolve(repo, '../native');
const docsRoot = process.env.TIINEX_TEST_DOCS_ROOT || path.resolve(repo, '../docs');
const events = [];
const answers = { input: '001-1-1', consent: 'Apply reviewed plan', choice: [], moveYes: false, operation: 'move', scope:'alone', placement:'append',policy:'new' };
const vscode = {
  Uri: { file: file => ({ scheme: 'file', fsPath: file }) },
  workspace: { openTextDocument: async value => { events.push('preview'); return value; } },
  window: {
    showOpenDialog: async () => answers.choice,
    showQuickPick: async items => answers.moveYes && items[0]?.value==='no' ? items[1]
      : items.some(x=>x.operation===answers.operation) ? items.find(x=>x.operation===answers.operation)
      : items.some(x=>x.selectionScope===answers.scope) ? items.find(x=>x.selectionScope===answers.scope)
      : items.some(x=>x.placement===answers.placement) ? items.find(x=>x.placement===answers.placement)
      : items.some(x=>x.policy===answers.policy) ? items.find(x=>x.policy===answers.policy) : items[0],
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
  const myRequire=(id)=>id==='vscode'?vscode:id==='../host/corePackageBinding'?{qualifyInstalledCore:async()=>({root:coreRoot})}:id==='./lineageMaintenance'?load('vscode/lineageMaintenance'):id==='./lineageMaintenanceInventory'?load('vscode/lineageMaintenanceInventory'):id==='../core/formAttachmentFields'?{qualifiedFileAttachmentFields:()=>[{fieldKey:'Material',sectionKey:'Evidence Material',label:'Material',append:true}]}:id==='../core/artifactReferencePicker'?load('core/artifactReferencePicker'):id==='../core/deferredFormAttachment'?load('core/deferredFormAttachment'):id==='../core/fileAttachmentPresentation'?load('core/fileAttachmentPresentation'):require(id);
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
  assert.equal(outgoing[0].entryNameSuggestion,'second');
  assert.equal(outgoing[0].materialKindSuggestion,'PNG image');
  console.log('PASS Attach to Form: Yes records pending reference and per-source hints; source remains byte-exact and unmoved');
  // The same Explorer command now also routes an ordinary PNG to Core asset
  // inspection and the journaled apply path; no host fs.rename fallback.
  const third=path.join(root,'.topics/assets/third.png');fs.writeFileSync(third,Buffer.from([9,8,7,6]));
  answers.choice=[vscode.Uri.file(path.join(root,'.topics/review'))];
  answers.consent=undefined;
  await host.moveArtifactFromExplorer('unused',vscode.Uri.file(third),[workspace],core);
  assert.equal(fs.existsSync(third),true,'Explorer asset cancel must not mutate');
  answers.consent='Apply reviewed plan';
  await host.moveArtifactFromExplorer('unused',vscode.Uri.file(third),[workspace],core);
  assert.equal(fs.existsSync(third),false);
  assert.deepEqual(fs.readFileSync(path.join(root,'.topics/review/001-1-1-third-01.png')),Buffer.from([9,8,7,6]));
  console.log('PASS Explorer ordinary PNG: Core Preview/Cancel and Apply preserve bytes and change references safely');
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
  // The NEW scope/anchor route must work with a real installed Core, without
  // host-specific graph rewrites or a separate binary move engine.
  fs.mkdirSync(path.join(root,'.topics/scoped'),{recursive:true});
  const anchoredTarget=path.join(root,'.topics/scoped/001-target.trace.md');
  const anchoredInsert=path.join(root,'.topics/scoped/009-insert.trace.md');
  fs.writeFileSync(anchoredTarget,sealC14nV2Self(md.replaceAll('Tested','Anchor')).markdown+'\n');
  fs.writeFileSync(anchoredInsert,sealC14nV2Self(md.replaceAll('Tested','Inserted')).markdown+'\n');
  answers.operation='scoped';answers.scope='alone';answers.placement='append';answers.policy='new';answers.choice=[vscode.Uri.file(anchoredTarget)];
  await host.moveArtifactFromExplorer('unused',vscode.Uri.file(anchoredInsert),[workspace],core);
  const newChild=path.join(root,'.topics/scoped/001-1-insert.trace.md');
  assert.equal(fs.existsSync(newChild),true);
  assert.equal(fs.existsSync(anchoredTarget),true);
  assert.equal(fs.existsSync(anchoredInsert),false);
  assert.match(fs.readFileSync(newChild,'utf8'),/Trace: \[001-target\.trace\.md\]\(001-target\.trace\.md\)/);
  console.log('PASS scope Alone → artifact anchor → Append + New Parent → real Core atomic Apply');
  // Real assets require a complete reference-inventory receipt. The host may
  // enumerate bytes, but must NOT assert source-closure authority by itself.
  const mixed=path.join(root,'.topics/scoped/009-second.trace.md');
  const mixedPng=path.join(root,'.topics/scoped/009-image-01.png');
  fs.writeFileSync(mixed,sealC14nV2Self(md.replaceAll('Tested','Second')).markdown+'\n');
  const opaque=Buffer.from([12,16,0,29]);fs.writeFileSync(mixedPng,opaque);
  answers.scope='alone-with-assets';answers.placement='same';answers.choice=[vscode.Uri.file(anchoredTarget)];
  await host.moveArtifactFromExplorer('unused',vscode.Uri.file(mixed),[workspace],core);
  assert.equal(fs.existsSync(mixed),false,'qualified Core reference closure must move selected artifact');
  assert.equal(fs.existsSync(mixedPng),false,'qualified Core reference closure must move selected binary');
  const newArt=fs.readdirSync(path.dirname(mixed)).find(n=>n.endsWith('-second.trace.md'));
  assert.ok(newArt,'Core must derive a safe new artifact dimension');
  const dim=newArt.replace(/-second\.trace\.md$/,'');
  assert.deepEqual(fs.readFileSync(path.join(path.dirname(mixed),`${dim}-image-01.png`)),opaque);
  console.log('PASS scope with selected PNG: Core inspected Workspace, atomically moved asset+artifact');
  // A linked Markdown file outside the source directory is NOT in the
  // Tiinex artifact rewrite graph. The scanner must refuse partial mutation.
  const noMove=path.join(root,'.topics/scoped/010-third.trace.md');
  const noMovePng=path.join(root,'.topics/scoped/010-image-01.png');
  fs.writeFileSync(noMove,sealC14nV2Self(md.replaceAll('Tested','Third')).markdown+'\n');
  const untouched=Buffer.from([99,0,220]);fs.writeFileSync(noMovePng,untouched);
  const noteDir=path.join(root,'.topics/notes');fs.mkdirSync(noteDir,{recursive:true});
  fs.writeFileSync(path.join(noteDir,'asset-note.md'),'External [image](../scoped/010-image-01.png)');
  await host.moveArtifactFromExplorer('unused',vscode.Uri.file(noMove),[workspace],core);
  assert.equal(fs.existsSync(noMove),true,'unrewritable incoming Markdown reference must block');
  assert.deepEqual(fs.readFileSync(noMovePng),untouched,'blocked move keeps exact binary bytes');
  console.log('PASS negative: external Markdown reference blocks scoped PNG move');
  // Keep Parent is NOT New Parent: real host picker must pass it through to
  // the packed Core. Numeric append/prepend does not synthesize semantic edges.
  fs.mkdirSync(path.join(root,'.topics/keep-host'),{recursive:true});
  const keepDir=path.join(root,'.topics/keep-host');
  const newKeep=(name,label)=>{const file=path.join(keepDir,name);fs.writeFileSync(file,sealC14nV2Self(md.replaceAll('Tested',label)).markdown+'\n');return file;};
  const keepTarget=newKeep('001-target.trace.md','KeepAnchor');
  const keepInsert=newKeep('009-insert.trace.md','KeepInserted');
  answers.operation='scoped';answers.scope='alone';answers.placement='append';answers.policy='keep';
  answers.choice=[vscode.Uri.file(keepTarget)];answers.consent='Apply reviewed plan';
  await host.moveArtifactFromExplorer('unused',vscode.Uri.file(keepInsert),[workspace],core);
  const keepAppended=path.join(keepDir,'001-1-insert.trace.md');
  assert.equal(fs.existsSync(keepAppended),true);
  assert.equal(fs.existsSync(keepInsert),false);
  assert.doesNotMatch(fs.readFileSync(keepAppended,'utf8'),/^- Parent$/m,'Append Keep cannot invent semantic Parent');
  assert.equal(fs.existsSync(keepTarget),true);
  console.log('PASS host scoped Append + Keep Parent: numeric child but no semantic Parent');
  const prependDir=path.join(root,'.topics/keep-prepend-host');fs.mkdirSync(prependDir,{recursive:true});
  const prependTarget=path.join(prependDir,'001-target.trace.md');
  const prependSource=path.join(prependDir,'008-before.trace.md');
  fs.writeFileSync(prependTarget,sealC14nV2Self(md.replaceAll('Tested','KeepPreTarget')).markdown+'\n');
  fs.writeFileSync(prependSource,sealC14nV2Self(md.replaceAll('Tested','KeepBefore')).markdown+'\n');
  answers.placement='prepend';answers.policy='keep';answers.choice=[vscode.Uri.file(prependTarget)];
  await host.moveArtifactFromExplorer('unused',vscode.Uri.file(prependSource),[workspace],core);
  const keepPrepended=path.join(prependDir,'001-before.trace.md');
  const keepTargetRebased=path.join(prependDir,'001-1-target.trace.md');
  assert.equal(fs.existsSync(keepPrepended),true);assert.equal(fs.existsSync(keepTargetRebased),true);
  assert.doesNotMatch(fs.readFileSync(keepTargetRebased,'utf8'),/^- Parent$/m,'Prepend Keep cannot invent semantic Parent');
  console.log('PASS host scoped Prepend + Keep Parent: target rebased but same semantic Parent');
  const remote=fs.mkdtempSync(path.join(os.tmpdir(),'tiinex-cross-target-'));
  try {
    const crossDir=path.join(remote,'.topics/anchor');fs.mkdirSync(crossDir,{recursive:true});
    const crossAnchor=path.join(crossDir,'002-cross-anchor.trace.md');
    fs.writeFileSync(crossAnchor,sealC14nV2Self(md.replaceAll('Tested','CrossAnchor')).markdown+'\n');
    const crossSelection=path.join(root,'.topics/scoped/099-cross-selected.trace.md');
    const crossBytes=sealC14nV2Self(md.replaceAll('Tested','CrossSelected')).markdown+'\n';
    fs.writeFileSync(crossSelection,crossBytes);
    answers.operation='scoped';answers.scope='alone';answers.placement='append';answers.policy='keep';
    answers.choice=[vscode.Uri.file(crossAnchor)];
    const history=events.length;
    await host.moveArtifactFromExplorer('unused',vscode.Uri.file(crossSelection),[workspace,{workspaceId:'cross-target',root:remote}],core);
    assert.equal(fs.readFileSync(crossSelection,'utf8'),crossBytes);
    assert.equal(fs.existsSync(crossAnchor),true);
    assert.ok(events.slice(history).includes('confirm'),'Read-only Core cross-Workspace inspection should surface BLOCK to user');
    assert.equal(events.slice(history).some(x=>String(x).startsWith('applied:')),false);
    console.log('PASS cross-Workspace anchor: dual Core inspection + read-only BLOCK, neither Workspace mutated');
    // Explicit bounded Alone + Same + Keep Parent can now Apply. No other
    // cross-Workspace case inherits this narrow transaction authority.
    const safeAlone=path.join(root,'.topics/scoped/098-safe-alone.trace.md');
    const safeBytes=sealC14nV2Self(md.replaceAll('Tested','SafeAcross')).markdown+'\n';
    fs.writeFileSync(safeAlone,safeBytes);
    answers.scope='alone';answers.placement='same';answers.policy='keep';answers.choice=[vscode.Uri.file(crossAnchor)];
    answers.consent='Apply reviewed plan';
    await host.moveArtifactFromExplorer('unused',vscode.Uri.file(safeAlone),[workspace,{workspaceId:'cross-target',root:remote}],core);
    assert.equal(fs.existsSync(safeAlone),false,'qualified standalone source must move');
    const relocated=path.join(crossDir,'003-safe-alone.trace.md');
    assert.equal(fs.readFileSync(relocated,'utf8'),safeBytes);
    assert.equal(fs.readFileSync(crossAnchor,'utf8').includes('CrossAnchor'),true);
    console.log('PASS cross-Workspace: bounded Alone + Same + Keep Parent atomic Core Apply');
    // New strictly bounded bundle: one parentless artifact plus its
    // same-dimension PNG, real two-root Core Apply and link resealing.
    const bundled=path.join(root,'.topics/scoped/097-bundled.trace.md');
    const bundledPng=path.join(root,'.topics/scoped/097-image.png');
    const bmd=sealC14nV2Self(md.replaceAll('Tested','Bundled')
      .replace('## Objective','![photo](097-image.png)\n\n## Objective')).markdown+'\n';
    const png=Buffer.from([137,80,78,71,13,10,26,10,4,255]);
    fs.writeFileSync(bundled,bmd);fs.writeFileSync(bundledPng,png);
    answers.scope='alone-with-assets';answers.placement='same';answers.policy='keep';answers.choice=[vscode.Uri.file(crossAnchor)];
    await host.moveArtifactFromExplorer('unused',vscode.Uri.file(bundled),[workspace,{workspaceId:'cross-target',root:remote}],core);
    assert.equal(fs.existsSync(bundled),false);
    assert.equal(fs.existsSync(bundledPng),false);
    assert.deepEqual(fs.readFileSync(path.join(crossDir,'004-image.png')),png);
    assert.match(fs.readFileSync(path.join(crossDir,'004-bundled.trace.md'),'utf8'),/!\[photo\]\(004-image\.png\)/);
    console.log('PASS cross-Workspace: bounded artifact + PNG qualified atomic Apply');
    // Closed semantic Parent→Child→GrandChild tree with one child-owned PNG:
    // host chooses UI scope, Core owns every Parent integrity rewrite.
    // Source-created Parent graphs require the same qualified Native/Docs schema
    // registry as the installed portable Core. Without runtime initialization
    // Core correctly blocks unregistered schema creation (not a Move/Rebase bug).
    const {initializePortableNodeRuntime}=await import(pathToFileURL(path.join(coreRoot,'src/tooling/portable/adapters/node/portableRuntime.initialize.js')).href);
    const coreRuntime=await initializePortableNodeRuntime({runtimeRoot:coreRoot,contentRoots:[nativeRoot,docsRoot],discoverBundled:false,discoverInstalled:false});
    assert.equal(coreRuntime.status,'ready',JSON.stringify(coreRuntime.findings||[]));
    const {buildArtifactCreationContract}=await import(pathToFileURL(path.join(coreRoot,'src/schemas/creation.contracts.js')).href);
    const {renderArtifactCreationDraftMarkdown}=await import(pathToFileURL(path.join(coreRoot,'src/schemas/creation.renderer.js')).href);
    const {projectPortableAuthoringParent}=await import(pathToFileURL(path.join(coreRoot,'src/tooling/portable/editor/authoring.parent.js')).href);
    const grp=path.join(root,'.topics/closed-graph');fs.mkdirSync(grp,{recursive:true});
    const schema='tiinex.topic.v1',stamp='2026-10-10 10:00:00';
    const c=(type)=>buildArtifactCreationContract({schemaId:schema,transitionType:type});
    const values=(name,image='')=>({'Current Read':`${name}${image?'\n\n![proof]('+image+')':''}`,'Design Direction':'Verified cross-root subtree','Next Artifacts':'none'});
    const create=(name,rel,parent,image='')=>renderArtifactCreationDraftMarkdown(c(parent?'continue-from-record':'create-artifact'),{
      childPath:rel,title:name,createdAt:stamp,values:values(name,image),...(parent?{parentRecord:parent}:{})})+'\n';
    const relRoot='.topics/closed-graph/012-root.trace.md';
    const relChild='.topics/closed-graph/012-1-child.trace.md';
    const relGrand='.topics/closed-graph/012-1-1-grand.trace.md';
    const graphRoot=create('GraphRoot',relRoot);fs.writeFileSync(path.join(root,relRoot),graphRoot);
    const rootParent=projectPortableAuthoringParent({records:[{path:relRoot,markdown:graphRoot}]});
    assert.equal(rootParent.status,'ready',JSON.stringify(rootParent.findings));
    const graphChild=create('GraphChild',relChild,rootParent.parentRecord,'012-1-proof.png');
    fs.writeFileSync(path.join(root,relChild),graphChild);
    const childParent=projectPortableAuthoringParent({records:[{path:relChild,markdown:graphChild}]});
    assert.equal(childParent.status,'ready',JSON.stringify(childParent.findings));
    const graphGrand=create('GraphGrand',relGrand,childParent.parentRecord);
    fs.writeFileSync(path.join(root,relGrand),graphGrand);
    const graphPng=Buffer.from([137,80,78,71,13,10,26,10,91]);
    fs.writeFileSync(path.join(grp,'012-1-proof.png'),graphPng);
    answers.scope='self-and-leaves';answers.placement='same';answers.policy='keep';answers.choice=[vscode.Uri.file(crossAnchor)];
    await host.moveArtifactFromExplorer('unused',vscode.Uri.file(path.join(root,relRoot)),[workspace,{workspaceId:'cross-target',root:remote}],core);
    const relocatedRoot=path.join(crossDir,'005-root.trace.md');
    const relocatedChild=path.join(crossDir,'005-1-child.trace.md');
    const relocatedGrand=path.join(crossDir,'005-1-1-grand.trace.md');
    assert.equal(fs.existsSync(relocatedRoot),true,'closed graph root moved');
    assert.equal(fs.existsSync(relocatedChild),true,'closed graph child moved');
    assert.equal(fs.existsSync(relocatedGrand),true,'closed graph grandchild moved');
    assert.equal(fs.existsSync(path.join(root,relRoot)),false,'closed graph originals removed');
    assert.deepEqual(fs.readFileSync(path.join(crossDir,'005-1-proof.png')),graphPng);
    const parentDigest=(await import(pathToFileURL(path.join(coreRoot,'src/integrity/integrity.c14nV2.js')).href)).canonicalC14nV2SelfState(fs.readFileSync(relocatedRoot,'utf8')).declaredValue;
    assert.ok(fs.readFileSync(relocatedChild,'utf8').includes(parentDigest),'transferred child linked to actual relocated parent digest');
    console.log('PASS cross-Workspace: bounded closed Parent + descendants + PNG, direct Core host Apply');


  }finally {fs.rmSync(remote,{recursive:true,force:true});}




 }finally{fs.rmSync(root,{recursive:true,force:true});}
}
main().catch(e=>{console.error(e);process.exitCode=1});
