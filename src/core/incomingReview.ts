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
 * An Incoming package becomes review-decision-ready only after this session has
 * completed one explicit Merge/Replace review operation and the complete carried Workspace set
 * now compares byte-exact against the open Local Workspaces. Pre-existing exact packages therefore do not manufacture an Accept/Reject decision state until the operator explicitly runs Merge/Replace review.
 */
export function incomingReviewReady(reviewPerformed: boolean, workspaces: IncomingWorkspaceReviewState[]): boolean {
  if (!reviewPerformed || !workspaces.length) return false;
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
