import path from 'node:path';
import os from 'node:os';
import { access, mkdir, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import * as vscode from 'vscode';
import { preferredNodeExecutable } from './host/nodeExecutable';
import { ArtifactMaterializationParentCandidate, ArtifactMaterializationSchemaCandidate, createArtifactDraft, createHandoffDraft, inspectArtifactCreationContract, prepareBundledRuntime, projectArtifactMaterialization, projectArtifactSchemaGuide, projectAuthoringParent, projectHandoffAuthoringPlan, projectHandoffLeaves } from './tiinex/bootstrap';
import { ArtifactAuthoringModel, projectArtifactAuthoringModel } from './core/artifactAuthoringModel';
import { requireArtifactCreationReady } from './core/artifactAuthoringQualification';
import { presentSharedFindings } from './core/findingPresentation';
import { normalizedTransferName } from './core/operatorModel';
import { normalizePath, parentTargetFromMarkdown, titleFromMarkdown } from './core/artifactTree';
import { safeRelativePath, safeTarget } from './core/paths';
import { relativeRepositoryPath, sameRepositoryRoot } from './core/repositoryPath';
import { repositoryRootForResource, repositoryRoots } from './vscode/gitApi';


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

export type EndpointKind = 'role' | 'party' | 'unknown';
export type TransferKind = 'work' | 'responsibility' | 'work-and-responsibility';

export interface AuthoringParentContext {
  root: string;
  parentPath: string;
  label: string;
  schemaId: string;
}

/**
 * Compatibility-only legacy Handoff form helpers. No active command or panel
 * routes through these schema-specialized functions; primary authoring above is
 * schema-generic and Core-planned. Retained only for API compatibility until a
 * later cleanup removes downstream callers outside this active extension flow.
 */
export interface HandoffFormInput {
  root: string;
  parentPath?: string;
  title: string;
  purpose: string;
  from: string;
  fromKind: EndpointKind;
  fromReference?: string;
  to: string;
  toKind: EndpointKind;
  toReference?: string;
  transferName: string;
  transferKind: TransferKind;
  description: string;
  boundary: string;
  signalMeaning: string;
  doesNotMean: string;
  mustNotClaim: string;
}

function nodeExecutable(): string { return preferredNodeExecutable(vscode.workspace.getConfiguration('tiinex').get('nodePath', '').toString().trim()); }
async function absent(file: string): Promise<boolean> { try { await access(file); return false; } catch { return true; } }
function required(value: string, code: string): string { const out = String(value || '').trim(); if (!out) throw new Error(code); return out; }
function endpointKind(value: string): EndpointKind { if (value === 'role' || value === 'party' || value === 'unknown') return value; throw new Error('tiinex.authoring.endpoint-kind-invalid'); }
function transferKind(value: string): TransferKind { if (value === 'work' || value === 'responsibility' || value === 'work-and-responsibility') return value; throw new Error('tiinex.authoring.transfer-kind-invalid'); }
function endpointReference(label: string, kind: EndpointKind, target = '', code = 'tiinex.authoring.endpoint-reference-required'): string {
  if (kind === 'unknown') return '';
  const ref = required(target, code);
  if (!/^[a-z0-9._-]+::[^\s]+$/i.test(ref)) throw new Error('tiinex.authoring.endpoint-reference-invalid');
  const safeLabel = String(label || '').replace(/\]/g, '\\]');
  return `[${safeLabel}](${ref})`;
}

async function assertOpenRepository(root: string): Promise<string> {
  const roots = await repositoryRoots();
  const matches = roots.filter((item) => sameRepositoryRoot(item, root));
  if (matches.length !== 1) throw new Error(matches.length ? 'tiinex.authoring.repository-ambiguous' : 'tiinex.authoring.repository-not-open');
  return matches[0];
}

export async function qualifyArtifactParent(extensionPath: string, artifactPath: string): Promise<AuthoringParentContext> {
  const root = await repositoryRootForResource(artifactPath);
  const parentPath = safeRelativePath(relativeRepositoryPath(root, artifactPath));
  if (!parentPath) throw new Error('tiinex.authoring.parent-root-not-artifact');
  const runtime = await prepareBundledRuntime(extensionPath, nodeExecutable());
  try {
    const projected = await projectAuthoringParent(runtime, artifactPath);
    const schemaId = String(projected?.schemaId || projected?.currentSchemaId || '').trim();
    return { root, parentPath, label: path.basename(parentPath), schemaId };
  } finally { await runtime.dispose(); }
}

export async function createHandoffFromForm(extensionPath: string, raw: HandoffFormInput): Promise<string> {
  const root = await assertOpenRepository(required(raw.root, 'tiinex.authoring.repository-required'));
  const parentPath = raw.parentPath ? safeRelativePath(raw.parentPath) : '';
  const title = required(raw.title, 'tiinex.authoring.title-required');
  const purpose = required(raw.purpose, 'tiinex.authoring.purpose-required');
  const from = required(raw.from, 'tiinex.authoring.from-required');
  const to = required(raw.to, 'tiinex.authoring.to-required');
  const fromKind = endpointKind(raw.fromKind);
  const toKind = endpointKind(raw.toKind);
  const fromReference = endpointReference(from, fromKind, raw.fromReference, 'tiinex.authoring.from-reference-required');
  const toReference = endpointReference(to, toKind, raw.toReference, 'tiinex.authoring.to-reference-required');
  const transferName = normalizedTransferName(raw.transferName);
  const description = required(raw.description, 'tiinex.authoring.transfer-description-required');
  const boundary = required(raw.boundary, 'tiinex.authoring.transfer-boundary-required');
  const signalMeaning = required(raw.signalMeaning, 'tiinex.authoring.signal-required');
  const doesNotMean = required(raw.doesNotMean, 'tiinex.authoring.limit-required');
  const mustNotClaim = required(raw.mustNotClaim, 'tiinex.authoring.claim-limit-required');
  const runtime = await prepareBundledRuntime(extensionPath, nodeExecutable());
  try {
    const plan = await projectHandoffAuthoringPlan(runtime, root, title, parentPath);
    if (plan.status !== 'ready' || !plan.path) throw new Error(`tiinex.authoring.path-blocked:${plan.findings?.map((f) => f.code).join(',') || plan.status}`);
    const target = safeTarget(root, safeRelativePath(plan.path));
    if (!await absent(target)) throw new Error(`tiinex.authoring.target-exists:${plan.path}`);
    const parentRecord = parentPath ? await projectAuthoringParent(runtime, safeTarget(root, parentPath)) : null;
    const values = {
      Purpose: purpose,
      From: from,
      'From Kind': fromKind,
      ...(fromReference ? { 'From Reference': fromReference } : {}),
      To: to,
      'To Kind': toKind,
      ...(toReference ? { 'To Reference': toReference } : {}),
      Transfers: [{ name: transferName, fields: { 'Transfer Kind': transferKind(raw.transferKind), Description: description, Boundary: boundary } }],
      'Required Context': 'none',
      'Reference Context': 'none',
      'Retained Responsibilities': 'none',
      'Exclusions And Dependencies': 'none',
      'Completion Expectation': { 'Signal Kind': 'return', 'Signal Meaning': signalMeaning, 'Return To': from, ...(fromReference ? { 'Return To Reference': fromReference } : {}) },
      'Interpretation Limits': { 'Does Not Mean': doesNotMean, 'Must Not Be Used To Claim': mustNotClaim }
    };
    const transition = parentRecord ? 'continue-from-record' : 'create-artifact';
    const created = requireArtifactCreationReady(await createHandoffDraft(runtime, root, plan.path, title, values, parentRecord, transition));
    const parentText = parentPath || '(root Handoff — no Parent)';
    const confirmed = await vscode.window.showWarningMessage(`Create exact shared-schema Handoff?\n\nParent: ${parentText}\nArtifact: ${plan.path}\n${from} → ${to}\nTransfer: ${transferName}\n\nEnvelope, validation and integrity are owned by shared Tiinex Tooling.`, { modal: true }, 'Prepare Return Handoff');
    if (confirmed !== 'Prepare Return Handoff') throw new Error('tiinex.authoring.cancelled');
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, String(created.draft.markdown), { encoding: 'utf8', flag: 'wx' });
    const document = await vscode.workspace.openTextDocument(target);
    await vscode.window.showTextDocument(document, { preview: false });
    return plan.path;
  } finally { await runtime.dispose(); }
}

export type SimpleHandoffIntent = 'discussion' | 'continue' | 'review' | 'blocked' | 'complete';

export interface SimpleHandoffEndpoint {
  label: string;
  kind: EndpointKind;
  reference?: string;
}

export interface SimpleHandoffParticipant {
  label: string;
  reference: string;
  workspaceId: string;
  path: string;
}

export interface SimpleHandoffDraftSpec {
  root: string;
  workspaceId: string;
  subject: string;
  intent: SimpleHandoffIntent;
  from: SimpleHandoffEndpoint;
  to: SimpleHandoffEndpoint;
  participants?: SimpleHandoffParticipant[];
  parentArtifact?: { path: string; markdown: string } | null;
}

export interface PreparedSimpleHandoffDraft {
  root: string;
  workspaceId: string;
  path: string;
  title: string;
  markdown: string;
  subject: string;
  intent: SimpleHandoffIntent;
  from: SimpleHandoffEndpoint;
  to: SimpleHandoffEndpoint;
  participants: SimpleHandoffParticipant[];
  parentPath: string;
}

export async function prepareSimpleHandoffDraft(extensionPath: string, spec: SimpleHandoffDraftSpec): Promise<PreparedSimpleHandoffDraft> {
  const root = await assertOpenRepository(required(spec.root, 'tiinex.authoring.repository-required'));
  const subject = required(spec.subject, 'tiinex.authoring.subject-required');
  const from = simpleEndpoint(spec.from, 'from');
  const to = simpleEndpoint(spec.to, 'to');
  const participants = [...(spec.participants || [])].filter((item) => item.reference && item.label);
  const title = simpleHandoffTitle(subject, spec.intent, from.label, to.label);
  const runtime = await prepareBundledRuntime(extensionPath, nodeExecutable());
  const scratch = await mkdtemp(path.join(os.tmpdir(), 'tiinex-vscode-handoff-preview-'));
  try {
    await copyMarkdownMaterial(root, scratch);
    const parentPath = spec.parentArtifact?.path ? safeRelativePath(spec.parentArtifact.path) : '';
    let parentRecord: any = null;
    if (parentPath && spec.parentArtifact) {
      const parentTarget = safeTarget(scratch, parentPath);
      await mkdir(path.dirname(parentTarget), { recursive: true });
      await writeFile(parentTarget, spec.parentArtifact.markdown, 'utf8');
      parentRecord = await projectAuthoringParent(runtime, parentTarget);
    }
    const plan = await projectHandoffAuthoringPlan(runtime, scratch, title, parentPath);
    if (plan.status !== 'ready' || !plan.path) throw new Error(`tiinex.authoring.path-blocked:${plan.findings?.map((f) => f.code).join(',') || plan.status}`);
    const values = simpleHandoffValues(subject, spec.intent, from, to, participants);
    const created = requireArtifactCreationReady(await createHandoffDraft(runtime, scratch, plan.path, title, values, parentRecord, parentRecord ? 'continue-from-record' : 'create-artifact'));
    return { root, workspaceId: spec.workspaceId, path: safeRelativePath(plan.path), title, markdown: String(created.draft.markdown), subject, intent: spec.intent, from, to, participants, parentPath };
  } finally {
    await rm(scratch, { recursive: true, force: true });
    await runtime.dispose();
  }
}

export async function writePreparedSimpleHandoffDraft(extensionPath: string, draft: PreparedSimpleHandoffDraft): Promise<string> {
  const root = await assertOpenRepository(draft.root);
  if (draft.parentPath) {
    const parentTarget = safeTarget(root, draft.parentPath);
    try { await access(parentTarget); }
    catch { throw new Error('tiinex.authoring.parent-not-landed-review-only'); }
  }
  const runtime = await prepareBundledRuntime(extensionPath, nodeExecutable());
  try {
    const plan = await projectHandoffAuthoringPlan(runtime, root, draft.title, draft.parentPath);
    if (plan.status !== 'ready' || safeRelativePath(plan.path) !== draft.path) throw new Error('tiinex.authoring.preview-stale-recreate-required');
  } finally { await runtime.dispose(); }
  const target = safeTarget(root, draft.path);
  if (!await absent(target)) throw new Error(`tiinex.authoring.target-exists:${draft.path}`);
  const confirmed = await vscode.window.showWarningMessage(`Write the reviewed Handoff draft?\n\n${draft.from.label} → ${draft.to.label}\n${draft.path}\n\nThe Markdown preview was generated by shared Tiinex Tooling; this action writes those exact reviewed bytes.`, { modal: true }, 'Write Handoff');
  if (confirmed !== 'Write Handoff') throw new Error('tiinex.authoring.cancelled');
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, draft.markdown, { encoding: 'utf8', flag: 'wx' });
  return target;
}

function simpleEndpoint(endpoint: SimpleHandoffEndpoint, side: 'from' | 'to'): SimpleHandoffEndpoint {
  const label = required(endpoint?.label || '', `tiinex.authoring.${side}-required`);
  const kind = endpointKind(endpoint?.kind || 'unknown');
  const reference = kind === 'unknown' ? '' : required(endpoint?.reference || '', `tiinex.authoring.${side}-reference-required`);
  if (reference && !/^[a-z0-9._-]+::[^\s]+$/i.test(reference)) throw new Error(`tiinex.authoring.${side}-reference-invalid`);
  return { label, kind, reference };
}

function simpleHandoffTitle(subject: string, intent: SimpleHandoffIntent, from: string, to: string): string {
  const label = ({ discussion: 'discussion', continue: 'continuation', review: 'review', blocked: 'blocked handoff', complete: 'completion return' } as const)[intent];
  return `${subject} — ${label} — ${from} to ${to}`;
}

function simpleHandoffValues(subject: string, intent: SimpleHandoffIntent, from: SimpleHandoffEndpoint, to: SimpleHandoffEndpoint, participants: SimpleHandoffParticipant[]): Record<string, unknown> {
  const purposeByIntent: Record<SimpleHandoffIntent, string> = {
    discussion: `Open a bounded discussion with ${to.label} about ${subject}.`,
    continue: `Continue the bounded work on ${subject} with ${to.label}.`,
    review: `Request a bounded review and disposition from ${to.label} for ${subject}.`,
    blocked: `Transfer the blocked ${subject} work to ${to.label} for bounded disposition or continuation.`,
    complete: `Return the completed ${subject} work to ${to.label} for bounded acknowledgement or next disposition.`
  };
  const descriptionByIntent: Record<SimpleHandoffIntent, string> = {
    discussion: `Discuss ${subject} and return a bounded disposition or response.`,
    continue: `Continue the bounded work described by ${subject}.`,
    review: `Review ${subject} and return a bounded disposition.`,
    blocked: `Resolve or route the blocker affecting ${subject}.`,
    complete: `Review the completed ${subject} work and decide the next bounded action.`
  };
  const signalByIntent: Record<SimpleHandoffIntent, { kind: string; meaning: string }> = {
    discussion: { kind: 'disposition', meaning: `Return a bounded response or disposition about ${subject}.` },
    continue: { kind: 'return', meaning: `Return the bounded continuation result for ${subject} when the transferred slice reaches its next checkpoint.` },
    review: { kind: 'disposition', meaning: `Return the review disposition for ${subject}.` },
    blocked: { kind: 'disposition', meaning: `Return a disposition that resolves, reroutes, or explicitly preserves the blocker for ${subject}.` },
    complete: { kind: 'acknowledgement', meaning: `Acknowledge or disposition the completed ${subject} return.` }
  };
  const participantNote = participants.length
    ? `Additional participant Role context requested for carrier grounding: ${participants.map((item) => `[${item.label}](${item.reference})`).join('; ')}. Package-local participant Role pointers are grounding aids only and do not create transfer, holder, acceptance, or authority semantics.`
    : '';
  const fromReference = endpointReference(from.label, from.kind, from.reference || '', 'tiinex.authoring.from-reference-required');
  const toReference = endpointReference(to.label, to.kind, to.reference || '', 'tiinex.authoring.to-reference-required');
  return {
    Purpose: purposeByIntent[intent],
    From: from.label,
    'From Kind': from.kind,
    ...(fromReference ? { 'From Reference': fromReference } : {}),
    To: to.label,
    'To Kind': to.kind,
    ...(toReference ? { 'To Reference': toReference } : {}),
    ...(participantNote ? { Notes: participantNote } : {}),
    Transfers: [{
      name: normalizedTransferName(subject),
      fields: {
        'Transfer Kind': 'work',
        Description: descriptionByIntent[intent],
        Boundary: `This Handoff transfers only the bounded work described above. It does not infer broader responsibility, recipient acceptance, completion, or transport authority.`
      }
    }],
    'Required Context': 'none',
    'Reference Context': 'none',
    'Retained Responsibilities': 'none',
    'Exclusions And Dependencies': 'none',
    'Completion Expectation': {
      'Signal Kind': signalByIntent[intent].kind,
      'Signal Meaning': signalByIntent[intent].meaning,
      'Return To': from.label,
      ...(fromReference ? { 'Return To Reference': fromReference } : {})
    },
    'Interpretation Limits': {
      'Does Not Mean': 'The recipient accepted the transfer, the work is complete, package transport succeeded, or any additional participant holds authority merely because this Handoff names or carries their Role context.',
      'Must Not Be Used To Claim': 'Delegation authority, acceptance, completion, publication, transport delivery, permanent Role assignment, or responsibility outside the explicit bounded transfer.'
    }
  };
}

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
