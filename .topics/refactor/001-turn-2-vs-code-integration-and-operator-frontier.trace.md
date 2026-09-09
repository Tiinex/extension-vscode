# Continuity Context

- Envelope Schema: tiinex.root.v1
- Parent
  - Parent Schema: [tiinex.topic.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/topic/tiinex.topic.v1.schema.md)
  - Created At: 2026-09-09 14:17:46
  - Trace: [001-turn-2-stable-full-source-frontier.trace.md](../../business::.topics/initiatives/refactor/001-turn-2-stable-full-source-frontier.trace.md)
  - Origin:
    - [relative](../../business::.topics/initiatives/refactor/001-turn-2-stable-full-source-frontier.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-09 15:01:37
  - Authors: Anchor
  - Why: VS Code is the highest-priority host lane and needs a repo-owned work lineage instead of Business-local implementation tasks.
  - Summary: Integrate the current VS Code candidate against the stable Turn-2 public boundaries.
  - Status: ready/local

---

# Turn 2 VS Code integration and operator frontier

## Objective

Integrate the returned VS Code 0.1.7 source against the current Turn-2 Core/App/provider/Verse boundaries while preserving Receive → Review → Return as the primary operator flow.

## Done Criteria

- Returned VS Code source is reconciled against current shared package contracts rather than its carried older sibling snapshots.
- Editor-host helpers remain host-owned unless a demonstrably shared capability belongs in Core.
- Workspace/Handoff authoring and operator flows consume public package surfaces and fail closed on missing qualification.
- A candidate VSIX is technically qualified, but 0.1.8 publication remains a separate release gate.

## Scope

VS Code host implementation and operator experience only. No Docs semantic changes and no authority to freeze CLI/Interop/provider contracts from the editor lane.

## Dependencies

- Controlling Business epic is the declared Parent.
- Latest returned VS Code Workspace candidate from the preparatory parity lane.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-turn-2-stable-full-source-frontier.trace.md](../../business::.topics/initiatives/refactor/001-turn-2-stable-full-source-frontier.trace.md)
  - Value: J7eMDpiRtxZpCqeB-lUxH-EtODAqs4XIYFcndqClJnI

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: wz5I2dE4nCCjlh-4ldRwx28Nb-8xYCeVXnSprBYpH-U