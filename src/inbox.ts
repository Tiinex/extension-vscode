import os from 'node:os';
import path from 'node:path';
import { mkdir } from 'node:fs/promises';
import { FSWatcher, watch } from 'node:fs';
import * as vscode from 'vscode';
import { isDiscoverySessionEvent, isHandoffPackagePath, waitForStableFile } from './core/stableFile';

export type HandoffInboxState =
  | 'disabled'
  | 'watching'
  | 'candidate-found'
  | 'candidate-invalid'
  | 'landing-awaiting-confirmation'
  | 'landed'
  | 'ignored'
  | 'blocked';

export interface HandoffInboxSnapshot {
  state: HandoffInboxState;
  directory: string;
  candidatePath: string;
  detail: string;
}


export function configuredInboxPath(): string {
  const configured = vscode.workspace.getConfiguration('tiinex').get('handoffInbox.path', '').toString().trim();
  return configured ? path.resolve(configured) : path.join(os.homedir(), 'Downloads', 'Tiinex Inbox');
}

export class HandoffInboxWatcher implements vscode.Disposable {
  private watcher: FSWatcher | null = null;
  private timers = new Map<string, NodeJS.Timeout>();
  private generation = 0;
  private sessionStartedAtMs = 0;
  private readonly seen = new Set<string>();
  private readonly pending: string[] = [];
  private draining = false;
  private readonly changed = new vscode.EventEmitter<HandoffInboxSnapshot>();
  readonly onDidChangeState = this.changed.event;
  private snapshot: HandoffInboxSnapshot = { state: 'disabled', directory: configuredInboxPath(), candidatePath: '', detail: 'Handoff discovery has not started.' };

  constructor(private readonly onPackage: (filePath: string) => Promise<void>) {}

  currentState(): HandoffInboxSnapshot { return { ...this.snapshot }; }

  private setState(state: HandoffInboxState, detail: string, candidatePath = '', directory = configuredInboxPath()): void {
    this.snapshot = { state, directory, candidatePath, detail };
    this.changed.fire(this.currentState());
  }

  async restart(): Promise<void> {
    this.stop(false);
    const directory = configuredInboxPath();
    if (vscode.workspace.getConfiguration('tiinex').get('handoff.discovery', 'manual') !== 'auto') {
      this.setState('disabled', 'Automatic Handoff discovery is disabled. Choose an inbox and enable Auto discovery when you want VS Code to watch it.', '', directory);
      return;
    }
    await mkdir(directory, { recursive: true });
    const generation = ++this.generation;
    const sessionStartedAtMs = Date.now();
    this.sessionStartedAtMs = sessionStartedAtMs;
    this.seen.clear();
    this.pending.length = 0;
    this.watcher = watch(directory, { persistent: false }, (_event, filename) => {
      if (!filename || !isHandoffPackagePath(filename.toString())) return;
      const observedAtMs = Date.now();
      const filePath = path.join(directory, filename.toString());
      const prior = this.timers.get(filePath);
      if (prior) clearTimeout(prior);
      this.timers.set(filePath, setTimeout(() => {
        this.timers.delete(filePath);
        this.queueCandidate(filePath, generation, observedAtMs);
      }, 600));
    });
    this.watcher.on('error', (error) => {
      if (generation !== this.generation) return;
      this.setState('blocked', `Inbox watcher blocked: ${message(error)}`, '', directory);
      void vscode.window.showErrorMessage(`Tiinex inbox watcher failed: ${message(error)}`);
    });
    this.setState('watching', 'Watching only for stable completed .handoff-package.zip carriers observed from this discovery session onward. Historical inbox carriers are not surfaced automatically; use Tiinex: Receive Handoff Package to inspect one manually.', '', directory);
  }

  stop(emit = true): void {
    this.generation += 1;
    this.watcher?.close();
    this.watcher = null;
    for (const timer of this.timers.values()) clearTimeout(timer);
    this.timers.clear();
    this.pending.length = 0;
    this.seen.clear();
    this.sessionStartedAtMs = 0;
    if (emit) this.setState('disabled', 'Automatic Handoff discovery is stopped.');
  }

  dispose(): void {
    this.stop(false);
    this.changed.dispose();
  }

  private queueCandidate(filePath: string, generation: number, observedAtMs: number): void {
    if (generation !== this.generation || !isDiscoverySessionEvent(observedAtMs, this.sessionStartedAtMs) || this.seen.has(filePath)) return;
    this.seen.add(filePath);
    this.pending.push(filePath);
    void this.drainCandidates(generation);
  }

  private async drainCandidates(generation: number): Promise<void> {
    if (this.draining) return;
    this.draining = true;
    try {
      while (generation === this.generation && this.pending.length) {
        const filePath = this.pending.shift();
        if (filePath) await this.qualifyStable(filePath, generation);
      }
    } finally {
      this.draining = false;
    }
  }

  private async qualifyStable(filePath: string, generation: number): Promise<void> {
    const directory = path.dirname(filePath);
    try {
      const stable = await waitForStableFile(filePath);
      if (!stable || generation !== this.generation) return;
      this.setState('candidate-found', `Stable Handoff Package detected: ${path.basename(filePath)}`, filePath, directory);
      const action = await vscode.window.showInformationMessage(
        `Tiinex found a Handoff Package: ${path.basename(filePath)}`,
        'Preview / Land',
        'Ignore'
      );
      if (generation !== this.generation) return;
      if (action === 'Ignore') {
        this.setState('ignored', `Ignored ${path.basename(filePath)} for this discovery session. The watcher remains active.`, filePath, directory);
        return;
      }
      if (action !== 'Preview / Land') {
        this.setState('blocked', `Candidate confirmation dismissed for ${path.basename(filePath)}. No action was taken; the watcher remains active.`, filePath, directory);
        return;
      }
      this.setState('landing-awaiting-confirmation', `Opening the qualified preview/landing flow for ${path.basename(filePath)}. No Workspace bytes are written without the existing explicit landing confirmation.`, filePath, directory);
      await this.onPackage(filePath);
      if (generation === this.generation) this.setState('landed', `Qualified landing flow completed for ${path.basename(filePath)}. The watcher remains active.`, filePath, directory);
    } catch (error) {
      if (generation !== this.generation) return;
      if (/cancel/i.test(message(error))) {
        this.setState('blocked', `Landing flow cancelled for ${path.basename(filePath)}. No bytes were written by discovery; the watcher remains active.`, filePath, directory);
        return;
      }
      this.setState('candidate-invalid', `Candidate is invalid or unqualified for landing: ${message(error)}`, filePath, directory);
      await vscode.window.showErrorMessage(`Tiinex Handoff candidate blocked: ${message(error)}`);
    }
  }
}

export async function selectHandoffInbox(): Promise<void> {
  const selected = await vscode.window.showOpenDialog({ canSelectFiles: false, canSelectFolders: true, canSelectMany: false, title: 'Select Tiinex Handoff Inbox' });
  if (!selected?.length) return;
  await vscode.workspace.getConfiguration('tiinex').update('handoffInbox.path', selected[0].fsPath, vscode.ConfigurationTarget.Global);
}

function message(error: unknown): string { return error instanceof Error ? error.message : String(error); }
