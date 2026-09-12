# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-12 15:37:00
  - Trace: [001-3-6-4-1-3-1-1-1-2-1-2-2-1-2-kodax-to-anchor-vs-code-major-003-transport-queue-and-qualified.trace.md](001-3-6-4-1-3-1-1-1-2-1-2-2-1-2-kodax-to-anchor-vs-code-major-003-transport-queue-and-qualified.trace.md)
  - Origin:
    - [relative](001-3-6-4-1-3-1-1-1-2-1-2-2-1-2-kodax-to-anchor-vs-code-major-003-transport-queue-and-qualified.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-12 16:21:47
  - Authors: Anchor
  - Why: Sigma reports Merge has never produced a useful merge and repeatedly offers Replace; Major 003 must provide truthful merge/conflict behavior before live acceptance.
  - Summary: Repair Incoming Merge so safe union changes apply and same-path byte divergence becomes an actionable conflict instead of Replace fallback.
  - Status: ready/local

---

# VS Code Major 003 — Incoming Merge Conflict Materialization

## Objective

Make Incoming **Merge** perform a truthful, non-destructive merge workflow instead of falling back to Replace whenever carried and local Workspace bytes differ.

## Done Criteria

- Exact local/Incoming Workspace matches remain a qualified no-op and continue to present as already up to date.
- Invoking Merge is itself the operator's intent to merge; the ordinary path does not open a modal asking the operator to choose Replace instead.
- Incoming-only paths that do not collide with local paths are added without overwriting unrelated local material.
- Local-only paths are preserved by Merge.
- A path that exists on both sides with different bytes is treated as a merge conflict unless shared Core explicitly proves an equivalent exact-byte state; VS Code must not silently choose local, incoming, or Replace.
- Text conflicts become durable, obvious, human-resolvable working-tree conflict material using ordinary text conflict conventions and VS Code-native editing/diff surfaces where possible. The repository remains dirty until the operator resolves the conflict.
- Binary/non-text same-path conflicts fail closed without overwriting either side and present enough source-backed context for the operator to choose a later explicit action.
- Replace remains a distinct explicit action for "Incoming wins completely"; Merge never becomes an alias for Replace.
- No JSON sidecar, opaque host manifest, or VS Code-private semantic artifact is introduced to represent merge truth.
- Post-merge Git automation does not auto-commit while unresolved conflicts exist; existing staged-validation safety remains authoritative.
- Focused regression coverage proves exact-match no-op, incoming-only addition, local-only preservation, text conflict materialization, binary fail-closed behavior, and no Replace fallback.

## Scope

Extension VS Code Incoming Merge UX and host-side application mechanics only. Reuse shared Core comparison/reconciliation information where it already owns byte-state truth, but do not add new Core semantics in this tranche.

## Dependencies

- Current accepted VS Code Transport return and prior Incoming/Replace implementation.
- Current Core source-frontier/reconciliation contracts as read-only shared authority.
- Existing Git Operator conflict/staged-validation protections.

## Exclusions

- No Transport redesign.
- No Artifact/Handoff authoring discoverability work.
- No release or Marketplace publication.
- No automatic semantic merge of Tiinex artifacts beyond ordinary byte/text conflict handling.
- No silent file deletion merely because a path is absent from Incoming.

## Acceptance Boundary

Machine tests prove host mechanics only. Sigma retains live Windows acceptance of Merge ergonomics, conflict readability, and interaction with the existing Git workflow.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-3-6-4-1-3-1-1-1-2-1-2-2-1-2-kodax-to-anchor-vs-code-major-003-transport-queue-and-qualified.trace.md](001-3-6-4-1-3-1-1-1-2-1-2-2-1-2-kodax-to-anchor-vs-code-major-003-transport-queue-and-qualified.trace.md)
  - Value: 2GE1cCx-haAO5gXkAMdTriYbuGq9rX_W99u7iUpbkVA

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: SKl7LaVGve4az4QkWIpyrya6sUQ34y2xdabfxyR1aZQ