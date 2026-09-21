import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import path from 'node:path';
import process from 'node:process';

const root=process.cwd();
const statePath=path.join(root,'.vscode','link','dependency-mode.json');
const requested=String(process.argv[2]||'install').trim().toLowerCase();
async function state(){ try { return JSON.parse(await readFile(statePath,'utf8')); } catch { return {mode:'published'}; } }
async function save(mode){ await mkdir(path.dirname(statePath),{recursive:true}); await writeFile(statePath,JSON.stringify({mode,coreRoot:'../core'},null,2)+'\n','utf8'); }
function run(args){ return new Promise((resolve,reject)=>{ const child=spawn('npm',args,{cwd:root,stdio:'inherit',shell:process.platform==='win32'}); child.on('exit',c=>c===0?resolve():reject(new Error(`npm exited ${c}`))); child.on('error',reject); }); }
async function installForMode(mode){ await run(['install']); if(mode==='local') await run(['install','--no-save','--package-lock=false','--install-links','file:../core']); }
if(requested==='local'){ await save('local'); await run(['pack','--dry-run','../core']); await run(['install','--no-save','--package-lock=false','--install-links','file:../core']); console.log('Tiinex Core mode: local'); }
else if(requested==='published'||requested==='latest'){ await save('published'); await run(['install','--no-save','--package-lock=false','@tiinex/core@latest']); console.log('Tiinex Core mode: published'); }
else if(requested==='install'){ const s=await state(); const mode=s.mode==='local'?'local':'published'; await installForMode(mode); console.log(`Tiinex Core mode preserved: ${mode}`); }
else throw new Error(`Unknown mode: ${requested}`);
