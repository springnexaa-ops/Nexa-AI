# NEXA-AI Security & Compliance Control Matrix

NEXA-AI is a Cloudflare Workers application processing potentially sensitive medical and personal data. This document records implemented technical controls and identifies controls that require operational/legal completion.

## Implemented technical controls

| Control | Status | Implementation |
|---|---|---|
| HTTPS redirect | Implemented | Worker redirects HTTP requests to HTTPS |
| HSTS | Implemented | Strict-Transport-Security with one-year max-age and subdomains |
| CSP | Implemented | Default-deny browser policy with frame-ancestors none and object-src none |
| MIME sniffing protection | Implemented | X-Content-Type-Options nosniff |
| Clickjacking protection | Implemented | X-Frame-Options DENY plus CSP frame-ancestors |
| Referrer control | Implemented | Referrer-Policy no-referrer |
| Browser feature restriction | Implemented | Permissions-Policy |
| Cross-origin isolation | Implemented | COOP and CORP headers |
| Search indexing restriction | Implemented | X-Robots-Tag noindex/noarchive/nosnippet |
| API cache protection | Implemented | Sensitive JSON responses use no-store |
| CORS | Hardened | Wildcard Access-Control-Allow-Origin removed |
| Cloudflare-only AI runtime | Enforced | CI rejects AWS Bedrock, DxGPT and other external inference markers |
| Password hashing | Implemented | PBKDF2-SHA-256 with per-password salt |
| Session expiry | Implemented | 24-hour server-side sessions with Durable Object storage |
| Session revocation | Implemented | Logout and user changes revoke sessions |
| Admin authorization | Implemented | Protected admin routes require server-side admin token |
| Medical evidence provenance | Implemented | Evidence IDs, versions, snapshots and audit hashes |
| Medical citation validation | Implemented | Citation/evidence validation in the medical evidence layer |
| Audit chain | Implemented | Tamper-evident hash chain for medical audits |
| Private/public knowledge separation | Implemented | Private medical corpus is not exposed as a user-facing source |
| Privacy consent records | Implemented | Consent grant/withdrawal events are persisted |
| Privacy requests | Implemented | Access, correction, erasure, grievance and portability requests |
| Secret scanning | CI | Gitleaks |
| Vulnerability/misconfiguration scanning | CI | Trivy |
| Dependency review | CI | GitHub dependency-review-action |
| Cloudflare deployment validation | CI | Wrangler dry-run production gate |

## Controls not automatically satisfied by application code

### MFA
MFA is not currently demonstrated as enforced for every privileged/admin account. This remains a required hardening item before claiming high-assurance authentication.

### Retention and deletion
The application records erasure requests, but a legal retention schedule, automated deletion workflow, backup expiry policy, and processor deletion verification must be defined and operated.

### Breach response
Technical logging exists, but an organisational incident-response plan, escalation matrix, evidence-preservation procedure, and regulatory notification workflow must be maintained.

### DPIA / risk assessment
A formal data-protection impact/risk assessment is an organisational deliverable and cannot be created merely by HTTP headers.

### Contracts and processors
Cloudflare account configuration, data-processing terms, subprocessors, data-location choices, access controls, and contractual obligations must be reviewed separately.

### Independent security validation
Automated CI scanning is not equivalent to an independent penetration test or formal ASVS assessment.

## Compliance position

The repository contains technical controls supporting DPDP-oriented security and data-principal workflows. It must not be represented as legally certified or fully compliant solely because these controls exist. Final compliance depends on deployment configuration, contracts, notices, retention, governance, incident response, personnel/process controls, and applicable law.

## Security benchmark

Use OWASP ASVS 5.0 as the engineering verification baseline. High-assurance medical deployment should additionally undergo independent security testing before production use for sensitive clinical workloads.
