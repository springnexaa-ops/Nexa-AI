(()=>{
'use strict';
const AUTH='nexa.user.session';
const history=[];
let installed=false;
const wait=()=>{
  if(installed)return;
  if(!window.NexaApp||typeof window.NexaApp.chat!=='function'){setTimeout(wait,50);return}
  installed=true;
  window.NexaApp.chat=async function(text,mode='auto'){
    text=String(text||'').trim();
    if(!text)return '';
    const selected=String(mode||'auto').toLowerCase();
    const medical=selected==='medical';
    const system=medical
      ? 'You are Nexa AI Medical, powered by SpringNexa Private Limited. Provide medical education and decision support, not a definitive diagnosis or prescription. Distinguish possibilities from diagnosis. For emergencies advise immediate local medical care. Do not invent clinicians, hospitals, medical records, statistics or citations. Clearly state when clinician review is needed.'
      : 'You are Nexa AI, powered by SpringNexa Private Limited. Be accurate, useful and concise. Never invent facts, citations, doctors, hospitals or credentials.';
    const messages=[
      {role:'system',content:system},
      ...history.slice(-20),
      {role:'user',content:text}
    ];
    const headers={'content-type':'application/json'};
    const token=sessionStorage.getItem(AUTH);
    if(token)headers.authorization='Bearer '+token;
    // Medical mode uses the normal reliable provider routing instead of the
    // legacy dedicated "medical" provider route, which can return
    // medical:400 / medical:not_supported when its optional backend is absent.
    // The medical safety/system instructions remain active above.
    const provider=medical?'auto':selected;
    const r=await fetch('/v1/chat/completions',{method:'POST',headers,cache:'no-store',body:JSON.stringify({mode:provider,language:localStorage.getItem('nexa.language')||'English',messages})});
    let d=null;try{d=await r.json()}catch{}
    if(!r.ok){
      const detail=d?.detail?` (${d.detail})`:'';
      if(d?.code==='GUEST_LIMIT_REACHED')window.dispatchEvent(new CustomEvent('nexa:guest-limit'));
      throw new Error((d?.error||`Nexa AI request failed (${r.status})`)+detail);
    }
    const answer=d?.choices?.[0]?.message?.content;
    if(typeof answer!=='string'||!answer.trim())throw new Error('Nexa AI returned an empty response.');
    history.push({role:'user',content:text},{role:'assistant',content:answer});
    return answer;
  };
};
wait();
})();
