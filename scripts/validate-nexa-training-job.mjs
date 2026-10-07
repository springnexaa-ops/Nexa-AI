#!/usr/bin/env node
import fs from "node:fs";
import crypto from "node:crypto";

const file = process.argv[2];
if (!file) {
  console.error("Usage: node scripts/validate-nexa-training-job.mjs <job.json>");
  process.exit(2);
}
const job = JSON.parse(fs.readFileSync(file, "utf8"));
const errors = [];
const required = ["job_id","status","dataset_manifest","code_commit","training_config","compute_profile","evaluation_config"];
for (const key of required) if (job[key] === undefined || job[key] === null || job[key] === "") errors.push("missing "+key);

if (!/^nexa-job-[a-z0-9.-]+$/.test(String(job.job_id || ""))) errors.push("invalid job_id");
if (!["planned","approved","queued","running","completed","failed","rejected"].includes(job.status)) errors.push("invalid status");
if (!/^[0-9a-f]{40}$/.test(String(job.code_commit || ""))) errors.push("code_commit must be a 40-character SHA-1");
if (!job.dataset_manifest || !/^[0-9a-f]{64}$/.test(String(job.dataset_manifest.fingerprint || ""))) errors.push("dataset manifest fingerprint must be SHA-256");
if (!job.dataset_manifest?.version) errors.push("dataset manifest version missing");
if (!job.training_config?.id || !job.training_config?.version) errors.push("training configuration lineage missing");
if (!job.compute_profile) errors.push("compute profile missing");
if (!job.evaluation_config) errors.push("evaluation configuration missing");

if (job.artifact_sha256 !== null && job.artifact_sha256 !== undefined && !/^[0-9a-f]{64}$/.test(String(job.artifact_sha256))) errors.push("invalid artifact_sha256");

if (errors.length) {
  console.error("NEXA training job rejected:");
  for (const e of errors) console.error("- "+e);
  process.exit(1);
}
const fingerprint = crypto.createHash("sha256").update(JSON.stringify(job)).digest("hex");
console.log("NEXA training job valid: "+job.job_id+"; job_sha256="+fingerprint);
