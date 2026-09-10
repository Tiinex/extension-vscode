import path from 'node:path';
import { readFile, readdir, stat } from 'node:fs/promises';
import { makeIndexedArtifact, IndexedArtifact, normalizePath } from './core/artifactTree';
import { comparePackageRecency } from './core/outgoingUx';
import { inspectZipBuffer, readExactZipEntryFromBuffer, readZipEntriesFromBuffer } from './host/zip';

export interface IndexedWorkspaceFile { path: string; bytes: number; directory: boolean }

export interface IndexedCarrierWorkspace {
  workspaceId: string;
  label: string;
  descriptorPath: string;
  archivePath: string;
  repository: string;
  ref: string;
  descriptorMarkdown: string;
  artifacts: IndexedArtifact[];
  files: IndexedWorkspaceFile[];
}

export interface IndexedCarrierPackage {
  packagePath: string;
  filename: string;
  mtimeMs: number;
  bytes: number;
  carrierFiles: IndexedWorkspaceFile[];
  carrierArtifacts: IndexedArtifact[];
  workspaces: IndexedCarrierWorkspace[];
}

export interface IndexedLocalWorkspace {
  workspaceId: string;
  root: string;
  artifacts: IndexedArtifact[];
}

export async function indexCarrierPackage(packagePath: string): Promise<IndexedCarrierPackage> {
  const resolved = path.resolve(packagePath);
  const info = await stat(resolved);
  if (!info.isFile()) throw new Error('tiinex.discovery.package-not-file');
  const outer = await readFile(resolved);
  const outerEntries = await inspectZipBuffer(outer);
  const carrierFiles: IndexedWorkspaceFile[] = outerEntries.map((entry) => ({
    path: normalizePath(entry.path),
    bytes: entry.bytes,
    directory: entry.directory
  }));
  const carrierArtifacts: IndexedArtifact[] = [];
  const descriptorEntries = outerEntries.filter((entry) => !entry.directory && /\.workspace\.md$/i.test(entry.path));
  const workspaces: IndexedCarrierWorkspace[] = [];

  for (const entry of await readZipEntriesFromBuffer(outer, (item) => /\.md$/i.test(item.path) && !/\.workspace\.md$/i.test(item.path))) {
    const artifact = makeIndexedArtifact({ path: entry.path, carrierPath: entry.path, markdown: entry.data.toString('utf8') });
    if (artifact) carrierArtifacts.push(artifact);
  }

  for (const descriptorEntry of descriptorEntries) {
    const descriptorMarkdown = (await readExactZipEntryFromBuffer(outer, descriptorEntry.path)).toString('utf8');
    const descriptorArtifact = makeIndexedArtifact({ path: descriptorEntry.path, carrierPath: descriptorEntry.path, markdown: descriptorMarkdown });
    if (descriptorArtifact) carrierArtifacts.push(descriptorArtifact);
    const prefix = descriptorEntry.path.replace(/\.workspace\.md$/i, '');
    const archivePath = `${prefix}.workspace.zip`;
    const archiveMatch = outerEntries.filter((item) => item.path === archivePath && !item.directory);
    const workspaceId = workspaceIdFromDescriptorPath(descriptorEntry.path);
    const label = workspaceLabel(descriptorMarkdown, workspaceId);
    const repository = field(descriptorMarkdown, 'Repository');
    const ref = field(descriptorMarkdown, 'Ref');
    const artifacts: IndexedArtifact[] = [];
    let files: IndexedWorkspaceFile[] = [];
    if (archiveMatch.length === 1) {
      const nested = await readExactZipEntryFromBuffer(outer, archivePath);
      files = await inspectZipBuffer(nested);
      for (const entry of await readZipEntriesFromBuffer(nested, (item) => /\.md$/i.test(item.path))) {
        const artifact = makeIndexedArtifact({ workspaceId, path: entry.path, carrierPath: `${archivePath}::${entry.path}`, markdown: entry.data.toString('utf8') });
        if (artifact) artifacts.push(artifact);
      }
    }
    workspaces.push({ workspaceId, label, descriptorPath: descriptorEntry.path, archivePath: archiveMatch.length === 1 ? archivePath : '', repository, ref, descriptorMarkdown, artifacts, files });
  }

  workspaces.sort((a, b) => a.workspaceId.localeCompare(b.workspaceId, undefined, { sensitivity: 'base' }));
  carrierArtifacts.sort((a, b) => a.path.localeCompare(b.path));
  return { packagePath: resolved, filename: path.basename(resolved), mtimeMs: info.mtimeMs, bytes: info.size, carrierFiles, carrierArtifacts, workspaces };
}

export async function readCarrierWorkspaceFile(packagePath: string, archivePath: string, filePath: string): Promise<Buffer> {
  const outer = await readFile(path.resolve(packagePath));
  const nested = await readExactZipEntryFromBuffer(outer, normalizePath(archivePath));
  return readExactZipEntryFromBuffer(nested, normalizePath(filePath));
}

export async function indexLocalWorkspace(root: string, workspaceId: string): Promise<IndexedLocalWorkspace> {
  const resolved = path.resolve(root);
  const artifacts: IndexedArtifact[] = [];
  const topicsRoot = path.join(resolved, '.topics');
  try {
    const info = await stat(topicsRoot);
    if (!info.isDirectory()) return { workspaceId, root: resolved, artifacts };
  } catch {
    return { workspaceId, root: resolved, artifacts };
  }
  // The Tiinex tree is not a general Explorer. Restrict local indexing to the
  // canonical artifact namespace so expanding a large repository stays cheap.
  await walkMarkdown(resolved, topicsRoot, async (relative, markdown) => {
    const artifact = makeIndexedArtifact({ workspaceId, path: relative, carrierPath: relative, markdown });
    if (artifact) artifacts.push(artifact);
  });
  artifacts.sort((a, b) => a.path.localeCompare(b.path));
  return { workspaceId, root: resolved, artifacts };
}


const DEFAULT_PAYLOAD_EXCLUDED_DIRECTORIES = new Set(['.git', '.tiinex', 'node_modules', '.site-publish']);

export async function indexLocalWorkspaceFiles(root: string): Promise<IndexedWorkspaceFile[]> {
  const resolved = path.resolve(root);
  const files: IndexedWorkspaceFile[] = [];
  await walkWorkspaceFiles(resolved, resolved, files);
  return files.sort((a, b) => a.path.localeCompare(b.path));
}

async function walkWorkspaceFiles(root: string, current: string, out: IndexedWorkspaceFile[]): Promise<void> {
  const entries = await readdir(current, { withFileTypes: true });
  entries.sort((a, b) => a.name.localeCompare(b.name));
  for (const entry of entries) {
    if (entry.isDirectory() && DEFAULT_PAYLOAD_EXCLUDED_DIRECTORIES.has(entry.name)) continue;
    const absolute = path.join(current, entry.name);
    const relative = normalizePath(path.relative(root, absolute));
    if (!relative) continue;
    if (entry.isDirectory()) {
      out.push({ path: relative, bytes: 0, directory: true });
      await walkWorkspaceFiles(root, absolute, out);
      continue;
    }
    if (!entry.isFile()) continue;
    const info = await stat(absolute);
    out.push({ path: relative, bytes: info.size, directory: false });
  }
}

export async function discoveryPackages(folder: string): Promise<Array<{ path: string; filename: string; mtimeMs: number; bytes: number }>> {
  const resolved = path.resolve(folder);
  const entries = await readdir(resolved, { withFileTypes: true });
  const out: Array<{ path: string; filename: string; mtimeMs: number; bytes: number }> = [];
  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.toLowerCase().endsWith('.handoff-package.zip')) continue;
    const filePath = path.join(resolved, entry.name);
    const info = await stat(filePath);
    out.push({ path: filePath, filename: entry.name, mtimeMs: info.mtimeMs, bytes: info.size });
  }
  return out.sort(comparePackageRecency);
}

function workspaceIdFromDescriptorPath(value: string): string {
  const base = path.posix.basename(normalizePath(value)).replace(/\.workspace\.md$/i, '');
  const match = base.match(/^\d+(?:-\d+)*-(.+)$/);
  return String(match?.[1] || base).trim();
}

function workspaceLabel(markdown: string, fallback: string): string {
  const divider = markdown.indexOf('\n---');
  const body = divider >= 0 ? markdown.slice(divider + 4) : markdown;
  return String(body.match(/^#\s+(.+?)\s*$/m)?.[1] || fallback).trim();
}

function field(markdown: string, name: string): string {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = markdown.match(new RegExp(`^\\s*-\\s+${escaped}:\\s*(.+?)\\s*$`, 'mi'));
  return String(match?.[1] || '').trim().replace(/^`|`$/g, '');
}

async function walkMarkdown(root: string, current: string, visit: (relative: string, markdown: string) => Promise<void>): Promise<void> {
  const entries = await readdir(current, { withFileTypes: true });
  entries.sort((a, b) => a.name.localeCompare(b.name));
  for (const entry of entries) {
    if (entry.name === '.git' || entry.name === 'node_modules' || entry.name === 'dist' || entry.name === '.site-publish' || entry.name === '.tiinex') continue;
    const absolute = path.join(current, entry.name);
    if (entry.isDirectory()) {
      await walkMarkdown(root, absolute, visit);
      continue;
    }
    if (!entry.isFile() || !/\.md$/i.test(entry.name)) continue;
    const relative = normalizePath(path.relative(root, absolute));
    const markdown = await readFile(absolute, 'utf8');
    await visit(relative, markdown);
  }
}
