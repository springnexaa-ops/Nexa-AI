import worker from "./index-v3";

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
    return worker.fetch(request, env, ctx);
  },
};
