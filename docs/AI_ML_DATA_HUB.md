# NEXA AI/ML Data Hub

The AI/ML Data Hub is the controlled intake and promotion layer for NEXA-owned medical and machine-learning data.

## Supported data classes
- clinical_text
- qa
- protocol
- report_examples
- signal_metadata
- synthetic
- validation

Modalities can be tagged as EEG, NCS, EMG, VEP, BAER/BERA, RNS, or general.

## Lifecycle
1. Pending — newly submitted data is isolated from the production retrieval layer.
2. Approved — an administrator has reviewed the dataset and its provenance.
3. Promoted — approved records are embedded and appended to the NEXA private knowledge runtime.
4. Rejected — data is blocked from promotion.

Promotion updates the retrieval knowledge layer. It does not silently retrain or replace the base language model.

## Provenance and governance
Each dataset has an ID, version, content hash, record count, data type, modality, timestamps, approval metadata and status. Individual records retain dataset/version association, labels, split metadata and optional structured metadata.

Do not upload identifiable patient data through this administrative intake unless an approved lawful processing, access-control, retention and security workflow exists. Prefer de-identified, synthetic or institutionally authorized data.

## API
- GET /v1/admin/ai-data
- GET /v1/admin/ai-data/datasets/:id
- POST /v1/admin/ai-data/datasets
- POST /v1/admin/ai-data/datasets/:id/approve
- POST /v1/admin/ai-data/datasets/:id/reject
- POST /v1/admin/ai-data/datasets/:id/promote

All admin endpoints require the existing administrator authorization and rate limiting.

## Important distinction
Adding data to the Hub improves NEXA's governed retrieval/knowledge layer. It is not evidence that a machine-learning model has been clinically retrained, validated, or approved for clinical use. Model training, evaluation, calibration and deployment remain separate controlled lifecycle stages.