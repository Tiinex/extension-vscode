'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const source = fs.readFileSync(path.join(__dirname, '../src/diagnostics.ts'), 'utf8');
const start = source.indexOf('  private async codeActions(');
const end = source.indexOf('  private updateActiveStatus()', start);
assert(start > 0 && end > start, 'actual host code-action method found');
const snippet = `class Harness { ${source.slice(start, end)} } module.exports=Harness;`;
const compiled = ts.transpileModule(snippet, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS } });
const vscode = {
  CodeActionKind: { QuickFix: 1 },
  CodeAction: class { constructor(title, kind) { this.title=title; this.kind=kind; } }
};
const runtime = { module: { exports: {} }, exports: {}, vscode,
  digest: () => 'same-bytes', diagnosticCode: value => String(value), eligible: () => true,
};
vm.runInNewContext(compiled.outputText, runtime);
const Harness = runtime.module.exports;
(async () => {
  const doc = { isClosed: false, uri: { toString: () => 'file:///child', fsPath: '/child' }, getText: () => 'original' };
  const issue = { code: 'portable.lineage-integrity.parent-target-mismatch' };
  const h = new Harness(); h.actions = new Map(); h.snapshots = new Map();
  const staleOtherAction = { id: 'repair-schema', title: 'Refresh schema permalink', kind: 'replace-document', qualification: 'deterministic-shared-core', sourceSha256: 'same-bytes', diagnosticCodes: ['schema.reference.stale'] };
  h.actions.set('file:///child', [staleOtherAction]);
  let refreshes = 0;
  h.refresh = async () => { refreshes++;
    h.actions.set('file:///child', [staleOtherAction, { id: 'refresh-parent-integrity-and-self-seal', title: 'Refresh Parent and self', kind: 'replace-document', qualification: 'deterministic-shared-core', sourceSha256: 'same-bytes', diagnosticCodes: [issue.code] }]);
    h.snapshots.set('file:///child', { parentRepairAvailability: { state: 'ready', reason: 'verified-local-parent' } });
  };
  h.workspaceEditForAction = async () => ({ state: 'ready', edit: { safe: true } });
  let actions = await h.codeActions(doc, { diagnostics: [issue] });
  assert.equal(refreshes, 1, 'fresh Parent must be requalified even if an unrelated Core fix is cached');
  assert.equal(actions.length, 1);
  assert.equal(actions[0].title, 'Refresh Parent and self');
  assert.deepEqual(JSON.parse(JSON.stringify(actions[0].edit)), { safe: true });
  h.refresh = async () => { refreshes++; h.actions.set('file:///child', [staleOtherAction]); h.snapshots.set('file:///child', { parentRepairAvailability: { state: 'blocked', reason: 'parent-self-not-verified', message: 'Verify Parent first' } }); };
  actions = await h.codeActions(doc, { diagnostics: [issue] });
  assert.equal(actions.length, 1, 'no false fix should be offered when Core blocks repair');
  assert.match(actions[0].title, /Explain why Parent repair is blocked/);
  assert.equal(actions[0].command.command, 'tiinex.artifact.repair');
  console.log('PASS live Parent requalification, deterministic fix, and blocked explanation Quick Fix');
})().catch(e => { console.error(e); process.exitCode = 1; });
