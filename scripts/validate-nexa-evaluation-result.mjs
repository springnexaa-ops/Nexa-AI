import fs from "node:fs";

const file = process.argv[2];
if (!file) throw new Error("Usage: node scripts/validate-nexa-evaluation-result.mjs <evaluation.json>");
const x = JSON.parse(fs.readFileSync(file, "utf8"));
const fail = (m) => { throw new Error(m); };
if (!/^nexa-eval-[a-z0-9.-]+$/.test(x.evaluation_id ?? "")) fail("Invalid evaluation_id");
if (!/^nexa-run-[a-z0-9.-]+$/.test(x.training_run_id ?? "")) fail("Invalid training_run_id");
if (!/^nexa-[a-z0-9-]+$/.test(x.model_id ?? "")) fail("Invalid model_id");
if (!/^v\d+\.\d+\.\d+$/.test(x.model_version ?? "")) fail("Invalid model_version");
if (!Array.isArray(x.dataset_versions) || !x.dataset_versions.length) fail("dataset_versions required");
if (!Array.isArray(x.metrics) || !x.metrics.length) fail("metrics required");
for (const m of x.metrics) {
  if (!m.name || typeof m.value !== "number" || !m.definition || !m.denominator) fail("Each metric needs name, numeric value, definition, denominator");
}
for (const k of ["safety_status","privacy_status","regression_status","bias_status","expert_review_status"]) {
  if (!["not_evaluated","pass","conditional","fail"].includes(x[k])) fail(`Invalid ${k}`);
}
if (x.artifact_sha256 != null && !/^[0-9a-f]{64}$/.test(x.artifact_sha256)) fail("Invalid artifact_sha256");
console.log("NEXA evaluation result valid:", x.evaluation_id);
