# NEXA Training Job Approval Policy v0.1

A training job may enter approved state only when all required controls are satisfied.

## Required controls

- Dataset manifest is present and has a valid SHA-256 fingerprint.
- Dataset provenance and license/permission are recorded.
- Dataset is explicitly marked de-identified.
- Exact source code commit is recorded.
- Versioned training configuration is recorded.
- Evaluation configuration is present.
- Compute profile is declared.
- Base-model and tokenizer lineage is declared when applicable.
- No identifiable clinical data is stored in Git or included in the job artifact.
- An authorized project owner approves execution.

## Automatic rejection

Reject the job when provenance is missing, de-identification is false or unknown, required lineage is absent, fingerprints are invalid, or evaluation configuration is missing.

## State boundary

Validation does not execute training. Approval only authorizes a controlled research run. Training completion still requires evaluation and model-promotion gates.
