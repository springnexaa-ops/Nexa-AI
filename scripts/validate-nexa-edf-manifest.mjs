#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const input = process.argv[2] || "datasets/manifests/eeg.jsonl";
if (!fs.existsSync(input)) {
  console.error(`EDF manifest not found: ${input}`);
  process.exit(1);
}
const lines = fs.readFileSync(input, "utf8").split(/\r?\n/).filter(Boolean);
const required = ["record_id","source_sha256","duration_seconds","channels","sampling_rates_hz","annotations"];
const seen = new Set();
let errors = 0;

for (let i=0;i<lines.length;i++) {
  let row;
  try { row=JSON.parse(lines[i]); } catch { console.error(`Line ${i+1}: invalid JSON`); errors++; continue; }
  for (const key of required) if (!(key in row)) { console.error(`Line ${i+1}: missing ${key}`); errors++; }
  if (typeof row.record_id !== "string" || !row.record_id) errors++;
  if (!/^[a-f0-9]{64}$/i.test(String(row.source_sha256||""))) { console.error(`Line ${i+1}: invalid SHA-256`); errors++; }
  if (!Number.isFinite(row.duration_seconds) || row.duration_seconds <= 0) { console.error(`Line ${i+1}: invalid duration`); errors++; }
  if (!Array.isArray(row.channels) || !row.channels.length) { console.error(`Line ${i+1}: channels must be non-empty`); errors++; }
  if (!Array.isArray(row.sampling_rates_hz) || !row.sampling_rates_hz.length) errors++;
  if (!Array.isArray(row.annotations)) errors++;
  if (seen.has(row.record_id)) { console.error(`Line ${i+1}: duplicate record_id ${row.record_id}`); errors++; }
  seen.add(row.record_id);
}
const fingerprint=crypto.createHash("sha256").update(fs.readFileSync(input)).digest("hex");
console.log(`Validated ${lines.length} EDF manifest records; fingerprint=${fingerprint}`);
if (errors) process.exit(1);
