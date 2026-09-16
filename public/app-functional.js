(()=>{
'use strict';
const $=(s,r=document)=>r.querySelector(s);
let history=[],lastAnswer='',busy=false;
const esc=s=>String(s??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));
async function api(path,options={}){const r=await fetch(path,{cache:'no-store',...options,headers:{'content-type':'application/json',...(options.headers||{})}});let d=null;try{d=await r.json()}catch{}if(!r.ok)throw new Error(d?.error||`HTTP ${r.status}`);return d}
function wantsEEG(text){return /\b(analy[sz]e|review|interpret|read|check)\b.*\b(uploaded|attached|this|the)\b.*\b(eeg|electroencephalogram)\b/i.test(text)||/\b(analy[sz]e|review|interpret|read|check)\b.*\b(eeg)\b/i.test(text)}
async function analyzeUploadedEEG(){
 if(!window.NexaFiles?.getLast)throw new Error('File workspace is not ready. Please refresh once and upload the EEG PDF again.');
 const saved=await window.NexaFiles.getLast();
 if(!saved?.blob)throw new Error('No uploaded EEG PDF is available. Upload the EEG PDF first, then ask me to analyse it.');
 const fd=new FormData();fd.append('file',saved.blob,saved.name||'uploaded-eeg.pdf');
 const r=await fetch('/v1/files/analyze-eeg',{method:'POST',body:fd,cache:'no-store',headers:{accept:'application/json'}});
 const raw=await r.text();let d=null;try{d=JSON.parse(raw)}catch{}
 if(!r.ok||d?.ok===false)throw new Error(d?.error||d?.detail||`EEG analysis failed (HTTP ${r.status})`);
 return d;
}
async function chat(text,mode='auto'){
 text=String(text||'').trim();if(!text||busy)return '';
 busy=true;
 const ta=$('textarea.composerInput')||$('.composer textarea')||$('textarea');if(ta)ta.value='';
 history.push({role:'user',content:text});
 try{
  if(wantsEEG(text)){
   const d=await analyzeUploadedEEG();
   lastAnswer=d.analysis||'No EEG analysis was returned.';
   history.push({role:'assistant',content:lastAnswer});
   return lastAnswer;
  }
  const payloadHistory=history.slice(-8);
  const d=await api('/v1/chat/completions',{method:'POST',body:JSON.stringify({mode,model:'@cf/zai-org/glm-4.7-flash',language:localStorage.getItem('nexa.language')||'English',messages:payloadHistory})});
  lastAnswer=d?.choices?.[0]?.message?.content||'';
  history.push({role:'assistant',content:lastAnswer});
  return lastAnswer;
 }finally{busy=false}
}
function clearChat(){history=[];lastAnswer='';}
window.NexaApp={chat,api,clearChat,get lastAnswer(){return lastAnswer}};
window.NexaFast={esc};
})();
