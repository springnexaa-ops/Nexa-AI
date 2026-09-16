import { textToSpeech, speechToText, voiceSpeaker, voiceEncoding, voiceContentType } from "./voice";
import { withSecurityHeaders, clientIp, rateLimit, isAdminRequest, adminCookie, clearAdminCookie } from "./security";
import { isMedicalQuery, detectMedicalSpecialties, recommendMedicalProviders } from "./medical-directory";

export interface Env {
  AI: Ai;
  ASSETS: Fetcher;
  GROQ_API_KEY?: string; GOOGLE_API_KEY?: string; NVIDIA_API_KEY?: string; HF_TOKEN?: string;
  ELEVENLABS_API_KEY?: string; ELEVENLABS_VOICE_ID?: string; ELEVENLABS_MODEL?: string;
  GROQ_MODEL?: string; GOOGLE_MODEL?: string; NVIDIA_MODEL?: string; MEDICAL_MODEL?: string;
  ADMIN_TOKEN?: string;
  NEXA_ANALYTICS?: { writeDataPoint: (data: any) => void };
}

type Message = { role: "system" | "user" | "assistant"; content: string };
type ProviderResult = { content: string; provider: string; model: string };
const BRAND = "Nexa AI";
const POWERED_BY = "SPRINGNEXA PRIVATE LIMITED (IT Division)";
const COMPANY = "SpringNexa Private Limited";
const DEFAULT_SYSTEM = `You are Nexa AI, powered by SPRINGNEXA PRIVATE LIMITED (IT Division). Be accurate, useful and concise. Never claim to be a doctor. Do not invent hospitals, doctors, credentials, statistics or citations.`;
const MEDICAL_SYSTEM = `You are Nexa AI Medical, powered by SPRINGNEXA PRIVATE LIMITED (IT Division). Provide medical education and decision support, not a definitive diagnosis or prescription. Distinguish possibilities from diagnosis. For emergencies advise immediate local medical care. Do not invent clinicians, hospitals or medical records.`;
const TIMEOUT_MS = 15000;
const GROQ_FREE = ["openai/gpt-oss-120b", "openai/gpt-oss-20b", "qwen/qwen3.6-27b", "qwen/qwen3.8-27b"];
// Keep the Cloudflare-first path on currently documented Workers AI models.
const CLOUDFLARE_FREE = ["@cf/zai-org/glm-4.7-flash", "@cf/nvidia/nemotron-3-120b-a12b", "@cf/google/gemma-4-26b-a4b-it"];
// Medical mode uses a current Workers AI model with a medical safety prompt when a
// dedicated medical inference endpoint is not available. A custom MEDICAL_MODEL
// can still explicitly select a Hugging Face/OpenAI-compatible medical endpoint.
const MEDICAL_CLOUDFLARE = ["@cf/google/gemma-4-26b-a4b-it", "@cf/zai-org/glm-4.7-flash"];
const GOOGLE_FREE = ["gemini-3.1-flash-lite-preview", "gemini-2.5-flash", "gemini-2.5-flash-lite"];
const MEDICAL_DEFAULT = "@cf/google/gemma-4-26b-a4b-it";
const VOICE_LANGUAGE_NAMES: Record<string, string> = { en: "English", hi: "Hindi", ur: "Urdu", ks: "Kashmiri", doi: "Dogri", goj: "Gojri" };
const traffic = { requests: 0, errors: 0, startedAt: Date.now(), lastRequestAt: 0 };

function json(data: unknown, status = 200, extra?: HeadersInit) {
  const headers = new Headers({ "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...extra });
  return new Response(JSON.stringify(data), { status, headers });
}
function getMessages(body: any): Message[] {
  const m = Array.isArray(body?.messages) ? body.messages : [];
  return m.filter((x: any) => x && ["system", "user", "assistant"].includes(x.role) && typeof x.content === "string").slice(-30);
}
async function fetchTimeout(url: string, init: RequestInit) { return fetch(url, { ...init, signal: AbortSignal.timeout(TIMEOUT_MS) }); }
async function openAI(apiKey: string, url: string, model: string, msgs: Message[], provider: string): Promise<ProviderResult> {
  const r = await fetchTimeout(url, { method: "POST", headers: { "content-type": "application/json", authorization: `Bearer ${apiKey}` }, body: JSON.stringify({ model, messages: msgs, temperature: .2, max_tokens: 1200, stream: false }) });
  if (!r.ok) throw new Error(`${provider}:${r.status}`);
  const d: any = await r.json(); const c = d?.choices?.[0]?.message?.content;
  if (typeof c !== "string" || !c.trim()) throw new Error(`${provider}:invalid_response`);
  return { content: c, provider, model };
}
async function cloudflare(env: Env, msgs: Message[], model: string): Promise<ProviderResult> {
  if (!env.AI) throw new Error("cloudflare:AI_binding_unavailable");
  const d: any = await env.AI.run(model, { messages: msgs, max_tokens: 1200, temperature: .2 });
  const c = d?.response ?? d?.choices?.[0]?.message?.content;
  if (typeof c !== "string" || !c.trim()) throw new Error("cloudflare:invalid_response");
  return { content: c, provider: "cloudflare", model };
}
async function google(env: Env, msgs: Message[], model: string): Promise<ProviderResult> {
  if (!env.GOOGLE_API_KEY) throw new Error("google:not_configured");
  const system = msgs.find(m => m.role === "system")?.content;
  const contents = msgs.filter(m => m.role !== "system").map(m => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] }));
  const r = await fetchTimeout(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(env.GOOGLE_API_KEY)}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...(system ? { systemInstruction: { parts: [{ text: system }] } } : {}), contents, generationConfig: { temperature: .2, maxOutputTokens: 1200 } }) });
  if (!r.ok) throw new Error(`google:${r.status}`);
  const d: any = await r.json(); const c = d?.candidates?.[0]?.content?.parts?.map((p: any) => p.text || "").join("");
  if (!c) throw new Error("google:invalid_response"); return { content: c, provider: "google", model };
}
async function vision(env: Env, prompt: string, image: { mimeType: string; data: string }) {
  if (!env.GOOGLE_API_KEY) throw new Error("vision:not_configured");
  const model = env.GOOGLE_MODEL || "gemini-2.5-flash";
  const r = await fetchTimeout(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(env.GOOGLE_API_KEY)}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: `${DEFAULT_SYSTEM}\n\n${prompt}` }, { inline_data: { mime_type: image.mimeType, data: image.data } }] }], generationConfig: { temperature: .2, maxOutputTokens: 1200 } }) });
  if (!r.ok) throw new Error(`vision:${r.status}`);
  const d: any = await r.json(); const c = d?.candidates?.[0]?.content?.parts?.map((p: any) => p.text || "").join("");
  if (!c) throw new Error("vision:invalid_response"); return { content: c, provider: "google", model };
}
async function medical(env: Env, msgs: Message[], model: string): Promise<ProviderResult> {
  // A dedicated MedGemma endpoint is not currently exposed by Hugging Face
  // Inference Providers for google/medgemma-27b-it. Use current Workers AI for
  // medical mode by default, while retaining explicit custom-model support.
  if (model.startsWith("@cf/")) return cloudflare(env, msgs, model);
  if (env.HF_TOKEN && env.MEDICAL_MODEL) return openAI(env.HF_TOKEN, "https://router.huggingface.co/v1/chat/completions", model, msgs, "medical");
  return cloudflare(env, msgs, MEDICAL_DEFAULT);
}
async function answer(env: Env, msgs: Message[], provider = "auto", requestedModel?: string): Promise<ProviderResult> {
  const errors: string[] = []; const selected = provider.toLowerCase();
  const order = selected === "auto" ? ["cloudflare", "groq", "google", "nvidia"] : [selected];
  for (const p of order) {
    try {
      if (p === "medical") {
        const medicalModels = requestedModel ? [requestedModel] : (env.MEDICAL_MODEL ? [env.MEDICAL_MODEL] : MEDICAL_CLOUDFLARE);
        for (const m of medicalModels) {
          try { return await medical(env, msgs, m); } catch (e) { errors.push(e instanceof Error ? e.message : "medical:error"); }
        }
        // If a configured dedicated medical endpoint is unavailable, keep the
        // product usable by falling through to the configured general providers.
        for (const fallback of ["google", "groq", "nvidia"]) {
          try {
            if (fallback === "google" && env.GOOGLE_API_KEY) for (const m of env.GOOGLE_MODEL ? [env.GOOGLE_MODEL] : GOOGLE_FREE) return await google(env, msgs, m);
            if (fallback === "groq" && env.GROQ_API_KEY) for (const m of env.GROQ_MODEL ? [env.GROQ_MODEL] : GROQ_FREE) return await openAI(env.GROQ_API_KEY, "https://api.groq.com/openai/v1/chat/completions", m, msgs, "groq");
            if (fallback === "nvidia" && env.NVIDIA_API_KEY) return await openAI(env.NVIDIA_API_KEY, "https://integrate.api.nvidia.com/v1/chat/completions", env.NVIDIA_MODEL || "nvidia/nemotron-3.5-lightning-30b-a3b", msgs, "nvidia");
          } catch (e) { errors.push(e instanceof Error ? e.message : `${fallback}:error`); }
        }
        continue;
      }
      if (p === "cloudflare") for (const model of requestedModel?.startsWith("@cf/") ? [requestedModel] : CLOUDFLARE_FREE) try { return await cloudflare(env, msgs, model); } catch (e) { errors.push(e instanceof Error ? e.message : "cloudflare:error"); }
      else if (p === "groq" && env.GROQ_API_KEY) for (const model of env.GROQ_MODEL ? [env.GROQ_MODEL] : GROQ_FREE) try { return await openAI(env.GROQ_API_KEY, "https://api.groq.com/openai/v1/chat/completions", model, msgs, "groq"); } catch (e) { errors.push(e instanceof Error ? e.message : "groq:error"); }
      else if (p === "google" && env.GOOGLE_API_KEY) for (const model of env.GOOGLE_MODEL ? [env.GOOGLE_MODEL] : GOOGLE_FREE) try { return await google(env, msgs, model); } catch (e) { errors.push(e instanceof Error ? e.message : "google:error"); }
      else if (p === "nvidia" && env.NVIDIA_API_KEY) try { return await openAI(env.NVIDIA_API_KEY, "https://integrate.api.nvidia.com/v1/chat/completions", env.NVIDIA_MODEL || "nvidia/nemotron-3.5-lightning-30b-a3b", msgs, "nvidia"); } catch (e) { errors.push(e instanceof Error ? e.message : "nvidia:error"); }
      else if (p !== "cloudflare" && p !== "groq" && p !== "google" && p !== "nvidia") errors.push(`${p}:not_supported`);
    } catch (e) { errors.push(e instanceof Error ? e.message : `${p}:error`); }
  }
  throw new Error(errors.join(",") || "no_provider_available");
}
async function translateToEnglish(env: Env, text: string, language?: string): Promise<ProviderResult> {
  const code = (language || "en").toLowerCase().slice(0, 2);
  if (!text.trim() || code === "en") return { content: text.trim(), provider: "none", model: "identity" };
  const name = VOICE_LANGUAGE_NAMES[code] || language || "the detected language";
  const msgs: Message[] = [{ role: "system", content: `You are Nexa AI's voice translation engine. Translate the user's ${name} speech into natural, faithful English. Preserve names, numbers, medical terms and intent. Do not answer the user, explain, transliterate, summarize or add information. Output only the English translation. If the speech is mixed-language, translate the non-English portions too.` }, { role: "user", content: text.trim() }];
  return answer(env, msgs, "auto");
}
function cors(r: Response) { const h = new Headers(r.headers); h.set("access-control-allow-origin", "*"); h.set("access-control-allow-methods", "GET,POST,OPTIONS"); h.set("access-control-allow-headers", "content-type,authorization"); return withSecurityHeaders(new Response(r.body, { status: r.status, statusText: r.statusText, headers: h })); }
function track(env: Env, path: string, status: number, provider = "") { traffic.requests++; if (status >= 400) traffic.errors++; traffic.lastRequestAt = Date.now(); try { env.NEXA_ANALYTICS?.writeDataPoint({ blobs: [path, provider, status >= 400 ? "error" : "ok"], doubles: [1, status] }); } catch {} }
async function assetPage(env: Env, request: Request) {
  const response = await env.ASSETS.fetch(request); const ct = response.headers.get("content-type") || "";
  if (!ct.includes("text/html") || new URL(request.url).pathname === "/admin.html") return response;
  const html = await response.text();
  if (html.includes("/app-functional.js") && html.includes("/voice-translation.js")) return new Response(html, { status: response.status, headers: response.headers });
  const injected = html.replace("</body>", '<script src="/app-functional.js" defer></script><script src="/voice-translation.js" defer></script></body>');
  const headers = new Headers(response.headers); headers.delete("content-length"); headers.set("cache-control", "no-store");
  return new Response(injected, { status: response.status, statusText: response.statusText, headers });
}

export default { async fetch(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  if (request.method === "OPTIONS") return cors(new Response(null, { status: 204 }));
  const ip = clientIp(request); const api = url.pathname.startsWith("/v1/") || url.pathname === "/health";
  if (api && !rateLimit(`${ip}:${url.pathname}`, url.pathname.startsWith("/v1/audio/") ? 20 : 90)) return cors(json({ error: "Too many requests" }, 429));
  let response: Response;
  try {
    if (url.pathname === "/health" && request.method === "GET") response = cors(json({ ok: true, service: BRAND, poweredBy: POWERED_BY, company: COMPANY, division: "IT Division", runtime: "cloudflare-worker", modes: ["auto", "medical", "voice"] }));
    else if (url.pathname === "/v1/admin/login" && request.method === "POST") {
      const b: any = await request.json(); const token = typeof b?.token === "string" ? b.token : "";
      if (!env.ADMIN_TOKEN || !token || !isAdminRequest(new Request(request.url, { headers: { authorization: `Bearer ${token}` } }), env.ADMIN_TOKEN)) response = cors(json({ error: "Authentication failed" }, 401));
      else response = cors(json({ ok: true, admin: true }, 200, { "set-cookie": adminCookie(env.ADMIN_TOKEN) }));
    } else if (url.pathname === "/v1/admin/logout" && request.method === "POST") response = cors(json({ ok: true }, 200, { "set-cookie": clearAdminCookie }));
    else if (url.pathname === "/v1/admin/status" && request.method === "GET") {
      if (!isAdminRequest(request, env.ADMIN_TOKEN)) response = cors(json({ error: "Unauthorized" }, 401));
      else response = cors(json({ ok: true, admin: true, service: BRAND, security: "hardened", secretsConfigured: { groq: !!env.GROQ_API_KEY, google: !!env.GOOGLE_API_KEY, nvidia: !!env.NVIDIA_API_KEY, medical: !!env.HF_TOKEN, elevenlabs: !!env.ELEVENLABS_API_KEY, admin: !!env.ADMIN_TOKEN }, analyticsConfigured: !!env.NEXA_ANALYTICS }));
    } else if (url.pathname === "/v1/admin/traffic" && request.method === "GET") {
      if (!isAdminRequest(request, env.ADMIN_TOKEN)) response = cors(json({ error: "Unauthorized" }, 401));
      else response = cors(json({ ok: true, configured: !!env.NEXA_ANALYTICS, requests: traffic.requests, errors: traffic.errors, uptimeSeconds: Math.floor((Date.now() - traffic.startedAt) / 1000), lastRequestAt: traffic.lastRequestAt ? new Date(traffic.lastRequestAt).toISOString() : null }));
    } else if (url.pathname === "/v1/models" && request.method === "GET") response = cors(json({ brand: BRAND, poweredBy: POWERED_BY, models: [{ id: "auto", name: "Nexa AI Auto", type: "general" }, { id: "medical", name: "Nexa AI Medical", type: "medical" }, { id: "voice", name: "Nexa Voice", type: "voice" }] }));
    else if (url.pathname === "/v1/medical/specialties" && request.method === "GET") response = cors(json({ specialties: detectMedicalSpecialties(url.searchParams.get("q") || ""), directory: "verified-only" }));
    else if (url.pathname === "/v1/medical/providers" && request.method === "GET") response = cors(json(recommendMedicalProviders(url.searchParams.get("q") || "", url.searchParams.get("location") || "", (url.searchParams.get("type") as any) || undefined)));
    else if (url.pathname === "/v1/voice/capabilities" && request.method === "GET") response = cors(json({ brand: BRAND, product: "Nexa Voice", speechToText: true }));
    else if (url.pathname === "/v1/chat/completions" && request.method === "POST") {
      const body: any = await request.json().catch(() => ({})); const messages = getMessages(body); const userText = [...messages].reverse().find(m => m.role === "user")?.content || ""; const requested = typeof body?.mode === "string" ? body.mode : "auto"; const medicalMode = requested.toLowerCase() === "medical" || (requested.toLowerCase() === "auto" && isMedicalQuery(userText)); const base = medicalMode ? MEDICAL_SYSTEM : DEFAULT_SYSTEM; const normalized = messages.some(m => m.role === "system") ? messages : [{ role: "system", content: base }, ...messages]; if (messages.some(m => m.role === "system")) normalized.unshift({ role: "system", content: base });
      const result = await answer(env, normalized, medicalMode ? "medical" : "auto", typeof body?.model === "string" ? body.model : undefined); track(env, url.pathname, 200, result.provider); response = cors(json({ id: crypto.randomUUID(), object: "chat.completion", choices: [{ index: 0, message: { role: "assistant", content: result.content }, finish_reason: "stop" }], model: result.model, provider: result.provider }));
    } else if (url.pathname === "/v1/telemetry" && request.method === "POST") { const b = await request.json().catch(() => ({})); try { env.NEXA_ANALYTICS?.writeDataPoint({ blobs: ["client", String((b as any)?.event || "unknown")], doubles: [1] }); } catch {} response = cors(json({ ok: true })); }
    else response = await assetPage(env, request);
  } catch (e) { const message = e instanceof Error ? e.message : "internal_error"; track(env, url.pathname, 500); response = cors(json({ error: message.includes(":") ? `AI service temporarily unavailable (${message})` : message }, 500)); }
  return response;
}};
