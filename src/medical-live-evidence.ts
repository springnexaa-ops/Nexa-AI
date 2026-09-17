import { DurableObject } from "cloudflare:workers";

export type LiveSource = { id:string; name:string; url:string; authority:string; refreshHours?:number; ingestion?:string };
export type EvidenceHit = { chunkId:string; sourceId:string; title:string; authority:string; url:string; text:string; score:number; version:string; retrievedAt:string };
export type MedicalAudit = { id:string; createdAt:string; requestHash:string; queryHash:string; userHash?:string; sourceIds:string[]; chunkIds:string[]; sourceVersions:string[]; model:string; provider:string; answerHash:string; staleSourceIds:string[]; safety:string[] };

const EMBEDDING_MODEL = "@cf/baai/bge-base-en-v1.5";
const MAX_TEXT = 180000;
const CHUNK = 1200;
const OVERLAP = 180;

function cleanText(input:string):string { return input.replace(/<script[\\s\\S]*?<\\/script>/gi," ").replace(/<style[\\s\\S]*?<\\/style>/gi," ").replace(/<[^>]+>/g," ").replace(/&nbsp;/gi," ").replace(/&amp;/gi,"&").replace(/\\s+/g," ").trim().slice(0,MAX_TEXT); }
async function sha256(value:string):Promise<string>{ const b=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(value)); return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,"0")).join(""); }
function chunks(text:string):string[]{ const out:string[]=[]; for(let i=0;i<text.length;i+=CHUNK-OVERLAP) out.push(text.slice(i,i+CHUNK).trim()); return out.filter(x=>x.length>80); }
function cosine(a:number[],b:number[]):number{ let dot=0,aa=0,bb=0; const n=Math.min(a.length,b.length); for(let i=0;i<n;i++){dot+=a[i]*b[i];aa+=a[i]*a[i];bb+=b[i]*b[i]} return aa&&bb?dot/Math.sqrt(aa*bb):0; }

export class MedicalEvidenceDO extends DurableObject {
  constructor(ctx:DurableObjectState, env:Env){ super(ctx,env); ctx.storage.sql.exec(`
    CREATE TABLE IF NOT EXISTS sources(id TEXT PRIMARY KEY,name TEXT NOT NULL,url TEXT NOT NULL,authority TEXT NOT NULL,last_checked TEXT,last_changed TEXT,content_hash TEXT,version TEXT,stale INTEGER DEFAULT 0,http_status INTEGER);
    CREATE TABLE IF NOT EXISTS chunks(id TEXT PRIMARY KEY,source_id TEXT NOT NULL,text TEXT NOT NULL,embedding TEXT NOT NULL,version TEXT NOT NULL,created_at TEXT NOT NULL);
    CREATE INDEX IF NOT EXISTS idx_chunks_source ON chunks(source_id);
    CREATE TABLE IF NOT EXISTS audits(id TEXT PRIMARY KEY,created_at TEXT NOT NULL,request_hash TEXT,query_hash TEXT,user_hash TEXT,source_ids TEXT,chunk_ids TEXT,source_versions TEXT,model TEXT,provider TEXT,answer_hash TEXT,stale_source_ids TEXT,safety TEXT);
    CREATE INDEX IF NOT EXISTS idx_audits_created ON audits(created_at);
  `); }

  async upsertSource(source:LiveSource, text:string, hash:string, version:string, embeddings:number[][], status:number):Promise<{changed:boolean;version:string;chunks:number}>{
    const now=new Date().toISOString(); const old=this.ctx.storage.sql.exec("SELECT content_hash,version FROM sources WHERE id=?",source.id).toArray()[0] as any; const changed=!old||old.content_hash!==hash;
    this.ctx.storage.sql.exec("INSERT INTO sources(id,name,url,authority,last_checked,last_changed,content_hash,version,stale,http_status) VALUES(?,?,?,?,?,?,?,?,0,?) ON CONFLICT(id) DO UPDATE SET name=excluded.name,url=excluded.url,authority=excluded.authority,last_checked=excluded.last_checked,last_changed=CASE WHEN excluded.content_hash!=sources.content_hash THEN excluded.last_checked ELSE sources.last_changed END,content_hash=excluded.content_hash,version=excluded.version,stale=0,http_status=excluded.http_status",source.id,source.name,source.url,source.authority,now,now,hash,version,status);
    if(changed){ this.ctx.storage.sql.exec("DELETE FROM chunks WHERE source_id=?",source.id); const cs=chunks(text); for(let i=0;i<cs.length;i++) this.ctx.storage.sql.exec("INSERT INTO chunks(id,source_id,text,embedding,version,created_at) VALUES(?,?,?,?,?,?)",`${source.id}:${version}:${i}`,source.id,cs[i],JSON.stringify(embeddings[i]||[]),version,now); }
    return {changed,version,chunks:changed?chunks(text).length:Number(this.ctx.storage.sql.exec("SELECT count(*) c FROM chunks WHERE source_id=?",source.id).toArray()[0]?.c||0)};
  }

  async search(queryVector:number[],limit=8):Promise<EvidenceHit[]>{ const rows=this.ctx.storage.sql.exec("SELECT c.id,c.source_id,c.text,c.embedding,c.version,s.name,s.authority,s.url,s.stale FROM chunks c JOIN sources s ON s.id=c.source_id WHERE s.stale=0").toArray() as any[]; const now=new Date().toISOString(); return rows.map(r=>({chunkId:String(r.id),sourceId:String(r.source_id),title:String(r.name),authority:String(r.authority),url:String(r.url),text:String(r.text),score:cosine(queryVector,JSON.parse(String(r.embedding))),version:String(r.version),retrievedAt:now})).sort((a,b)=>b.score-a.score).slice(0,limit); }

  async markStale(maxAgeHours=720):Promise<string[]>{ const cutoff=Date.now()-maxAgeHours*3600000; const rows=this.ctx.storage.sql.exec("SELECT id,last_checked FROM sources").toArray() as any[]; const stale:string[]=[]; for(const r of rows){if(!r.last_checked||Date.parse(String(r.last_checked))<cutoff){this.ctx.storage.sql.exec("UPDATE sources SET stale=1 WHERE id=?",r.id);stale.push(String(r.id));}} return stale; }
  async listSources(){ return this.ctx.storage.sql.exec("SELECT id,name,url,authority,last_checked,last_changed,version,content_hash,stale,http_status FROM sources ORDER BY name").toArray(); }
  async audit(a:MedicalAudit){ this.ctx.storage.sql.exec("INSERT INTO audits VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)",a.id,a.createdAt,a.requestHash,a.queryHash,a.userHash||"",JSON.stringify(a.sourceIds),JSON.stringify(a.chunkIds),JSON.stringify(a.sourceVersions),a.model,a.provider,a.answerHash,JSON.stringify(a.staleSourceIds),JSON.stringify(a.safety)); }
  async audits(limit=50){ return this.ctx.storage.sql.exec("SELECT * FROM audits ORDER BY created_at DESC LIMIT ?",Math.min(Math.max(limit,1),200)).toArray(); }
}

export type Env={AI:Ai; MEDICAL_EVIDENCE:DurableObjectNamespace<MedicalEvidenceDO>; [key:string]:any};

async function embed(env:Env,texts:string[]):Promise<number[][]>{ const result:any=await env.AI.run(EMBEDDING_MODEL,{text:texts}); return (result?.data||result?.embeddings||[]).map((x:any)=>Array.isArray(x)?x:(x?.embedding||[])); }
export async function queryLiveEvidence(env:Env,query:string,limit=8):Promise<EvidenceHit[]>{ const id=env.MEDICAL_EVIDENCE.idFromName("global"); const stub=env.MEDICAL_EVIDENCE.get(id); const e=await embed(env,[query]); return stub.search(e[0]||[],limit); }
export async function ingestSource(env:Env,source:LiveSource):Promise<any>{ const r=await fetch(source.url,{headers:{"user-agent":"Nexa-AI-Medical-Evidence/1.0"},redirect:"follow"}); const raw=await r.text(); if(!r.ok) return {id:source.id,changed:false,status:r.status,error:`HTTP ${r.status}`}; const text=cleanText(raw); const hash=await sha256(text); const version=hash.slice(0,16); const existing=await env.MEDICAL_EVIDENCE.get(env.MEDICAL_EVIDENCE.idFromName("global")).listSources(); const old=existing.find((x:any)=>x.id===source.id) as any; if(old?.content_hash===hash) { await env.MEDICAL_EVIDENCE.get(env.MEDICAL_EVIDENCE.idFromName("global")).upsertSource(source,text,hash,version,[],r.status); return {id:source.id,changed:false,version}; } const cs=chunks(text); const vectors:number[][]=[]; for(let i=0;i<cs.length;i+=32){ const batch=await embed(env,cs.slice(i,i+32)); vectors.push(...batch); } const result=await env.MEDICAL_EVIDENCE.get(env.MEDICAL_EVIDENCE.idFromName("global")).upsertSource(source,text,hash,version,vectors,r.status); return {id:source.id,...result}; }
export async function ingestAll(env:Env,sources:LiveSource[]):Promise<any>{ const results=[]; for(const source of sources) { try{results.push(await ingestSource(env,source));}catch(e){results.push({id:source.id,changed:false,error:e instanceof Error?e.message:"ingest_error"});} } return {updatedAt:new Date().toISOString(),results}; }
export async function hashAuditInput(value:string):Promise<string>{return sha256(value);}
