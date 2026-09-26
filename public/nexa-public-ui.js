(()=>{
'use strict';
if(['/auth.html','/admin.html','/trust.html','/architecture.html'].includes(location.pathname)) return;
const style=`<style id="nexaPublicWorkspaceUI">
.nexaPublicCopyright{position:fixed;left:255px;right:0;bottom:0;z-index:22;text-align:center;padding:7px 10px 5px;background:linear-gradient(transparent,rgba(8,9,13,.96) 55%);color:#4e515b;font-size:8px;letter-spacing:.05em;pointer-events:none}@media(max-width:850px){.nexaPublicCopyright{left:82px}}@media(max-width:360px){.nexaPublicCopyright{left:70px}}
:root{
 --npx-bg:#08090d;--npx-rail:#0b0c11;--npx-surface:#101116;--npx-surface2:#15161d;
 --npx-line:rgba(255,255,255,.09);--npx-text:#f5f7fb;--npx-muted:#8f929d;
 --npx-blue:#73c7e8;--npx-purple:#9b6cff;--npx-purple2:#c084fc;
}
html,body{background:#08090d!important;color:var(--npx-text)!important}
#nexaConsumer{
 grid-template-columns:255px 1fr!important;
 background:#08090d!important;
}
.nxSide{
 background:linear-gradient(180deg,#0b0c11 0%,#090a0e 100%)!important;
 border-right:1px solid rgba(255,255,255,.075)!important;
 padding:14px 11px!important;
 backdrop-filter:none!important;
}
.nxBrand{padding:4px 9px 18px!important}
.nxBrand img{width:34px!important;height:34px!important;border-radius:10px!important;box-shadow:0 0 24px rgba(155,108,255,.26)!important}
.nxBrand b{font-size:15px!important;letter-spacing:.02em!important}
.nxBrand small{color:#686b76!important;font-size:7px!important}
.nxNew{
 border:1px solid rgba(155,108,255,.55)!important;
 background:linear-gradient(135deg,rgba(115,199,232,.12),rgba(155,108,255,.13))!important;
 border-radius:9px!important;
 padding:10px 12px!important;
 box-shadow:0 0 22px rgba(155,108,255,.08)!important;
 margin-bottom:10px!important;
}
.nxNew:hover{background:rgba(155,108,255,.13)!important}
.nxNav{
 color:#9a9da8!important;border-radius:7px!important;padding:9px 10px!important;
 margin:1px 0!important;border-color:transparent!important;
}
.nxNav:hover{background:rgba(255,255,255,.055)!important;color:#f2f3f7!important}
.nxNav.on{
 background:rgba(255,255,255,.075)!important;
 border-color:rgba(255,255,255,.06)!important;color:#fff!important;
}
.nxNav i{color:#a9a0ff!important;font-size:14px!important}
.nxLabel{color:#626570!important;padding:17px 10px 6px!important}
.nxHistory{scrollbar-width:none!important}
.nxHist{color:#777b86!important;font-size:9px!important;padding:7px 9px!important}
.nxHist:hover{background:rgba(255,255,255,.04)!important;color:#d5d7dd!important}
.nxBottom{
 border-top:1px solid rgba(255,255,255,.065)!important;
 color:#666a75!important;padding:12px 8px 4px!important;
}
.nxMain{grid-template-rows:58px 1fr!important;background:#08090d!important}
.nxTop{
 height:58px!important;padding:0 20px!important;
 background:rgba(8,9,13,.88)!important;
 border-bottom:1px solid rgba(255,255,255,.065)!important;
 backdrop-filter:blur(18px)!important;
}
.nxTitle{font-size:12px!important;color:#d9dbe2!important}
.nxTitle small{color:#676a75!important;font-size:8px!important}
.nxModel,.nxUser,.nxLogin{
 background:#111218!important;border-color:rgba(255,255,255,.1)!important;
 color:#cfd1d9!important;border-radius:8px!important;
}
.nxContent{background:
 radial-gradient(650px 360px at 75% -10%,rgba(145,85,255,.16),transparent 64%),
 radial-gradient(520px 320px at 52% 28%,rgba(60,159,200,.055),transparent 70%),
 #08090d!important;
}
.nxPage{
 width:min(1120px,100%)!important;
 min-height:calc(100dvh - 58px)!important;
 padding:18px 24px 34px!important;
}
.nxWelcome{
 min-height:calc(100dvh - 120px)!important;
 display:flex!important;flex-direction:column!important;align-items:center!important;
 justify-content:center!important;padding:4vh 10px 70px!important;
 position:relative!important;
}
.nxWelcome:before{
 content:"";position:absolute;width:520px;height:250px;top:7%;left:50%;
 transform:translateX(-50%);pointer-events:none;
 background:radial-gradient(ellipse,rgba(155,108,255,.13),transparent 68%);
 filter:blur(20px);
}
.nxHeroLogo{
 width:62px!important;height:62px!important;border-radius:19px!important;
 box-shadow:0 0 35px rgba(155,108,255,.38),0 0 80px rgba(115,199,232,.12)!important;
 z-index:1;
}
.nxWelcome .eyebrow{
 color:#8d8f99!important;font-size:9px!important;letter-spacing:.16em!important;
 z-index:1;
}
.nxWelcome h1{
 font-size:clamp(38px,5.1vw,60px)!important;
 letter-spacing:-.055em!important;line-height:1.04!important;
 margin:9px 0 12px!important;
 background:linear-gradient(100deg,#f7f7fa 15%,#dfe4ff 55%,#c49cff 100%)!important;
 -webkit-background-clip:text!important;background-clip:text!important;color:transparent!important;
 z-index:1;
}
.nxWelcome p{max-width:650px!important;color:#858894!important;font-size:12px!important;z-index:1}
.nxWelcome .subnote{color:#626570!important;font-size:9px!important;z-index:1}
.nxQuickLabel{display:none!important}
.nxSuggestions{
 grid-template-columns:repeat(3,minmax(0,1fr))!important;
 max-width:860px!important;width:100%!important;gap:10px!important;
 margin:24px auto 18px!important;z-index:1;
}
.nxSuggestion{
 min-height:88px!important;padding:14px!important;
 background:rgba(15,16,22,.72)!important;
 border:1px solid rgba(255,255,255,.09)!important;
 border-radius:13px!important;
 box-shadow:none!important;
}
.nxSuggestion:after{display:none!important}
.nxSuggestion:hover{
 border-color:rgba(155,108,255,.45)!important;
 background:rgba(22,20,30,.9)!important;
 transform:translateY(-2px)!important;
 box-shadow:0 12px 35px rgba(0,0,0,.22)!important;
}
.nxSuggestion .sIcon{color:#a991ff!important;font-size:15px!important;margin-bottom:12px!important}
.nxSuggestion b{font-size:11px!important}
.nxSuggestion span{font-size:9px!important;color:#777b86!important}
.nxTrust{display:none!important}
.nxComposerWrap{
 width:min(760px,100%)!important;margin:0 auto!important;
 padding:16px 0 0!important;z-index:2;
}
.nxComposer{
 background:rgba(13,14,19,.94)!important;
 border:1px solid rgba(155,108,255,.42)!important;
 border-radius:17px!important;
 box-shadow:0 0 0 1px rgba(155,108,255,.04),0 0 42px rgba(121,72,214,.15)!important;
}
.nxComposer:focus-within{
 border-color:rgba(174,137,255,.72)!important;
 box-shadow:0 0 0 3px rgba(155,108,255,.08),0 0 50px rgba(121,72,214,.22)!important;
}
.nxComposer textarea{
 min-height:58px!important;padding:15px 16px 8px!important;color:#f1f2f5!important;
 font-size:13px!important;
}
.nxComposer textarea::placeholder{color:#6e717c!important}
.nxBar{
 border-top:0!important;padding:5px 7px 7px!important;
}
.nxTool,.nxSend{
 background:rgba(255,255,255,.045)!important;
 border-color:rgba(255,255,255,.08)!important;
 border-radius:8px!important;color:#8f929d!important;
}
.nxTool:hover{background:rgba(255,255,255,.08)!important;color:#fff!important}
.nxSend{
 min-width:70px!important;
 background:linear-gradient(135deg,#8558ed,#a66cf5)!important;
 color:#fff!important;border:0!important;
 box-shadow:0 7px 22px rgba(133,88,237,.24)!important;
}
.nxStatus{text-align:center!important;color:#555963!important;font-size:8px!important}
.nxChat .nxComposerWrap{
 position:sticky!important;bottom:0!important;
}
.nxMsg.ai{max-width:820px!important}
.nxMsg.user{background:linear-gradient(135deg,#1b1830,#27213f)!important;border-color:rgba(155,108,255,.2)!important}
.nxGate{background:rgba(4,5,8,.84)!important}
.nxGateBox{background:#111218!important;border-color:rgba(155,108,255,.3)!important}
.nxPanel{background:#111218!important;border-color:rgba(255,255,255,.08)!important}
.nxFileAnalysis{background:#0d0e13!important}
.npToolbar{background:transparent!important}
.npBtn{background:#111218!important;border-color:rgba(255,255,255,.09)!important;color:#9a9da8!important}
.npBtn:hover{color:#fff!important;border-color:rgba(155,108,255,.45)!important}
.npCopyright{
 position:fixed!important;left:255px!important;right:0!important;bottom:0!important;
 z-index:20!important;border-top:0!important;background:linear-gradient(transparent,rgba(8,9,13,.95) 45%)!important;
 padding:12px 20px 7px!important;font-size:8px!important;color:#4e515b!important;
 pointer-events:none!important;
}
@media(max-width:850px){
 #nexaConsumer{grid-template-columns:1fr!important}
 .nxSide{display:none!important}
 .nxPage{padding:10px 12px 30px!important}
 .nxWelcome{min-height:calc(100dvh - 88px)!important}
 .npCopyright{left:0!important}
}
@media(max-width:560px){
 .nxWelcome h1{font-size:38px!important}
 .nxSuggestions{grid-template-columns:1fr!important;max-width:430px!important}
 .nxSuggestion{min-height:76px!important}
 .nxComposerWrap{padding-bottom:5px!important}
 .nxTop{padding:0 12px!important}
}
@media(prefers-reduced-motion:reduce){.nxSuggestion{transition:none!important}}

/* Mobile workspace + low-power rendering: keep the compact navigation visible and avoid costly visual effects. */
.nexaPublicWorkspace,.nexaPublicWorkspace *{scroll-behavior:auto!important}
.nexaPublicWorkspace #nexaConsumer{contain:layout style}
.nexaPublicWorkspace .nxSide{backdrop-filter:none!important;-webkit-backdrop-filter:none!important}
.nexaPublicWorkspace .nxTop{backdrop-filter:none!important;-webkit-backdrop-filter:none!important}
.nexaPublicWorkspace .nxComposer{backdrop-filter:none!important;-webkit-backdrop-filter:none!important}
.nexaPublicWorkspace .nxWelcome:before{filter:none!important}
.nexaPublicWorkspace *{animation-duration:0.001ms!important}
@media(max-width:850px){
 #nexaConsumer{grid-template-columns:82px minmax(0,1fr)!important}
 .nxSide{display:flex!important;padding:10px 6px!important;overflow:hidden!important}
 .nxBrand{justify-content:center!important;padding:3px 2px 12px!important}
 .nxBrand img{width:34px!important;height:34px!important}
 .nxBrand>div{display:none!important}
 .nxNew{font-size:0!important;text-align:center!important;padding:9px 4px!important;min-height:38px!important}
 .nxNew:first-letter{font-size:16px!important}
 .nxNav{justify-content:center!important;gap:2px!important;padding:8px 3px!important;min-height:39px!important}
 .nxNav i{font-size:14px!important;width:auto!important}
 .nxNav span{font-size:7px!important;line-height:1.1!important;text-align:center!important;display:block!important;max-width:72px!important}
 .nxLabel{font-size:6px!important;padding:11px 2px 5px!important;text-align:center!important}
 .nxHistory{display:block!important}
 .nxHist{font-size:7px!important;padding:6px 3px!important;line-height:1.15!important;white-space:normal!important;max-height:30px!important;overflow:hidden!important}
 .nxBottom{font-size:0!important;text-align:center!important;padding:8px 2px!important}
 .nxBottom b{font-size:0!important}.nxBottom b:before{content:"●";font-size:9px!important}
 .nxTop{padding:0 9px!important;height:52px!important}
 .nxTitle{font-size:10px!important}
 .nxTitle small{font-size:6px!important}
 .nxPage{padding:8px 9px 30px!important;min-height:calc(100dvh - 52px)!important}
 .nxWelcome{min-height:calc(100dvh - 72px)!important;padding:2vh 4px 54px!important}
 .nxHeroLogo{width:46px!important;height:46px!important;border-radius:14px!important}
 .nxWelcome h1{font-size:clamp(27px,8vw,38px)!important;text-align:center!important}
 .nxWelcome p{font-size:9px!important;line-height:1.45!important;text-align:center!important;max-width:330px!important}
 .nxWelcome .eyebrow{font-size:7px!important}
 .nxWelcome .subnote{font-size:7px!important}
 .nxSuggestions{grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:6px!important;margin:13px auto 9px!important}
 .nxSuggestion{min-height:70px!important;padding:9px!important;border-radius:10px!important}
 .nxSuggestion .sIcon{font-size:12px!important;margin-bottom:6px!important}
 .nxSuggestion b{font-size:8px!important;margin-bottom:3px!important}
 .nxSuggestion span{font-size:6.5px!important;line-height:1.25!important}
 .nxComposerWrap{width:100%!important;padding-top:8px!important}
 .nxComposer{border-radius:12px!important}
 .nxComposer textarea{min-height:45px!important;padding:11px 11px 5px!important;font-size:10px!important}
 .nxBar{padding:4px!important}
 .nxTool,.nxSend{font-size:7px!important;padding:6px 7px!important}
 .nxSend{min-width:54px!important}
 .nxStatus{font-size:6.5px!important}
 .npToolbar .npBtn{width:34px!important;height:34px!important}
 .npToolbar{gap:3px!important;margin-left:3px!important}
 .npCopyright{left:82px!important;font-size:6px!important;padding:5px 7px 3px!important}
}
@media(max-width:360px){
 #nexaConsumer{grid-template-columns:70px minmax(0,1fr)!important}
 .npCopyright{left:70px!important}
 .nxSuggestions{grid-template-columns:1fr!important;max-width:280px!important}
 .nxSuggestion{min-height:58px!important}
}</style>`;
function apply(){
 if(!document.getElementById('nexaPublicCopyright')){
   const f=document.createElement('div');f.id='nexaPublicCopyright';f.className='nexaPublicCopyright';
   f.textContent='© 2026 SPRINGNEXA PRIVATE LIMITED';document.body.appendChild(f);
 }
 if(!document.getElementById('nexaPublicWorkspaceUI'))document.head.insertAdjacentHTML('beforeend',style);
 document.body.classList.add('nexaPublicWorkspace');
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(apply,80));else setTimeout(apply,80);
window.addEventListener('load',()=>setTimeout(apply,180));
})();