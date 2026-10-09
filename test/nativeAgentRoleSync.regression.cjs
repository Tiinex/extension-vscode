'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const ts=require('typescript');
const root=path.resolve(__dirname,'..'), file=path.join(root,'src/vscode/nativeAgentRoleSync.ts');
const compiled=ts.transpileModule(fs.readFileSync(file,'utf8'),{fileName:file,reportDiagnostics:true,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}});
assert.equal((compiled.diagnostics||[]).filter(x=>x.category===ts.DiagnosticCategory.Error).length,0);
let handler,confirm='Cancel',calls=[],messages=[],alreadyApplied=false;
const vscode={
 workspace:{isTrusted:true,workspaceFolders:[{name:'app',uri:{fsPath:'/work/app'}}],openTextDocument:async arg=>({arg})},
 commands:{registerCommand:(id,fn)=>{assert.equal(id,'tiinex.agent.previewRoleSync');handler=fn;return {dispose(){}}}},
 window:{showOpenDialog:async()=>[{scheme:'file',fsPath:'/work/app/.topics/roles/a.trace.md'}],
  showWarningMessage:async(...args)=>{messages.push(args);return confirm},
  showTextDocument:async()=>{},showInformationMessage:async()=>{},showQuickPick:async()=>null}
};
const runProcess=async (...args)=>{
 calls.push(args);const argv=args[1]; const mode=argv[argv.indexOf('--mode')+1];
 const item=mode==='plan'
  ? {status:'ready',action:'create',target:'.github/agents/tiinex-anchor.agent.md',afterSha256:'a'.repeat(64),preview:'# Generated Role\n'}
  : {status:'ready',action:alreadyApplied?'noop':'create',target:'.github/agents/tiinex-anchor.agent.md',afterSha256:'a'.repeat(64),applied:!alreadyApplied};
 return {code:0,stdout:JSON.stringify(item),stderr:''};
};
const modules={'vscode':vscode,'node:path':require('node:path'),
 '../host/corePackageBinding':{qualifyInstalledCore:async()=>({root:'/core',entrypoint:'/core/tools/tiinex-portable.mjs'})},
 '../host/process':{runProcess,nodeProcessEnvironment:()=>({})},
 '../host/nodeExecutable':{preferredNodeExecutable:()=>'/node'}};
const mod={exports:{}};
new Function('require','module','exports',compiled.outputText)((name)=>{assert.ok(modules[name],name);return modules[name]},mod,mod.exports);
mod.exports.registerTiinexNativeAgentRoleSync({subscriptions:[]},'/extension');
(async()=>{
 await handler(); assert.equal(calls.length,1,'cancel makes no Core write');
 confirm='Apply Role agent'; await handler(); assert.equal(calls.length,3); assert.equal(calls[2][1].includes('--approved'),true); assert.equal(calls[2][1].includes('a'.repeat(64)),true);
 alreadyApplied=true; await handler();
 assert.equal(calls.length,5,'idempotent second Apply passes through Core');
 vscode.workspace.isTrusted=false; await assert.rejects(()=>handler(),/workspace-untrusted/); assert.equal(calls.length,5);
 vscode.workspace.isTrusted=true;
 await assert.rejects(()=>handler({scheme:'file',fsPath:'/outside/role.trace.md'}),/role-outside-open-workspaces/);
 assert.equal(calls.length,5);
 const pkg=require(path.join(root,'package.json'));
 assert.ok(pkg.contributes.commands.some(x=>x.command==='tiinex.agent.previewRoleSync'));
 console.log('PASS VS Code Core plan→preview→explicit approve→apply/noop, decline nonmutating, untrusted/outside denied');
})().catch(e=>{console.error(e);process.exitCode=1});
