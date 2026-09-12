export type ArtifactReferenceKind = 'relative' | 'workspace' | 'external' | 'fragment' | 'invalid';

export interface ArtifactReferenceResolution {
  kind: ArtifactReferenceKind;
  raw: string;
  workspaceId?: string;
  path?: string;
  fragment?: string;
  external?: string;
  reason?: string;
}

export interface MarkdownLinkTarget {
  start: number;
  end: number;
  target: string;
}

/**
 * Resolve one Markdown link without guessing filenames or semantic identity.
 * Paths are always repository/carrier-relative POSIX paths. Escapes above the
 * current Workspace/carrier root fail closed.
 */
export function resolveArtifactReference(currentWorkspaceId: string, currentPath: string, href: string): ArtifactReferenceResolution {
  const raw = String(href || '').trim();
  if (!raw) return { kind: 'invalid', raw, reason: 'empty' };
  if (raw.startsWith('#')) return { kind: 'fragment', raw, fragment: raw.slice(1) };

  const qualified = raw.match(/^([A-Za-z0-9._-]+)::(.+)$/);
  if (qualified) {
    const split = splitSuffix(qualified[2]);
    const target = rootRelativePath(split.path);
    if (!target) return { kind: 'invalid', raw, reason: 'workspace-path-invalid' };
    return { kind: 'workspace', raw, workspaceId: qualified[1], path: target, fragment: split.fragment };
  }

  if (/^https?:\/\//i.test(raw)) return { kind: 'external', raw, external: raw };
  if (/^[A-Za-z][A-Za-z0-9+.-]*:/.test(raw)) return { kind: 'invalid', raw, reason: 'unsupported-scheme' };

  const split = splitSuffix(raw);
  if (!split.path || split.path.startsWith('/') || /^[A-Za-z]:[\\/]/.test(split.path)) {
    return { kind: 'invalid', raw, reason: 'absolute-or-empty' };
  }
  const target = relativePath(currentPath, split.path);
  if (!target) return { kind: 'invalid', raw, reason: 'relative-path-invalid' };
  return { kind: 'relative', raw, workspaceId: currentWorkspaceId, path: target, fragment: split.fragment };
}

/** Return Markdown inline-link destinations with exact target byte offsets. */
export function markdownLinkTargets(markdown: string): MarkdownLinkTarget[] {
  const text = String(markdown || '');
  const out: MarkdownLinkTarget[] = [];
  let fence = '';
  let lineStart = 0;
  for (const line of text.split(/(?<=\n)/)) {
    const body = line.replace(/\r?\n$/, '');
    const marker = body.match(/^ {0,3}(`{3,}|~{3,})(.*)$/);
    if (fence) {
      if (marker && marker[1][0] === fence[0] && marker[1].length >= fence.length && !marker[2].trim()) fence = '';
      lineStart += line.length;
      continue;
    }
    if (marker) {
      fence = marker[1];
      lineStart += line.length;
      continue;
    }

    // Tiinex continuity links are ordinary inline Markdown links. Keep this
    // deliberately conservative: destinations with nested parentheses or
    // multiline syntax are left to VS Code's native Markdown provider.
    const re = /(?<!!)\[[^\]\n]*\]\(\s*(?:<([^>\n]+)>|([^\s)\n]+))/g;
    let match: RegExpExecArray | null;
    while ((match = re.exec(body))) {
      const target = String(match[1] || match[2] || '');
      if (!target) continue;
      const relative = match[0].lastIndexOf(target);
      const start = lineStart + match.index + relative;
      out.push({ start, end: start + target.length, target });
    }
    lineStart += line.length;
  }
  return out;
}


export function materialTargetKey(workspaceId: string, artifactPath: string): string {
  const workspace = String(workspaceId || '').trim();
  const target = normalizeArtifactPath(artifactPath);
  return workspace && target ? `${workspace}::${target}` : '';
}

export function artifactReferenceAvailable(resolution: ArtifactReferenceResolution, availableTargets: ReadonlySet<string>): boolean {
  if (resolution.kind === 'invalid') return false;
  if (resolution.kind !== 'relative' && resolution.kind !== 'workspace') return true;
  const key = materialTargetKey(resolution.workspaceId || '', resolution.path || '');
  return Boolean(key && availableTargets.has(key));
}

export function normalizeArtifactPath(value: string): string {
  return normalizedSegments(String(value || '').replace(/\\/g, '/').split('/'), false) || '';
}

function splitSuffix(value: string): { path: string; fragment: string } {
  const raw = String(value || '').trim();
  const hash = raw.indexOf('#');
  const beforeHash = hash >= 0 ? raw.slice(0, hash) : raw;
  const query = beforeHash.indexOf('?');
  return {
    path: decodePath(query >= 0 ? beforeHash.slice(0, query) : beforeHash),
    fragment: hash >= 0 ? raw.slice(hash + 1) : ''
  };
}

function relativePath(currentPath: string, target: string): string {
  const current = normalizeArtifactPath(currentPath);
  if (!current) return '';
  const base = current.split('/');
  base.pop();
  return normalizedSegments([...base, ...String(target || '').replace(/\\/g, '/').split('/')], true) || '';
}

function rootRelativePath(target: string): string {
  if (!target || target.startsWith('/') || /^[A-Za-z]:[\\/]/.test(target)) return '';
  return normalizedSegments(String(target).replace(/\\/g, '/').split('/'), true) || '';
}

function normalizedSegments(parts: string[], allowParent: boolean): string | null {
  const stack: string[] = [];
  for (const part of parts) {
    if (!part || part === '.') continue;
    if (part.includes('\0')) return null;
    if (part === '..') {
      if (!allowParent || !stack.length) return null;
      stack.pop();
      continue;
    }
    stack.push(part);
  }
  return stack.length ? stack.join('/') : null;
}

function decodePath(value: string): string {
  try { return decodeURIComponent(value); } catch { return value; }
}
