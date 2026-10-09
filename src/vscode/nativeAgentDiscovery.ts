import * as vscode from 'vscode';
import { qualifyInstalledCore } from '../host/corePackageBinding';
import { nodeProcessEnvironment, runProcess } from '../host/process';
import { preferredNodeExecutable } from '../host/nodeExecutable';

/** Intentionally one read-only discovery tool. This adapter neither copies the
 * Core operation catalog nor authorizes execution of any discovered operation. */
export function registerTiinexNativeAgentDiscovery(context: vscode.ExtensionContext, extensionPath: string): void {
  if (!vscode.lm?.registerTool) return;
  const registration = vscode.lm.registerTool<{ query?: string }>('tiinex_inspectCapabilities', {
    async invoke(options) {
      const input: unknown = options.input;
      const requested = (input && typeof input === 'object') ? (input as {query?: unknown}).query : undefined;
      if (requested !== undefined && typeof requested !== 'string') throw new Error('tiinex.agent-discovery.query-must-be-string');
      const query = String(requested || '');
      if (query.length > 120) throw new Error('tiinex.agent-discovery.query-too-long');
      if (!vscode.workspace.isTrusted) throw new Error('tiinex.agent-discovery.workspace-untrusted');
      const binding = await qualifyInstalledCore(extensionPath);
      const args = [binding.entrypoint, 'inspect-agent-capabilities', '--compact'];
      if (query) args.push('--query', query);
      const receipt = await runProcess(preferredNodeExecutable(), args, { cwd: binding.root, env: nodeProcessEnvironment() });
      if (receipt.code !== 0) throw new Error(`tiinex.agent-discovery.core-unavailable:${receipt.stderr.slice(0,500) || receipt.code}`);
      const response = JSON.parse(receipt.stdout);
      if (response?.status !== 'ready' || response?.operation !== 'inspect-agent-capabilities') throw new Error('tiinex.agent-discovery.core-projection-unqualified');
      return new vscode.LanguageModelToolResult([new vscode.LanguageModelTextPart(JSON.stringify(response))]);
    }
  });
  context.subscriptions.push(registration);
}
