import * as vscode from 'vscode';
import type { PackageParticipantProjection, PackageParticipantRole } from '../packageBuilder';
import { extensionHostAcceptanceAdditionalParticipantReferences, recordExtensionHostAcceptanceEvent } from './extensionHostAcceptance';

export interface ParticipantPresentation {
  description: string;
  tooltip: string;
}

export function participantPresentation(projection: PackageParticipantProjection): ParticipantPresentation {
  const description = projection.state === 'qualified'
    ? `${projection.roles.length} Core-qualified participant Role${projection.roles.length === 1 ? '' : 's'}`
    : projection.state === 'blocked'
      ? 'participant projection blocked'
      : 'participant authority unresolved';
  return { description, tooltip: projection.detail };
}

export async function selectAdditionalParticipantRoles(candidates: PackageParticipantRole[]): Promise<PackageParticipantRole[] | null> {
  if (!candidates.length) return [];
  const items = candidates.map((role) => ({
    label: `$(person-add) ${role.label}`,
    description: role.workspaceId,
    detail: role.reference,
    role,
    picked: false
  }));
  const acceptanceReferences = extensionHostAcceptanceAdditionalParticipantReferences(items.map((item) => item.role.reference));
  const selected = acceptanceReferences === undefined
    ? await vscode.window.showQuickPick(items, {
        title: 'Additional participant Roles · qualified open Workspaces',
        placeHolder: 'Select zero, one, or multiple additional Roles. Core requalifies the exact set before Attach and Pack.',
        canPickMany: true,
        ignoreFocusOut: true
      })
    : acceptanceReferences === null
      ? undefined
      : items.filter((item) => acceptanceReferences.includes(item.role.reference));
  if (!selected) {
    recordExtensionHostAcceptanceEvent('participant-selection', { state: 'cancelled', candidateCount: items.length });
    return null;
  }
  const roles = selected.map((item) => item.role);
  recordExtensionHostAcceptanceEvent('participant-selection', { state: 'selected', selected: roles.map((item) => item.reference), candidateCount: items.length });
  return roles;
}

export async function acceptCoreParticipantProjection(projection: PackageParticipantProjection, requested: PackageParticipantRole[] = []): Promise<PackageParticipantProjection | null> {
  if (projection.state === 'blocked') {
    const summary = projection.findings.find((item) => item.severity === 'error')?.message || projection.detail || 'Core participant/route qualification blocked.';
    await vscode.window.showErrorMessage(`Tiinex Attach Handoff blocked: ${summary}`, 'Show Details').then(async (choice: string | undefined) => {
      if (choice === 'Show Details') await vscode.window.showErrorMessage(projection.detail || summary, { modal: true });
    });
    recordExtensionHostAcceptanceEvent('participant-projection', { state: 'blocked', requested: requested.map((item) => item.reference) });
    return null;
  }

  const requestedReferences = [...new Set(requested.map((item) => String(item.reference || '').trim()).filter(Boolean))];
  if (requestedReferences.length) {
    const projectedReferences = new Set(projection.roles.map((item) => String(item.reference || '').trim()).filter(Boolean));
    const missing = requestedReferences.filter((reference) => !projectedReferences.has(reference));
    if (projection.state !== 'qualified' || missing.length) {
      const detail = missing.length
        ? `Core did not project the explicitly selected Role reference(s): ${missing.join(', ')}`
        : 'Core did not establish semantic participant authority for the explicitly selected Role set.';
      recordExtensionHostAcceptanceEvent('participant-projection', { state: 'selected-not-projected', requested: requestedReferences, projected: [...projectedReferences], projectionState: projection.state });
      await vscode.window.showErrorMessage(`Tiinex Attach Handoff blocked: ${detail}`);
      return null;
    }
  }

  if (projection.state !== 'qualified' || !projection.roles.length) {
    void vscode.window.showInformationMessage('No additional Core-qualified participants are established for this Handoff. It will be attached without participant Role pointers.');
  }
  recordExtensionHostAcceptanceEvent('participant-projection', { state: 'accepted-core', requested: requestedReferences, projected: projection.roles.map((item) => item.reference), projectionState: projection.state });
  return projection;
}

