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
const { parseArtifactMarkdown } = await moduleAt('src/artifacts/artifact.parse.js');
const { canonicalC14nV2SelfState } = await moduleAt('src/integrity/integrity.c14nV2.js');
function transpile(relative){
 const source = require('node:fs').readFileSync(path.join(extensionRoot,'src/core',relative),'utf8');
 const output = ts.transpileModule(source,{fileName:relative,reportDiagnostics:true,compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}});
 assert.equal(output.diagnostics?.filter(d=>d.category===ts.DiagnosticCategory.Error).length,0);
 const m={exports:{}};new Function('exports','module','require',output.outputText)(m.exports,m,()=>{throw new Error('Unexpected import')});return m.exports;
}
const { compatibleTransitionSeed, sourceScalarPreview } = transpile('transitionSourceSeed.ts');
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
// Deliberately malformed source snapshots must not turn into hidden values.
assert.deepEqual(compatibleTransitionSeed({'Purpose And Scope':{'Role':'fake-role'}},model),{});
console.log('PASS Core Transition Create→persist→reopen; explicit field mapping, claim/material preservation boundary, negative source cases');
