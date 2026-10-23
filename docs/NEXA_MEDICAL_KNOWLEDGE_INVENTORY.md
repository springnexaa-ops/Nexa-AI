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


## User-library book audit (2026-10-23)

These files were located in the user's ChatGPT Library. Their presence here does **not** prove they have been ingested into the Nexa runtime corpus.

| Domain | Library file | Identified content | Ingestion status |
|---|---|---|---|
| EEG | `867010557-atlas-academia-americana-epilepsia.pdf` | *Electroencephalography (EEG): An introductory text and atlas of normal and abnormal findings in adults, children and infants* (American Epilepsy Society; the file contains a license section) | Not confirmed in Nexa runtime |
| EEG | `EEG_explanation.pdf`, `EEG_explanation(1).pdf` | Extracted chapters referencing *Niedermeyer's Electroencephalography: Basic Principles, Clinical Applications, and Related Fields* (2010), including computer-assisted EEG analysis and EEG/evoked-potential monitoring | Not confirmed; publisher-copyright restrictions need checking |
| Epilepsy / EEG | `Epilepsy-Notes-PDF-Book-2019-low.pdf` | Epilepsy notes/book, with EEG-related content | Not confirmed; rights/edition need checking |
| EEG reporting | `Guideline7-GuidelinesforEEGReporting_v1.pdf` | American Clinical Neurophysiology Society Guideline 7: Guidelines for EEG Reporting | Not confirmed in Nexa runtime |
| EEG reporting | `SCORE-2017.pdf` | Standardized Computer-based Organized Reporting of EEG (SCORE), second version | Not confirmed in Nexa runtime |
| EMG / NCS | `EMG NCS.pdf`, `EMG NCS(1).pdf`, `EMG NCS(2).pdf` | *Electromyography and Neuromuscular Disorders: Clinical-Electrophysiologic-Ultrasound Correlations*, Fourth Edition (2021), David C. Preston and Barbara E. Shapiro; ISBN 978-0-323-66180-5 | Three apparent duplicate uploads; not confirmed in Nexa runtime; copyrighted Elsevier material |
| EEG workflow example | `MarkPages-5.pdf` | Marked EEG waveform pages used as a PDF-output example | Not a textbook; assess patient-data privacy before any reuse |
| Nexa reporting | `NEXA_EEG_One_Page_International_Report_Format.pdf`, `NEXA_EEG_International_Structured_Report_Format.pdf` | Internal EEG report format drafts | Confirm which is current/approved before using as a standard |
| Unclassified medical notes | `Pasted text(20261002-100751).txt`, `Pasted text(20261002-100905).txt`, `Pasted text(20261002-101035).txt`, `Pasted text(20261002-102702).txt` | Previously uploaded text files; classify before ingestion | Not yet classified |

The Library search also returned multiple copies of the same EMG/NCS book and EEG chapter files. Ingestion must hash files and deduplicate identical copies rather than index the same text repeatedly.

## Provider-independent knowledge retrieval

The Medical Evidence Durable Object now supports deterministic lexical retrieval for both public and private chunks. Querying, private-book ingestion and approved-dataset promotion no longer call Cloudflare AI for embeddings. Existing stored embedding fields remain for backward compatibility but are not required for lexical search.

The model layer now supports an OpenAI-compatible self-hosted inference endpoint:
- `NEXA_MODEL_PROVIDER=self-hosted` requires the self-hosted endpoint and fails closed if it is not configured.
- `NEXA_MODEL_BASE_URL` sets the endpoint base URL (or full `/v1/chat/completions` URL).
- `NEXA_MODEL_NAME` sets the server's model identifier.
- `NEXA_MODEL_API_KEY` is an optional secret for a protected endpoint.
- In `auto` mode, a configured self-hosted endpoint is preferred. If it is absent, the existing Cloudflare inference path remains as a compatibility fallback.

This code does not provision the model server or migrate the existing Durable Object database away from Cloudflare. Full independence requires a SpringNexa-controlled model host and data store. Do not set production to `self-hosted` until the endpoint is deployed, secured, tested, and reachable from the Worker.

## Book update workflow

1. Upload the new book or edition through the private admin ingestion flow; do not put book PDFs in a public GitHub repository.
2. Record bibliographic metadata, licence/permission basis, edition and SHA-256.
3. Extract text and tables with page references; OCR scanned pages and inspect extraction quality.
4. Deduplicate by file hash; preserve separate editions as separate versions.
5. Split into page-aware chunks and index with lexical search. Keep private book excerpts internal and only return original-language summaries.
6. Run retrieval checks using known questions, verify the returned pages, and record a new corpus version.
7. Activate only after ingestion status and smoke tests confirm the new version is queryable. Keep rollback to the previous version.

**Verified boundary:** This audit confirms files in the user's ChatGPT Library and code-level support for the Nexa private corpus. It does not claim these book files are already imported into Nexa's runtime database.
