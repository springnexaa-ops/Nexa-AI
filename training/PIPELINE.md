# NEXA Training Pipeline v0.1

## Controlled flow

1. Register an approved dataset manifest.
2. Validate provenance, permission and de-identification.
3. Verify checksums.
4. Preprocess into a reproducible intermediate format.
5. Create leakage-resistant train/validation/test splits.
6. Train a research candidate.
7. Run medical, safety, privacy and regression evaluations.
8. Register the candidate with immutable lineage.
9. Require explicit approval before production deployment.

## Initial research tracks

### Medical text
Build domain-adaptation and representation-learning experiments using approved/licensed medical material.

### Neurophysiology
Build signal preprocessing and classification datasets for EEG/EDF first, followed by EMG/NCS, VEP, BERA and RNST.

## Data boundary

Git contains manifests, schemas, code and metadata only. Restricted or identifiable clinical data belongs in approved controlled storage.
