# Continuity Context

- Envelope Schema: tiinex.root.v1
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-09 21:39:08
  - Trace: [002-ai-provenance-main-host-link-parity.trace.md](../002-ai-provenance-main-host-link-parity.trace.md)
  - Origin:
    - [relative](../002-ai-provenance-main-host-link-parity.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-10 00:05:19
  - Authors: Anchor
  - Why: Sigma confirmed the linked main-host loop and requested a dependency-install prechain so replaced checkouts cannot silently omit dependencies.
  - Summary: Default build performs npm install, main-host link, then compilation in sequence.
  - Status: ready/local

---

# Build link install developer chain

## Objective

Make the default local build path safe after a replaced checkout by chaining dependency installation and main-host extension linking before compilation.

## Done Criteria

- The default Build task depends in sequence on Link.
- Link depends in sequence on `npm install`.
- One `Ctrl+Shift+B` therefore performs install → link → build.
- Existing unlink behavior and `.vscode/link/` local-state placement remain unchanged.
- Task/script self-review verifies all referenced npm scripts and PowerShell task files exist.

## Scope

`extension-vscode` repository-local `.vscode/tasks.json`, development-link scripts/tests and README only.

## Dependencies

Parent ai-provenance main-host link parity Task and the existing linked main-host developer loop.

## Boundary

Developer-loop convenience only; no production extension semantics or release version change.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [002-ai-provenance-main-host-link-parity.trace.md](../002-ai-provenance-main-host-link-parity.trace.md)
  - Value: Cmj5acH-8CofSRPjRFeNf5IZtlUWj9CMNlDfLO2BNGo

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: yWnxDKpMgvL-K1VdXOtJd2ndBptv4HN-PA49X9MGoFQ