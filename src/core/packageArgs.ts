import path from 'node:path';
import { writeFile } from 'node:fs/promises';

export type WorkspaceCarrierSource = {
  workspaceId: string;
  root: string;
  workspaceTargetPath: string;
};

export async function workspaceCarrierArgs(selected: WorkspaceCarrierSource[], scratch: string, projectedFilename = ''): Promise<string[]> {
  const ordered = [...selected].sort((a, b) => a.workspaceId.localeCompare(b.workspaceId));
  const primary = ordered[0];
  if (!primary) throw new Error('tiinex.package-builder.workspace-selection-empty');
  const descriptorsPath = path.join(scratch, 'workspace-carrier-workspaces.json');
  await writeFile(descriptorsPath, JSON.stringify({ workspaces: ordered.slice(1).map((item) => ({ id: item.workspaceId, root: item.root, workspaceTargetPath: item.workspaceTargetPath })) }), 'utf8');
  const args = [primary.root, '--carrier-mode', 'workspace', '--workspace-id', primary.workspaceId, '--workspace-target', primary.workspaceTargetPath, '--workspace-roots', descriptorsPath, '--tooling-bootstrap', 'embedded'];
  const filename = String(projectedFilename || '').trim();
  if (filename) args.push('--projected-filename', filename);
  return args;
}
