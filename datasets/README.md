# NEXA Medical Dataset Program

This directory contains dataset schemas, manifests and documentation. It must not contain identifiable patient records.

## Dataset classes

- medical-text
- guidelines
- clinical-cases
- neuro-eeg
- neuro-emg-ncs
- neuro-vep
- neuro-bera
- neuro-rnst
- medical-imaging
- evaluation-only

## Required metadata

Each dataset manifest should identify:

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

Actual restricted datasets should remain in approved storage and be referenced by controlled manifests.
