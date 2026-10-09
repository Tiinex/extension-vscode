const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
const root=require('node:path').resolve(__dirname,'..')+'/';
const m=(file,mocks={})=>{
 const src=fs.readFileSync(root+file,'utf8');const result=ts.transpileModule(src,{fileName:file,reportDiagnostics:true,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}});
 assert.equal(result.diagnostics?.filter(x=>x.category===ts.DiagnosticCategory.Error).length,0,'Syntax failure: '+file);
 const mod={exports:{}};vm.runInNewContext(result.outputText,{module:mod,exports:mod.exports,require:(name)=>{if(name in mocks)return mocks[name];throw Error('Module not mocked: '+name);},Object,Set,Array});return mod.exports;
};
async function main(){
 const opened=[]; const window=[];
 const vscode={workspace:{openTextDocument:async spec=>{opened.push(spec);return {spec};},getConfiguration:()=>({get:(key,defaultValue)=>defaultValue})},window:{showTextDocument:async(doc,config)=>{window.push([doc,config]);}}};
 const presenter=m('src/vscode/transportCompletionPresentation.ts',{vscode});
 const ready={status:'ready',carrier:{filename:'tiinex-001-anchor-to-anchor.handoff-package.zip'},clipboardText:'Exact text\n',markdown:'# Tiinex transport instructions\n\n## Exact clipboard text\n\n```text\nExact text\n```\n'};
 await presenter.showTransportCompletionTab(ready,{clipboard:'copied',expectedCarrierFilename:ready.carrier.filename,expectedClipboardText:ready.clipboardText});
 assert.equal(opened.length,1);assert.equal(opened[0].language,'markdown');assert.match(opened[0].content,/Clipboard \(VS Code host\): Copied successfully/);assert.match(opened[0].content,/Exact text/);
 assert.equal(window[0][1].preview,false);
 await assert.rejects(()=>presenter.showTransportCompletionTab(ready,{clipboard:'copied',expectedClipboardText:'tampered'}),/bytes-mismatch/);
 await assert.rejects(()=>presenter.showTransportCompletionTab(ready,{clipboard:'copied',expectedCarrierFilename:'renamed.zip'}),/name-mismatch/);
 const selection={status:'blocked',reasonCode:'route-selection-required',markdown:'# Route selection required'};
 await presenter.showTransportCompletionTab(selection,{clipboard:'not-copied'});
 await assert.rejects(()=>presenter.showTransportCompletionTab({status:'blocked',reasonCode:'carrier-invalid',markdown:'no'}, {clipboard:'not-copied'}),/receipt-carrier-invalid/);
 const policy=m('src/core/copilotPanelAccess.ts');
 let selected='none'; const adapter=m('src/vscode/copilotPanelDelegation.ts',{vscode:{workspace:{getConfiguration:()=>({get:()=>selected})}},'../core/copilotPanelAccess':policy});
 assert.equal(adapter.qualifyCurrentCopilotPanelAction('outgoing.pack').status,'denied'); selected='pack-and-transport'; assert.equal(adapter.qualifyCurrentCopilotPanelAction('outgoing.pack').status,'allowed'); assert.equal(adapter.qualifyCurrentCopilotPanelAction('incoming.unpack-staging').status,'denied'); selected='inspect-unpack-pack-and-transport'; assert.equal(adapter.qualifyCurrentCopilotPanelAction('incoming.unpack-staging').status,'allowed');assert.equal(adapter.qualifyCurrentCopilotPanelAction('incoming.replace').status,'denied');
 for (const f of ['src/operatorTrees.ts','src/tiinex/bootstrap.ts']) {const s=fs.readFileSync(root+f,'utf8');const r=ts.transpileModule(s,{fileName:f,reportDiagnostics:true,compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}});assert.equal(r.diagnostics?.filter(x=>x.category===ts.DiagnosticCategory.Error).length,0,f+' transpilation');}
 console.log('PASS VS Code Markdown tab + clipboard fidelity guards + delegated panel settings read per invocation + TS transpilation');
}
main().catch(e=>{console.error(e);process.exitCode=1;});
