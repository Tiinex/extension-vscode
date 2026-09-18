import path from 'node:path';
import os from 'node:os';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { get as httpsGet } from 'node:https';
import { repositoryFact } from './host/git';
import { prepareBundledRuntime, runTiinexJson } from './tiinex/bootstrap';
import { preferredNodeExecutable } from './host/nodeExecutable';

interface WorkspaceInitReceipt {
  status: string;
  path?: string;
  workspaceId?: string;
  writeReceipt?: { path?: string; workspaceRelativePath?: string; bytes?: number };
  resolutionRequest?: { schemaId?: string; repository?: string; path?: string; resolution?: string };
  findingSummary?: { counts?: { error?: number } };
  findings?: Array<{ severity?: string; code?: string; message?: string }>;
}

export async function initializeRepositoryWorkspace(extensionPath: string, root: string): Promise<WorkspaceInitReceipt> {
  const fact = await repositoryFact(root);
  const repository = portableRepositoryIdentity(fact.repository);
  const ref = fact.branch || 'main';
  const workspaceId = workspaceIdFrom(repository || path.basename(root));
  const title = titleFromRepository(repository || path.basename(root));
  const runtime = await prepareBundledRuntime(extensionPath, preferredNodeExecutable());
  const scratch = await mkdtemp(path.join(os.tmpdir(), 'tiinex-vscode-workspace-init-'));
  try {
    const first = await runTiinexJson<WorkspaceInitReceipt>(runtime, ['init-workspace', root, '--repository', repository, '--ref', ref, '--workspace-id', workspaceId, '--title', title, '--authors', 'local-user', '--compact']);
    if (first.status === 'ready') return first;
    if (first.status !== 'needs-resolution' || !first.resolutionRequest?.repository || !first.resolutionRequest?.path) return first;
    const resolved = await resolveLatestGitHubSchema(first.resolutionRequest.repository, first.resolutionRequest.path);
    const schemaPath = path.join(scratch, 'schema.md');
    await writeFile(schemaPath, resolved.markdown, 'utf8');
    return await runTiinexJson<WorkspaceInitReceipt>(runtime, [
      'init-workspace', root,
      '--repository', repository,
      '--ref', ref,
      '--workspace-id', workspaceId,
      '--title', title,
      '--authors', 'local-user',
      '--schema-target', resolved.permalink,
      '--schema-material', schemaPath,
      '--compact'
    ]);
  } finally {
    await rm(scratch, { recursive: true, force: true });
    await runtime.dispose();
  }
}

async function resolveLatestGitHubSchema(repository: string, schemaPath: string): Promise<{ permalink: string; markdown: string; commit: string }> {
  const [owner, repo] = repository.split('/');
  if (!owner || !repo || repository.split('/').length !== 2) throw new Error('tiinex.workspace-init.schema-repository-invalid');
  const commitsUrl = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/commits?path=${encodeURIComponent(schemaPath)}&per_page=1`;
  const commits = JSON.parse(await getText(commitsUrl, 'application/vnd.github+json')) as Array<{ sha?: string }>;
  const commit = String(commits?.[0]?.sha || '').trim();
  if (!/^[a-f0-9]{40}$/i.test(commit)) throw new Error('tiinex.workspace-init.schema-commit-unresolved');
  const rawUrl = `https://raw.githubusercontent.com/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/${commit}/${schemaPath.split('/').map(encodeURIComponent).join('/')}`;
  const markdown = await getText(rawUrl, 'text/plain');
  if (!markdown.trim()) throw new Error('tiinex.workspace-init.schema-material-empty');
  const permalink = `https://github.com/${owner}/${repo}/blob/${commit}/${schemaPath}`;
  return { permalink, markdown, commit };
}

function getText(url: string, accept: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const req = httpsGet(url, { headers: { Accept: accept, 'User-Agent': 'tiinex-extension-vscode' } }, (res) => {
      const status = Number(res.statusCode || 0);
      if (status >= 300 && status < 400 && res.headers.location) {
        res.resume();
        void getText(new URL(res.headers.location, url).toString(), accept).then(resolve, reject);
        return;
      }
      if (status < 200 || status >= 300) {
        res.resume();
        reject(new Error(`tiinex.workspace-init.schema-fetch-failed:${status}`));
        return;
      }
      const chunks: Buffer[] = [];
      res.on('data', (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
      res.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
      res.on('error', reject);
    });
    req.on('error', reject);
    req.setTimeout(15000, () => req.destroy(new Error('tiinex.workspace-init.schema-fetch-timeout')));
  });
}

function portableRepositoryIdentity(remote: string): string {
  const value = String(remote || '').trim().replace(/\.git$/i, '');
  let match = value.match(/^git@github\.com:([^/]+\/[^/]+)$/i);
  if (match) return match[1];
  match = value.match(/^https?:\/\/github\.com\/([^/]+\/[^/]+)$/i);
  if (match) return match[1];
  match = value.match(/^ssh:\/\/git@github\.com\/([^/]+\/[^/]+)$/i);
  if (match) return match[1];
  return value;
}
function workspaceIdFrom(value: string): string { return String(value || 'workspace').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'workspace'; }
function titleFromRepository(value: string): string { const leaf=String(value || 'Workspace').replace(/\.git$/i,'').split(/[\\/]/).filter(Boolean).at(-1)||'Workspace'; return leaf.split(/[-_]+/).filter(Boolean).map((part)=>part.charAt(0).toUpperCase()+part.slice(1)).join(' '); }
