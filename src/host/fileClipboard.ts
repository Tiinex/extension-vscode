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
  const raw = String(filePath || '').trim();
  if (!raw) return { state: 'failed', detail: 'tiinex.transport.package-path-required' };
  if (platform !== 'win32') return { state: 'unsupported', detail: `file clipboard is not implemented for ${platform}` };
  const target = path.win32.resolve(raw);

  // Explorer-style file copies expose more than a bare FileDrop list. Keep the
  // real file-system path as CF_HDROP, add the Unicode filename and explicit
  // copy drop-effect formats, then persist the IDataObject after PowerShell
  // exits. The file-drop round trip proves the basename we actually published
  // before this function is allowed to report success.
  const script = [
    'Add-Type -AssemblyName System.Windows.Forms',
    `$target = ${powershellSingleQuoted(target)}`,
    '$files = New-Object System.Collections.Specialized.StringCollection',
    '$files.Add($target) | Out-Null',
    '$data = New-Object System.Windows.Forms.DataObject',
    '$data.SetFileDropList($files)',
    '$dropEffect = New-Object System.IO.MemoryStream',
    '$dropEffectBytes = [System.BitConverter]::GetBytes([int][System.Windows.Forms.DragDropEffects]::Copy)',
    '$dropEffect.Write($dropEffectBytes, 0, $dropEffectBytes.Length)',
    '$dropEffect.Position = 0',
    '$data.SetData("Preferred DropEffect", $false, $dropEffect)',
    '$fileName = New-Object System.IO.MemoryStream',
    '$fileNameBytes = [System.Text.Encoding]::Unicode.GetBytes($target + [char]0)',
    '$fileName.Write($fileNameBytes, 0, $fileNameBytes.Length)',
    '$fileName.Position = 0',
    '$data.SetData("FileNameW", $false, $fileName)',
    '[System.Windows.Forms.Clipboard]::SetDataObject($data, $true)',
    '$roundTrip = [System.Windows.Forms.Clipboard]::GetFileDropList()',
    'if ($roundTrip.Count -ne 1) { throw "tiinex.transport.clipboard-file-count-mismatch" }',
    '$expectedName = [System.IO.Path]::GetFileName($target)',
    '$actualName = [System.IO.Path]::GetFileName($roundTrip[0])',
    'if (-not [System.StringComparer]::Ordinal.Equals($expectedName, $actualName)) { throw "tiinex.transport.clipboard-basename-mismatch" }',
    '$clipboardData = [System.Windows.Forms.Clipboard]::GetDataObject()',
    'if (-not $clipboardData.GetDataPresent("Preferred DropEffect")) { throw "tiinex.transport.clipboard-drop-effect-missing" }',
    'if (-not $clipboardData.GetDataPresent("FileNameW")) { throw "tiinex.transport.clipboard-filename-format-missing" }',
    '$dropEffect.Dispose()',
    '$fileName.Dispose()'
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
