import path from 'node:path';
import { ProcessRunner, runProcess } from './process';

export type FileClipboardState = 'copied' | 'unsupported' | 'failed';
export interface FileClipboardResult { state: FileClipboardState; detail?: string }

/**
 * Put one file on the real OS file clipboard when the host has a safe,
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

  // Explorer publishes a real Shell data object, not only a synthetic FileDrop
  // list. Use the same Shell/OLE seam so consumers that reconstruct pasted
  // files from Shell identity retain the filesystem object's real basename.
  const helperSource = String.raw`
using System;
using System.IO;
using System.Runtime.InteropServices;
using System.Text;
using System.Windows.Forms;

public static class TiinexShellClipboard {
  private const uint CF_HDROP = 15;
  private static readonly Guid IID_IDataObject = new Guid("0000010e-0000-0000-C000-000000000046");

  [DllImport("shell32.dll", CharSet = CharSet.Unicode)]
  private static extern int SHParseDisplayName(string name, IntPtr bindingContext, out IntPtr pidl, uint attributesIn, out uint attributesOut);

  [DllImport("shell32.dll", ExactSpelling = true)]
  private static extern IntPtr ILFindLastID(IntPtr pidl);

  [DllImport("shell32.dll", ExactSpelling = true)]
  private static extern int SHCreateDataObject(IntPtr pidlFolder, uint childCount, [In] IntPtr[] childPidls, IntPtr innerDataObject, ref Guid iid, out IntPtr dataObject);

  [DllImport("ole32.dll", ExactSpelling = true)]
  private static extern int OleInitialize(IntPtr reserved);

  [DllImport("ole32.dll", ExactSpelling = true)]
  private static extern void OleUninitialize();

  [DllImport("ole32.dll", ExactSpelling = true)]
  private static extern int OleSetClipboard(IntPtr dataObject);

  [DllImport("ole32.dll", ExactSpelling = true)]
  private static extern int OleFlushClipboard();

  [DllImport("user32.dll", CharSet = CharSet.Unicode)]
  private static extern uint RegisterClipboardFormat(string format);

  [DllImport("user32.dll", ExactSpelling = true)]
  [return: MarshalAs(UnmanagedType.Bool)]
  private static extern bool IsClipboardFormatAvailable(uint format);

  [DllImport("user32.dll", ExactSpelling = true, SetLastError = true)]
  [return: MarshalAs(UnmanagedType.Bool)]
  private static extern bool OpenClipboard(IntPtr newOwner);

  [DllImport("user32.dll", ExactSpelling = true)]
  [return: MarshalAs(UnmanagedType.Bool)]
  private static extern bool CloseClipboard();

  [DllImport("user32.dll", ExactSpelling = true)]
  private static extern IntPtr GetClipboardData(uint format);

  [DllImport("shell32.dll", CharSet = CharSet.Unicode)]
  private static extern uint DragQueryFile(IntPtr hDrop, uint index, StringBuilder fileName, uint capacity);

  private static void RequireHr(int hr, string code) {
    if (hr < 0) throw new InvalidOperationException(code + ":0x" + hr.ToString("X8"));
  }

  private static string DropFileName() {
    IntPtr hDrop = GetClipboardData(CF_HDROP);
    if (hDrop == IntPtr.Zero) throw new InvalidOperationException("tiinex.transport.clipboard-cf-hdrop-missing");
    uint count = DragQueryFile(hDrop, 0xFFFFFFFF, null, 0);
    if (count != 1) throw new InvalidOperationException("tiinex.transport.clipboard-file-count-mismatch:" + count);
    uint length = DragQueryFile(hDrop, 0, null, 0);
    var buffer = new StringBuilder(checked((int)length + 1));
    if (DragQueryFile(hDrop, 0, buffer, checked((uint)buffer.Capacity)) == 0)
      throw new InvalidOperationException("tiinex.transport.clipboard-file-query-failed");
    return Path.GetFileName(buffer.ToString());
  }

  public static void CopyFile(string target) {
    string fullTarget = Path.GetFullPath(target);
    string parentPath = Path.GetDirectoryName(fullTarget);
    if (String.IsNullOrEmpty(parentPath)) throw new InvalidOperationException("tiinex.transport.clipboard-parent-missing");

    int ole = OleInitialize(IntPtr.Zero);
    bool uninitialize = ole >= 0;
    IntPtr fullPidl = IntPtr.Zero;
    IntPtr parentPidl = IntPtr.Zero;
    IntPtr innerInterface = IntPtr.Zero;
    IntPtr shellDataObject = IntPtr.Zero;
    MemoryStream dropEffect = null;

    try {
      uint attributes;
      RequireHr(SHParseDisplayName(fullTarget, IntPtr.Zero, out fullPidl, 0, out attributes), "tiinex.transport.clipboard-target-pidl-failed");
      RequireHr(SHParseDisplayName(parentPath, IntPtr.Zero, out parentPidl, 0, out attributes), "tiinex.transport.clipboard-parent-pidl-failed");
      IntPtr childPidl = ILFindLastID(fullPidl);
      if (childPidl == IntPtr.Zero) throw new InvalidOperationException("tiinex.transport.clipboard-child-pidl-missing");

      var inner = new DataObject();
      dropEffect = new MemoryStream(BitConverter.GetBytes((int)DragDropEffects.Copy), false);
      inner.SetData("Preferred DropEffect", false, dropEffect);

      IntPtr unknown = Marshal.GetIUnknownForObject(inner);
      try {
        Guid iid = IID_IDataObject;
        RequireHr(Marshal.QueryInterface(unknown, ref iid, out innerInterface), "tiinex.transport.clipboard-inner-i-data-object-failed");
      } finally {
        Marshal.Release(unknown);
      }

      Guid dataObjectIid = IID_IDataObject;
      RequireHr(SHCreateDataObject(parentPidl, 1, new [] { childPidl }, innerInterface, ref dataObjectIid, out shellDataObject), "tiinex.transport.clipboard-shell-data-object-failed");
      RequireHr(OleSetClipboard(shellDataObject), "tiinex.transport.clipboard-set-failed");
      RequireHr(OleFlushClipboard(), "tiinex.transport.clipboard-flush-failed");

      if (!OpenClipboard(IntPtr.Zero))
        throw new InvalidOperationException("tiinex.transport.clipboard-open-failed:" + Marshal.GetLastWin32Error());
      try {
        string expectedName = Path.GetFileName(fullTarget);
        string actualName = DropFileName();
        if (!StringComparer.Ordinal.Equals(expectedName, actualName))
          throw new InvalidOperationException("tiinex.transport.clipboard-basename-mismatch:" + actualName);

        uint shellIdList = RegisterClipboardFormat("Shell IDList Array");
        if (shellIdList == 0 || !IsClipboardFormatAvailable(shellIdList))
          throw new InvalidOperationException("tiinex.transport.clipboard-shell-id-list-missing");

        uint preferredDropEffect = RegisterClipboardFormat("Preferred DropEffect");
        if (preferredDropEffect == 0 || !IsClipboardFormatAvailable(preferredDropEffect))
          throw new InvalidOperationException("tiinex.transport.clipboard-drop-effect-missing");
      } finally {
        CloseClipboard();
      }
    } finally {
      if (shellDataObject != IntPtr.Zero) Marshal.Release(shellDataObject);
      if (innerInterface != IntPtr.Zero) Marshal.Release(innerInterface);
      if (fullPidl != IntPtr.Zero) Marshal.FreeCoTaskMem(fullPidl);
      if (parentPidl != IntPtr.Zero) Marshal.FreeCoTaskMem(parentPidl);
      if (dropEffect != null) dropEffect.Dispose();
      if (uninitialize) OleUninitialize();
    }
  }
}
`;

  const script = [
    'Add-Type -AssemblyName System.Windows.Forms',
    '$source = @\'',
    helperSource,
    '\'@',
    'Add-Type -TypeDefinition $source -ReferencedAssemblies System.Windows.Forms',
    `$target = ${powershellSingleQuoted(target)}`,
    '[TiinexShellClipboard]::CopyFile($target)'
  ].join('\n');
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
