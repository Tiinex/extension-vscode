import { presentActionableFindings } from './findingPresentation';

export interface QualifiedParticipantRole {
  label: string;
  reference: string;
  workspaceId: string;
  path: string;
}

export interface ParticipantProjection {
  state: 'qualified' | 'not-established' | 'blocked';
  roles: QualifiedParticipantRole[];
  detail: string;
  findings: Array<{ severity: string; code: string; message: string }>;
}

export function participantProjectionFromManufactureReceipt(receipt: any): ParticipantProjection {
  const findings = (Array.isArray(receipt?.findings) ? receipt.findings : []).map((item: any) => ({
    severity: String(item?.severity || ''),
    code: String(item?.code || ''),
    message: String(item?.message || '')
  }));
  if (receipt?.status !== 'ready' || receipt?.transportExecutable === false) {
    return { state: 'blocked', roles: [], detail: presentActionableFindings(receipt?.findings || [], receipt?.status || 'unknown'), findings };
  }
  // Core's common manufacture receipt exposes semantic participant authority
  // explicitly in planSummary. Do not reconstruct it from route inputs, Role
  // inventory, endpoint labels, or package/cache presence in the host.
  const semanticRoutes = Array.isArray(receipt?.planSummary?.semanticParticipantRoutes)
    ? receipt.planSummary.semanticParticipantRoutes
    : [];
  const semanticRoute = semanticRoutes.length === 1 ? semanticRoutes[0] : null;
  if (semanticRoutes.length > 1) {
    return {
      state: 'blocked', roles: [], findings,
      detail: 'Core returned more than one semantic participant route for a single-route participant projection.'
    };
  }
  if (semanticRoute && String(semanticRoute?.state || '') === 'blocked') {
    return {
      state: 'blocked', roles: [], findings,
      detail: 'Core could not qualify semantic participant authority for this Handoff route.'
    };
  }
  const projected = semanticRoute
    ? (Array.isArray(semanticRoute?.participants) ? semanticRoute.participants : [])
    : (Array.isArray(receipt?.planSummary?.participantRoles)
      ? receipt.planSummary.participantRoles
      : (Array.isArray(receipt?.plan?.requirements?.participantRoles) ? receipt.plan.requirements.participantRoles : []));
  const roles = projected.map((item: any) => ({
    label: String(item?.label || item?.roleLabel || item?.requirementName || '').trim(),
    reference: String(item?.reference || item?.referenceTarget || '').trim(),
    workspaceId: String(item?.workspaceId || item?.targetWorkspaceId || item?.selectedMaterial?.provenance?.workspaceId || '').trim(),
    path: String(item?.path || item?.targetPath || item?.selectedMaterial?.provenance?.path || '').trim()
  }));
  if (roles.some((item: QualifiedParticipantRole) => !item.label || !item.reference || !item.workspaceId || !item.path)) {
    return {
      state: 'blocked', roles: [], findings,
      detail: 'Core projected participant authority, but the exact Role identity/material projection was incomplete.'
    };
  }
  if (!roles.length) {
    if (semanticRoute && String(semanticRoute?.state || '') === 'qualified') {
      return {
        state: 'blocked', roles: [], findings,
        detail: 'Core qualified semantic participant authority but returned no exact participant Role material.'
      };
    }
    return {
      state: 'not-established', roles: [], findings,
      detail: 'Core did not establish any additional semantic participant Role for this current work.'
    };
  }
  return {
    state: 'qualified', roles, findings,
    detail: `${roles.length} Core-qualified semantic participant Role${roles.length === 1 ? '' : 's'}.`
  };
}
