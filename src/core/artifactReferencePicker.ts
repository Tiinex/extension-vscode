import path from 'node:path';

/** Presentation-only local locator. A picker never creates evidence authority. */
export function localArtifactReference(root: string, targetDirectory: string, selectedFile: string): string {
  const workspace = path.resolve(root);
  const target = path.resolve(workspace, targetDirectory || '.topics');
  const selected = path.resolve(selectedFile);
  const inside = (candidate: string): boolean => {
    const relative = path.relative(workspace, candidate);
    return relative === '' || (relative !== '..' && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative));
  };
  if (!inside(target) || !inside(selected)) throw new Error('tiinex.authoring.reference-outside-workspace');
  const relative = path.relative(target, selected).split(path.sep).join('/');
  if (!relative) throw new Error('tiinex.authoring.reference-self-not-file');
  const targetUri = relative.split('/').map((component) => component === '..' || component === '.' ? component : encodeURIComponent(component)).join('/');
  const label = path.basename(selected).replace(/\\/g, '\\\\').replace(/\[/g, '\\[').replace(/\]/g, '\\]');
  return `[${label}](${targetUri})`;
}
