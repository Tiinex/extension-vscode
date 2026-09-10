# Continuity Context

- Envelope Schema: tiinex.root.v1
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-10 00:05:15
  - Trace: [001-discovery-tree-and-folder-gate.trace.md](../001-discovery-tree-and-folder-gate.trace.md)
  - Origin:
    - [relative](../001-discovery-tree-and-folder-gate.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-10 00:05:16
  - Authors: Anchor
  - Why: Sigma wants yes/no/ask automatic Handoff preview for an exact role match while never opening the routing pointer as the operator artifact.
  - Summary: Optionally preview one unambiguous qualified Handoff for the configured operator Role.
  - Status: ready/local

---

# Exact role-matched Incoming Handoff preview

## Objective

Optionally open the actual qualified Handoff artifact for the configured operator Role when Incoming has one unambiguous 1:1 route match.

## Done Criteria

- `tiinex.incoming.autoShowRoleHandoff` supports `yes`, `no` and `ask`.
- Only the Handoff artifact is opened; package pointer artifacts are not opened as the operator document.
- Automatic opening occurs only when exactly one qualified route matches the configured operator role on From or To.
- Zero or multiple matches remain manual.
- Role labels used for authoring choices can fall back to qualified package-carried endpoint Role cache pointers when the owning Role Workspace is not otherwise available.
- When actual Role artifacts are present, only the latest Role iteration per label is shown and it takes precedence over cache fallback.

## Scope

`extension-vscode` Incoming role-matched preview defaults, current-Role presentation/cache resolution and tests only.

## Dependencies

Parent Discovery tree/folder Task, qualified package routes and current Role artifacts or package-carried endpoint Role cache pointers.

## Boundary

Role matching is presentation/defaulting only and does not grant Role authority.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-discovery-tree-and-folder-gate.trace.md](../001-discovery-tree-and-folder-gate.trace.md)
  - Value: NeDQCTF9qBrH4ttsRw2J27wDb_NoUBuemNCAYTDkDjY

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: AHrbdghWvwYcI61IO6hhFhPiebiM5SC6yFPrqmSrfp4