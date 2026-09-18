# NEXA AI Android Security & Regulatory Readiness

Version: 1.2.0
Date: 2026-09-18

## Scope

This document records technical controls implemented in the Android client and the server interfaces it uses. It is a readiness checklist, not a legal certification.

## India privacy and cyber baseline

- Digital Personal Data Protection Act, 2023: lawful/purpose-limited processing, data minimisation, reasonable security safeguards, breach response, erasure/withdrawal mechanisms, rights and grievance handling.
- DPDP Rules, 2025: standalone notice, consent/withdrawal mechanisms, access control, encryption/obfuscation/masking/tokenisation where appropriate, access visibility/logging/monitoring, backups, security-event retention, processor safeguards, and breach notification processes.
- CERT-In Directions under section 70B: incident response/reporting, secure ICT logging and preservation requirements applicable to the organisation.
- ABDM Health Data Management Policy: security/privacy by design, consent-controlled health-data exchange, auditability and need-to-know access where the product participates in ABDM.
- Where the product is used as a regulated medical device/software medical device, separate medical-device regulatory assessment is required. This Android client does not itself establish CDSCO/medical-device compliance.

## Android controls

- HTTPS/TLS-only network policy; cleartext HTTP disabled.
- No hard-coded API secrets in the APK.
- Session tokens encrypted using Android Keystore AES-GCM.
- Sensitive-screen capture protection enabled by default; user can explicitly disable it for testing.
- Android backup/cloud-transfer exclusion for security preferences and session material.
- Native account login/registration instead of embedding the website as the primary UI.
- Explicit privacy notice before use.
- Native Security & Privacy Center.
- Consent grant/withdrawal event API for authenticated users.
- Data-subject request API for access, correction, erasure, portability and grievance requests.
- Biometric/device-lock option for authenticated sessions on supported Android versions.
- Logout revokes the server session and clears the local encrypted token.
- Medical mode includes safety/decision-support boundaries.

## Server-side scrutiny controls

- Authenticated API routes validate bearer sessions server-side.
- Privacy consent events are stored server-side.
- Privacy requests are stored server-side with status and timestamps.
- Security events are stored server-side for administrative review.
- Admin-only privacy-request and security-event views are exposed through authenticated admin routes.
- Existing medical evidence/audit controls remain in the NEXA backend.

## Required organisational controls before production/legal claims

1. Appoint responsible privacy/security owners and publish their contact mechanism.
2. Maintain a current privacy notice, retention schedule and processor/subprocessor register.
3. Complete a documented data-flow map and DPIA/risk assessment appropriate to the processing.
4. Establish breach triage, evidence preservation, user notification and regulator/CERT-In reporting procedures.
5. Execute appropriate data-processing/security clauses with cloud and AI providers.
6. Establish vulnerability management, dependency scanning, code review and periodic penetration testing.
7. For ABDM integration, complete applicable sandbox/security audit and integration requirements before production exchange of health data.
8. For a Significant Data Fiduciary, implement the additional statutory governance, audit and impact-assessment requirements that apply to that designation.
9. For any medical-device claim, perform the applicable regulatory classification and conformity assessment separately.
10. Use a dedicated protected production signing keystore; the current CI APK uses the Android SDK debug signing key solely for testing.

## Release gate

The APK should not be marketed as legally compliant solely because these technical controls exist. Compliance is an organisation-level determination covering the app, backend, infrastructure, processors, policies, contracts, operational processes and the actual use case.
