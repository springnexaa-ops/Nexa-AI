(()=>{
'use strict';
if(['/auth.html','/admin.html','/trust.html','/architecture.html'].includes(location.pathname))return;

const style=document.createElement('style');
style.id='nexa5dUI';
style.textContent=`
:root{
  --n5-bg:#05070d;--n5-panel:rgba(10,14,24,.72);--n5-panel2:rgba(16,22,36,.78);
  --n5-line:rgba(151,178,255,.16);--n5-text:#f7f9ff;--n5-muted:#8f9ab0;
  --n5-cyan:#64e6ff;--n5-violet:#9b7cff;--n5-green:#61e7b5;
  --n5-shadow:0 30px 100px rgba(0,0,0,.38);
}
html,body{background:var(--n5-bg)!important;color:var(--n5-text)!important}
body:before{content:"";position:fixed;inset:-20%;z-index:-3;pointer-events:none;background:
radial-gradient(circle at 18% 12%,rgba(63,198,255,.16),transparent 25%),
radial-gradient(circle at 82% 8%,rgba(153,104,255,.20),transparent 28%),
radial-gradient(circle at 60% 88%,rgba(45,222,166,.08),transparent 25%),
linear-gradient(135deg,#04060b,#070b15 55%,#050711);filter:blur(10px)}
body:after{content:"";position:fixed;inset:0;z-index:-2;pointer-events:none;background:
linear-gradient(115deg,transparent 0 38%,rgba(255,255,255,.025) 50%,transparent 62%),
radial-gradient(circle at 50% 30%,transparent 0 38%,rgba(0,0,0,.24) 100%)}
#nexaConsumer{background:transparent!important;grid-template-columns:248px minmax(0,1fr)!important}
.nxSide{background:linear-gradient(180deg,rgba(7,10,18,.84),rgba(5,8,14,.68))!important;border-right:1px solid var(--n5-line)!important;backdrop-filter:blur(28px)!important;box-shadow:18px 0 70px rgba(0,0,0,.12)}
.nxBrand img{box-shadow:0 0 32px rgba(100,230,255,.18),0 14px 40px rgba(0,0,0,.35)!important}
.nxNew{background:linear-gradient(135deg,#137fd4,#765de8)!important;border-color:rgba(137,157,255,.35)!important;box-shadow:0 14px 35px rgba(68,88,220,.25)!important}
.nxNav{border-color:transparent!important;color:#8995aa!important}
.nxNav:hover{background:rgba(255,255,255,.055)!important;color:#fff!important}
.nxNav.on{background:linear-gradient(100deg,rgba(100,230,255,.12),rgba(155,124,255,.14))!important;border-color:rgba(133,156,255,.18)!important;color:#fff!important;box-shadow:inset 3px 0 0 rgba(100,230,255,.8),0 10px 30px rgba(0,0,0,.12)}
.nxMain{background:transparent!important}
.nxTop{background:rgba(5,8,15,.58)!important;border-bottom:1px solid var(--n5-line)!important;backdrop-filter:blur(24px)!important;box-shadow:0 10px 50px rgba(0,0,0,.12)}
.nxTitle{color:#fff!important}.nxTitle small{color:#78859c!important}
.nxModel,.nxUser,.nxLogin{background:rgba(15,21,34,.74)!important;border-color:var(--n5-line)!important;color:#dce5f5!important;box-shadow:inset 0 1px rgba(255,255,255,.035),0 10px 30px rgba(0,0,0,.16)}
.nxPage{width:min(1180px,100%)!important;padding:28px 28px 70px!important}
.nxWelcome{text-align:left!important;max-width:1040px!important;margin:auto!important;padding:7vh 12px 24px!important}
.nxWelcome:before{content:"";display:block;position:absolute}
.nxHeroLogo{box-shadow:0 0 40px rgba(100,230,255,.18),0 0 90px rgba(155,124,255,.14),0 25px 65px rgba(0,0,0,.38)!important;transform:translateZ(0)}
.nxWelcome h1{font-size:clamp(42px,6vw,72px)!important;line-height:.98!important;letter-spacing:-.065em!important;text-align:left!important;text-shadow:0 16px 50px rgba(0,0,0,.48)!important;background:linear-gradient(105deg,#fff 12%,#dffaff 46%,#a992ff 88%)!important;-webkit-background-clip:text!important;background-clip:text!important;color:transparent!important}
.nxWelcome p{margin:0!important;color:#aeb9cc!important;max-width:720px!important}
.nxWelcome .subnote{color:#6f7c92!important}
.nxSuggestions{max-width:1040px!important;margin:28px 0 20px!important;grid-template-columns:repeat(4,minmax(0,1fr))!important;gap:12px!important;perspective:1200px}
.nxSuggestion{min-height:128px!important;background:linear-gradient(145deg,rgba(18,25,42,.78),rgba(8,12,22,.72))!important;border:1px solid var(--n5-line)!important;border-radius:18px!important;box-shadow:0 18px 50px rgba(0,0,0,.18),inset 0 1px rgba(255,255,255,.035)!important;transform:translateY(0) rotateX(0deg);transition:transform .22s ease,border-color .22s,box-shadow .22s}
.nxSuggestion:hover{transform:translateY(-5px) rotateX(2deg) rotateY(-1deg)!important;border-color:rgba(100,230,255,.32)!important;box-shadow:0 28px 70px rgba(0,0,0,.32),0 0 35px rgba(100,230,255,.06)!important}
.nxSuggestion .sIcon{color:var(--n5-cyan)!important}
.nxSuggestion span{color:#8490a6!important}
.nxTrust span{background:rgba(12,18,29,.65)!important;border-color:var(--n5-line)!important;color:#7f8ca2!important}
.nxChat{min-height:calc(100dvh - 62px)!important}
.nxMessages{padding:20px max(3vw,14px)!important}
.nxMsg{max-width:900px!important}
.nxMsg.user{background:linear-gradient(135deg,rgba(32,111,191,.88),rgba(104,82,204,.84))!important;border-color:rgba(155,180,255,.18)!important;box-shadow:0 18px 50px rgba(0,0,0,.24)!important}
.nxMsg.ai{padding:8px 12px!important}
.nxText{color:#e9effa!important}
.nxComposerWrap{background:linear-gradient(transparent,rgba(5,7,13,.98) 26%)!important;padding:28px 0 0!important}
.nxComposer{background:linear-gradient(145deg,rgba(14,20,34,.92),rgba(8,12,21,.94))!important;border-color:rgba(126,154,255,.25)!important;border-radius:21px!important;box-shadow:0 24px 80px rgba(0,0,0,.36),inset 0 1px rgba(255,255,255,.045)!important;backdrop-filter:blur(24px)!important}
.nxComposer:focus-within{border-color:rgba(100,230,255,.48)!important;box-shadow:0 0 0 3px rgba(100,230,255,.06),0 28px 90px rgba(0,0,0,.4),inset 0 1px rgba(255,255,255,.06)!important}
.nxComposer textarea{color:#f6f9ff!important;font-size:15px!important}.nxComposer textarea::placeholder{color:#69768c!important}
.nxTool{background:rgba(255,255,255,.045)!important;border-color:rgba(255,255,255,.07)!important;color:#9aa7bb!important}
.nxTool:hover{background:rgba(100,230,255,.08)!important;color:#fff!important;border-color:rgba(100,230,255,.18)!important}
.nxSend{background:linear-gradient(135deg,#27a8df,#7964ec)!important;border:0!important;box-shadow:0 12px 32px rgba(76,94,230,.28)!important}
.nxPanel{background:linear-gradient(145deg,rgba(15,21,34,.82),rgba(7,11,19,.86))!important;border-color:var(--n5-line)!important;box-shadow:var(--n5-shadow),inset 0 1px rgba(255,255,255,.035)!important;backdrop-filter:blur(24px)!important}
.nxOutput{background:rgba(8,13,23,.65)!important;border-color:var(--n5-line)!important}
.nxAnalysisHead{color:#eef4ff!important}.nxAnalysisHead span{color:#7f8da3!important}.nxAnalysisText{color:#dce7f6!important}.nxAnalysisState{color:var(--n5-cyan)!important}
.nxAnalysisDisclaimer{background:rgba(194,151,55,.08)!important;color:#cbbf99!important}
.nxGateBox{background:linear-gradient(145deg,#121a2c,#080d17)!important;border-color:var(--n5-line)!important;box-shadow:0 35px 110px rgba(0,0,0,.55)!important}
.n5Footer{max-width:1040px;margin:34px auto 0;padding:16px 0;border-top:1px solid var(--n5-line);color:#66748a;font-size:9px;letter-spacing:.1em;text-transform:uppercase;text-align:center}
.n5Glow{position:fixed;pointer-events:none;width:260px;height:260px;border-radius:50%;filter:blur(70px);opacity:.16;z-index:-1;background:#7c5cff;transition:transform 1.2s ease}
@media(max-width:850px){#nexaConsumer{grid-template-columns:1fr!important}.nxSide{display:none!important}.nxPage{padding:20px 15px 90px!important}.nxWelcome{padding-top:5vh!important}.nxSuggestions{grid-template-columns:repeat(2,minmax(0,1fr))!important}.nxMsg.user{max-width:88%!important}}
@media(max-width:560px){.nxPage{padding:14px 10px 100px!important}.nxWelcome{padding-top:4vh!important}.nxWelcome h1{font-size:42px!important}.nxSuggestions{grid-template-columns:1fr!important;gap:9px!important}.nxSuggestion{min-height:94px!important}.nxComposer{border-radius:18px!important}.nxComposer textarea{font-size:16px!important}.nxModel{max-width:122px!important}}
@media(prefers-reduced-motion:reduce){.nxSuggestion,.n5Glow{transition:none!important}.nxSuggestion:hover{transform:none!important}}
`;
document.head.appendChild(style);

function footer(){
  if(document.getElementById('n5Footer'))return;
  const f=document.createElement('div');f.id='n5Footer';f.className='n5Footer';
  f.textContent='SPRINGNEXA • NEXA AI • J&K • HEALTHIER TOMORROW';
  const page=document.getElementById('nxPage');if(page)page.appendChild(f);
}
function glow(){
  if(document.getElementById('n5Glow'))return;
  const g=document.createElement('div');g.id='n5Glow';g.className='n5Glow';document.body.appendChild(g);
  window.addEventListener('pointermove',e=>{g.style.transform=`translate(${e.clientX-130}px,${e.clientY-130}px)`},{passive:true});
}
function enhance(){
  footer();glow();
  document.querySelectorAll('.nxSuggestion').forEach(card=>{
    if(card.dataset.n5Bound==='1')return;
    card.dataset.n5Bound='1';
    card.addEventListener('pointermove',e=>{
      if(window.matchMedia('(pointer:coarse)').matches)return;
      const r=card.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
      card.style.transform=`translateY(-5px) rotateX(${-y*4}deg) rotateY(${x*4}deg)`;
    });
    card.addEventListener('pointerleave',()=>card.style.transform='');
  });
}
const observer=new MutationObserver(()=>enhance());
observer.observe(document.body,{childList:true,subtree:true});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(enhance,120));else setTimeout(enhance,120);
window.addEventListener('load',()=>setTimeout(enhance,200));
})();