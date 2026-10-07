import * as vscode from 'vscode';
import { loadLocalWorkspaceChoices, loadOperatorPartySurfaceForSources, OperatorPartyScopeProjection } from './packageBuilder';
import { groupPartyReferenceCandidates } from './vscode/partyReferencePresentation';
import { HandoffEndpointAuthoringCandidate } from './core/handoffEndpointSelection';

export type OperatorPartyState = 'none' | 'unknown' | 'resolved' | 'unresolved';

export interface ResolvedOperatorParty {
  state: OperatorPartyState;
  setting: string;
  displayName: string;
  kind: 'role' | 'party' | 'unknown';
  target: string;
  workspaceId: string;
  artifactPath: string;
  schemaId: string;
  recipientLabels: string[];
  recipientTargets: string[];
  scope?: OperatorPartyScopeProjection;
  candidate?: HandoffEndpointAuthoringCandidate;
}

export function operatorPartySetting(): string {
  const configuration = vscode.workspace.getConfiguration('tiinex');
  const inspected = configuration.inspect<string>('operator.party');
  // Operator Party is a user profile preference. Ignore any stale Workspace
  // override left by older builds; Pick Operator Party clears it on next use.
  return String(inspected?.globalValue || '').trim();
}

export function parseManualOperatorParty(value: string): { manual: boolean; displayName: string } {
  const raw = String(value || '').trim();
  if (!raw.toLocaleLowerCase().startsWith('unknown::')) return { manual: false, displayName: '' };
  return { manual: true, displayName: raw.slice('unknown::'.length).trim() };
}

export async function resolveOperatorParty(extensionPath: string, setting = operatorPartySetting()): Promise<ResolvedOperatorParty> {
  const raw = String(setting || '').trim();
  if (!raw) return empty('none', raw);
  const manual = parseManualOperatorParty(raw);
  if (manual.manual) {
    if (!manual.displayName) return empty('unresolved', raw);
    return { ...empty('unknown', raw), displayName: manual.displayName, recipientLabels: [manual.displayName] };
  }
  const choices = await loadLocalWorkspaceChoices(extensionPath);
  const surface = await loadOperatorPartySurfaceForSources(extensionPath, choices.map((item) => ({ workspaceId: item.workspaceId, root: item.root })));
  const candidate = surface.candidates.find((item) => String(item.target || '').trim() === raw);
  if (!candidate) return empty('unresolved', raw);
  const scope = surface.scopes.find((item) => String(item.target || '').trim() === raw);
  const displayName = String(candidate.authoringLabel || candidate.label || '').trim();
  return {
    state: 'resolved', setting: raw, displayName,
    kind: candidate.kind, target: raw, workspaceId: candidate.workspaceId, artifactPath: candidate.artifactPath, schemaId: candidate.schemaId,
    recipientLabels: scope?.recipientLabels?.length ? scope.recipientLabels : [displayName].filter(Boolean),
    recipientTargets: scope?.recipientTargets?.length ? scope.recipientTargets : [raw],
    scope, candidate
  };
}

export async function pickOperatorParty(extensionPath: string): Promise<ResolvedOperatorParty | null> {
  const choices = await loadLocalWorkspaceChoices(extensionPath);
  const surface = await loadOperatorPartySurfaceForSources(extensionPath, choices.map((item) => ({ workspaceId: item.workspaceId, root: item.root })));
  const current = operatorPartySetting();
  type Item = vscode.QuickPickItem & { action: 'none' | 'manual' | 'candidate' | 'separator'; candidate?: HandoffEndpointAuthoringCandidate };
  const items: Item[] = [
    { label: 'None', description: 'Disable Operator Party defaults and Incoming recipient auto-preview.', action: 'none' },
    { label: 'Manual / Unknown…', description: 'Use a named unknown Party without a Reference or inferred scope.', action: 'manual' }
  ];
  for (const group of groupPartyReferenceCandidates(surface.candidates, choices)) {
    items.push({ label: group.label, kind: vscode.QuickPickItemKind.Separator, action: 'separator' });
    for (const presented of group.items) items.push({
      label: presented.label,
      description: presented.description,
      detail: String(presented.candidate.target || '') === current ? 'Current Operator Party' : undefined,
      action: 'candidate', candidate: presented.candidate
    });
  }
  const selected = await vscode.window.showQuickPick(items, {
    title: 'Pick Operator Party',
    placeHolder: 'Choose None, a named unknown Party, or one Core-discovered current Party / Role.',
    ignoreFocusOut: true
  });
  if (!selected || selected.action === 'separator') return null;
  let value = '';
  if (selected.action === 'manual') {
    const name = await vscode.window.showInputBox({ title: 'Operator Party display name', prompt: 'Named unknown only. No Party/Role authority or organization scope is inferred.', ignoreFocusOut: true });
    if (!name?.trim()) return null;
    value = `unknown::${name.trim()}`;
  } else if (selected.action === 'candidate') value = String(selected.candidate?.target || '').trim();
  const configuration = vscode.workspace.getConfiguration('tiinex');
  // Operator Party is a user/operator preference, not Workspace material. Clear
  // any legacy Workspace override first so VS Code precedence cannot shadow the
  // newly selected global value after this command returns.
  await configuration.update('operator.party', undefined, vscode.ConfigurationTarget.Workspace);
  await configuration.update('operator.party', value, vscode.ConfigurationTarget.Global);
  return resolveOperatorParty(extensionPath, value);
}

function empty(state: OperatorPartyState, setting: string): ResolvedOperatorParty {
  return { state, setting, displayName: '', kind: 'unknown', target: '', workspaceId: '', artifactPath: '', schemaId: '', recipientLabels: [], recipientTargets: [] };
}
