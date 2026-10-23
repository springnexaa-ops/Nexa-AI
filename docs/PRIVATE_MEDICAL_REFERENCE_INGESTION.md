# Private medical reference ingestion

This procedure imports **locally extracted, rights-cleared text** into the authenticated Nexa private knowledge corpus. It does not upload a PDF, train a model, or mark a source clinically validated.

## Before ingestion

1. Confirm the reference's licence permits the intended use and private indexing. Do not ingest copyrighted textbook content without permission or a valid legal basis.
2. Extract text locally using a PDF text extractor/OCR tool. Preserve page markers such as `[Page 12]`; manually inspect scanned pages, tables, diagrams and OCR errors.
3. Exclude patient-identifiable information, clinical case records and the `MarkPages-5.pdf` example unless separately de-identified and authorized.
4. Review the text for extraction quality and record the original file's SHA-256, title, author, edition, publication year, rights basis and extraction tool/version in your source register.
5. Keep the original PDFs and extracted text in an access-controlled SpringNexa location, never in the public Git repository.

## GitHub website-only environment

The script below **cannot be run from the GitHub file editor**. GitHub's website can store/review code and show Actions results, but it does not execute a local Node.js script just because the script is in the repository.

For a no-terminal workflow:

1. Keep the ingestion code and this guide in the repository; do **not** commit extracted textbook text, PDFs, patient records, or an administrator token.
2. Confirm that Nexa-AI is deployed and obtain its actual HTTPS base URL. `https://ai.springnexa.in` is only an example unless that hostname is confirmed to be your deployed API.
3. A repository administrator must configure the runtime's `ADMIN_TOKEN` securely. Never paste the token into a GitHub issue, commit, workflow log, or chat.
4. The current implementation has an authenticated API endpoint but **does not yet include a browser-based upload screen or a GitHub Actions workflow that accepts private source files**. Therefore a GitHub-website-only user cannot complete ingestion end-to-end with the current UI. The safe next development step is a server-side authenticated admin upload page (or a reviewed, manually triggered workflow that retrieves a rights-cleared file from a private, access-controlled source without logging its contents). Do not solve this by putting the token or textbook text in repository files.
5. Until that interface exists, treat the knowledge-ingestion workflow as prepared but **not executed**.

## Run the ingestion client (terminal-capable environments only)

Requires Node.js 20+ and a valid Nexa administrator token. Do not put the token in the command history or source code; use a secret environment injection mechanism.

```sh
export NEXA_BASE_URL="https://ai.springnexa.in"
# Inject NEXA_ADMIN_TOKEN securely from your secret manager/environment.
node scripts/ingest-private-reference.mjs ./reference-extracted.txt eeg-aes-introductory-atlas 2026-review-1
```

The client prints the text SHA-256, splits extracted text into bounded chunks, and posts batches to `POST /v1/admin/medical/private-knowledge/append`. The endpoint requires the existing administrator bearer token, limits each request, and deduplicates identical chunks by source ID plus SHA-256 of normalized chunk text. Re-running the same source is idempotent; changed chunks are added, not used to erase the existing corpus.

Use a stable source ID per title/edition, e.g. `eeg-aes-introductory-atlas` or `preston-shapiro-emg-ncs-4e`. Use a new version string for a new edition or a corrected extraction.

## Verify before use

1. Check `GET /v1/admin/medical/private-knowledge` for corpus count and update time.
2. Query `GET /v1/admin/medical/private-knowledge/search?q=<specific question>` with an authenticated administrator request.
3. Confirm returned passages match the expected pages and do not contain OCR corruption or patient information.
4. Run a small, documented set of known-answer retrieval tests; record source ID, source SHA-256, version, query, returned chunks/pages, expected result and reviewer.
5. Do not represent the book as active or validated until those checks pass. The current private corpus endpoint tracks chunks and version, but does not yet provide a per-source activation switch or page-level metadata schema. Those remain follow-up work.

## Important implementation boundary

This pipeline is retrieval-based, not model training. It does not install a self-hosted model, move Durable Object storage off Cloudflare, or disable Cloudflare inference. Existing `POST /v1/admin/medical/private-knowledge` is a **replace** operation and can overwrite the entire private corpus; use the new `/append` endpoint for incremental reference imports. Never test ingestion against production with unreviewed content.
