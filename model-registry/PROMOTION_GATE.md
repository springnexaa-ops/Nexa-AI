# NEXA Model Promotion Gate v0.1

A training run is never promoted directly to production.

## Required gates

1. Dataset provenance and permission verified.
2. Dataset manifest fingerprint recorded.
3. Training code commit recorded.
4. Training configuration recorded.
5. Base-model/tokenizer lineage recorded when applicable.
6. Evaluation report is immutable and linked to the candidate.
7. Medical safety evaluation passes or has an explicitly documented conditional status.
8. Privacy review passes.
9. Bias/fairness review is completed where applicable.
10. Regression suite passes.
11. Required expert/clinical review is completed.
12. Artifact SHA-256 is recorded.
13. Explicit authorized approval is recorded.

## Automatic rejection

Reject promotion when provenance is missing, identifiable patient data is detected in the training artifact, evaluation is missing, safety status is fail, privacy review fails, regression fails, or artifact integrity cannot be verified.

## Production boundary

This gate controls promotion of future NEXA model candidates. It does not replace applicable clinical, regulatory, security, or quality-system requirements.
