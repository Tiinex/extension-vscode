import { spawn } from 'node:child_process';

export interface ProcessResult { code: number; stdout: string; stderr: string }
export interface ProcessOptions { cwd?: string; env?: NodeJS.ProcessEnv }
export type ProcessRunner = (command: string, args: string[], options?: ProcessOptions) => Promise<ProcessResult>;

export const runProcess: ProcessRunner = async (command, args, options = {}) => new Promise((resolve, reject) => {
  const child = spawn(command, args, {
    cwd: options.cwd,
    env: options.env ?? process.env,
    windowsHide: true,
    shell: false,
    stdio: ['ignore', 'pipe', 'pipe']
  });
  const stdout: Buffer[] = [];
  const stderr: Buffer[] = [];
  child.stdout.on('data', (chunk: Buffer) => stdout.push(chunk));
  child.stderr.on('data', (chunk: Buffer) => stderr.push(chunk));
  child.on('error', reject);
  child.on('close', (code) => resolve({
    code: Number(code ?? 1),
    stdout: Buffer.concat(stdout).toString('utf8'),
    stderr: Buffer.concat(stderr).toString('utf8')
  }));
});

export async function runChecked(command: string, args: string[], options: ProcessOptions = {}, runner: ProcessRunner = runProcess): Promise<ProcessResult> {
  const result = await runner(command, args, options);
  if (result.code !== 0) throw new Error(`tiinex.process.failed:${command}:${args.join(' ')}:${result.stderr.trim() || result.stdout.trim() || result.code}`);
  return result;
}

export function nodeProcessEnvironment(base: NodeJS.ProcessEnv = process.env): NodeJS.ProcessEnv {
  return { ...base, ELECTRON_RUN_AS_NODE: '1' };
}
