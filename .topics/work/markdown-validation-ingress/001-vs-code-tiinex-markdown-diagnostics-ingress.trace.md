# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-10-05 23:10:29
  - Authors: Anchor; Sigma
  - Why: Real cold-test transport.md received a false Tiinex lineage warning and unnecessarily entered shared validation.
  - Summary: Skip Tiinex diagnostics/runtime work for ordinary Markdown before shared Core validation.
  - Status: ready/local

---

# VS Code Tiinex Markdown Diagnostics Ingress

## Objective

Prevent VS Code diagnostics from starting shared Tiinex runtime/validation work for ordinary Markdown documents that do not declare the Tiinex continuity envelope on the first line.

## Done Criteria

- `.md`/`.markdown` eligibility requires first-line `# Continuity Context`
- ordinary Markdown clears/hides Tiinex diagnostics and status without preparing the Core runtime
- an editor that changes from Tiinex to ordinary Markdown clears stale Tiinex diagnostics immediately
- an editor that changes from ordinary Markdown to the Tiinex envelope becomes eligible and validates normally
- Quick Fixes remain unavailable for non-Tiinex Markdown
- VS Code bridge regression passes with a source-backed ingress assertion

## Scope

- VS Code diagnostics presentation/ingress only
- Core remains the validation authority after ingress
- no provider-specific semantics, schema changes, release, or remote mutation

## Dependencies

- Core first-line Tiinex ingress contract: `# Continuity Context`
- shared host runtime/editor-assistance boundary remains unchanged for eligible Tiinex documents

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: qaiI3Hrkx2q_r8SV1OILGu83J9TK_962WiI4cQk8o-Q