import { strict as assert } from "node:assert";
import {
  runSequentialClinicalWorkflow,
  buildClinicianReviewSummary,
  type ClinicalStage,
  type StageHandler,
  type StageResult,
} from "../src/sequential-clinical-orchestrator";

const stages: ClinicalStage[] = [
  "intake",
  "problem_representation",
  "differential",
  "evidence_review",
  "safety_review",
  "clinician_review",
];

function result(stage: ClinicalStage, overrides: Partial<StageResult> = {}): StageResult {
  return {
    stage,
    summary: stage + " completed",
    questionsToAsk: [],
    suggestedInvestigations: [],
    differential: [],
    evidence: [],
    safetyFlags: [],
    missingInformation: [],
    uncertainty: [],
    ...overrides,
  };
}

function handlers(overrides: Partial<Record<ClinicalStage, StageHandler>> = {}) {
  return Object.fromEntries(stages.map((stage) => [
    stage,
    overrides[stage] ?? (async () => result(stage)),
  ])) as Record<ClinicalStage, StageHandler>;
}

const clinicalCase = {
  caseId: "test-case",
  patientContext: {},
  presentingConcern: "Example test case",
  findings: [],
};

const completed = await runSequentialClinicalWorkflow(clinicalCase, {
  handlers: handlers(),
  now: () => "2026-10-23T00:00:00.000Z",
  createId: () => "workflow-test",
});
assert.equal(completed.status, "awaiting_clinician");
assert.equal(completed.currentStage, "clinician_review");
assert.equal(completed.audit.filter((event) => event.event === "completed").length, 6);
assert.equal(buildClinicianReviewSummary(completed).requiresClinicianApproval, true);

const blocked = await runSequentialClinicalWorkflow(clinicalCase, {
  handlers: handlers({
    safety_review: async () => result("safety_review", {
      safetyFlags: [{
        code: "TEST_CRITICAL",
        severity: "critical",
        message: "Critical test flag",
        action: "urgent_clinician_assessment",
      }],
    }),
  }),
  createId: () => "workflow-blocked",
});
assert.equal(blocked.status, "blocked_for_safety");
assert.equal(blocked.currentStage, "clinician_review");
assert.equal(blocked.results.clinician_review, undefined);

const needsInfo = await runSequentialClinicalWorkflow(clinicalCase, {
  handlers: handlers({
    differential: async () => result("differential", {
      missingInformation: ["Symptom onset"],
    }),
  }),
  createId: () => "workflow-missing-info",
});
assert.equal(needsInfo.status, "awaiting_clinician");
assert.equal(needsInfo.results.evidence_review, undefined);
assert.ok(needsInfo.audit.some((event) => event.event === "returned_for_information"));

const intakeNeedsInfo = await runSequentialClinicalWorkflow(clinicalCase, {
  handlers: handlers({
    intake: async () => result("intake", {
      questionsToAsk: ["When did symptoms begin?"],
      missingInformation: ["Symptom onset"],
    }),
  }),
  createId: () => "workflow-intake-info",
});
assert.equal(intakeNeedsInfo.status, "awaiting_clinician");
assert.equal(intakeNeedsInfo.results.problem_representation, undefined);
assert.ok(intakeNeedsInfo.audit.some((event) => event.stage === "intake" && event.event === "returned_for_information"));

const failed = await runSequentialClinicalWorkflow(clinicalCase, {
  handlers: handlers({
    evidence_review: async () => { throw new Error("simulated provider failure"); },
  }),
  createId: () => "workflow-failed",
});
assert.equal(failed.status, "awaiting_clinician");
assert.ok(failed.audit.some((event) => event.stage === "evidence_review" && event.event === "blocked"));

console.log("sequential clinical orchestrator tests: PASS");
