import * as vscode from 'vscode';
import { repositoryContainsPath, sameRepositoryRoot } from '../core/repositoryPath';

interface GitRepository { rootUri: vscode.Uri; inputBox: { value: string } }
interface GitApi { repositories: GitRepository[] }

export async function getGitApi(): Promise<GitApi> {
  const extension = vscode.extensions.getExtension('vscode.git');
  if (!extension) throw new Error('tiinex.vscode.git-extension-unavailable');
  const exportsValue = extension.isActive ? extension.exports : await extension.activate();
  const api = exportsValue?.getAPI?.(1) as GitApi | undefined;
  if (!api || !Array.isArray(api.repositories)) throw new Error('tiinex.vscode.git-api-unavailable');
  return api;
}

export async function repositoryRoots(): Promise<string[]> {
  const api = await getGitApi();
  const roots: string[] = [];
  for (const repo of api.repositories) {
    const root = repo.rootUri?.fsPath;
    if (!root || roots.some((existing) => sameRepositoryRoot(existing, root))) continue;
    roots.push(root);
  }
  return roots;
}


export interface WorkspaceFolderAdditionResult { added: boolean; workspaceFile: string; savedWorkspace: boolean }

export async function addRepositoryToCurrentWorkspace(root: string): Promise<WorkspaceFolderAdditionResult> {
  const resolved = vscode.Uri.file(root);
  const existing = vscode.workspace.workspaceFolders || [];
  if (existing.some((folder: vscode.WorkspaceFolder) => sameRepositoryRoot(folder.uri.fsPath, resolved.fsPath))) {
    const workspaceFile = vscode.workspace.workspaceFile?.scheme === 'file' ? vscode.workspace.workspaceFile.fsPath : '';
    return { added: false, workspaceFile, savedWorkspace: Boolean(workspaceFile) };
  }
  const applied = vscode.workspace.updateWorkspaceFolders(existing.length, 0, { uri: resolved });
  if (!applied) throw new Error('tiinex.vscode.workspace-folder-add-rejected');
  const workspaceFile = vscode.workspace.workspaceFile?.scheme === 'file' ? vscode.workspace.workspaceFile.fsPath : '';
  return { added: true, workspaceFile, savedWorkspace: Boolean(workspaceFile) };
}

export async function repositoryRootForResource(resourcePath: string): Promise<string> {
  const roots = await repositoryRoots();
  const matches = roots.filter((root) => repositoryContainsPath(root, resourcePath));
  if (matches.length !== 1) throw new Error(matches.length ? 'tiinex.vscode.resource-repository-ambiguous' : 'tiinex.vscode.resource-repository-unresolved');
  return matches[0];
}

export async function selectRepositoryRoot(placeHolder: string): Promise<string> {
  const roots = await repositoryRoots();
  if (!roots.length) throw new Error('tiinex.vscode.no-git-repositories');
  if (roots.length === 1) return roots[0];
  const items = roots.map((root) => ({ label: root, root }));
  const selected = await vscode.window.showQuickPick(items, { placeHolder, canPickMany: false, ignoreFocusOut: true });
  if (!selected) throw new Error('tiinex.vscode.repository-selection-cancelled');
  return selected.root;
}

export async function setRepositoryInput(root: string, message: string): Promise<void> {
  const api = await getGitApi();
  const matches = api.repositories.filter((repo) => sameRepositoryRoot(repo.rootUri.fsPath, root));
  if (matches.length !== 1) throw new Error('tiinex.vscode.repository-input-ambiguous');
  matches[0].inputBox.value = message;
}
