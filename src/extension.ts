import * as vscode from 'vscode';
import { generateCommitMessageCommand, stageCommitPushCommand } from './commit';
import { registerTiinexDiagnostics } from './diagnostics';
import { TiinexOperatorTrees } from './operatorTrees';

function message(error: unknown): string { return error instanceof Error ? error.message : String(error); }

export async function activate(context: vscode.ExtensionContext): Promise<void> {
  const extensionPath = String((context as any).extensionPath || '');
  const trees = new TiinexOperatorTrees(context, extensionPath);
  context.subscriptions.push(trees);
  let diagnostics: Awaited<ReturnType<typeof registerTiinexDiagnostics>> | null = null;

  context.subscriptions.push(vscode.commands.registerCommand('tiinex.openOperator', async () => {
    try { await trees.focus('discovery'); } catch (error) { await vscode.window.showErrorMessage(`Tiinex operator failed: ${message(error)}`); }
  }));
  context.subscriptions.push(vscode.commands.registerCommand('tiinex.refreshDiagnostics', async () => {
    try {
      if (!diagnostics) diagnostics = await registerTiinexDiagnostics(context, extensionPath);
      await diagnostics.refreshActive();
    } catch (error) { await vscode.window.showErrorMessage(`Tiinex validation failed: ${message(error)}`); }
  }));
  context.subscriptions.push(vscode.commands.registerCommand('tiinex.showProblems', async () => vscode.commands.executeCommand('workbench.actions.view.problems')));

  // Compatibility commands now route into the native tree model rather than the retired webview workflow.
  context.subscriptions.push(vscode.commands.registerCommand('tiinex.landHandoffPackage', async () => {
    const selected = await vscode.window.showOpenDialog({ canSelectFiles: true, canSelectFolders: false, canSelectMany: false, title: 'Select Incoming Tiinex Handoff Package', filters: { 'Handoff package ZIP': ['zip'] } });
    if (!selected?.length) return;
    await trees.openIncoming(selected[0].fsPath);
    await trees.focus('incoming');
  }));
  context.subscriptions.push(vscode.commands.registerCommand('tiinex.createHandoff', async () => {
    try { await trees.beginHandoffAuthoring(); }
    catch (error) { await vscode.window.showErrorMessage(`Tiinex Handoff authoring failed: ${message(error)}`); }
  }));
  context.subscriptions.push(vscode.commands.registerCommand('tiinex.buildHandoffPackage', async () => vscode.commands.executeCommand('tiinex.outgoing.package')));
  context.subscriptions.push(vscode.commands.registerCommand('tiinex.createHandoffFromArtifact', async () => {
    await trees.focus('outgoing');
    await vscode.window.showInformationMessage('Handoff authoring now lives on Outgoing Workspace + actions so behavior stays identical across tree projections.');
  }));

  context.subscriptions.push(vscode.commands.registerCommand('tiinex.generateCommitMessage', async () => {
    try { await generateCommitMessageCommand(extensionPath); } catch (error) { await vscode.window.showErrorMessage(`Tiinex commit-message generation failed: ${message(error)}`); }
  }));
  context.subscriptions.push(vscode.commands.registerCommand('tiinex.stageCommitPush', async () => {
    try { await stageCommitPushCommand(extensionPath); } catch (error) { await vscode.window.showErrorMessage(`Tiinex Stage, Commit & Push failed: ${message(error)}`, { modal: true }); }
  }));

  try {
    diagnostics = await registerTiinexDiagnostics(context, extensionPath);
    await trees.start();
  } catch (error) {
    await vscode.window.showErrorMessage(`Tiinex activation degraded: ${message(error)}`);
  }
}

export function deactivate(): void { /* disposables are owned by VS Code */ }
