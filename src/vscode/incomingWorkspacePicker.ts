import * as vscode from 'vscode';

export interface IncomingWorkspacePickChoice {
  workspaceId: string;
  label: string;
  description: string;
  detail: string;
}

/** Open the picker immediately; exact-byte comparison supplies defaults later.
 *  Core still validates every chosen Workspace at apply time. */
export function pickIncomingWorkspaces(
  choices: IncomingWorkspacePickChoice[],
  projectExactMatches: () => Promise<ReadonlySet<string>>,
  title: string
): Promise<string[] | null> {
  type Item = vscode.QuickPickItem & { workspaceId: string };
  const picker = vscode.window.createQuickPick<Item>();
  picker.title = title;
  picker.canSelectMany = true;
  picker.ignoreFocusOut = true;
  picker.busy = true;
  picker.placeholder = 'Checking exact Workspace matches… Select now, or wait for recommended defaults.';
  const items = choices.map((item): Item => ({ ...item }));
  picker.items = items;
  let internalSelection = true;
  picker.selectedItems = items;
  internalSelection = false;
  let userEdited = false;
  let settled = false;
  const subscriptions: vscode.Disposable[] = [];
  const finish = (value: string[] | null, resolve: (value: string[] | null) => void) => {
    if (settled) return;
    settled = true;
    for (const subscription of subscriptions) subscription.dispose();
    picker.dispose();
    resolve(value);
  };
  return new Promise((resolve) => {
    subscriptions.push(picker.onDidChangeSelection(() => { if (!internalSelection) userEdited = true; }));
    subscriptions.push(picker.onDidAccept(() => finish(picker.selectedItems.map((item) => item.workspaceId), resolve)));
    subscriptions.push(picker.onDidHide(() => finish(null, resolve)));
    picker.show(); // Do not await Core comparison before making the picker interactive.
    void projectExactMatches().then((exact) => {
      if (settled) return;
      picker.busy = false;
      picker.placeholder = 'Qualified exact matches are not preselected. Review choices before proceeding.';
      if (!userEdited) {
        internalSelection = true;
        try { picker.selectedItems = items.filter((item) => !exact.has(item.workspaceId)); }
        finally { internalSelection = false; }
      }
    }).catch(() => {
      if (settled) return;
      picker.busy = false;
      picker.placeholder = 'Exact comparison unavailable. Review selections; Core will validate before applying.';
    });
  });
}
