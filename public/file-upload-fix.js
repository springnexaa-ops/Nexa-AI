(()=>{
'use strict';
const escapeHtml=s=>String(s??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));
const DB='nexa-files',STORE='files';
function db(){return new Promise((resolve,reject)=>{const r=indexedDB.open(DB,1);r.onupgradeneeded=()=>r.result.createObjectStore(STORE,{keyPath:'id'});r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error||new Error('IndexedDB unavailable'));});}
async function saveLast(file){const d=await db();await new Promise((resolve,reject)=>{const t=d.transaction(STORE,'readwrite');t.objectStore(STORE).put({id:'last',name:file.name,type:file.type,size:file.size,blob:file});t.oncomplete=resolve;t.onerror=()=>reject(t.error||new Error('Could not save uploaded file'));});}
async function getLast(){const d=await db();return await new Promise((resolve,reject)=>{const t=d.transaction(STORE,'readonly'),r=t.objectStore(STORE).get('last');r.onsuccess=()=>resolve(r.result||null);r.onerror=()=>reject(r.error);});}
async function readResponse(response){const text=await response.text();if(!text.trim())throw new Error(`Upload service returned an empty response (HTTP ${response.status}).`);try{return JSON.parse(text)}catch{const type=response.headers.get('content-type')||'unknown';throw new Error(`Upload service returned ${type} instead of JSON (HTTP ${response.status}).`);}}
async function upload(input){
 const out=document.getElementById('nxOut'),file=input?.files?.[0];if(!file||!out)return;
 out.innerHTML='<div style="margin-top:12px;color:#687586">Uploading…</div>';
 try{
  const fd=new FormData();fd.append('file',file,file.name);
  const response=await fetch('/v1/files/inspect',{method:'POST',body:fd,headers:{accept:'application/json'},cache:'no-store'});
  const data=await readResponse(response);if(!response.ok||data.ok===false)throw new Error(data.error||data.message||`Upload failed (HTTP ${response.status}).`);
  const info=data.file||{};const text=String(data.text||'');
  await saveLast(file);
  const isPdf=file.type==='application/pdf'||/\.pdf$/i.test(file.name);
  const ready=isPdf?'<div style="margin-top:10px;padding:10px;border-radius:8px;background:#eef7ff;color:#24557a">✓ PDF is ready. Open Chat and ask <strong>“Analyse uploaded EEG”</strong> to send this file to Nexa AI Medical.</div>':'';
  const preview=text?`<pre style="white-space:pre-wrap;max-height:320px;overflow:auto;margin-top:10px;padding:12px;background:#f7f8fa;border-radius:8px">${escapeHtml(text.slice(0,12000))}</pre>`:'';
  const note=data.message||'File uploaded successfully.';
  out.innerHTML=`<div style="margin-top:12px;padding:12px;border:1px solid #dce3e9;border-radius:10px;background:#fbfcfd"><strong>✓ ${escapeHtml(info.name||file.name)}</strong><div style="margin-top:5px;color:#687586;font-size:12px">${escapeHtml(info.type||file.type||'unknown')} · ${escapeHtml(String(info.sizeMB??(file.size/1048576).toFixed(2)))} MB</div><div style="margin-top:8px;color:#394655;line-height:1.5">${escapeHtml(note)}</div>${ready}${preview}</div>`;
 }catch(error){out.innerHTML=`<div style="margin-top:12px;padding:12px;border:1px solid #f0caca;border-radius:10px;background:#fff7f7;color:#8a3030">Upload failed: ${escapeHtml(error?.message||'Unknown upload error')}</div>`;}
}
document.addEventListener('change',event=>{const input=event.target;if(!(input instanceof HTMLInputElement)||input.id!=='nxFile')return;event.stopImmediatePropagation();void upload(input);},true);
window.NexaFiles={getLast};
})();
