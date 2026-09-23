import path from 'node:path';

export type AcceptanceParticipantSelection = 'exact' | 'weaken' | 'cancel';

interface AcceptanceConfig {
  incomingPackagePath: string;
  outgoingFolder: string;
  outgoingWorkspaceId: string;
  participantSelection: AcceptanceParticipantSelection;
  additionalParticipantReferences: string[];
}

interface AcceptanceEvent {
  at: number;
  type: string;
  detail: Record<string, unknown>;
}

const enabled = String(process.env.TIINEX_EXTENSION_HOST_ACCEPTANCE || '') === '1';
const config: AcceptanceConfig = {
  incomingPackagePath: String(process.env.TIINEX_EXTENSION_HOST_FIXTURE_PACKAGE || '').trim(),
  outgoingFolder: String(process.env.TIINEX_EXTENSION_HOST_OUTPUT_DIR || '').trim(),
  outgoingWorkspaceId: String(process.env.TIINEX_EXTENSION_HOST_WORKSPACE_ID || 'acceptance').trim() || 'acceptance',
  participantSelection: 'exact',
  additionalParticipantReferences: []
};
const events: AcceptanceEvent[] = [];

export function extensionHostAcceptanceEnabled(): boolean { return enabled; }

export function configureExtensionHostAcceptance(value: Partial<AcceptanceConfig> = {}): Readonly<AcceptanceConfig> {
  if (!enabled) throw new Error('tiinex.extension-host.acceptance-disabled');
  if (value.incomingPackagePath !== undefined) config.incomingPackagePath = String(value.incomingPackagePath || '').trim();
  if (value.outgoingFolder !== undefined) config.outgoingFolder = String(value.outgoingFolder || '').trim();
  if (value.outgoingWorkspaceId !== undefined) config.outgoingWorkspaceId = String(value.outgoingWorkspaceId || '').trim() || 'acceptance';
  if (value.participantSelection !== undefined) {
    if (!['exact', 'weaken', 'cancel'].includes(String(value.participantSelection))) throw new Error('tiinex.extension-host.participant-selection-invalid');
    config.participantSelection = value.participantSelection;
  }
  if (value.additionalParticipantReferences !== undefined) {
    if (!Array.isArray(value.additionalParticipantReferences)) throw new Error('tiinex.extension-host.additional-participant-references-invalid');
    config.additionalParticipantReferences = [...new Set(value.additionalParticipantReferences.map((item) => String(item || '').trim()).filter(Boolean))];
  }
  recordExtensionHostAcceptanceEvent('configure', { ...config });
  return Object.freeze({ ...config });
}

export function extensionHostAcceptanceOutgoingParent(candidates: string[]): string | undefined {
  if (!enabled) return undefined;
  const wanted = path.resolve(String(config.incomingPackagePath || ''));
  const matched = candidates.find((item) => item && path.resolve(item) === wanted);
  if (!matched) throw new Error('tiinex.extension-host.fixture-incoming-not-open');
  recordExtensionHostAcceptanceEvent('outgoing-parent-selected', { packagePath: matched });
  return matched;
}

export function extensionHostAcceptanceOutgoingSourceKeys(sources: Array<{ sourceKey: string; workspaceId: string; source: string }>): string[] | undefined {
  if (!enabled) return undefined;
  const matches = sources.filter((item) => item.workspaceId === config.outgoingWorkspaceId && item.source === 'local');
  if (matches.length !== 1) throw new Error(`tiinex.extension-host.local-source-unqualified:${config.outgoingWorkspaceId}:${matches.length}`);
  recordExtensionHostAcceptanceEvent('outgoing-source-selected', { workspaceId: config.outgoingWorkspaceId, sourceKey: matches[0].sourceKey });
  return [matches[0].sourceKey];
}

export function extensionHostAcceptanceOutgoingFolder(): string | undefined {
  if (!enabled) return undefined;
  const value = String(config.outgoingFolder || '').trim();
  if (!value) throw new Error('tiinex.extension-host.output-dir-required');
  recordExtensionHostAcceptanceEvent('outgoing-folder-selected', { outputDirectory: value });
  return value;
}

export function extensionHostAcceptanceAdditionalParticipantReferences(references: string[]): string[] | null | undefined {
  if (!enabled) return undefined;
  const candidates = [...references];
  recordExtensionHostAcceptanceEvent('participant-candidates-presented', { references: candidates, requested: [...config.additionalParticipantReferences] });
  if (config.participantSelection === 'cancel') return null;
  const missing = config.additionalParticipantReferences.filter((reference) => !candidates.includes(reference));
  if (missing.length) throw new Error(`tiinex.extension-host.additional-participant-unavailable:${missing.join(',')}`);
  return candidates.filter((reference) => config.additionalParticipantReferences.includes(reference));
}

export function extensionHostAcceptanceParticipantReferences(references: string[]): string[] | null | undefined {
  if (!enabled) return undefined;
  const exact = [...references];
  recordExtensionHostAcceptanceEvent('participant-presented', { references: exact, selection: config.participantSelection });
  if (config.participantSelection === 'cancel') return null;
  if (config.participantSelection === 'weaken') return exact.slice(0, Math.max(0, exact.length - 1));
  return exact;
}

export function recordExtensionHostAcceptanceEvent(type: string, detail: Record<string, unknown> = {}): void {
  if (!enabled) return;
  events.push(Object.freeze({ at: Date.now(), type: String(type || ''), detail: Object.freeze({ ...detail }) }));
}

export function extensionHostAcceptanceEvents(): ReadonlyArray<AcceptanceEvent> {
  return Object.freeze(events.map((item) => Object.freeze({ at: item.at, type: item.type, detail: Object.freeze({ ...item.detail }) })));
}
