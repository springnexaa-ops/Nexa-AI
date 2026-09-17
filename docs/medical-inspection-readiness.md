# NEXA Medical Inspection-Readiness Framework

## Purpose
NEXA is being engineered as a traceable medical decision-support system. This document defines the evidence expected for inspection, clinical validation, quality management, cybersecurity, privacy and post-market operation.

## Inspection evidence chain
1. Intended use and user population are version-controlled.
2. Each medical answer records input/query hashes, retrieved evidence IDs, source versions, retrieval time, model/provider, answer hash, conclusion, uncertainty and safety/review state.
3. Retrieved evidence is snapshotted by chunk hash so the exact evidence used can be reconstructed without relying on a later source revision.
4. Audit records form a sequential SHA-256 hash chain and expose a verification endpoint.
5. Citations are syntactically validated against the retrieved evidence IDs; invalid citations are recorded as a safety warning rather than silently repaired.
6. Clinical outputs enter a human-review workflow; approval, modification or rejection is recorded with reviewer and note hashes.

## Required non-code evidence
- Intended-use statement and claims matrix.
- Software/device classification assessment for the target market.
- Clinical evaluation and validation protocol/results.
- Risk-management file covering hazards, controls and residual risk.
- Software lifecycle/change-control records.
- Cybersecurity threat model, vulnerability management and penetration-test evidence.
- Privacy/consent/data-retention and access-control records.
- Model/foundation-model provenance, versioning and evaluation reports.
- Bias/performance monitoring by relevant populations where applicable.
- Complaint, incident, CAPA and post-market surveillance procedures.
- Training and competency records for human reviewers.

## Important boundary
An audit trail or evidence registry does not itself constitute regulatory approval, clinical validation or a medical-device licence. Final classification, submission and compliance decisions must be made against the applicable law, intended use, risk class and competent regulatory/clinical advice.
