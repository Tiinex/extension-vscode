export type IncomingReviewDecision = '' | 'accepted' | 'rejected';

export interface IncomingWorkspaceReviewState {
  workspaceId: string;
  state: string;
}

export interface IncomingReviewPresentation {
  contextValue: string;
  descriptionPrefix: string;
  icon: 'none' | 'pending' | 'accepted' | 'rejected';
}

/**
 * Incoming review readiness is a host presentation of Core's complete carried
 * Workspace comparison. If every carried Workspace already compares byte-exact,
 * there is nothing for Replace/Merge to establish first: the operator may decide
 * the local review immediately. `reviewPerformed` is retained as a compatibility
 * parameter for older host state but no longer gates readiness.
 */
export function incomingReviewReady(_reviewPerformed: boolean, workspaces: IncomingWorkspaceReviewState[]): boolean {
  if (!workspaces.length) return false;
  return workspaces.every((item) => String(item?.state || '').trim() === 'exact');
}

/**
 * Host-local review presentation only. These states never create Tiinex Handoff
 * acceptance/rejection authority; they only control the Incoming tree UX after
 * successful local Merge/Replace review.
 */
export function incomingReviewPresentation(ready: boolean, decision: IncomingReviewDecision, actionPending = false): IncomingReviewPresentation {
  if (decision === 'accepted') return { contextValue: 'tiinex.incomingPackageAccepted', descriptionPrefix: 'ACCEPTED · local review', icon: 'accepted' };
  if (decision === 'rejected') return { contextValue: 'tiinex.incomingPackageRejected', descriptionPrefix: 'REJECTED · local review', icon: 'rejected' };
  if (actionPending) return { contextValue: 'tiinex.incomingPackageReviewPending', descriptionPrefix: 'REVIEWING', icon: 'pending' };
  if (ready) return { contextValue: 'tiinex.incomingPackageDecision', descriptionPrefix: 'REVIEW READY', icon: 'pending' };
  return { contextValue: 'tiinex.incomingPackage', descriptionPrefix: '', icon: 'none' };
}
