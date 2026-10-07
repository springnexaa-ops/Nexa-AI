# NEXA Foundation Model v0.1

## Purpose

NEXA Foundation Model is the proprietary model-development program for SpringNexa's medical AI platform. v0.1 establishes the engineering, data-governance, training, evaluation and model-registry foundations without replacing the current production Workers AI runtime.

## Architecture

Production remains on Cloudflare Workers / Workers AI. The proprietary model program is an independent layer:

NEXA Medical Corpus -> Governance -> Dataset Builder -> Training -> Evaluation -> Model Registry -> Controlled Inference

The project must not describe a Workers AI model as a NEXA-trained foundation model.

## Initial objectives

1. Build a provenance-aware medical corpus.
2. Create a governed dataset manifest format.
3. Establish separate training/validation/test splits with leakage controls.
4. Build medical and neurophysiology datasets first.
5. Establish reproducible training configurations.
6. Establish clinical evaluation and safety gates.
7. Maintain model/data version lineage.
8. Keep identifiable patient data out of Git repositories.

## Initial domains

- General medicine
- Neurology
- Neurophysiology
- EEG / EDF
- EMG / NCS
- VEP
- BERA / BAER
- RNST
- Clinical terminology
- Guidelines and evidence

## Data governance

Every dataset item must record provenance, license/permission, de-identification status, modality, source version, annotation status and allowed use.

Raw identifiable patient records must never be committed to Git.

External datasets may be used only according to their licenses/data-use agreements.

## Model roadmap

- v0.1: data contracts, manifests, validation and evaluation scaffolding
- v0.2: medical representation/embedding experiments
- v0.3: domain-adapted language model experiments
- v0.4: neurophysiology signal model
- v0.5: multimodal research prototype
- v1.x: proprietary model candidates after independent safety/quality evaluation

Parameter count is not a release criterion by itself. Quality, provenance, reproducibility, privacy and clinical evaluation are required.

## Production boundary

This program must not silently change the production medical assistant. Model candidates are promoted only through explicit evaluation and deployment gates.
