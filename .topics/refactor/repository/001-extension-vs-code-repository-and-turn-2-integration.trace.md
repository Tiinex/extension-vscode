# Continuity Context

- Envelope Schema: tiinex.root.v1
- Parent
  - Parent Schema: [tiinex.topic.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/topic/tiinex.topic.v1.schema.md)
  - Created At: 2026-09-09 16:47:23
  - Trace: [001-extension-repository-frontier.trace.md](../../../business::.topics/initiatives/refactor/extensions/001-extension-repository-frontier.trace.md)
  - Origin:
    - [relative](../../../business::.topics/initiatives/refactor/extensions/001-extension-repository-frontier.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-09 16:50:30
  - Authors: Anchor
  - Why: Give the renamed extension repository a current repo-owned executable lineage tied to the controlling Business extension frontier.
  - Summary: Reconcile the renamed VS Code extension host against the current Refactor frontier without conflating repository and VSIX identity.
  - Status: ready/local

---

# Extension VS Code repository and Turn-2 integration

## Objective

Reconcile the renamed `Tiinex/extension-vscode` repository against the current Refactor frontier while preserving VSIX/product identity independently from repository identity.

## Scope

- current Workspace/repository identity and rename continuity
- public Core/App/Interop/Runtime consumption only through qualified boundaries
- Receive → Review → Return operator flow qualification
- package/VSIX and eventual Marketplace readiness after Turn-2 integration
- future native-chat runtime bridge as a separate subtask/frontier

## Done Criteria

- no stale repository-source assumption treats `Tiinex/vscode` as current
- current source consumes qualified public dependencies
- VSIX qualification is explicit and does not imply release
- any runtime/native-chat bridge remains a thin host bridge rather than a VS Code-specific runtime

## Dependencies

- Controlling Business extension frontier.
- Current public Core/App/Interop/Runtime contracts as they become qualified.
- Existing VS Code return source and release/marketplace constraints.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-extension-repository-frontier.trace.md](../../../business::.topics/initiatives/refactor/extensions/001-extension-repository-frontier.trace.md)
  - Value: aLvz6PeBPza3P9sjr3c4OmNe878LlAAFAQTjmm402uQ

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: PT_8EO10NGb4_LT7ebhyum_AxUFoxsClY4WqvPSiCHY