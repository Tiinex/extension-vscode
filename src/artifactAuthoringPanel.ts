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
  groupLabel?: string;
  qualification?: string;
  schemaId?: string;
  fills?: Record<string, string>;
  kind?: string;
  reference?: string;
  workspaceId?: string;
  path?: string;
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

export interface AuthoringTransitionDefinition {
  representationKey?: string;
  canonicalIdentifier: string;
  version?: string;
  label: string;
  purpose?: string;
  sourcePath?: string;
  identityQualification?: string;
  authoringProfile?: {
    state?: string;
    reason?: string;
    generationQualification?: string;
    defaults?: Record<string, unknown>;
    boundary?: Record<string, unknown>;
  };
}

export interface ArtifactAuthoringPanelInput {
  model: ArtifactAuthoringModel;
  workspaces: AuthoringWorkspaceOption[];
  selectedWorkspaceId: string;
  fieldAssists?: AuthoringFieldAssist[];
  templates?: AuthoringTemplateOption[];
  selectedTemplateId?: string;
  templateLabel?: string;
  transitionDefinitions?: AuthoringTransitionDefinition[];
  transitionBoundary?: string;
  transitionLoading?: boolean;
  authoringAssistLoading?: boolean;
  attachAvailable: boolean;
  attachDefault: boolean;
  attachUnavailableReason?: string;
  parentLabel?: string;
  initialValues?: Record<string, unknown>;
  enableSaveAsTransition?: boolean;
  sourceContextLabel?: string;
}

export interface ArtifactAuthoringSubmission {
  workspaceId: string;
  title: string;
  slug?: string;
  templateId: string;
  values: Record<string, unknown>;
  endpointSelections?: Record<string, AuthoringFieldSuggestion>;
  attachToOutgoing: boolean;
  closeWhenDone: boolean;
}

export interface ArtifactAuthoringPanelHandlers {
  ready?(panel: any): Promise<void> | void;
  preview(input: ArtifactAuthoringSubmission): Promise<void>;
  create(input: ArtifactAuthoringSubmission): Promise<void>;
  pickReference?(field: string, workspaceId: string): Promise<string | undefined>;
  saveTransition?(input: ArtifactAuthoringSubmission): Promise<void>;
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
  const referencePicker = field.affordance?.control === 'workspace-file-reference-picker'
    ? `<button type="button" class="secondary reference-pick" data-reference-field="${escapeHtml(field.key)}" data-reference-target="${escapeHtml(id)}" data-reference-append="${field.affordance.append === true ? 'true' : 'false'}">${escapeHtml(field.affordance.displayLabel || 'Choose file')}</button>`
    : '';
  // The qualified schema is the semantic authority, but its internal
  // qualification/debug coordinates are not primary operator guidance.
  const provenance = field.sourceHelp;
  const readable = String(provenance?.fieldRule || field.help || '').trim();
  const rule = readable && !/^no human meaning supplied/i.test(readable) && !/^exact field source not available/i.test(readable) ? readable : '';
  const placeholder = field.affordance?.control === 'workspace-file-reference-picker'
    ? 'Choose a file or paste a relative path / URL…'
    : `Enter ${field.label.toLowerCase()}…`;
  const placeholderAttr = ` placeholder="${escapeHtml(placeholder)}"`;
  // The current pre-release source can be locally qualified but unpublished.
  // A historical source commit is not proof that its field line is published.
  const sourceDetails = provenance ? `<details class="schema-provenance"><summary>Schema reference</summary>
    <div>${escapeHtml(provenance.repository || 'Local schema')} · ${escapeHtml(provenance.schemaPath)}${provenance.fieldLine ? ` · line ${provenance.fieldLine}` : ''}</div>
    <details class="schema-rule-context"><summary>Show schema context</summary><pre>${escapeHtml(String(provenance.excerpt || '').slice(0, 1800))}</pre></details></details>` : '';
  const fieldHelp = (rule || sourceDetails) ? `<details class="field-source-help"><summary aria-label="Help for ${escapeHtml(field.label)}" title="Read guidance for ${escapeHtml(field.label)}">? Field guidance</summary><div class="help">${rule ? `<p>${escapeHtml(rule)}</p>` : ''}${sourceDetails}</div></details>` : '';
  const help = (rule ? `<div class="inline-field-guide">${escapeHtml(rule)}</div>` : '')
    + fieldHelp
    + (referencePicker ? '<div class="help">References identify material; they do not validate the evidence.</div>' : '');
  if (field.allowedValues.length) {
    return `<label class="field"><span>${escapeHtml(field.label)} ${badge}</span><select id="${id}" data-field="${escapeHtml(field.key)}" ${required}><option value="">Select…</option>${field.allowedValues.map((item) => `<option value="${escapeHtml(item)}"${item === value ? ' selected' : ''}>${escapeHtml(item)}</option>`).join('')}</select>${help}</label>`;
  }
  if (!field.multiline) return `<label class="field"><span>${escapeHtml(field.label)} ${badge}</span><input id="${id}" data-field="${escapeHtml(field.key)}" value="${escapeHtml(value)}"${placeholderAttr} ${required} />${referencePicker}${help}</label>`;
  return `<label class="field"><span>${escapeHtml(field.label)} ${badge}</span><textarea id="${id}" data-field="${escapeHtml(field.key)}" rows="3"${placeholderAttr} ${required}>${escapeHtml(value)}</textarea>${referencePicker}${help}</label>`;
}

function sectionFields(section: ArtifactAuthoringSection, prefix: string): string {
  const required = section.fields.filter((field) => field.required);
  const optional = section.fields.filter((field) => !field.required);
  const requiredHtml = required.map((field) => fieldControl(field, prefix)).join('');
  const optionalHtml = optional.length
    ? `<details class="optional-fields"><summary>Optional fields (${optional.length})</summary>${optional.map((field) => fieldControl(field, prefix)).join('')}</details>`
    : '';
  return `${requiredHtml}${optionalHtml}`;
}

function ordinarySection(section: ArtifactAuthoringSection): string {
  return `<section class="card ordinary-section" data-section="${escapeHtml(section.key)}" data-kind="fields"><h2>${escapeHtml(section.label)}</h2>${sectionFields(section, section.key)}</section>`;
}

function bodySection(section: ArtifactAuthoringSection): string {
  return `<section class="card ordinary-section" data-section="${escapeHtml(section.key)}" data-kind="body"><h2>${escapeHtml(section.label)}</h2>${sectionFields(section, section.key)}</section>`;
}

function groupSection(section: ArtifactAuthoringSection): string {
  return `<section class="card group-section" data-input="${escapeHtml(section.key)}"><h2>${escapeHtml(section.label)}</h2>${sectionFields(section, section.key)}</section>`;
}

function repeatableItem(section: ArtifactAuthoringSection, index = 0): string {
  const prefix = `${section.key}-${index}`;
  return `<div class="repeatable-item" data-index="${index}"><div class="item-head"><label class="field compact"><span>Entry name <span class="required">required</span></span><input data-entry-name="true" id="${fieldId(prefix, 'entry-name')}" /></label><button type="button" class="secondary remove-item" title="Remove entry">Remove</button></div>${sectionFields(section, prefix)}</div>`;
}

function repeatableSection(section: ArtifactAuthoringSection): string {
  const none = section.allowNone ? `<label class="none-toggle"><input type="checkbox" data-none="true" checked /> None</label>` : '';
  return `<section class="card repeatable-section" data-input="${escapeHtml(section.key)}" data-allow-none="${section.allowNone ? 'true' : 'false'}"><div class="section-head"><h2>${escapeHtml(section.label)}</h2>${none}</div><div class="repeatable-items">${section.allowNone ? '' : repeatableItem(section)}</div><button type="button" class="secondary add-item">+ Add</button><template class="item-template">${repeatableItem(section, 9999)}</template></section>`;
}

function compositeSection(section: ArtifactAuthoringSection): string {
  return `<section class="card composite-section" data-input="${escapeHtml(section.key)}"><h2>${escapeHtml(section.label)}</h2>${(section.parts || []).map(repeatableSection).join('')}</section>`;
}

function sectionHtml(section: ArtifactAuthoringSection): string {
  if (section.kind === 'composite') return compositeSection(section);
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
  const templates = input.templates || [];
  const transitionDefinitions = input.transitionDefinitions || [];
  const workspaceOptions = input.workspaces.map((item) => `<option value="${escapeHtml(item.workspaceId)}"${item.workspaceId === input.selectedWorkspaceId ? ' selected' : ''}>${escapeHtml(item.label)} — ${escapeHtml(item.description)}</option>`).join('');
  const templateOptions = templates.map((item) => `<option value="${escapeHtml(item.id)}"${item.id === input.selectedTemplateId ? ' selected' : ''}>${escapeHtml(item.label)}</option>`).join('');
  const assistLists = fieldAssists.map((assist, index) => `<datalist id="assist-${index}">${assist.suggestions.map((item) => `<option value="${escapeHtml(item.value || item.label)}">${escapeHtml(item.description || item.label)}</option>`).join('')}</datalist>`).join('');
  const endpointControls = '';
  const attach = `<label class="attach${input.attachAvailable ? '' : ' disabled'}" id="attachLabel"><input id="attach" type="checkbox" ${input.attachAvailable ? '' : 'disabled'} ${input.attachAvailable && input.attachDefault ? 'checked' : ''}/> Attach to Outgoing <span id="attachReason">${input.attachAvailable ? '' : `— ${escapeHtml(input.attachUnavailableReason || 'unavailable for this artifact')}`}</span></label>`;
  const handoffSlug = model.schemaId === 'tiinex.handoff.v1'
    ? `<label class="field"><span>Slug <span class="optional">optional</span></span><input id="slug" autocomplete="off" /><div class="help">Path label only. Leave blank to use From → To; Tiinex Core allocates and slugifies the final filename.</div></label>`
    : '';
  const parent = input.parentLabel ? `<div class="context-row"><strong>Continue from</strong><span>${escapeHtml(input.parentLabel)}</span></div>` : '';
  // Capability gaps remain in the projected model for diagnostics/tests, but
  // the normal authoring form only presents executable controls. Repeating the
  // omitted schema fields as an internal Core boundary card adds no operator value.
  const capabilityGaps = '';
  const transitionNeighborhood = '';
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'nonce-${nonce}'; script-src 'nonce-${nonce}';">
<style nonce="${nonce}">
:root{color-scheme:light dark}body{font-family:var(--vscode-font-family);color:var(--vscode-foreground);background:var(--vscode-editor-background);padding:18px 22px;max-width:980px;margin:0 auto}.top{background:var(--vscode-editor-background);padding:0 0 12px;border-bottom:1px solid var(--vscode-panel-border)}h1{font-size:20px;margin:0 0 4px}h2{font-size:14px;margin:0}.muted,.help,.context-row,.template-help{color:var(--vscode-descriptionForeground);font-size:12px}.grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:12px}.card{border:1px solid var(--vscode-panel-border);border-radius:6px;padding:12px;margin:12px 0;background:var(--vscode-sideBar-background)}.field{display:flex;flex-direction:column;gap:5px;margin-top:10px}.field.compact{margin-top:0;flex:1}.field>span{font-weight:600}textarea,input,select{font:inherit;color:var(--vscode-input-foreground);background:var(--vscode-input-background);border:1px solid var(--vscode-input-border,transparent);padding:6px 8px;box-sizing:border-box;width:100%;border-radius:2px}textarea:focus,input:focus,select:focus{outline:1px solid var(--vscode-focusBorder)}.required,.optional{font-size:10px;font-weight:400;padding:1px 5px;border-radius:8px;background:var(--vscode-badge-background);color:var(--vscode-badge-foreground)}.optional{opacity:.65}.section-head,.item-head,.actions,.context-row{display:flex;align-items:center;gap:10px}.section-head{justify-content:space-between}.item-head{align-items:end}.repeatable-item{border-left:3px solid var(--vscode-focusBorder);padding:8px 10px;margin-top:10px;background:var(--vscode-editor-background)}button{font:inherit;border:0;border-radius:2px;padding:7px 14px;cursor:pointer;background:var(--vscode-button-background);color:var(--vscode-button-foreground)}button:hover{background:var(--vscode-button-hoverBackground)}button.secondary{background:var(--vscode-button-secondaryBackground);color:var(--vscode-button-secondaryForeground)}button.secondary:hover{background:var(--vscode-button-secondaryHoverBackground)}.actions{justify-content:flex-end;margin-top:14px}.attach{display:flex;align-items:center;gap:7px;font-weight:600}.attach input,.none-toggle input,.close-when-done input{width:auto}.close-when-done{display:flex;align-items:center;gap:6px;font-size:12px;color:var(--vscode-descriptionForeground)}.disabled{opacity:.65}.capability-gap{border-color:var(--vscode-inputValidation-warningBorder,var(--vscode-panel-border))}.gap-row{display:flex;gap:10px;margin-top:7px;font-size:12px}.gap-row strong{min-width:150px}.transition-row{padding:9px 0;border-top:1px solid var(--vscode-panel-border)}.transition-row:first-of-type{margin-top:8px}.transition-id{margin-left:8px;color:var(--vscode-descriptionForeground);font-size:11px}.transition-source{opacity:.8;word-break:break-all}.optional-fields{margin-top:10px}.optional-fields>summary{cursor:pointer;color:var(--vscode-descriptionForeground);font-size:12px}.endpoint-raw-hidden{display:none!important}.error{display:none;margin-top:10px;padding:8px;border:1px solid var(--vscode-inputValidation-errorBorder);background:var(--vscode-inputValidation-errorBackground);color:var(--vscode-inputValidation-errorForeground)}.status{font-size:12px;margin-right:auto;color:var(--vscode-descriptionForeground)}@media(max-width:700px){.grid{grid-template-columns:1fr}}
.presentation-switch{display:flex;align-items:center;gap:6px;margin-top:10px}.presentation-switch [aria-pressed=true]{outline:1px solid var(--vscode-focusBorder)}.field-source-help{font-size:12px}.field-source-help summary{cursor:pointer;color:var(--vscode-textLink-foreground)}.field-source-help summary:focus-visible{outline:2px solid var(--vscode-focusBorder)}.inline-field-guide{font-size:12px;color:var(--vscode-descriptionForeground);margin-top:3px;line-height:1.4}.schema-provenance{border-top:1px solid var(--vscode-panel-border);padding-top:7px;margin-top:7px}.schema-provenance>summary{cursor:pointer}.schema-provenance pre{white-space:pre-wrap;word-break:break-word;max-height:220px;overflow:auto;font:inherit}
</style></head><body>
<div class="top"><h1>${escapeHtml(model.label)} authoring</h1><div class="muted">Schema and validation are projected by Tiinex Core. This form only presents that contract.</div>
<div class="presentation-switch" role="group" aria-label="Form presentation"><button type="button" class="secondary" id="quickForm" aria-pressed="true">Quick</button><button type="button" class="secondary" id="fullForm" aria-pressed="false">Full</button><span class="help">Same Core contract · optional inputs stay unresolved until supplied</span></div>
<div class="grid"><label class="field"><span>Workspace</span><select id="workspace">${workspaceOptions}</select></label><label class="field"><span>Title <span class="required">required</span></span><input id="title" autocomplete="off" /><div class="help">Artifact title. For Handoffs this becomes the rendered H1 and Summary.</div></label>${handoffSlug}${templates.length ? `<label class="field"><span>${escapeHtml(input.templateLabel || 'Preset')}</span><select id="template">${templateOptions}</select><div class="template-help" id="templateHelp">Choose a qualified Transition preset, or Manual for the full schema form.</div></label>` : ''}<div class="field"><span>Host action</span>${attach}</div></div><div id="endpointControls" data-loading="${input.authoringAssistLoading ? 'true' : 'false'}">${input.authoringAssistLoading ? '<div class="loading">Core authoring candidates loading…</div>' : endpointControls}</div>${parent}</div>
${assistLists}
<div id="transitionNeighborhood">${input.transitionLoading ? '<section class="card transition-neighborhood"><h2>Transition neighborhood</h2><div class="muted">Core transition discovery loading…</div></section>' : transitionNeighborhood}</div>
${input.sourceContextLabel ? `<p class="help">Source context: ${escapeHtml(input.sourceContextLabel)}. Only exactly matching Core inputs may be prefilled; the Transition remains a separate artifact.</p>` : ''}<div id="artifactFields">${model.sections.map(sectionHtml).join('')}</div>
${capabilityGaps}
<div id="error" class="error"></div><div class="actions" id="actions"><span id="status" class="status"></span><label class="close-when-done"><input id="closeWhenDone" type="checkbox" checked /> Close when done</label><button type="button" class="secondary" id="cancel">Cancel</button>${input.enableSaveAsTransition ? '<button type="button" class="secondary" id="saveTransition">Save as Transition…</button>' : ''}<button type="button" class="secondary" id="preview">Preview</button><button type="button" id="create">Create</button></div>
<script nonce="${nonce}">
const vscode=acquireVsCodeApi();
function setFormPresentation(mode){const full=mode==='full';for(const el of document.querySelectorAll('.optional-fields'))el.open=full;document.getElementById('quickForm').setAttribute('aria-pressed',String(!full));document.getElementById('fullForm').setAttribute('aria-pressed',String(full))}
document.getElementById('quickForm').addEventListener('click',()=>setFormPresentation('quick'));document.getElementById('fullForm').addEventListener('click',()=>setFormPresentation('full'));
const model=${safeJson(model)};let fieldAssists=${safeJson(fieldAssists)};let templates=${safeJson(templates)};let transitionDefinitions=${safeJson(transitionDefinitions)};const initialValues=${safeJson(input.initialValues || {})};
function escapeHtml(value){return String(value??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\"/g,'&quot;').replace(/'/g,'&#39;')}
function q(s,r=document){return r.querySelector(s)}function qa(s,r=document){return [...r.querySelectorAll(s)]}
function fieldInSection(section,field){return qa('.ordinary-section').find(s=>s.dataset.section===section)?.querySelector('[data-field="'+CSS.escape(field)+'"]')||null}
function allField(field){return qa('[data-field="'+CSS.escape(field)+'"]')}
function setField(field,value){for(const el of allField(field)){if(!el.value)el.value=String(value??'')}}
function exactSetField(field,value){for(const el of allField(field))el.value=String(value??'')}
function matchingAssistSuggestion(assist,el){const raw=String(el.value||'').trim().toLowerCase();return(assist.suggestions||[]).find(item=>String(item.value||item.label||'').trim().toLowerCase()===raw)||null}
function applyAssist(assist,el){const match=matchingAssistSuggestion(assist,el);if(!match)return;for(const [field,value] of Object.entries(match.fills||{})){if(allField(field).length)exactSetField(field,value)}}
function assistCapabilityErrors(){const errors=[];for(const assist of fieldAssists){for(const el of allField(assist.field)){const match=matchingAssistSuggestion(assist,el);if(!match)continue;for(const [field,value] of Object.entries(match.fills||{})){if(String(value??'').trim()&&!allField(field).length)errors.push(field+' cannot be written by the current Core creation contract.')}}}return errors}
for(const [index,assist] of fieldAssists.entries()){for(const el of allField(assist.field)){el.setAttribute('list','assist-'+index);el.addEventListener('change',()=>applyAssist(assist,el))}}
function endpointRawLabels(field){const names=[field,field+' Kind'];return names.flatMap(name=>allField(name).map(el=>el.closest('label.field')).filter(Boolean))}
function endpointReferenceLabels(field){return allField(field+' Reference').map(el=>el.closest('label.field')).filter(Boolean)}
function setEndpointRawVisible(field,visible){for(const label of endpointRawLabels(field))label.classList.toggle('endpoint-raw-hidden',!visible);for(const label of endpointReferenceLabels(field))label.classList.toggle('endpoint-raw-hidden',!visible)}
function endpointSuggestionOptions(suggestions){const groups=[];for(const [index,item] of suggestions.entries()){const groupLabel=String(item.groupLabel||'').trim();let group=groups[groups.length-1];if(!group||group.label!==groupLabel){group={label:groupLabel,items:[]};groups.push(group)}group.items.push({item,index})}return groups.map(group=>{const options=group.items.map(({item,index})=>'<option value="'+index+'">'+escapeHtml(item.label)+(item.description?' — '+escapeHtml(item.description):'')+'</option>').join('');return group.label?'<optgroup label="'+escapeHtml(group.label)+'">'+options+'</optgroup>':options}).join('')}
function endpointSelectionHelp(select,assist){const help=select.closest('label.field')?.querySelector('[data-endpoint-help]');if(!help)return;const field=String(select.dataset.endpointAssist||'');const isReturn=field==='Return To';const generic=(assist?.suggestions||[]).length?'Core-discovered Party / Role choices. Core-qualified References are preserved when available.':'No compatible Party / Role choice is currently discovered; choose Manual to enter one explicitly.';if(select.value==='__manual__'){help.textContent=isReturn?'Manual Return To is a named completion-signal recipient only; no Party / Role authority or Reference is inferred.':'Manual entry is label-only unless the Core creation contract and explicit Reference fields are completed. No Role / Party authority is inferred from the label.';return}if(select.value===''){help.textContent=generic;return}const suggestion=assist?.suggestions?.[Number(select.value)];if(!suggestion){help.textContent=generic;return}if(String(suggestion.reference||'').trim()){const prefix=String(suggestion.qualification||'')==='qualified-exact'?'Exact Core-qualified ':'Core-qualified internal ';help.textContent=isReturn?prefix+(suggestion.kind==='role'?'Role':'Party')+' resolution Reference will be preserved as the completion-signal Return To recipient.':prefix+(suggestion.kind==='role'?'Role':'Party')+' resolution Reference will be preserved in the Handoff.';return}if(isReturn){help.textContent='Return To candidate: the completion recipient label is preserved, but no Return To Reference is available. Return To does not create From/To endpoint-role material.';return}if(String(suggestion.kind||'')==='role'){help.textContent='Current Role candidate: Kind role is preserved but no Handoff Reference is available. When attached to Outgoing, Core requalifies this exact Workspace/path as package-local endpoint Role material during Pack.';return}help.textContent='Party candidate: Kind party is preserved, but Core did not qualify a Handoff Reference. Package manufacture may omit a semantic endpoint pointer for this party.'}
function renderEndpointControls(){const host=q('#endpointControls');if(!host)return;const prior=new Map(qa('[data-endpoint-assist]').map(select=>[select.dataset.endpointAssist,select.value]));const fields=model.sections.flatMap(section=>section.fields||[]).filter(field=>field.affordance?.control==='reference-picker');const html=fields.map(field=>{const selectionKey=field.affordance?.selectionKey||field.key;const assist=fieldAssists.find(item=>item.field===selectionKey);const suggestions=assist?.suggestions||[];const options=endpointSuggestionOptions(suggestions);const loading=host.dataset.loading==='true'&&!suggestions.length;const placeholder=loading?'Discovering…':'Select '+escapeHtml(field.affordance?.displayLabel||field.label)+'…';const manual=field.affordance?.manualAllowed===false?'':'<option value="__manual__">Manual…</option>';return '<label class="field"><span>'+escapeHtml(field.affordance?.displayLabel||field.label)+'</span><select data-endpoint-assist="'+escapeHtml(selectionKey)+'" data-required="'+(field.required?'true':'false')+'"><option value="">'+placeholder+'</option>'+options+manual+'</select><div class="help" data-endpoint-help></div></label>'});host.innerHTML=html.length?'<div class="grid endpoint-grid">'+html.join('')+'</div>':'';for(const select of qa('[data-endpoint-assist]')){const field=select.dataset.endpointAssist;const assist=fieldAssists.find(item=>item.field===field);setEndpointRawVisible(field,false);const previous=prior.get(field);const reference=String(initialValues?.[field+' Reference']||'').trim();const index=reference&&assist?(assist.suggestions||[]).findIndex(item=>String(item.reference||'').trim()===reference):-1;if(previous==='__manual__'){select.value='__manual__';setEndpointRawVisible(field,true)}else if(previous&&previous!==''&&assist?.suggestions?.[Number(previous)])select.value=previous;else if(index>=0)select.value=String(index);else if(String(initialValues?.[field]||'').trim()){select.value='__manual__';setEndpointRawVisible(field,true)}endpointSelectionHelp(select,assist);select.addEventListener('change',()=>{if(select.value==='__manual__'){setEndpointRawVisible(field,true);endpointSelectionHelp(select,assist);return}setEndpointRawVisible(field,false);if(select.value===''){exactSetField(field+' Reference','');endpointSelectionHelp(select,assist);return}const suggestion=assist?.suggestions?.[Number(select.value)];if(!suggestion)return;exactSetField(field,suggestion.value||suggestion.label||'');for(const [target,value] of Object.entries(suggestion.fills||{}))if(allField(target).length)exactSetField(target,value);endpointSelectionHelp(select,assist)})}}
function renderTransitionNeighborhood(){const host=q('#transitionNeighborhood');if(!host)return;if(!transitionDefinitions.length){host.innerHTML='';return}let html='<details class="card transition-neighborhood"><summary>Preset details</summary><div class="muted">Core-qualified Transition definitions available to this artifact type. Choosing a preset is always explicit.</div>';for(const item of transitionDefinitions){html+='<div class="transition-row"><div><strong>'+escapeHtml(item.label||item.canonicalIdentifier)+'</strong></div>'+(item.purpose?'<div class="help">'+escapeHtml(item.purpose)+'</div>':'')+'</div>'}host.innerHTML=html+'</details>'}
function renderTemplateOptions(){const select=q('#template');if(!select||!templates.length)return;const prior=select.value;select.innerHTML=templates.map(item=>'<option value=\"'+escapeHtml(item.id)+'\">'+escapeHtml(item.label)+'</option>').join('');const selected=${safeJson(input.selectedTemplateId || '')};if(prior&&templates.some(item=>item.id===prior))select.value=prior;else if(selected&&templates.some(item=>item.id===selected))select.value=selected}
function hydrateAuthoring(payload){if(Object.prototype.hasOwnProperty.call(payload,'fieldAssists'))hydrateParty(payload);if(Object.prototype.hasOwnProperty.call(payload,'templates')||Object.prototype.hasOwnProperty.call(payload,'transitionDefinitions'))hydrateTransitions(payload);if(Object.prototype.hasOwnProperty.call(payload,'attachAvailable'))applyHostState(payload)}
function hydrateParty(payload){fieldAssists=payload.fieldAssists||[];const endpointHost=q('#endpointControls');if(endpointHost)endpointHost.dataset.loading='false';renderEndpointControls();q('#status').textContent=payload.message||'Identity / Role discovery ready.'}
function hydrateTransitions(payload){if(Array.isArray(payload.templates))templates=payload.templates;if(Array.isArray(payload.transitionDefinitions))transitionDefinitions=payload.transitionDefinitions;renderTemplateOptions();renderTransitionNeighborhood();q('#status').textContent=payload.message||'Transition presets ready.'}
function applyHostState(payload){const available=!!payload.attachAvailable;const input=q('#attach');const label=q('#attachLabel');const reason=q('#attachReason');if(!input||!label)return;input.disabled=!available;if(!available)input.checked=false;label.classList.toggle('disabled',!available);if(reason)reason.textContent=available?'':('— '+String(payload.attachUnavailableReason||'unavailable for this artifact'))}
renderEndpointControls();renderTransitionNeighborhood();applyHostState({attachAvailable:${input.attachAvailable ? 'true' : 'false'},attachUnavailableReason:${safeJson(input.attachUnavailableReason || '')}});

function wireRepeatable(section){const items=q('.repeatable-items',section);const template=q('template.item-template',section);const none=q('[data-none]',section);let counter=0;function wireItem(item){q('.remove-item',item)?.addEventListener('click',()=>item.remove())}function add(entry){counter++;const html=template.innerHTML.replaceAll('9999',String(counter));items.insertAdjacentHTML('beforeend',html);const item=items.lastElementChild;wireItem(item);if(entry){q('[data-entry-name]',item).value=String(entry.name||'');for(const [field,value] of Object.entries(entry.fields||{})){const el=q('[data-field="'+CSS.escape(field)+'"]',item);if(el)el.value=String(value??'')}}return item}function update(){const disabled=!!none?.checked;items.style.display=disabled?'none':'';q('.add-item',section).style.display=disabled?'none':'';if(!disabled&&!q('.repeatable-item',items))add()}function setValue(value){if(value==='none'&&none){none.checked=true;items.innerHTML='';update();return}if(Array.isArray(value)){if(none)none.checked=false;items.innerHTML='';for(const entry of value)add(entry);update();return}}section.__tiinexSetTemplateValue=setValue;q('.add-item',section).addEventListener('click',()=>add());none?.addEventListener('change',update);qa('.repeatable-item',items).forEach(wireItem);update()}
qa('.repeatable-section').forEach(wireRepeatable);
// Event delegation covers optional fields and dynamically added declaration rows.
document.addEventListener('click',event=>{const button=event.target.closest?.('.reference-pick');if(!button)return;event.preventDefault();if(busy)return;vscode.postMessage({type:'pick-reference',field:button.dataset.referenceField,targetId:button.dataset.referenceTarget,append:button.dataset.referenceAppend==='true',workspaceId:q('#workspace').value})});
function resetTemplateField(key){const repeatable=qa('.repeatable-section').find(section=>section.dataset.input===key);if(repeatable){repeatable.__tiinexSetTemplateValue?.(repeatable.dataset.allowNone==='true'?'none':[]);return}const group=qa('.group-section').find(section=>section.dataset.input===key);if(group){for(const el of qa('[data-field]',group))el.value='';return}exactSetField(key,'')}function applyTemplate(){const id=q('#template')?.value||'';const t=templates.find(x=>x.id===id);q('#templateHelp')&&(q('#templateHelp').textContent=t?.description||'');const owned=[...new Set(templates.flatMap(x=>Object.keys(x.defaults||{})))];for(const key of owned)resetTemplateField(key);if(!t?.defaults)return;for(const [key,value] of Object.entries(t.defaults)){const repeatable=qa('.repeatable-section').find(section=>section.dataset.input===key);if(repeatable){repeatable.__tiinexSetTemplateValue?.(value);continue}const group=qa('.group-section').find(section=>section.dataset.input===key);if(group&&value&&typeof value==='object'&&!Array.isArray(value)){for(const [field,fieldValue] of Object.entries(value)){const el=q('[data-field="'+CSS.escape(field)+'"]',group);if(el)el.value=String(fieldValue??'')}continue}exactSetField(key,value)}}
q('#template')?.addEventListener('change',applyTemplate);q('#template')?.addEventListener('input',applyTemplate);applyTemplate();
for(const [input,value] of Object.entries(initialValues||{})){
 const composite=qa('.composite-section').find(el=>el.dataset.input===input);
 if(composite&&value&&typeof value==='object'&&!Array.isArray(value)){for(const [part,entries] of Object.entries(value)){const section=qa('.repeatable-section',composite).find(el=>el.dataset.input===part);section?.__tiinexSetTemplateValue?.(entries)}continue}
 const repeatable=qa('.repeatable-section').find(el=>!el.closest('.composite-section')&&el.dataset.input===input);
 if(repeatable){repeatable.__tiinexSetTemplateValue?.(value);continue}
 const group=qa('.group-section').find(el=>el.dataset.input===input);
 if(group&&value&&typeof value==='object'&&!Array.isArray(value)){for(const [field,entry] of Object.entries(value)){const el=q('[data-field="'+CSS.escape(field)+'"]',group);if(el)el.value=String(entry??'')}continue}
 if(typeof value==='string'){setField(input,value);const assist=fieldAssists.find(item=>item.field===input);if(assist)for(const el of allField(input))applyAssist(assist,el)}
} 
function valueOf(el){return String(el?.value??'').trim()}
function collect(){const values={};for(const section of qa('.ordinary-section'))for(const el of qa('[data-field]',section)){const v=valueOf(el);if(v)values[el.dataset.field]=v}for(const section of qa('.group-section')){const group={};for(const el of qa('[data-field]',section)){const v=valueOf(el);if(v)group[el.dataset.field]=v}values[section.dataset.input]=group}function repeatableValue(section){if(q('[data-none]',section)?.checked)return 'none';const entries=[];for(const item of qa('.repeatable-item',q('.repeatable-items',section))){const name=valueOf(q('[data-entry-name]',item));const fields={};for(const el of qa('[data-field]',item)){const v=valueOf(el);if(v)fields[el.dataset.field]=v}entries.push({name,fields})}return entries}for(const section of qa('.repeatable-section'))if(!section.closest('.composite-section'))values[section.dataset.input]=repeatableValue(section);for(const composite of qa('.composite-section')){const parts={};for(const section of qa('.repeatable-section',composite))parts[section.dataset.input]=repeatableValue(section);values[composite.dataset.input]=parts}return values}
function validate(){const errors=[];if(!valueOf(q('#title')))errors.push('Title is required.');for(const select of qa('[data-endpoint-assist]'))if(select.dataset.required==='true'&&!valueOf(select))errors.push((select.dataset.endpointAssist||'Reference')+' is required.');for(const el of qa('[required]')){if(!valueOf(el)&&el.offsetParent!==null)errors.push((el.dataset.field||'Required field')+' is required.')}for(const section of qa('.repeatable-section')){if(q('[data-none]',section)?.checked)continue;for(const item of qa('.repeatable-item',section)){if(!valueOf(q('[data-entry-name]',item)))errors.push(section.dataset.input+': entry name is required.')}}errors.push(...assistCapabilityErrors());return [...new Set(errors)]}
function endpointSelections(){const out={};for(const select of qa('[data-endpoint-assist]')){const field=select.dataset.endpointAssist;const assist=fieldAssists.find(item=>item.field===field);if(!assist||select.value===''||select.value==='__manual__')continue;const suggestion=assist.suggestions[Number(select.value)];if(suggestion)out[field]=suggestion}return out}function submission(){return{workspaceId:q('#workspace').value,title:valueOf(q('#title')),slug:valueOf(q('#slug')),templateId:q('#template')?.value||'',values:collect(),endpointSelections:endpointSelections(),attachToOutgoing:!!q('#attach')?.checked,closeWhenDone:q('#closeWhenDone')?.checked!==false}}
let busy=false;
const initialDisabled=new WeakMap();
function setBusy(action,busyNow){busy=busyNow;const actions=q('#actions');if(actions)actions.style.display='';for(const el of qa('input,select,textarea,button')){if(busyNow){initialDisabled.set(el,el.disabled);el.disabled=true}else if(initialDisabled.has(el)){el.disabled=initialDisabled.get(el);initialDisabled.delete(el)}}} 
function send(action){if(busy)return;const errors=validate();const box=q('#error');if(errors.length){box.style.display='block';box.textContent=errors.join(' ');return}box.style.display='none';setBusy(action,true);q('#status').textContent=action==='preview'?'Preparing preview…':'Creating…';vscode.postMessage({type:action,payload:submission()})}
q('#saveTransition')?.addEventListener('click',()=>{if(busy)return;vscode.postMessage({type:'save-transition',payload:submission()})});q('#preview').addEventListener('click',()=>send('preview'));q('#create').addEventListener('click',()=>send('create'));q('#cancel').addEventListener('click',()=>{if(!busy)vscode.postMessage({type:'cancel'})});
window.addEventListener('message',event=>{const msg=event.data||{};if(msg.type==='authoring-file-attached'){if(busy)return;
  const section=qa('.ordinary-section,.group-section,.repeatable-section').find(el=>String(el.dataset.section||el.dataset.input||'')===String(msg.sectionKey||''));
  const targets=section?qa('[data-field]',section).filter(el=>el.dataset.field===String(msg.field||'')):[];
  const target=targets.find(el=>!String(el.value||'').trim())||targets[0];
  if(target){const selected=String(msg.reference||'');const old=String(target.value||'').trim();
    if(selected){target.value=msg.append&&old?old+(old.includes(selected)?'':'; '+selected):selected;target.dispatchEvent(new Event('input',{bubbles:true}));q('#status').textContent=msg.deferred?'File attached. It will move with this artifact at Create.':'File reference attached to form.';}}
  else q('#status').textContent='The target field is not currently visible. No reference was added.';
  return;
}if(msg.type==='authoring-deferred-committed'){
  for(const replacement of msg.replacements||[])for(const field of qa('[data-field]')){
    if(typeof field.value==='string'&&field.value.includes(replacement.before)){
      field.value=field.value.replaceAll(replacement.before,replacement.after);
      field.dispatchEvent(new Event('input',{bubbles:true}));
    }
  }
  q('#status').textContent=msg.message||'Attached files committed.';return;
}if(msg.type==='authoring-reference-picked'){if(busy)return;const target=document.getElementById(String(msg.targetId||''));if(target&&target.matches('[data-field]')&&target.dataset.field===String(msg.field||'')){const selected=String(msg.reference||'');const old=String(target.value||'').trim();if(selected){target.value=msg.append&&old?old+(old.includes(selected)?'':'; '+selected):selected;target.dispatchEvent(new Event('input',{bubbles:true}))}}return}if(msg.type==='authoring-hydrate'){hydrateAuthoring(msg.payload||{});return}if(msg.type==='authoring-party-state'){hydrateParty(msg.payload||{});return}if(msg.type==='authoring-transition-state'){hydrateTransitions(msg.payload||{});return}if(msg.type==='authoring-host-state'){applyHostState(msg.payload||{});return}q('#status').textContent=msg.message||'';if(msg.type==='status')setBusy('preview',false);if(msg.type==='created')setBusy('create',false);if(msg.type==='error'){setBusy(msg.action==='preview'?'preview':'create',false);const box=q('#error');box.style.display='block';box.textContent=msg.message||'Blocked.'}});
vscode.postMessage({type:'authoring-ready'});
</script></body></html>`;
}

export function openArtifactAuthoringPanel(input: ArtifactAuthoringPanelInput, handlers: ArtifactAuthoringPanelHandlers): any {
  const activeColumn = Number((vscode.window as any).activeTextEditor?.viewColumn || 1);
  const panel = (vscode.window as any).createWebviewPanel('tiinex.artifactAuthoring', `New ${input.model.label}`, activeColumn, { enableScripts: true, retainContextWhenHidden: true });
  const nonce = `${Date.now()}-${Math.random().toString(36).slice(2)}`.replace(/[^a-zA-Z0-9]/g, '');
  panel.webview.onDidReceiveMessage(async (message: any) => {
    try {
      if (message?.type === 'authoring-ready') { await handlers.ready?.(panel); return; }
      if (message?.type === 'cancel') { panel.dispose(); return; }
      if (message?.type === 'pick-reference') {
        const field = String(message.field || '');
        // A host handler cannot be invoked for an unqualified field merely by
        // posting a forged webview message.
        const allowedField = input.model.sections.flatMap((section) => section.fields).find((item) =>
          item.key === field && item.affordance?.control === 'workspace-file-reference-picker');
        if (!allowedField || String(message.workspaceId || '') !== input.selectedWorkspaceId) throw new Error('tiinex.authoring.reference-field-not-qualified');
        const reference = await handlers.pickReference?.(field, input.selectedWorkspaceId);
        if (reference) await panel.webview.postMessage({ type: 'authoring-reference-picked', targetId: String(message.targetId || ''), field, reference, append: allowedField.affordance?.append === true });
        return;
      }
      if (message?.type === 'save-transition') {
        if (!input.enableSaveAsTransition || !handlers.saveTransition) throw new Error('tiinex.authoring.save-transition-unavailable');
        const submission = message.payload as ArtifactAuthoringSubmission;
        if (submission.workspaceId !== input.selectedWorkspaceId) throw new Error('tiinex.authoring.save-transition-workspace-mismatch');
        await handlers.saveTransition(submission);
        return;
      }
      if (message?.type === 'preview') {
        await handlers.preview(message.payload as ArtifactAuthoringSubmission);
        await panel.webview.postMessage({ type: 'status', message: 'Preview ready.' });
        return;
      }
      if (message?.type === 'create') {
        const submission = message.payload as ArtifactAuthoringSubmission;
        await handlers.create(submission);
        if (submission.closeWhenDone !== false) panel.dispose();
        else await panel.webview.postMessage({ type: 'created', message: 'Created.' });
      }
    } catch (error) {
      const text = error instanceof Error ? error.message : String(error);
      await panel.webview.postMessage({ type: 'error', action: message?.type === 'preview' ? 'preview' : 'create', message: text });
    }
  });
  panel.webview.html = html(input, nonce);
  return panel;
}
