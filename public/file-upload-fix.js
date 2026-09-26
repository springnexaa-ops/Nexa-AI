(()=>{
'use strict';
const state={file:null};
function setFile(file){
  state.file=file||null;
  window.NexaFiles={
    getLast:async()=>state.file?{blob:state.file,name:state.file.name,size:state.file.size,type:state.file.type}:null,
    clear:()=>{state.file=null;window.dispatchEvent(new CustomEvent('nexa:file-cleared'));},
    hasFile:()=>!!state.file
  };
  window.dispatchEvent(new CustomEvent(state.file?'nexa:file-ready':'nexa:file-cleared',{detail:state.file||null}));
}
function install(){
  if(window.__nexaFileUploadFix)return;
  window.__nexaFileUploadFix=true;
  setFile(null);
  const input=document.createElement('input');
  input.type='file';
  input.accept='.pdf,.edf,.edf+,.eeg,.txt,.md,.csv,.json,.xml,.html,.htm,.rtf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,image/*';
  input.style.display='none';
  input.id='nexaGlobalFileInput';
  document.body.appendChild(input);
  input.addEventListener('change',()=>{const file=input.files?.[0];if(file)setFile(file);input.value='';});
  document.addEventListener('click',e=>{
    const button=e.target?.closest?.('.nxTool[data-page="files"]');
    if(!button)return;
    e.preventDefault();e.stopImmediatePropagation();input.click();
  },true);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
})();