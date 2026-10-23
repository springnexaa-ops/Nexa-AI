#!/usr/bin/env node
/**
 * Import already-extracted, rights-cleared reference text into Nexa's private corpus.
 * Does not parse PDFs or bypass authentication. Extract PDF text locally first and
 * review OCR/page markers; never pass patient-identifiable material.
 *
 * Usage:
 *   NEXA_ADMIN_TOKEN=... NEXA_BASE_URL=https://ai.springnexa.in \
 *     node scripts/ingest-private-reference.mjs ./reference-extracted.txt source-id 2026-edition
 */
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

const [file, rawSourceId, rawVersion] = process.argv.slice(2);
const baseUrl = (process.env.NEXA_BASE_URL || "").replace(/\/+$/, "");
const token = process.env.NEXA_ADMIN_TOKEN || "";
if (!file || !rawSourceId || !rawVersion || !baseUrl || !token) {
  console.error("Usage: NEXA_BASE_URL=https://ai.springnexa.in NEXA_ADMIN_TOKEN=... node scripts/ingest-private-reference.mjs <extracted.txt> <source-id> <version>");
  process.exit(2);
}
if (!/^https:\/\//i.test(baseUrl)) {
  console.error("Refusing non-HTTPS base URL.");
  process.exit(2);
}
const sourceId = rawSourceId.toLowerCase().replace(/[^a-z0-9._-]/g, "-").slice(0, 100);
if (!sourceId) throw new Error("Invalid source ID");
const text = (await readFile(file, "utf8")).replace(/\r\n?/g, "\n").trim();
if (text.length < 100) throw new Error("Extracted text is empty or too short");
const digest = createHash("sha256").update(text).digest("hex");
const pageAwareBlocks = text.split(/\n(?=\s*(?:\[?page\s*\d+\]?|\f))/i).map(s => s.trim()).filter(Boolean);
const sourceBlocks = pageAwareBlocks.length ? pageAwareBlocks : [text];
const chunks = [];
for (const block of sourceBlocks) {
  // Keep chunks comfortably under the API's 12,000-character per-item cap.
  for (let i = 0; i < block.length; i += 9000) {
    const chunk = block.slice(i, i + 9000).trim();
    if (chunk.length > 80) chunks.push(chunk);
  }
}
console.log(JSON.stringify({ sourceId, version: rawVersion, sha256: digest, characters: text.length, chunks: chunks.length }));
const endpoint = baseUrl + "/v1/admin/medical/private-knowledge/append";
let accepted = 0;
for (let offset = 0; offset < chunks.length; offset += 70) {
  const batch = chunks.slice(offset, offset + 70);
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: "Bearer " + token },
    body: JSON.stringify({ sourceId, version: rawVersion.slice(0, 120), chunks: batch }),
    signal: AbortSignal.timeout(30000)
  });
  const body = await response.text();
  if (!response.ok) {
    console.error(`Nexa ingestion failed at batch ${Math.floor(offset / 70) + 1} (HTTP ${response.status}): ${body.slice(0, 2000)}`);
    process.exit(1);
  }
  accepted += batch.length;
  console.log(`Accepted ${accepted}/${chunks.length} chunks; response: ${body}`);
}
console.log("Important: verify GET /v1/admin/medical/inventory and query /v1/admin/medical/private-knowledge/search before treating this version as active.");
