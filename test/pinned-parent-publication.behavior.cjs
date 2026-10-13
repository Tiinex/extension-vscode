'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');const path=require('node:path');const vm=require('node:vm');const ts=require('typescript');
const code=fs.readFileSync(path.join(__dirname,'../src/parentPublication.ts'),'utf8');
const compiled=ts.transpileModule(code,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS},reportDiagnostics:true});
assert.deepEqual((compiled.diagnostics||[]).filter(x=>x.category===ts.DiagnosticCategory.Error),[]);
const bytes='# Continuity Context\n\n- Current\n';
const parsedTarget=(target)=>{const url=new URL(target);const p=url.pathname.split('/').filter(Boolean);return {owner:p[0],repo:p[1],ref:p[3],path:p.slice(4).join('/')};};
let expectedGit={commit:'a'.repeat(40),remote:'git@github.com:Tiinex/business.git',content:bytes};
let expectedLocal=bytes;
const fakeGit=async(_cmd,args)=>{
 if(args[0]==='rev-parse')return {stdout:expectedGit.commit+'\n'};
 if(args[0]==='config')return {stdout:expectedGit.remote+'\n'};
 if(args[0]==='show')return {stdout:expectedGit.content};
 throw Error('unexpected git');
};
const modules={
 'node:crypto':require('node:crypto'),
 'node:path':require('node:path'),
 'node:util':{promisify:()=>fakeGit},
 'node:child_process':{execFile:()=>{}},
 'node:fs/promises':{readFile:async()=>expectedLocal},
 'node:https':{get:()=>{throw Error('network should not run in this test');}},
 './permalinkResolution':{parseGitHubBlobPermalink:parsedTarget},
 './core/repositoryPath':{relativeRepositoryPath:(root,file)=>{const rel=path.relative(root,file).replace(/\\/g,'/');if(rel.startsWith('../'))throw Error('outside');return rel;}}
};
const harness={module:{exports:{}},exports:{},require:(id)=>{assert.ok(Object.hasOwn(modules,id),id);return modules[id]},Buffer,Date,URL,Map,Set};harness.exports=harness.module.exports;
vm.runInNewContext(compiled.outputText,harness);
const x=harness.module.exports;
const pinned=`https://github.com/Tiinex/business/blob/${expectedGit.commit}/.topics/work/001-parent.trace.md`;
(async()=>{
 assert.equal(x.githubRepositoryFromRemote('git@github.com:Tiinex/business.git'),'Tiinex/business');
 assert.equal(x.githubRepositoryFromRemote('https://github.com/Tiinex/business.git'),'Tiinex/business');
 assert.equal(x.githubRepositoryFromRemote('https://gitlab.com/Tiinex/business.git'),'');
 assert.equal(x.pinnedParentTraceUrl(`# Continuity Context\n- Parent\n  - Trace: [parent](${pinned})\n- Current\n`),pinned);
 const read=await x.readPinnedGitHubParent(pinned,async()=>bytes);
 assert.equal(read.repository,'Tiinex/business');assert.equal(read.markdown,bytes);
 assert.equal(read.sha256,require('node:crypto').createHash('sha256').update(bytes).digest('hex'));
 assert.equal(await x.readPinnedGitHubParent(pinned.replace(expectedGit.commit,'main'),async()=>bytes),null,'mutable link rejected');
 assert.equal(await x.readPinnedGitHubParent('https://attacker.invalid/blob/'+expectedGit.commit+'/.topics/a.trace.md',async()=>bytes),null,'untrusted host rejected');
 const selected=await x.publishedParentFromLocalChoice('/git-parent','/git-parent/.topics/work/001-parent.trace.md',async()=>read);
 assert.equal(selected.target,pinned);
 expectedLocal='# Continuity Context\nDRIFT\n';
 await assert.rejects(()=>x.publishedParentFromLocalChoice('/git-parent','/git-parent/.topics/work/001-parent.trace.md',async()=>read),/uncommitted-parent-bytes/);
 expectedLocal=bytes;
 expectedGit.remote='https://gitlab.com/Tiinex/business.git';
 await assert.rejects(()=>x.publishedParentFromLocalChoice('/git-parent','/git-parent/.topics/work/001-parent.trace.md',async()=>read),/github-origin-unqualified/);
 console.log('PASS pinned read, immutable URL policy, exact published/committed/local equality, remote origin and rejection gates');
})().catch(e=>{console.error(e);process.exitCode=1});
