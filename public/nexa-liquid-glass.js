(()=>{
'use strict';
const style=document.createElement('style');
style.id='nexa-liquid-glass';
style.textContent=`
:root{
 --lg-bg:#f4f7fb;--lg-surface:rgba(255,255,255,.62);--lg-surface2:rgba(255,255,255,.42);
 --lg-line:rgba(255,255,255,.72);--lg-text:#172033;--lg-muted:#68758a;
 --lg-blue:#4285f4;--lg-purple:#8b5cf6;--lg-cyan:#20c9d8;
}
html,body{background:
 radial-gradient(900px 500px at 12% 8%,rgba(66,133,244,.16),transparent 62%),
 radial-gradient(760px 500px at 88% 12%,rgba(139,92,246,.13),transparent 60%),
 linear-gradient(135deg,#f8fbff 0%,#eef4fb 48%,#f8f5ff 100%)!important;color:var(--lg-text)!important}
body:before{content:"";position:fixed;inset:0;pointer-events:none;z-index:-1;background:
 radial-gradient(420px 280px at 30% 70%,rgba(32,201,216,.08),transparent 70%),
 radial-gradient(360px 260px at 75% 75%,rgba(139,92,246,.08),transparent 70%)}
#nexaConsumer{background:transparent!important}
.nxSide,.nxTop,.nxSuggestion,.nxComposer,.nxPanel,.nxGateBox,.nxModel,.nxUser,.nxLogin,.nxBack,.nxTool,.nxMsg.user{
 background:rgba(255,255,255,.52)!important;
 border-color:rgba(255,255,255,.78)!important;
 box-shadow:0 12px 40px rgba(46,67,100,.08),inset 0 1px 0 rgba(255,255,255,.85)!important;
 backdrop-filter:blur(28px) saturate(150%)!important;
 -webkit-backdrop-filter:blur(28px) saturate(150%)!important;
}
.nxSide{border-right:1px solid rgba(170,190,215,.28)!important}
.nxTop{border-bottom:1px solid rgba(170,190,215,.24)!important}
.nxBrand img,.nxHeroLogo{box-shadow:0 18px 48px rgba(66,133,244,.24)!important}
.nxNew,.nxSend,.nxAction,.nxPrimary{
 background:linear-gradient(135deg,#4285f4,#7c5cff)!important;
 border:0!important;color:#fff!important;
 box-shadow:0 10px 26px rgba(66,133,244,.24)!important
}
.nxNav{color:#607089!important}
.nxNav:hover,.nxNav.on{background:rgba(255,255,255,.58)!important;color:#1c2b43!important;border-color:rgba(255,255,255,.75)!important}
.nxWelcome{padding-top:8vh!important}
.nxWelcome .eyebrow{color:#5573b8!important;letter-spacing:.12em!important}
.nxWelcome h1{font-family:Inter,ui-sans-serif,system-ui,sans-serif!important;font-weight:600!important;letter-spacing:-.045em!important;
 background:linear-gradient(90deg,#2454c6,#704bd9,#0d8191)!important;-webkit-background-clip:text!important;background-clip:text!important;color:transparent!important}
.nxWelcome p{color:#607089!important;max-width:650px!important}
.nxWelcome .subnote{color:#7c899d!important}
.nxQuickLabel{color:#6f7e94!important}
.nxSuggestions{max-width:960px!important}
.nxSuggestion{color:#1d2a3e!important;min-height:124px!important}
.nxSuggestion:hover{transform:translateY(-3px)!important;border-color:rgba(66,133,244,.35)!important;box-shadow:0 18px 45px rgba(56,82,120,.12)!important}
.nxSuggestion .sIcon{color:#5b67ef!important}
.nxSuggestion span{color:#708096!important}
.nxTrust span{background:rgba(255,255,255,.42)!important;border-color:rgba(255,255,255,.7)!important;color:#718096!important;backdrop-filter:blur(18px)!important}
.nxTrust .live{color:#248a72!important}
.nxComposerWrap{background:linear-gradient(transparent,rgba(239,245,252,.9) 26%)!important}
.nxComposer:focus-within{border-color:rgba(66,133,244,.48)!important;box-shadow:0 0 0 4px rgba(66,133,244,.08),0 18px 48px rgba(45,75,120,.13)!important}
.nxComposer textarea{color:#172033!important}
.nxComposer textarea::placeholder{color:#8996a8!important}
.nxTool{background:rgba(255,255,255,.5)!important;color:#52627a!important}
.nxText,.nxPanel,.nxOutput,.nxAnalysisText,.nxAnalysisHead{color:#1c2940!important}
.nxRole,.nxStatus,.nxPanel p,.nxAnalysisNote{color:#728096!important}
.nxFile,.nxField input{background:rgba(255,255,255,.5)!important;color:#172033!important;border-color:rgba(255,255,255,.8)!important}
.nxGate{background:rgba(235,242,250,.66)!important}
@media(max-width:560px){
 .nxWelcome{padding-top:5vh!important}
 .nxWelcome h1{font-size:34px!important}
 .nxSuggestion{min-height:96px!important}
}
@media(prefers-color-scheme:dark){
 :root{--lg-text:#eef4ff;--lg-muted:#a9b5c7}
 html,body{background:
 radial-gradient(800px 500px at 12% 8%,rgba(66,133,244,.18),transparent 62%),
 radial-gradient(700px 500px at 88% 12%,rgba(139,92,246,.17),transparent 60%),
 linear-gradient(135deg,#08101d,#101625 55%,#100e1c)!important;color:#eef4ff!important}
 .nxSide,.nxTop,.nxSuggestion,.nxComposer,.nxPanel,.nxGateBox,.nxModel,.nxUser,.nxLogin,.nxBack,.nxTool,.nxMsg.user{
  background:rgba(20,28,43,.58)!important;border-color:rgba(255,255,255,.10)!important;
  box-shadow:0 16px 50px rgba(0,0,0,.22),inset 0 1px 0 rgba(255,255,255,.06)!important;
 }
 .nxNav,.nxWelcome p,.nxWelcome .subnote,.nxSuggestion span,.nxRole,.nxStatus,.nxPanel p,.nxAnalysisNote{color:#9eabc0!important}
 .nxNav:hover,.nxNav.on{background:rgba(255,255,255,.08)!important;color:#f4f7ff!important}
 .nxWelcome h1{background:linear-gradient(90deg,#8ab4ff,#b18cff,#6fe4ec)!important;-webkit-background-clip:text!important;background-clip:text!important}
 .nxText,.nxPanel,.nxOutput,.nxAnalysisText,.nxAnalysisHead,.nxComposer textarea{color:#edf3ff!important}
 .nxComposerWrap{background:linear-gradient(transparent,rgba(8,16,29,.92) 26%)!important}
 .nxTrust span{background:rgba(255,255,255,.06)!important;color:#aab6c8!important;border-color:rgba(255,255,255,.10)!important}
 .nxFile,.nxField input{background:rgba(255,255,255,.05)!important;color:#eef4ff!important;border-color:rgba(255,255,255,.10)!important}
 .nxGate{background:rgba(5,10,18,.72)!important}
}
`;
document.head.appendChild(style);
function enhanceHome(){
 const h=document.querySelector('.nxWelcome h1'),p=document.querySelector('.nxWelcome p'),sub=document.querySelector('.nxWelcome .subnote'),ey=document.querySelector('.nxWelcome .eyebrow');
 if(!h)return;
 if(ey)ey.textContent='NEXA AI • SPRINGNEXA';
 h.textContent='What can I help you explore?';
 if(p)p.textContent='Ask questions, analyze documents, explore healthcare information, or create your next idea — all in one intelligent workspace.';
 if(sub)sub.textContent='Start with a prompt, add a file, or choose a capability below.';
 const cards=[
 ['✦','Ask anything','Get clear answers, explanations and ideas.','Explain this topic clearly and give practical examples.'],
 ['⌁','Deep thinking','Break down complex problems step by step.','Analyze this problem and give me a structured approach.'],
 ['◈','Work with files','Upload a document and ask questions about it.','Review the uploaded document and summarize the key findings.'],
 ['✚','Healthcare','Explore health and clinical information carefully.','Explain this clinical topic and cite the relevant evidence.']
 ];
 document.querySelectorAll('.nxSuggestion').forEach((el,i)=>{
   const x=cards[i]; if(!x)return;
   el.dataset.q=x[3];
   const icon=el.querySelector('.sIcon'),b=el.querySelector('b'),s=el.querySelector('span:not(.sIcon)');
   if(icon)icon.textContent=x[0]; if(b)b.textContent=x[1]; if(s)s.textContent=x[2];
 });
}
enhanceHome();
new MutationObserver(()=>enhanceHome()).observe(document.body,{subtree:true,childList:true});
})();