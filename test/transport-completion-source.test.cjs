const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
const root=require('node:path').resolve(__dirname,'..')+'/';
const m=(file,mocks={})=>{
 const src=fs.readFileSync(root+file,'utf8');const result=ts.transpileModule(src,{fileName:file,reportDiagnostics:true,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}});
 assert.equal(result.diagnostics?.filter(x=>x.category===ts.DiagnosticCategory.Error).length,0,'Syntax failure: '+file);
 const mod={exports:{}};vm.runInNewContext(result.outputText,{module:mod,exports:mod.exports,require:(name)=>{if(name in mocks)return mocks[name];throw Error('Module not mocked: '+name);},Object,Set,Array});return mod.exports;
};
async function main(){
 const opened=[]; const window=[]; const previews=[]; const subscriptions=[];
 let provider; let closeListener; let previewAvailable=true;
 const vscode={
  Uri:{from:(parts)=>({...parts,toString:()=>parts.scheme+':'+parts.path+'?'+parts.query})},
  workspace:{
   registerTextDocumentContentProvider:(scheme,value)=>{assert.equal(scheme,'tiinex-transport');provider=value;return {dispose(){}};},
   onDidCloseTextDocument:(listener)=>{closeListener=listener;return {dispose(){}};},
   openTextDocument:async uri=>{opened.push(uri);return {uri};},
   getConfiguration:()=>({get:(key,defaultValue)=>defaultValue})
  },
  commands:{executeCommand:async (name,uri)=>{
   assert.equal(name,'markdown.showPreview');
   if (!previewAvailable) throw Error('Preview missing');
   previews.push({uri,markdown:provider.provideTextDocumentContent(uri)});
  }},
  window:{showTextDocument:async(doc,config)=>{window.push([doc,config]);}}
 };
 const presenter=m('src/vscode/transportCompletionPresentation.ts',{vscode,'node:crypto':{randomUUID:()=>String(previews.length+opened.length+1)}});
 presenter.registerTransportCompletionPresentation({subscriptions});
 assert.equal(subscriptions.length,3);
 const ready={status:'ready',carrier:{filename:'tiinex-001-anchor-to-anchor.handoff-package.zip'},clipboardText:'Exact text\n',markdown:'# Tiinex transport instructions\n\n## Exact clipboard text\n\n```text\nExact text\n```\n'};
 await presenter.showTransportCompletionTab(ready,{clipboard:'copied',expectedCarrierFilename:ready.carrier.filename,expectedClipboardText:ready.clipboardText});
 assert.equal(opened.length,0,'no unsaved Untitled editor');
 assert.equal(previews.length,1);
 assert.equal(previews[0].uri.scheme,'tiinex-transport');
 assert.match(previews[0].markdown,/Clipboard \(VS Code host\): Copied successfully/);
 assert.match(previews[0].markdown,/Exact text/);
 assert.equal(provider.provideTextDocumentContent(previews[0].uri),previews[0].markdown);
 closeListener({uri:previews[0].uri});
 assert.equal(provider.provideTextDocumentContent(previews[0].uri),'','virtual text released when document closes');
 await assert.rejects(()=>presenter.showTransportCompletionTab(ready,{clipboard:'copied',expectedClipboardText:'tampered'}),/bytes-mismatch/);
 await assert.rejects(()=>presenter.showTransportCompletionTab(ready,{clipboard:'copied',expectedCarrierFilename:'renamed.zip'}),/name-mismatch/);
 const selection={status:'blocked',reasonCode:'route-selection-required',markdown:'# Route selection required'};
 await presenter.showTransportCompletionTab(selection,{clipboard:'not-copied'});
 previewAvailable=false;
 await presenter.showTransportCompletionTab(ready,{clipboard:'copied'});
 assert.equal(opened.length,1,'fallback opens read-only virtual document');
 assert.equal(window[0][1].preview,true);
 await assert.rejects(()=>presenter.showTransportCompletionTab({status:'blocked',reasonCode:'carrier-invalid',markdown:'no'}, {clipboard:'not-copied'}),/receipt-carrier-invalid/);
 const policy=m('src/core/copilotPanelAccess.ts');
 let selected='none'; const adapter=m('src/vscode/copilotPanelDelegation.ts',{vscode:{workspace:{getConfiguration:()=>({get:()=>selected})}},'../core/copilotPanelAccess':policy});
 assert.equal(adapter.qualifyCurrentCopilotPanelAction('outgoing.pack').status,'denied'); selected='pack-and-transport'; assert.equal(adapter.qualifyCurrentCopilotPanelAction('outgoing.pack').status,'allowed'); assert.equal(adapter.qualifyCurrentCopilotPanelAction('incoming.unpack-staging').status,'denied'); selected='inspect-unpack-pack-and-transport'; assert.equal(adapter.qualifyCurrentCopilotPanelAction('incoming.unpack-staging').status,'allowed');assert.equal(adapter.qualifyCurrentCopilotPanelAction('incoming.replace').status,'denied');
 for (const f of ['src/operatorTrees.ts','src/tiinex/bootstrap.ts','src/extension.ts']) {const s=fs.readFileSync(root+f,'utf8');const r=ts.transpileModule(s,{fileName:f,reportDiagnostics:true,compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}});assert.equal(r.diagnostics?.filter(x=>x.category===ts.DiagnosticCategory.Error).length,0,f+' transpilation');}
 console.log('PASS read-only Markdown preview + clipboard fidelity guards + delegated panel settings read per invocation + TS transpilation');
}
main().catch(e=>{console.error(e);process.exitCode=1;});
