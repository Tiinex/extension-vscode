import { checkedCarrierFilename } from './carrierFilename';
import path from 'node:path';
import { writeFile } from 'node:fs/promises';

export type WorkspaceCarrierSource = {
  workspaceId: string;
  root: string;
  workspaceTargetPath: string;
};

export async function workspaceCarrierArgs(selected: WorkspaceCarrierSource[], scratch: string, projectedFilename = '', packageParentPath = '', packageMajorReason = '', carrierPrefix = '', existingFilenames: string[] = []): Promise<string[]> {
  const ordered = [...selected].sort((a, b) => a.workspaceId.localeCompare(b.workspaceId));
  const primary = ordered[0];
  if (!primary) throw new Error('tiinex.package-builder.workspace-selection-empty');
  const descriptorsPath = path.join(scratch, 'workspace-carrier-workspaces.json');
  const targetsPath = path.join(scratch, 'workspace-carrier-targets.json');
  await writeFile(descriptorsPath, JSON.stringify({ workspaces: ordered.slice(1).map((item) => ({ id: item.workspaceId, root: item.root })) }), 'utf8');
  await writeFile(targetsPath, JSON.stringify(ordered.slice(1).map((item) => ({ workspaceId: item.workspaceId, path: item.workspaceTargetPath }))), 'utf8');
  const args = [primary.root, '--carrier-mode', 'workspace', '--workspace-id', primary.workspaceId, '--workspace-target', primary.workspaceTargetPath, '--workspace-roots', descriptorsPath, '--workspace-targets', targetsPath, '--tooling-bootstrap', 'embedded'];
  const filename = String(projectedFilename || '').trim();
  if (filename) args.push('--projected-filename', checkedCarrierFilename(filename));
  const parent = String(packageParentPath || '').trim();
  if (parent) args.push('--package-parent', path.resolve(parent));
  else if (String(packageMajorReason || '').trim()) {
    const prefix = String(carrierPrefix || '').trim();
    if (!prefix) throw new Error('tiinex.package-builder.package-major-prefix-required');
    args.push('--package-major', '--major-reason', String(packageMajorReason || '').trim(), '--carrier-prefix', prefix);
    const namesPath = path.join(scratch, 'carrier-existing-filenames.json');
    await writeFile(namesPath, JSON.stringify({ existingFilenames }), 'utf8');
    args.push('--carrier-existing-filenames', namesPath);
  } else args.push('--new-root');
  return args;
}
