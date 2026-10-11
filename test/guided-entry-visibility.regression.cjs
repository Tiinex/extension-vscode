'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const pkg = require('../package.json');
const menu = pkg.contributes.menus['view/item/context'];
for (const context of ['tiinex.transportPackage','tiinex.transportPackagePointerless','tiinex.transportRoute']) {
 const action = menu.find(x=>x.command==='tiinex.transport.guidedEntry' && x.when === `view == tiinex.transport && viewItem == ${context}`);
 assert(action, `Guided Entry must appear for ${context}`);
 assert(action.group.startsWith('inline@'), 'discoverable inline control');
}
const source=fs.readFileSync(path.join(__dirname,'../src/operatorTrees.ts'),'utf8');
const from=source.indexOf('  private async guidedEntryTransport(');
const to=source.indexOf('  private async copyTransportText(',from);
assert(from>=0 && to>from);
const method=source.slice(from,to);
assert.doesNotMatch(method,/return\s+this\.copyTransportText\(/,'explicit Guided Entry must never silently become Guided Handoff');
assert.match(method,/this\.guidedEntryTransportText\(item, routeId\)/);
assert.match(method,/node\?\.data\.kind === 'route'/);
const js=ts.transpileModule(`class Harness { ${method} } module.exports=Harness;`,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText;
const vm=require('node:vm');
const context={module:{exports:{}},exports:{},vscode:{window:{showQuickPick:async()=>{throw Error('single qualified route should not trigger route picker')}},env:{clipboard:{writeText:async()=>{}}}},showTransportCompletionTab:async()=>{}};
vm.runInNewContext(js,context);
(async()=>{
 const obj=new context.module.exports();
 const calls=[];
 const item={routes:[{routeId:'exact-qualified-route',to:'Sigma'}], filename:'pkg.zip',sha256:'abc',packagePath:'/pkg.zip'};
 obj.transportItemForNode=()=>item;
 obj.visibleTransportRoutes=()=>item.routes;
 obj.copyTransportText=()=>{throw Error('must not handoff')};
 obj.guidedEntryTransportText=async(_item,route)=>{calls.push(route);return {status:'ready',clipboardText:'exact'};};
 obj.markTransportPrepared=async()=>{};
 await obj.guidedEntryTransport();
 await obj.guidedEntryTransport({data:{kind:'route',routeId:'exact-qualified-route'}});
 assert.deepEqual(calls,['exact-qualified-route','exact-qualified-route']);
 console.log('PASS Guided Entry inline on formal/pointerless/route and independent full Entry action');
})().catch(e=>{console.error(e);process.exitCode=1});
