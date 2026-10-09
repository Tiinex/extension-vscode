# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-10-07 19:53:23
  - Trace: [001-vs-code-readme-and-documentation-consolidation.trace.md](001-vs-code-readme-and-documentation-consolidation.trace.md)
  - Origin:
    - [relative](001-vs-code-readme-and-documentation-consolidation.trace.md)
- Current
  - Current Schema: [tiinex.evidence.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/core/evidence/tiinex.evidence.v1.schema.md)
  - Created At: 2026-10-08 23:47:54
  - Authors: Anchor
  - Why: Remove a verified host task metadata/source-test inconsistency without expanding the Evidence or Process scope.
  - Summary: Local linked-extension build shortcut now matches its source-owned optional Build task contract while the original default build stays unchanged.
  - Status: ready/local

---

# Local VS Code Build Task Currentness Reconciliation

## Supported Claim Or Question

- Supported Claim Or Question: Did the Windows Local build shortcut advertise itself as the default Test rather than an optional Build, contradicting the existing source-owned local/latest task test?
- Evidence Role: exact VS Code task configuration/currentness correction, not proof that a full npm or Windows extension build executed successfully.
- Review Context: earlier independent audit flagged VS Code Local task and source-test drift as a smaller but durable verification debt during the ongoing Sigma readiness work.

## Provenance

- Known Source: `.vscode/tasks.json` and `test/run.mjs` in the qualified VS Code Workspace, using the carried task labels and package scripts.
- Preservation Basis: the exact updated VS Code source plus this Evidence in the next canonical Tiinex Handoff Package.
- Provenance Limits: VS Code dependencies are not installed in this environment, so the whole TypeScript extension cannot be built here; a task configuration check is not build acceptance.

## Evidence Material

- Material Kind: exact host build-task metadata and static release audit.
- Material: The existing task `Tiinex: Build linked extension` remains default Build (`dev:build`); `Tiinex: Build linked extension (Local)` now advertises `group.kind = build` and `isDefault = false` with `dev:build:local`; `Tiinex: Build linked extension (Latest)` remains non-default Build. This matches the source-owned regression that distinguishes all three shortcuts rather than advertising Local as the default Test. The repository's release audit returned `status: ready`, with zero warnings/errors. No other task scripts or defaults were altered.
- Description: Local task metadata is a VS Code host concern. It does not change Native/Core creation authority, the schema-backed Evidence representation, GitHub publication, or Handoff transport semantics.

## Preservation And Fidelity

- Preservation State: one bounded `.vscode/tasks.json` update and the existing unchanged task regression source.
- Fidelity Notes: no npm install or remote mutation was attempted as part of the reconciliation.
- Known Losses: no full VS Code build or Windows execution result, and Native's older 6/7 Process topology inconsistency remains separate.

## Interpretation Limits

- Not Yet Used As: Windows Build PASS, Marketplace readiness or completion of Evidence repeatability.
- Does Not Prove: that Node dependency installation now works or that the extension loads in VS Code on Windows.
- Must Not Be Treated As: authorization to treat an unrelated schema/Process test failure as resolved.
- Need For Review: next available full dependency-backed VS Code test/build should consume these matching task definitions before the complete Sigma gate.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-vs-code-readme-and-documentation-consolidation.trace.md](001-vs-code-readme-and-documentation-consolidation.trace.md)
  - Value: P9l0JbWGxC5NqesjDRJwSr-zcOGkm_B44j4pS9wffdI

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: MtRXCAPOjp7_AacQElIUx6F0pMZNMU_IUNc6ZOxVtTQ