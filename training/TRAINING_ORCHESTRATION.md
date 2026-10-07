# NEXA Training Orchestration v0.1

## Purpose

Define a reproducible control plane for future NEXA research training jobs without coupling the repository to a specific cloud GPU provider.

## Job lifecycle

`planned -> approved -> queued -> running -> completed`

Failure paths: `planned/approved/queued/running -> failed` and `approved -> rejected`.

## Required inputs

A training job must reference:

- an immutable dataset manifest version and fingerprint
- an exact code commit
- a versioned training configuration
- tokenizer and base-model lineage, when applicable
- a declared compute profile
- an output artifact location
- an evaluation configuration

## Reproducibility

The job record must capture software/runtime versions, random-seed policy, hyperparameters, dataset fingerprints, configuration fingerprint, and output artifact checksum.

## Data boundary

Training jobs consume approved datasets from controlled storage. GitHub stores orchestration code, manifests, schemas and metadata; it must not become a repository for identifiable clinical records or unrestricted model artifacts.

## Production boundary

Training orchestration produces research candidates only. Completion of a training job never implies clinical readiness or production deployment.
