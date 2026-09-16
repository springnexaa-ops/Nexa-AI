(()=>{
'use strict';
const $=(s,r=document)=>r.querySelector(s);
let history=[],lastAnswer='',busy=false;
const esc=s=>String(s??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));
async function api(path,options={}){const r=await fetch(path,{cache:'no-store',...options,headers:{'content-type':'application/json',...(options.headers||{})}});let d=null;try{d=await r.json()}catch{}if(!r.ok)throw new Error(d?.error||`HTTP ${r.status}`);return d}
async function chat(text,mode='auto'){
 text=String(text||'').trim();if(!text||busy)return '';
 busy=true;
 const ta=$('textarea.composerInput')||$('.composer textarea')||$('textarea');if(ta)ta.value='';
 history.push({role:'user',content:text});
 // Keep the context window small for low latency while preserving recent conversation continuity.
 const payloadHistory=history.slice(-8);
 try{
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
