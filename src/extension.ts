import * as vscode from 'vscode';
import { generateCommitMessageCommand, stageCommitPushCommand, stageCommitPushManyCommand } from './commit';
import { registerTiinexDiagnostics } from './diagnostics';
import { TiinexOperatorTrees } from './operatorTrees';
import { manualRepositoryCommitCommand, registerGitAutomation } from './gitAutomation';
import { applyEmptyDirectoryCleanup, nestedWorkspaceRootExclusions, planEmptyDirectoryCleanup } from './core/emptyDirectoryCleanup';

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
  context.subscriptions.push(vscode.commands.registerCommand('tiinex.workspace.pruneEmptyDirectories', async () => {
    try {
      const folders = [...(vscode.workspace.workspaceFolders || [])];
      if (!folders.length) {
        await vscode.window.showInformationMessage('Tiinex found no open Workspace Folders to clean.');
        return;
      }
      const roots = folders.map((folder) => folder.uri.fsPath);
      const plans = [];
      for (const folder of folders) {
        const excludedSubtrees = nestedWorkspaceRootExclusions(folder.uri.fsPath, roots);
        const plan = await planEmptyDirectoryCleanup(folder.uri.fsPath, { excludedSubtrees });
        plans.push({ folder, plan });
      }
      const total = plans.reduce((sum, item) => sum + item.plan.directories.length, 0);
      if (!total) {
        await vscode.window.showInformationMessage(`Tiinex found no removable empty directories across ${folders.length} Workspace Folder${folders.length === 1 ? '' : 's'}.`);
        return;
      }
      const detail = plans
        .filter((item) => item.plan.directories.length)
        .map((item) => `${item.folder.name}: ${item.plan.directories.length}`)
        .join(' · ');
      const confirm = await vscode.window.showWarningMessage(
        `Tiinex found ${total} empty director${total === 1 ? 'y' : 'ies'} across ${folders.length} Workspace Folder${folders.length === 1 ? '' : 's'}.`,
        { modal: true, detail: `${detail}\n\nOnly already-empty directories are removed. Workspace roots, nested Workspace roots, version-control metadata, .topics, and .topics/.workspaces are preserved.` },
        'Prune Empty Directories'
      );
      if (confirm !== 'Prune Empty Directories') return;
      let removedTotal = 0;
      const summary: string[] = [];
      for (const item of plans) {
        const removed = await applyEmptyDirectoryCleanup(item.plan);
        removedTotal += removed.length;
        summary.push(`${item.folder.name}: ${removed.length}`);
      }
      await vscode.window.showInformationMessage(`Tiinex pruned ${removedTotal} empty director${removedTotal === 1 ? 'y' : 'ies'} · ${summary.join(' · ')}`);
    } catch (error) {
      await vscode.window.showErrorMessage(`Tiinex empty-directory cleanup failed: ${message(error)}`);
    }
  }));
  context.subscriptions.push(vscode.commands.registerCommand('tiinex.artifact.repair', async (resource?: vscode.Uri) => {
    try {
      if (!diagnostics) diagnostics = await registerTiinexDiagnostics(context, extensionPath);
      const uri = resource?.scheme === 'file' ? resource : vscode.window.activeTextEditor?.document.uri;
      if (!uri || uri.scheme !== 'file') throw new Error('tiinex.repair.file-resource-required');
      const document = await vscode.workspace.openTextDocument(uri);
      await vscode.window.showTextDocument(document, { preview: false });
      let repair = await diagnostics.repair(document);
      if (repair.state === 'selection-required') {
        const selected = await vscode.window.showQuickPick(repair.actions.map((item) => ({ label: item.title, description: item.id, id: item.id })), {
          title: 'Tiinex · Choose deterministic repair',
          placeHolder: 'Core exposed more than one qualified repair for these exact document bytes',
          canPickMany: false,
          ignoreFocusOut: true
        });
        if (!selected) return;
        repair = await diagnostics.repair(document, selected.id);
      }
      if (repair.state === 'applied') {
        const count = Number(repair.appliedCount || 1);
        await vscode.window.showInformationMessage(count > 1
          ? `Tiinex deterministic repair applied to ${count} lineage documents.`
          : 'Tiinex deterministic repair applied to the current document.');
        return;
      }
      if (repair.state === 'stale') {
        await vscode.window.showWarningMessage('Tiinex repair became stale because the document bytes changed after Core qualification. Run Repair again on the current bytes.');
        return;
      }
      if (repair.state === 'failed') throw new Error('tiinex.repair.workspace-edit-not-applied');
      const snapshot = repair.snapshot;
      const choice = await vscode.window.showWarningMessage(
        snapshot?.state === 'clean'
          ? 'Tiinex Core reports this artifact as clean; no repair is needed.'
          : 'Tiinex Core has no deterministic repair for the current artifact bytes. Historical/reference debt is not rewritten by the VS Code host.',
        'Show Problems'
      );
      if (choice === 'Show Problems') await vscode.commands.executeCommand('workbench.actions.view.problems');
    } catch (error) {
      await vscode.window.showErrorMessage(`Tiinex artifact repair blocked: ${message(error)}`);
    }
  }));

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

  context.subscriptions.push(vscode.commands.registerCommand('tiinex.git.commitRepository', async (scmContext?: unknown) => {
    try { await manualRepositoryCommitCommand(extensionPath, scmContext); } catch (error) { await vscode.window.showErrorMessage(`Tiinex Commit failed: ${message(error)}`, { modal: true }); }
  }));

  context.subscriptions.push(vscode.commands.registerCommand('tiinex.generateCommitMessage', async () => {
    try { await generateCommitMessageCommand(extensionPath); } catch (error) { await vscode.window.showErrorMessage(`Tiinex commit-message generation failed: ${message(error)}`); }
  }));
  context.subscriptions.push(vscode.commands.registerCommand('tiinex.stageCommitPush', async () => {
    try { await stageCommitPushCommand(extensionPath); } catch (error) { await vscode.window.showErrorMessage(`Tiinex Stage, Commit & Push failed: ${message(error)}`, { modal: true }); }
  }));
  context.subscriptions.push(vscode.commands.registerCommand('tiinex.stageCommitPushMany', async () => {
    try { await stageCommitPushManyCommand(extensionPath); } catch (error) { await vscode.window.showErrorMessage(`Tiinex multi-repository Git flow failed: ${message(error)}`, { modal: true }); }
  }));

  try {
    await registerGitAutomation(context, extensionPath);
    diagnostics = await registerTiinexDiagnostics(context, extensionPath);
    await trees.start();
  } catch (error) {
    await vscode.window.showErrorMessage(`Tiinex activation degraded: ${message(error)}`);
  }
}

export function deactivate(): void { /* disposables are owned by VS Code */ }
