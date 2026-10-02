import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const roots = ["src", "wrangler.jsonc", ".github"];
const banned = [
  /AWS_BEARER_TOKEN_BEDROCK/i,
  /BEDROCK_MODEL_ID/i,
  /bedrock-runtime\./i,
  /amazonaws\.com\/model\//i,
  /\bbedrock\b/i,
  /DxGPT/i,
  /api\\.groq\\.com|generativelanguage\\.googleapis\\.com|api\\.elevenlabs\\.io|integrate\\.api\\.nvidia\\.com|router\\.huggingface\\.co/i,
  /index-v2\\.ts/i,
  /dxgpt\.app/i
];
const allow = [/node_modules/];
const files = [];
function walk(p) {
  if (!statSync(p).isDirectory()) { files.push(p); return; }
  for (const name of readdirSync(p)) {
    const q = join(p, name);
    if (!allow.some(r => r.test(q))) walk(q);
  }
}
for (const root of roots) {
  try { walk(root); } catch {}
}
const hits = [];
for (const file of files) {
  let text = "";
  try { text = readFileSync(file, "utf8"); } catch { continue; }
  for (const re of banned) if (re.test(text)) hits.push(file + " -> " + re);
}
if (hits.length) {
  console.error("Cloudflare-only gate failed:");
  for (const hit of hits) console.error(" - " + hit);
  process.exit(1);
}
console.log("Cloudflare-only gate passed.");
