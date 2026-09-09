import * as fs from 'node:fs';
import * as path from 'node:path';
import * as vscode from 'vscode';

function readReloadToken(file: string): string {
  try {
    const parsed = JSON.parse(fs.readFileSync(file, 'utf8')) as { generation?: unknown };
    return typeof parsed.generation === 'string' ? parsed.generation : '';
  } catch {
    return '';
  }
}

export function registerLinkedDevReload(context: vscode.ExtensionContext, extensionPath: string): void {
  const markerDir = path.join(extensionPath, '.tiinex-dev');
  const linkedMarker = path.join(markerDir, 'linked.json');
  const reloadMarker = path.join(markerDir, 'reload.json');
  if (!extensionPath || !fs.existsSync(linkedMarker)) return;

  let lastToken = readReloadToken(reloadMarker);
  let timer: NodeJS.Timeout | undefined;
  let prompting = false;

  const check = async (): Promise<void> => {
    const token = readReloadToken(reloadMarker);
    if (!token || token === lastToken || prompting) return;
    lastToken = token;
    prompting = true;
    try {
      const action = await vscode.window.showInformationMessage('Tiinex rebuilt from the linked checkout. Restart extensions to load the new build?', 'Restart Extensions');
      if (action === 'Restart Extensions') await vscode.commands.executeCommand('workbench.action.restartExtensionHost');
    } finally {
      prompting = false;
      const newest = readReloadToken(reloadMarker);
      if (newest && newest !== lastToken) void check();
    }
  };

  let watcher: fs.FSWatcher;
  try {
    watcher = fs.watch(markerDir, () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => void check(), 80);
    });
  } catch {
    return;
  }

  context.subscriptions.push({
    dispose: () => {
      if (timer) clearTimeout(timer);
      watcher.close();
    }
  });
}
