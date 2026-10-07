import fs from "node:fs";
import crypto from "node:crypto";

const file = process.argv[2];
if (!file) throw new Error("Usage: node scripts/validate-nexa-foundation-record.mjs <record.json>");
const x = JSON.parse(fs.readFileSync(file, "utf8"));
const fail = (m) => { throw new Error(m); };

if (x.kind === "training-run") {
  if (!/^nexa-run-[a-z0-9.-]+$/.test(x.training_run_id ?? "")) fail("Invalid training_run_id");
  if (!/^nexa-job-[a-z0-9.-]+$/.test(x.job_id ?? "")) fail("Invalid job_id");
  if (!["queued","running","completed","failed"].includes(x.status)) fail("Invalid training-run status");
  if (!x.dataset_manifest?.version || !/^[0-9a-f]{64}$/.test(x.dataset_manifest.fingerprint ?? "")) fail("Invalid dataset lineage");
  if (!/^[0-9a-f]{40}$/.test(x.code_commit ?? "")) fail("Invalid code_commit");
} else if (x.kind === "evaluation") {
  if (!/^nexa-eval-[a-z0-9.-]+$/.test(x.evaluation_id ?? "")) fail("Invalid evaluation_id");
  if (!/^nexa-run-[a-z0-9.-]+$/.test(x.training_run_id ?? "")) fail("Invalid training_run_id");
  if (!Array.isArray(x.metrics) || !x.metrics.length) fail("metrics required");
  for (const m of x.metrics) if (!m.name || typeof m.value !== "number" || !m.definition || !m.denominator) fail("Invalid metric record");
  for (const k of ["safety_status","privacy_status","regression_status","bias_status","expert_review_status"]) if (!["not_evaluated","pass","conditional","fail"].includes(x[k])) fail(`Invalid ${k}`);
} else if (x.kind === "promotion") {
  if (!/^nexa-[a-z0-9-]+$/.test(x.model_id ?? "")) fail("Invalid model_id");
  if (!/^v\d+\.\d+\.\d+$/.test(x.version ?? "")) fail("Invalid version");
  if (!/^nexa-run-[a-z0-9.-]+$/.test(x.training_run_id ?? "")) fail("Invalid training_run_id");
  if (!x.evaluation_report?.evaluation_id) fail("Missing evaluation_report");
  if (!/^[0-9a-f]{64}$/.test(x.artifact_checksum ?? "")) fail("Invalid artifact_checksum");
  if (x.approval_status === "approved" && x.safety_status !== "passed") fail("Approved model requires passed safety");
  if (x.approval_status === "approved" && x.authorized_approval !== true) fail("Approved model requires authorized approval");
} else fail("kind must be training-run, evaluation, or promotion");

const fingerprint = crypto.createHash("sha256").update(JSON.stringify(x)).digest("hex");
console.log("NEXA foundation record valid");
console.log("Record SHA-256:", fingerprint);
