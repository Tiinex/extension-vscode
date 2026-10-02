# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-21 16:02:00
  - Trace: [extension-host-acceptance.trace.md](../tasks/extension-host-acceptance.trace.md)
  - Origin:
    - [relative](../tasks/extension-host-acceptance.trace.md)
- Current
  - Current Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-21 16:04:00
  - Authors: Fixture
  - Why: Exercise portable Handoff qualification.
  - Summary: Acceptance Route Two.
  - Status: ready/local

---

# Acceptance Route Two

## Handoff Parties

- Purpose: exercise the real VS Code Extension Host two-route operator flow
- From: Anchor
- From Kind: role
- From Reference: [Anchor](extension-host-acceptance::.topics/roles/anchor-role.trace.md)
- To: Kodax
- To Kind: role
- To Reference: [Kodax](extension-host-acceptance::.topics/roles/kodax-role.trace.md)

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
  - Material Reference: [Anchor Role](extension-host-acceptance::.topics/roles/anchor-role.trace.md)
- Loom Role
  - Material: endpoint Role material
  - Purpose: deterministic Extension Host acceptance
  - Availability: available
  - Material Reference: [Loom Role](extension-host-acceptance::.topics/roles/loom-role.trace.md)
- Kodax Role
  - Material: endpoint Role material
  - Purpose: deterministic Extension Host acceptance
  - Availability: available
  - Material Reference: [Kodax Role](extension-host-acceptance::.topics/roles/kodax-role.trace.md)
- Sigma Role
  - Material: explicit participant Role material
  - Purpose: deterministic Extension Host acceptance
  - Availability: available
  - Material Reference: [Sigma Role](extension-host-acceptance::.topics/roles/sigma-role.trace.md)
- Pilot Role
  - Material: explicit participant Role material
  - Purpose: deterministic Extension Host acceptance
  - Availability: available
  - Material Reference: [Pilot Role](extension-host-acceptance::.topics/roles/pilot-role.trace.md)

## Reference Context

- none

## Retained Responsibilities

- acceptance-reconciliation
  - Retained By: Anchor
  - Retained By Reference: [Anchor Role](extension-host-acceptance::.topics/roles/anchor-role.trace.md)
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
- Return To Reference: [Anchor Role](extension-host-acceptance::.topics/roles/anchor-role.trace.md)

## Interpretation Limits

- Does Not Mean: fixture routing grants semantic authority
- Must Not Be Used To Claim: package placement or filenames override Tiinex qualification
- Authority Limits: fixture only

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [extension-host-acceptance.trace.md](../tasks/extension-host-acceptance.trace.md)
  - Value: i_CdKbfDI1nc_0AOwmKs_bHk4oVYJPxcZ7R9hrqBiUY

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: 5iYXSfIKSTuPuw_kFuRfyrQeb7w6vv9mtZJ7cS4Xh_A
