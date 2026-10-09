import * as vscode from 'vscode';
import { loadQualifiedLocalWorkspaceChoices, loadOperatorPartySurfaceForSources, OperatorPartyScopeProjection, OperatorPartySurface, PackageWorkspaceChoice } from './packageBuilder';
import { groupPartyReferenceCandidates } from './vscode/partyReferencePresentation';
import { HandoffEndpointAuthoringCandidate } from './core/handoffEndpointSelection';
import { scopedOperatorPartySources } from './core/operatorPartySourceScope';
import { orderedBoundedMap } from './core/orderedBoundedMap';

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

// Core's operator-context projection is scoped to its supplied Workspace roots.
// Project the already-qualified host sources separately, rather than treating
// unrelated VS Code folders as one ambiguous package-local namespace.
async function qualifiedOperatorPartySurface(extensionPath: string, choices: PackageWorkspaceChoice[]): Promise<OperatorPartySurface> {
  const started = Date.now();
  // Independent Core projections must NOT be merged into one operator context.
  // Three concurrent projections reduce host picker latency without starting
  // one expensive qualification process per open Workspace simultaneously.
  const surfaces = await orderedBoundedMap(choices, 3, (choice) =>
    loadOperatorPartySurfaceForSources(extensionPath, [{ workspaceId: choice.workspaceId, root: choice.root }]));
  console.info(`Tiinex Operator Party qualification: ${choices.length} independent Workspace roots in ${Date.now() - started} ms`);
  return {
    candidates: surfaces.flatMap((surface) => surface.candidates),
    scopes: surfaces.flatMap((surface) => surface.scopes)
  };
}

export async function resolveOperatorParty(extensionPath: string, setting = operatorPartySetting(), qualifiedChoices?: () => Promise<PackageWorkspaceChoice[]>): Promise<ResolvedOperatorParty> {
  const raw = String(setting || '').trim();
  if (!raw) return empty('none', raw);
  const manual = parseManualOperatorParty(raw);
  if (manual.manual) {
    if (!manual.displayName) return empty('unresolved', raw);
    return { ...empty('unknown', raw), displayName: manual.displayName, recipientLabels: [manual.displayName] };
  }
  // A selected Operator Party is an exact Role/Party target. Do not qualify
  // unrelated open VS Code folders as one combined operator context: their
  // package-local identities can collide even when this target is unambiguous.
  // Incoming's startup already prefetched exact, Core-qualified Workspace
  // choices. Reuse that in-flight/ready projection when supplied by the host;
  // don't rescan every VS Code root once package orientation has finished.
  const choices = await (qualifiedChoices ? qualifiedChoices() : loadQualifiedLocalWorkspaceChoices(extensionPath));
  const scoped = scopedOperatorPartySources(choices, raw);
  const surface = await qualifiedOperatorPartySurface(extensionPath, scoped);
  return resolvedPartyFromQualifiedSurface(raw, surface);
}

// Values from a single Core-qualified picker projection are reused for the
// immediately selected exact target. Do not rerun discovery or subprocess
// qualification merely to return the choice the user just saw.
function resolvedPartyFromQualifiedSurface(raw: string, surface: OperatorPartySurface): ResolvedOperatorParty {
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

export async function pickOperatorParty(extensionPath: string, qualifiedChoices?: () => Promise<PackageWorkspaceChoice[]>): Promise<ResolvedOperatorParty | null> {
  const started = Date.now();
  // Share the host's prefetched/in-flight, Core-qualified Workspace set.
  // Opening a picker must not launch another full root discovery when Incoming
  // or New Artifact has already qualified those same sources.
  const choices = await (qualifiedChoices ? qualifiedChoices() : loadQualifiedLocalWorkspaceChoices(extensionPath));
  console.info(`Tiinex Operator Party discovery: ${choices.length} qualified Workspace roots in ${Date.now() - started} ms`);
  const surface = await qualifiedOperatorPartySurface(extensionPath, choices);
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
  // None and Manual are explicit choices and do not need a Core query.
  // A selected Role/Party comes from the exact Core-qualified projection that
  // populated this picker, including any scope/recipient data from that result.
  // Later authoring/transport actions retain their own qualification gates.
  if (selected.action !== 'candidate') return resolveOperatorParty(extensionPath, value);
  return resolvedPartyFromQualifiedSurface(value, surface);
}

function empty(state: OperatorPartyState, setting: string): ResolvedOperatorParty {
  return { state, setting, displayName: '', kind: 'unknown', target: '', workspaceId: '', artifactPath: '', schemaId: '', recipientLabels: [], recipientTargets: [] };
}
