# Continuity Context

- Envelope Schema: tiinex.root.v1
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-09 15:01:37
  - Trace: [001-turn-2-vs-code-integration-and-operator-frontier.trace.md](../001-turn-2-vs-code-integration-and-operator-frontier.trace.md)
  - Origin:
    - [relative](../001-turn-2-vs-code-integration-and-operator-frontier.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-09 15:02:18
  - Authors: Anchor
  - Why: Separate technical qualification from product/release authority while keeping the operator path shippable.
  - Summary: Qualify the integrated VS Code package without authorizing 0.1.8 publication.
  - Status: ready/local

---

# VS Code package and release qualification

## Objective

Prove the integrated VSIX/package/operator path against actual Turn-2 dependencies without converting the preparatory 0.1.7 evidence into release authority.

## Done Criteria

- Normal package/build/test flow passes against real dependency packages or exact declared blockers are recorded.
- Candidate VSIX is deterministic enough for release review and contains no stale copied shared source.
- Marketplace publication remains blocked until the final Turn-2 release gate explicitly permits it.

## Scope

Technical release qualification only; no publication action in this subtask.

## Dependencies

- Parent VS Code Turn-2 task.
- VS Code current-frontier integration subtask.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-turn-2-vs-code-integration-and-operator-frontier.trace.md](../001-turn-2-vs-code-integration-and-operator-frontier.trace.md)
  - Value: wz5I2dE4nCCjlh-4ldRwx28Nb-8xYCeVXnSprBYpH-U

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: 8Y4Q_vFZP87fO0j9CrLzF96emr5ILgBZzd-Sr548Z4g