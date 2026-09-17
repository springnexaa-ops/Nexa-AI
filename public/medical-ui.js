(()=>{
'use strict';
const $=(s,r=document)=>r.querySelector(s);
const esc=v=>String(v??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));
let mounted=false, attachment=null;

const style=`<style id="nexaMedicalUI">
.nxMedicalStage{width:min(1040px,100%);margin:0 auto;padding:18px 18px 0;box-sizing:border-box}
.nxMedicalHeader{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:13px 15px;border:1px solid rgba(83,205,222,.2);border-radius:16px;background:linear-gradient(135deg,rgba(4,35,49,.88),rgba(5,20,34,.86));box-shadow:0 14px 40px rgba(0,0,0,.16)}
.nxMedicalIdentity{display:flex;align-items:center;gap:11px;min-width:0}.nxMedicalIcon{width:38px;height:38px;border-radius:12px;display:grid;place-items:center;background:rgba(52,210,220,.12);border:1px solid rgba(84,218,227,.24);font-size:19px}.nxMedicalIdentity b{display:block;font-size:14px}.nxMedicalIdentity span{display:block;margin-top:3px;color:#86aabd;font-size:9px}
.nxMedicalBadge{border:1px solid rgba(82,219,190,.22);background:rgba(45,179,148,.08);color:#6ee3c0;border-radius:20px;padding:7px 10px;font-size:9px;font-weight:800;white-space:nowrap}
.nxMedicalGrid{display:grid;grid-template-columns:repeat(4,1fr);gap:9px;margin:12px 0}.nxMedicalCard{border:1px solid rgba(91,163,193,.18);background:rgba(5,25,40,.68);border-radius:13px;padding:11px;text-align:left;color:#cde1ed;cursor:pointer;transition:.16s}.nxMedicalCard:hover,.nxMedicalCard:focus{border-color:rgba(82,213,225,.46);background:rgba(8,37,54,.84);transform:translateY(-1px);outline:0}.nxMedicalCard b{display:block;font-size:10px;margin-bottom:4px}.nxMedicalCard span{display:block;color:#7896a9;font-size:8px;line-height:1.35}.nxMedicalBody{display:flex;flex-direction:column;gap:10px}.nxMedicalComposer{border:1px solid rgba(80,199,218,.28)!important;background:linear-gradient(145deg,rgba(4,25,39,.96),rgba(3,16,27,.96))!important;box-shadow:0 20px 55px rgba(0,0,0,.24)!important}.nxMedicalComposer textarea{min-height:78px!important}.nxMedicalTools{display:flex;align-items:center;gap:7px;flex-wrap:wrap}.nxMedTool{border:1px solid rgba(96,167,192,.2);background:rgba(13,39,54,.72);color:#b9d3df;border-radius:10px;padding:9px 11px;font-size:10px;font-weight:700;display:inline-flex;align-items:center;gap:6px}.nxMedTool:hover{background:rgba(22,65,84,.85);color:#fff;border-color:rgba(82,207,222,.38)}.nxMedTool input{display:none}.nxMedHint{font-size:8px;color:#68869a;margin-left:auto}.nxMedicalAttach{display:none;align-items:center;gap:9px;padding:9px 11px;border:1px solid rgba(82,207,222,.2);border-radius:11px;background:rgba(10,39,52,.72);margin:0 8px}.nxMedicalAttach.on{display:flex}.nxMedicalAttachIcon{font-size:16px}.nxMedicalAttachText{min-width:0;flex:1}.nxMedicalAttachText b{display:block;font-size:9px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.nxMedicalAttachText span{display:block;color:#7695a7;font-size:8px;margin-top:2px}.nxMedicalRemove{border:0;background:transparent;color:#8ba9b9;font-size:16px;padding:2px 5px}.nxMedicalDisclaimer{display:flex;gap:8px;align-items:flex-start;border:1px solid rgba(197,166,91,.16);background:rgba(76,59,20,.14);border-radius:11px;padding:10px 11px;color:#b9aa7c;font-size:8px;line-height:1.5}.nxMedicalSections{display:grid;grid-template-columns:repeat(3,1fr);gap:9px}.nxMedicalSection{border:1px solid rgba(83,149,180,.16);border-radius:12px;background:rgba(5,23,37,.5);padding:11px}.nxMedicalSection b{display:block;font-size:9px;color:#8fd9e6;margin-bottom:4px}.nxMedicalSection span{display:block;color:#7893a5;font-size:8px;line-height:1.45}
.nxMsg.ai .nxMedicalResponse{border-left:2px solid rgba(80,211,222,.45);padding-left:12px}.nxMedicalResponse h1,.nxMedicalResponse h2,.nxMedicalResponse h3{font-size:13px;margin:14px 0 6px;color:#a9e6ee}.nxMedicalResponse p{margin:7px 0}.nxMedicalResponse ul{padding-left:18px}.nxMedicalResponse .nxEvidenceLabel{color:#70ddc4;font-size:8px;text-transform:uppercase;letter-spacing:.12em;font-weight:800}
@media(max-width:760px){.nxMedicalStage{padding:10px 10px 0}.nxMedicalHeader{padding:11px}.nxMedicalGrid{grid-template-columns:repeat(2,1fr)}.nxMedicalSections{grid-template-columns:1fr}.nxMedHint{width:100%;margin-left:0}.nxMedicalBadge{font-size:8px}.nxMedicalIdentity span{font-size:8px}}
@media(max-width:430px){.nxMedicalIdentity b{font-size:12px}.nxMedicalIcon{width:34px;height:34px}.nxMedicalGrid{gap:7px}.nxMedicalCard{padding:10px}.nxMedTool{flex:1;justify-content:center;padding:10px 8px}.nxMedicalComposer textarea{min-height:72px!important}}
</style>`;

function fileKind(file){
 const n=(file?.name||'').toLowerCase();
 if(file?.type?.startsWith('image/'))return 'image';
 if(n.endsWith('.pdf'))return 'pdf';
 if(/\.(edf|edf\+|eeg)$/i.test(n))return 'eeg';
 return 'file';
}
function addAttachment(file){
 if(!file)return;
 attachment=file;
 const box=$('.nxMedicalAttach');
 if(!box)return;
 const kind=fileKind(file);
 $('.nxMedicalAttachIcon',box).textContent=kind==='image'?'🖼️':kind==='pdf'?'📄':kind==='eeg'?'〽️':'📎';
 $('.nxMedicalAttachText b',box).textContent=file.name||'Medical attachment';
 $('.nxMedicalAttachText span',box).textContent=`${kind.toUpperCase()} • ${Math.max(1,Math.round((file.size||0)/1024))} KB • Ready to send`;
 box.classList.add('on');
}
function mount(){
 if(mounted||!document.body.contains($('#nexaConsumer')))return;
 const model=$('#nxModel');
 if(!model)return;
 const isMedical=String(model.value||'').toLowerCase()==='medical';
 const chat=$('.nxChat');
 if(!isMedical||!chat)return;
 mounted=true;
 if(!$('#nexaMedicalStyle')){document.head.insertAdjacentHTML('beforeend',style.replace('id="nexaMedicalUI"','id="nexaMedicalStyle"'));}
 const messages=$('.nxMessages',chat), composer=$('.nxComposer',chat);
 if(!composer)return;
 const stage=document.createElement('div');stage.className='nxMedicalStage';
 stage.innerHTML=`
 <section class="nxMedicalHeader" aria-label="Nexa Medical workspace">
  <div class="nxMedicalIdentity"><div class="nxMedicalIcon">✚</div><div><b>Nexa Medical</b><span>Clinical education & decision-support workspace</span></div></div>
  <div class="nxMedicalBadge">● MEDICAL MODE</div>
 </section>
 <div class="nxMedicalGrid" role="list">
  <button class="nxMedicalCard" data-medical-prompt="Help me understand these NCS findings"><b>〽️ NCS / NCV</b><span>Interpret latency, amplitude, velocity and pattern</span></button>
  <button class="nxMedicalCard" data-medical-prompt="Help me structure an EMG interpretation"><b>📈 EMG</b><span>Needle findings, recruitment and localization</span></button>
  <button class="nxMedicalCard" data-medical-prompt="Explain this EEG finding and what should be reviewed"><b>〰️ EEG</b><span>Rhythm, discharges and clinical context</span></button>
  <button class="nxMedicalCard" data-medical-prompt="What clinical details should I collect before interpreting this study?"><b>🩺 Clinical history</b><span>Symptoms, exam and referral question</span></button>
 </div>
 <div class="nxMedicalSections">
  <div class="nxMedicalSection"><b>1 · Clinical question</b><span>Tell NEXA why the study was requested and the key symptoms.</span></div>
  <div class="nxMedicalSection"><b>2 · Study data</b><span>Upload a report, PDF, image or compatible electrophysiology file.</span></div>
  <div class="nxMedicalSection"><b>3 · Review</b><span>Use the structured explanation as decision support and verify with a clinician.</span></div>
 </div>
 <div class="nxMedicalDisclaimer">⚕️ <span>Medical mode provides educational and decision-support information. It does not replace a qualified clinician's examination, diagnosis or treatment decision. For emergencies, seek local emergency care.</span></div>
 </section>`;
 const content=$('.nxContent');
 if(content)content.insertBefore(stage,chat);

 const tools=$('.nxTools',composer)||composer.querySelector('.nxBar');
 if(tools){
  const wrap=document.createElement('div');wrap.className='nxMedicalTools';
  wrap.innerHTML=`
   <label class="nxMedTool" title="Upload medical file">📎 Upload<input class="nxMedUpload" type="file" accept=".pdf,.edf,.edf+,.eeg,.txt,.csv,image/*,application/pdf"></label>
   <label class="nxMedTool" title="Capture a clinical image">📷 Capture<input class="nxMedCapture" type="file" accept="image/*" capture="environment"></label>
   <button type="button" class="nxMedTool nxMedClear">＋ Add study</button>
   <span class="nxMedHint">PDF • EEG • NCS/EMG report • image</span>`;
  tools.prepend(wrap);
  $('.nxMedUpload',wrap).addEventListener('change',e=>addAttachment(e.target.files?.[0]));
  $('.nxMedCapture',wrap).addEventListener('change',e=>addAttachment(e.target.files?.[0]));
  $('.nxMedClear',wrap).addEventListener('click',()=>{attachment=null;const b=$('.nxMedicalAttach');if(b)b.classList.remove('on');});
 }
 composer.classList.add('nxMedicalComposer');
 const attach=document.createElement('div');attach.className='nxMedicalAttach';attach.innerHTML=`<div class="nxMedicalAttachIcon">📎</div><div class="nxMedicalAttachText"><b>Attachment</b><span>Ready to send</span></div><button class="nxMedicalRemove" type="button" aria-label="Remove attachment">×</button>`;
 const bar=$('.nxBar',composer);if(bar)bar.parentNode.insertBefore(attach,bar);
 $('.nxMedicalRemove',attach).addEventListener('click',()=>{attachment=null;attach.classList.remove('on');});
 stage.querySelectorAll('[data-medical-prompt]').forEach(b=>b.addEventListener('click',()=>{const ta=composer.querySelector('textarea');if(ta){ta.value=b.dataset.medicalPrompt;ta.focus();ta.dispatchEvent(new Event('input',{bubbles:true}));}}));
 const ta=composer.querySelector('textarea');if(ta)ta.placeholder='Describe the clinical question, symptoms or study findings…';
 window.NexaMedicalUI={getAttachment:()=>attachment,clearAttachment:()=>{attachment=null;attach.classList.remove('on')}};
}
function watch(){
 const run=()=>{const m=$('#nxModel');if(!m)return;if(String(m.value).toLowerCase()==='medical'){mounted=false;setTimeout(mount,30)}else{mounted=false;document.querySelector('.nxMedicalStage')?.remove()}};
 document.addEventListener('change',e=>{if(e.target?.id==='nxModel')run()});
 const mo=new MutationObserver(run);mo.observe(document.body,{childList:true,subtree:true});
 setInterval(()=>{if($('#nxModel')?.value==='medical'&&!document.querySelector('.nxMedicalStage'))mount()},700);
 setTimeout(run,250);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',watch);else watch();
})();
