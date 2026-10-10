/** Source-owned integration: actual Core Transition Definition creation and
 * persisted reread, after the host's explicit source-field choice.
 * This is not an installed Windows webview acceptance test. */
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';

const extensionRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const ts = require('typescript');
const coreRoot = path.resolve(process.env.TIINEX_TEST_CORE_ROOT || path.join(extensionRoot, '..', 'core'));
// This local integration requires the exact Native/Docs development roots.
// Marketplace release must not claim it ran on a bare published-only fixture.
const nativeRoot = path.resolve(process.env.TIINEX_TEST_NATIVE_ROOT || path.join(extensionRoot, '..', 'native'));
const docsRoot = path.resolve(process.env.TIINEX_TEST_DOCS_ROOT || path.join(extensionRoot, '..', 'docs'));
const moduleAt = relative => import(pathToFileURL(path.join(coreRoot, relative)).href);
const { initializePortableNodeRuntime } = await moduleAt('src/tooling/portable/adapters/node/portableRuntime.initialize.js');
const runtime = await initializePortableNodeRuntime({ runtimeRoot: coreRoot, contentRoots: [nativeRoot,docsRoot], discoverBundled:false, discoverInstalled:false });
assert.equal(runtime.status, 'ready', JSON.stringify(runtime.findings || []));
const { buildArtifactCreationContract, renderArtifactCreationCandidateMarkdown, validateArtifactCreationResult } = await moduleAt('src/schemas/creation.contracts.js');
const { renderArtifactCreationDraftMarkdown } = await moduleAt('src/schemas/creation.renderer.js');
const { parseArtifactMarkdown } = await moduleAt('src/artifacts/artifact.parse.js');
const { canonicalC14nV2SelfState } = await moduleAt('src/integrity/integrity.c14nV2.js');
function transpile(relative){
 const source = require('node:fs').readFileSync(path.join(extensionRoot,'src/core',relative),'utf8');
 const output = ts.transpileModule(source,{fileName:relative,reportDiagnostics:true,compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}});
 assert.equal(output.diagnostics?.filter(d=>d.category===ts.DiagnosticCategory.Error).length,0);
 const m={exports:{}};new Function('exports','module','require',output.outputText)(m.exports,m,()=>{throw new Error('Unexpected import')});return m.exports;
}
const { compatibleTransitionSeed, sourceScalarPreview, manualOnlyTransitionSeed } = transpile('transitionSourceSeed.ts');
const source={
 'Supported Claim Or Question':{'Supported Claim Or Question':'What did the acceptance test show?','Evidence Role':'illustrative'},
 'Evidence Material':[
  {name:'capture-one',fields:{Material:'[capture](capture.png)','Material Kind':'PNG image',Description:'First capture'}},
  {name:'capture-two',fields:{Material:'[second](second.png)','Material Kind':'PNG image',Description:'Second capture'}}
 ]
};
const schemaId='tiinex.transition.definition.v1';
const contract=buildArtifactCreationContract({schemaId,transitionType:'create-artifact'});
assert.equal(contract.status,'ready',JSON.stringify(contract.findings));
// The source Evidence's claim and material rows are different schema semantics.
// Preserve in the source snapshot, not as fabricated Transition defaults.
const model={ sections:[{key:'Purpose And Scope',kind:'group',fields:[{key:'Purpose'},{key:'Semantic Boundary'}]}] };
assert.deepEqual(compatibleTransitionSeed(source,model),{});
// Minimal manual-only defaults are structurally compatible but never
// upgrade the Evidence claim to Purpose, role or executable effect.
const structuralModel={sections:[
 {kind:'fields',key:'Transition Identity',fields:[{key:'Name'},{key:'Version'},{key:'Canonical Identifier'}]},
 {kind:'group',key:'Purpose And Scope',fields:[{key:'Purpose'},{key:'Semantic Boundary'}]},
 {kind:'fields',key:'Input Roles',fields:[{key:'Input Roles'}]},
 {kind:'fields',key:'Output Roles',fields:[{key:'Output Roles'}]},
 {kind:'group',key:'Lifecycle And Continuity Effects',fields:[{key:'Lifecycle Effects'},{key:'Parent Effects'}]},
 {kind:'fields',key:'Relation Effects',fields:[{key:'Relation Effects'}]},
 {kind:'fields',key:'Applicability Meaning',fields:[{key:'Applicability Meaning'}]},
 {kind:'group',key:'Placement Intent',fields:[{key:'Destination Bindings'},{key:'Output Placements'}]},
 {kind:'group',key:'Interpretation Limits',fields:[{key:'Does Not Prove'},{key:'Must Not Be Inferred'}]}
]};
const {projectArtifactAuthoringModel}=(()=>{ const full=path.join(extensionRoot,'src/core/artifactAuthoringModel.ts');const source=require('node:fs').readFileSync(full,'utf8'); const js=ts.transpileModule(source,{fileName:full,compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText; const m={exports:{}};new Function('exports','module','require',js)(m.exports,m,()=>{throw Error('unexpected dynamic require')});return m.exports;})();
const actualModel=projectArtifactAuthoringModel(contract,{schemaId,factoryDescriptor:{sections:[],declarations:[]}});
assert.equal(actualModel.status,'ready');
const coreShapedSeed=manualOnlyTransitionSeed('Evidence observation',actualModel);
assert.equal(coreShapedSeed.Name,'Define transition for Evidence observation');
assert.equal(coreShapedSeed.Purpose,undefined);
assert.equal(coreShapedSeed['Input Roles'],'none');
assert.equal(coreShapedSeed['Output Roles'],'none');
assert.equal(coreShapedSeed['Lifecycle And Continuity Effects']['Parent Effects'],'none');
const manual=manualOnlyTransitionSeed('Evidence observation',structuralModel);
assert.ok(manual.Name.startsWith('Define transition for '));
assert.equal(manual.Purpose,undefined,'Purpose requires an explicit choice');
assert.equal(coreShapedSeed['Interpretation Limits']['Does Not Prove'].includes('verified'),true);
// The actual projected model must produce a Core-valid passive definition
// once the operator explicitly maps Purpose. This is neither automatic
// execution nor fabricated Role/Parent/Effect semantics.
const authoredManual={...coreShapedSeed,Purpose:'Repeat this observation after explicit review of source values.'};
const manualMarkdown=renderArtifactCreationCandidateMarkdown(contract,{values:authoredManual,createdAt:'2026-10-10T10:00:00Z'});
assert.equal(validateArtifactCreationResult({schemaId,markdown:manualMarkdown,status:'local',sourceMode:'local-create'}, {}, {contract}).ok,true,
  'manual-only seed must create a valid Transition Definition under the actual Core contract');
assert.equal(canonicalC14nV2SelfState(manualMarkdown).state,'verified');

assert.equal(manual['Input Roles'],'none');
assert.equal(manual['Lifecycle And Continuity Effects']['Lifecycle Effects'],'none');
assert.ok(manual['Interpretation Limits']['Must Not Be Inferred'].includes('automatic execution'));
assert.deepEqual(manualOnlyTransitionSeed('<script>',{sections:[]}),{});
const sourceValues=sourceScalarPreview(source);
assert.ok(sourceValues.some(x=>x.value==='What did the acceptance test show?'));
assert.ok(sourceValues.some(x=>x.value==='First capture'));
assert.ok(sourceValues.some(x=>x.value==='Second capture'));
// The operator explicitly chooses which source value means Transition Purpose.
const chosen=sourceValues.find(x=>x.value==='What did the acceptance test show?').value;
const values={
 Name:'Verify observed result',Version:'1.0.0','Canonical Identifier':'tiinex.example.verify-observation.v1',
 Purpose:chosen,'Semantic Boundary':'Operator must qualify the interpretation separately.',
 'Input Roles':'none','Output Roles':'none',
 'Lifecycle And Continuity Effects':{'Lifecycle Effects':'none','Parent Effects':'none'},
 'Relation Effects':'none','Applicability Meaning':'Only when explicitly selected by an operator.',
 'Placement Intent':{'Destination Bindings':'none','Output Placements':'none'},
 'Interpretation Limits':{'Does Not Prove':'That source images were validated.','Must Not Be Inferred':'Permission to execute automatically.'}
};
const markdown=renderArtifactCreationCandidateMarkdown(contract,{values,createdAt:'2026-10-09T20:00:00Z'});
assert.ok(markdown.includes(chosen),'selected source value must become materialized Core field');
assert.ok(!markdown.includes('capture-one'),'unmapped Evidence material is not silently promoted');
assert.equal(validateArtifactCreationResult({schemaId,markdown,status:'local',sourceMode:'local-create'}, {}, {contract}).ok,true);
assert.equal(canonicalC14nV2SelfState(markdown).state,'verified');
const directory=await fs.mkdtemp(path.join(os.tmpdir(),'tiinex-transition-roundtrip-'));
try{
 const file=path.join(directory,'001-verify-observed-result.trace.md');
 await fs.writeFile(file,markdown,'utf8');
 const reopened=await fs.readFile(file,'utf8');
 assert.equal(reopened,markdown);
 assert.ok(parseArtifactMarkdown(reopened).body.text.includes(chosen));
 assert.equal(validateArtifactCreationResult({schemaId,markdown:reopened,status:'local',sourceMode:'local-create'}, {}, {contract}).ok,true);
}finally{await fs.rm(directory,{recursive:true,force:true});}
// E2E: real Core Native semantic package + explicit Generation Bindings and
// Schema Transition Companion -> VS Code's actual preset presentation helper.
// No synthetic JSON authoring snapshot or separate persistence mechanism.
const { projectPortableTransitionNeighborhood } = await moduleAt('src/tooling/portable/transitions/transition.catalog.js');
const { projectTransitionAuthoringPresets, dedupeTransitionPresetCandidates } = transpile('artifactAuthoringPresets.ts');
const nativeHandoff = projectPortableTransitionNeighborhood({ includeNative:true, outputSchemaId:'tiinex.handoff.v1' });
assert.equal(nativeHandoff.findings.filter(f => f.severity === 'error').length,0);
assert.equal(nativeHandoff.candidates.length,6,'six real Native Handoff Transition Definitions');
const actualCandidates=nativeHandoff.candidates.map(candidate=>({
 representationKey:candidate.representationKey,
 canonicalIdentifier:candidate.canonicalIdentifier,
 version:candidate.version,
 label:candidate.humanLabel || candidate.canonicalIdentifier,
 purpose:candidate.purpose,
 sourcePath:candidate.source?.locator?.localPath || candidate.path,
 authoringProfile:candidate.authoringProfile
}));
const shown=projectTransitionAuthoringPresets(actualCandidates);
assert.equal(shown.selectedTemplateId,'manual','no default Transition is invoked');
assert.equal(shown.templates.length,7,'manual plus six actual Core-qualified generation presets');
assert.equal(new Set(shown.templates.map(t=>t.id)).size,7,'every exact origin remains selectable');
for(const candidate of actualCandidates){
 assert.equal(candidate.authoringProfile?.state,'qualified',candidate.canonicalIdentifier);
 assert.equal(candidate.authoringProfile?.boundary?.executionAuthorized,false);
 assert.ok(shown.templates.some(t=>JSON.stringify(t.defaults)===JSON.stringify(candidate.authoringProfile.defaults)));
}
assert.equal(projectTransitionAuthoringPresets(actualCandidates.map(c=>({...c,authoringProfile:{...c.authoringProfile,state:'blocked'}}))).templates.length,1,
 'qualified Native schemas must not bypass an explicitly blocked Core candidate');
console.log('PASS real Native/Core Transition Definition + Companion + Generation Binding -> six uniquely selectable, non-executable VS Code form presets');
// Deliberately malformed source snapshots must not turn into hidden values.
assert.deepEqual(compatibleTransitionSeed({'Purpose And Scope':{'Role':'fake-role'}},model),{});
console.log('PASS Core Transition Create→persist→reopen; explicit field mapping, claim/material preservation boundary, negative source cases');

// Actual V1 Native Evidence assets, not in-memory mocked schemas or a second
// implementation: Semantic Package → Companion → Definition → Generation →
// Core-qualified presets → completed Core Evidence Create/reopen. No extra
// snapshot, executable Transition invocation, or implicit factual attestation.
const nativeEvidence = projectPortableTransitionNeighborhood({ includeNative: true, outputSchemaId:'tiinex.evidence.v1' });
assert.equal(nativeEvidence.findings.filter(x=>x.severity==='error').length,0,JSON.stringify(nativeEvidence.findings.slice(0,5)));
assert.equal(nativeEvidence.candidates.length,3,'three canonical Native Evidence presets');
const nativeEvidenceUI = projectTransitionAuthoringPresets(nativeEvidence.candidates.map(c=>({
 representationKey:c.representationKey,canonicalIdentifier:c.canonicalIdentifier,version:c.version,
 label:c.humanLabel||c.canonicalIdentifier,purpose:c.purpose,
 sourcePath:c.source?.locator?.localPath||c.path,authoringProfile:c.authoringProfile
})));
assert.equal(nativeEvidenceUI.templates.length,4,'manual + exactly three qualified Native Evidence templates');
// Core owns package equivalence and Workspace>bootstrap precedence. The
// authoring host does not guess equivalence from matching names or paths.
const independentNative = {
  representationKey:'distinct-source:independent',
  canonicalIdentifier:nativeEvidence.candidates[0].canonicalIdentifier,
  version:nativeEvidence.candidates[0].version,
  label:nativeEvidence.candidates[0].humanLabel,
  sourcePath:'/independent/.topics/transitions/independent.trace.md',
  authoringProfile:{ ...nativeEvidence.candidates[0].authoringProfile,
    defaults:{'Preservation Basis':'Different qualified local binding'} }
};
const baseNative = nativeEvidence.candidates.map(c=>({
  representationKey:c.representationKey,
  canonicalIdentifier:c.canonicalIdentifier,
  version:c.version,
  label:c.humanLabel||c.canonicalIdentifier,
  sourcePath:c.path,
  authoringProfile:c.authoringProfile
}));
assert.equal(dedupeTransitionPresetCandidates([...baseNative,independentNative]).length,4,
  'host may not erase distinct Core-qualified representations sharing the same canonical identifier');
assert.equal(new Set(nativeEvidenceUI.templates.map(x=>x.id)).size,4);
const evidenceContract=buildArtifactCreationContract({schemaId:'tiinex.evidence.v1',transitionType:'create-artifact'});
assert.equal(evidenceContract.status,'ready');
const nativeCases=new Map([
 ['tiinex.core.evidence.preserve-source-excerpt.v1',['contextualizes','source excerpt']],
 ['tiinex.core.evidence.record-image-observation.v1',['illustrates','image']],
 ['tiinex.core.evidence.record-counter-evidence.v1',['challenges','counter-material']]
]);
const evidenceTemp=await fs.mkdtemp(path.join(os.tmpdir(),'tiinex-evidence-native-preset-'));
try {
 for (const c of nativeEvidence.candidates) {
  const requirements=nativeCases.get(c.canonicalIdentifier);
  assert.ok(requirements,c.canonicalIdentifier);
  assert.equal(c.authoringProfile?.state,'qualified',c.canonicalIdentifier);
  assert.equal(c.authoringProfile?.boundary?.executionAuthorized,false);
  assert.equal(c.authoringProfile?.boundary?.explicitSelectionRequired,true);
  const selected=nativeEvidenceUI.templates.find(t=>JSON.stringify(t.defaults)===JSON.stringify(c.authoringProfile.defaults));
  assert.ok(selected && selected.id.startsWith('transition:'),'Core-authorized defaults reach exactly one explicitly selectable host preset');
  assert.equal(selected.defaults['Supported Claim Or Question']['Evidence Role'],requirements[0]);
  assert.ok(selected.defaults['Supported Claim Or Question']['Supported Claim Or Question'].includes(requirements[1]));
  const completed={
   ...selected.defaults,
   'Known Source':'Operator-reviewed test source',
   'Preservation Basis':selected.defaults['Preservation Basis']||'Actual excerpt or attachment preserved with this Evidence',
   'Provenance Limits':selected.defaults['Provenance Limits']||'Only this synthetic E2E content is established',
   'Evidence Material':[{name:'one-observation',fields:{Material:'[actual test fixture](observation.png)','Material Kind':'PNG image',Description:'Operator-supplied preserved material'}}],
   'Preservation State':'Operator-reviewed local material reference',
   'Fidelity Notes':selected.defaults['Fidelity Notes']||'Synthetic local source; does not prove capture fidelity',
   'Known Losses':selected.defaults['Known Losses']||'Original capture conditions unknown',
   'Does Not Prove':selected.defaults['Does Not Prove']||'The claim is true',
   'Not Yet Used As':'A verified finding or released validation',
   'Must Not Be Treated As':selected.defaults['Must Not Be Treated As']||'Attestation or validation'
  };
  const artifact=renderArtifactCreationDraftMarkdown(evidenceContract,{values:completed,title:`${c.humanLabel} — reviewed Evidence`,createdAt:'2026-10-10T14:00:00Z',childPath:`.topics/work/evidence/${c.canonicalIdentifier}.trace.md`});
  const checkedEvidence=validateArtifactCreationResult({schemaId:'tiinex.evidence.v1',markdown:artifact,status:'local',sourceMode:'local-create'},{},{contract:evidenceContract});
  assert.equal(checkedEvidence.ok,true,`${c.canonicalIdentifier}: ${JSON.stringify(checkedEvidence.findings)}`);
  assert.equal(canonicalC14nV2SelfState(artifact).state,'verified');
  const destination=path.join(evidenceTemp,`${c.canonicalIdentifier}.trace.md`);
  await fs.writeFile(destination,artifact);
  assert.equal(await fs.readFile(destination,'utf8'),artifact);
  assert.ok(artifact.includes(requirements[0]),'selected Evidence role materializes in the Core-owned Evidence result');
  if(c.canonicalIdentifier==='tiinex.core.evidence.preserve-source-excerpt.v1') {
   // The original Evidence-on-Evidence acceptance issue is a different Core
   // continuity operation from root preset Create. Test a real local child
   // using the actual persisted preset result with its verified Native
   // schema publication, without inventing any artifact Git origin.
   const {projectPortableAuthoringParent}=await moduleAt('src/tooling/portable/editor/authoring.parent.js');
   const {createPortableLocalDraft}=await moduleAt('src/tooling/portable/draft/draft.create.js');
   const parentPath='.topics/work/evidence/001-observation.trace.md';
   const parent=projectPortableAuthoringParent({records:[{path:parentPath,markdown:await fs.readFile(destination,'utf8')}],reference:parentPath});
   assert.equal(parent.status,'ready',JSON.stringify(parent.findings));
   const child=createPortableLocalDraft({schemaId:'tiinex.evidence.v1',transitionType:'continue-from-record',
     path:'.topics/work/evidence/001-1-observation.trace.md',parent:parent.parentRecord,
     title:'Continued source excerpt Evidence',values:completed,materials:[]});
   assert.equal(child.status,'created-clean',JSON.stringify(child.findings));
   assert.equal(canonicalC14nV2SelfState(child.draft.markdown).state,'verified');
   assert.match(child.draft.markdown, /Parent Schema:/);
  }
 }
}finally{await fs.rm(evidenceTemp,{recursive:true,force:true});}
assert.equal(nativeCases.size,3);
console.log('PASS 3 canonical Native Evidence presets: Semantic Package + Definition + Generation + Companion → exact Core defaults → reviewed Evidence Create/reopen (no execution)');

// Regression for Windows Sigma preview-stale: planning from a Markdown-only
// copy omitted .txt/.png materials which Core nevertheless counts in its
// directory-local namespace. Preview and Apply must inspect the same root.
const { loadNodePortableInput } = await moduleAt('src/tooling/portable/input/node.input.js');
const { prepareEpistemicMaterialization } = await moduleAt('src/tooling/portable/materialization/epistemic.plan.js');
const pathFixture = await fs.mkdtemp(path.join(os.tmpdir(), 'tiinex-preview-path-'));
try {
 const live = path.join(pathFixture, 'live');
 const markdownOnly = path.join(pathFixture, 'markdown-only');
 await fs.mkdir(path.join(live, '.topics'), { recursive: true });
 await fs.mkdir(path.join(markdownOnly, '.topics'), { recursive: true });
 await fs.writeFile(path.join(live, '.topics/001-source.trace.md'), markdown);
 await fs.writeFile(path.join(markdownOnly, '.topics/001-source.trace.md'), markdown);
 await fs.writeFile(path.join(live, '.topics/230-diagnostic.txt'), 'not a Markdown artifact\n');
 const proposal = { id: 'vscode-test', schemaId:'tiinex.task.v1', mode:'root', title:'A new Topic', values:{},
  rationale:'Operator-selected creation', evidenceRefs:['host:vscode-explicit-authoring'] };
 const plan = async (root) => prepareEpistemicMaterialization({ ...(await loadNodePortableInput([root])), proposals:[proposal] });
 const fromLive = (await plan(live)).proposals[0].path;
 const fromFiltered = (await plan(markdownOnly)).proposals[0].path;
 assert.equal(fromLive, '.topics/231-a-new-topic.trace.md');
 assert.equal(fromFiltered, '.topics/002-a-new-topic.trace.md');
 assert.notEqual(fromLive, fromFiltered, 'Markdown-only Preview is not a safe path authority');
 const hostSource = await fs.readFile(path.join(extensionRoot,'src/authoring.ts'), 'utf8');
 assert.match(hostSource, /const plan = await projectArtifactMaterialization\(runtime, root, \[proposal\]\)/,
  'Preview must plan against the same real root as Create');
 assert.match(hostSource, /const plan = await projectArtifactMaterialization\(runtime, draft\.root, \[proposal\]\)/,
  'Create must recompute and verify the actual target against that same root');
 assert.equal((await plan(live)).proposals[0].path, fromLive, 'read-only preview does not consume a lineage ordinal');
 await fs.writeFile(path.join(live, '.topics/235-new-material.txt'), 'changed after preview\n');
 assert.notEqual((await plan(live)).proposals[0].path, fromLive, 'genuine path changes still trigger fail-closed stale detection');
} finally { await fs.rm(pathFixture,{recursive:true,force:true}); }
console.log('PASS Preview/Create Core allocation from identical real Workspace; genuine intervening path changes remain BLOCK');
