# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.topic.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/topic/tiinex.topic.v1.schema.md)
  - Created At: 2026-09-21 20:51:34
  - Trace: [001-test.trace.md](001-test.trace.md)
  - Origin:
    - [relative](001-test.trace.md)
- Current
  - Current Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-28 11:00:52
  - Summary: Test Handoff 1
  - Status: draft/local

---

# Test Handoff 1

## Handoff Parties

- Purpose: Perform the bounded work described by this Handoff and return the result.
- From: Glimmer
- From Kind: role
- To: Loom
- To Kind: role
- From Reference: [Glimmer](business::.topics/roles/001-5-1-glimmer-canonical-holder-cutover-role.trace.md)
- To Reference: [Loom](business::.topics/roles/001-3-1-loom-canonical-holder-cutover-role.trace.md)

## Transfers

- bounded-work
  - Transfer Kind: work-and-responsibility
  - Description: Perform the bounded work described by this Handoff and return the qualified result.

## Required Context

- none

## Reference Context

- none

## Retained Responsibilities

- none

## Exclusions And Dependencies

- none

## Completion Expectation

- Signal Kind: return
- Signal Meaning: Return the completed result, qualification evidence, and any blockers.
- Return To: Sigma
- Return To Reference: [Sigma](business::.topics/roles/001-4-1-sigma-canonical-holder-cutover-role.trace.md)

## Interpretation Limits

- Does Not Mean: This Handoff does not grant authority beyond the explicit transfer and carried context.
- Must Not Be Used To Claim: Do not infer acceptance, completion, or authority beyond the explicit Handoff content.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-test.trace.md](001-test.trace.md)
  - Value: Yv1vBcPiZEXyMDMLSsxDAFdfw2xOufWl6GgIUxyiN9w

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: tdQnONKdCx975vQWHE-Q_1_Qq4yvQFhVBOS_F6H-7UA