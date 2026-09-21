# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-08-23 11:00:00
  - Trace: [Parent](../tasks/extension-host-acceptance.trace.md)
  - Origin:
    - [relative](../tasks/extension-host-acceptance.trace.md)

- Current
  - Current Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-21 16:04:00
  - Authors: Fixture
  - Why: Exercise portable Handoff qualification.
  - Summary: Acceptance Route Two.
  - Status: local

---

# Acceptance Route Two

## Handoff Parties

- Purpose: exercise the real VS Code Extension Host two-route operator flow
- From: Anchor
- From Kind: role
- From Reference: [Anchor](acceptance::.topics/roles/anchor-role.trace.md)
- To: Kodax
- To Kind: role
- To Reference: [Kodax](acceptance::.topics/roles/kodax-role.trace.md)


## Transfers

- fixture-transfer
  - Transfer Kind: work
  - Description: bounded fixture work
  - Boundary: fixture-only

## Required Context

- Anchor Role
  - Material: endpoint Role material
  - Purpose: deterministic Extension Host acceptance
  - Availability: available
  - Material Reference: [Anchor Role](acceptance::.topics/roles/anchor-role.trace.md)
- Loom Role
  - Material: endpoint Role material
  - Purpose: deterministic Extension Host acceptance
  - Availability: available
  - Material Reference: [Loom Role](acceptance::.topics/roles/loom-role.trace.md)
- Kodax Role
  - Material: endpoint Role material
  - Purpose: deterministic Extension Host acceptance
  - Availability: available
  - Material Reference: [Kodax Role](acceptance::.topics/roles/kodax-role.trace.md)
- Sigma Role
  - Material: explicit participant Role material
  - Purpose: deterministic Extension Host acceptance
  - Availability: available
  - Material Reference: [Sigma Role](acceptance::.topics/roles/sigma-role.trace.md)
- Pilot Role
  - Material: explicit participant Role material
  - Purpose: deterministic Extension Host acceptance
  - Availability: available
  - Material Reference: [Pilot Role](acceptance::.topics/roles/pilot-role.trace.md)

## Reference Context

- none

## Retained Responsibilities

- acceptance-reconciliation
  - Retained By: Anchor
  - Responsibility: fixture-only reconciliation
  - Boundary: no external authority

## Exclusions And Dependencies

- no-bypass
  - Kind: excluded-scope
  - Description: direct Core manufacture is fixture setup only and must not substitute for host operator-flow acceptance
  - Responsible Party Or Role: Anchor

## Completion Expectation

- Signal Kind: return
- Signal Meaning: return the bounded fixture result
- Return To: Anchor

## Interpretation Limits

- Does Not Mean: fixture routing grants semantic authority
- Must Not Be Used To Claim: package placement or filenames override Tiinex qualification
- Authority Limits: fixture only

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [Parent](https://github.com/Tiinex/site/blob/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa/.topics/parent.trace.md)
  - Value: gQi_xs6aukJqN4TjAGMb7YaZgkJ7fDlyqk2fvNiMlUw

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:gmuGfgfJ1TanClrK_numzMZDQ_yKFZYgYzh6i8-2FYo
