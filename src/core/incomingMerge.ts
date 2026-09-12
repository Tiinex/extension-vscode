export type IncomingMergeConflictKind = 'text' | 'binary';

export interface IncomingMergeConflictClassification {
  kind: IncomingMergeConflictKind;
  localBytes: number;
  incomingBytes: number;
}

function validUtf8(bytes: Buffer): boolean {
  if (!bytes.length) return true;
  const decoded = bytes.toString('utf8');
  return Buffer.from(decoded, 'utf8').equals(bytes);
}

/**
 * Conservative byte-only text qualification for conflict materialization.
 * Invalid UTF-8, NUL, DEL, and non-whitespace C0 control bytes fail closed as
 * binary/non-text. No filename or schema semantics participate in this choice.
 */
export function mergeConflictIsText(bytes: Buffer): boolean {
  if (!validUtf8(bytes)) return false;
  for (const byte of bytes) {
    if (byte === 0 || byte === 0x7f) return false;
    if (byte < 0x20 && byte !== 0x09 && byte !== 0x0a && byte !== 0x0d && byte !== 0x0c) return false;
  }
  return true;
}

export function classifyIncomingMergeConflict(local: Buffer, incoming: Buffer): IncomingMergeConflictClassification {
  return {
    kind: mergeConflictIsText(local) && mergeConflictIsText(incoming) ? 'text' : 'binary',
    localBytes: local.byteLength,
    incomingBytes: incoming.byteLength
  };
}

function lineTerminated(value: string): string {
  return value.endsWith('\n') ? value : `${value}\n`;
}

/**
 * Render ordinary two-way conflict material without pretending that a common
 * base exists. Both exact text sides remain visible and editable in the working
 * tree; Git index stages retain the source blobs separately.
 */
export function renderIncomingTextConflict(
  local: Buffer,
  incoming: Buffer,
  localLabel = 'LOCAL',
  incomingLabel = 'INCOMING'
): Buffer {
  if (!mergeConflictIsText(local) || !mergeConflictIsText(incoming)) throw new Error('tiinex.incoming-merge.text-conflict-nontext');
  const rendered = [
    `<<<<<<< ${localLabel}\n`,
    lineTerminated(local.toString('utf8')),
    '=======\n',
    lineTerminated(incoming.toString('utf8')),
    `>>>>>>> ${incomingLabel}\n`
  ].join('');
  return Buffer.from(rendered, 'utf8');
}

export interface IncomingFileUnionPlanInput {
  localFiles: string[];
  localDirectories: string[];
  localSymlinks: string[];
  incomingFiles: string[];
  ignoredPaths?: string[];
  exactOverlapPaths?: string[];
}

export interface IncomingFileUnionPlan {
  writes: string[];
  conflicts: string[];
  blockedConflicts: string[];
}

function normalizedPath(value: string): string {
  return String(value || '').replace(/\\/g, '/').replace(/^\.\//, '').replace(/^\/+|\/+$/g, '');
}

function pathsOverlap(leftValue: string, rightValue: string): boolean {
  const left = normalizedPath(leftValue);
  const right = normalizedPath(rightValue);
  return Boolean(left && right) && (left === right || left.startsWith(`${right}/`) || right.startsWith(`${left}/`));
}

/**
 * Byte-state union planner. Local-only paths are intentionally absent from every
 * result bucket: Merge preserves them. A common regular-file path is a conflict
 * unless its exact bytes were proven equal by the caller.
 */
export function planIncomingFileUnion(input: IncomingFileUnionPlanInput): IncomingFileUnionPlan {
  const localFiles = [...new Set(input.localFiles.map(normalizedPath).filter(Boolean))];
  const localDirectories = new Set(input.localDirectories.map(normalizedPath).filter(Boolean));
  const localSymlinks = [...new Set(input.localSymlinks.map(normalizedPath).filter(Boolean))];
  const incomingFiles = [...new Set(input.incomingFiles.map(normalizedPath).filter(Boolean))];
  const ignored = new Set((input.ignoredPaths || []).map(normalizedPath).filter(Boolean));
  const exact = new Set((input.exactOverlapPaths || []).map(normalizedPath).filter(Boolean));
  const localFileSet = new Set(localFiles);
  const writes: string[] = [];
  const conflicts: string[] = [];
  const blockedConflicts: string[] = [];

  for (const relative of incomingFiles) {
    if (ignored.has(relative)) continue;
    if (localSymlinks.some((item) => pathsOverlap(item, relative))) { blockedConflicts.push(relative); continue; }
    if (localDirectories.has(relative) || localFiles.some((item) => relative.startsWith(`${item}/`))) { blockedConflicts.push(relative); continue; }
    if (!localFileSet.has(relative)) { writes.push(relative); continue; }
    if (!exact.has(relative)) conflicts.push(relative);
  }

  return {
    writes: [...new Set(writes)].sort(),
    conflicts: [...new Set(conflicts)].sort(),
    blockedConflicts: [...new Set(blockedConflicts)].sort()
  };
}
