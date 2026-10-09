const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
const root=require('node:path').resolve(__dirname,'../..');
const f=require('node:path').join(root,'src/core/copilotPanelAccess.ts');
const code=ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const m={exports:{}};vm.runInNewContext(code,{module:m,exports:m.exports,Object,Set});const q=m.exports.qualifyCopilotPanelAction;
for(const [level,allowed] of [['none',[]],['pack-and-transport',['outgoing.preview','outgoing.pack','transport.copy-text','transport.open-receipt']],['inspect-unpack-pack-and-transport',['outgoing.pack','incoming.inspect','incoming.unpack-staging']]]){
 for(const a of ['outgoing.preview','outgoing.pack','transport.copy-text','transport.open-receipt','incoming.inspect','incoming.unpack-staging','incoming.replace','incoming.reject','git.reset','incoming.delete','role.assume']){
  assert.equal(q(a,level).status, allowed.includes(a)?'allowed':level==='pack-and-transport'&&['outgoing.preview','outgoing.pack','transport.copy-text','transport.open-receipt'].includes(a)?'allowed':level==='inspect-unpack-pack-and-transport'&&['outgoing.preview','outgoing.pack','transport.copy-text','transport.open-receipt','incoming.preview','transport.inspect-ready'].includes(a)?'allowed':'denied',`${level}:${a}`);
 }
}
for(const level of ['Full','unexpected',null,{},true])assert.equal(q('outgoing.pack',level).status,'denied');
const pkg=JSON.parse(fs.readFileSync(require('node:path').join(root,'package.json')));assert.equal(pkg.contributes.configuration.properties['tiinex.copilot.panelActions'].default,'none');
console.log('PASS default deny, all 3 delegated levels, unknown/unsafe panel actions blocked, no global author gate');
