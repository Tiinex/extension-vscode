import { createHash } from 'node:crypto';
import { get as httpsGet } from 'node:https';

export interface PermalinkResolutionState {
  state: 'resolved' | 'missing' | 'unavailable';
  sha256?: string;
  target?: string;
}

export interface PermalinkResolutionFact {
  path: string;
  target: string;
  exact: PermalinkResolutionState;
  latest: PermalinkResolutionState;
}

interface GitHubBlobTarget { owner: string; repo: string; ref: string; path: string; target: string }
interface HttpTextResponse { status: number; body: string }
type HttpGet = (url: string, accept: string) => Promise<HttpTextResponse>;

const CACHE_TTL_MS = 5 * 60 * 1000;
const cache = new Map<string, { expires: number; fact: Omit<PermalinkResolutionFact, 'path'> }>();

export function versionBearingGitHubPermalinks(markdown: string): string[] {
  const targets = new Set<string>();
  for (const line of String(markdown || '').replace(/\r\n?/g, '\n').split('\n')) {
    const schema = line.match(/^\s*-\s+(?:Envelope Schema|Parent Schema|Current Schema)\s*:\s*\[[^\]]+\]\((https:\/\/github\.com\/[^)]+\/blob\/[^)]+)\)\s*$/i);
    if (schema) targets.add(schema[1]);
    const integrity = line.match(/^\s*-\s+\[sha256-base64url-c14n-v2\]\((https:\/\/github\.com\/[^)]+\/blob\/[^)]+)\)\s*$/i);
    if (integrity) targets.add(integrity[1]);
  }
  return [...targets];
}

export function parseGitHubBlobPermalink(value: string): GitHubBlobTarget | null {
  try {
    const url = new URL(String(value || '').trim());
    if (url.protocol !== 'https:' || url.hostname.toLowerCase() !== 'github.com') return null;
    const parts = url.pathname.split('/').filter(Boolean).map((part) => decodeURIComponent(part));
    if (parts.length < 5 || parts[2] !== 'blob') return null;
    const [owner, repo, , ref, ...pathParts] = parts;
    const sourcePath = pathParts.join('/');
    if (!owner || !repo || !ref || !sourcePath) return null;
    return { owner, repo, ref, path: sourcePath, target: url.toString() };
  } catch {
    return null;
  }
}

export async function resolveVersionBearingPermalinks(markdown: string, documentPath: string, getter: HttpGet = getTextResponse): Promise<PermalinkResolutionFact[]> {
  const targets = versionBearingGitHubPermalinks(markdown);
  return Promise.all(targets.map(async (target) => {
    const key = target;
    const now = Date.now();
    const prior = cache.get(key);
    if (prior && prior.expires > now) return { path: documentPath, ...prior.fact };
    const parsed = parseGitHubBlobPermalink(target);
    if (!parsed) return { path: documentPath, target, exact: { state: 'unavailable' }, latest: { state: 'unavailable' } };
    const fact = await resolveGitHubTarget(parsed, getter);
    cache.set(key, { expires: now + CACHE_TTL_MS, fact });
    return { path: documentPath, ...fact };
  }));
}

async function resolveGitHubTarget(parsed: GitHubBlobTarget, getter: HttpGet): Promise<Omit<PermalinkResolutionFact, 'path'>> {
  const exactUrl = rawUrl(parsed.owner, parsed.repo, parsed.ref, parsed.path);
  const exact = await resolveBytes(exactUrl, getter);
  const commitsUrl = `https://api.github.com/repos/${encodeURIComponent(parsed.owner)}/${encodeURIComponent(parsed.repo)}/commits?sha=master&path=${encodeURIComponent(parsed.path)}&per_page=1`;
  let latest: PermalinkResolutionState = { state: 'unavailable' };
  try {
    const response = await getter(commitsUrl, 'application/vnd.github+json');
    if (response.status === 404 || response.status === 422) latest = { state: 'missing' };
    else if (response.status >= 200 && response.status < 300) {
      const commits = JSON.parse(response.body) as Array<{ sha?: string }>;
      const commit = String(commits?.[0]?.sha || '').trim();
      if (!commit) latest = { state: 'missing' };
      else if (!/^[a-f0-9]{40}$/i.test(commit)) latest = { state: 'unavailable' };
      else {
        const material = await resolveBytes(rawUrl(parsed.owner, parsed.repo, commit, parsed.path), getter);
        latest = material.state === 'resolved'
          ? { ...material, target: `https://github.com/${parsed.owner}/${parsed.repo}/blob/${commit}/${parsed.path}` }
          : material;
      }
    }
  } catch {
    latest = { state: 'unavailable' };
  }
  return { target: parsed.target, exact, latest };
}

async function resolveBytes(url: string, getter: HttpGet): Promise<PermalinkResolutionState> {
  try {
    const response = await getter(url, 'text/plain');
    if (response.status === 404) return { state: 'missing' };
    if (response.status < 200 || response.status >= 300) return { state: 'unavailable' };
    return { state: 'resolved', sha256: createHash('sha256').update(Buffer.from(response.body, 'utf8')).digest('hex') };
  } catch {
    return { state: 'unavailable' };
  }
}

function rawUrl(owner: string, repo: string, ref: string, sourcePath: string): string {
  return `https://raw.githubusercontent.com/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/${encodeURIComponent(ref)}/${sourcePath.split('/').map(encodeURIComponent).join('/')}`;
}

function getTextResponse(url: string, accept: string): Promise<HttpTextResponse> {
  return new Promise((resolve, reject) => {
    const req = httpsGet(url, { headers: { Accept: accept, 'User-Agent': 'tiinex-extension-vscode' } }, (res) => {
      const status = Number(res.statusCode || 0);
      if (status >= 300 && status < 400 && res.headers.location) {
        res.resume();
        void getTextResponse(new URL(res.headers.location, url).toString(), accept).then(resolve, reject);
        return;
      }
      const chunks: Buffer[] = [];
      res.on('data', (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
      res.on('end', () => resolve({ status, body: Buffer.concat(chunks).toString('utf8') }));
      res.on('error', reject);
    });
    req.on('error', reject);
    req.setTimeout(5000, () => req.destroy(new Error('tiinex.permalink-resolution.timeout')));
  });
}
