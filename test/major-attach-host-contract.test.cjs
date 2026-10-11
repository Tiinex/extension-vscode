'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const ts=require('typescript');
const sourcePath=path.join(__dirname,'../src/operatorTrees.ts');
const source=fs.readFileSync(sourcePath,'utf8');
const ast=ts.createSourceFile(sourcePath,source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TS);
let participantsMethod;
for(const stmt of ast.statements){
 if(!ts.isClassDeclaration(stmt))continue;
 for(const member of stmt.members){
  if(ts.isMethodDeclaration(member)&&member.name?.getText(ast)==='projectOutgoingParticipants') participantsMethod=member;
 }
}
assert(participantsMethod,'production Attach Handoff method must exist');
const methodSource=participantsMethod.getText(ast).replace(/^private\s+/,'');
const compiled=ts.transpileModule(`class HostUnderTest { ${methodSource} }\nmodule.exports = HostUnderTest;`,{
 compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS},reportDiagnostics:true
});
assert.equal(compiled.diagnostics?.filter(x=>x.category===ts.DiagnosticCategory.Error).length,0);
let supplied;
const sandbox={module:{exports:{}},exports:{},vscode:{ProgressLocation:{Notification:1},window:{withProgress:async (_options,action)=>action({report:()=>{}})}},
 routeChoiceKeyForHandoff:(workspaceId,p)=>`handoff:${workspaceId}:${p}`,
 rootOutgoingPrefix:(s)=>s.replace(/-.*/,''),
 projectHandoffPackageParticipants:async (_extensionPath,input)=>{supplied=input;return {state:'qualified',roles:[]}}
};
vm.runInNewContext(compiled.outputText,sandbox);
const HostUnderTest=sandbox.module.exports;
async function main(){
 const host=new HostUnderTest();
 host.extensionPath='/extension';
 host.outgoing={name:'tiinex-034',carrierPrefix:'tiinex',packageParentPath:'',packageMajorReason:'Stable Major checkpoint',workspaces:[{workspaceId:'vscode',source:'local',root:'/vscode'}]};
 host.qualifiedOutgoingWorkspaceSourceOverrides=async()=>[{workspaceId:'vscode',root:'/vscode'}];
 host.qualifiedOpenWorkspaceSourceOverrides=async()=>[];
 const result=await host.projectOutgoingParticipants({workspaceId:'vscode'},'.topics/handoffs/handoff.trace.md');
 assert.equal(result.state,'qualified');
 assert.equal(supplied.carrierPrefix,'tiinex');
 assert.equal(supplied.packageMajorReason,'Stable Major checkpoint');
 assert.equal(supplied.routeId,'handoff:vscode:.topics/handoffs/handoff.trace.md');
 const previewMethodStart=source.indexOf('const inputBase = {');
 assert(previewMethodStart>0);
 const previewInputBase=source.slice(previewMethodStart,source.indexOf('};',previewMethodStart));
 assert.match(previewInputBase,/carrierPrefix:\s*this\.outgoing\.carrierPrefix/,'pointerless Preview also carries prefix');
 console.log('PASS Attach Handoff carries major prefix and pointerless Preview uses the same observation');
}
main().catch(e=>{console.error(e);process.exitCode=1;});
