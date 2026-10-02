(()=>{
'use strict';

const KEY='nexa.color.mode';

const css=`
<style id="nexaDayNightStyles">
.nxThemeToggle{
  position:relative;
  display:inline-flex;
  align-items:center;
  gap:7px;
  min-width:94px;
  height:38px;
  padding:4px 7px;
  border:1px solid rgba(122,155,184,.28);
  border-radius:999px;
  background:linear-gradient(180deg,rgba(16,34,55,.96),rgba(8,21,35,.96));
  color:#dcecff;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.08),0 8px 22px rgba(0,0,0,.18);
  overflow:hidden;
  isolation:isolate;
  transition:.28s ease;
}
.nxThemeToggle:hover{transform:translateY(-1px);border-color:rgba(115,199,232,.55)}
.nxThemeToggle:focus-visible{outline:3px solid rgba(115,199,232,.5);outline-offset:2px}
.nxThemeTrack{
  position:relative;
  width:60px;
  height:28px;
  flex:0 0 60px;
  border-radius:999px;
  overflow:hidden;
  background:linear-gradient(180deg,#101a36,#28385f);
  box-shadow:inset 0 2px 7px rgba(0,0,0,.35);
  transition:.45s ease;
}
.nxThemeTrack:before{
  content:"";
  position:absolute;
  inset:0;
  background:
    radial-gradient(circle at 13px 8px,#fff 0 1px,transparent 1.6px),
    radial-gradient(circle at 35px 5px,#fff 0 1px,transparent 1.6px),
    radial-gradient(circle at 48px 17px,#fff 0 1px,transparent 1.6px),
    radial-gradient(circle at 25px 20px,#fff 0 1px,transparent 1.6px);
  opacity:1;
  transition:.35s ease;
}
.nxThemeCloud{
  position:absolute;
  left:-2px;
  bottom:-4px;
  width:48px;
  height:15px;
  border-radius:50%;
  background:linear-gradient(180deg,#f7fbff,#d6e1ef);
  box-shadow:18px 1px 0 -3px #edf4fb,32px 3px 0 -5px #dce8f4;
  opacity:.9;
  transition:.45s cubic-bezier(.22,.61,.36,1);
}
.nxThemeOrb{
  position:absolute;
  top:3px;
  left:33px;
  width:22px;
  height:22px;
  border-radius:50%;
  background:#fff7d2;
  box-shadow:0 0 14px rgba(255,245,179,.75);
  transition:.5s cubic-bezier(.22,.61,.36,1);
}
.nxThemeOrb:after{
  content:"";
  position:absolute;
  width:18px;height:18px;left:-5px;top:-3px;border-radius:50%;
  background:#17213f;
  opacity:.9;
  transition:.45s ease;
}
.nxThemeLabel{
  font-size:8px;
  line-height:1;
  letter-spacing:.11em;
  font-weight:900;
  text-transform:uppercase;
  white-space:nowrap;
  min-width:20px;
  text-align:center;
}
.nxThemeIcon{font-size:12px;line-height:1}
.nxThemeToggle[data-mode="day"]{
  background:linear-gradient(180deg,#f7fdff,#e9f7fb);
  border-color:rgba(60,159,200,.28);
  color:#21495c;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.9),0 8px 22px rgba(37,103,128,.12);
}
.nxThemeToggle[data-mode="day"] .nxThemeTrack{
  background:linear-gradient(180deg,#69c6e8,#b9ebf7);
  box-shadow:inset 0 2px 7px rgba(37,103,128,.16);
}
.nxThemeToggle[data-mode="day"] .nxThemeTrack:before{opacity:0}
.nxThemeToggle[data-mode="day"] .nxThemeCloud{transform:translateX(20px);opacity:.95}
.nxThemeToggle[data-mode="day"] .nxThemeOrb{
  left:5px;
  background:#ffd45c;
  box-shadow:0 0 14px rgba(255,193,54,.7);
}
.nxThemeToggle[data-mode="day"] .nxThemeOrb:after{opacity:0}
body.nxDay{
  color-scheme:light!important;
  background:#eaf9ff!important;
  color:#123040!important;
}
body.nxDay:before{
  content:"";
  position:fixed;
  inset:0;
  z-index:-3;
  pointer-events:none;
  background:
    radial-gradient(650px 300px at 82% -5%,rgba(255,255,255,.92),transparent 65%),
    linear-gradient(180deg,#73c7e8 0,#eaf9ff 45%,#f5fbfd 100%);
}
body.nxDay #nexaConsumer{
  background:linear-gradient(135deg,rgba(239,250,255,.96),rgba(246,252,253,.96))!important;
}
body.nxDay .nxSide{
  background:rgba(248,253,255,.92)!important;
  border-right-color:rgba(49,146,183,.2)!important;
  color:#21495c!important;
}
body.nxDay .nxBrand b,body.nxDay .nxTitle{color:#123040!important}
body.nxDay .nxBrand small,body.nxDay .nxTitle small{color:#5b7785!important}
body.nxDay .nxNew{background:linear-gradient(135deg,#3c9fc8,#286e98)!important;box-shadow:0 10px 25px rgba(60,159,200,.18)!important}
body.nxDay .nxNav{color:#527080!important}
body.nxDay .nxNav:hover{background:rgba(115,199,232,.14)!important;color:#21495c!important}
body.nxDay .nxNav.on{background:linear-gradient(90deg,rgba(115,199,232,.25),rgba(36,88,68,.07))!important;border-color:rgba(60,159,200,.2)!important;color:#123040!important}
body.nxDay .nxNav i{color:#3c9fc8!important}
body.nxDay .nxLabel{color:#708995!important}
body.nxDay .nxHist{color:#66818d!important}
body.nxDay .nxHist:hover{background:rgba(115,199,232,.12)!important;color:#21495c!important}
body.nxDay .nxBottom{border-top-color:rgba(49,146,183,.16)!important;color:#708995!important}
body.nxDay .nxTop{background:rgba(248,253,255,.82)!important;border-bottom-color:rgba(49,146,183,.18)!important}
body.nxDay .nxModel,body.nxDay .nxUser,body.nxDay .nxLogin{
  background:rgba(255,255,255,.82)!important;
  color:#315a6b!important;
  border-color:rgba(60,159,200,.24)!important;
}
body.nxDay .nxLogin{background:rgba(115,199,232,.14)!important;color:#286e98!important}
body.nxDay .nxWelcome h1{
  background:linear-gradient(105deg,#123040,#267ea2 58%,#245844)!important;
  -webkit-background-clip:text!important;background-clip:text!important;
  -webkit-text-fill-color:transparent!important;
}
body.nxDay .nxWelcome .eyebrow{color:#3c9fc8!important}
body.nxDay .nxWelcome p{color:#496a79!important}
body.nxDay .nxWelcome .subnote{color:#66818d!important}
body.nxDay .nxSuggestion{
  background:rgba(255,255,255,.74)!important;
  border-color:rgba(49,146,183,.18)!important;
  color:#21495c!important;
  box-shadow:0 9px 28px rgba(37,103,128,.07)!important;
}
body.nxDay .nxSuggestion span{color:#66818d!important}
body.nxDay .nxSuggestion .sIcon{color:#3c9fc8!important}
body.nxDay .nxTrust span{background:rgba(255,255,255,.68)!important;border-color:rgba(49,146,183,.16)!important;color:#66818d!important}
body.nxDay .nxTrust .live{color:#245844!important}
body.nxDay .nxComposerWrap{background:linear-gradient(transparent,rgba(234,249,255,.96) 22%)!important}
body.nxDay .nxComposer{
  background:rgba(255,255,255,.9)!important;
  border-color:rgba(60,159,200,.26)!important;
  box-shadow:0 14px 38px rgba(37,103,128,.1)!important;
}
body.nxDay .nxComposer:focus-within{border-color:rgba(60,159,200,.55)!important;box-shadow:0 0 0 3px rgba(60,159,200,.1),0 14px 38px rgba(37,103,128,.12)!important}
body.nxDay .nxComposer textarea{color:#123040!important}
body.nxDay .nxComposer textarea::placeholder{color:#71909d!important}
body.nxDay .nxBar{border-top-color:rgba(49,146,183,.13)!important}
body.nxDay .nxTool{background:#eef8fb!important;border-color:rgba(49,146,183,.18)!important;color:#3c6273!important}
body.nxDay .nxTool:hover{background:#dff2f8!important;color:#21495c!important}
body.nxDay .nxSend{background:linear-gradient(135deg,#3c9fc8,#286e98)!important;box-shadow:none!important}
body.nxDay .nxStatus{color:#66818d!important}
body.nxDay .nxMsg.user{background:linear-gradient(135deg,#3c9fc8,#286e98)!important;box-shadow:0 10px 28px rgba(37,103,128,.16)!important}
body.nxDay .nxMsg.ai .nxText{color:#21495c!important}
body.nxDay .nxRole{color:#66818d!important}
body.nxDay .nxMsg.user .nxRole{color:#eaf9ff!important}
body.nxDay .nxPanel{background:rgba(255,255,255,.78)!important;border-color:rgba(49,146,183,.18)!important;color:#123040!important;box-shadow:0 12px 35px rgba(37,103,128,.08)!important}
body.nxDay .nxPanel p{color:#496a79!important}
body.nxDay .nxBack{background:#eef8fb!important;border-color:rgba(49,146,183,.18)!important;color:#315a6b!important}
body.nxDay .nxField input{background:#fff!important;color:#123040!important;border-color:rgba(49,146,183,.22)!important}
body.nxDay .nxAction{background:linear-gradient(135deg,#3c9fc8,#286e98)!important}
body.nxDay .nxOutput{background:rgba(255,255,255,.58)!important;border-color:rgba(49,146,183,.15)!important;color:#315a6b!important}
body.nxDay .nxAnalysisText{color:#21495c!important}
body.nxDay .nxAnalysisHead{color:#123040!important;border-bottom-color:rgba(49,146,183,.14)!important}
body.nxDay .nxAnalysisHead span{color:#66818d!important}
body.nxDay .nxAnalysisDisclaimer{color:#496a79!important}
body.nxDay .nxGate{background:rgba(232,248,253,.76)!important}
body.nxDay .nxGateBox{background:linear-gradient(145deg,#fff,#eef9fc)!important;border-color:rgba(60,159,200,.25)!important;box-shadow:0 30px 100px rgba(37,103,128,.2)!important}
body.nxDay .nxGateBox h2{color:#123040!important}
body.nxDay .nxGateBox p{color:#496a79!important}
body.nxDay .nxSecondary{background:#eef8fb!important;color:#315a6b!important;border-color:rgba(49,146,183,.18)!important}
@media(max-width:699px){
  .nxThemeToggle{min-width:82px;height:36px}
  .nxThemeTrack{width:52px;flex-basis:52px;height:26px}
  .nxThemeLabel{display:none}
  .nxThemeOrb{left:29px}
  .nxThemeToggle[data-mode="day"] .nxThemeOrb{left:3px}
}
@media(prefers-reduced-motion:reduce){
  .nxThemeToggle,.nxThemeTrack,.nxThemeCloud,.nxThemeOrb{transition:none!important}
}
</style>`;

function installStyle(){
  if(document.getElementById('nexaDayNightStyles'))return;
  document.head.insertAdjacentHTML('beforeend',css);
}

function mode(){
  const saved=localStorage.getItem(KEY);
  return saved==='day'?'day':'night';
}

function apply(value){
  const day=value==='day';
  document.body.classList.toggle('nxDay',day);
  document.documentElement.style.colorScheme=day?'light':'dark';
  const meta=document.querySelector('meta[name="theme-color"]');
  if(meta)meta.setAttribute('content',day?'#73c7e8':'#06101d');
  const b=document.getElementById('nxThemeToggle');
  if(!b)return;
  b.dataset.mode=day?'day':'night';
  b.setAttribute('aria-pressed',String(day));
  b.setAttribute('aria-label',day?'Switch to night mode':'Switch to day mode');
  b.title=day?'Night mode':'Day mode';
  const label=b.querySelector('.nxThemeLabel');
  const icon=b.querySelector('.nxThemeIcon');
  if(label)label.textContent=day?'DAY':'NIGHT';
  if(icon)icon.textContent=day?'☀':'☾';
}

function add(){
  if(document.getElementById('nxThemeToggle'))return;
  const right=document.querySelector('.nxRight');
  if(!right)return;
  const b=document.createElement('button');
  b.type='button';
  b.id='nxThemeToggle';
  b.className='nxThemeToggle';
  b.innerHTML='<span class="nxThemeTrack" aria-hidden="true"><span class="nxThemeCloud"></span><span class="nxThemeOrb"></span></span><span class="nxThemeIcon" aria-hidden="true">☾</span><span class="nxThemeLabel">NIGHT</span>';
  right.insertBefore(b,right.firstChild);
  b.addEventListener('click',()=>{
    const next=document.body.classList.contains('nxDay')?'night':'day';
    localStorage.setItem(KEY,next);
    apply(next);
  });
  apply(mode());
}

function init(){
  installStyle();
  if(!document.querySelector('.nxRight')){setTimeout(init,80);return}
  add();
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(init,20));
else setTimeout(init,20);
})();
