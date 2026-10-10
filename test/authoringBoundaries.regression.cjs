'use strict';
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const ts=require('typescript');
const root=path.resolve(__dirname,'..');
function loadHelper(filename){
  const source=fs.readFileSync(path.join(root,'src/core',filename),'utf8');
  const result=ts.transpileModule(source,{fileName:filename,reportDiagnostics:true,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}});
  assert.equal((result.diagnostics||[]).filter(d=>d.category===ts.DiagnosticCategory.Error).length,0);
  const mod={exports:{}};new Function('require','exports','module',result.outputText)((id)=>{throw Error('Unexpected runtime dependency: '+id)},mod.exports,mod);
  return mod.exports;
}
const {suggestedMaterialKind,suggestedMaterialEntryName}=loadHelper('fileAttachmentPresentation.ts');
assert.equal(suggestedMaterialKind('image.PNG'),'PNG image');
assert.equal(suggestedMaterialKind('notes.TXT'),'text document');
assert.equal(suggestedMaterialKind('file.bin'),'','unqualified binary name must not claim kind');
assert.equal(suggestedMaterialEntryName('Äntligen Bild 1.PNG'),'antligen-bild-1');
const {compatibleTransitionSeed,sourceScalarPreview}=loadHelper('transitionSourceSeed.ts');
const {projectTransitionAuthoringPresets,qualifiedTransitionPresetCandidates,selectCompletedTransitionPresetCandidates}=loadHelper('artifactAuthoringPresets.ts');
const qualifiedPreset=(representationKey, purpose)=>({representationKey,canonicalIdentifier:'tiinex.same-name.v1',version:'1.0.0',label:'Same label',purpose,
 authoringProfile:{state:'qualified',defaults:{Purpose:purpose},boundary:{explicitSelectionRequired:true,recommendation:'not-projected',executionAuthorized:false}}});
const unrelated=[qualifiedPreset('workspace-a','Source A'),qualifiedPreset('workspace-b','Source B')];
assert.equal(qualifiedTransitionPresetCandidates(unrelated).length,2,'do not collapse independent Core representations by Canonical Identifier');
const projection=projectTransitionAuthoringPresets(unrelated);
assert.equal(projection.selectedTemplateId,'manual','never auto-execute a preset');
assert.equal(projection.templates.length,3);
assert.equal(new Set(projection.templates.map(x=>x.id)).size,3,'each Core representation must have an independent UI selection id');
assert.deepEqual(projection.templates.slice(1).map(x=>x.defaults.Purpose),['Source A','Source B'],'do not swap source-specific generation defaults');
assert.notEqual(projection.templates[1].label,projection.templates[2].label,'same public name must be disambiguated');
assert.deepEqual(projectTransitionAuthoringPresets([{...qualifiedPreset('workspace-x','Invalid'),authoringProfile:{state:'blocked',defaults:{Purpose:'Invalid'},boundary:{explicitSelectionRequired:true,recommendation:'not-projected',executionAuthorized:false}}}]).templates.map(x=>x.id),['manual'],'blocked Core definitions cannot become prefills');

const earlySnapshot=[qualifiedPreset('composed-native:18:core/evidence/source','Evidence source')];
const enrichedSnapshot=[qualifiedPreset('supplied-transition-material:385','Evidence source')];
assert.equal(
  selectCompletedTransitionPresetCandidates(earlySnapshot,enrichedSnapshot).length,1,
  'the complete Core snapshot supersedes the fast Core snapshot instead of doubling the same preset'
);
assert.equal(
  selectCompletedTransitionPresetCandidates(earlySnapshot,enrichedSnapshot)[0].representationKey,
  'supplied-transition-material:385',
  'the later Core snapshot selects the local qualified origin'
);
assert.equal(
  selectCompletedTransitionPresetCandidates(earlySnapshot,[])[0].representationKey,
  'composed-native:18:core/evidence/source',
  'an unavailable enriched snapshot retains the qualified fast result'
);
assert.equal(
  selectCompletedTransitionPresetCandidates(earlySnapshot,unrelated).length,2,
  'genuinely distinct qualified Core representations within one snapshot remain distinct'
);


const input={Purpose:'exact-matching top level','Supported Claim Or Question':{'Supported Claim Or Question':'Original claim','Evidence Role':'illustrates'},
 'Evidence Material':[{name:'screenshot-1',fields:{Material:'[a.png](a.png)','Material Kind':'PNG image',Description:'Observed UI'}}],
 'Purpose And Scope':{Purpose:'Preserved Purpose', 'Semantic Boundary':'Bounded work',Unknown:'must not copy'},
 'Input Roles':[{name:'subject',fields:{Schema:'tiinex.evidence.v1',Unknown:'no'}}]};
const model={sections:[
 {key:'Purpose And Scope',kind:'group',fields:[{key:'Purpose'},{key:'Semantic Boundary'}]},
 {key:'Input Roles',kind:'repeatable',fields:[{key:'Schema'}]},
 {key:'Output Roles',kind:'repeatable',fields:[{key:'Schema'}]},
 {key:'Source',kind:'fields',fields:[{key:'Purpose'}]}
]};
const seed=compatibleTransitionSeed(input,model);
assert.deepEqual(seed['Purpose And Scope'],{Purpose:'Preserved Purpose','Semantic Boundary':'Bounded work'});
assert.deepEqual(seed['Input Roles'],[{name:'subject',fields:{Schema:'tiinex.evidence.v1'}}]);
assert.equal(seed['Evidence Material'],undefined,'source-only semantic group must not be invented in target');
assert.equal(seed['Supported Claim Or Question'],undefined,'Evidence claim must never silently turn into a role/purpose');
assert.ok(sourceScalarPreview(input).some(x=>x.label.includes('Material')&&x.value.includes('a.png')),'source values remain visible for explicit human mapping');

const panelSource=fs.readFileSync(path.join(root,'src/artifactAuthoringPanel.ts'),'utf8');
const start=panelSource.indexOf("if(msg.type==='authoring-file-attached'){if(busy)return;");
const end=panelSource.indexOf("if(msg.type==='authoring-deferred-committed')",start);
assert.ok(start>0&&end>start);
const handler=new Function('msg','q','qa','CSS','Event','busy',panelSource.slice(start,end));
const section={dataset:{input:'Evidence Material'},classList:{contains(name){return name==='repeatable-section'}}};
const items={rows:[]};const status={textContent:''};
const mockEvent=function(type){this.type=type};
function entry(){return {name:{value:''},fields:{Material:{dataset:{field:'Material'},value:'',dispatchEvent(){}},'Material Kind':{dataset:{field:'Material Kind'},tagName:'INPUT',value:'',dispatchEvent(){}},Description:{dataset:{field:'Description'},value:'',dispatchEvent(){}}}}}
const newRow=()=>{const row=entry();items.rows.push(row);return row};newRow();
function q(sel,scope){if(sel==='#status')return status;
 if(sel==='.repeatable-items'&&scope===section)return items;
 if(sel==='.add-item'&&scope===section)return {click:newRow};
 if(scope&&items.rows.includes(scope)){
  if(sel==='[data-entry-name]')return scope.name;
  const match=sel.match(/^\[data-field="(.+)"\]$/);if(match)return scope.fields[match[1]]||null;
 }
 return null;
}
function qa(sel,scope){if(sel==='.ordinary-section,.group-section,.repeatable-section')return [section];
 if(sel==='.repeatable-item'&&scope===items)return items.rows;
 if(sel==='[data-field]'&&items.rows.includes(scope))return Object.values(scope.fields);
 return [];
}
const deliver=(name,ref,deferred=false)=>handler({type:'authoring-file-attached',sectionKey:'Evidence Material',field:'Material',reference:ref,append:true,entryNameSuggestion:name,materialKindSuggestion:'PNG image',deferred},q,qa,{escape:s=>s},mockEvent,false);
deliver('same-name','[a](a.png)');items.rows[0].fields.Description.value='keep first description';
deliver('same-name','[b](b.png)',true);
assert.equal(items.rows.length,2,'each independent file gets a new Core-represented material row');
assert.equal(items.rows[0].fields.Material.value,'[a](a.png)');
assert.equal(items.rows[1].fields.Material.value,'[b](b.png)');
assert.equal(items.rows[0].fields.Description.value,'keep first description');
assert.equal(items.rows[1].name.value,'same-name-2','entry local identity unique');
assert.equal(items.rows[0].fields['Material Kind'].value,'PNG image');
assert.match(status.textContent,/PENDING until Create/);
assert.doesNotMatch(items.rows[1].fields.Material.value,/;/,'no semicolon concatenation');
const count=items.rows.length;handler({type:'authoring-file-attached',sectionKey:'not-present',field:'Material',reference:'x'},q,qa,{escape:s=>s},mockEvent,false);
assert.equal(items.rows.length,count,'unknown schema group must fail closed');
const lineage=fs.readFileSync(path.join(root,'src/vscode/lineageMaintenance.ts'),'utf8');
assert.match(lineage,/if \(!oldPath\.endsWith\('\.trace\.md'\)\) \{/);
assert.match(lineage,/await relocateOrdinaryFileForForm\(/);
assert.match(lineage,/core\.inspectPortableAssetRelocationWorkspace/);
assert.match(lineage,/core\.applyPortableLineageMaintenancePlan/);
const manifest=require(path.join(root,'package.json'));
const menu=manifest.contributes.menus['tiinex.explorer.actions'].find(x=>x.command==='tiinex.artifact.moveRebase');
assert.equal(menu.when,'!explorerResourceIsFolder','ordinary files must expose same Core-backed Explorer command');
console.log('PASS attach per-entry preservation, conservative kind suggestions, explicit source-to-Transition mapping, Core-owned ordinary asset route');

// Read-only GitHub transport is deliberately separate from Core historical
// semantic authorization. The endpoint is generated from Core's fixed coords;
// no supplied URLs, no redirects and no extra persisted Workspace bytes.
(async()=>{
 const gitSource=fs.readFileSync(path.join(root,'src/host/git.ts'),'utf8');
 const transpiled=ts.transpileModule(gitSource,{fileName:'git.ts',compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}});
 const hosted={exports:{}};
 new Function('require','exports','module',transpiled.outputText)((id)=>id.startsWith('.')?{}:require(id),hosted.exports,hosted);
 const {fetchPinnedGitHubSchema}=hosted.exports;
 const {createHash}=require('node:crypto');
 const bytes=Buffer.from('historical schema content\n','utf8');
 const sha=createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex');
 const source={repository:'Tiinex/docs',commit:'a'.repeat(40),path:'.topics/.schemas/core/evidence/tiinex.evidence.v1.schema.md'};
 const captured=[];
 const handler=async (url,opts)=>{captured.push({url,opts});return {ok:true,status:200,json:async()=>({type:'file',path:source.path,encoding:'base64',sha,content:bytes.toString('base64')})};};
 const got=await fetchPinnedGitHubSchema(source,handler);
 assert.deepEqual(got,{content:bytes.toString('utf8'),sha});
 assert.equal(captured.length,1);assert.equal(captured[0].opts.redirect,'error');
 assert.match(captured[0].url,/^https:\/\/api\.github\.com\/repos\/Tiinex\/docs\/contents\/\.topics\/\.schemas\/core\/evidence\//);
 assert.ok(captured[0].url.endsWith('?ref='+'a'.repeat(40)));
 await assert.rejects(fetchPinnedGitHubSchema({...source,path:'../../something'},handler),/pinned-github-coordinates-required/);
 await assert.rejects(fetchPinnedGitHubSchema(source,async()=>({ok:false,status:404})),/read-unavailable:404/);
 await assert.rejects(fetchPinnedGitHubSchema(source,async()=>({ok:true,json:async()=>({type:'file',path:source.path,encoding:'base64',sha:'f'.repeat(40),content:bytes.toString('base64')})})),/git-blob-mismatch/);
 const picker=fs.readFileSync(path.join(root,'src/operatorTrees.ts'),'utf8');
 const authoring=fs.readFileSync(path.join(root,'src/authoring.ts'),'utf8');
 assert.match(picker,/Verify Pinned Schema/);
 assert.match(picker,/qualifyPinnedHistoricalEvidenceParent\(this\.extensionPath, parentArtifact\)/);
 assert.match(authoring,/qualify-historical-evidence-parent/);
 assert.match(authoring,/tiinex\.authoring\.parent-changed-reselect/);
 console.log('PASS pinned read-only GitHub transport, exact blob SHA, Core receipt handoff and stale-Parent guards');
})().catch(error=>{console.error(error);process.exitCode=1;});
