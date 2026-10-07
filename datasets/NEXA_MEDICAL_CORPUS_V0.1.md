# NEXA Medical Corpus v0.1

## Objective
Create the first governed, reproducible medical corpus for NEXA research training. This corpus is a dataset program, not a claim that a foundation model has already been trained.

## Initial domain priority
1. Neurology
2. Clinical neurophysiology
3. EEG and seizure terminology
4. EMG/NCS
5. VEP
6. BERA/BAER
7. RNST
8. General clinical medicine
9. Medical terminology
10. Evidence-based guidelines

## Source acceptance
Each source must have a stable source identifier, title/version/date, publisher or originating organization, acquisition date, license or permission basis, source checksum, provenance record, and permitted use for research/training.

Unlicensed or unclear material must not enter the training corpus.

## Privacy
No identifiable patient records belong in Git. Patient-derived material requires appropriate authorization, de-identification, governance, and a separate controlled storage process.

## Corpus stages
candidate -> provenance-reviewed -> approved -> normalized -> deduplicated -> split -> evaluated -> training-ready

## Quality requirements
Training-ready material must have valid provenance, permitted use, verified checksum, no known direct identifiers, deterministic normalization, duplicate/leakage checks, documented train/validation/test split, and a dataset manifest fingerprint.

## v0.1 deliverable
The immediate deliverable is a small, high-quality, legally usable seed corpus and its immutable manifest. Scale comes after quality and evaluation are demonstrated.