import * as vscode from 'vscode';
import { randomUUID } from 'node:crypto';
import type { TransportCompletionReceipt } from '../tiinex/bootstrap';

const TRANSPORT_SCHEME = 'tiinex-transport';
const transportDocuments = new Map<string, string>();
let providerRegistered = false;

/** Register a read-only transport-document host. Core still owns every receipt byte;
 * this is only the VS Code presentation surface, not a second transport source. */
export function registerTransportCompletionPresentation(context: vscode.ExtensionContext): void {
  if (providerRegistered) return;
  providerRegistered = true;
  context.subscriptions.push(
    vscode.workspace.registerTextDocumentContentProvider(TRANSPORT_SCHEME, {
      provideTextDocumentContent: (uri: vscode.Uri) => transportDocuments.get(uri.toString()) || ''
    }),
    vscode.workspace.onDidCloseTextDocument((doc: vscode.TextDocument) => {
      if (doc.uri.scheme === TRANSPORT_SCHEME) transportDocuments.delete(doc.uri.toString());
    }),
    { dispose: () => { providerRegistered = false; transportDocuments.clear(); } }
  );
}

/** Display exact Core-origin Markdown as a rendered preview, never a savable Untitled file. */
export async function showTransportCompletionTab(
  receipt: TransportCompletionReceipt,
  options: { clipboard: 'copied' | 'not-copied' | 'unknown'; expectedClipboardText?: string; expectedCarrierFilename?: string }
): Promise<void> {
  if (!receipt.markdown || !['ready', 'blocked'].includes(receipt.status)) throw new Error('tiinex.transport.receipt-unqualified');
  if (receipt.status === 'blocked' && receipt.reasonCode !== 'route-selection-required') throw new Error(`tiinex.transport.receipt-${receipt.reasonCode || 'blocked'}`);
  if (receipt.status === 'ready' && !receipt.clipboardText) throw new Error('tiinex.transport.receipt-text-missing');
  if (options.expectedClipboardText !== undefined && options.expectedClipboardText !== receipt.clipboardText) {
    throw new Error('tiinex.transport.receipt-clipboard-bytes-mismatch');
  }
  if (options.expectedCarrierFilename && receipt.status === 'ready' && receipt.carrier?.filename !== options.expectedCarrierFilename) {
    throw new Error('tiinex.transport.receipt-carrier-name-mismatch');
  }
  if (!providerRegistered) throw new Error('tiinex.transport.readonly-preview-provider-not-registered');
  const hostStatus = options.clipboard === 'copied' ? 'Copied successfully by VS Code' : options.clipboard === 'not-copied' ? 'Not copied' : 'Not verified';
  const markdown = receipt.markdown.replace(/^# Tiinex transport instructions([^\n]*)\n/, (heading) => `${heading}\nClipboard (VS Code host): ${hostStatus}\n`);
  const uri = vscode.Uri.from({ scheme: TRANSPORT_SCHEME, path: '/Tiinex transport instructions.md', query: `id=${randomUUID()}` });
  transportDocuments.set(uri.toString(), markdown);
  try {
    // The stock VS Code Markdown extension owns rendering; our provider owns only
    // read-only source content. Clipboard text remains Core's qualified exact bytes.
    await vscode.commands.executeCommand('markdown.showPreview', uri);
  } catch {
    // If Markdown preview is unavailable, still show non-editable source text.
    const document = await vscode.workspace.openTextDocument(uri);
    await vscode.window.showTextDocument(document, { preview: true, preserveFocus: false });
  }
}
