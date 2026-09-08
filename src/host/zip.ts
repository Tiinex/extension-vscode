import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { inflateRawSync } from 'node:zlib';
import { safeRelativePath, safeTarget } from '../core/paths';

const MAX_ENTRY_BYTES = 128 * 1024 * 1024;
const MAX_TOTAL_BYTES = 512 * 1024 * 1024;
const MAX_ENTRIES = 100_000;
const EOCD_SIG = 0x06054b50;
const CENTRAL_SIG = 0x02014b50;
const LOCAL_SIG = 0x04034b50;

export interface ZipEntryInfo { path: string; bytes: number; directory: boolean }
interface CentralEntry extends ZipEntryInfo {
  compressedBytes: number;
  compression: number;
  crc32: number;
  flags: number;
  localOffset: number;
  externalAttributes: number;
  rawName: string;
}

export async function readExactZipEntryFromFile(zipPath: string, entryName: string): Promise<Buffer> {
  return readExactZipEntryFromBuffer(await readFile(zipPath), entryName);
}

export async function readExactZipEntryFromBuffer(buffer: Buffer, entryName: string): Promise<Buffer> {
  const expected = safeRelativePath(entryName);
  const matches = parseCentralDirectory(buffer).filter((entry) => entry.path === expected);
  if (!matches.length) throw new Error(`tiinex.zip.entry-missing:${expected}`);
  if (matches.length !== 1) throw new Error(`tiinex.zip.entry-ambiguous:${expected}`);
  if (matches[0].directory || isSymlink(matches[0])) throw new Error(`tiinex.zip.entry-invalid:${expected}`);
  return extractEntry(buffer, matches[0]);
}

export async function inspectZipBuffer(buffer: Buffer): Promise<ZipEntryInfo[]> {
  return parseCentralDirectory(buffer).map(({ path: entryPath, bytes, directory }) => ({ path: entryPath, bytes, directory }));
}

export async function extractZipBuffer(buffer: Buffer, outputDir: string): Promise<ZipEntryInfo[]> {
  const entries = parseCentralDirectory(buffer);
  await mkdir(outputDir, { recursive: true });
  for (const entry of entries) {
    if (isSymlink(entry)) throw new Error(`tiinex.zip.symlink-unsupported:${entry.rawName}`);
    const target = safeTarget(outputDir, entry.path);
    if (entry.directory) await mkdir(target, { recursive: true });
    else {
      const data = extractEntry(buffer, entry);
      await mkdir(path.dirname(target), { recursive: true });
      await writeFile(target, data);
    }
  }
  return entries.map(({ path: entryPath, bytes, directory }) => ({ path: entryPath, bytes, directory }));
}

export function sha256Hex(data: Buffer): string { return createHash('sha256').update(data).digest('hex'); }

function parseCentralDirectory(buffer: Buffer): CentralEntry[] {
  const eocd = findEocd(buffer);
  const disk = buffer.readUInt16LE(eocd + 4);
  const centralDisk = buffer.readUInt16LE(eocd + 6);
  const diskEntries = buffer.readUInt16LE(eocd + 8);
  const entryCount = buffer.readUInt16LE(eocd + 10);
  const centralBytes = buffer.readUInt32LE(eocd + 12);
  const centralOffset = buffer.readUInt32LE(eocd + 16);
  if (disk !== 0 || centralDisk !== 0 || diskEntries !== entryCount) throw new Error('tiinex.zip.multidisk-unsupported');
  if (entryCount === 0xffff || centralBytes === 0xffffffff || centralOffset === 0xffffffff) throw new Error('tiinex.zip.zip64-unsupported');
  if (entryCount > MAX_ENTRIES) throw new Error('tiinex.zip.entry-limit');
  if (centralOffset + centralBytes > eocd) throw new Error('tiinex.zip.central-directory-invalid');
  const entries: CentralEntry[] = [];
  const seen = new Set<string>();
  let cursor = centralOffset;
  let total = 0;
  for (let index = 0; index < entryCount; index += 1) {
    requireRange(buffer, cursor, 46);
    if (buffer.readUInt32LE(cursor) !== CENTRAL_SIG) throw new Error('tiinex.zip.central-entry-invalid');
    const flags = buffer.readUInt16LE(cursor + 8);
    const compression = buffer.readUInt16LE(cursor + 10);
    const crc32 = buffer.readUInt32LE(cursor + 16);
    const compressedBytes = buffer.readUInt32LE(cursor + 20);
    const bytes = buffer.readUInt32LE(cursor + 24);
    const nameBytes = buffer.readUInt16LE(cursor + 28);
    const extraBytes = buffer.readUInt16LE(cursor + 30);
    const commentBytes = buffer.readUInt16LE(cursor + 32);
    const externalAttributes = buffer.readUInt32LE(cursor + 38);
    const localOffset = buffer.readUInt32LE(cursor + 42);
    requireRange(buffer, cursor + 46, nameBytes + extraBytes + commentBytes);
    const rawName = buffer.subarray(cursor + 46, cursor + 46 + nameBytes).toString('utf8').replace(/\\/g, '/');
    if (!rawName) throw new Error('tiinex.zip.empty-entry-name');
    const directory = rawName.endsWith('/');
    const trimmed = rawName.replace(/\/+$/, '');
    if (!trimmed && directory) throw new Error('tiinex.zip.root-entry-unsupported');
    const entryPath = safeRelativePath(trimmed || rawName);
    if (seen.has(entryPath)) throw new Error(`tiinex.zip.duplicate-path:${entryPath}`);
    seen.add(entryPath);
    if ((flags & 0x1) !== 0) throw new Error(`tiinex.zip.encryption-unsupported:${entryPath}`);
    if (![0, 8].includes(compression)) throw new Error(`tiinex.zip.compression-unsupported:${entryPath}:${compression}`);
    if (!directory) {
      if (bytes > MAX_ENTRY_BYTES) throw new Error(`tiinex.zip.entry-too-large:${entryPath}`);
      total += bytes;
      if (total > MAX_TOTAL_BYTES) throw new Error('tiinex.zip.total-size-limit');
    }
    entries.push({ path: entryPath, bytes, directory, compressedBytes, compression, crc32, flags, localOffset, externalAttributes, rawName });
    cursor += 46 + nameBytes + extraBytes + commentBytes;
  }
  if (cursor !== centralOffset + centralBytes) throw new Error('tiinex.zip.central-directory-size-mismatch');
  return entries;
}

function extractEntry(buffer: Buffer, entry: CentralEntry): Buffer {
  requireRange(buffer, entry.localOffset, 30);
  if (buffer.readUInt32LE(entry.localOffset) !== LOCAL_SIG) throw new Error(`tiinex.zip.local-entry-invalid:${entry.path}`);
  const nameBytes = buffer.readUInt16LE(entry.localOffset + 26);
  const extraBytes = buffer.readUInt16LE(entry.localOffset + 28);
  const dataOffset = entry.localOffset + 30 + nameBytes + extraBytes;
  requireRange(buffer, dataOffset, entry.compressedBytes);
  const compressed = buffer.subarray(dataOffset, dataOffset + entry.compressedBytes);
  const data = entry.compression === 0 ? Buffer.from(compressed) : inflateRawSync(compressed, { maxOutputLength: MAX_ENTRY_BYTES });
  if (data.byteLength !== entry.bytes) throw new Error(`tiinex.zip.entry-size-mismatch:${entry.path}`);
  if (crc32(data) !== entry.crc32) throw new Error(`tiinex.zip.entry-crc-mismatch:${entry.path}`);
  return data;
}

function findEocd(buffer: Buffer): number {
  const minimum = 22;
  if (buffer.byteLength < minimum) throw new Error('tiinex.zip.too-small');
  const floor = Math.max(0, buffer.byteLength - minimum - 0xffff);
  for (let offset = buffer.byteLength - minimum; offset >= floor; offset -= 1) {
    if (buffer.readUInt32LE(offset) !== EOCD_SIG) continue;
    const commentBytes = buffer.readUInt16LE(offset + 20);
    if (offset + minimum + commentBytes === buffer.byteLength) return offset;
  }
  throw new Error('tiinex.zip.eocd-missing');
}

function requireRange(buffer: Buffer, offset: number, bytes: number): void {
  if (!Number.isSafeInteger(offset) || !Number.isSafeInteger(bytes) || offset < 0 || bytes < 0 || offset + bytes > buffer.byteLength) throw new Error('tiinex.zip.bounds-invalid');
}

function isSymlink(entry: CentralEntry): boolean {
  const mode = (entry.externalAttributes >>> 16) & 0xffff;
  return (mode & 0o170000) === 0o120000;
}

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) c = (c & 1) ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();
function crc32(data: Buffer): number {
  let crc = 0xffffffff;
  for (const byte of data) crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}
