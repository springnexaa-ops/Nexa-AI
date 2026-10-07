import fs from "node:fs";
import crypto from "node:crypto";

const file = process.argv[2];
if (!file) throw new Error("Usage: node scripts/validate-nexa-model-promotion.mjs <promotion.json>");
const x = JSON.parse(fs.readFileSync(file, "utf8"));
const fail = (m) => { throw new Error(m); };

if (!/^nexa-[a-z0-9-]+$/.test(x.model_id ?? "")) fail("Invalid model_id");
if (!/^v\d+\.\d+\.\d+$/.test(x.version ?? "")) fail("Invalid version");
if (!/^nexa-run-[a-z0-9.-]+$/.test(x.training_run_id ?? "")) fail("Invalid training_run_id");
if (!/^[0-9a-f]{40}$/.test(x.code_commit ?? "")) fail("Invalid code_commit");
if (!/^[0-9a-f]{64}$/.test(x.artifact_checksum ?? "")) fail("Invalid artifact_checksum");
if (!x.dataset_manifest?.version || !/^[0-9a-f]{64}$/.test(x.dataset_manifest.fingerprint ?? "")) fail("Invalid dataset manifest lineage");
if (!x.configuration?.id || !x.configuration?.version) fail("Missing configuration lineage");
if (!x.evaluation_report?.evaluation_id) fail("Missing evaluation report");
if (!["passed","in-review","failed","not-evaluated"].includes(x.safety_status)) fail("Invalid safety_status");
if (!["draft","research-only","conditional","approved","rejected"].includes(x.approval_status)) fail("Invalid approval_status");

const blocking = ["safety_status","privacy_status","regression_status"].filter(k => x[k] === "fail");
if (blocking.length) fail(`Promotion blocked: ${blocking.join(", ")} failed`);
if (x.approval_status === "approved" && x.safety_status !== "passed") fail("Approved candidate requires safety_status=passed");
if (x.approval_status === "approved" && x.authorized_approval !== true) fail("Approved candidate requires authorized_approval=true");

const canonical = JSON.stringify({
  model_id:x.model_id, version:x.version, training_run_id:x.training_run_id,
  dataset_manifest:x.dataset_manifest, code_commit:x.code_commit,
  configuration:x.configuration, evaluation_report:x.evaluation_report,
  safety_status:x.safety_status, approval_status:x.approval_status,
  artifact_checksum:x.artifact_checksum
});
console.log("NEXA promotion record valid:", x.model_id, x.version);
console.log("Promotion record SHA-256:", crypto.createHash("sha256").update(canonical).digest("hex"));
