import * as vscode from 'vscode';
import { generateCommitMessageCommand, stageCommitPushCommand } from './commit';
import { HandoffInboxWatcher, selectHandoffInbox } from './inbox';
import { landHandoffPackage, LandingResult } from './landing';
import { registerTiinexDiagnostics } from './diagnostics';
import { TiinexOperatorView } from './operatorView';
import { registerLinkedDevReload } from './devReload';

const inFlight = new Set<string>();

function message(error: unknown): string { return error instanceof Error ? error.message : String(error); }

async function executeLanding(packagePath: string, extensionPath: string): Promise<LandingResult | null> {
  if (inFlight.has(packagePath)) return null;
  inFlight.add(packagePath);
  try {
    return await vscode.window.withProgress({ location: vscode.ProgressLocation.Notification, title: 'Tiinex qualifying Handoff package and preparing Receive', cancellable: false }, () => landHandoffPackage(packagePath, extensionPath));
  } finally {
    inFlight.delete(packagePath);
  }
}

async function runManualLanding(packagePath: string, extensionPath: string, onReceived: (result: LandingResult) => Promise<void>): Promise<void> {
  try { const result = await executeLanding(packagePath, extensionPath); if (result) await onReceived(result); }
  catch (error) { await vscode.window.showErrorMessage(`Tiinex Receive failed: ${message(error)}`, { modal: true }); }
}

export async function activate(context: vscode.ExtensionContext): Promise<void> {
  const extensionPath = String((context as any).extensionPath || '');
  registerLinkedDevReload(context, extensionPath);
  let acceptReceived: (result: LandingResult) => Promise<void> = async () => undefined;
  const inbox = new HandoffInboxWatcher(async (packagePath: string) => { const result = await executeLanding(packagePath, extensionPath); if (result) await acceptReceived(result); });
  context.subscriptions.push(inbox);

  const diagnostics = await registerTiinexDiagnostics(context, extensionPath);
  const operator = new TiinexOperatorView(extensionPath, diagnostics, inbox);
  acceptReceived = async (result: LandingResult) => { if (result.received) await operator.acceptReceivedHandoff(result.received); };
  context.subscriptions.push(operator);
  context.subscriptions.push(vscode.window.registerWebviewViewProvider('tiinex.operator', operator, { webviewOptions: { retainContextWhenHidden: true } }));

  context.subscriptions.push(vscode.commands.registerCommand('tiinex.openOperator', async () => {
    try { await operator.show('diagnostics'); } catch (error) { await vscode.window.showErrorMessage(`Tiinex operator failed: ${message(error)}`); }
  }));
  context.subscriptions.push(vscode.commands.registerCommand('tiinex.refreshDiagnostics', async () => {
    try { await diagnostics.refreshActive(); } catch (error) { await vscode.window.showErrorMessage(`Tiinex validation failed: ${message(error)}`); }
  }));
  context.subscriptions.push(vscode.commands.registerCommand('tiinex.showProblems', async () => vscode.commands.executeCommand('workbench.actions.view.problems')));
  context.subscriptions.push(vscode.commands.registerCommand('tiinex.createHandoffFromArtifact', async (resource?: vscode.Uri) => {
    try {
      const target = resource?.scheme === 'file' ? resource : vscode.window.activeTextEditor?.document.uri;
      if (!target) throw new Error('tiinex.authoring.no-selected-artifact');
      await operator.showAuthoring(target);
    } catch (error) { await vscode.window.showErrorMessage(`Tiinex artifact transition blocked: ${message(error)}`, { modal: true }); }
  }));
  context.subscriptions.push(vscode.commands.registerCommand('tiinex.createHandoff', async () => {
    try { await operator.showAuthoring(); } catch (error) { await vscode.window.showErrorMessage(`Tiinex Handoff authoring failed: ${message(error)}`, { modal: true }); }
  }));
  context.subscriptions.push(vscode.commands.registerCommand('tiinex.buildHandoffPackage', async () => {
    try { await operator.showPackage(); } catch (error) { await vscode.window.showErrorMessage(`Tiinex package builder failed: ${message(error)}`, { modal: true }); }
  }));
  context.subscriptions.push(vscode.commands.registerCommand('tiinex.landHandoffPackage', async () => {
    const selected = await vscode.window.showOpenDialog({ canSelectFiles: true, canSelectFolders: false, canSelectMany: false, title: 'Select Tiinex Handoff Package', filters: { 'Handoff package ZIP': ['zip'] } });
    if (!selected?.length) return;
    await runManualLanding(selected[0].fsPath, extensionPath, acceptReceived);
  }));
  context.subscriptions.push(vscode.commands.registerCommand('tiinex.generateCommitMessage', async () => {
    try { await generateCommitMessageCommand(extensionPath); } catch (error) { await vscode.window.showErrorMessage(`Tiinex commit-message generation failed: ${message(error)}`); }
  }));
  context.subscriptions.push(vscode.commands.registerCommand('tiinex.stageCommitPush', async () => {
    try { await stageCommitPushCommand(extensionPath); } catch (error) { await vscode.window.showErrorMessage(`Tiinex Stage, Commit & Push failed: ${message(error)}`, { modal: true }); }
  }));
  context.subscriptions.push(vscode.commands.registerCommand('tiinex.selectHandoffInbox', async () => {
    try { await selectHandoffInbox(); await inbox.restart(); } catch (error) { await vscode.window.showErrorMessage(`Tiinex inbox selection failed: ${message(error)}`); }
  }));
  context.subscriptions.push(vscode.workspace.onDidChangeConfiguration((event: { affectsConfiguration(value: string): boolean }) => {
    if (event.affectsConfiguration('tiinex.handoffInbox') || event.affectsConfiguration('tiinex.handoff.discovery')) void inbox.restart().catch((error) => vscode.window.showErrorMessage(`Tiinex inbox watcher failed: ${message(error)}`));
  }));
  await inbox.restart();
}

export function deactivate(): void { /* disposables are owned by VS Code */ }
