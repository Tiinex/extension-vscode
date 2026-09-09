# Continuity Context

- Envelope Schema: tiinex.root.v1
- Parent
  - Parent Schema: [tiinex.topic.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/topic/tiinex.topic.v1.schema.md)
  - Created At: 2026-09-09 16:47:25
  - Trace: [001-portable-tiinex-runtime.trace.md](../../../business::.topics/initiatives/refactor/runtime/001-portable-tiinex-runtime.trace.md)
  - Origin:
    - [relative](../../../business::.topics/initiatives/refactor/runtime/001-portable-tiinex-runtime.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-09 16:51:18
  - Authors: Anchor
  - Why: Preserve one portable runtime while making VS Code a first-class host for it.
  - Summary: Thin VS Code bridge to shared runtime-native rather than an editor-specific runtime.
  - Status: ready/local

---

# VS Code native-chat runtime bridge

## Objective
Investigate and later implement a thin bridge that lets VS Code-hosted/native chat invoke the shared `runtime-native` engine rather than creating a VS Code-specific runtime.

## Scope
Runtime hosting/invocation, capability projection, operator context and native-chat bridge boundaries.

## Dependencies
Controlling Business Portable Tiinex Runtime frontier; Runtime Native public contract; Extension VS Code host APIs.

## Done Criteria
The bridge can invoke the same portable runtime used by other hosts and contains no duplicated runtime semantics.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-portable-tiinex-runtime.trace.md](../../../business::.topics/initiatives/refactor/runtime/001-portable-tiinex-runtime.trace.md)
  - Value: J4YII_DXdQ1anoBAkyui3bUot3tX6ClP5IFJVtBxILY

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: 2HHCt9ZqS-Vs4r7dTWqecGu3vO0-Ow2XcIOH0dxlmNw