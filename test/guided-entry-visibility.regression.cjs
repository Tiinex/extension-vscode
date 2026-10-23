'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const pkg = require('../package.json');
const menu = pkg.contributes.menus['view/item/context'];
for (const context of ['tiinex.transportPackage','tiinex.transportPackagePointerless','tiinex.transportPackageBootstrapOnly']) {
 const action = menu.find(x=>x.command==='tiinex.transport.guidedEntry' && x.when === `view == tiinex.transport && viewItem == ${context}`);
 assert(action, `Guided Entry must appear for ${context}`);
 assert(action.group.startsWith('inline@'));
}
assert(!menu.some(x=>x.command==='tiinex.transport.guidedEntry' && /tiinex.transport(Route|PackageBootstrapReplacement)$/.test(String(x.when||''))));
for(const command of ['tiinex.transport.copyText','tiinex.transport.guidedEntry'])
 assert.equal(pkg.contributes.commands.find(x=>x.command===command)?.icon,'$(arrow-right)');
const source=fs.readFileSync(path.join(__dirname,'../src/operatorTrees.ts'),'utf8');
const from=source.indexOf('  private async guidedEntryTransport('),to=source.indexOf('  private async copyTransportText(',from);
assert(from>=0&&to>from);
const method=source.slice(from,to);
assert.doesNotMatch(method,/this\.copyTransportText\(/);
assert.match(method,/this\.guidedEntryTransportText\(item\)/);
assert.doesNotMatch(method,/this\.visibleTransportRoutes/,'Independent Entry must never choose a carried Handoff route');
const code=ts.transpileModule(`class Harness { ${method} } module.exports=Harness;`,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText;
const copied=[],shown=[],prepared=[];
const env={module:{exports:{}},exports:{},vscode:{window:{showQuickPick:async()=>{throw Error('Guided Entry may not request Handoff Pointer')}},env:{clipboard:{writeText:async x=>copied.push(x)}}},showTransportCompletionTab:async (...x)=>shown.push(x)};
vm.runInNewContext(code,env);
(async()=>{
 const obj=new env.module.exports();const item={routes:[{routeId:'route:sigma'},{routeId:'route:anchor'}],filename:'tiinex-033.handoff-package.zip',sha256:'abc',packagePath:'/pkg.zip'};
 obj.transportItemForNode=()=>item;obj.guidedEntryTransportText=async()=>({status:'ready',clipboardText:'independent Anchor Entry',carrier:{filename:item.filename}});obj.markTransportPrepared=async(...x)=>prepared.push(x);
 await obj.guidedEntryTransport();
 assert.deepEqual(copied,['independent Anchor Entry']);
 assert.equal(prepared[0][1],'');
 assert.equal(shown[0][1].expectedClipboardText,'independent Anchor Entry');
 console.log('PASS Guided Entry independent of all carried Handoff Pointers; separate right-arrow Handoff');
})().catch(e=>{console.error(e);process.exitCode=1});
