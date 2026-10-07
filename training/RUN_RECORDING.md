# NEXA Training Run Recording v0.1

## Purpose

Convert an approved training job into an immutable research-run record. This specification records lineage; it does not execute training.

## Required lineage

A run record must reference:

- approved training job ID
- exact dataset manifest version and fingerprint
- exact source code commit
- training configuration ID/version
- tokenizer and base-model lineage when applicable
- compute profile
- evaluation configuration
- execution status
- output artifact checksum when completed

## Status transitions

`approved -> queued -> running -> completed`

Failure may transition to `failed`. A rejected job cannot become a run without a new approval decision.

## Immutability

Once a run reaches `running`, lineage fields are frozen. Corrections require a new run record rather than silently rewriting history.

## Production boundary

A completed run is a research artifact. It must enter evaluation before a model candidate can be considered for promotion.
