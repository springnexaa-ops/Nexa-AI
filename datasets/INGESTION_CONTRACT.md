# NEXA Dataset Ingestion Contract v0.1

The ingestion layer accepts approved source files and emits **metadata/manifests**, not raw patient records into Git.

## Required stages

1. Intake: assign immutable dataset ID.
2. Authorization: record license, permission or data-use agreement.
3. Privacy: verify de-identification before training eligibility.
4. Integrity: calculate SHA-256 checksums.
5. Normalization: convert approved material into a reproducible internal representation.
6. Provenance: preserve source, version, transformation and timestamp.
7. Splitting: prevent patient/source leakage between train, validation and test.
8. Manifest: write a versioned manifest referencing controlled storage.
9. Validation: block incomplete or unsafe manifests.
10. Training handoff: only validated manifests may enter training jobs.

## Modality-specific normalization

### Medical text
Normalize encoding, document structure, section boundaries and metadata while preserving source provenance.

### EEG/EDF
Preserve original signal metadata and checksum. Record channel labels, sampling frequency, duration and annotation provenance in derived metadata. Never overwrite the source EDF.

### EMG/NCS, VEP, BERA and RNST
Preserve raw source artifacts and record acquisition metadata separately from derived features/labels.

## Prohibited

- Identifiable patient data in Git.
- Training on data without documented permission.
- Silent dataset replacement.
- Mixing evaluation data into training.
- Removing provenance.
- Automatic production deployment from a training run.
