'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const source=fs.readFileSync(path.join(__dirname,'../src/extension.ts'),'utf8');
const start=source.indexOf('      const snapshot = repair.snapshot;');
const end=source.indexOf('      const choice = await vscode.window.showWarningMessage(detail,',start);
assert(start>0&&end>start);
const snippet=source.slice(start,end);
const prelude=`
interface Availability {state:string;reason:string;message:string;blockerCodes?: string[];blockers?: Array<{path:string;state:string}>}
interface Snapshot {state:string; parentRepairAvailability?:Availability}
interface Repair {snapshot?:Snapshot}
declare const repair:Repair;
function label() { ${snippet} return detail; }
`;
const filename='/tmp/tiinex-repair-blocker-typecheck.ts';
const options={strict:true,noEmit:true,target:ts.ScriptTarget.ES2022};
function check(contents){const host=ts.createCompilerHost(options);const real=host.readFile.bind(host),exists=host.fileExists.bind(host);host.readFile=f=>f===filename?contents:real(f);host.fileExists=f=>f===filename||exists(f);host.getSourceFile=(f,version)=>{const c=host.readFile(f);return c===undefined?undefined:ts.createSourceFile(f,c,version)};return ts.getPreEmitDiagnostics(ts.createProgram([filename],options,host)).map(d=>d.code+': '+ts.flattenDiagnosticMessageText(d.messageText,' '));}
const errors=check(prelude);assert.deepEqual(errors,[],errors.join('\n'));
const old=prelude.replace('blockerCodes.join(', 'blocked.blockerCodes.join(');
assert(check(old).some(x=>x.startsWith('18048:')),'negative control must reproduce potentially undefined blockerCodes');
console.log('PASS strict TS repair blocker typecheck; old undefined blockerCodes rejected');
