const TOKEN_KEY="nexa.user.session";
const $=id=>document.getElementById(id);
const nextPath=(()=>{const n=new URLSearchParams(location.search).get("next");return n&&n.startsWith("/")&&!n.startsWith("//")&&!n.startsWith("/admin")?n:"/"})();
function token(){return sessionStorage.getItem(TOKEN_KEY)||""}
function saveToken(v){sessionStorage.setItem(TOKEN_KEY,v)}
function clearToken(){sessionStorage.removeItem(TOKEN_KEY)}
function setMessage(text,ok=false){const e=$("message");if(!e)return;e.textContent=text||"";e.className="message "+(ok?"ok":"")}
function escapeHtml(v){return String(v??"").replace(/[&<>\"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m]))}
async function api(path,options={}){const headers={"content-type":"application/json",...(options.headers||{})};if(token())headers.authorization=`Bearer ${token()}`;return fetch(path,{...options,headers,cache:"no-store"})}
function show(mode){const login=mode==="login";$("loginPanel")?.classList.toggle("hidden",!login);$("registerPanel")?.classList.toggle("hidden",login);$("loginTab")?.classList.toggle("active",login);$("registerTab")?.classList.toggle("active",!login);const title=$("accessTitle");if(title)title.textContent=login?"Sign in to Nexa AI":"Create your Nexa AI account";setMessage("")}
function score(p){let s=0;if(p.length>=10)s++;if(/[a-z]/.test(p)&&/[A-Z]/.test(p))s++;if(/\d/.test(p))s++;if(/[^A-Za-z0-9]/.test(p))s++;return s}
const passwordField=$("regPassword");
if(passwordField)passwordField.addEventListener("input",e=>{const s=score(e.target.value);const out=$("strength");if(out)out.textContent=s>=4?"Strong password.":s>=2?"Moderate password — add uppercase/lowercase, numbers and symbols.":"Use 10+ characters with a mix of letters, numbers and symbols."});
async function register(e){
 e.preventDefault();
 const form=$("registerForm"),button=form?.querySelector('button[type="submit"]');
 const name=$("regName")?.value.trim()||"",email=$("regEmail")?.value.trim().toLowerCase()||"",password=$("regPassword")?.value||"",confirm=$("regPasswordConfirm")?.value||"";
 if(name.length<2){setMessage("Please enter your full name.");return}
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){setMessage("Please enter a valid email address.");return}
 if(password.length<10){setMessage("Password must contain at least 10 characters.");return}
 if(password!==confirm){setMessage("Passwords do not match.");return}
 if(!$("regConsent")?.checked){setMessage("Please accept the Nexa AI Privacy, Safety & Acceptable Use Policy.");return}
 if(button){button.disabled=true;button.dataset.originalText=button.textContent;button.textContent="Creating account…"}
 setMessage("Creating your secure account…");
 try{
  const r=await api("/v1/auth/register",{method:"POST",body:JSON.stringify({name,email,password,role:"User"})});
  let d={};try{d=await r.json()}catch{}
  if(!r.ok){setMessage(d.error||`Registration failed (${r.status}).`);return}
  form.reset();if($("strength"))$("strength").textContent="Use 10+ characters with a mix of letters, numbers and symbols.";
  setMessage("Account created successfully. Your registration is now pending administrator approval.",true);
  setTimeout(()=>show("login"),1800);
 }catch{setMessage("Unable to reach Nexa AI. Please check your connection and try again.");}
 finally{if(button){button.disabled=false;button.textContent=button.dataset.originalText||"Create Public Account"}}
}
async function login(e){e.preventDefault();const button=$("loginForm")?.querySelector('button[type="submit"]');if(button){button.disabled=true;button.dataset.originalText=button.textContent;button.textContent="Signing in…"}setMessage("Signing in…");try{const r=await api("/v1/auth/login",{method:"POST",body:JSON.stringify({email:$("loginEmail")?.value.trim().toLowerCase()||"",password:$("loginPassword")?.value||""})});let d={};try{d=await r.json()}catch{}if(!r.ok){setMessage(d.error||`Sign in failed (${r.status}).`);return}saveToken(d.token);location.replace(nextPath)}catch{setMessage("Unable to reach Nexa AI.")}finally{if(button){button.disabled=false;button.textContent=button.dataset.originalText||"Sign In to Nexa AI"}}}
async function boot(){if(!token())return;try{const r=await api("/v1/auth/me");if(r.ok){const d=await r.json();$("accountState").innerHTML=`<div class="signed"><strong>${escapeHtml(d.user.name)}</strong><span>${escapeHtml(d.user.email)}</span><button id="logout" class="ghost">Sign out</button></div>`;$("logout").onclick=async()=>{try{await api("/v1/auth/logout",{method:"POST"})}finally{clearToken();location.reload()}}}else clearToken()}catch{}}
$("loginTab")?.addEventListener("click",()=>show("login"));
$("registerTab")?.addEventListener("click",()=>show("register"));
$("loginForm")?.addEventListener("submit",login);
$("registerForm")?.addEventListener("submit",register);
boot();