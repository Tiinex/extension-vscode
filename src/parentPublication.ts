import { createHash } from 'node:crypto';
import { execFile } from 'node:child_process';
import { get as httpsGet } from 'node:https';
import { readFile } from 'node:fs/promises';
import * as path from 'node:path';
import { promisify } from 'node:util';
import { parseGitHubBlobPermalink } from './permalinkResolution';
import { relativeRepositoryPath } from './core/repositoryPath';

export interface PinnedParentRead { target:string; repository:string; commit:string; path:string; markdown:string; sha256:string }
const git = promisify(execFile);
const PINNED=/^[a-f0-9]{40}$/i;
const MAX=1024*1024;
const cache=new Map<string,{time:number;read:PinnedParentRead}>();

/** The host observes published immutable bytes; Core independently qualifies
 * the Parent schema, source identity, c14n-v2 self and child target digest.
 * A reachable web page without bytes never counts as Parent proof. */
export async function readPinnedGitHubParent(target:string, reader:typeof fetchRawPinnedParent=fetchRawPinnedParent):Promise<PinnedParentRead|null> {
  const parsed=parseGitHubBlobPermalink(target);
  if (!parsed || !PINNED.test(parsed.ref) || !parsed.path.startsWith('.topics/') || !parsed.path.endsWith('.trace.md') || parsed.path.split('/').includes('..'))return null;
  const cached=cache.get(target);if(cached&&cached.time>Date.now())return cached.read;
  try {
    const markdown=await reader(parsed.owner,parsed.repo,parsed.ref,parsed.path);
    if (typeof markdown!=='string' || !markdown.startsWith('# Continuity Context\n'))return null;
    const read: PinnedParentRead={target,repository:`${parsed.owner}/${parsed.repo}`,commit:parsed.ref,path:parsed.path,markdown,sha256:createHash('sha256').update(Buffer.from(markdown,'utf8')).digest('hex')};
    cache.set(target,{time:Date.now()+120000,read});
    return read;
  }catch{return null;}
}

export function pinnedParentTraceUrl(markdown:string):string {
  const lines=String(markdown||'').replace(/\r\n?/g,'\n').split('\n');
  const parent=lines.indexOf('- Parent');
  const current=lines.indexOf('- Current');
  if(parent<0||current<=parent)return '';
  for(const line of lines.slice(parent+1,current)){
    const match=line.match(/^  - Trace:\s*\[[^\]]+\]\((https:\/\/github\.com\/[^)]+)\)\s*$/);
    if(match)return match[1];
  }
  return '';
}

/** User-selected *other repository* Parent, never branch/mutable locator.
 * The working file, HEAD object and published GitHub blob must be byte-equal.
 * No Git repository, dirty Parent or unpublished revision => fail closed. */
export async function publishedParentFromLocalChoice(repoRoot:string,filePath:string,readParent:typeof readPinnedGitHubParent=readPinnedGitHubParent):Promise<PinnedParentRead> {
  const relative=relativeRepositoryPath(repoRoot,filePath);
  if(!relative.startsWith('.topics/')||!relative.endsWith('.trace.md')||relative.split('/').includes('..'))throw new Error('tiinex.cross-parent.invalid-artifact-path');
  const run=async(...args:string[])=>String((await git('git',args,{cwd:repoRoot,timeout:5000,maxBuffer:MAX})).stdout);
  let commit:string,remote:string,committed:string;
  try{commit=(await run('rev-parse','HEAD')).trim();remote=(await run('config','--get','remote.origin.url')).trim();committed=await run('show',`HEAD:${relative}`);}
  catch{throw new Error('tiinex.cross-parent.git-source-unavailable');}
  if(!PINNED.test(commit))throw new Error('tiinex.cross-parent.commit-unqualified');
  const repository=githubRepositoryFromRemote(remote);
  if(!repository)throw new Error('tiinex.cross-parent.github-origin-unqualified');
  const local=await readFile(filePath,'utf8');
  if(local!==committed)throw new Error('tiinex.cross-parent.uncommitted-parent-bytes');
  const target=`https://github.com/${repository}/blob/${commit}/${relative.split('/').map(encodeURIComponent).join('/')}`;
  const verified=await readParent(target);
  if(!verified)throw new Error('tiinex.cross-parent.published-revision-unavailable');
  if(verified.markdown!==local)throw new Error('tiinex.cross-parent.remote-bytes-differ');
  return verified;
}
export function githubRepositoryFromRemote(input:string):string {
  const text=String(input||'').trim();
  const https=text.match(/^https:\/\/github\.com\/([\w.-]+)\/([\w.-]+?)(?:\.git)?\/?$/i);
  const ssh=text.match(/^git@github\.com:([\w.-]+)\/([\w.-]+?)(?:\.git)?$/i);
  const m=https||ssh;return m?`${m[1]}/${m[2]}`:'';
}

async function fetchRawPinnedParent(owner:string,repo:string,commit:string,sourcePath:string):Promise<string> {
  const url=`https://raw.githubusercontent.com/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/${encodeURIComponent(commit)}/${sourcePath.split('/').map(encodeURIComponent).join('/')}`;
  return new Promise((resolve,reject)=>{
    const request=httpsGet(url,{headers:{'User-Agent':'tiinex-extension-vscode','Accept':'text/plain'}},response=>{
      if(response.statusCode!==200){response.resume();reject(new Error(`pinned-parent-http-${response.statusCode||0}`));return;}
      const pieces:Buffer[]=[];let size=0;
      response.on('data',(chunk:Buffer)=>{size+=chunk.length;if(size>MAX){request.destroy(new Error('pinned-parent-size-limit'));return;}pieces.push(chunk);});
      response.on('end',()=>resolve(Buffer.concat(pieces).toString('utf8')));
      response.on('error',reject);
    });
    request.on('error',reject);request.setTimeout(5500,()=>request.destroy(new Error('pinned-parent-timeout')));
  });
}
