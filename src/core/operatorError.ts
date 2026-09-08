export interface OperatorErrorPresentation {
  cancelled: boolean;
  summary: string;
  detail: string;
  code: string;
}

function detailOf(error: unknown): string {
  return error instanceof Error ? (error.stack || error.message) : String(error);
}

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function firstCode(message: string): string {
  const match = message.match(/\btiinex\.[a-z0-9._-]+/i);
  return match?.[0] || '';
}

export function presentOperatorError(error: unknown): OperatorErrorPresentation {
  const message = messageOf(error).trim();
  const detail = detailOf(error).trim() || message || 'Unknown Tiinex operator failure.';
  const code = firstCode(message);
  if (/tiinex\.(?:authoring|package-builder)\.(?:cancelled|output-cancelled)\b/i.test(message)) {
    return { cancelled: true, summary: 'Cancelled — no changes were made.', detail, code };
  }
  if (/endpoint-(?:unqualified|ambiguous)|endpoint-reference/i.test(message)) {
    return { cancelled: false, summary: 'The selected Handoff endpoint is no longer uniquely qualified. Refresh the endpoint choices and select it again.', detail, code };
  }
  if (/authoring\.(?:parent|repository)|parent-(?:blocked|unqualified|mismatch)/i.test(message)) {
    return { cancelled: false, summary: 'The selected Handoff Parent or owning Workspace no longer qualifies. Re-select the active artifact as Parent and retry.', detail, code };
  }
  if (/authoring\.target-exists/i.test(message)) {
    return { cancelled: false, summary: 'A Handoff already exists at the proposed path. Change the title or inspect the existing artifact before retrying.', detail, code };
  }
  if (/process-failed|bootstrap|shared-core|invalid-json|spawn|ENOENT/i.test(message)) {
    return { cancelled: false, summary: 'Shared Tiinex Tooling could not complete the operation. No result was accepted; technical details are available in the Tiinex output.', detail, code };
  }
  if (/package-builder|manufacture|workspace-preview|preview-blocked/i.test(message)) {
    return { cancelled: false, summary: 'The Handoff package is not qualified yet. Refresh the package options and review the selected route and Workspaces.', detail, code };
  }
  return { cancelled: false, summary: 'Tiinex could not complete this operation. No result was accepted; technical details are available in the Tiinex output.', detail, code };
}
