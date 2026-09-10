import path from 'node:path';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { randomBytes } from 'node:crypto';
import * as vscode from 'vscode';
import { sameRepositoryRoot } from '../core/repositoryPath';
import type { IncomingApplyStrategy } from '../incomingApply';

const RESUME_SCHEMA = 'tiinex.vscode.incoming-multi-root-resume.v1';

export interface IncomingMultiRootResume {
  schema: typeof RESUME_SCHEMA;
  packagePath: string;
  workspaceIds: string[];
  forcedStrategy?: IncomingApplyStrategy;
  targetRoots: string[];
  createdAt: string;
}

export interface PreparedIncomingMultiRootSession {
  workspaceFile: string;
  resumeFile: string;
}

function inside(parent: string, child: string): boolean {
  const relative = path.relative(path.resolve(parent), path.resolve(child));
  return relative === '' || (!path.isAbsolute(relative) && relative !== '..' && !relative.startsWith(`..${path.sep}`));
}

function uniqueRoots(values: string[]): string[] {
  const roots: string[] = [];
  for (const value of values) {
    const resolved = path.resolve(String(value || '').trim());
    if (!value || roots.some((item) => sameRepositoryRoot(item, resolved))) continue;
    roots.push(resolved);
  }
  return roots;
}

export async function prepareIncomingMultiRootSession(
  storageRoot: string,
  input: Omit<IncomingMultiRootResume, 'schema' | 'createdAt'>
): Promise<PreparedIncomingMultiRootSession> {
  const targetRoots = uniqueRoots(input.targetRoots);
  if (targetRoots.length < 2) throw new Error('tiinex.vscode.incoming-multi-root.requires-multiple-repositories');
  const workspaceIds = [...new Set(input.workspaceIds.map((item) => String(item || '').trim()).filter(Boolean))];
  if (!workspaceIds.length) throw new Error('tiinex.vscode.incoming-multi-root.workspace-selection-required');
  const root = path.join(path.resolve(storageRoot), 'incoming-workspaces');
  await mkdir(root, { recursive: true });
  const token = `${Date.now()}-${randomBytes(6).toString('hex')}`;
  const workspaceFile = path.join(root, `tiinex-incoming-${token}.code-workspace`);
  const resumeFile = `${workspaceFile}.tiinex-resume.json`;
  const resume: IncomingMultiRootResume = {
    schema: RESUME_SCHEMA,
    packagePath: path.resolve(input.packagePath),
    workspaceIds,
    ...(input.forcedStrategy ? { forcedStrategy: input.forcedStrategy } : {}),
    targetRoots,
    createdAt: new Date().toISOString()
  };
  await writeFile(workspaceFile, `${JSON.stringify({ folders: targetRoots.map((repoRoot) => ({ path: repoRoot })) }, null, 2)}\n`, 'utf8');
  await writeFile(resumeFile, `${JSON.stringify(resume, null, 2)}\n`, 'utf8');
  return { workspaceFile, resumeFile };
}

export async function consumeIncomingMultiRootResume(
  storageRoot: string,
  workspaceFile: vscode.Uri | undefined,
  openRoots: string[]
): Promise<IncomingMultiRootResume | null> {
  if (!workspaceFile || workspaceFile.scheme !== 'file') return null;
  const file = path.resolve(workspaceFile.fsPath);
  const ownedRoot = path.join(path.resolve(storageRoot), 'incoming-workspaces');
  if (!inside(ownedRoot, file) || !file.toLocaleLowerCase().endsWith('.code-workspace')) return null;
  const resumeFile = `${file}.tiinex-resume.json`;
  let parsed: IncomingMultiRootResume;
  try { parsed = JSON.parse(await readFile(resumeFile, 'utf8')) as IncomingMultiRootResume; }
  catch { return null; }
  if (parsed?.schema !== RESUME_SCHEMA || !parsed.packagePath || !Array.isArray(parsed.workspaceIds) || !Array.isArray(parsed.targetRoots)) return null;
  const targetRoots = uniqueRoots(parsed.targetRoots);
  if (targetRoots.length < 2 || targetRoots.some((target) => !openRoots.some((open) => sameRepositoryRoot(open, target)))) return null;
  await rm(resumeFile, { force: true });
  return {
    schema: RESUME_SCHEMA,
    packagePath: path.resolve(parsed.packagePath),
    workspaceIds: [...new Set(parsed.workspaceIds.map((item) => String(item || '').trim()).filter(Boolean))],
    ...(parsed.forcedStrategy === 'merge' || parsed.forcedStrategy === 'replace' ? { forcedStrategy: parsed.forcedStrategy } : {}),
    targetRoots,
    createdAt: String(parsed.createdAt || '')
  };
}
