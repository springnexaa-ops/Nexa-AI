# NEXA Medical Risk Management Baseline

## Risk categories
- Incorrect clinical interpretation or hallucinated evidence.
- Retrieval of stale or inappropriate evidence.
- Invalid or misleading citations.
- Model/provider failure or model-version drift.
- Patient-data exposure or unauthorized access.
- Unsafe automation or over-reliance on AI output.
- Bias or performance degradation in relevant patient populations.
- Software defects, dependency vulnerabilities and supply-chain compromise.

## Controls implemented
- Medical routing and explicit medical safety instructions.
- Authoritative-source registry with ingestion/licensing restrictions.
- Evidence retrieval with source/chunk IDs and versions.
- Stale-source exclusion with source-specific refresh intervals.
- Exact retrieved-evidence snapshots and hashes.
- Citation validation and recorded citation warnings.
- Input, answer and evidence hashes.
- Sequential tamper-evident audit chain with verification endpoint.
- Mandatory human-review state for clinical decision-support outputs.

## Controls still requiring project evidence
Clinical performance thresholds, formal hazard analysis, residual-risk acceptance, cybersecurity penetration testing, usability/human-factors validation, privacy impact assessment, model bias evaluation and post-market monitoring must be completed and retained as controlled quality records before making corresponding production or regulatory claims.
