// @ts-nocheck
import { textToSpeech, speechToText, voiceSpeaker, voiceEncoding, voiceContentType } from "./voice";
import { withSecurityHeaders, isAdminRequest } from "./security";
import { isMedicalQuery, detectMedicalSpecialties, recommendMedicalProviders } from "./medical-directory";
import { getMedicalInternalContext } from "./medical-internal-knowledge";

const BRAND="Nexa AI";
const POWERED_BY="SPRINGNEXA PRIVATE LIMITED (IT Division)";
const COMPANY="SpringNexa Private Limited";
const FAST_MODEL="@cf/zai-org/glm-4.7-flash";
const MEDICAL_DEFAULT="@cf/zai-org/glm-4.7-flash";
const TIMEOUT_MS=8000;
const DEFAULT_SYSTEM=`You are Nexa AI, powered by ${POWERED_BY}. Be accurate, useful and concise. Never claim to be a doctor. Do not invent hospitals, doctors, credentials, statistics or citations.`;
const MEDICAL_SYSTEM=`You are Nexa AI Medical, powered by ${POWERED_BY}. Provide medical education and decision support, not a definitive diagnosis or prescription. Distinguish possibilities from diagnosis. For emergencies advise immediate local medical care. Do not invent clinicians, hospitals or medical records. Use supplied NEXA evidence and structured EDX knowledge when present. Preserve uncertainty and clinician-review requirements.`;

type Message={role:"system"|"user"|"assistant";content:string};
type Result={content:string;provider:string;model:string};

function json(data:any,status=200,extra?:HeadersInit){return new Response(JSON.stringify(data),{status,headers:{"content-type":"application/json; charset=utf-8","cache-control":"no-store",...extra}})}
function cors(r:Response){const h=new Headers(r.headers);h.delete("access-control-allow-origin");h.set("access-control-allow-methods","GET,POST,OPTIONS");h.set("access-control-allow-headers","content-type,authorization,cookie,x-admin-reviewer");h.set("access-control-max-age","600");return withSecurityHeaders(new Response(r.body,{status:r.status,statusText:r.statusText,headers:h}))}
function messages(body:any):Message[]{return (Array.isArray(body?.messages)?body.messages:[]).filter((m:any)=>m&&["system","user","assistant"].includes(m.role)&&typeof m.content==="string").slice(-8)}
function timeoutFetch(url:string,init:RequestInit){return fetch(url,{...init,signal:AbortSignal.timeout(TIMEOUT_MS)})}
async function cloudflare(env:any,msgs:Message[],model:string):Promise<Result>{if(!env.AI)throw new Error("cloudflare:AI_binding_unavailable");const d:any=await env.AI.run(model,{messages:msgs,max_tokens:1000,temperature:.15});const c=d?.response??d?.choices?.[0]?.message?.content;if(typeof c!=="string"||!c.trim())throw new Error("cloudflare:invalid_response");return{content:c,provider:"cloudflare",model}}\nasync function medical(env:any,msgs:Message[],model:string):Promise<Result>{const preferred=model?.startsWith("@cf/")?model:FAST_MODEL;return cloudflare(env,msgs,preferred)}
async function answer(env:any,msgs:Message[],provider="auto",requestedModel?:string):Promise<Result>{
  const selected=provider.toLowerCase();
  if(!["auto","cloudflare","medical"].includes(selected)) throw new Error("cloudflare_only_provider");
  return selected==="medical"?medical(env,msgs,requestedModel||MEDICAL_DEFAULT):cloudflare(env,msgs,requestedModel?.startsWith("@cf/")?requestedModel:FAST_MODEL);
}

export default {async fetch(request:Request,env:any):Promise<Response>{const url=new URL(request.url);if(request.method==="OPTIONS")return cors(new Response(null,{status:204}));if(url.pathname==="/health"&&request.method==="GET")return cors(json({ok:true,service:BRAND,poweredBy:POWERED_BY,company:COMPANY,division:"IT Division",modes:["auto","medical","voice"]}));
if(url.pathname==="/v1/models"&&request.method==="GET")return cors(json({brand:BRAND,poweredBy:POWERED_BY,company:COMPANY,models:[{id:"auto",name:"Nexa AI Auto",type:"general"},{id:"medical",name:"Nexa AI Medical",type:"medical"},{id:"voice",name:"Nexa Voice",type:"voice"}]})));
if(url.pathname==="/v1/medical/specialties"&&request.method==="GET")return cors(json({specialties:detectMedicalSpecialties(url.searchParams.get("q")||""),directory:"verified-only"}));
if(url.pathname==="/v1/medical/providers"&&request.method==="GET")return cors(json(recommendMedicalProviders(url.searchParams.get("q")||"",url.searchParams.get("location")||"",(url.searchParams.get("type") as any)||undefined)));
if(url.pathname==="/v1/voice/capabilities"&&request.method==="GET")return cors(json({brand:BRAND,product:"Nexa Voice",speechToText:true,textToSpeech:true,providers:{elevenlabs:!!env.ELEVENLABS_API_KEY,cloudflare:true},languages:["en","hi","ur","doi","ks","goj"],formats:["mp3","opus","wav"]}));
if(url.pathname==="/v1/audio/speech"&&request.method==="POST"){try{const b:any=await request.json();const text=typeof b?.input==="string"?b.input:typeof b?.text==="string"?b.text:"";if(!text.trim())return cors(json({error:"input is required"},400));const enc=voiceEncoding(b?.response_format||b?.format);const a=await textToSpeech(env,text,voiceSpeaker(b?.voice),enc);return cors(new Response(a.body,{status:a.status,headers:{"content-type":voiceContentType(enc),"cache-control":"no-store","x-nexa-product":"Nexa Voice"}}))}catch{return cors(json({error:"Voice generation failed"},503))}}
if(url.pathname==="/v1/audio/transcriptions"&&request.method==="POST"){try{const ct=request.headers.get("content-type")||"";let audio:ArrayBuffer,language:string|undefined;if(ct.includes("multipart/form-data")){const f=await request.formData(),file=f.get("file");if(!(file instanceof File))return cors(json({error:"audio file is required"},400));audio=await file.arrayBuffer();language=typeof f.get("language")==="string"?String(f.get("language")):undefined}else{audio=await request.arrayBuffer();language=url.searchParams.get("language")||undefined}const r=await speechToText(env,audio,language);return cors(json({brand:BRAND,product:"Nexa Voice",text:r.text,wordCount:r.wordCount,vtt:r.vtt}))}catch{return cors(json({error:"Voice transcription failed"},503))}}
if(url.pathname==="/v1/chat/completions"&&request.method==="POST"){try{const b:any=await request.json();const msgs=messages(b);if(!msgs.some(m=>m.role==="user"))return cors(json({error:"messages with a user message are required"},400));const selected=typeof b.provider==="string"?b.provider:typeof b.mode==="string"?b.mode:"auto";if(!msgs.some(m=>m.role==="system")){const q=[...msgs].reverse().find(m=>m.role==="user")?.content||"";const medicalMode=selected.toLowerCase()==="medical"||isMedicalQuery(q);msgs.unshift({role:"system",content:medicalMode?`${MEDICAL_SYSTEM}\n\n${getMedicalInternalContext(q)}`:DEFAULT_SYSTEM})}const r=await answer(env,msgs,selected,typeof b.model==="string"?b.model:undefined);return cors(json({id:crypto.randomUUID(),object:"chat.completion",created:Math.floor(Date.now()/1000),brand:BRAND,poweredBy:POWERED_BY,company:COMPANY,provider:r.provider,model:r.model,choices:[{index:0,message:{role:"assistant",content:r.content},finish_reason:"stop"}]}))}catch(e){return cors(json({error:"AI service temporarily unavailable",detail:e instanceof Error?e.message:"provider_error"},503))}}
if(url.pathname==="/v1/admin/status"&&request.method==="GET"){if(!isAdminRequest(request,env.ADMIN_TOKEN))return cors(json({error:"Unauthorized"},401));return cors(json({ok:true,admin:true,service:BRAND,provider:"cloudflare",secretsConfigured:{admin:!!env.ADMIN_TOKEN}}))}
const asset=await env.ASSETS.fetch(request);return withSecurityHeaders(asset)}};
