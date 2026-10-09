import * as vscode from 'vscode';
import * as path from 'node:path';
import { qualifyInstalledCore } from '../host/corePackageBinding';
import { nodeProcessEnvironment, runProcess } from '../host/process';
import { preferredNodeExecutable } from '../host/nodeExecutable';

type SyncReceipt = { status?: string; code?: string; action?: string; afterSha256?: string; target?: string; preview?: string; applied?: boolean };

/** Thin host UX over Core's plan/check/apply; no host Role parsing or mutation. */
export function registerTiinexNativeAgentRoleSync(context: vscode.ExtensionContext, extensionPath: string): void {
  context.subscriptions.push(vscode.commands.registerCommand('tiinex.agent.previewRoleSync', async (resource?: vscode.Uri) => {
    if (!vscode.workspace.isTrusted) throw new Error('tiinex.agent-sync.workspace-untrusted');
    const workspaces = vscode.workspace.workspaceFolders || [];
    if (!workspaces.length) throw new Error('tiinex.agent-sync.workspace-required');
    const folder = workspaces.length === 1
      ? workspaces[0]
      : (await vscode.window.showQuickPick(workspaces.map(item => ({ label: item.name, description: item.uri.fsPath, folder: item })),
        { placeHolder: 'Choose the target Workspace for generated agent files' }))?.folder;
    if (!folder) return;
    const file = resource?.scheme === 'file' && resource.fsPath.endsWith('.trace.md') ? resource
      : (await vscode.window.showOpenDialog({ canSelectFiles: true, canSelectFolders: false, canSelectMany: false,
        filters: { 'Tiinex Role': ['md'] }, openLabel: 'Select qualified Tiinex Role' }))?.[0];
    if (!file || file.scheme !== 'file') return;
    // Explicit selected local source only; Core performs actual schema qualification.
    if (!workspaces.some(w => {
      const rel = path.relative(w.uri.fsPath, file.fsPath);
      return rel && rel !== '..' && !rel.startsWith('..'+path.sep) && !path.isAbsolute(rel);
    })) throw new Error('tiinex.agent-sync.role-outside-open-workspaces');
    const core = await qualifyInstalledCore(extensionPath);
    const run = async (mode: 'plan' | 'apply', expected = ''): Promise<SyncReceipt> => {
      const args = [core.entrypoint, 'agent-role-sync', '--workspace', folder.uri.fsPath,
        '--role', file.fsPath, '--mode', mode, '--compact'];
      if (mode === 'apply') args.push('--approved', '--expected-after-sha256', expected);
      const receipt = await runProcess(preferredNodeExecutable(), args, {cwd:core.root,env:nodeProcessEnvironment()});
      let parsed: SyncReceipt;
      try { parsed = JSON.parse(receipt.stdout) as SyncReceipt; }
      catch { throw new Error(`tiinex.agent-sync.core-unavailable:${receipt.stderr.slice(0,300)}`); }
      if (receipt.code !== 0 || parsed.status !== 'ready') throw new Error(`tiinex.agent-sync.core-blocked:${parsed.code || receipt.stderr.slice(0,300)}`);
      return parsed;
    };
    const plan = await run('plan');
    if (!plan.target || !plan.afterSha256 || !plan.preview) throw new Error('tiinex.agent-sync.invalid-core-plan');
    const preview = await vscode.workspace.openTextDocument({ language:'markdown', content:plan.preview });
    await vscode.window.showTextDocument(preview,{preview:true});
    if (plan.action === 'noop') {
      void vscode.window.showInformationMessage('Tiinex Role agent is already synchronized. No files changed.');
      return;
    }
    const answer = await vscode.window.showWarningMessage(
      `Tiinex will ${plan.action === 'create' ? 'create' : 'update'} ${plan.target} using the qualified Core plan. Existing custom frontmatter and non-generated notes are preserved.`,
      {modal:true}, 'Apply Role agent');
    if (answer !== 'Apply Role agent') return;
    const applied = await run('apply',plan.afterSha256);
    if (applied.afterSha256 !== plan.afterSha256 || (applied.applied !== true && applied.action !== 'noop'))
      throw new Error('tiinex.agent-sync.apply-receipt-mismatch');
    void vscode.window.showInformationMessage(applied.action === 'noop'
      ? `Tiinex Role agent already synchronized: ${plan.target}`
      : `Tiinex Role agent synchronized: ${plan.target}`);
  }));
}
