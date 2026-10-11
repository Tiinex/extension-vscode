'use strict';
// Compile the exact Guided Handoff TypeScript method against the relevant VS
// Code QuickPick overload contract, not just via transpileModule. This remains
// runnable in an isolated host without npm registry or installed VS Code types.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const file = path.join(__dirname, '../src/operatorTrees.ts');
const source = fs.readFileSync(file, 'utf8');
const start = source.indexOf('  private async guidedHandoffTransportText(');
const end = source.indexOf('  private async guidedEntryTransportText(', start);
assert(start >= 0 && end > start, 'Guided Handoff method is present');
const method = source.slice(start, end);
const declarations = `
declare namespace vscode {
  enum QuickPickItemKind { Separator = -1, Default = 0 }
  interface QuickPickItem { label: string; description?: string; detail?: string; kind?: QuickPickItemKind }
  interface QuickPickOptions { title?: string; placeHolder?: string; ignoreFocusOut?: boolean; canPickMany?: boolean }
  interface WorkspaceFolder { uri: { fsPath: string } }
  namespace workspace { const workspaceFolders: readonly WorkspaceFolder[] | undefined }
  namespace window {
    function showQuickPick<T extends QuickPickItem>(items: readonly T[], options?: QuickPickOptions & { canPickMany?: false }): Promise<T | undefined>;
    function showQuickPick<T extends QuickPickItem>(items: readonly T[], options: QuickPickOptions & { canPickMany: true }): Promise<T[] | undefined>;
  }
}
interface TransportPackageState { packagePath: string }
interface TransportCompletionReceipt { status: string; clipboardText: string; reasonCode?: string }
declare function nodeExecutable(): string;
declare function prepareHostCoreRuntime(...args: unknown[]): Promise<{dispose(): Promise<void>}>;
declare function projectWorkspaceCarrierEntry(...args: unknown[]): Promise<{
  status: string; state: string; reasonCode?: string;
  targets?: Array<{ label?: string; canonicalTargetIdentifier?: string; id?: string; targetKind?: string;
    provider?: string; host?: string; sourceKind?: string; summary?: string }>;
}>;
declare function projectTransportCompletion(...args: unknown[]): Promise<TransportCompletionReceipt>;
class Harness { extensionPath = '/extension'; ${method} }
`;
const virtualPath = '/tmp/tiinex-guided-handoff-quickpick-check.ts';
const options = { strict: true, noEmit: true, target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS };
function check(programSource) {
  const host = ts.createCompilerHost(options);
  const realFileExists = host.fileExists.bind(host);
  const realReadFile = host.readFile.bind(host);
  host.fileExists = (p) => p === virtualPath || realFileExists(p);
  host.readFile = (p) => p === virtualPath ? programSource : realReadFile(p);
  host.getSourceFile = (p, languageVersion) => {
    const contents = host.readFile(p);
    return contents === undefined ? undefined : ts.createSourceFile(p, contents, languageVersion);
  };
  const program = ts.createProgram([virtualPath], options, host);
  return ts.getPreEmitDiagnostics(program).map((d) => `${d.code}: ${ts.flattenDiagnosticMessageText(d.messageText, ' ')}`);
}
const diagnostics = check(declarations);
assert.deepEqual(diagnostics, [], 'Guided Handoff method must typecheck against VS Code QuickPick overloads:\n' + diagnostics.join('\n'));
// Negative control reproduces the old faulty representation (a string-valued
// QuickPickItem.kind property) so the test cannot silently accept TS2769 again.
const oldStyle = declarations
  .replace('const choices: HandoffTargetPick[] = targets.map((target) => ({', 'const choices = targets.map((target) => ({')
  .replace('id: String(target.id || \'\'), targetKind: String(target.targetKind || \'\')', 'id: String(target.id || \'\'), kind: String(target.targetKind || \'\')')
  .replace('showQuickPick<HandoffTargetPick>(choices,', 'showQuickPick(choices,')
  .replace('selected.targetKind.toLowerCase()', 'selected.kind.toLowerCase()');
const negative = check(oldStyle);
assert(negative.some((d) => /^2769:|^2339:|^18048:/.test(d)), `Negative control unexpectedly typechecked: ${negative.join('; ')}`);
console.log('PASS Guided Handoff TS strict QuickPick overload; old TS2769 regression detected');
