# NEXA Model Registry

Each candidate model must have immutable lineage metadata:

- model_id
- version
- training_run_id
- dataset_versions
- code_commit
- configuration
- tokenizer
- base model, if any
- evaluation report
- safety status
- approval status
- artifact checksum

A model is not production-ready merely because training succeeds.
