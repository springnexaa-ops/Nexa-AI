(()=>{
'use strict';
function fix(){
  const style=document.getElementById('nexaScrollFix')||document.createElement('style');
  style.id='nexaScrollFix';
  style.textContent=`
    html,body{height:auto!important;min-height:100%!important;overflow-x:hidden!important;overflow-y:auto!important;touch-action:pan-y!important;-webkit-overflow-scrolling:touch!important}
    body{display:block!important}
    #nexaConsumer{min-height:100dvh!important;height:auto!important;overflow:visible!important}
    #nexaConsumer .nxMain{min-height:100dvh!important;height:auto!important;overflow:visible!important}
    #nexaConsumer .nxContent{min-height:calc(100dvh - 58px)!important;height:auto!important;max-height:none!important;overflow-x:hidden!important;overflow-y:visible!important;overscroll-behavior:auto!important;touch-action:pan-y!important}
    #nexaConsumer .nxPage{min-height:calc(100dvh - 58px)!important;height:auto!important;overflow:visible!important}
    #nexaConsumer .nxChat{min-height:calc(100dvh - 58px)!important;height:auto!important;overflow:visible!important}
    #nexaConsumer .nxMessages{overflow-y:auto!important;overscroll-behavior:contain!important;-webkit-overflow-scrolling:touch!important;touch-action:pan-y!important}
    .nxWelcome{overflow:visible!important}
    .nxComposerWrap{touch-action:auto!important}
    @media(max-width:850px){
      html,body{overflow-y:auto!important;min-height:100dvh!important}
      #nexaConsumer{height:auto!important;min-height:100dvh!important}
      #nexaConsumer .nxMain{height:auto!important;min-height:100dvh!important}
      #nexaConsumer .nxContent{height:auto!important;min-height:calc(100dvh - 52px)!important;overflow:visible!important}
      #nexaConsumer .nxPage{height:auto!important;min-height:calc(100dvh - 52px)!important;padding-bottom:80px!important}
      #nexaConsumer .nxChat{height:auto!important;min-height:calc(100dvh - 52px)!important}
    }
  `;
  if(!style.parentNode)document.head.appendChild(style);
  document.documentElement.style.setProperty('overflow-y','auto','important');
  document.body.style.setProperty('overflow-y','auto','important');
  document.body.style.setProperty('touch-action','pan-y','important');
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(fix,120),{once:true});else setTimeout(fix,120);
window.addEventListener('load',()=>setTimeout(fix,250),{once:true});
window.addEventListener('resize',fix,{passive:true});
})();
