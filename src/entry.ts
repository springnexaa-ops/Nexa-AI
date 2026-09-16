import worker from "./index-v3";
import { analyzeUploadedEeg } from "./eeg-analysis";

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

export default {
  async fetch(request: Request, env: any, ctx: ExecutionContext): Promise<Response> {
    const path = new URL(request.url).pathname;
    const protectedAdmin = path.startsWith("/v1/admin/") && !["/v1/admin/login", "/v1/admin/logout"].includes(path);
    if (protectedAdmin && (!env.ADMIN_TOKEN || bearer(request) !== env.ADMIN_TOKEN)) return unauthorized();

    if (path === "/v1/files/analyze-eeg" && request.method === "POST") {
      const authRequest = new Request(new URL("/v1/auth/me", request.url), {
        method: "GET",
        headers: { authorization: request.headers.get("authorization") || "" },
      });
      const auth = await worker.fetch(authRequest, env, ctx);
      if (!auth.ok) return auth;
      return analyzeUploadedEeg(request, env);
    }

    return worker.fetch(request, env, ctx);
  },
};
