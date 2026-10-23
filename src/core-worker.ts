// @ts-nocheck
import { textToSpeech, speechToText, voiceSpeaker, voiceEncoding, voiceContentType } from "./voice";
import { withSecurityHeaders, isAdminRequest } from "./security";
import { isMedicalQuery, detectMedicalSpecialties, recommendMedicalProviders } from "./medical-directory";
import { getMedicalInternalContext } from "./medical-internal-knowledge";
import { runSequentialClinicalWorkflow, buildClinicianReviewSummary, type ClinicalCase, type ClinicalStage, type StageResult } from "./sequential-clinical-orchestrator";
import { retrieveSequentialEvidence } from "./sequential-medical-evidence-adapter";

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
async function cloudflare(env:any,msgs:Message[],model:string):Promise<Result>{if(!env.AI)throw new Error("cloudflare:AI_binding_unavailable");const d:any=await env.AI.run(model,{messages:msgs,max_tokens:1000,temperature:.15});const c=d?.response??d?.choices?.[0]?.message?.content;if(typeof c!=="string"||!c.trim())throw new Error("cloudflare:invalid_response");return{content:c,provider:"cloudflare",model}}
async function selfHosted(env:any,msgs:Message[],requestedModel?:string):Promise<Result>{
  const base=String(env.NEXA_MODEL_BASE_URL||"").trim().replace(/\/+$/,"");
  if(!base)throw new Error("self_hosted_model_not_configured");
  const endpoint=base.endsWith("/v1/chat/completions")?base:base.endsWith("/v1")?base+"/chat/completions":base+"/v1/chat/completions";
  const headers:Record<string,string>={"content-type":"application/json"};
  if(env.NEXA_MODEL_API_KEY)headers.authorization="Bearer "+String(env.NEXA_MODEL_API_KEY);
  const model=String(env.NEXA_MODEL_NAME||((requestedModel&&!requestedModel.startsWith("@cf/"))?requestedModel:"local-model"));
  const response=await timeoutFetch(endpoint,{method:"POST",headers,body:JSON.stringify({model,messages:msgs,max_tokens:1200,temperature:.15})});
  if(!response.ok)throw new Error("self_hosted_model_http_"+response.status);
  const data:any=await response.json();
  const content=data?.choices?.[0]?.message?.content??data?.response;
  if(typeof content!=="string"||!content.trim())throw new Error("self_hosted_model_invalid_response");
  return{content,provider:"self-hosted",model};
}
function activeModelProvider(env:any):"self-hosted"|"cloudflare"{
  const mode=String(env.NEXA_MODEL_PROVIDER||"auto").toLowerCase();
  if(mode==="self-hosted")return "self-hosted";
  if(mode==="cloudflare")return "cloudflare";
  if(mode!=="auto")throw new Error("unsupported_model_provider");
  return env.NEXA_MODEL_BASE_URL?"self-hosted":"cloudflare";
}
async function runModel(env:any,msgs:Message[],model:string):Promise<Result>{
  const mode=String(env.NEXA_MODEL_PROVIDER||"auto").toLowerCase();
  if(mode==="self-hosted")return selfHosted(env,msgs,model);
  if(mode==="cloudflare")return cloudflare(env,msgs,model.startsWith("@cf/")?model:FAST_MODEL);
  if(mode!=="auto")throw new Error("unsupported_model_provider");
  if(env.NEXA_MODEL_BASE_URL)return selfHosted(env,msgs,model);
  return cloudflare(env,msgs,model.startsWith("@cf/")?model:FAST_MODEL);
}
async function medical(env:any,msgs:Message[],model:string):Promise<Result>{return runModel(env,msgs,model||MEDICAL_DEFAULT)}
async function answer(env:any,msgs:Message[],provider="auto",requestedModel?:string):Promise<Result>{
  const selected=provider.toLowerCase();
  if(!["auto","cloudflare","medical","self-hosted"].includes(selected)) throw new Error("unsupported_model_provider");
  if(selected==="self-hosted")return selfHosted(env,msgs,requestedModel);
  if(selected==="medical")return medical(env,msgs,requestedModel||MEDICAL_DEFAULT);
  return runModel(env,msgs,requestedModel||FAST_MODEL);
}



function requiresSequentialClinicalWorkflow(query:string):boolean {
  return /\b(diagnos(?:e|is|tic|ing)?|differential|clinical case|clinical reasoning|patient presents|patient has|case report|symptoms? of|my symptoms|my test results|interpret(?:ation|ing)? (?:of )?(?:eeg|ncs|emg|vep|bera|baer|ecg|ekg|mri|ct|lab|test|report)|what could cause)\b/i.test(query);
}
type SequentialStageOutput = Omit<StageResult, "stage">;
function parseSequentialStage(content:string, stage:ClinicalStage):StageResult {
  const cleaned=content.replace(/^```(?:json)?\s*/i,"").replace(/\s*```$/,"").trim();
  const start=cleaned.indexOf("{"), end=cleaned.lastIndexOf("}");
  if(start<0||end<=start)throw new Error("sequential_stage_invalid_json");
  const value=JSON.parse(cleaned.slice(start,end+1)) as Partial<SequentialStageOutput>;
  if(typeof value.summary!=="string"||!Array.isArray(value.questionsToAsk)||!Array.isArray(value.suggestedInvestigations)||!Array.isArray(value.differential)||!Array.isArray(value.safetyFlags)||!Array.isArray(value.missingInformation)||!Array.isArray(value.uncertainty))throw new Error("sequential_stage_invalid_schema");
  return {
    stage, summary:value.summary.slice(0,5000),
    questionsToAsk:value.questionsToAsk.filter((x):x is string=>typeof x==="string").slice(0,8),
    suggestedInvestigations:value.suggestedInvestigations.filter((x:any)=>x&&typeof x.name==="string"&&typeof x.clinicalRationale==="string").map((x:any)=>({name:x.name.slice(0,180),clinicalRationale:x.clinicalRationale.slice(0,600),urgency:["urgent","routine","not_specified"].includes(x.urgency)?x.urgency:"not_specified",requiresClinicianOrder:true as const})).slice(0,12),
    differential:value.differential.filter((x:any)=>x&&typeof x.label==="string").map((x:any)=>({label:x.label.slice(0,180),rationale:Array.isArray(x.rationale)?x.rationale.filter((v:any)=>typeof v==="string").slice(0,6):[],evidenceFor:Array.isArray(x.evidenceFor)?x.evidenceFor.filter((v:any)=>typeof v==="string").slice(0,8):[],evidenceAgainst:Array.isArray(x.evidenceAgainst)?x.evidenceAgainst.filter((v:any)=>typeof v==="string").slice(0,8):[],missingInformation:Array.isArray(x.missingInformation)?x.missingInformation.filter((v:any)=>typeof v==="string").slice(0,8):[],status:["consider","less_likely","not_assessed"].includes(x.status)?x.status:"not_assessed"})).slice(0,10),
    evidence:[],
    safetyFlags:value.safetyFlags.filter((x:any)=>x&&typeof x.code==="string"&&typeof x.message==="string").map((x:any)=>({code:x.code.slice(0,80),severity:["critical","high","moderate","low"].includes(x.severity)?x.severity:"moderate",message:x.message.slice(0,600),action:["urgent_clinician_assessment","clinician_review","obtain_missing_data"].includes(x.action)?x.action:"clinician_review"})).slice(0,12),
    missingInformation:value.missingInformation.filter((x):x is string=>typeof x==="string").slice(0,12),
    uncertainty:value.uncertainty.filter((x):x is string=>typeof x==="string").slice(0,12)
  };
}
async function runSequentialMedicalAssessment(env:any, msgs:Message[], requestedModel:string|undefined, userText:string) {
  const model=requestedModel?.startsWith("@cf/")?requestedModel:MEDICAL_DEFAULT;
  const baseSystem=msgs.find(m=>m.role==="system")?.content||MEDICAL_SYSTEM;
  const evidencePack=retrieveSequentialEvidence(userText,8);
  const clinicalCase:ClinicalCase={caseId:crypto.randomUUID(),patientContext:{relevantHistory:msgs.filter(m=>m.role!=="system").slice(-8).map(m=>`${m.role}: ${m.content.slice(0,2000)}`)},presentingConcern:userText.slice(0,4000),findings:[]};
  const stages:ClinicalStage[]=["intake","problem_representation","differential","evidence_review","safety_review","clinician_review"];
  const handlers=Object.fromEntries(stages.map(stage=>[stage,async ({clinicalCase:cc,previous}:any):Promise<StageResult>=>{
    const previousSummary=Object.entries(previous).map(([name,v]:[string,any])=>({stage:name,summary:v.summary,questionsToAsk:v.questionsToAsk,differential:v.differential,safetyFlags:v.safetyFlags,missingInformation:v.missingInformation,uncertainty:v.uncertainty})).slice(-5);
    const stageInstructions:Record<ClinicalStage,string>={
      intake:"INTAKE: Identify only essential missing history needed to proceed safely. Ask a small number of targeted questions. If essential information is missing, put it in missingInformation and questionsToAsk; do not guess or diagnose.",
      problem_representation:"PROBLEM REPRESENTATION: Summarize the supplied facts only, separating verified findings from unverified patient-reported facts. Do not infer missing findings. Note uncertainty and missing essentials.",
      differential:"DIFFERENTIAL: Build a prioritized, provisional differential. For each candidate state evidence for, evidence against, and missing information. Do not present any candidate as confirmed.",
      evidence_review:"EVIDENCE REVIEW: Check claims against the evidence included in the system context. Cite only actual retrieved chunks using their supplied [E#] identifiers; never cite source metadata as if full text was reviewed. Suggest tests only as clinician-considered options and explain their rationale.",
      safety_review:"SAFETY REVIEW: Identify emergency red flags, dangerous alternatives, contraindication/medication risks if supported, and uncertainty. Use severity critical for a plausible immediate threat that requires urgent assessment. Do not suppress emergency advice.",
      clinician_review:"CLINICIAN REVIEW DRAFT: Produce a concise clinician-facing synthesis of the preceding stages, with uncertainty, evidence limitations, follow-up questions and investigations that require a clinician order. Never self-approve a diagnosis or prescribe."
    };
    const schema={summary:"string",questionsToAsk:["string"],suggestedInvestigations:[{name:"string",clinicalRationale:"string",urgency:"urgent|routine|not_specified",requiresClinicianOrder:true}],differential:[{label:"string",rationale:["string"],evidenceFor:["string"],evidenceAgainst:["string"],missingInformation:["string"],status:"consider|less_likely|not_assessed"}],safetyFlags:[{code:"string",severity:"critical|high|moderate|low",message:"string",action:"urgent_clinician_assessment|clinician_review|obtain_missing_data"}],missingInformation:["string"],uncertainty:["string"]};
    const prompt=`You are one role in Nexa AI's sequential clinical decision-support workflow. Return ONLY one valid JSON object matching this schema: ${JSON.stringify(schema)}. No markdown and no hidden chain-of-thought. Provide concise conclusions, observable evidence, uncertainty, and safety flags only. This is not a diagnosis or treatment order. Stage: ${stage}. ${stageInstructions[stage]} If there is not enough information to safely continue, explicitly populate missingInformation and questionsToAsk. If the stage does not apply, return empty arrays and explain why in summary.\n\nEvidence registry metadata (not proof of full-text review): ${JSON.stringify(evidencePack.evidence.map(e=>({id:e.id,title:e.title,source:e.source,url:e.url,limitations:e.limitations})))}`;
    const payload={case:{presentingConcern:cc.presentingConcern,patientContext:cc.patientContext,findings:cc.findings,userQuestion:cc.userQuestion},previousStages:previousSummary,stage};
    const r=await runModel(env,[{role:"system",content:baseSystem+"\n\n"+prompt},{role:"user",content:JSON.stringify(payload)}],model);
    const parsed=parseSequentialStage(r.content,stage);
    if(stage==="evidence_review")parsed.evidence=evidencePack.evidence;
    return parsed;
  }])) as Record<ClinicalStage,any>;
  const state=await runSequentialClinicalWorkflow(clinicalCase,{handlers});
  const review=buildClinicianReviewSummary(state);
  const intake=state.results.intake;
  if(state.status==="blocked_for_safety"){
    const flags=review.safetyFlags.map((x:any)=>`- ${x.message}`).join("\n");
    return {state,content:`**Nexa AI — urgent safety review required**\n\nThe sequential assessment identified a potential critical safety concern. Do not rely on an automated conclusion. Obtain immediate qualified clinical assessment or local emergency care as appropriate.\n\n${flags}`};
  }
  if(intake?.missingInformation?.length){
    const qs=intake.questionsToAsk.length?intake.questionsToAsk:intake.missingInformation;
    return {state,content:`**Nexa AI — more information needed**\n\nBefore forming a useful provisional assessment, please clarify:\n${qs.map((q:string)=>"- "+q).join("\n")}\n\nThis is an information-gathering step, not a diagnosis.`};
  }
  if(state.status==="awaiting_clinician"&&state.currentStage!=="clinician_review"){
    const stopped=state.results[state.currentStage];
    const qs=[...(stopped?.questionsToAsk||[]),...(stopped?.missingInformation||[])];
    return {state,content:qs.length?`**Nexa AI — clarification required**\n\nThe sequential assessment paused at ${state.currentStage.replace(/_/g," ")} because information is insufficient to proceed safely:\n${[...new Set(qs)].map((q:string)=>"- "+q).join("\n")}\n\nPlease provide the missing information for clinician-supervised review.`:`**Nexa AI — assessment paused**\n\nThe ${state.currentStage.replace(/_/g," ")} stage could not be completed reliably. No diagnostic assessment was approved. Please retry or refer the case to a qualified clinician.`};
  }
  const lines:string[]=["**Nexa AI — sequential clinical decision-support draft**","", "This is a provisional, evidence-aware draft for qualified clinician review, not a confirmed diagnosis or treatment order.",""];
  const pr=state.results.problem_representation, diff=state.results.differential, ev=state.results.evidence_review, safety=state.results.safety_review, final=state.results.clinician_review;
  if(pr?.summary)lines.push("**Problem representation**",pr.summary,"");
  if(diff?.differential?.length){lines.push("**Provisional differential**");for(const d of diff.differential)lines.push(`- **${d.label}** (${d.status}): ${d.rationale.join("; ")}`);lines.push("")}
  if(ev?.summary)lines.push("**Evidence review**",ev.summary,"");
  if(safety?.safetyFlags?.length){lines.push("**Safety flags**");for(const f of safety.safetyFlags)lines.push(`- [${f.severity.toUpperCase()}] ${f.message}`);lines.push("")}
  if(final?.summary)lines.push("**Clinician-review synthesis**",final.summary,"");
  const questions=[...new Set([...(final?.questionsToAsk||[]),...(final?.missingInformation||[]),...(safety?.missingInformation||[])])];
  if(questions.length){lines.push("**Questions / missing information**");for(const q of questions)lines.push("- "+q);lines.push("")}
  const tests=[...(final?.suggestedInvestigations||[]),...(ev?.suggestedInvestigations||[])];
  if(tests.length){lines.push("**Investigations for clinician consideration**");for(const t of tests)lines.push(`- ${t.name}: ${t.clinicalRationale} (clinician order required)`);lines.push("")}
  const evidence=review.evidence.filter((e:any)=>e.url||e.title);
  if(evidence.length){lines.push("**Evidence/source limitations**");for(const e of evidence.slice(0,8))lines.push(`- ${e.title} — ${e.source}${e.url?" ("+e.url+")":""}${e.limitations?.length?"; "+e.limitations.join(" "):""}`);lines.push("")}
  lines.push("**Clinical governance:** Clinician approval is required. Do not use this draft alone to diagnose, prescribe, or delay urgent care.");
  return {state,content:lines.join("\n")};
}

export default {async fetch(request:Request,env:any):Promise<Response>{const url=new URL(request.url);if(request.method==="OPTIONS")return cors(new Response(null,{status:204}));if(url.pathname==="/health"&&request.method==="GET")return cors(json({ok:true,service:BRAND,poweredBy:POWERED_BY,company:COMPANY,division:"IT Division",modes:["auto","medical","voice"]}));
if(url.pathname==="/v1/models"&&request.method==="GET")return cors(json({brand:BRAND,poweredBy:POWERED_BY,company:COMPANY,models:[{id:"auto",name:"Nexa AI Auto",type:"general"},{id:"medical",name:"Nexa AI Medical",type:"medical"},{id:"voice",name:"Nexa Voice",type:"voice"}]}));
if(url.pathname==="/v1/medical/specialties"&&request.method==="GET")return cors(json({specialties:detectMedicalSpecialties(url.searchParams.get("q")||""),directory:"verified-only"}));
if(url.pathname==="/v1/medical/providers"&&request.method==="GET")return cors(json(recommendMedicalProviders(url.searchParams.get("q")||"",url.searchParams.get("location")||"",(url.searchParams.get("type") as any)||undefined)));
if(url.pathname==="/v1/voice/capabilities"&&request.method==="GET")return cors(json({brand:BRAND,product:"Nexa Voice",speechToText:true,textToSpeech:true,providers:{elevenlabs:!!env.ELEVENLABS_API_KEY,cloudflare:true},languages:["en","hi","ur","doi","ks","goj"],formats:["mp3","opus","wav"]}));
if(url.pathname==="/v1/audio/speech"&&request.method==="POST"){try{const b:any=await request.json();const text=typeof b?.input==="string"?b.input:typeof b?.text==="string"?b.text:"";if(!text.trim())return cors(json({error:"input is required"},400));const enc=voiceEncoding(b?.response_format||b?.format);const a=await textToSpeech(env,text,voiceSpeaker(b?.voice),enc);return cors(new Response(a.body,{status:a.status,headers:{"content-type":voiceContentType(enc),"cache-control":"no-store","x-nexa-product":"Nexa Voice"}}))}catch{return cors(json({error:"Voice generation failed"},503))}}
if(url.pathname==="/v1/audio/transcriptions"&&request.method==="POST"){try{const ct=request.headers.get("content-type")||"";let audio:ArrayBuffer,language:string|undefined;if(ct.includes("multipart/form-data")){const f=await request.formData(),file=f.get("file");if(!(file instanceof File))return cors(json({error:"audio file is required"},400));audio=await file.arrayBuffer();language=typeof f.get("language")==="string"?String(f.get("language")):undefined}else{audio=await request.arrayBuffer();language=url.searchParams.get("language")||undefined}const r=await speechToText(env,audio,language);return cors(json({brand:BRAND,product:"Nexa Voice",text:r.text,wordCount:r.wordCount,vtt:r.vtt}))}catch{return cors(json({error:"Voice transcription failed"},503))}}
if(url.pathname==="/v1/chat/completions"&&request.method==="POST"){try{const b:any=await request.json();const msgs=messages(b);if(!msgs.some(m=>m.role==="user"))return cors(json({error:"messages with a user message are required"},400));const selected=typeof b.provider==="string"?b.provider:typeof b.mode==="string"?b.mode:"auto";const q=[...msgs].reverse().find(m=>m.role==="user")?.content||"";const medicalMode=selected.toLowerCase()==="medical"||isMedicalQuery(q);if(!msgs.some(m=>m.role==="system"))msgs.unshift({role:"system",content:medicalMode?`${MEDICAL_SYSTEM}\n\n${getMedicalInternalContext(q)}`:DEFAULT_SYSTEM});if(requiresSequentialClinicalWorkflow(q)){const workflow=await runSequentialMedicalAssessment(env,msgs,typeof b.model==="string"?b.model:undefined,q);return cors(json({id:crypto.randomUUID(),object:"chat.completion",created:Math.floor(Date.now()/1000),brand:BRAND,poweredBy:POWERED_BY,company:COMPANY,provider:activeModelProvider(env),model:activeModelProvider(env)==="self-hosted"?String(env.NEXA_MODEL_NAME||"local-model"):(typeof b.model==="string"&&b.model.startsWith("@cf/")?b.model:MEDICAL_DEFAULT),nexaClinicalWorkflow:{version:workflow.state.version,status:workflow.state.status,workflowId:workflow.state.workflowId,caseId:workflow.state.caseId,currentStage:workflow.state.currentStage,audit:workflow.state.audit,requiresClinicianApproval:true},choices:[{index:0,message:{role:"assistant",content:workflow.content},finish_reason:"stop"}]}))}const r=await answer(env,msgs,selected,typeof b.model==="string"?b.model:undefined);return cors(json({id:crypto.randomUUID(),object:"chat.completion",created:Math.floor(Date.now()/1000),brand:BRAND,poweredBy:POWERED_BY,company:COMPANY,provider:r.provider,model:r.model,choices:[{index:0,message:{role:"assistant",content:r.content},finish_reason:"stop"}]}))}catch(e){return cors(json({error:"AI service temporarily unavailable",detail:e instanceof Error?e.message:"provider_error",clinicalWorkflow:"failed_closed",message:"Sequential clinical assessment could not be completed. Please retry or obtain clinician review; no automated assessment was approved."},503))}}
if(url.pathname==="/v1/admin/status"&&request.method==="GET"){if(!isAdminRequest(request,env.ADMIN_TOKEN))return cors(json({error:"Unauthorized"},401));return cors(json({ok:true,admin:true,service:BRAND,provider:"cloudflare",secretsConfigured:{admin:!!env.ADMIN_TOKEN}}))}
const asset=await env.ASSETS.fetch(request);return withSecurityHeaders(asset)}};
