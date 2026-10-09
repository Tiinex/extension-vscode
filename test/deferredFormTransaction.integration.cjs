'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const ts=require('typescript');
const root=path.resolve(__dirname,'..');
const modules=new Map();
let confirmed=true;
const vscode={workspace:{openTextDocument:async()=>({})},window:{showWarningMessage:async()=>confirmed?'Apply reviewed plan':undefined,showTextDocument:async()=>{},showInformationMessage:async()=>{}}};
function load(rel){const f=path.resolve(root,'src',rel+'.ts');if(modules.has(f))return modules.get(f);const m={exports:{}};modules.set(f,m.exports);
 const code=ts.transpileModule(fs.readFileSync(f,'utf8'),{fileName:f,compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText;
 const req=(id)=>id==='vscode'?vscode:id==='../host/corePackageBinding'?{qualifyInstalledCore:async()=>({root:path.resolve(root,'../core')})}:id==='./lineageMaintenance'?load('vscode/lineageMaintenance'):id==='./lineageMaintenanceInventory'?load('vscode/lineageMaintenanceInventory'):id==='../core/deferredFormAttachment'?load('core/deferredFormAttachment'):(id==='../core/artifactReferencePicker'||id==='./artifactReferencePicker')?load('core/artifactReferencePicker'):require(id);
 new Function('require','module','exports','__filename','__dirname',code)(req,m,m.exports,f,path.dirname(f));modules.set(f,m.exports);return m.exports;}
const deferred=load('vscode/deferredFormTransaction');const links=load('core/artifactReferencePicker');const lineage=load('vscode/lineageMaintenance');
async function run(){const core=await import(path.resolve(root,'../core/src/integrity/integrity.c14nV2.js'));const fixture=fs.mkdtempSync(path.join(os.tmpdir(),'tiinex-deferred-host-'));
 try{
  fs.mkdirSync(path.join(fixture,'.topics/assets'),{recursive:true});fs.mkdirSync(path.join(fixture,'.topics/work/evidence'),{recursive:true});
  const original=Buffer.from([1,2,3,255,73,68]);const src=path.join(fixture,'.topics/assets/a.png');fs.writeFileSync(src,original);
  const directory='.topics/work/evidence',artifactPath=directory+'/001-1-demo.trace.md';
  const sourceReference=links.localArtifactReference(fixture,directory,src);
  const pending=[{sourcePath:src,sourceReference,sectionKey:'Evidence Material',fieldKey:'Material'}];
  const submission={workspaceId:'w',title:'demo',templateId:'manual',closeWhenDone:false,attachToOutgoing:false,values:{'Evidence Material':[{name:'screenshot',fields:{Material:sourceReference,Description:'Shows form state'}}]}};
  const prepare=async(next)=>{const material=next.values['Evidence Material'][0].fields.Material;
   const md=core.sealC14nV2Self(`# Continuity Context\n\n- Envelope Schema: tiinex.root.v1\n- Current\n  - Current Schema: tiinex.evidence.v1\n  - Created At: 2026-10-09 12:00:00\n  - Summary: example\n  - Status: ready/local\n\n---\n\n# Evidence\n\n## Evidence Material\n\n- Material: ${material}\n\n# Continuity Integrity\n\n- sha256-base64url-c14n-v2\n  - Towards: self\n  - Value: `).markdown;
   return {root:fixture,workspaceId:'w',schemaId:'tiinex.evidence.v1',path:artifactPath,markdown:md,values:next.values};};
  const result=await deferred.prepareDeferredFormTransaction('unused',{workspaceId:'w',root:fixture},submission,pending,prepare);
  assert.equal(result.plan.status,'ready');assert.ok(result.draft.markdown.includes('001-1-a-01.png'));
  assert.deepEqual(fs.readFileSync(src),original);assert.equal(fs.existsSync(path.join(fixture,artifactPath)),false);
  confirmed=false;
  assert.equal(await lineage.applyDeferredArtifactAndAssets('unused',{workspaceId:'w',root:fixture},result.plan),false);
  assert.deepEqual(fs.readFileSync(src),original);assert.equal(fs.existsSync(path.join(fixture,artifactPath)),false);
  confirmed=true;
  assert.equal(await lineage.applyDeferredArtifactAndAssets('unused',{workspaceId:'w',root:fixture},result.plan),true);
  assert.deepEqual(fs.readFileSync(path.join(fixture,directory,'001-1-a-01.png')),original);assert.equal(fs.existsSync(src),false);
  assert.equal(fs.readFileSync(path.join(fixture,artifactPath),'utf8'),result.draft.markdown);
  console.log('PASS deferred Attach to Form: unchanged on Attach/Preview/Cancel; Core allocates lineage and commits artifact + PNG atomically');
  const removed={...submission,values:{'Evidence Material':[{name:'one',fields:{Material:'[other](else.png)'}}]}};
  assert.equal((await deferred.prepareDeferredFormTransaction('unused',{workspaceId:'w',root:fixture},removed,pending,prepare)),null);
  console.log('PASS removed pending reference never moves unrelated file');
 }finally{fs.rmSync(fixture,{recursive:true,force:true})}}
run().catch(e=>{console.error(e);process.exitCode=1});
