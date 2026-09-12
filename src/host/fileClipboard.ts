import path from 'node:path';
import { ProcessRunner, runProcess } from './process';

export type FileClipboardState = 'copied' | 'unsupported' | 'failed';
export interface FileClipboardResult { state: FileClipboardState; detail?: string }

/**
 * Put one file on the real OS file-drop clipboard when the host has a safe,
 * deterministic implementation. Text-path clipboard writes are deliberately
 * not reported as file-copy success.
 */
export async function copyFileToClipboard(
  filePath: string,
  platform: NodeJS.Platform = process.platform,
  runner: ProcessRunner = runProcess
): Promise<FileClipboardResult> {
  const target = path.resolve(String(filePath || '').trim());
  if (!filePath) return { state: 'failed', detail: 'tiinex.transport.package-path-required' };
  if (platform !== 'win32') return { state: 'unsupported', detail: `file clipboard is not implemented for ${platform}` };

  const script = [
    'Add-Type -AssemblyName System.Windows.Forms',
    '$files = New-Object System.Collections.Specialized.StringCollection',
    `$files.Add(${powershellSingleQuoted(target)}) | Out-Null`,
    '[System.Windows.Forms.Clipboard]::SetFileDropList($files)'
  ].join('; ');
  const encoded = Buffer.from(script, 'utf16le').toString('base64');
  try {
    const result = await runner('powershell.exe', ['-NoProfile', '-NonInteractive', '-STA', '-EncodedCommand', encoded]);
    return result.code === 0
      ? { state: 'copied' }
      : { state: 'failed', detail: result.stderr.trim() || result.stdout.trim() || `exit ${result.code}` };
  } catch (error) {
    return { state: 'failed', detail: error instanceof Error ? error.message : String(error) };
  }
}

function powershellSingleQuoted(value: string): string {
  return `'${String(value || '').replace(/'/g, "''")}'`;
}
