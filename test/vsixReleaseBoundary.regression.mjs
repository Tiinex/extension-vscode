import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { qualifyVsixReleaseCoreBinding } from '../scripts/vsix-release-policy.mjs';
import { qualifyCoreAgentAbi } from '../scripts/vsix-core-abi.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const eligible={bindingMode:'installed-package',version:'0.45.0',lockedVersion:'0.45.0',declaredRange:'0.45.0'};
assert.deepEqual(qualifyVsixReleaseCoreBinding(eligible,{release:true}),{status:'ready',releaseQualified:true,coreVersion:'0.45.0'});
assert.equal(qualifyVsixReleaseCoreBinding({bindingMode:'sibling-source',version:'999.0.0'},{}).status,'development-only');
for (const [binding, reason] of [
 [{...eligible,bindingMode:'sibling-source'},/sibling-core-not-published/],
 [{...eligible,version:'999.0.0',lockedVersion:'999.0.0',declaredRange:'999.0.0'},/placeholder-core-version/],
 [{...eligible,declaredRange:'^0.45.0'},/dependency-tuple-not-exact/],
 [{...eligible,lockedVersion:'0.45.1'},/dependency-tuple-not-exact/],
 [{...eligible,version:'0.45.0-rc.1'},/placeholder-core-version/],
 [{...eligible,version:''},/placeholder-core-version/]
]) assert.throws(()=>qualifyVsixReleaseCoreBinding(binding,{release:true}),reason);
const safe={status:'ready',operation:'inspect-agent-capabilities',operations:['inspect-agent-capabilities','project-agent-role-sync'].map(id=>({id,safety:'read-only',hostExecution:'not-qualified',roleAuthorization:'not-established'}))};
assert.deepEqual(qualifyCoreAgentAbi(safe),{status:'ready',operations:['inspect-agent-capabilities','project-agent-role-sync']});
assert.throws(()=>qualifyCoreAgentAbi({...safe,operations:safe.operations.slice(0,1)}),/operation-missing:project-agent-role-sync/);
assert.throws(()=>qualifyCoreAgentAbi({...safe,operations:[{...safe.operations[0],hostExecution:'qualified'},safe.operations[1]]}),/authority-drift/);
assert.throws(()=>qualifyCoreAgentAbi({...safe,status:'unavailable'}),/discovery-unavailable/);
const packager=await readFile(path.join(root,'scripts/package-vsix.mjs'),'utf8');
assert.ok(packager.includes("qualifyVsixReleaseCoreBinding(binding, { release: process.env.TIINEX_VSIX_RELEASE === '1' })"));
assert.match(packager,/await rm\(OUT, \{ force: true \}\)/);
assert.ok(packager.includes("qualifyCoreAgentAbi(JSON.parse(coreProbe.stdout))"));
const script=await readFile(path.join(root,'scripts/package-vsix-release.mjs'),'utf8');
assert.match(script,/TIINEX_VSIX_RELEASE: '1'/);
const pkg=JSON.parse(await readFile(path.join(root,'package.json'),'utf8'));
assert.ok(pkg.scripts['vsix:release'].includes('package-vsix-release.mjs'));
console.log('PASS Marketplace VSIX release guard rejects local/placeholder/mismatched Core and preserves development-smoke distinction');
