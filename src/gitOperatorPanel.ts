import * as vscode from 'vscode';

export interface GitOperatorReviewItem {
  id: string;
  label: string;
  root: string;
  repository: string;
  branch: string;
  upstream: string;
  stagedPaths: string[];
  stagedTiinexPaths: string[];
  validationState: string;
  message: string;
  blocker: string;
}

export interface GitOperatorReviewSubmission {
  includedIds: string[];
  messages: Record<string, string>;
}

function escapeHtml(value: unknown): string {
  return String(value ?? '').replace(/[&<>"']/g, (match) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[match] || match));
}

function safeJson(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026');
}

function page(items: GitOperatorReviewItem[], nonce: string): string {
  const cards = items.map((item) => {
    const blocked = Boolean(item.blocker);
    const detail = blocked
      ? `<div class="blocker">${escapeHtml(item.blocker)}</div>`
      : `<div class="facts"><span>${item.stagedPaths.length} staged path${item.stagedPaths.length === 1 ? '' : 's'}</span><span>${item.stagedTiinexPaths.length} staged Tiinex path${item.stagedTiinexPaths.length === 1 ? '' : 's'}</span><span>${escapeHtml(item.validationState || 'ready')}</span></div>`;
    return `<section class="repo ${blocked ? 'blocked' : ''}" data-id="${escapeHtml(item.id)}">
      <div class="head"><label><input class="include" type="checkbox" ${blocked ? 'disabled' : 'checked'} /> <strong>${escapeHtml(item.label)}</strong></label><span class="eligibility">${blocked ? 'Blocked' : 'Ready to commit'}</span></div>
      <div class="grid"><div><span>Root</span><code>${escapeHtml(item.root)}</code></div><div><span>Repository</span><code>${escapeHtml(item.repository || '(no origin label)')}</code></div><div><span>Branch</span><code>${escapeHtml(item.branch || '(unresolved)')}</code></div><div><span>Upstream</span><code>${escapeHtml(item.upstream || '(unresolved)')}</code></div></div>
      ${detail}
      <label class="message"><span>Commit message</span><textarea ${blocked ? 'disabled' : ''}>${escapeHtml(item.message)}</textarea></label>
    </section>`;
  }).join('');
  return `<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'nonce-${nonce}'"><style>
  body{font-family:var(--vscode-font-family);font-size:13px;color:var(--vscode-foreground);padding:18px;max-width:1100px;margin:auto}h1{font-size:20px;margin:0 0 6px}.intro{color:var(--vscode-descriptionForeground);margin-bottom:16px}.repo{border:1px solid var(--vscode-panel-border);border-radius:5px;padding:12px;margin:12px 0;background:var(--vscode-editor-background)}.repo.blocked{border-color:var(--vscode-inputValidation-errorBorder)}.head{display:flex;justify-content:space-between;gap:12px;align-items:center}.eligibility{color:var(--vscode-descriptionForeground)}.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px 16px;margin-top:10px}.grid div{display:flex;flex-direction:column;gap:3px}.grid span,.message span{font-size:11px;text-transform:uppercase;color:var(--vscode-descriptionForeground)}code{white-space:pre-wrap;word-break:break-word}.facts{display:flex;gap:14px;margin-top:10px;color:var(--vscode-descriptionForeground)}.blocker{margin-top:10px;padding:8px;border:1px solid var(--vscode-inputValidation-errorBorder);background:var(--vscode-inputValidation-errorBackground)}.message{display:flex;flex-direction:column;gap:5px;margin-top:10px}textarea{font:inherit;min-height:70px;resize:vertical;color:var(--vscode-input-foreground);background:var(--vscode-input-background);border:1px solid var(--vscode-input-border);padding:7px}.actions{display:flex;justify-content:flex-end;gap:8px;position:sticky;bottom:0;background:var(--vscode-sideBar-background);padding:12px 0}button{font:inherit;border:0;border-radius:2px;padding:7px 14px;cursor:pointer;background:var(--vscode-button-background);color:var(--vscode-button-foreground)}button.secondary{background:var(--vscode-button-secondaryBackground);color:var(--vscode-button-secondaryForeground)}@media(max-width:720px){.grid{grid-template-columns:1fr}}
  </style></head><body><h1>Review Tiinex repository commits</h1><div class="intro">All changes in the selected qualified repositories have been staged. Shared Core staged validation and each repository's own commit-message helper ran before this review. Uncheck any ready repository you do not want to commit.</div>${cards}<div class="actions"><button id="cancel" class="secondary">Cancel</button><button id="commit">Commit reviewed repositories</button></div><script nonce="${nonce}">
  const vscode=acquireVsCodeApi();const items=${safeJson(items)};
  const cards=[...document.querySelectorAll('.repo')];
  document.getElementById('cancel').addEventListener('click',()=>vscode.postMessage({type:'cancel'}));
  document.getElementById('commit').addEventListener('click',()=>{const includedIds=[];const messages={};for(const card of cards){const id=card.dataset.id;const include=card.querySelector('.include');if(!include||include.disabled||!include.checked)continue;const message=String(card.querySelector('textarea')?.value||'').trim();if(!message){card.querySelector('textarea')?.focus();return;}includedIds.push(id);messages[id]=message;}vscode.postMessage({type:'commit',payload:{includedIds,messages}})});
  </script></body></html>`;
}

export async function reviewGitOperatorRepositories(items: GitOperatorReviewItem[]): Promise<GitOperatorReviewSubmission | null> {
  const activeColumn = Number((vscode.window as any).activeTextEditor?.viewColumn || 1);
  const panel = vscode.window.createWebviewPanel('tiinex.gitOperatorReview', 'Tiinex Git Operator', activeColumn, { enableScripts: true, retainContextWhenHidden: true });
  const nonce = `${Date.now()}-${Math.random().toString(36).slice(2)}`.replace(/[^a-zA-Z0-9]/g, '');
  panel.webview.html = page(items, nonce);
  return await new Promise<GitOperatorReviewSubmission | null>((resolve) => {
    let settled = false;
    const finish = (value: GitOperatorReviewSubmission | null): void => {
      if (settled) return;
      settled = true;
      resolve(value);
      try { panel.dispose(); } catch { /* already disposed */ }
    };
    panel.webview.onDidReceiveMessage((message: any) => {
      if (message?.type === 'cancel') { finish(null); return; }
      if (message?.type === 'commit') finish(message.payload as GitOperatorReviewSubmission);
    });
    panel.onDidDispose(() => { if (!settled) { settled = true; resolve(null); } });
  });
}
