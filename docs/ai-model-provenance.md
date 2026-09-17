# NEXA AI Model Provenance

## Required manifest for every production model
Record:
- provider and model identifier/version;
- deployment date and configuration;
- model card or official technical documentation reference;
- applicable licence/terms of use;
- intended use and known limitations;
- safety and clinical evaluation evidence;
- prompt/system-policy version;
- retrieval/evidence engine version;
- dependency and runtime versions;
- any fine-tuning, adapter or evaluation datasets and their provenance/licensing status.

## Important distinction
The NEXA medical evidence registry establishes provenance for retrieved sources. It does not, by itself, establish lawful provenance of the training data used to build a third-party foundation model. Foundation-model supply-chain provenance must therefore be maintained separately from the medical evidence audit trail.
