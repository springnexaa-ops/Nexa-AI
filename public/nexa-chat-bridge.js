(()=>{
'use strict';
const AUTH='nexa.user.session';
const history=[];
let installed=false;

async function postFile(endpoint,file,question=''){
  const fd=new FormData();
  fd.append('file',file.blob,file.name||'uploaded-file');
  if(question)fd.append('question',String(question).slice(0,4000));
  const headers={accept:'application/json'};
  const token=sessionStorage.getItem(AUTH);
  if(token)headers.authorization='Bearer '+token;
  const r=await fetch(endpoint,{method:'POST',headers,body:fd,cache:'no-store'});
  let d=null;try{d=await r.json()}catch{}
  if(!r.ok||d?.ok===false)throw new Error(d?.error||d?.detail||('File analysis failed (HTTP '+r.status+')'));
  return d;
}
async function analyzeAttachment(file,question){
  return postFile('/v1/files/analyze',file,question);
}

const wait=()=>{
  if(installed)return;
  if(!window.NexaApp||typeof window.NexaApp.chat!=='function'){
    setTimeout(wait,50);
    return;
  }

  installed=true;
  window.NexaApp.chat=async function(text,mode='auto'){
    text=String(text||'').trim();
    const attachment=await window.NexaFiles?.getLast?.();

    if(attachment){
      const d=await analyzeAttachment(attachment,text);
      const documentType=String(d?.documentType||'Unknown Document').trim();
      window.NexaFiles?.clear?.();

      // Use the document-specific clinical workflow. EEG reports receive
      // the dedicated EEG structure; other document types return their
      // detected type until their dedicated analyzer is selected.
      const answer=String(d?.analysis||documentType).trim();

      history.push(
        {role:'user',content:text||('Uploaded '+attachment.name)},
        {role:'assistant',content:answer}
      );
      return answer;
    }

    if(!text)return '';

    const selected=String(mode||'auto').toLowerCase();
    const medical=selected==='medical';
    const system=medical
      ? 'You are Nexa AI Medical, powered by SpringNexa Private Limited. You can receive PDF and image attachments through the Nexa + File control. When an attachment is present, the file workflow returns only its detected document type. Do not claim the interface cannot read PDFs. Provide medical education and decision support only when no attachment is being classified.'
      : 'You are Nexa AI, powered by SpringNexa Private Limited. You can receive PDF and image attachments through the Nexa + File control. When an attachment is present, the file workflow returns only its detected document type. Do not claim the interface cannot read PDFs. Be accurate, useful and concise.';

    const messages=[
      {role:'system',content:system},
      ...history.slice(-20),
      {role:'user',content:text}
    ];
    const headers={'content-type':'application/json'};
    const token=sessionStorage.getItem(AUTH);
    if(token)headers.authorization='Bearer '+token;
    const provider=medical?'auto':selected;

    const r=await fetch('/v1/chat/completions',{
      method:'POST',
      headers,
      cache:'no-store',
      body:JSON.stringify({
        mode:provider,
        language:localStorage.getItem('nexa.language')||'English',
        messages
      })
    });

    let d=null;
    try{d=await r.json()}catch{}
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
