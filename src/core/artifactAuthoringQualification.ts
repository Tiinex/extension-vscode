import { FindingLike, presentSharedFindings } from './findingPresentation';

export interface ArtifactCreationResultLike {
  status?: string;
  draft?: { markdown?: string | null } | null;
  findings?: FindingLike[];
  findingSummary?: { counts?: { error?: number } };
}

/**
 * Host-neutral projection of the shared Core draft result. VS Code does not
 * classify schema-reference forms or finding codes here: Core status and
 * severity are the only blocking authority.
 */
export function artifactCreationReady(result: ArtifactCreationResultLike | null | undefined): boolean {
  const status = String(result?.status || '');
  const markdown = String(result?.draft?.markdown || '');
  const findingErrors = (result?.findings || []).filter((finding) => String(finding?.severity || '').toLowerCase() === 'error').length;
  const summaryErrors = Number(result?.findingSummary?.counts?.error || 0);
  return status.startsWith('created-') && Boolean(markdown) && findingErrors === 0 && summaryErrors === 0;
}

export function requireArtifactCreationReady<T extends ArtifactCreationResultLike>(result: T): T {
  if (artifactCreationReady(result)) return result;
  const findings = result?.findings || [];
  const blocking = findings.filter((finding) => String(finding?.severity || '').toLowerCase() === 'error');
  const detail = presentSharedFindings(blocking.length ? blocking : findings, String(result?.status || 'unknown'));
  throw new Error(`tiinex.authoring.draft-blocked:${String(result?.status || 'unknown')}\n${detail}`);
}
