# NEXA Seed Corpus Intake

## Intake record

For every candidate source record:

- source_id
- title
- source_type
- publisher
- version_or_date
- acquisition_date
- license_or_permission
- permitted_training_use
- source_uri_or_reference
- source_sha256
- provenance_reviewer
- status

## Acceptance rule

A source may enter the training-ready corpus only after provenance and permitted-use review. The repository stores metadata and derived, approved artifacts only; restricted source files remain in controlled storage.

## Recommended v0.1 scope

Start with a deliberately small corpus covering neurology and clinical neurophysiology. Prefer authoritative, legally reusable sources over volume.

## Rejection reasons

Reject sources with unknown licensing, prohibited training use, unresolved provenance, identifiable clinical data, corrupted content, or unacceptable duplication/leakage risk.
