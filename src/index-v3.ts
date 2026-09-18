import worker from './index-v2';
import { inspectUploadedFile, analyzeUploadedEEG } from './file-intelligence';
import { analyzeFile } from './file-reader';

type User={id:string,name:string,email:string,role:string,status:'pending'|'accepted'|'rejected',passwordHash:string,createdAt:string,updatedAt:string};
type Session={userId:string,expiresAt:number};
const guestChats=new Map<string,{count:number,resetAt:number}>();
const GUEST_LIMIT=10, SESSION_MS=24*60*60*1000, encoder=new TextEncoder();
const clean=(v:any,max=200)=>String(v??'').trim().slice(0,max);
const json=(body:any,status=200)=>new Response(JSON.stringify(body),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store'}});
const makeId=()=>crypto.randomUUID();
function bytesToBase64(bytes:Uint8Array){let binary='';for(const byte of bytes)binary+=String.fromCharCode(byte);return btoa(binary)}
async function hashPassword(password:string){const salt=crypto.getRandomValues(new Uint8Array(16));const key=await crypto.subtle.importKey('raw',encoder.encode(password),'PBKDF2',false,['deriveBits']);const bits=await crypto.subtle.deriveBits({name:'PBKDF2',salt,iterations:60000,hash:'SHA-256'},key,256);return `${bytesToBase64(salt)}.${bytesToBase64(new Uint8Array(bits))}`;}
async function verifyPassword(password:string,stored:string){try{const [s,p]=stored.split('.');if(!s||!p)return false;const salt=Uint8Array.from(atob(s),c=>c.charCodeAt(0));const expected=Uint8Array.from(atob(p),c=>c.charCodeAt(0));const key=await crypto.subtle.importKey('raw',encoder.encode(password),'PBKDF2',false,['deriveBits']);const bits=new Uint8Array(await crypto.subtle.deriveBits({name:'PBKDF2',salt,iterations:60000,hash:'SHA-256'},key,256));return bits.length===expected.length&&bits.every((v,i)=>v===expected[i]);}catch{return false}}
const publicUser=(u:User)=>({id:u.id,name:u.name,email:u.email,role:u.role,status:u.status,createdAt:u.createdAt,updatedAt:u.updatedAt});
function tokenFrom(request:Request){const h=request.headers.get('authorization')||'';return h.startsWith('Bearer ')?h.slice(7):''}
function store(env:any){if(!env.USER_STORE)throw new Error('USER_STORE binding is not configured');return env.USER_STORE.getByName('global')}
async function userFromRequest(request:Request,env:any){const t=tokenFrom(request);if(!t)return null;const s:Session|null=await store(env).getSession(t);if(!s)return null;return await store(env).getUser(s.userId)}
function isAdmin(request:Request,env:any){const token=tokenFrom(request);return !!token&&!!env.ADMIN_TOKEN&&token===env.ADMIN_TOKEN}
function guestKey(request:Request){return request.headers.get('CF-Connecting-IP')||'guest'}
function consumeGuestChat(request:Request){const now=Date.now(),key=guestKey(request);let q=guestChats.get(key);if(!q||q.resetAt<now){q={count:0,resetAt:now+24*60*60*1000};guestChats.set(key,q)}if(q.count>=GUEST_LIMIT)return false;q.count++;return true;}
function guestRemaining(request:Request){const q=guestChats.get(guestKey(request));return Math.max(0,GUEST_LIMIT-(q?.count||0))}
function guestResponseHeaders(response:Response,remaining:number){const h=new Headers(response.headers);h.set('X-Nexa-Guest-Remaining',String(remaining));h.set('X-Nexa-Guest-Limit',String(GUEST_LIMIT));return new Response(response.body,{status:response.status,statusText:response.statusText,headers:h})}
function publicProtected(path:string){return path==='/v1/chat/completions'||path==='/v1/audio/speech'||path==='/v1/audio/transcriptions'||path==='/v1/vision'||path==='/v1/telemetry'}
async function authApi(request:Request,env:any,url:URL):Promise<Response|null>{
  const userStore=()=>store(env);
  if((url.pathname==='/v1/files/inspect'||url.pathname==='/v1/files/analyze-eeg'||url.pathname==='/v1/files/analyze')&&request.method==='POST'){
    if(!await userFromRequest(request,env))return json({error:'Authentication required',code:'AUTH_REQUIRED',login:'/auth.html'},401);
    if(url.pathname==='/v1/files/analyze-eeg')return analyzeUploadedEEG(request,env);
    if(url.pathname==='/v1/files/analyze')return analyzeFile(request,env);
    return inspectUploadedFile(request);
  }
  if(url.pathname==='/v1/auth/register'&&request.method==='POST'){
    try{
      const b:any=await request.json().catch(()=>({}));
      const name=clean(b.name,100),email=clean(b.email,160).toLowerCase(),password=String(b.password||'');
      if(name.length<2||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||password.length<10)return json({error:'Name, valid email and a password of at least 10 characters are required.'},400);
      const passwordHash=await hashPassword(password),now=new Date().toISOString();
      const u:User={id:makeId(),name,email,role:'User',status:'pending',passwordHash,createdAt:now,updatedAt:now};
      const result=await userStore().register(u);
      if(!result.ok)return json({error:'An account with this email already exists.'},409);
      return json({ok:true,status:'pending',message:'Registration received. Your account is pending approval.',user:publicUser(u)},201);
    }catch(error){return json({error:'Registration service is temporarily unavailable. Please try again.',code:'REGISTRATION_STORE_ERROR'},503)}
  }
  if(url.pathname==='/v1/auth/login'&&request.method==='POST'){
    const b:any=await request.json().catch(()=>({}));const email=clean(b.email,160).toLowerCase(),password=String(b.password||'');
    const u:User|null=await userStore().getUserByEmail(email);
    if(!u||!(await verifyPassword(password,u.passwordHash)))return json({error:'Invalid email or password.'},401);
    if(u.status!=='accepted')return json({error:u.status==='pending'?'Your account is awaiting approval.':'This account is not active.'},403);
    const token=crypto.randomUUID()+crypto.randomUUID(),expiresAt=Date.now()+SESSION_MS;
    await userStore().createSession(token,{userId:u.id,expiresAt});
    return json({ok:true,token,expiresAt,user:publicUser(u)});
  }
  if(url.pathname==='/v1/auth/me'&&request.method==='GET'){const u=await userFromRequest(request,env);return u?json({ok:true,user:publicUser(u)}):json({error:'Authentication required'},401)}
  if(url.pathname==='/v1/auth/logout'&&request.method==='POST'){
    const token=tokenFrom(request); const u=await userFromRequest(request,env);
    if(u) await userStore().recordSecurityEvent({id:makeId(),userId:u.id,eventType:'logout',metadata:'{}',createdAt:new Date().toISOString()});
    await userStore().deleteSession(token); return json({ok:true});
  }
  if(url.pathname==='/v1/auth/guest'&&request.method==='GET'){const u=await userFromRequest(request,env);return json({authenticated:!!u,remaining:u?null:guestRemaining(request),limit:GUEST_LIMIT})}
  if(url.pathname==='/v1/privacy/consent'&&request.method==='POST'){
    const u=await userFromRequest(request,env); if(!u)return json({error:'Authentication required',code:'AUTH_REQUIRED'},401);
    const b:any=await request.json().catch(()=>({}));
    const noticeVersion=clean(b.noticeVersion,60)||'2026-09-18';
    const purposes=Array.isArray(b.purposes)?b.purposes.map((x:any)=>clean(x,80)).filter(Boolean).slice(0,20):[];
    const granted=b.granted===true;
    await userStore().recordConsent({id:makeId(),userId:u.id,noticeVersion,purposes:JSON.stringify(purposes),granted,createdAt:new Date().toISOString()});
    await userStore().recordSecurityEvent({id:makeId(),userId:u.id,eventType:granted?'consent_granted':'consent_withdrawn',metadata:JSON.stringify({noticeVersion,purposes}),createdAt:new Date().toISOString()});
    return json({ok:true,noticeVersion,purposes,granted});
  }
  if(url.pathname==='/v1/privacy/consent'&&request.method==='GET'){
    const u=await userFromRequest(request,env); if(!u)return json({error:'Authentication required',code:'AUTH_REQUIRED'},401);
    return json({ok:true,noticeVersion:'2026-09-18',events:await userStore().listConsents(u.id)});
  }
  if(url.pathname==='/v1/privacy/request'&&request.method==='POST'){
    const u=await userFromRequest(request,env); if(!u)return json({error:'Authentication required',code:'AUTH_REQUIRED'},401);
    const b:any=await request.json().catch(()=>({}));
    const requestType=clean(b.type,30).toLowerCase();
    if(!['access','correction','erasure','grievance','data-portability'].includes(requestType))return json({error:'Unsupported privacy request type.'},400);
    const details=clean(b.details,2000); const now=new Date().toISOString(); const id=makeId();
    await userStore().createPrivacyRequest({id,userId:u.id,requestType,details,createdAt:now});
    await userStore().recordSecurityEvent({id:makeId(),userId:u.id,eventType:'privacy_request',metadata:JSON.stringify({requestId:id,type:requestType}),createdAt:now});
    return json({ok:true,requestId:id,status:'received'},202);
  }
  if(url.pathname==='/v1/privacy/request'&&request.method==='GET'){
    const u=await userFromRequest(request,env); if(!u)return json({error:'Authentication required',code:'AUTH_REQUIRED'},401);
    return json({ok:true,requests:await userStore().listPrivacyRequests(u.id)});
  }
  if(url.pathname==='/v1/admin/privacy/requests'&&request.method==='GET'){
    if(!isAdmin(request,env))return json({error:'Unauthorized'},401);
    return json({ok:true,requests:await userStore().listPrivacyRequests()});
  }
  if(url.pathname==='/v1/admin/security/events'&&request.method==='GET'){
    if(!isAdmin(request,env))return json({error:'Unauthorized'},401);
    const limit=Number(url.searchParams.get('limit')||500);
    return json({ok:true,events:await userStore().listSecurityEvents(limit)});
  }
  if(url.pathname.startsWith('/v1/admin/users')){
    if(!isAdmin(request,env))return json({error:'Unauthorized'},401);
    const suffix=url.pathname.slice('/v1/admin/users'.length).replace(/^\//,'');
    if(request.method==='GET'&&!suffix)return json({ok:true,persistent:true,storage:'durable-object-sqlite',users:(await userStore().listUsers()).map(publicUser)});
    if(request.method==='POST'&&!suffix){
      const b:any=await request.json().catch(()=>({}));const name=clean(b.name,100),email=clean(b.email,160).toLowerCase(),role=clean(b.role,60)||'User';
      if(!name||!email.includes('@'))return json({error:'Name and a valid email are required.'},400);
      const now=new Date().toISOString();const u:User={id:makeId(),name,email,role,status:'pending',passwordHash:await hashPassword(crypto.randomUUID()),createdAt:now,updatedAt:now};
      const result=await userStore().register(u);if(!result.ok)return json({error:'A user with this email already exists.'},409);return json({ok:true,user:publicUser(u)},201);
    }
    const u:User|null=await userStore().getUser(suffix);if(!u)return json({error:'User not found'},404);
    if(request.method==='PATCH'){
      const b:any=await request.json().catch(()=>({}));const patch:any={};
      if(b.name!==undefined)patch.name=clean(b.name,100)||u.name;
      if(b.email!==undefined){const email=clean(b.email,160).toLowerCase();if(!email.includes('@'))return json({error:'Invalid email.'},400);patch.email=email}
      if(b.role!==undefined)patch.role=clean(b.role,60)||u.role;
      if(['pending','accepted','rejected'].includes(b.status))patch.status=b.status;
      if(typeof b.password==='string'&&b.password.length>=10)patch.passwordHash=await hashPassword(b.password);
      patch.updatedAt=new Date().toISOString();
      try{const updated=await userStore().updateUser(u.id,patch);await userStore().deleteSessionsForUser(u.id);return json({ok:true,user:publicUser(updated as User)})}catch(error){if(error instanceof Error&&error.message==='duplicate_email')return json({error:'A user with this email already exists.'},409);throw error}
    }
    if(request.method==='DELETE'){await userStore().deleteUser(u.id);return json({ok:true,deleted:u.id})}
  }
  return null;
}
async function publicAssets(request:Request,env:any){const response=await worker.fetch(request,env);const url=new URL(request.url);const ct=response.headers.get('content-type')||'';if(!ct.includes('text/html')||url.pathname==='/admin.html'||url.pathname==='/auth.html'||url.pathname==='/trust.html'||url.pathname==='/architecture.html')return response;const html=await response.text();const sanitized=html.replace(/<a[^>]+href=["']\/admin\.html["'][^>]*>[\s\S]*?<\/a>/gi,'');let injected=sanitized.includes('/auth-widget.js')?sanitized:sanitized.replace('</body>','<script src="/auth-widget.js" defer></script></body>');if(!injected.includes('/auth-fetch.js'))injected=injected.replace('</body>','<script src="/auth-fetch.js" defer></script></body>');if(!injected.includes('/nexa-shell.js'))injected=injected.replace('</body>','<script src="/nexa-shell.js" defer></script></body>');if(!injected.includes('/file-upload-fix.js'))injected=injected.replace('</body>','<script src="/file-upload-fix.js" defer></script></body>');if(!injected.includes('/file-reader-ui.js'))injected=injected.replace('</body>','<script src="/file-reader-ui.js" defer></script></body>');const h=new Headers(response.headers);h.delete('content-length');h.set('cache-control','no-store');return new Response(injected,{status:response.status,statusText:response.statusText,headers:h})}
export default{async fetch(request:Request,env:any):Promise<Response>{const url=new URL(request.url);if(request.method==='OPTIONS')return new Response(null,{status:204});const a=await authApi(request,env,url);if(a)return a;if(publicProtected(url.pathname)){const user=await userFromRequest(request,env);if(!user&&url.pathname==='/v1/chat/completions'){if(!consumeGuestChat(request))return json({error:'Guest limit reached. Sign in or register to continue.',code:'GUEST_LIMIT_REACHED',login:'/auth.html',remaining:0},401);const response=await worker.fetch(request,env);return guestResponseHeaders(response,guestRemaining(request))}if(!user)return json({error:'Authentication required',code:'AUTH_REQUIRED',login:'/auth.html'},401)}return publicAssets(request,env)}};
