(()=>{
'use strict';
const AUTH='nexa.user.session';
const history=[];
let installed=false;
function isPdf(file){return /\.pdf$/i.test(file?.name||'')||file?.type==='application/pdf';}
function isEegQuestion(text){return /\b(eeg|electroencephalogram|electroencephalography|seizure|epileptiform|ictal|background rhythm)\b/i.test(text||'');}
async function analyzeAttachment(file,question){
  const fd=new FormData();
  fd.append('file',file.blob,file.name||'uploaded-file');
  fd.append('question',question||'');
  const endpoint=isPdf(file)&&isEegQuestion(question)?'/v1/files/analyze-eeg':'/v1/files/analyze';
  const headers={accept:'application/json'};
  const token=sessionStorage.getItem(AUTH);
  if(token)headers.authorization='Bearer '+token;
  const r=await fetch(endpoint,{method:'POST',headers,body:fd,cache:'no-store'});
  let d=null;try{d=await r.json()}catch{}
  if(!r.ok||d?.ok===false)throw new Error(d?.error||d?.detail||('File analysis failed (HTTP '+r.status+')'));
  return d;
}
const wait=()=>{
  if(installed)return;
  if(!window.NexaApp||typeof window.NexaApp.chat!=='function'){setTimeout(wait,50);return}
  installed=true;
  window.NexaApp.chat=async function(text,mode='auto'){
    text=String(text||'').trim();
    if(!text)return '';
    const selected=String(mode||'auto').toLowerCase();
    const medical=selected==='medical';
    const attachment=await window.NexaFiles?.getLast?.();
    if(attachment){
      const d=await analyzeAttachment(attachment,text);
      window.NexaFiles?.clear?.();
      const answer=d?.analysis||d?.message||'The file was uploaded successfully, but no analysis was returned.';
      history.push({role:'user',content:text||('Uploaded '+attachment.name)},{role:'assistant',content:answer});
      return answer;
    }
    const system=medical
      ? 'You are Nexa AI Medical, powered by SpringNexa Private Limited. You can receive PDF, image and supported document attachments through the Nexa + File control. If the user asks whether PDFs/documents can be uploaded, answer yes. If a file is attached, analyze the actual attachment through the file-analysis workflow; never claim that this interface cannot read PDFs. Provide medical education and decision support, not a definitive diagnosis or prescription. Distinguish possibilities from diagnosis and clearly state when clinician review is needed.'
      : 'You are Nexa AI, powered by SpringNexa Private Limited. You can receive PDF, image and supported document attachments through the Nexa + File control. If the user asks whether PDFs/documents can be uploaded, answer yes. If a file is attached, it is handled by Nexa file intelligence; never claim that this interface cannot read PDFs. Be accurate, useful and concise.';
    const messages=[{role:'system',content:system},...history.slice(-20),{role:'user',content:text}];
    const headers={'content-type':'application/json'};
    const token=sessionStorage.getItem(AUTH);
    if(token)headers.authorization='Bearer '+token;
    const provider=medical?'auto':selected;
    const r=await fetch('/v1/chat/completions',{method:'POST',headers,cache:'no-store',body:JSON.stringify({mode:provider,language:localStorage.getItem('nexa.language')||'English',messages})});
    let d=null;try{d=await r.json()}catch{}
    if(!r.ok){
      const detail=d?.detail?' ('+d.detail+')':'';
      if(d?.code==='GUEST_LIMIT_REACHED')window.dispatchEvent(new CustomEvent('nexa:guest-limit'));
      throw new Error((d?.error||('Nexa AI request failed ('+r.status+')'))+detail);
    }
    const answer=d?.choices?.[0]?.message?.content;
    if(typeof answer!=='string'||!answer.trim())throw new Error('Nexa AI returned an empty response.');
    history.push({role:'user',content:text},{role:'assistant',content:answer});
    return answer;
  };
};
wait();
})();