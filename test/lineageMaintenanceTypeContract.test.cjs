'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const ts = require('typescript');

// The host extension's real npm-backed tsc is the release gate. This small
// isolated semantic check ensures the QuickPick overload that broke the
// Windows Sigma build cannot regress while @types/vscode is not installed.
const repo = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(repo, 'src/vscode/lineageMaintenance.ts'), 'utf8');
const start = source.indexOf('  type LineageOperation =');
const end = source.indexOf('  let operation: any;', start);
assert.ok(start > 0 && end > start, 'Move/Rebase operation picker must exist');
const picker = source.slice(start, end);
assert.doesNotMatch(picker, /\bkind:\s*'(?:move|prepend|normalize-directory)'/, 'domain discriminator must not conflict with VS Code QuickPickItem.kind');
assert.match(source.slice(end, end + 1300), /selectedMode\.operation\s*===\s*'move'/);
assert.match(source.slice(end, end + 1800), /selectedMode\.operation\s*===\s*'prepend'/);

const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'tiinex-vscode-quickpick-typing-'));
try {
  const input = path.join(temp, 'quickpick.ts');
  fs.writeFileSync(input, `
namespace vscode {
  export enum QuickPickItemKind { Separator = -1, Default = 0 }
  export interface QuickPickItem { label: string; description?: string; kind?: QuickPickItemKind }
  export declare const window: {
    showQuickPick<T extends QuickPickItem>(items: readonly T[], options?: { title?: string; placeHolder?: string }): Promise<T | undefined>;
    showQuickPick(items: readonly string[], options?: { title?: string; placeHolder?: string }): Promise<string | undefined>;
  };
}
async function testPicker() {
${picker}
  if (selectedMode) {
    const operation: 'move' | 'prepend' | 'normalize-directory' = selectedMode.operation;
    const label: string = selectedMode.label;
    void operation; void label;
  }
}
`);
  const program = ts.createProgram([input], { target: ts.ScriptTarget.ES2022, strict: true, noEmit: true, skipLibCheck: true });
  const errors = ts.getPreEmitDiagnostics(program).filter(d => d.category === ts.DiagnosticCategory.Error);
  assert.equal(errors.length, 0, errors.map(d => ts.flattenDiagnosticMessageText(d.messageText, '\n')).join('\n'));
  console.log('PASS Move/Rebase options satisfy VS Code QuickPickItem overload and typed selection');
} finally { fs.rmSync(temp, {recursive:true, force:true}); }
