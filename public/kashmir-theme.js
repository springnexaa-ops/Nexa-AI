(()=>{
'use strict';
function install(){if(document.getElementById('nexaKashmirTheme'))return;const s=document.createElement('style');s.id='nexaKashmirTheme';s.textContent=
`:root{--jk-sky:#73c7e8;--jk-sky-deep:#3c9fc8;--jk-ice:#eaf9ff;--jk-mountain:#234c5f;--jk-chinar:#245844;--jk-saffron:#d8a642;--jk-walnut:#5a4331;--jk-ink:#123040;--jk-line:rgba(49,146,183,.22)}
body.nexaKashmir{background:linear-gradient(180deg,#eaf9ff 0%,#f8fcfd 44%,#eef7f4 100%)!important;color:var(--jk-ink)!important}
body.nexaKashmir:before{content:"";display:block!important;position:fixed;inset:0;z-index:-4;pointer-events:none;background:radial-gradient(circle at 12% 12%,rgba(255,255,255,.95),transparent 28%),linear-gradient(180deg,rgba(115,199,232,.38),rgba(234,249,255,.1) 42%,rgba(36,88,68,.08) 100%)!important;filter:none!important}
body.nexaKashmir:after{content:"";display:block!important;position:fixed;left:0;right:0;bottom:0;height:30vh;z-index:-3;pointer-events:none;background:linear-gradient(145deg,transparent 0 22%,rgba(35,76,95,.11) 22% 32%,transparent 32% 47%,rgba(35,76,95,.08) 47% 58%,transparent 58%),linear-gradient(180deg,transparent,rgba(36,88,68,.06))!important}
body.nexaKashmir .nxSide{background:rgba(245,252,255,.92)!important;border-right:1px solid var(--jk-line)!important;backdrop-filter:blur(14px)!important}
body.nexaKashmir .nxBrand b,body.nexaKashmir .nxTitle,body.nexaKashmir .nxWelcome h1{color:var(--jk-ink)!important;text-shadow:none!important}
body.nexaKashmir .nxBrand small,body.nexaKashmir .nxWelcome p{color:#496a79!important}
body.nexaKashmir .nxNew{background:linear-gradient(135deg,var(--jk-sky-deep),#2685b5)!important;box-shadow:0 7px 18px rgba(60,159,200,.16)!important}
body.nexaKashmir .nxNav{color:#527080!important;border-color:transparent!important}
body.nexaKashmir .nxNav i{color:var(--jk-sky-deep)!important}
body.nexaKashmir .nxNav.on{background:linear-gradient(90deg,rgba(115,199,232,.23),rgba(36,88,68,.06))!important;border-color:rgba(60,159,200,.18)!important;color:var(--jk-ink)!important}
body.nexaKashmir .nxTop{background:rgba(248,253,255,.84)!important;border-bottom:1px solid var(--jk-line)!important;backdrop-filter:blur(16px)!important}
body.nexaKashmir .nxWelcome .eyebrow,body.nexaKashmir .nxRailTitle{color:var(--jk-sky-deep)!important}
body.nexaKashmir .nxWelcome h1{font-family:Georgia,'Times New Roman',serif!important;font-weight:400!important;letter-spacing:-.035em!important;background:linear-gradient(105deg,#123040,#267ea2 58%,#245844)!important;-webkit-background-clip:text!important;background-clip:text!important;-webkit-text-fill-color:transparent!important}
body.nexaKashmir .nxSuggestion{background:rgba(255,255,255,.72)!important;border:1px solid var(--jk-line)!important;color:var(--jk-ink)!important;box-shadow:0 8px 25px rgba(37,103,128,.07)!important}
body.nexaKashmir .nxSuggestion:hover{border-color:rgba(60,159,200,.45)!important;transform:translateY(-1px)!important}
body.nexaKashmir .nxComposer{background:rgba(255,255,255,.88)!important;border-color:rgba(60,159,200,.3)!important;box-shadow:0 12px 35px rgba(37,103,128,.1)!important}
body.nexaKashmir .nxComposer textarea{color:var(--jk-ink)!important}body.nexaKashmir .nxComposer textarea::placeholder{color:#71909d!important}
body.nexaKashmir .nxTool{background:#edf8fc!important;border-color:var(--jk-line)!important;color:#3c6273!important}
body.nexaKashmir .nxSend{background:linear-gradient(135deg,var(--jk-sky-deep),#286e98)!important;box-shadow:none!important}
body.nexaKashmir .nxCinematicRail .nxRailCard,body.nexaKashmir .nxPanel{background:rgba(255,255,255,.76)!important;border-color:var(--jk-line)!important;color:var(--jk-ink)!important;box-shadow:0 10px 30px rgba(37,103,128,.07)!important}
body.nexaKashmir .nxSlogan span{color:var(--jk-chinar)!important}body.nexaKashmir .nxRailMuted,body.nexaKashmir .nxWeatherMeta{color:#66818d!important}
body.nexaKashmir .nxWeatherChip{background:rgba(255,255,255,.78)!important;border-color:var(--jk-line)!important;color:var(--jk-ink)!important}
body.nexaKashmir .nxQuick button{background:#eef8fb!important;color:#315a6b!important}
body.nexaKashmir .nxQuick button:hover{background:#dff2f8!important}
body.nexaKashmir .nxFooterSlogan{border-top-color:var(--jk-line)!important;color:#587582!important}body.nexaKashmir .nxFooterSlogan b{color:var(--jk-chinar)!important}
body.nexaKashmir .nxTitle:after{content:' • JAMMU & KASHMIR • HEALTHIER TOMORROW';color:var(--jk-sky-deep)!important}
.nxKashmirMark{display:inline-flex;align-items:center;gap:6px;margin-left:6px;color:#3c8eb0;font-size:9px;font-weight:800;letter-spacing:.06em}.nxKashmirMark i{display:inline-block;width:7px;height:7px;border-radius:50%;background:var(--jk-sky);box-shadow:0 0 0 3px rgba(115,199,232,.16)}
.nxKashmirBar{position:fixed;left:16px;bottom:16px;z-index:9998;display:flex;align-items:center;gap:7px;padding:5px 7px;border:1px solid rgba(60,159,200,.2);background:rgba(248,253,255,.94);border-radius:12px;box-shadow:0 8px 24px rgba(37,103,128,.12);backdrop-filter:blur(10px)}.nxKashmirBar span{font-size:9px;color:#527080;font-weight:800}.nxKashmirBar button{border:0;background:transparent;color:#286e98;border-radius:8px;padding:7px 9px;font-size:10px;font-weight:800}.nxKashmirBar button:hover{background:rgba(115,199,232,.16)}
@media(max-width:699px){.nxKashmirBar{left:10px;bottom:calc(74px + env(safe-area-inset-bottom));padding:4px 6px}.nxKashmirBar span{display:none}.nxKashmirBar button{padding:7px 8px}}
@media(prefers-reduced-motion:reduce){body.nexaKashmir *{transition:none!important}}`;
document.head.appendChild(s)}
function init(){install();document.body.classList.add('nexaKashmir');const b=document.createElement('div');b.className='nxKashmirBar';b.innerHTML='<span>J&K • SKY</span><button type="button" id="nxKashmirToggle">Kashmir theme</button>';document.body.appendChild(b);const t=b.querySelector('button');const sync=()=>{t.textContent=document.body.classList.contains('nexaKashmir')?'Kashmir theme':'Standard theme'};t.onclick=()=>{const on=!document.body.classList.contains('nexaKashmir');document.body.classList.toggle('nexaKashmir',on);localStorage.setItem('nexa.kashmir.theme',on?'on':'off');sync()};sync();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(init,600));else setTimeout(init,600);window.addEventListener('load',()=>setTimeout(init,700));
})();