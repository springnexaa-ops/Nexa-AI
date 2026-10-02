# NEXA-AI Security Management Plan

## Security management principles
NEXA security is managed as a continuous control system rather than a one-time scan.

### Access control
- Unique named accounts.
- Least privilege.
- Administrative access protected by MFA at the identity/provider layer.
- Temporary/test accounts have defined expiry.
- Administrative credentials are never committed to Git.
- Session revocation is mandatory after account deactivation or privileged changes.

### Authentication protection
- Minimum 10-character application passwords.
- PBKDF2-SHA-256 password hashing with per-password random salts.
- Durable login/API rate limiting.
- Generic failed-login responses.
- 24-hour application sessions with server-side revocation.

### Application/API security
- Same-origin CORS policy; wildcard origin is prohibited.
- HTTPS-only production traffic.
- HSTS.
- CSP, clickjacking, MIME-sniffing, referrer and permissions controls.
- Sensitive API responses are non-cacheable.
- Administrative routes require authorization.
- Input and output length limits are enforced.

### Medical-data security
- Medical evidence is separated into public and private stores.
- Private corpus content is never returned as user-facing source text.
- Evidence snapshots and hashes provide provenance.
- Clinical answers require qualified professional review.
- Patient-specific findings must originate from supplied patient data.

### Upload security
- Upload endpoints require authentication.
- File sizes are bounded.
- Only business-required formats are accepted.
- Uploaded content must be treated as untrusted.
- Parser failures fail closed.

### AI security
- Cloudflare Workers AI is the only configured inference provider.
- Legacy provider references are CI-blocked.
- Medical prompts are evidence-grounded.
- Private retrieval metadata is not disclosed.
- Prompt-injection and data-exfiltration testing is required before production certification.

### Monitoring and response
Security events, authentication failures, administrative actions and privacy requests must be retained according to the approved production retention schedule. Incidents require triage, containment, eradication, recovery and documented post-incident review.

### Required governance evidence
Maintain:
1. Asset inventory.
2. Data-flow/data-classification record.
3. Access review.
4. Risk register.
5. DPIA/risk assessment where applicable.
6. Incident-response plan.
7. Vulnerability-management register.
8. Backup/recovery evidence.
9. Vendor/subprocessor review.
10. Penetration-test report and retest.
11. Production configuration evidence.
12. Change-management records.

This document describes engineering controls and management requirements. It is not a legal certification or a declaration of statutory compliance.
