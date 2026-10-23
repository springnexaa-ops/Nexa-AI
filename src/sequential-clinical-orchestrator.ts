/**
 * Nexa AI Sequential Clinical Orchestrator
 *
 * Model/provider-agnostic workflow scaffold for clinician-supervised clinical
 * decision support. This coordinates stages; it does not independently
 * diagnose, prescribe, or replace a clinician.
 */

export const NEXA_CLINICAL_WORKFLOW_VERSION = "0.1.0";

export type ClinicalStage =
  | "intake"
  | "problem_representation"
  | "differential"
  | "evidence_review"
  | "safety_review"
  | "clinician_review";

export type EvidenceItem = {
  id: string;
  title: string;
  source: string;
  url?: string;
  publishedAt?: string;
  retrievedAt: string;
  supports?: string[];
  limitations?: string[];
};

export type ClinicalFinding = {
  id: string;
  label: string;
  value: string;
  source: "patient" | "clinician" | "record" | "test" | "derived";
  observedAt?: string;
  verified: boolean;
};

export type DifferentialCandidate = {
  label: string;
  rationale: string[];
  evidenceFor: string[];
  evidenceAgainst: string[];
  missingInformation: string[];
  status: "consider" | "less_likely" | "not_assessed";
};

export type SafetyFlag = {
  code: string;
  severity: "critical" | "high" | "moderate" | "low";
  message: string;
  action: "urgent_clinician_assessment" | "clinician_review" | "obtain_missing_data";
};

export type ClinicalCase = {
  caseId: string;
  patientContext: {
    ageYears?: number;
    sexAtBirth?: string;
    relevantHistory?: string[];
    medications?: string[];
    allergies?: string[];
  };
  presentingConcern: string;
  findings: ClinicalFinding[];
  userQuestion?: string;
};

export type StageResult = {
  stage: ClinicalStage;
  summary: string;
  questionsToAsk: string[];
  suggestedInvestigations: Array<{
    name: string;
    clinicalRationale: string;
    urgency: "urgent" | "routine" | "not_specified";
    requiresClinicianOrder: true;
  }>;
  differential: DifferentialCandidate[];
  evidence: EvidenceItem[];
  safetyFlags: SafetyFlag[];
  missingInformation: string[];
  uncertainty: string[];
};

export type ClinicalWorkflowState = {
  workflowId: string;
  caseId: string;
  version: string;
  status: "in_progress" | "blocked_for_safety" | "awaiting_clinician" | "completed";
  currentStage: ClinicalStage;
  results: Partial<Record<ClinicalStage, StageResult>>;
  audit: Array<{
    stage: ClinicalStage;
    at: string;
    event: "started" | "completed" | "blocked" | "returned_for_information";
    note: string;
  }>;
};

export type StageHandler = (input: {
  clinicalCase: ClinicalCase;
  previous: Partial<Record<ClinicalStage, StageResult>>;
}) => Promise<StageResult>;

export type OrchestratorDependencies = {
  handlers: Record<ClinicalStage, StageHandler>;
  now?: () => string;
  createId?: () => string;
  persistAudit?: (state: ClinicalWorkflowState) => Promise<void>;
};

/**
 * Runs each stage in an auditable sequence. A critical safety flag blocks
 * progression. Production handlers must be clinically validated and return
 * concise, evidence-linked summaries rather than hidden model reasoning.
 */
export async function runSequentialClinicalWorkflow(
  clinicalCase: ClinicalCase,
  dependencies: OrchestratorDependencies,
): Promise<ClinicalWorkflowState> {
  const now = dependencies.now ?? (() => new Date().toISOString());
  const createId = dependencies.createId ?? (() => crypto.randomUUID());
  const sequence: ClinicalStage[] = [
    "intake",
    "problem_representation",
    "differential",
    "evidence_review",
    "safety_review",
    "clinician_review",
  ];

  const state: ClinicalWorkflowState = {
    workflowId: createId(),
    caseId: clinicalCase.caseId,
    version: NEXA_CLINICAL_WORKFLOW_VERSION,
    status: "in_progress",
    currentStage: sequence[0],
    results: {},
    audit: [],
  };

  for (const stage of sequence) {
    state.currentStage = stage;
    state.audit.push({ stage, at: now(), event: "started", note: "Stage started." });
    await dependencies.persistAudit?.(structuredClone(state));

    let result: StageResult;
    try {
      result = await dependencies.handlers[stage]({
        clinicalCase,
        previous: structuredClone(state.results),
      });
    } catch {
      state.status = "awaiting_clinician";
      state.audit.push({
        stage,
        at: now(),
        event: "blocked",
        note: "Stage failed; manual clinical review is required.",
      });
      await dependencies.persistAudit?.(structuredClone(state));
      return state;
    }

    state.results[stage] = { ...result, stage };
    const critical = result.safetyFlags.some((flag) => flag.severity === "critical");
    state.audit.push({
      stage,
      at: now(),
      event: critical ? "blocked" : "completed",
      note: critical
        ? "Critical safety flag detected; automatic progression stopped."
        : "Stage completed.",
    });

    if (critical) {
      state.status = "blocked_for_safety";
      state.currentStage = "clinician_review";
      await dependencies.persistAudit?.(structuredClone(state));
      return state;
    }

    if (result.missingInformation.length > 0) {
      state.status = "awaiting_clinician";
      state.audit.push({
        stage,
        at: now(),
        event: "returned_for_information",
        note: stage === "intake" ? "Essential intake information is needed before assessment can continue." : "Additional information is needed before assessment can be completed.",
      });
      await dependencies.persistAudit?.(structuredClone(state));
      return state;
    }

    await dependencies.persistAudit?.(structuredClone(state));
  }

  // Model output must never self-approve a clinical assessment.
  state.status = "awaiting_clinician";
  state.currentStage = "clinician_review";
  return state;
}

export function buildClinicianReviewSummary(state: ClinicalWorkflowState) {
  const results = Object.values(state.results).filter(
    (value): value is StageResult => Boolean(value),
  );
  return {
    workflowId: state.workflowId,
    caseId: state.caseId,
    status: state.status,
    requiresClinicianApproval: true as const,
    differential: state.results.differential?.differential ?? [],
    evidence: results.flatMap((result) => result.evidence),
    safetyFlags: results.flatMap((result) => result.safetyFlags),
    missingInformation: [...new Set(results.flatMap((result) => result.missingInformation))],
    uncertainty: [...new Set(results.flatMap((result) => result.uncertainty))],
    suggestedInvestigations: results.flatMap((result) => result.suggestedInvestigations),
    stageSummaries: results.map(({ stage, summary }) => ({ stage, summary })),
    disclaimer:
      "Clinical decision support only. Not a definitive diagnosis or treatment order. A qualified clinician must review the evidence, urgency, and final assessment.",
  };
}
