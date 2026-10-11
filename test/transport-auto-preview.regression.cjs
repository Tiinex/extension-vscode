'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const source = fs.readFileSync(path.join(__dirname, '../src/operatorTrees.ts'), 'utf8');
const start = source.indexOf('  private async showPreparedTransportTab(');
const end = source.indexOf('  private async guidedEntryTransportText(', start);
assert(start !== -1 && end > start, 'exact transport presentation method must exist');
const code = `class Harness {\n  transport = [];\n  ${source.slice(start, end)}\n};\nmodule.exports = Harness;`;
const rendered = ts.transpileModule(code, {fileName:'transport-harness.ts', reportDiagnostics: true,
  compilerOptions:{target:ts.ScriptTarget.ES2022, module:ts.ModuleKind.CommonJS}});
assert.equal((rendered.diagnostics || []).filter(x=>x.category===ts.DiagnosticCategory.Error).length, 0);
const previews = [], projections = [], warnings = [];
const sandbox = {module:{exports:{}}, exports:{}, path, extensionHostAcceptanceEnabled:()=>false,
  recordExtensionHostAcceptanceEvent:()=>{throw Error('acceptance mode must not be activated')},
  showTransportCompletionTab:async (...args)=>previews.push(args),
  vscode:{window:{showWarningMessage:async message=>{warnings.push(message)}}},
  shortMessage:e=>String(e?.message||e)};
vm.runInNewContext(rendered.outputText, sandbox);
const H = sandbox.module.exports;
const pkg='/tmp/tiinex-034-anchor-to-sigma.handoff-package.zip';
const route = {routeId:'handoff-route:vscode:.topics/handoffs/001.trace.md', transportText:'exact Core-qualified text'};
const receipt = {status:'ready', clipboardText:route.transportText,carrier:{filename:path.basename(pkg)}, markdown:'# Tiinex transport instructions'};
(async()=>{
  const h = new H();
  h.projectTransportReceipt=async (p, selection)=>{projections.push({p,selection});return receipt};
  await h.showPreparedTransportTab(pkg);
  assert.equal(projections.length,0,'unqualified or not yet queued carriers have no auto preview');
  h.transport=[{packagePath:pkg,filename:path.basename(pkg),routes:[]}];
  await h.showPreparedTransportTab(pkg);
  assert.equal(projections.length,0,'pointerless carrier must not create a preview');
  h.transport[0].routes=[route,{...route,routeId:'other qualified pointer'}];
  await h.showPreparedTransportTab(pkg);
  assert.equal(projections.length,0,'multi-pointer carrier must not auto-select a route');
  h.transport[0].routes=[route];
  await h.showPreparedTransportTab(pkg,'not-copied');
  assert.equal(projections.length,0,'even one qualified route must not auto-preview');
  assert.equal(previews.length,0,'operator must explicitly invoke Guided Handoff');
  assert.equal(warnings.length,0);
  console.log('PASS no automatic transport preview for 0/1/2 qualified pointers');
})().catch(e=>{console.error(e);process.exitCode=1});
