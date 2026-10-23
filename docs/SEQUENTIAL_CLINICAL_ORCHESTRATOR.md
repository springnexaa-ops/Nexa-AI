# Nexa AI Sequential Clinical Orchestrator

## Purpose

Implement a Nexa-owned, model-agnostic sequential clinical decision-support workflow inspired by published research on sequential diagnosis and diagnostic orchestration. This is not a clone of Microsoft's proprietary implementation. Nexa must use its own orchestration code, prompts, knowledge sources, evaluation datasets, and safety controls.

## Workflow

1. **Intake:** normalize the presenting concern, relevant history, medications, allergies, observations, and test results; preserve source and verification status.
2. **Problem representation:** produce a concise clinical summary, chronology, key positive/negative findings, contradictions, and missing information.
3. **Differential:** list plausible candidates with evidence for, evidence against, and unresolved information. Do not force a single diagnosis.
4. **Evidence review:** retrieve authorized, traceable clinical sources; attach source title, URL, publication/version metadata, retrieval time, and limitations.
5. **Safety review:** check red flags, dangerous alternatives, contraindications, data conflicts, and uncertainty. Critical flags stop automated progression.
6. **Clinician review:** present the structured assessment and evidence for review, amendment, rejection, and approval by an appropriately qualified clinician.

## Implementation currently on the feature branch

- `src/sequential-clinical-orchestrator.ts` implements the ordered stage contract, returned-for-information gate, critical safety stop, audit events, and clinician-review summary.
- `src/core-worker.ts` routes medical chat requests through six sequential Cloudflare Workers AI calls using the existing `@cf/zai-org/glm-4.7-flash` default (or an explicitly requested Cloudflare `@cf/*` model). Non-medical chat retains the existing single-response route.
- The six stages are intake, problem representation, provisional differential, evidence review, safety review, and clinician-review synthesis. Each stage receives the prior stage summaries; recent conversation turns are included as context.
- `src/sequential-medical-evidence-adapter.ts` connects the existing Nexa evidence registry to the workflow and preserves source-access limitations. Existing live evidence chunks are included by the outer medical middleware when available.
- The response includes a workflow ID, stage audit events, workflow status, and an explicit clinician-approval requirement. Existing medical audit handling continues to record evidence-linked requests and answers when live evidence was retrieved.
- Model output is schema-checked. Invalid or failed stages fail closed; no automated clinical approval, test order, or prescription is issued.

This is an integrated feature-branch implementation, not yet a validated clinical product. Stage events are returned in the response; durable per-stage audit persistence, full patient-record integration, UI workflow state, clinician actions, and end-to-end validation remain outstanding.

## Production integration plan

- Connect to existing authentication and tenant authorization before loading or persisting patient data.
- Reuse Nexa's medical evidence engine and citation validator; never fabricate citations or present metadata-only sources as reviewed evidence.
- Implement one independently testable handler per stage. Return concise summaries and evidence-linked results, not hidden model reasoning.
- Add durable, append-only audit events with actor, tenant, case reference, model/provider/version, prompt/configuration version, source identifiers, timestamps, and clinician actions. Avoid logging unnecessary patient identifiers or secrets.
- Enforce minimum-necessary access, encryption in transit and at rest, retention limits, and tenant isolation.
- Keep suggestions separate from actual test orders. Investigations require clinician authorization; do not execute prescriptions or orders autonomously.
- Make emergency/red-flag behavior deterministic and clinician-reviewed; a model-generated “low risk” result must never suppress escalation.
- Do not use patient data for model training without a lawful basis, appropriate notice/consent where required, and approved governance.
- Validate on representative Indian clinical workflows and neurodiagnostic use cases before any clinical deployment. Include calibration, sensitivity for high-risk conditions, subgroup analysis, citation correctness, missing-data behavior, failure handling, and clinician usability.
- Maintain rollback, incident reporting, post-deployment monitoring, and change control.

## Clinical scope and claims

Initial intended use: clinician-supervised clinical information organization and decision support. The system must not independently establish a definitive diagnosis, prescribe treatment, or replace a clinician. Do not claim that Nexa outperforms doctors unless a prespecified, independently reviewed evaluation supports that exact claim.

## Acceptance criteria before production

- Every stage has unit and integration tests, including missing information, conflicting evidence, empty source results, model timeouts, and critical safety flags.
- Every displayed clinical assertion is traceable to supplied case data or an identified evidence source.
- Critical safety flags stop progression and remain visible in the clinician review.
- No workflow is automatically marked clinically approved.
- Authentication, authorization, tenant isolation, privacy, auditability, and release gates pass.
- Clinical performance is evaluated on held-out cases with expert adjudication and compared against relevant baselines; report confidence intervals and error types, not accuracy alone.
