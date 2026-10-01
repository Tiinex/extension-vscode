import { spawn } from 'node:child_process';
import path from 'node:path';
import * as vscode from 'vscode';

export interface NativeRevealCommand { command: string; args: string[] }

export function nativeFileRevealCommand(target: string, platform: NodeJS.Platform = process.platform): NativeRevealCommand | null {
  const resolved = path.resolve(target);
  if (platform === 'win32') return { command: 'explorer.exe', args: [`/select,${resolved}`] };
  if (platform === 'darwin') return { command: 'open', args: ['-R', resolved] };
  return null;
}

export async function revealFileInNativeFolder(target: string): Promise<void> {
  const resolved = path.resolve(target);
  const native = nativeFileRevealCommand(resolved);
  if (!native) {
    await vscode.commands.executeCommand('revealFileInOS', vscode.Uri.file(resolved));
    return;
  }
  await launchDetached(native.command, native.args);
}

async function launchDetached(command: string, args: string[]): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const child = spawn(command, args, {
      detached: true,
      windowsHide: false,
      shell: false,
      stdio: 'ignore'
    });
    child.once('error', reject);
    child.once('spawn', () => {
      child.unref();
      resolve();
    });
  });
}
