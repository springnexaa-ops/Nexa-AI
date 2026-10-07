# NEXA Controlled Release Manifest

A promotion-approved model is not automatically a production release.

## Release inputs

- approved model candidate
- immutable model artifact checksum
- training-run lineage
- evaluation-result lineage
- authorized approval
- deployment target
- release version
- rollback reference

## Release gates

1. Candidate approval is verified.
2. Artifact checksum is verified.
3. Safety, privacy, regression and required expert-review statuses are acceptable.
4. Deployment target is explicitly identified.
5. Previous known-good release is recorded for rollback.
6. Production verification is completed after deployment.

## Rollback

A failed production verification must stop the release and restore the recorded known-good release. Rollback must be attributable to the release manifest and deployment event.

## Boundary

This manifest governs future NEXA proprietary-model releases. It does not silently replace the current Cloudflare Workers AI production runtime.
