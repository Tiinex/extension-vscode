/**
 * Presentation-only projection of already-deleted Tiinex artifacts.
 * It never deletes, stages, qualifies or declares external historical content readable.
 */
import path from 'node:path';

export interface DeletedReductionArtifact {
  workspaceId: string;
  path: string;
  parentPath: string;
  permalink: string;
  declaredV2: string;
}

const canonicalPath = (value: string): string => String(value || '').replace(/\\/g, '/').replace(/^\.\//, '').trim();

/** Leaf-only means no other deleted artifact has this one as its qualified Parent path. */
export function deletedReductionLeaves(items: DeletedReductionArtifact[]): DeletedReductionArtifact[] {
  const paths = new Set(items.map(item => `${item.workspaceId}::${canonicalPath(item.parentPath)}`).filter(item => !item.endsWith('::')));
  return items.filter(item => !paths.has(`${item.workspaceId}::${canonicalPath(item.path)}`))
    .sort((a, b) => a.workspaceId.localeCompare(b.workspaceId) || a.path.localeCompare(b.path));
}

/** Read the declared historical Parent from original trace bytes; never infer Parent from filename prefixes. */
export function historicalParentPath(markdown: string, relativePath: string): string {
  const head = String(markdown || '').split(/\n- Current\s*\n/)[0];
  const section = head.match(/(?:^|\n)- Parent\s*\n([\s\S]*?)(?=\n- (?:Current|Parent)\s*\n|$)/)?.[1] || '';
  const trace = section.match(/^\s{2,}- Trace:\s*(?:\[[^\]]+\]\(([^)]+)\)|(.+?))\s*$/m);
  const target = String(trace?.[1] || trace?.[2] || '').trim();
  if (!target) return '';
  const github = target.match(/^https:\/\/github\.com\/[^/]+\/[^/]+\/blob\/[0-9a-f]{40}\/([^?#]+)$/i);
  const value = github ? decodeURI(github[1]) : target.split('#')[0].split('?')[0].replace(/\\/g, '/');
  if (/^[a-z]+:\/\//i.test(value)) return '';
  if (value.startsWith('.topics/')) return canonicalPath(value);
  const resolved = path.posix.normalize(path.posix.join(path.posix.dirname(canonicalPath(relativePath)), value));
  return resolved === '..' || resolved.startsWith('../') ? '' : canonicalPath(resolved);
}

/** Retain the artifact's declared self-integrity from historical bytes, without claiming requalification. */
export function historicalDeclaredV2(markdown: string): string {
  const section = String(markdown || '').split(/^# Continuity Integrity\s*$/m)[1] || '';
  const match = section.match(/- \[sha256-base64url-c14n-v2\]\([^)]+\)\s*\n\s*- Towards: self\s*\n\s*- Value:\s*([A-Za-z0-9_-]{43})/m);
  return match?.[1] || '';
}

/** One stable human-first shape, using the existing Source Context body field. */
export function renderDeletedReductionSourceContext(items: DeletedReductionArtifact[]): string {
  const leaves = deletedReductionLeaves(items);
  const groups = new Map<string, DeletedReductionArtifact[]>();
  for (const item of leaves) {
    if (!groups.has(item.workspaceId)) groups.set(item.workspaceId, []);
    groups.get(item.workspaceId)!.push(item);
  }
  return [...groups].map(([workspaceId, entries]) => [
    `- ${workspaceId}`,
    ...entries.map(item => [
      `  - [${path.posix.basename(item.path)}](${item.permalink})`,
      ...(item.declaredV2 ? [`    - sha256-base64url-c14n-v2: \`${item.declaredV2}\``] : [])
    ].join('\n'))
  ].join('\n')).join('\n');
}
