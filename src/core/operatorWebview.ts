function inlineJson(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

export function operatorClientScript(model: unknown, authoringEpoch: number, packageEpoch: number): string {
  const packageJson = inlineJson(model);
  return `const vscode=acquireVsCodeApi();
const model=${packageJson};
const authoringEpoch=${authoringEpoch};
const packageEpoch=${packageEpoch};
const q=(s)=>document.querySelector(s);
let state=vscode.getState()||{};
if(state.authoringEpoch!==authoringEpoch)state={...state,authoringEpoch,handoff:null};
if(state.packageEpoch!==packageEpoch)state={...state,packageEpoch,package:null};
vscode.setState(state);
document.querySelectorAll('[data-section]').forEach(b=>b.addEventListener('click',()=>{const section=b.dataset.section;document.querySelectorAll('body>section').forEach(s=>s.classList.toggle('hidden',s.id!==section));vscode.postMessage({type:'section',section});}));
q('#landPackage')?.addEventListener('click',()=>vscode.postMessage({type:'landPackage'}));
q('#refreshDiagnostics')?.addEventListener('click',()=>vscode.postMessage({type:'refreshDiagnostics'}));
q('#showProblems')?.addEventListener('click',()=>vscode.postMessage({type:'showProblems'}));
q('#openSettings')?.addEventListener('click',()=>vscode.postMessage({type:'openSettings'}));
q('#selectInbox')?.addEventListener('click',()=>vscode.postMessage({type:'selectInbox'}));
q('#useActiveParent')?.addEventListener('click',()=>vscode.postMessage({type:'useActiveParent'}));
q('#clearParent')?.addEventListener('click',()=>vscode.postMessage({type:'clearParent'}));
q('#reloadPackage')?.addEventListener('click',()=>vscode.postMessage({type:'reloadPackage'}));
q('#openPackageBuilder')?.addEventListener('click',()=>vscode.postMessage({type:'openPackageBuilder'}));
q('#returnToAuthoring')?.addEventListener('click',()=>vscode.postMessage({type:'returnToAuthoring'}));
const handoffForm=q('#handoffForm');
if(handoffForm&&state.handoff){for(const [name,value] of Object.entries(state.handoff)){const field=handoffForm.elements.namedItem(name);if(field&&typeof value==='string')field.value=value;}}
function syncEndpoint(prefix){if(!handoffForm)return;const kind=handoffForm.elements.namedItem(prefix+'Kind');const select=q('#'+prefix+'Qualified');const unknown=q('#'+prefix+'Unknown');const label=handoffForm.elements.namedItem(prefix);const reference=handoffForm.elements.namedItem(prefix+'Reference');if(!kind||!select||!unknown||!label||!reference)return;const chosen=select.selectedOptions[0];if(chosen?.value==='__unknown__'){kind.value='unknown';unknown.classList.remove('hidden');label.value=unknown.value.trim();reference.value='';return;}unknown.classList.add('hidden');if(chosen?.value){kind.value=chosen.dataset.kind||'';label.value=chosen.dataset.label||'';reference.value=chosen.value;return;}kind.value='';label.value='';reference.value='';}
function syncEndpoints(){syncEndpoint('from');syncEndpoint('to');}
syncEndpoints();
for(const prefix of ['from','to']){q('#'+prefix+'Qualified')?.addEventListener('change',()=>{syncEndpoint(prefix);saveHandoff();});q('#'+prefix+'Unknown')?.addEventListener('input',()=>{syncEndpoint(prefix);saveHandoff();});}
function saveHandoff(){if(!handoffForm)return;syncEndpoints();state={...state,authoringEpoch,handoff:Object.fromEntries(new FormData(handoffForm).entries())};vscode.setState(state);}
handoffForm?.addEventListener('input',saveHandoff);
handoffForm?.addEventListener('change',saveHandoff);
handoffForm?.addEventListener('submit',(e)=>{e.preventDefault();saveHandoff();const data=Object.fromEntries(new FormData(e.target).entries());vscode.postMessage({type:'createHandoff',data});});
const route=q('#route');
if(route&&state.package?.routeId&&model.routes.some(r=>r.id===state.package.routeId))route.value=state.package.routeId;
if(state.package?.workspaceIds){document.querySelectorAll('input[name=workspace]').forEach(x=>{x.checked=state.package.workspaceIds.includes(x.value);});}
function updatePackage(){if(!route)return;const selected=model.routes.find(r=>r.id===route.value);const work=[...document.querySelectorAll('input[name=workspace]:checked')].map(x=>x.value);const detail=q('#routeDetail');const preview=q('#packagePreview');if(detail)detail.textContent=selected?.pointerless?'No Handoff pointer. No From/To or Handoff route semantics are created.':(selected?('From/To (read-only): '+selected.from+' → '+selected.to+'\\n'+(selected.detail||'')):'');if(preview)preview.textContent=(selected?.pointerless?'Workspace carrier':'Handoff carrier')+'\\nWorkspaces: '+(work.join(', ')||'(none)');state={...state,packageEpoch,package:{routeId:route.value,workspaceIds:work}};vscode.setState(state);}
route?.addEventListener('change',updatePackage);
document.querySelectorAll('input[name=workspace]').forEach(x=>x.addEventListener('change',updatePackage));
updatePackage();
q('#buildPackage')?.addEventListener('click',()=>{const workspaceIds=[...document.querySelectorAll('input[name=workspace]:checked')].map(x=>x.value);vscode.postMessage({type:'buildPackage',data:{routeId:route?.value||'',workspaceIds}});});`;
}
