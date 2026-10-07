import fs from "node:fs";
import crypto from "node:crypto";

const required = ["dataset_id","version","modality","source","license_or_permission","provenance","de_identified","annotation_status","intended_use","split","checksum","created_at","owner"];
const allowedSplits = new Set(["train","validation","test","evaluation-only"]);
const file = process.argv[2];
if (!file) { console.error("Usage: node scripts/validate-nexa-foundation-manifest.mjs <manifest.json>"); process.exit(2); }

const data = JSON.parse(fs.readFileSync(file, "utf8"));
const items = Array.isArray(data) ? data : data.items;
if (!Array.isArray(items) || items.length === 0) throw new Error("Manifest must contain a non-empty array or an items array.");

const seen = new Set();
for (const [i, item] of items.entries()) {
  for (const key of required) {
    if (item[key] === undefined || item[key] === null || item[key] === "") throw new Error(`Manifest item ${i} is missing required field: ${key}`);
  }
  if (seen.has(item.dataset_id)) throw new Error(`Duplicate dataset_id: ${item.dataset_id}`);
  seen.add(item.dataset_id);
  if (item.de_identified !== true) throw new Error(`Manifest item ${i} is not marked de_identified=true.`);
  if (!allowedSplits.has(item.split)) throw new Error(`Manifest item ${i} has invalid split: ${item.split}`);
  if (!/^[a-f0-9]{64}$/i.test(item.checksum)) throw new Error(`Manifest item ${i} checksum must be a SHA-256 hex digest.`);
}
const digest = crypto.createHash("sha256").update(JSON.stringify(items)).digest("hex");
console.log(`NEXA foundation manifest valid: ${items.length} item(s); manifest_sha256=${digest}`);
