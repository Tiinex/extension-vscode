export interface FindingLike {
  severity?: string;
  code?: string;
  message?: string;
}

function actionForFinding(code: string): string {
  const value = code.toLowerCase();
  if (value.includes('route')) return 'Choose one exact qualified Handoff route (or No Handoff pointer), refresh the preview, and retry.';
  if (value.includes('workspace')) return 'Verify the selected Workspace identity and its host-root mapping, refresh the qualified context, and retry.';
  if (value.includes('bootstrap') || value.includes('transport') || value.includes('payload') || value.includes('archive')) return 'Regenerate the carrier from the current generated Site shared-core snapshot; do not hand-edit transport bytes.';
  if (value.includes('schema') || value.includes('parent') || value.includes('origin') || value.includes('integrity') || value.includes('lineage')) return 'Repair the reported Tiinex artifact through shared Tooling, then refresh the preview and retry.';
  return 'Resolve the shared Tiinex qualification finding, refresh the preview, and retry.';
}

export function presentActionableFinding(finding: FindingLike): string {
  const code = String(finding.code || 'finding-unidentified').trim() || 'finding-unidentified';
  const message = String(finding.message || 'Shared Tiinex Tooling did not provide a finding message.').trim();
  return `${actionForFinding(code)}\nUnderlying finding: ${code}: ${message}`;
}

export function presentActionableFindings(findings: FindingLike[] = [], status = 'unknown'): string {
  const blocking = findings.filter((finding) => finding.severity === 'error' || finding.severity === 'warning');
  if (blocking.length) return blocking.map(presentActionableFinding).join('\n\n');
  return `Shared Tiinex qualification returned status ${String(status || 'unknown')}. Refresh the qualified host context and retry; if it remains blocked, inspect the shared Tooling receipt.`;
}
