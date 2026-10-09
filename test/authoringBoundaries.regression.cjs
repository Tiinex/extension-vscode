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
