import * as vscode from 'vscode';
import { preferredNodeExecutable } from './host/nodeExecutable';
import {
  discardWorkingTree,
  generateTiinexCommitMessage,
  listStagedPaths,
  repositoryFact,
  stageAllChanges
} from './host/git';
import { prepareBundledRuntime, projectStagedValidation } from './tiinex/bootstrap';
import { repositoryRoots, selectRepositoryRoot, setRepositoryInput } from './vscode/gitApi';
import { presentActionableFindings } from './core/findingPresentation';

function errorText(error: unknown): string { return error instanceof Error ? error.message : String(error); }

function nodeExecutable(): string {
  return preferredNodeExecutable(vscode.workspace.getConfiguration('tiinex').get('nodePath', '').toString().trim());
}

function stagedBlocker(result: any): string {
  return presentActionableFindings(result.findings || [], `${result.status || 'unknown'}/${result.state || 'unknown'}`);
}

async function validateStagedWithRuntime(runtime: Awaited<ReturnType<typeof prepareBundledRuntime>>, root: string, stagedPaths: string[]): Promise<any> {
  const result = await projectStagedValidation(runtime, root, stagedPaths);
  if (result.status !== 'ready' || result.state === 'blocked' || result.blockingFindingCount > 0) {
    throw new Error(`tiinex.staged-validation.blocked:\n${stagedBlocker(result)}`);
  }
  return result;
}

async function validateStaged(extensionPath: string, root: string, stagedPaths: string[]): Promise<void> {
  const runtime = await prepareBundledRuntime(extensionPath, nodeExecutable());
  try { await validateStagedWithRuntime(runtime, root, stagedPaths); }
  finally { await runtime.dispose(); }
}

export async function generateCommitMessageCommand(extensionPath: string): Promise<void> {
  const root = await selectRepositoryRoot('Select the Git repository whose staged Tiinex artifacts should drive the commit message');
  const stagedPaths = await listStagedPaths(root);
  await validateStaged(extensionPath, root, stagedPaths);
  const commitMessage = await generateTiinexCommitMessage(root, nodeExecutable());
  await setRepositoryInput(root, commitMessage);
  await vscode.window.showInformationMessage(`Tiinex commit message generated for ${root}. Review it in Source Control before committing.`);
}


export async function stageAllWorkspacesCommand(): Promise<void> {
  const roots = await repositoryRoots();
  if (!roots.length) throw new Error('tiinex.vscode.no-git-repositories');
  const failures: Array<{ root: string; error: string }> = [];
  for (const root of roots) {
    try { await stageAllChanges(root); }
    catch (error) { failures.push({ root, error: errorText(error) }); }
  }
  if (failures.length) {
    const details = failures.map((item) => `${item.root}: ${item.error}`).join('\n');
    throw new Error(`tiinex.git.stage-all-workspaces.partial-failure:${failures.length}/${roots.length}\n${details}`);
  }
  await vscode.window.showInformationMessage(`Tiinex staged all changes in ${roots.length} Git workspace${roots.length === 1 ? '' : 's'}.`);
}

export async function resetAllDirtyWorkspacesCommand(): Promise<void> {
  const roots = await repositoryRoots();
  if (!roots.length) throw new Error('tiinex.vscode.no-git-repositories');
  const dirtyRoots: string[] = [];
  const inspectionFailures: Array<{ root: string; error: string }> = [];
  for (const root of roots) {
    try { if (!(await repositoryFact(root)).clean) dirtyRoots.push(root); }
    catch (error) { inspectionFailures.push({ root, error: errorText(error) }); }
  }
  if (inspectionFailures.length) {
    const details = inspectionFailures.map((item) => `${item.root}: ${item.error}`).join('\n');
    throw new Error(`tiinex.git.reset-dirty-workspaces.inspect-failed:${inspectionFailures.length}/${roots.length}\n${details}`);
  }
  if (!dirtyRoots.length) {
    await vscode.window.showInformationMessage(`Tiinex found no dirty Git workspaces across ${roots.length} repositor${roots.length === 1 ? 'y' : 'ies'}.`);
    return;
  }
  const resetConfirmed = await new Promise<boolean>((resolve) => {
    const picker = vscode.window.createQuickPick<vscode.QuickPickItem & { confirmed: boolean }>();
    const no = { label: 'No', description: 'Keep all local changes.', confirmed: false };
    const yes = { label: 'Yes', description: `Discard local changes in ${dirtyRoots.length} dirty Git workspace${dirtyRoots.length === 1 ? '' : 's'} and restore HEAD.`, confirmed: true };
    picker.title = 'Tiinex: Reset All Dirty Workspaces';
    picker.placeholder = 'No is selected by default. Choose Yes only to discard local Git work.';
    picker.canSelectMany = false;
    picker.ignoreFocusOut = true;
    picker.items = [no, yes];
    picker.activeItems = [no];
    let completed = false;
    picker.onDidAccept(() => {
      if (completed) return;
      completed = true;
      resolve(Boolean(picker.activeItems[0]?.confirmed));
      picker.hide();
    });
    picker.onDidHide(() => {
      picker.dispose();
      if (!completed) { completed = true; resolve(false); }
    });
    picker.show();
  });
  if (!resetConfirmed) return;
  const failures: Array<{ root: string; error: string }> = [];
  for (const root of dirtyRoots) {
    try { await discardWorkingTree(root); }
    catch (error) { failures.push({ root, error: errorText(error) }); }
  }
  if (failures.length) {
    const details = failures.map((item) => `${item.root}: ${item.error}`).join('\n');
    throw new Error(`tiinex.git.reset-dirty-workspaces.partial-failure:${failures.length}/${dirtyRoots.length}\n${details}`);
  }
  await vscode.window.showInformationMessage(`Tiinex reset ${dirtyRoots.length} dirty Git workspace${dirtyRoots.length === 1 ? '' : 's'} to the latest committed state.`);
}


