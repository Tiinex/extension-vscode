import * as vscode from 'vscode';
import type { TransportCompletionReceipt } from '../tiinex/bootstrap';

/** Displays exact Core-origin Markdown without writing another transport file,
 * changing a carrier name or putting instruction text in the clipboard. */
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
  const hostStatus = options.clipboard === 'copied' ? 'Copied successfully by VS Code' : options.clipboard === 'not-copied' ? 'Not copied' : 'Not verified';
  const markdown = receipt.markdown.replace(/^# Tiinex transport instructions([^\n]*)\n/, (heading) => `${heading}\nClipboard (VS Code host): ${hostStatus}\n`);
  const document = await vscode.workspace.openTextDocument({ language: 'markdown', content: markdown });
  await vscode.window.showTextDocument(document, { preview: false, preserveFocus: false });
}
