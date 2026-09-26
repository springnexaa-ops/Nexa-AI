# NEXA Private Medical Knowledge Boundary

NEXA keeps proprietary clinical reference material outside the public source tree.

## Runtime architecture

```
User
  -> authenticated Nexa API
  -> medical-first gateway
  -> private medical knowledge store (runtime only)
  -> approved public evidence store
  -> model
  -> sanitized user response
```

The public repository contains the retrieval interface and source-neutral clinical protocol only. Private corpus text is stored in the SQLite-backed Durable Object used by the medical evidence layer. Durable Object storage is private to the object and is not directly reachable from the Internet; only Worker code can access it.

The private table is intentionally separate from the approved public evidence tables. Public medical endpoints never return private chunks, private identifiers, or private retrieval metadata.

## Loading private knowledge

The protected admin endpoint is:

`POST /v1/admin/medical/private-knowledge`

It accepts:

```json
{
  "version": "internal-2026-09",
  "chunks": [
    "Private clinical knowledge chunk one.",
    "Private clinical knowledge chunk two."
  ]
}
```

The endpoint replaces the current private corpus with the supplied version and returns only the version, count and update time. It never returns the stored text.

Use the existing `ADMIN_TOKEN` authentication. Do not place private source text in GitHub, frontend JavaScript, public JSON, issue comments, pull requests, CI logs, or source-controlled configuration.

Private retrieval is used only inside the medical-first gateway. The model is instructed to synthesize the material rather than reproduce passages and to keep private provenance invisible to users.

## Operational controls

- Keep the GitHub repository private if the repository itself contains any proprietary implementation or historical material that must not be public.
- Keep the current public branch free of proprietary source text and bibliographic identifiers.
- Rotate the private corpus by version instead of editing it into application source code.
- Do not expose the private knowledge status endpoint to normal users; it is admin-only.
- Public citations must come only from the approved public evidence layer.
- Medical answers remain decision support and require qualified clinician review for patient-specific decisions.
- Before commercial use, review copyright/licensing, data-protection, retention and healthcare regulatory requirements with qualified counsel.

## History caveat

Removing material from the current tree does not erase older Git commits. If proprietary material was previously committed to a public repository, repository visibility/history remediation should be handled separately. GitHub documents that a repository contains its revision history and that changing visibility has consequences; treat previously public commits as potentially recoverable.

## Why this design

Major commercial AI products generally separate private/customer data from publicly visible source material and provide explicit data-handling controls. NEXA follows the same architectural principle: private knowledge is a runtime capability, not public application content.
