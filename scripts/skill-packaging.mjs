import { lstat, readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

/** Core-independent VSIX content policy: ship exactly declared skill trees.
 * Fail closed on symlinks, traversal, duplicate paths and unexpected file kinds.
 */
export async function collectVscodeSkillEntries(root, manifest) {
  const declarations = manifest?.contributes?.chatSkills || [];
  if (!Array.isArray(declarations)) throw new Error('tiinex.vsix.skills-declaration-not-array');
  const entries = [];
  const encountered = new Set();
  let bytes = 0;
  for (const skill of declarations) {
    const declared = String(skill?.path || '');
    const match = /^\.\/skills\/([a-z0-9]+(?:-[a-z0-9]+)*)\/SKILL\.md$/.exec(declared);
    if (!match) throw new Error('tiinex.vsix.skill-declaration-unsafe:'+declared);
    const slug = match[1];
    if (encountered.has(slug)) throw new Error('tiinex.vsix.skill-declaration-duplicate:'+slug);
    encountered.add(slug);
    const skillsRoot = await lstat(path.join(root,'skills'));
    if (!skillsRoot.isDirectory() || skillsRoot.isSymbolicLink()) throw new Error('tiinex.vsix.skills-root-unsafe');
    const directory = path.join(root,'skills',slug);
    const files = [];
    async function walk(relative = '') {
      const folder = path.join(directory,relative);
      const current = await lstat(folder);
      if (!current.isDirectory() || current.isSymbolicLink()) throw new Error('tiinex.vsix.skill-directory-unsafe');
      for (const filename of (await readdir(folder)).sort()) {
        if (filename === '.git' || filename === '..' || filename === '.') throw new Error('tiinex.vsix.skill-path-invalid');
        const rel = relative ? `${relative}/${filename}` : filename;
        const abs = path.join(directory,rel);
        const stat = await lstat(abs);
        if (stat.isSymbolicLink()) throw new Error('tiinex.vsix.skill-symlink-denied:'+rel);
        if (stat.isDirectory()) await walk(rel);
        else if (stat.isFile()) files.push(rel);
        else throw new Error('tiinex.vsix.skill-kind-denied:'+rel);
      }
    }
    await walk();
    if (!files.includes('SKILL.md')) throw new Error('tiinex.vsix.skill-main-missing:'+slug);
    for (const relative of files) {
      const blob = await readFile(path.join(directory,relative));
      bytes += blob.length;
      if (blob.length > 1024*1024 || bytes > 5*1024*1024) throw new Error('tiinex.vsix.skill-size-limit');
      entries.push([`extension/skills/${slug}/${relative}`,blob]);
    }
  }
  return entries;
}
