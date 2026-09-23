import * as vscode from 'vscode';
import type { PackageParticipantProjection, PackageParticipantRole } from '../packageBuilder';
import { extensionHostAcceptanceAdditionalParticipantReferences, extensionHostAcceptanceEnabled, extensionHostAcceptanceParticipantReferences, recordExtensionHostAcceptanceEvent } from './extensionHostAcceptance';

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

export async function confirmExactCoreParticipantProjection(projection: PackageParticipantProjection): Promise<PackageParticipantProjection | null> {
  if (projection.state === 'blocked') {
    const summary = projection.findings.find((item) => item.severity === 'error')?.message || projection.detail || 'Core participant/route qualification blocked.';
    await vscode.window.showErrorMessage(`Tiinex Attach Handoff blocked: ${summary}`, 'Show Details').then(async (choice: string | undefined) => {
      if (choice === 'Show Details') await vscode.window.showErrorMessage(projection.detail || summary, { modal: true });
    });
    return null;
  }
  if (projection.state !== 'qualified' || !projection.roles.length) {
    void vscode.window.showInformationMessage('No additional Core-qualified participants are established for this Handoff. It will be attached without participant Role pointers.');
    return projection;
  }

  const items = projection.roles.map((role) => ({
    label: `$(person) ${role.label}`,
    description: role.workspaceId,
    detail: role.reference,
    role,
    picked: true
  }));
  const acceptanceReferences = extensionHostAcceptanceParticipantReferences(items.map((item) => item.role.reference));
  const selected = acceptanceReferences === undefined
    ? await vscode.window.showQuickPick(items, {
        title: 'Additional participants · Core-qualified',
        placeHolder: 'Confirm the exact Core-qualified participant set for this Handoff.',
        canPickMany: true,
        ignoreFocusOut: true
      })
    : acceptanceReferences === null
      ? undefined
      : items.filter((item) => acceptanceReferences.includes(item.role.reference));
  if (!selected) {
    recordExtensionHostAcceptanceEvent('participant-confirmation', { state: 'cancelled', count: items.length });
    return null;
  }
  if (selected.length !== items.length || items.some((item) => !selected.some((choice) => choice.role.reference === item.role.reference))) {
    recordExtensionHostAcceptanceEvent('participant-confirmation', { state: 'rejected-weakened-set', selected: selected.map((item) => item.role.reference), exact: items.map((item) => item.role.reference) });
    if (!extensionHostAcceptanceEnabled()) await vscode.window.showWarningMessage('Tiinex participant confirmation must keep the exact Core-qualified set. No Handoff was attached.');
    return null;
  }
  recordExtensionHostAcceptanceEvent('participant-confirmation', { state: 'accepted-exact-set', selected: selected.map((item) => item.role.reference) });
  return projection;
}
