(()=>{
'use strict';
const KEY='nexa.eco.mode';
const esc=v=>String(v??'').replace(/[&<>\\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\\"':'&quot;',"'":'&#39;'}[c]));
function css(){if(document.getElementById('nexaEcoUI'))return;const s=document.createElement('style');s.id='nexaEcoUI';s.textContent=
':root{--eco:#37c98b;--eco2:#79e6b1;--eco-bg:#06140f;--eco-line:rgba(100,220,165,.18)}'+
'body.nexaEco{background:linear-gradient(135deg,#04110c,#071a14 48%,#06101d)!important}'+
'body.nexaEco:before,body.nexaEco:after{display:none!important}'+
'body.nexaEco *{scroll-behavior:auto!important}'+
'body.nexaEco .nxSide{background:rgba(3,16,12,.94)!important;border-right-color:var(--eco-line)!important}'+
'body.nexaEco .nxNew{background:linear-gradient(135deg,#159b69,#2677c9)!important;box-shadow:none!important}'+
'body.nexaEco .nxNav.on{background:rgba(44,190,126,.13)!important;border-color:var(--eco-line)!important}'+
'body.nexaEco .nxNav i{color:#71e5ae!important}'+
'body.nexaEco .nxTop{background:rgba(3,14,11,.92)!important;border-bottom-color:var(--eco-line)!important}'+
'body.nexaEco .nxWelcome h1{background:linear-gradient(100deg,#fff 15%,#a8f1c9 58%,#a9d7ff 95%)!important;-webkit-background-clip:text!important;background-clip:text!important}'+
'body.nexaEco .nxWelcome .eyebrow,body.nexaEco .nxRailTitle{color:var(--eco2)!important}'+
'body.nexaEco .nxSuggestion:hover{border-color:rgba(75,220,150,.4)!important;box-shadow:0 8px 24px rgba(0,0,0,.16)!important}'+
'body.nexaEco .nxComposer{border-color:var(--eco-line)!important;box-shadow:0 10px 30px rgba(0,0,0,.16)!important}'+
'body.nexaEco .nxSend{background:linear-gradient(135deg,#159b69,#2879d2)!important;box-shadow:none!important}'+
'body.nexaEco .nxCinematicRail .nxRailCard,body.nexaEco .nxPanel{background:rgba(4,24,17,.9)!important;border-color:var(--eco-line)!important;box-shadow:0 10px 30px rgba(0,0,0,.14)!important}'+
'.nxEcoBar{position:fixed;right:16px;bottom:16px;z-index:9998;display:flex;align-items:center;gap:7px;padding:5px;border:1px solid rgba(100,220,165,.2);background:rgba(4,18,14,.92);border-radius:13px;box-shadow:0 8px 28px rgba(0,0,0,.22);backdrop-filter:blur(12px)}'+
'.nxEcoBar button{border:0;background:transparent;color:#9ab6a8;border-radius:9px;padding:7px 9px;font-size:10px;font-weight:750}.nxEcoBar button:hover{background:rgba(60,190,130,.12);color:#e7fff2}.nxEcoDot{color:#5be3a4}.nxMobileNav{display:none}'+
'@media(max-width:699px){.nxEcoBar{right:10px;bottom:calc(70px + env(safe-area-inset-bottom));padding:4px}.nxEcoBar button{padding:7px 8px}.nxMobileNav{position:fixed;left:8px;right:8px;bottom:calc(8px + env(safe-area-inset-bottom));z-index:9997;display:grid;grid-template-columns:repeat(5,1fr);gap:3px;padding:5px;border:1px solid rgba(100,220,165,.18);background:rgba(3,15,12,.96);border-radius:16px;box-shadow:0 10px 30px rgba(0,0,0,.3);backdrop-filter:blur(12px)}.nxMobileNav button{border:0;background:transparent;color:#78958a;border-radius:11px;padding:7px 3px;font-size:8px;font-weight:700}.nxMobileNav button span{display:block;font-size:15px;margin-bottom:2px}.nxMobileNav button.on{background:rgba(60,190,130,.12);color:#8feac0}.nxEcoBar{bottom:calc(74px + env(safe-area-inset-bottom))}}';document.head.appendChild(s)}
function nav(){if(document.getElementById('nxMobileNav'))return;const n=document.createElement('nav');n.id='nxMobileNav';n.className='nxMobileNav';n.setAttribute('aria-label','Nexa quick navigation');n.innerHTML=[['home','⌂','Home'],['chat','✦','Chat'],['medical','✚','Health'],['files','□','Files'],['voice','◉','Voice']].map(x=>'<button data-page="'+x[0]+'"><span>'+x[1]+'</span>'+esc(x[2])+'</button>').join('');document.body.appendChild(n);n.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{const target=document.querySelector('.nxNav[data-page="'+b.dataset.page+'"]');if(target)target.click();else if(window.NexaEcoPage)window.NexaEcoPage(b.dataset.page);sync()}));sync()}
function sync(){document.querySelectorAll('.nxMobileNav button').forEach(b=>b.classList.toggle('on',!!document.querySelector('.nxNav[data-page="'+b.dataset.page+'"].on')))}
function ecoBar(){if(document.getElementById('nxEcoBar'))return;const b=document.createElement('div');b.id='nxEcoBar';b.className='nxEcoBar';b.innerHTML='<span class="nxEcoDot">●</span><button id="nxEcoToggle" type="button">Eco mode</button>';document.body.appendChild(b);const on=localStorage.getItem(KEY)!=='off';if(on)document.body.classList.add('nexaEco');document.getElementById('nxEcoToggle').onclick=()=>{const next=!document.body.classList.contains('nexaEco');document.body.classList.toggle('nexaEco',next);localStorage.setItem(KEY,next?'on':'off');document.getElementById('nxEcoToggle').textContent=next?'Eco mode':'Full visuals';document.getElementById('nxEcoToggle').title=next?'Lightweight visuals enabled':'Full visual effects enabled'};document.getElementById('nxEcoToggle').textContent=on?'Eco mode':'Full visuals';}
function init(){css();if(document.body.classList.contains('adminCinematic'))return;nav();ecoBar();sync();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(init,350));else setTimeout(init,350);window.addEventListener('load',()=>setTimeout(init,500));new MutationObserver(sync).observe(document.body,{subtree:true,childList:true});
})();