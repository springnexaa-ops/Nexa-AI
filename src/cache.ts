const CACHE_NAME = "nexa-ai-api-v1";
const CACHE_TTL_SECONDS = 300;
const CACHEABLE_PATHS = new Set([
  "/health",
  "/v1/models",
  "/v1/bedrock/status",
  "/v1/voice/capabilities",
  "/v1/medical/specialties",
]);

export function isCacheableGet(request: Request): boolean {
  if (request.method !== "GET") return false;
  const url = new URL(request.url);
  if (!CACHEABLE_PATHS.has(url.pathname)) return false;
  // Never cache a response for an authenticated request.
  return !request.headers.has("authorization") && !request.headers.has("cookie");
}

function cacheKey(request: Request): Request {
  const url = new URL(request.url);
  url.hash = "";
  return new Request(url.toString(), { method: "GET" });
}

export async function cachedGet(
  request: Request,
  ctx: ExecutionContext,
  origin: () => Promise<Response>,
): Promise<Response> {
  const cache = await caches.open(CACHE_NAME);
  const key = cacheKey(request);
  const hit = await cache.match(key);
  if (hit) {
    const headers = new Headers(hit.headers);
    headers.set("x-nexa-cache", "HIT");
    return new Response(hit.body, { status: hit.status, statusText: hit.statusText, headers });
  }

  const response = await origin();
  if (!response.ok || response.headers.has("set-cookie")) return response;

  const cachedHeaders = new Headers(response.headers);
  cachedHeaders.set("cache-control", `public, max-age=60, s-maxage=${CACHE_TTL_SECONDS}`);
  cachedHeaders.set("x-nexa-cache", "MISS");
  const cacheable = new Response(response.body, { status: response.status, statusText: response.statusText, headers: cachedHeaders });
  ctx.waitUntil(cache.put(key, cacheable.clone()));
  return cacheable;
}

export async function clearApiCache(): Promise<void> {
  const cache = await caches.open(CACHE_NAME);
  await Promise.all([...CACHEABLE_PATHS].map(path => cache.delete(path)));
}
