# NEXA Evaluation Result Recording

Every completed research run must produce a structured evaluation result before model-candidate promotion.

## Required linkage
- Evaluation ID
- Training run ID
- Model ID and version
- Dataset versions used for evaluation
- Metric name, value, definition, and denominator
- Safety, privacy, regression, bias, and expert-review status
- Artifact SHA-256 when an artifact exists

## Gate semantics
Any safety, privacy, or regression status of fail blocks promotion. Conditional requires documented review and an explicit authorized decision. not_evaluated is never equivalent to pass.

## Integrity
Evaluation results reference immutable training lineage. Re-running an evaluation creates a new evaluation ID; historical results are not overwritten.

## Medical evaluation rule
Metrics must identify the evaluated dataset/split and denominator. Clinical claims require evidence attribution, uncertainty handling, and review of unsafe recommendations, hallucinations, unsupported certainty, and out-of-distribution cases.