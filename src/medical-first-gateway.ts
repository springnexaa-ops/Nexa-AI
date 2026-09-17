import worker, { UserStoreDO, MedicalEvidenceDO } from "./entry";
import { isMedicalQuery } from "./medical-directory";
import { getMedicalBookContext } from "./medical-book-knowledge";
import { queryLiveEvidence } from "./medical-live-evidence";

export { UserStoreDO, MedicalEvidenceDO };

type Message = { role: "system" | "user" | "assistant"; content: string };
const MEDICAL_INFERENCE_MODEL = "@cf/google/gemma-4-26b-a4b-it";

function looksLikeMedical(text: string): boolean {
  const q = text.toLowerCase();
  return isMedicalQuery(text) || /\b(ncs|ncvs|nerve conduction|emg|edx|electromyograph|rns|repetitive nerve stimulation|eeg|v[ .-]?ep|bera|baer|neuromuscular|neuropathy|radiculopathy|myopathy|seizure)\b/i.test(q);
}
function evidenceContext(hits: any[]): string {
  if (!hits.length) return "NEXA MEDICAL EVIDENCE RETRIEVAL: No sufficiently relevant indexed evidence was retrieved for this query. Do not invent evidence or citations. State what information is missing.";
  return ["NEXA MEDICAL EVIDENCE RETRIEVAL — PRIMARY EVIDENCE CONTEXT","Use the retrieved NEXA evidence below as the primary factual reference for this answer. Do not substitute unsupported model memory for retrieved evidence.",...hits.map((h,i)=>`[E${i+1}] ${h.title} | authority=${h.authority} | version=${h.version} | retrieved=${h.retrievedAt}\n${h.text}`),"Citation rule: cite substantive evidence-based statements with the corresponding [E#]. If the evidence does not establish a conclusion, say so explicitly."].join("\n\n");
}
function sanitizeMedicalResponse(response: Response, evidenceCount: number): Response {
  const headers = new Headers(response.headers);
  headers.set("x-nexa-medical-retrieval", "primary");
  headers.set("x-nexa-medical-evidence-count", String(evidenceCount));
  headers.set("x-nexa-medical-inference", MEDICAL_INFERENCE_MODEL);
  if (response.status < 500) return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
  return new Response(JSON.stringify({ error:"Nexa Medical is temporarily unavailable", code:"NEXA_MEDICAL_UNAVAILABLE", message:"The medical service could not complete this request. Please try again shortly." }), { status:503, headers:new Headers({ ...Object.fromEntries(headers), "content-type":"application/json; charset=utf-8", "cache-control":"no-store" }) });
}

export default { async fetch(request: Request, env: any, ctx: ExecutionContext): Promise<Response> {
  const url = new URL(request.url);
  if (url.pathname !== "/v1/chat/completions" || request.method !== "POST") return worker.fetch(request, env, ctx);
  const body:any = await request.clone().json().catch(()=>({}));
  const messages:Message[] = Array.isArray(body?.messages) ? body.messages.filter((m:any)=>m&&typeof m.content==="string") : [];
  const userText = [...messages].reverse().find(m=>m.role==="user")?.content || "";
  if (!looksLikeMedical(userText)) return worker.fetch(request, env, ctx);
  let hits:any[]=[];
  try { hits=await queryLiveEvidence(env,userText,8); } catch {}
  const system=[getMedicalBookContext(userText),evidenceContext(hits),"NEXA MEDICAL ROUTING: This is a medical request. The internal NEXA medical knowledge/evidence layer has been queried before generation. Answer from the supplied NEXA context first. Patient-specific NCS/EMG interpretation must use only measurements actually provided; never fabricate absent values or reference ranges. Separate observations, interpretation, localization/pattern, limitations, and clinician-review requirements."].join("\n\n");
  const priorSystem=messages.find(m=>m.role==="system")?.content||"";
  const rebuilt:Message[]=[{role:"system",content:`${priorSystem?priorSystem+"\n\n":""}${system}`},...messages.filter(m=>m.role!=="system")];
  const nextBody={...body,mode:"medical",provider:"cloudflare",model:MEDICAL_INFERENCE_MODEL,messages:rebuilt,metadata:{...(body?.metadata||{}),nexaMedicalRetrieval:"primary",nexaMedicalEvidenceCount:hits.length,nexaMedicalInference:MEDICAL_INFERENCE_MODEL}};
  const nextRequest=new Request(request,{body:JSON.stringify(nextBody)});
  const response=await worker.fetch(nextRequest,env,ctx);
  return sanitizeMedicalResponse(response,hits.length);
} };
