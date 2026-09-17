# NEXA Medical Cybersecurity and Privacy Baseline

## Security controls
- HTTPS-only redirect at the Worker edge.
- Protected administrative medical-audit endpoints.
- No-store responses for administrative/security operations.
- Hashing of audit inputs, answers, evidence snapshots and reviewer identifiers.
- Source provenance and version tracking.
- Dependency/runtime version control as part of release evidence.

## Required verification evidence
- Threat model and trust-boundary diagram.
- Secure SDLC and code-review records.
- Dependency/SBOM and vulnerability tracking.
- Secrets-management review; secrets must not be committed to Git.
- Authentication/authorization tests, including negative tests.
- API abuse/rate-limit testing.
- Penetration testing and remediation records.
- Logging and incident-response procedures.
- Backup/recovery and disaster-recovery tests.

## Patient-data principles
Minimize collection, avoid retaining unnecessary identifiers in audit records, enforce least privilege, define retention/deletion periods, document lawful basis and consent where applicable, and maintain access/audit logs. Hashing is not a substitute for privacy controls because hashes can still be personal-data-related when linkable to an individual.
