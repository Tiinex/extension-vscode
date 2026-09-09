import path from 'node:path';
import { access, mkdir, writeFile } from 'node:fs/promises';
import * as vscode from 'vscode';
import { createHandoffDraft, prepareBundledRuntime, projectAuthoringParent, projectHandoffAuthoringPlan } from './tiinex/bootstrap';
import { normalizedTransferName } from './core/operatorModel';
import { safeRelativePath, safeTarget } from './core/paths';
import { relativeRepositoryPath, sameRepositoryRoot } from './core/repositoryPath';
import { repositoryRootForResource, repositoryRoots } from './vscode/gitApi';

export type EndpointKind = 'role' | 'party' | 'unknown';
export type TransferKind = 'work' | 'responsibility' | 'work-and-responsibility';

export interface AuthoringParentContext {
  root: string;
  parentPath: string;
  label: string;
  schemaId: string;
}

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

function nodeExecutable(): string { return vscode.workspace.getConfiguration('tiinex').get('nodePath', '').toString().trim() || process.execPath; }
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
    const created = await createHandoffDraft(runtime, root, plan.path, title, values, parentRecord, transition);
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
