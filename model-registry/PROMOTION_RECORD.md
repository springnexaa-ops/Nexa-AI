# NEXA Model Promotion Record

A model candidate can move from research-only to approved only when the complete lineage and evaluation evidence are present.

## Mandatory lineage
- model ID and semantic version
- training run ID
- dataset manifest version and SHA-256 fingerprint
- exact source code commit
- training configuration ID/version
- evaluation report ID
- model artifact SHA-256
- safety status
- authorized approval decision

## Blocking conditions
Promotion is blocked by missing lineage, failed safety/privacy/regression evaluation, invalid checksums, identifiable clinical data in the training artifact, or absence of authorized approval.

An approved candidate must have safety_status=passed and an explicit authorized approval flag.

## Production boundary
Registration and approval do not automatically replace the production Workers AI runtime. Deployment remains a separate controlled operation with its own release, rollback, and verification gates.