(()=>{'use strict';
const AUTH='nexa.user.session';
const auth=()=>!!sessionStorage.getItem(AUTH);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const css=`
:root{--ux-bg:#f7fbfd;--ux-surface:rgba(255,255,255,.82);--ux-panel:#fff;--ux-ink:#123040;--ux-muted:#607986;--ux-line:rgba(36,113,142,.15);--ux-sky:#73c7e8;--ux-blue:#287fa4;--ux-chinar:#245844;--ux-gold:#d8a642;--ux-shadow:0 18px 60px rgba(35,103,128,.10);--ux-radius:18px}
*{scrollbar-width:thin;scrollbar-color:#bdddea transparent}
body.nexaUXMax{font-family:Inter,ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif}
body.nexaUXMax #nexaConsumer{grid-template-columns:264px minmax(0,1fr)!important;background:transparent!important}
body.nexaUXMax .nxSide{background:rgba(249,253,255,.88)!important;border-right:1px solid var(--ux-line)!important;padding:16px 12px!important;backdrop-filter:blur(22px)!important}
body.nexaUXMax .nxBrand{padding:3px 9px 16px!important}
body.nexaUXMax .nxBrand img{width:38px;height:38px;border-radius:12px}
body.nexaUXMax .nxBrand b{font-size:15px!important}
body.nexaUXMax .nxNew{min-height:44px!important;border-radius:13px!important;background:linear-gradient(135deg,#237fa5,#3a9dc0)!important;box-shadow:0 10px 24px rgba(35,127,165,.14)!important;margin-bottom:10px!important}
body.nexaUXMax .nxNav{min-height:44px!important;border-radius:11px!important;padding:9px 11px!important;color:#55717e!important}
body.nexaUXMax .nxNav i{color:#378eaf!important}
body.nexaUXMax .nxNav:hover{background:#edf8fc!important;color:#173d4c!important}
body.nexaUXMax .nxNav.on{background:linear-gradient(90deg,#e7f6fb,#f0f7f3)!important;border:1px solid rgba(56,143,173,.17)!important;color:#153b49!important}
body.nexaUXMax .nxLabel{color:#7c929d!important;padding-top:15px!important}
body.nexaUXMax .nxHist{font-size:10px!important;color:#6c8591!important;min-height:36px!important}
body.nexaUXMax .nxBottom{color:#73909b!important}
body.nexaUXMax .nxMain{background:transparent!important;min-width:0}
body.nexaUXMax .nxTop{height:64px!important;padding:0 22px!important;background:rgba(251,254,255,.68)!important;border-bottom:1px solid var(--ux-line)!important;backdrop-filter:blur(18px)!important}
body.nexaUXMax .nxTitle{color:#123040!important;font-size:15px!important}
body.nexaUXMax .nxTitle small{color:#6d8894!important}
body.nexaUXMax .nxModel,body.nexaUXMax .nxUser,body.nexaUXMax .nxLogin{background:#fff!important;color:#365c6b!important;border-color:var(--ux-line)!important;border-radius:11px!important;min-height:40px!important}
body.nexaUXMax .nxContent{background:linear-gradient(180deg,rgba(249,253,255,.35),rgba(234,249,255,.28))}
body.nexaUXMax .nxPage{width:min(1260px,100%)!important;padding:24px 30px 56px!important}
body.nexaUXMax .nxWelcome{text-align:left!important;padding:6vh 0 18px!important;max-width:1020px!important}
body.nexaUXMax .nxWelcome h1{font-family:Georgia,'Times New Roman',serif!important;font-weight:500!important;color:#123040!important;letter-spacing:-.04em!important;max-width:860px!important}
body.nexaUXMax .nxWelcome p{color:#567380!important;max-width:760px!important;margin:0!important}
body.nexaUXMax .nxWelcome .subnote{color:#78919c!important}
body.nexaUXMax .nxQuickLabel{text-align:left!important;color:#6b8793!important;margin-top:20px!important}
body.nexaUXMax .nxSuggestions{grid-template-columns:repeat(4,minmax(0,1fr))!important;gap:12px!important;max-width:100%!important;margin-left:0!important;margin-right:0!important}
body.nexaUXMax .nxSuggestion{min-height:126px!important;background:rgba(255,255,255,.78)!important;border-color:var(--ux-line)!important;border-radius:16px!important;color:#173d4c!important;box-shadow:0 8px 26px rgba(38,110,135,.06)!important;padding:16px!important}
body.nexaUXMax .nxSuggestion:hover{border-color:rgba(53,145,178,.35)!important;transform:translateY(-2px)!important;box-shadow:0 14px 36px rgba(38,110,135,.10)!important}
body.nexaUXMax .nxSuggestion .sIcon{color:#2c8eaf!important}
body.nexaUXMax .nxSuggestion span:last-child{color:#6a8591!important}
body.nexaUXMax .nxTrust{justify-content:flex-start!important}
body.nexaUXMax .nxTrust span{background:rgba(255,255,255,.62)!important;border-color:var(--ux-line)!important;color:#6e8792!important;min-height:30px;display:inline-flex;align-items:center}
body.nexaUXMax .nxChat{min-height:calc(100dvh - 64px)!important}
body.nexaUXMax .nxMessages{padding:16px max(3vw,20px)!important}
body.nexaUXMax .nxMsg{max-width:860px!important;line-height:1.72!important}
body.nexaUXMax .nxMsg.user{background:#e2f5fb!important;color:#123040!important;border:1px solid rgba(53,145,178,.14)!important;box-shadow:none!important;border-radius:18px 18px 6px 18px!important}
body.nexaUXMax .nxMsg.user .nxRole{color:#2d7692!important}
body.nexaUXMax .nxMsg.ai{padding:4px 8px!important}
body.nexaUXMax .nxText{color:#173d4c!important}
body.nexaUXMax .nxRole{color:#6e8995!important}
body.nexaUXMax .nxComposerWrap{background:linear-gradient(transparent,rgba(247,252,254,.98) 22%)!important;padding:24px 0 0!important}
body.nexaUXMax .nxComposer{background:rgba(255,255,255,.94)!important;border-color:rgba(39,129,160,.2)!important;border-radius:20px!important;box-shadow:0 16px 42px rgba(39,111,138,.10)!important;max-width:920px!important}
body.nexaUXMax .nxComposer:focus-within{border-color:rgba(39,129,160,.42)!important;box-shadow:0 0 0 3px rgba(73,170,204,.08),0 18px 45px rgba(39,111,138,.12)!important}
body.nexaUXMax .nxComposer textarea{color:#123040!important;min-height:70px!important;font-size:15px!important}
body.nexaUXMax .nxComposer textarea::placeholder{color:#88a1ac!important}
body.nexaUXMax .nxBar{border-top-color:rgba(39,129,160,.10)!important;padding:9px!important}
body.nexaUXMax .nxTool{background:#eff8fb!important;color:#426b79!important;border-color:rgba(39,129,160,.12)!important;min-height:44px!important}
body.nexaUXMax .nxSend,body.nexaUXMax .nxAction{background:linear-gradient(135deg,#2583a8,#357f9a)!important;min-height:44px!important;border-radius:11px!important;box-shadow:none!important}
body.nexaUXMax .nxStatus{color:#6d8792!important;font-size:10px!important}
body.nexaUXMax .nxPanel{background:rgba(255,255,255,.78)!important;border-color:var(--ux-line)!important;border-radius:20px!important;box-shadow:var(--ux-shadow)!important;color:#173d4c!important}
body.nexaUXMax .nxBack{min-height:44px!important;background:#edf8fb!important;border-color:var(--ux-line)!important;color:#3b6675!important}
body.nexaUXMax .nxField input{min-height:44px!important;background:#fff!important;color:#173d4c!important;border-color:var(--ux-line)!important}
body.nexaUXMax .nxOutput{background:rgba(249,253,255,.74)!important;border-color:var(--ux-line)!important;color:#365c6b!important}
body.nexaUXMax .nxFileAnalysis{max-width:100%!important}
body.nexaUXMax .nxKashmirBar,body.nexaUXMax .nxEditorialBar{z-index:50!important}
.nxUXMaxTools{position:fixed;right:16px;bottom:16px;z-index:55;display:flex;gap:6px;padding:6px;background:rgba(255,255,255,.92);border:1px solid rgba(41,126,156,.16);border-radius:14px;box-shadow:0 10px 34px rgba(34,96,119,.14);backdrop-filter:blur(16px)}
.nxUXMaxTools button{min-height:44px;border:0;border-radius:10px;padding:8px 11px;background:transparent;color:#376676;font-weight:800;font-size:10px;cursor:pointer}
.nxUXMaxTools button:hover{background:#eaf7fb}
.nxUXMaxTools button[aria-pressed=true]{background:#245844;color:#fff}
.nxUXMaxTools .dot{width:7px;height:7px;border-radius:50%;background:#73c7e8;display:inline-block;margin-right:5px}
@media(min-width:1200px){body.nexaUXMax .nxPage{padding-right:38px!important}.nxUXMaxTools{right:20px;bottom:20px}}
@media(max-width:1024px){body.nexaUXMax #nexaConsumer{grid-template-columns:220px minmax(0,1fr)!important}body.nexaUXMax .nxPage{padding:20px 20px 48px!important}body.nexaUXMax .nxSuggestions{grid-template-columns:repeat(2,minmax(0,1fr))!important}}
@media(max-width:699px){body.nexaUXMax #nexaConsumer{display:block!important}body.nexaUXMax .nxSide{display:none!important}body.nexaUXMax .nxTop{height:58px!important;padding:8px 12px!important;position:sticky!important;top:0!important;z-index:40!important}body.nexaUXMax .nxPage{padding:15px 12px 100px!important}body.nexaUXMax .nxWelcome{padding:4vh 0 12px!important}body.nexaUXMax .nxWelcome h1{font-size:clamp(36px,11vw,52px)!important}body.nexaUXMax .nxSuggestions{grid-template-columns:1fr!important}.nxUXMaxTools{right:10px;bottom:calc(72px + env(safe-area-inset-bottom));max-width:calc(100vw - 20px);overflow:auto}.nxUXMaxTools button{white-space:nowrap}body.nexaUXMax .nxComposer{position:sticky!important;bottom:8px!important}body.nexaUXMax .nxComposer textarea{font-size:16px!important}}
@media(prefers-reduced-motion:reduce){body.nexaUXMax *,body.nexaUXMax *::before,body.nexaUXMax *::after{transition:none!important;animation:none!important}}
body.nexaUXMax button:focus-visible,body.nexaUXMax a:focus-visible,body.nexaUXMax input:focus-visible,body.nexaUXMax textarea:focus-visible,body.nexaUXMax select:focus-visible{outline:3px solid rgba(42,138,173,.5)!important;outline-offset:2px!important}
body.nexaUXMax button,body.nexaUXMax a,[role="button"]{cursor:pointer}
`;
function install(){if(document.getElementById('nexaUXMaxCss'))return;const s=document.createElement('style');s.id='nexaUXMaxCss';s.textContent=css.replace(/^<style>|<\/style>$/g,'');document.head.appendChild(s)}
function toolbar(){if(document.getElementById('nxUXMaxTools'))return;const d=document.createElement('div');d.id='nxUXMaxTools';d.className='nxUXMaxTools';d.innerHTML='<button id="nxUXTheme" aria-pressed="true"><span class="dot"></span>J&K UI</button><button id="nxUXCompact" aria-pressed="false">Compact</button>';document.body.appendChild(d);const k=d.querySelector('#nxUXTheme'),c=d.querySelector('#nxUXCompact');k.onclick=()=>{const on=!document.body.classList.contains('nexaUXMax');document.body.classList.toggle('nexaUXMax',on);k.setAttribute('aria-pressed',String(on));k.innerHTML='<span class="dot"></span>'+(on?'J&K UI':'Core UI')};c.onclick=()=>{const on=!document.body.classList.contains('nexaUXCompact');document.body.classList.toggle('nexaUXCompact',on);c.setAttribute('aria-pressed',String(on))}}
function inject(){document.body.classList.add('nexaUXMax');install();toolbar();document.documentElement.style.scrollBehavior='smooth'}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(inject,150));else setTimeout(inject,150);
window.addEventListener('load',()=>setTimeout(inject,220));
})();