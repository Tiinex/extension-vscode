'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

const file = path.join(__dirname,'../src/vscode/transportCompletionPresentation.ts');
const source=fs.readFileSync(file,'utf8');
const start=source.indexOf('export async function showTransportCompletionTab(');
const end=source.indexOf('\n}',start)+2;
assert(start >= 0 && end > start);
const method=source.slice(start,end);
const compiled=ts.transpileModule(method,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const clipboard='Handoff package attached.\n\nStart: 001-1-READ-BEFORE-PROCEEDING.trace.md\n';
const human='## Prepare this environment — operator-only\n\n### Manual cold start\n\nReview provider policy.';
const receipt={status:'ready',clipboardText:clipboard,carrier:{filename:'qualified.zip'},markdown:'# Tiinex transport instructions\n\n## Handoff overview\n\n'+human+'\n\n## Exact clipboard text\n\n```text\n'+clipboard+'```'};
let displayed='',command=0;
const uuid=()=> 'mock-id';
const mocks={ exports:{}, randomUUID:uuid, TRANSPORT_SCHEME:'tiinex-transport', providerRegistered:true,
 transportDocuments:new Map(),
 vscode:{Uri:{from:({scheme,path,query})=>({scheme,path,query,toString:()=>`${scheme}:${path}?${query}`})},commands:{executeCommand:async(_command,uri)=>{command++;displayed=mocks.transportDocuments.get(uri.toString());}}}
};
vm.runInNewContext(compiled,mocks);
(async()=>{
 await mocks.exports.showTransportCompletionTab(receipt,{clipboard:'copied',expectedClipboardText:clipboard,expectedCarrierFilename:'qualified.zip'});
 assert.equal(command,1);
 assert.match(displayed,/Manual cold start/);
 assert.match(displayed,/Clipboard \(VS Code host\): Copied successfully/);
 assert.equal(receipt.clipboardText,clipboard,'host may not mutate the exact recipient text');
 await assert.rejects(()=>mocks.exports.showTransportCompletionTab(receipt,{clipboard:'copied',expectedClipboardText:clipboard+'\n',expectedCarrierFilename:'qualified.zip'}),/clipboard-bytes-mismatch/);
 console.log('PASS operator-only human Preview, exact clipboard preserved, mismatch blocked');
})().catch(e=>{console.error(e);process.exitCode=1});
