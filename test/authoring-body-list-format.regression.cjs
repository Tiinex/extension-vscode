'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const ts=require('typescript');
const panel=fs.readFileSync(path.join(__dirname,'../src/artifactAuthoringPanel.ts'),'utf8');
const start=panel.indexOf('export function formatFreeBodyLinesAsBullets(');
const end=panel.indexOf('\nfunction fieldId(',start);
assert(start>=0&&end>start);
const js=ts.transpileModule(panel.slice(start,end),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText;
const scope={module:{exports:{}},exports:{}};
vm.runInNewContext(js,scope);
const f=scope.exports.formatFreeBodyLinesAsBullets;
assert.equal(f('One\nTwo\nThree').text,'- One\n- Two\n- Three');
assert.equal(f('One\r\nTwo').text,'- One\n- Two');
assert.equal(f('One\n\nTwo').text,'- One\n- Two');
for(const markdown of ['- Existing\n- List','## Heading\nbody','```json\n{"a":1}\n```','1. A\n2. B','  indented\n prose','- Workspace\n  - Ref: link']){
 const result=f(markdown);
 assert.equal(result.status,'blocked',JSON.stringify(markdown));
 assert.equal(result.text,markdown,'never rewrite existing Markdown or nested material');
}
assert.equal(f('').status,'blocked');
assert.match(panel,/section\.fields\.filter\(\(field\) => field\.multiline && !field\.autoBulletList\)/);
assert.match(panel,/data-kind="body"/);
assert.match(panel,/target\.value=result\.text/);
assert.doesNotMatch(panel.slice(panel.indexOf('function ordinarySection('),panel.indexOf('function bodySection(')),/body-to-list/,'ordinary scalar fields have no list control');
assert.doesNotMatch(panel.slice(panel.indexOf('function groupSection('),panel.indexOf('function repeatableItem(')),/body-to-list/,'structured groups have no list control');
console.log('PASS safe operator-only newline-to-bullets on free body fields; structured Markdown preserved');
