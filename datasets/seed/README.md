# NEXA Seed Corpus Intake Template

This directory is intentionally a metadata template. No medical source is represented as approved until its licensing, provenance, checksum, and permitted training use have been independently verified.

## Required intake fields
- dataset_id
- version
- modality
- source
- license_or_permission
- provenance
- de_identified
- annotation_status
- intended_use
- split
- checksum
- created_at
- owner

## Status
No source is approved by this template alone.

## Workflow
1. Obtain a source with a clear legal basis for research/training use.
2. Record provenance and acquisition details.
3. Compute SHA-256 of the controlled source artifact.
4. Review privacy/de-identification requirements.
5. Record the source in a dataset manifest.
6. Run foundation:manifest:validate.
7. Build the approved text corpus outside Git when appropriate.
8. Freeze the manifest fingerprint before training.

Do not replace missing licensing or checksum values with placeholders in an approved manifest.