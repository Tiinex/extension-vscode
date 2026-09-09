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
  - Created At: 2026-09-09 21:53:26
  - Authors: Anchor
  - Why: Sigma reproduced a missing dev:setup script from an already-materialized Link task; the handoff review gate must catch task/script drift before return.
  - Summary: Qualify task/script wiring and recover stale dev:setup callers.
  - Status: ready/local

---

# Dev-loop self-review and stale-task compatibility

## Objective

Make the linked main-host development loop fail closed during qualification when VS Code task wiring and `package.json` scripts drift, and keep the previously emitted `dev:setup` task path compatible long enough for Sigma's already-materialized checkout to recover without another manual edit.

## Done Criteria

- `package.json` exposes `dev:setup` as a compatibility alias to the current `dev:link` implementation.
- The canonical **Tiinex: Link this checkout** task remains the direct PowerShell link path; the alias exists only for stale local task compatibility.
- Regression coverage verifies every repository-owned VS Code task that delegates to an npm script names an existing package script, and every repository-owned task file path exists.
- Qualification explicitly checks the built extension entrypoint and the link/registry script contract before a return carrier is manufactured.
- `.vscode/link/` remains the only ignored local link-state directory; `.tiinex-dev/` is not reintroduced.
- No Receive semantics, Handoff semantics, Core/Docs/Business source, or package release version changes.

## Scope

`extension-vscode` development scripts, task wiring tests, README if needed, and repository-local lineage only.

## Dependencies

- Parent ai-provenance main-host link parity Task.
- Sigma's observed failure where an already-materialized Link task invoked `npm run dev:setup` while the script was absent.

## Boundary

Developer-loop robustness only. This does not grant authority to mutate sibling repositories or publish VS Code 0.1.8.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [002-ai-provenance-main-host-link-parity.trace.md](../002-ai-provenance-main-host-link-parity.trace.md)
  - Value: Cmj5acH-8CofSRPjRFeNf5IZtlUWj9CMNlDfLO2BNGo

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: z-1-4kMDKCItAgfZck5Ip0smZASUb4QW5TwnS1fbLsM