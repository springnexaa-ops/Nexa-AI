# NEXA Medical Knowledge Inventory

## Purpose

The NEXA Medical Knowledge Inventory measures the medical knowledge layer that is actually registered, indexed, versioned, retrieved and audited. It deliberately separates **registered source families** from **content actually indexed**.

## Inventory dimensions

- Source registry: authoritative medical, regulatory, terminology, research and dataset families configured for NEXA.
- Public corpus: source documents/chunks successfully ingested into the Medical Evidence Durable Object.
- Private corpus: privately supplied medical knowledge chunks and versions stored separately from public evidence.
- Freshness: stale source count and source refresh metadata.
- Provenance: source ID, authority, URL, version and retrieval metadata.
- Clinical domains: general medicine, neurology/neurophysiology, cardiology, radiology, laboratory medicine, pharmacology, genomics, infectious disease, oncology, public health, clinical trials, interoperability, medical AI and regulatory knowledge.
- Neurodiagnostics: NCS, EMG, EEG, VEP, BAER/BERA and RNS.
- Clinical QA: medical audit count, citation-valid count and completed human-review count.

## API

Authenticated administrator endpoint:

`GET /v1/admin/medical/inventory`

The response includes:

- `schemaVersion`
- `generatedAt`
- `corpus.public`
- `corpus.private`
- `sources`
- `sourceRecords`
- `audits`
- `coverage`

## Interpretation

A registered source is **not** counted as indexed medical knowledge unless content has actually been ingested.

A source listed as metadata/link-only or license-restricted remains a provenance/reference resource unless its terms permit the intended ingestion.

Private medical knowledge is never exposed through the inventory as source text. The inventory reports only operational metadata such as chunk count, version and update time.

This inventory is a measurement system, not a claim of clinical validation, regulatory approval, diagnostic accuracy or equivalence to professional medical judgment.
