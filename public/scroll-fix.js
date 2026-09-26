(()=>{
'use strict';
/*
 * NEXA PUBLIC SCROLL CONTROLLER
 * One document scroll surface for the consumer workspace.
 * Avoid nested 100dvh/overflow traps on mobile browsers.
 */
function install(){
  let s=document.getElementById('nexaScrollFix');
  if(!s){s=document.createElement('style');s.id='nexaScrollFix';document.head.appendChild(s);}
  s.textContent=`
    html,html body{
      height:auto!important;
      min-height:100%!important;
      overflow-x:hidden!important;
      overflow-y:auto!important;
      -webkit-overflow-scrolling:touch!important;
      overscroll-behavior-y:auto!important;
      touch-action:pan-y!important;
    }
    body{display:block!important;position:relative!important}
    #nexaConsumer{
      display:block!important;
      width:100%!important;
      min-height:100dvh!important;
      height:auto!important;
      overflow:visible!important;
    }
    #nexaConsumer .nxSide{
      position:fixed!important;
      top:0!important;
      bottom:0!important;
      left:0!important;
      height:100dvh!important;
      overflow-y:auto!important;
      z-index:30!important;
    }
    #nexaConsumer .nxMain{
      display:block!important;
      width:auto!important;
      min-height:100dvh!important;
      height:auto!important;
      margin-left:255px!important;
      overflow:visible!important;
    }
    #nexaConsumer .nxTop{
      position:sticky!important;
      top:0!important;
      z-index:25!important;
    }
    #nexaConsumer .nxContent{
      display:block!important;
      width:100%!important;
      height:auto!important;
      min-height:0!important;
      max-height:none!important;
      overflow:visible!important;
      touch-action:pan-y!important;
    }
    #nexaConsumer .nxPage{
      display:block!important;
      width:min(1120px,100%)!important;
      min-height:0!important;
      height:auto!important;
      max-height:none!important;
      overflow:visible!important;
    }
    #nexaConsumer .nxWelcome{
      min-height:calc(100dvh - 58px)!important;
      height:auto!important;
      overflow:visible!important;
    }
    #nexaConsumer .nxChat{
      min-height:calc(100dvh - 58px)!important;
      height:auto!important;
      overflow:visible!important;
    }
    #nexaConsumer .nxMessages{
      min-height:0!important;
      height:auto!important;
      max-height:none!important;
      overflow:visible!important;
      touch-action:pan-y!important;
    }
    #nexaConsumer .nxComposerWrap{
      position:sticky!important;
      bottom:0!important;
      z-index:20!important;
    }
    @media(max-width:850px){
      #nexaConsumer{min-height:100dvh!important}
      #nexaConsumer .nxSide{
        position:fixed!important;
        left:0!important;
        top:0!important;
        bottom:0!important;
        width:82px!important;
        height:100dvh!important;
        display:flex!important;
        overflow-y:auto!important;
        overflow-x:hidden!important;
      }
      #nexaConsumer .nxMain{
        margin-left:82px!important;
        min-height:100dvh!important;
      }
      #nexaConsumer .nxContent{min-height:0!important}
      #nexaConsumer .nxPage{
        min-height:calc(100dvh - 52px)!important;
        padding-bottom:90px!important;
      }
      #nexaConsumer .nxWelcome{min-height:calc(100dvh - 52px)!important}
      #nexaConsumer .nxComposerWrap{position:relative!important;bottom:auto!important}
      #nexaConsumer .nxComposer{position:relative!important;bottom:auto!important}
      .npCopyright{left:82px!important}
    }
    @media(max-width:360px){
      #nexaConsumer .nxSide{width:70px!important}
      #nexaConsumer .nxMain{margin-left:70px!important}
      .npCopyright{left:70px!important}
    }
  `;
  document.documentElement.style.setProperty('overflow-y','auto','important');
  document.body.style.setProperty('overflow-y','auto','important');
  document.body.style.setProperty('overflow-x','hidden','important');
  document.body.style.setProperty('touch-action','pan-y','important');
}
function run(){install();requestAnimationFrame(install);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
window.addEventListener('load',()=>setTimeout(install,100),{once:true});
window.addEventListener('resize',install,{passive:true});
})();
