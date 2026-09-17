(()=>{
'use strict';
function fix(){
  const style=document.getElementById('nexaScrollFix')||document.createElement('style');
  style.id='nexaScrollFix';
  style.textContent=`
    html{height:100%;overflow:auto!important;-webkit-overflow-scrolling:touch}
    body{min-height:100%;height:auto!important;overflow:auto!important;overflow-x:hidden!important;display:block!important}
    #nexaConsumer{min-height:100dvh!important;height:auto!important;overflow:visible!important}
    #nexaConsumer .nxMain{min-height:100dvh!important;height:auto!important;overflow:visible!important}
    #nexaConsumer .nxContent{min-height:calc(100dvh - 62px)!important;height:auto!important;max-height:none!important;overflow-y:auto!important;overflow-x:hidden!important;-webkit-overflow-scrolling:touch;overscroll-behavior-y:contain;touch-action:pan-y}
    #nexaConsumer .nxPage{min-height:calc(100dvh - 62px)!important;height:auto!important;overflow:visible!important}
    #nexaConsumer .nxChat{min-height:calc(100dvh - 62px)!important;height:auto!important}
    #nexaConsumer .nxMessages{overflow-y:auto!important;overscroll-behavior-y:contain;-webkit-overflow-scrolling:touch;touch-action:pan-y}
    @media(max-width:699px){
      html,body{height:auto!important;min-height:100dvh!important;overflow:auto!important;touch-action:pan-y}
      #nexaConsumer{height:auto!important;min-height:100dvh!important}
      #nexaConsumer .nxMain{height:auto!important;min-height:100dvh!important}
      #nexaConsumer .nxContent{height:auto!important;min-height:calc(100dvh - 60px)!important;max-height:none!important;overflow:visible!important}
      #nexaConsumer .nxPage{height:auto!important;min-height:calc(100dvh - 60px)!important}
      #nexaConsumer .nxComposer{position:sticky!important;bottom:8px!important}
    }
  `;
  if(!style.parentNode)document.head.appendChild(style);
  document.documentElement.style.overflowY='auto';
  document.body.style.overflowY='auto';
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',fix,{once:true});else fix();
window.addEventListener('load',fix,{once:true});
})();
