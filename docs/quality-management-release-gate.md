# NEXA Medical Quality Release Gate

A medical release is eligible for controlled deployment only when the applicable records are complete:

- [ ] Intended use and claims reviewed.
- [ ] Requirements and acceptance criteria versioned.
- [ ] Software verification completed.
- [ ] Clinical validation completed for claimed clinical functions.
- [ ] Risk-management review completed.
- [ ] Cybersecurity review completed.
- [ ] Privacy/data-governance review completed.
- [ ] Model/provider/evidence versions recorded.
- [ ] Medical audit, evidence snapshot and citation validation tested.
- [ ] Human-review workflow tested.
- [ ] Change-control decision recorded.
- [ ] Rollback/recovery procedure verified.
- [ ] Post-market monitoring owner and escalation path assigned.

## Stop-ship conditions
Examples include unresolved critical security vulnerabilities, broken audit-chain verification, uncontrolled model changes, inability to reproduce the evidence basis of a clinical output, failed mandatory validation criteria, or a material safety issue without an approved mitigation.

This is an engineering quality gate, not a declaration of regulatory approval.
