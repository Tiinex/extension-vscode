# Continuity Context

- Envelope Schema: tiinex.root.v1
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-09 18:11:03
  - Trace: [001-vs-code-handoff-discovery-and-manufacture-minimum.trace.md](../001-vs-code-handoff-discovery-and-manufacture-minimum.trace.md)
  - Origin:
    - [relative](../001-vs-code-handoff-discovery-and-manufacture-minimum.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-09 20:43:44
  - Authors: Anchor
  - Why: Refactor Anchor identified ADS, device-name, trailing-dot/space and case-insensitive aliases as broad-release hardening beyond the trusted Sigma fixture gate.
  - Summary: Track deferred Windows-specific archive path alias hardening for broad release readiness.
  - Status: ready/local

---

# Windows archive path alias hardening

## Objective

Extend VS Code Receive archive preflight so Windows-specific path aliases cannot bypass the existing traversal, absolute-path, symlink and duplicate protections.

## Done Criteria

- Reject ADS/colon path forms that are unsafe on Windows.
- Reject reserved device names.
- Reject trailing dot/space aliases.
- Reject case-insensitive path collisions and equivalent aliases before extraction.
- Preserve current cross-platform valid-carrier behavior and add focused fuzz regressions.

## Scope

`extension-vscode` ZIP ingress/extraction hardening only.

## Dependencies

- Parent VS Code Handoff discovery and manufacture minimum Task.
- Existing archive path validation and exact carrier tests.

## Boundary

Deferred broad-release hardening. No Core/Docs/Business mutation and no change to the five blockers required before Sigma's trusted-fixture test.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-vs-code-handoff-discovery-and-manufacture-minimum.trace.md](../001-vs-code-handoff-discovery-and-manufacture-minimum.trace.md)
  - Value: WrR1L02KLX6Hmie0wz1JokOvZvXxPJ0Rz6kvs-1Wmtc

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: 5bm_HIm-fDsDVdSL_MiCdACwtZNPttDA-_RLL6gHjuQ