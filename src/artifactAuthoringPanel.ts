import * as vscode from 'vscode';
import { ArtifactAuthoringModel, ArtifactAuthoringSection, ArtifactAuthoringField } from './core/artifactAuthoringModel';

export interface AuthoringWorkspaceOption {
  workspaceId: string;
  label: string;
  description: string;
}

export interface AuthoringFieldSuggestion {
  label: string;
  value?: string;
  description?: string;
  fills?: Record<string, string>;
}

export interface AuthoringFieldAssist {
  field: string;
  suggestions: AuthoringFieldSuggestion[];
}

export interface AuthoringTemplateOption {
  id: string;
  label: string;
  description: string;
  defaults?: Record<string, unknown>;
}

export interface ArtifactAuthoringPanelInput {
  model: ArtifactAuthoringModel;
  workspaces: AuthoringWorkspaceOption[];
  selectedWorkspaceId: string;
  fieldAssists?: AuthoringFieldAssist[];
  carrierRoles?: Array<{ label: string; reference: string }>;
  templates?: AuthoringTemplateOption[];
  selectedTemplateId?: string;
  attachAvailable: boolean;
  attachDefault: boolean;
  parentLabel?: string;
  initialValues?: Record<string, string>;
}

export interface ArtifactAuthoringSubmission {
  workspaceId: string;
  title: string;
  templateId: string;
  values: Record<string, unknown>;
  participantReferences: string[];
  attachToOutgoing: boolean;
}

export interface ArtifactAuthoringPanelHandlers {
  preview(input: ArtifactAuthoringSubmission): Promise<void>;
  create(input: ArtifactAuthoringSubmission): Promise<void>;
}

function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function fieldId(prefix: string, field: string): string {
  return `${prefix}-${field}`.replace(/[^a-zA-Z0-9_-]+/g, '-');
}

function fieldControl(field: ArtifactAuthoringField, prefix: string, value = ''): string {
  const id = fieldId(prefix, field.key);
  const required = field.required ? 'required' : '';
  const badge = field.required ? '<span class="required">required</span>' : '<span class="optional">optional</span>';
  const help = field.help ? `<div class="help">${escapeHtml(field.help)}</div>` : '';
  if (field.allowedValues.length) {
    return `<label class="field"><span>${escapeHtml(field.label)} ${badge}</span><select id="${id}" data-field="${escapeHtml(field.key)}" ${required}><option value="">Select…</option>${field.allowedValues.map((item) => `<option value="${escapeHtml(item)}"${item === value ? ' selected' : ''}>${escapeHtml(item)}</option>`).join('')}</select>${help}</label>`;
  }
  if (!field.multiline) return `<label class="field"><span>${escapeHtml(field.label)} ${badge}</span><input id="${id}" data-field="${escapeHtml(field.key)}" value="${escapeHtml(value)}" ${required} />${help}</label>`;
  return `<label class="field"><span>${escapeHtml(field.label)} ${badge}</span><textarea id="${id}" data-field="${escapeHtml(field.key)}" rows="3" ${required}>${escapeHtml(value)}</textarea>${help}</label>`;
}

function ordinarySection(section: ArtifactAuthoringSection): string {
  return `<section class="card ordinary-section" data-section="${escapeHtml(section.key)}" data-kind="fields"><h2>${escapeHtml(section.label)}</h2>${section.fields.map((field) => fieldControl(field, section.key)).join('')}</section>`;
}

function bodySection(section: ArtifactAuthoringSection): string {
  return `<section class="card ordinary-section" data-section="${escapeHtml(section.key)}" data-kind="body"><h2>${escapeHtml(section.label)}</h2>${section.fields.map((field) => fieldControl(field, section.key)).join('')}</section>`;
}

function groupSection(section: ArtifactAuthoringSection): string {
  return `<section class="card group-section" data-input="${escapeHtml(section.key)}"><h2>${escapeHtml(section.label)}</h2>${section.fields.map((field) => fieldControl(field, section.key)).join('')}</section>`;
}

function repeatableItem(section: ArtifactAuthoringSection, index = 0): string {
  const prefix = `${section.key}-${index}`;
  return `<div class="repeatable-item" data-index="${index}"><div class="item-head"><label class="field compact"><span>Entry name <span class="required">required</span></span><input data-entry-name="true" id="${fieldId(prefix, 'entry-name')}" /></label><button type="button" class="secondary remove-item" title="Remove entry">Remove</button></div>${section.fields.map((field) => fieldControl(field, prefix)).join('')}</div>`;
}

function repeatableSection(section: ArtifactAuthoringSection): string {
  const none = section.allowNone ? `<label class="none-toggle"><input type="checkbox" data-none="true" checked /> None</label>` : '';
  return `<section class="card repeatable-section" data-input="${escapeHtml(section.key)}" data-allow-none="${section.allowNone ? 'true' : 'false'}"><div class="section-head"><h2>${escapeHtml(section.label)}</h2>${none}</div><div class="repeatable-items">${section.allowNone ? '' : repeatableItem(section)}</div><button type="button" class="secondary add-item">+ Add</button><template class="item-template">${repeatableItem(section, 9999)}</template></section>`;
}

function sectionHtml(section: ArtifactAuthoringSection): string {
  if (section.kind === 'repeatable') return repeatableSection(section);
  if (section.kind === 'group') return groupSection(section);
  if (section.kind === 'body') return bodySection(section);
  return ordinarySection(section);
}

function safeJson(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026');
}

function html(input: ArtifactAuthoringPanelInput, nonce: string): string {
  const model = input.model;
  const fieldAssists = input.fieldAssists || [];
  const carrierRoles = input.carrierRoles || [];
  const templates = input.templates || [];
  const workspaceOptions = input.workspaces.map((item) => `<option value="${escapeHtml(item.workspaceId)}"${item.workspaceId === input.selectedWorkspaceId ? ' selected' : ''}>${escapeHtml(item.label)} — ${escapeHtml(item.description)}</option>`).join('');
  const templateOptions = templates.map((item) => `<option value="${escapeHtml(item.id)}"${item.id === input.selectedTemplateId ? ' selected' : ''}>${escapeHtml(item.label)}</option>`).join('');
  const participantOptions = carrierRoles.map((item) => `<option value="${escapeHtml(item.reference)}">${escapeHtml(item.label)}</option>`).join('');
  const assistLists = fieldAssists.map((assist, index) => `<datalist id="assist-${index}">${assist.suggestions.map((item) => `<option value="${escapeHtml(item.value || item.label)}">${escapeHtml(item.description || item.label)}</option>`).join('')}</datalist>`).join('');
  const attach = input.attachAvailable
    ? `<label class="attach"><input id="attach" type="checkbox" ${input.attachDefault ? 'checked' : ''}/> Attach to Outgoing</label>`
    : `<label class="attach disabled"><input id="attach" type="checkbox" disabled /> Attach to Outgoing <span>— create an Outgoing context first</span></label>`;
  const parent = input.parentLabel ? `<div class="context-row"><strong>Continue from</strong><span>${escapeHtml(input.parentLabel)}</span></div>` : '';
  const capabilityGaps = (model.capabilityGaps || []).length
    ? `<section class="card capability-gap"><h2>Core authoring boundary</h2><div class="muted">These schema-optional fields are visible to Core validation but are not currently bound by Core creation, so this host will not pretend they can be written.</div>${model.capabilityGaps.map((gap) => `<div class="gap-row"><strong>${escapeHtml(gap.section)}</strong><span>${escapeHtml(gap.fields.join(', '))}</span></div>`).join('')}</section>`
    : '';
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'nonce-${nonce}'; script-src 'nonce-${nonce}';">
<style nonce="${nonce}">
:root{color-scheme:light dark}body{font-family:var(--vscode-font-family);color:var(--vscode-foreground);background:var(--vscode-editor-background);padding:18px 22px;max-width:980px;margin:0 auto}.top{position:sticky;top:0;background:var(--vscode-editor-background);z-index:3;padding:0 0 12px;border-bottom:1px solid var(--vscode-panel-border)}h1{font-size:20px;margin:0 0 4px}h2{font-size:14px;margin:0}.muted,.help,.context-row,.template-help{color:var(--vscode-descriptionForeground);font-size:12px}.grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:12px}.card{border:1px solid var(--vscode-panel-border);border-radius:6px;padding:12px;margin:12px 0;background:var(--vscode-sideBar-background)}.field{display:flex;flex-direction:column;gap:5px;margin-top:10px}.field.compact{margin-top:0;flex:1}.field>span{font-weight:600}textarea,input,select{font:inherit;color:var(--vscode-input-foreground);background:var(--vscode-input-background);border:1px solid var(--vscode-input-border,transparent);padding:6px 8px;box-sizing:border-box;width:100%;border-radius:2px}textarea:focus,input:focus,select:focus{outline:1px solid var(--vscode-focusBorder)}.required,.optional{font-size:10px;font-weight:400;padding:1px 5px;border-radius:8px;background:var(--vscode-badge-background);color:var(--vscode-badge-foreground)}.optional{opacity:.65}.section-head,.item-head,.actions,.context-row{display:flex;align-items:center;gap:10px}.section-head{justify-content:space-between}.item-head{align-items:end}.repeatable-item{border-left:3px solid var(--vscode-focusBorder);padding:8px 10px;margin-top:10px;background:var(--vscode-editor-background)}button{font:inherit;border:0;border-radius:2px;padding:7px 14px;cursor:pointer;background:var(--vscode-button-background);color:var(--vscode-button-foreground)}button:hover{background:var(--vscode-button-hoverBackground)}button.secondary{background:var(--vscode-button-secondaryBackground);color:var(--vscode-button-secondaryForeground)}button.secondary:hover{background:var(--vscode-button-secondaryHoverBackground)}.actions{justify-content:flex-end;margin-top:14px}.attach{display:flex;align-items:center;gap:7px;font-weight:600}.attach input,.none-toggle input{width:auto}.disabled{opacity:.65}.capability-gap{border-color:var(--vscode-inputValidation-warningBorder,var(--vscode-panel-border))}.gap-row{display:flex;gap:10px;margin-top:7px;font-size:12px}.gap-row strong{min-width:150px}.participants{min-height:90px}.error{display:none;margin-top:10px;padding:8px;border:1px solid var(--vscode-inputValidation-errorBorder);background:var(--vscode-inputValidation-errorBackground);color:var(--vscode-inputValidation-errorForeground)}.status{font-size:12px;margin-right:auto;color:var(--vscode-descriptionForeground)}@media(max-width:700px){.grid{grid-template-columns:1fr}}
</style></head><body>
<div class="top"><h1>${escapeHtml(model.label)} authoring</h1><div class="muted">Schema and validation are projected by Tiinex Core. This form only presents that contract.</div>
<div class="grid"><label class="field"><span>Workspace</span><select id="workspace">${workspaceOptions}</select></label><label class="field"><span>Title <span class="required">required</span></span><input id="title" autocomplete="off" /></label>${templates.length ? `<label class="field"><span>Template</span><select id="template">${templateOptions}</select><div class="template-help" id="templateHelp"></div></label>` : ''}<div class="field"><span>Host action</span>${attach}</div></div>${parent}</div>
${assistLists}
<div id="artifactFields">${model.sections.map(sectionHtml).join('')}</div>
${capabilityGaps}
${carrierRoles.length ? `<section class="card"><h2>Additional carrier Roles</h2><div class="muted">Host transport context only; these choices do not alter artifact schema fields.</div><select id="participants" class="participants" multiple>${participantOptions}</select></section>` : ''}
<div id="error" class="error"></div><div class="actions"><span id="status" class="status"></span><button type="button" class="secondary" id="cancel">Cancel</button><button type="button" class="secondary" id="preview">Preview</button><button type="button" id="create">Create</button></div>
<script nonce="${nonce}">
const vscode=acquireVsCodeApi();
const model=${safeJson(model)};const fieldAssists=${safeJson(fieldAssists)};const templates=${safeJson(templates)};const initialValues=${safeJson(input.initialValues || {})};
function q(s,r=document){return r.querySelector(s)}function qa(s,r=document){return [...r.querySelectorAll(s)]}
function fieldInSection(section,field){return qa('.ordinary-section').find(s=>s.dataset.section===section)?.querySelector('[data-field="'+CSS.escape(field)+'"]')||null}
function allField(field){return qa('[data-field="'+CSS.escape(field)+'"]')}
function setField(field,value){for(const el of allField(field)){if(!el.value)el.value=String(value??'')}}
function exactSetField(field,value){for(const el of allField(field))el.value=String(value??'')}
function matchingAssistSuggestion(assist,el){const raw=String(el.value||'').trim().toLowerCase();return(assist.suggestions||[]).find(item=>String(item.value||item.label||'').trim().toLowerCase()===raw)||null}
function applyAssist(assist,el){const match=matchingAssistSuggestion(assist,el);if(!match)return;for(const [field,value] of Object.entries(match.fills||{})){if(allField(field).length)exactSetField(field,value)}}
function assistCapabilityErrors(){const errors=[];for(const assist of fieldAssists){for(const el of allField(assist.field)){const match=matchingAssistSuggestion(assist,el);if(!match)continue;for(const [field,value] of Object.entries(match.fills||{})){if(String(value??'').trim()&&!allField(field).length)errors.push(field+' cannot be written by the current Core creation contract.')}}}return errors}
for(const [index,assist] of fieldAssists.entries()){for(const el of allField(assist.field)){el.setAttribute('list','assist-'+index);el.addEventListener('change',()=>applyAssist(assist,el))}}
for(const [field,value] of Object.entries(initialValues||{})){setField(field,value);const assist=fieldAssists.find(item=>item.field===field);if(assist)for(const el of allField(field))applyAssist(assist,el)}
function applyTemplate(){const id=q('#template')?.value||'';const t=templates.find(x=>x.id===id);q('#templateHelp')&&(q('#templateHelp').textContent=t?.description||'');if(!t?.defaults)return;const flat=(obj,prefix='')=>{for(const [k,v] of Object.entries(obj||{})){const key=prefix?prefix+'.'+k:k;if(v&&typeof v==='object'&&!Array.isArray(v))flat(v,key);else{const parts=key.split('.');const field=parts.at(-1);if(field)setField(field,v)}}};flat(t.defaults)}
q('#template')?.addEventListener('change',applyTemplate);applyTemplate();
function wireRepeatable(section){const items=q('.repeatable-items',section);const template=q('template.item-template',section);const none=q('[data-none]',section);let counter=0;function update(){const disabled=!!none?.checked;items.style.display=disabled?'none':'';q('.add-item',section).style.display=disabled?'none':'';if(!disabled&&!q('.repeatable-item',items))add()}function add(){counter++;const html=template.innerHTML.replaceAll('9999',String(counter));items.insertAdjacentHTML('beforeend',html);wireItem(items.lastElementChild)}function wireItem(item){q('.remove-item',item)?.addEventListener('click',()=>item.remove())}q('.add-item',section).addEventListener('click',add);none?.addEventListener('change',update);qa('.repeatable-item',items).forEach(wireItem);update()}
qa('.repeatable-section').forEach(wireRepeatable);
function valueOf(el){return String(el?.value??'').trim()}
function collect(){const values={};for(const section of qa('.ordinary-section'))for(const el of qa('[data-field]',section)){const v=valueOf(el);if(v)values[el.dataset.field]=v}for(const section of qa('.group-section')){const group={};for(const el of qa('[data-field]',section)){const v=valueOf(el);if(v)group[el.dataset.field]=v}values[section.dataset.input]=group}for(const section of qa('.repeatable-section')){if(q('[data-none]',section)?.checked){values[section.dataset.input]='none';continue}const entries=[];for(const item of qa('.repeatable-item',section)){const name=valueOf(q('[data-entry-name]',item));const fields={};for(const el of qa('[data-field]',item)){const v=valueOf(el);if(v)fields[el.dataset.field]=v}entries.push({name,fields})}values[section.dataset.input]=entries}return values}
function validate(){const errors=[];if(!valueOf(q('#title')))errors.push('Title is required.');for(const el of qa('[required]')){if(!valueOf(el)&&el.offsetParent!==null)errors.push((el.dataset.field||'Required field')+' is required.')}for(const section of qa('.repeatable-section')){if(q('[data-none]',section)?.checked)continue;for(const item of qa('.repeatable-item',section)){if(!valueOf(q('[data-entry-name]',item)))errors.push(section.dataset.input+': entry name is required.')}}errors.push(...assistCapabilityErrors());return [...new Set(errors)]}
function submission(){return{workspaceId:q('#workspace').value,title:valueOf(q('#title')),templateId:q('#template')?.value||'',values:collect(),participantReferences:qa('#participants option:checked').map(x=>x.value),attachToOutgoing:!!q('#attach')?.checked}}
function send(action){const errors=validate();const box=q('#error');if(errors.length){box.style.display='block';box.textContent=errors.join(' ');return}box.style.display='none';q('#status').textContent=action==='preview'?'Preparing preview…':'Creating…';vscode.postMessage({type:action,payload:submission()})}
q('#preview').addEventListener('click',()=>send('preview'));q('#create').addEventListener('click',()=>send('create'));q('#cancel').addEventListener('click',()=>vscode.postMessage({type:'cancel'}));
window.addEventListener('message',event=>{const msg=event.data||{};q('#status').textContent=msg.message||'';if(msg.type==='error'){const box=q('#error');box.style.display='block';box.textContent=msg.message||'Blocked.'}if(msg.type==='created')q('#create').disabled=true});
</script></body></html>`;
}

export function openArtifactAuthoringPanel(input: ArtifactAuthoringPanelInput, handlers: ArtifactAuthoringPanelHandlers): any {
  const activeColumn = Number((vscode.window as any).activeTextEditor?.viewColumn || 1);
  const panel = (vscode.window as any).createWebviewPanel('tiinex.artifactAuthoring', `New ${input.model.label}`, activeColumn, { enableScripts: true, retainContextWhenHidden: true });
  const nonce = `${Date.now()}-${Math.random().toString(36).slice(2)}`.replace(/[^a-zA-Z0-9]/g, '');
  panel.webview.html = html(input, nonce);
  panel.webview.onDidReceiveMessage(async (message: any) => {
    try {
      if (message?.type === 'cancel') { panel.dispose(); return; }
      if (message?.type === 'preview') {
        await handlers.preview(message.payload as ArtifactAuthoringSubmission);
        await panel.webview.postMessage({ type: 'status', message: 'Preview ready.' });
        return;
      }
      if (message?.type === 'create') {
        await handlers.create(message.payload as ArtifactAuthoringSubmission);
        await panel.webview.postMessage({ type: 'created', message: 'Created.' });
      }
    } catch (error) {
      const text = error instanceof Error ? error.message : String(error);
      await panel.webview.postMessage({ type: 'error', message: text });
    }
  });
  return panel;
}
