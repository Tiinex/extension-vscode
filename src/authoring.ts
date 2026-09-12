import path from 'node:path';
import os from 'node:os';
import { access, mkdir, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import * as vscode from 'vscode';
import { preferredNodeExecutable } from './host/nodeExecutable';
import { ArtifactMaterializationParentCandidate, ArtifactMaterializationSchemaCandidate, createArtifactDraft, inspectArtifactCreationContract, prepareBundledRuntime, projectArtifactMaterialization, projectArtifactSchemaGuide, projectHandoffLeaves } from './tiinex/bootstrap';
import { ArtifactAuthoringModel, projectArtifactAuthoringModel } from './core/artifactAuthoringModel';
import { requireArtifactCreationReady } from './core/artifactAuthoringQualification';
import { presentSharedFindings } from './core/findingPresentation';
import { normalizePath, parentTargetFromMarkdown, titleFromMarkdown } from './core/artifactTree';
import { safeRelativePath, safeTarget } from './core/paths';


export interface ArtifactDraftParent {
  path: string;
  markdown: string;
}

export interface ArtifactDraftSpec {
  root: string;
  workspaceId: string;
  schemaId: string;
  title: string;
  values: Record<string, unknown>;
  parentArtifact?: ArtifactDraftParent | null;
}

export interface PreparedArtifactDraft {
  root: string;
  workspaceId: string;
  schemaId: string;
  path: string;
  title: string;
  markdown: string;
  values: Record<string, unknown>;
  parentPath: string;
}

export async function loadArtifactAuthoringModel(extensionPath: string, schemaId: string, transitionType: 'create-artifact' | 'continue-from-record' = 'create-artifact'): Promise<ArtifactAuthoringModel> {
  const runtime = await prepareBundledRuntime(extensionPath, nodeExecutable());
  try {
    const [contract, guide] = await Promise.all([
      inspectArtifactCreationContract(runtime, schemaId, transitionType),
      projectArtifactSchemaGuide(runtime, schemaId, transitionType === 'continue-from-record' ? 'continue' : 'create')
    ]);
    const model = projectArtifactAuthoringModel(contract, guide);
    if (model.status !== 'ready') throw new Error(`tiinex.authoring.contract-blocked:${model.status}`);
    return model;
  } finally { await runtime.dispose(); }
}

export interface ArtifactAuthoringCatalog {
  schemas: ArtifactMaterializationSchemaCandidate[];
  parents: ArtifactMaterializationParentCandidate[];
}

export async function loadArtifactAuthoringCatalog(extensionPath: string, root: string): Promise<ArtifactAuthoringCatalog> {
  const materialRoot = required(root, 'tiinex.authoring.repository-required');
  const runtime = await prepareBundledRuntime(extensionPath, nodeExecutable());
  try {
    const projected = await projectArtifactMaterialization(runtime, materialRoot);
    if (!['needs-proposal', 'ready'].includes(String(projected.status || ''))) throw new Error(`tiinex.authoring.catalog-blocked:${projected.status || 'unknown'}`);
    const schemas = (projected.candidateSchemas || []).filter((item) => item.status === 'ready' && item.schemaId);
    if (!schemas.length) throw new Error('tiinex.authoring.no-creatable-schemas');
    return { schemas, parents: projected.parentCandidates || [] };
  } finally { await runtime.dispose(); }
}

function authoringProposal(spec: Pick<ArtifactDraftSpec, 'workspaceId' | 'schemaId' | 'title' | 'values'>, parentPath = ''): Record<string, unknown> {
  return {
    id: `vscode-${spec.workspaceId || 'workspace'}-artifact`,
    schemaId: spec.schemaId,
    title: spec.title,
    values: spec.values,
    ...(parentPath ? { parentRef: parentPath, mode: 'continue' } : { mode: 'root' }),
    rationale: 'Explicit VS Code artifact authoring request.',
    evidenceRefs: ['host:vscode-explicit-authoring']
  };
}

function plannedArtifact(result: any, proposalId: string): any {
  const planned = (result?.proposals || []).find((item: any) => String(item?.id || '') === proposalId) || result?.proposals?.[0];
  if (result?.status !== 'ready' || !planned?.path || planned?.status !== 'ready') {
    const sharedFindings = [
      ...(planned?.findings || []),
      ...(result?.findings || []).filter((item: any) => item?.severity === 'error')
    ];
    const codes = [
      ...sharedFindings.map((item: any) => item?.code),
      ...(result?.clarificationNeeds || []).map((item: any) => item?.code)
    ].filter(Boolean);
    const detail = sharedFindings.length ? `\n${presentSharedFindings(sharedFindings, result?.status || planned?.status || 'unknown')}` : '';
    throw new Error(`tiinex.authoring.materialization-blocked:${codes.join(',') || result?.status || planned?.status || 'unknown'}${detail}`);
  }
  return planned;
}

export async function prepareArtifactDraft(extensionPath: string, spec: ArtifactDraftSpec): Promise<PreparedArtifactDraft> {
  const root = required(spec.root, 'tiinex.authoring.repository-required');
  const title = required(spec.title, 'tiinex.authoring.title-required');
  const schemaId = required(spec.schemaId, 'tiinex.authoring.schema-required');
  const runtime = await prepareBundledRuntime(extensionPath, nodeExecutable());
  const scratch = await mkdtemp(path.join(os.tmpdir(), 'tiinex-vscode-artifact-preview-'));
  try {
    await copyMarkdownMaterial(root, scratch);
    const parentPath = spec.parentArtifact?.path ? safeRelativePath(spec.parentArtifact.path) : '';
    if (parentPath && spec.parentArtifact) {
      const target = safeTarget(scratch, parentPath);
      await mkdir(path.dirname(target), { recursive: true });
      await writeFile(target, spec.parentArtifact.markdown, 'utf8');
    }
    const proposal = authoringProposal({ workspaceId: spec.workspaceId, schemaId, title, values: spec.values }, parentPath);
    const plan = await projectArtifactMaterialization(runtime, scratch, [proposal]);
    const planned = plannedArtifact(plan, String(proposal.id));
    const transition = planned.parent ? 'continue-from-record' : 'create-artifact';
    const created = requireArtifactCreationReady(await createArtifactDraft(runtime, schemaId, scratch, planned.path, title, spec.values, planned.parent || null, transition));
    return {
      root,
      workspaceId: spec.workspaceId,
      schemaId,
      path: safeRelativePath(planned.path),
      title,
      markdown: String(created.draft.markdown),
      values: spec.values,
      parentPath
    };
  } finally {
    await rm(scratch, { recursive: true, force: true });
    await runtime.dispose();
  }
}

export async function writePreparedArtifactDraft(extensionPath: string, draft: PreparedArtifactDraft): Promise<string> {
  const runtime = await prepareBundledRuntime(extensionPath, nodeExecutable());
  try {
    const proposal = authoringProposal({ workspaceId: draft.workspaceId, schemaId: draft.schemaId, title: draft.title, values: draft.values }, draft.parentPath);
    const plan = await projectArtifactMaterialization(runtime, draft.root, [proposal]);
    const planned = plannedArtifact(plan, String(proposal.id));
    if (safeRelativePath(planned.path) !== draft.path) throw new Error('tiinex.authoring.preview-stale-recreate-required');
  } finally { await runtime.dispose(); }
  const target = safeTarget(draft.root, draft.path);
  if (!await absent(target)) throw new Error(`tiinex.authoring.target-exists:${draft.path}`);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, draft.markdown, { encoding: 'utf8', flag: 'wx' });
  return target;
}


export interface QualifiedHandoffArtifact {
  root: string;
  workspaceId: string;
  path: string;
  title: string;
  markdown: string;
  from: string;
  to: string;
  purpose: string;
  parentPath: string;
}

function resolvedParentPath(artifactPath: string, markdown: string): string {
  const target = parentTargetFromMarkdown(markdown);
  if (!target || target.includes('::') || /^(?:https?:|[a-z][a-z0-9+.-]*:)/i.test(target)) return '';
  return normalizePath(path.posix.normalize(path.posix.join(path.posix.dirname(normalizePath(artifactPath)), target)));
}

export async function qualifyExistingHandoff(extensionPath: string, root: string, workspaceId: string, artifactPath: string): Promise<QualifiedHandoffArtifact> {
  const safePath = safeRelativePath(artifactPath);
  const markdown = await readFile(safeTarget(root, safePath), 'utf8');
  const runtime = await prepareBundledRuntime(extensionPath, nodeExecutable());
  try {
    const projected = await projectHandoffLeaves(runtime, [root]);
    const candidates = projected.candidates?.length ? projected.candidates : projected.leaves;
    const candidate = candidates.find((item) => normalizePath(item.path) === normalizePath(safePath));
    if (projected.status !== 'ready' || !candidate || candidate.qualification !== 'qualified-exact') throw new Error(`tiinex.authoring.handoff-unqualified:${safePath}`);
    return {
      root,
      workspaceId,
      path: safePath,
      title: candidate.title || titleFromMarkdown(markdown, path.posix.basename(safePath)),
      markdown,
      from: candidate.from,
      to: candidate.to,
      purpose: candidate.purpose,
      parentPath: resolvedParentPath(safePath, markdown)
    };
  } finally { await runtime.dispose(); }
}

function nodeExecutable(): string { return preferredNodeExecutable(vscode.workspace.getConfiguration('tiinex').get('nodePath', '').toString().trim()); }
async function absent(file: string): Promise<boolean> { try { await access(file); return false; } catch { return true; } }
function required(value: string, code: string): string { const out = String(value || '').trim(); if (!out) throw new Error(code); return out; }

async function copyMarkdownMaterial(root: string, output: string, current = root): Promise<void> {
  const entries = await readdir(current, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === '.git' || entry.name === 'node_modules' || entry.name === 'dist' || entry.name === '.site-publish' || entry.name === '.tiinex') continue;
    const source = path.join(current, entry.name);
    if (entry.isDirectory()) { await copyMarkdownMaterial(root, output, source); continue; }
    if (!entry.isFile() || !/\.md$/i.test(entry.name)) continue;
    const relative = path.relative(root, source);
    const target = path.join(output, relative);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, await readFile(source));
  }
}
