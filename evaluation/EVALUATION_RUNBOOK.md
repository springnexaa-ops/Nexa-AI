# NEXA Evaluation Runbook v0.1

## Minimum evaluation package

Every candidate evaluation should include:
- exact model candidate ID/version
- dataset manifest versions and fingerprints
- evaluation code commit
- configuration
- metric definitions
- aggregate metrics
- failure cases
- safety findings
- privacy findings
- bias/fairness findings where applicable
- regression results
- reviewer status
- evaluation artifact checksum

## Required principle

Never report a metric without its evaluation dataset, split, definition and denominator.

## Medical evaluation

Medical accuracy is not sufficient by itself. Evaluation must also assess unsafe recommendations, unsupported certainty, hallucination, evidence attribution and behavior on out-of-distribution or ambiguous cases.

## Release decision

Pass, conditional, and fail are explicit outcomes. Conditional status requires documented limitations and authorization before any controlled use.
