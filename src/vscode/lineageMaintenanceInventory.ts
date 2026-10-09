import path from 'node:path';
import { readdir, lstat, readFile } from 'node:fs/promises';

/** Collects exactly the local .topics candidate scope for a *Core* projection.
 * The host is not a validator. Any unsupported .trace.md remains unqualified
 * and blocks a claim of complete representation rather than being omitted. */
export async function discoverWorkspaceArtifactCandidates(root: string): Promise<{materials: {path: string; markdown: string}[];unqualified: string[]}> {
  const materials: {path: string; markdown: string}[] = [],unqualified: string[] = [];
  const topics=path.resolve(root,'.topics');
  const state=await lstat(topics);
  if (!state.isDirectory() || state.isSymbolicLink()) throw Error('Unsafe .topics boundary');
  const excluded=new Set(['.git','.vscode','node_modules','.tiinex']);
  const queue=[topics]; let files=0,bytes=0;
  let directories=0;
  while(queue.length){
    if(++directories>10000) throw Error('Workspace artifact inventory directory limit');
    const parent=queue.shift()!;
    for(const ent of await readdir(parent,{withFileTypes:true})){
      if (ent.isSymbolicLink()) { unqualified.push(path.relative(root, path.join(parent,ent.name)).split(path.sep).join('/')); continue; }
      if (excluded.has(ent.name)) continue;
      const full=path.join(parent,ent.name);
      if(ent.isDirectory()){queue.push(full);continue;}
      if(!ent.isFile() || !ent.name.endsWith('.trace.md')) continue;
      if(++files>12000)throw Error('Workspace artifact inventory file limit');
      const fileStat=await lstat(full);
      if(!fileStat.isFile() || fileStat.isSymbolicLink() || fileStat.size>4*1024*1024 || (bytes+=fileStat.size)>48*1024*1024)throw Error('Workspace artifact inventory size limit');
      const relative=path.relative(root,full).split(path.sep).join('/');
      const markdown=await readFile(full,'utf8');
      if(!/^\s*- Current Schema: (?:\[)?tiinex\.[a-z0-9.]+/m.test(markdown))unqualified.push(relative);
      else materials.push({path:relative,markdown});
    }
  }
  return {materials,unqualified};
}
