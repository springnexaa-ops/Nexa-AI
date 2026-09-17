import worker from "./index-v3";
import { UserStoreDO } from "./user-store";
import { analyzeUploadedEeg } from "./eeg-analysis";
import { bedrockChat, bedrockConfigured, bedrockModel, bedrockRegion } from "./bedrock";
import { cachedGet, isCacheableGet } from "./cache";
import { weatherResponse } from "./weather";

type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export { UserStoreDO };

function bearer(request: Request): string {
  const value = request.headers.get("authorization") || "";
  return value.startsWith("Bearer ") ? value.slice(7) : "";
}

function unauthorized(): Response {
  return new Response(JSON.stringify({ error: "Unauthorized" }), {
    status: 401,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}

function json(data: unknown, status = 200, extra?: HeadersInit): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...extra },
  });
}

function cors(response: Response): Response {
  const headers = new Headers(response.headers);
  headers.set("access-control-allow-origin", "*");
  headers.set("access-control-allow-methods", "GET,POST,OPTIONS");
  headers.set("access-control-allow-headers", "content-type,authorization");
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

function withClearSiteData(response: Response): Response {
  const headers = new Headers(response.headers);
  headers.set("Clear-Site-Data", '"cache", "cookies", "storage"');
  headers.set("cache-control", "no-store");
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

function getMessages(body: any): ChatMessage[] {
  const messages = Array.isArray(body?.messages) ? body.messages : [];
  return messages
    .filter((m: any) => m && ["system", "user", "assistant"].includes(m.role) && typeof m.content === "string")
    .slice(-12);
}

async function handleBedrock(request: Request, env: any): Promise<Response> {
  if (request.method !== "POST") return cors(json({ error: "Method not allowed" }, 405));
  const body: any = await request.json().catch(() => ({}));
  const messages = getMessages(body);
  if (!messages.some(m => m.role === "user")) return cors(json({ error: "messages with a user message are required" }, 400));
  const result = await bedrockChat(env, messages);
  return cors(json({
    id: crypto.randomUUID(), object: "chat.completion", created: Math.floor(Date.now() / 1000), brand: "Nexa AI",
    poweredBy: "SPRINGNEXA PRIVATE LIMITED (IT Division)", company: "SpringNexa Private Limited",
    provider: result.provider, model: result.model,
    choices: [{ index: 0, message: { role: "assistant", content: result.content }, finish_reason: "stop" }],
  }));
}

export default {
  async fetch(request: Request, env: any, ctx: ExecutionContext): Promise<Response> {
    const requestUrl = new URL(request.url);
    const path = requestUrl.pathname;
    if (requestUrl.protocol === "http:") {
      requestUrl.protocol = "https:";
      return new Response(null, { status: 301, headers: { location: requestUrl.toString(), "cache-control": "public, max-age=3600" } });
    }
    const protectedAdmin = path.startsWith("/v1/admin/") && !["/v1/admin/login", "/v1/admin/logout"].includes(path);
    if (protectedAdmin && (!env.ADMIN_TOKEN || bearer(request) !== env.ADMIN_TOKEN)) return unauthorized();
    if (request.method === "OPTIONS") return cors(new Response(null, { status: 204 }));
    if (path === "/v1/security/report" && request.method === "POST") return new Response(null, { status: 204, headers: { "cache-control": "no-store" } });
    if (path === "/v1/weather" && request.method === "GET") return cors(await weatherResponse(request));
    if (isCacheableGet(request)) return cachedGet(request, ctx, () => worker.fetch(request, env, ctx));
    if (path === "/v1/chat/completions" && request.method === "POST") {
      const body: any = await request.clone().json().catch(() => ({}));
      const provider = typeof body?.provider === "string" ? body.provider.toLowerCase() : typeof body?.mode === "string" ? body.mode.toLowerCase() : "";
      if (provider === "bedrock") {
        try {
          if (!bedrockConfigured(env)) return cors(json({ error: "AWS Bedrock is not configured", code: "BEDROCK_NOT_CONFIGURED" }, 503));
          return await handleBedrock(request, env);
        } catch (error) {
          return cors(json({ error: "AWS Bedrock request failed", detail: error instanceof Error ? error.message : "bedrock_error" }, 503));
        }
      }
    }
    if (path === "/v1/bedrock/status" && request.method === "GET") return cors(json({ provider: "bedrock", configured: bedrockConfigured(env), region: bedrockRegion(env), model: bedrockModel(env), authentication: "AWS_BEARER_TOKEN_BEDROCK" }, 200, { "cache-control": "public, max-age=60, s-maxage=300", "x-nexa-cache": "MISS" }));
    if (path === "/v1/files/analyze-eeg" && request.method === "POST") {
      const authRequest = new Request(new URL("/v1/auth/me", request.url), { method: "GET", headers: { authorization: request.headers.get("authorization") || "" } });
      const auth = await worker.fetch(authRequest, env, ctx);
      if (!auth.ok) return auth;
      return analyzeUploadedEeg(request, env);
    }
    const response = await worker.fetch(request, env, ctx);
    if ((path === "/v1/admin/logout" || path === "/v1/auth/logout") && request.method === "POST") return withClearSiteData(response);
    return response;
  },
};
