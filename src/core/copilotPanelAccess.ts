/** Delegation only for a future native Copilot agent adapter's Tiinex panel
 * actions. This must not be applied to Core CLI, normal authoring, grounding,
 * independent Move/Rebase or commands executed by the human operator. */
export const COPILOT_PANEL_ACCESS = Object.freeze({
  None: 'none',
  PackAndTransport: 'pack-and-transport',
  InspectUnpackPackAndTransport: 'inspect-unpack-pack-and-transport'
} as const);
export type CopilotPanelAccess = typeof COPILOT_PANEL_ACCESS[keyof typeof COPILOT_PANEL_ACCESS];

const outgoing = new Set(['outgoing.preview', 'outgoing.pack', 'transport.inspect-ready', 'transport.copy-text', 'transport.open-receipt']);
const incoming = new Set(['incoming.inspect', 'incoming.preview', 'incoming.unpack-staging']);

export type PanelDelegationDecision = Readonly<{
  status: 'allowed' | 'denied';
  reasonCode: string;
  action: string;
  access: CopilotPanelAccess;
}>;

export function qualifyCopilotPanelAction(action: string, configuredAccess: unknown): PanelDelegationDecision {
  const access: CopilotPanelAccess = Object.values(COPILOT_PANEL_ACCESS).includes(configuredAccess as CopilotPanelAccess)
    ? configuredAccess as CopilotPanelAccess : COPILOT_PANEL_ACCESS.None;
  // Unknown actions, Workspace mutations and direct role reassignment are
  // never grantable by any of the three levels.
  const allowed = access !== 'none' && (outgoing.has(action) || (access === 'inspect-unpack-pack-and-transport' && incoming.has(action)));
  return Object.freeze({
    status: allowed ? 'allowed' : 'denied',
    reasonCode: allowed ? 'panel-delegation-qualified' : !outgoing.has(action) && !incoming.has(action) ? 'panel-action-unlisted' : 'panel-access-denied',
    action, access
  });
}
