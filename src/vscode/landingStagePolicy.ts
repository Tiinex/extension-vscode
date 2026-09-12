import * as vscode from 'vscode';

export type LandingStagePolicy = 'no' | 'yes';

/** Shared VS Code host projection of the documented landing-stage setting. */
export function landingStagePolicy(): LandingStagePolicy {
  return vscode.workspace.getConfiguration('tiinex.landing').get('stage', 'yes').toString() === 'no' ? 'no' : 'yes';
}
