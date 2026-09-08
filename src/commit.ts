import * as vscode from 'vscode';
import { generateTiinexCommitMessage, listStagedPaths, stageCommitPush } from './host/git';
import { prepareBundledRuntime, projectStagedValidation } from './tiinex/bootstrap';
import { selectRepositoryRoot, setRepositoryInput } from './vscode/gitApi';
import { presentActionableFindings } from './core/findingPresentation';

function nodeExecutable(): string {
  return vscode.workspace.getConfiguration('tiinex').get('nodePath', '').toString().trim() || process.execPath;
}

function stagedBlocker(result: any): string {
  return presentActionableFindings(result.findings || [], `${result.status || 'unknown'}/${result.state || 'unknown'}`);
}

async function validateStaged(extensionPath: string, root: string, stagedPaths: string[]): Promise<void> {
  const runtime = await prepareBundledRuntime(extensionPath, nodeExecutable());
  try {
    const result = await projectStagedValidation(runtime, root, stagedPaths);
    if (result.status !== 'ready' || result.state === 'blocked' || result.blockingFindingCount > 0) {
      throw new Error(`tiinex.staged-validation.blocked:\n${stagedBlocker(result)}`);
    }
  } finally { await runtime.dispose(); }
}

export async function generateCommitMessageCommand(extensionPath: string): Promise<void> {
  const root = await selectRepositoryRoot('Select the Git repository whose staged Tiinex artifacts should drive the commit message');
  const stagedPaths = await listStagedPaths(root);
  await validateStaged(extensionPath, root, stagedPaths);
  const commitMessage = await generateTiinexCommitMessage(root, nodeExecutable());
  await setRepositoryInput(root, commitMessage);
  await vscode.window.showInformationMessage(`Tiinex commit message generated for ${root}. Review it in Source Control before committing.`);
}

export async function stageCommitPushCommand(extensionPath: string): Promise<void> {
  const root = await selectRepositoryRoot('Select the Git repository to stage, commit and push');
  const approved = await vscode.window.showWarningMessage(`Stage all changes, validate the staged Tiinex closure, derive the commit message from staged artifacts, commit, and push the configured upstream for ${root}?`, { modal: true }, 'Stage, Commit & Push');
  if (approved !== 'Stage, Commit & Push') return;
  const result = await stageCommitPush(root, nodeExecutable(), undefined, (stagedPaths) => validateStaged(extensionPath, root, stagedPaths));
  await vscode.window.showInformationMessage(`Tiinex pushed ${result.branch} to ${result.upstream}.`);
}
