# NEXA Model Candidate Registration v0.1

## Workflow

1. Create a training run record.
2. Freeze dataset manifest versions.
3. Freeze training code commit and configuration.
4. Produce an evaluation report.
5. Compute and record the model artifact SHA-256.
6. Register the candidate as draft.
7. Run the promotion gate.
8. Record authorized approval or rejection.
9. Only an approved candidate may be considered for controlled deployment.

## Immutability

After registration, lineage identifiers and artifact checksums must not be silently changed. A new training run or artifact creates a new candidate/version.

## Production boundary

Registration does not alter the production Workers AI runtime. Future NEXA candidates remain research artifacts until explicitly promoted.
