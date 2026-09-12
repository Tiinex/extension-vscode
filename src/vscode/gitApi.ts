import * as vscode from 'vscode';
import { repositoryContainsPath, sameRepositoryRoot } from '../core/repositoryPath';

export interface GitRepositoryState {
  readonly onDidChange?: vscode.Event<void>;
  readonly mergeChanges?: readonly unknown[];
  readonly indexChanges?: readonly unknown[];
  readonly workingTreeChanges?: readonly unknown[];
  readonly untrackedChanges?: readonly unknown[];
}

export interface GitRepository {
  rootUri: vscode.Uri;
  inputBox: { value: string };
  state?: GitRepositoryState;
}

export interface GitApi {
  repositories: GitRepository[];
  onDidOpenRepository?: vscode.Event<GitRepository>;
  onDidCloseRepository?: vscode.Event<GitRepository>;
}

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

export function scmContextRepositoryRoot(value: unknown): string {
  const candidate = value as any;
  for (const root of [
    candidate?.rootUri?.fsPath,
    candidate?.sourceControl?.rootUri?.fsPath,
    candidate?.repository?.rootUri?.fsPath,
    candidate?.resourceUri?.fsPath,
    candidate?.uri?.fsPath
  ]) {
    const text = String(root || '').trim();
    if (text) return text;
  }
  return '';
}

export async function repositoryRootFromScmContext(value: unknown, placeHolder: string): Promise<string> {
  const hinted = scmContextRepositoryRoot(value);
  if (hinted) {
    const roots = await repositoryRoots();
    const matches = roots.filter((root) => sameRepositoryRoot(root, hinted));
    if (matches.length === 1) return matches[0];
  }
  return selectRepositoryRoot(placeHolder);
}

/**
 * Observe VS Code's built-in Git repository status events without owning SCM
 * state. The returned disposable tracks repositories opened/closed after
 * activation as well as repositories already visible at registration time.
 */
export async function watchGitRepositoryStates(listener: (repository: GitRepository) => void): Promise<vscode.Disposable> {
  const api = await getGitApi();
  const repositorySubscriptions = new Map<GitRepository, vscode.Disposable>();
  const bind = (repository: GitRepository): void => {
    if (repositorySubscriptions.has(repository) || !repository.state?.onDidChange) return;
    repositorySubscriptions.set(repository, repository.state.onDidChange(() => listener(repository)));
  };
  const unbind = (repository: GitRepository): void => {
    repositorySubscriptions.get(repository)?.dispose();
    repositorySubscriptions.delete(repository);
  };
  for (const repository of api.repositories) bind(repository);
  const opened = api.onDidOpenRepository?.((repository) => bind(repository));
  const closed = api.onDidCloseRepository?.((repository) => unbind(repository));
  return new vscode.Disposable(() => {
    opened?.dispose();
    closed?.dispose();
    for (const disposable of repositorySubscriptions.values()) disposable.dispose();
    repositorySubscriptions.clear();
  });
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
