import * as vscode from 'vscode';
import { qualifyCopilotPanelAction, PanelDelegationDecision } from '../core/copilotPanelAccess';

/** Use only in the future VS Code languageModelTools adapter. A caller cannot
 * supply isHuman or permission level; read the real host setting each time. */
export function qualifyCurrentCopilotPanelAction(action: string): PanelDelegationDecision {
  const level = vscode.workspace.getConfiguration('tiinex').get<string>('copilot.panelActions', 'none');
  return qualifyCopilotPanelAction(action, level);
}
