# Continuity Context

- Envelope Schema: tiinex.root.v1
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-10 00:05:15
  - Trace: [001-canonical-carrier-tree-projections.trace.md](001-canonical-carrier-tree-projections.trace.md)
  - Origin:
    - [relative](001-canonical-carrier-tree-projections.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-10 01:57:37
  - Authors: Anchor
  - Why: Sigma's silent video showed that Leaves/Lineage state was unclear and some actions were ambiguous or duplicated.
  - Summary: Fix Sigma video projection/action usability regressions without changing carrier semantics.
  - Status: ready/local

---

# Truth-first tree modes and conditional actions

## Objective

Correct the native carrier tree UX after Sigma's video review so the truthful carrier representation is immediately understandable and every action behaves equivalently across projections.

## Done Criteria

- Files + Lineage is the initial truth-oriented presentation unless an explicit persisted user preference already exists.
- Files mode mirrors carrier artifact filenames/directory ancestry closely enough to resemble the actual package representation while still hiding non-Tiinex/non-Markdown noise.
- Logical mode remains a simplified projection over the same canonical nodes; it must not become the only understandable view.
- Leaves/Lineage visibly changes the projected node set; the active mode is discoverable from icon/tooltip/state and is regression-tested.
- The same canonical action ids and targets work in Logical/Files and Leaves/Lineage.
- Title/item actions are conditional: actions that cannot operate in current state are hidden rather than shown disabled or mapped to another action.
- No two visible actions accidentally execute the same semantic operation unless they are explicit aliases.

## Evidence / Trigger

Sigma's silent video showed ambiguous projection toggles, Leaves appearing to do nothing, and some visible actions behaving like other actions. Treat this as a usability regression rather than polish.

## Dependencies

Parent canonical carrier tree projections Task and the current native carrier-tree operator implementation.

## Scope

`extension-vscode` native TreeView projection, contexts/menus, tests and documentation only.

## Boundary

Presentation does not change carrier semantics, landing authority, Handoff schema, or package manufacture contracts.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-canonical-carrier-tree-projections.trace.md](001-canonical-carrier-tree-projections.trace.md)
  - Value: tka8k-FPAEcQoENWPtsjXZ7lvQnXo5XzRXR-YTux9JI

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: aUnfT61_-1SNQYAnIfgrXBRWqJasyI8n4Vgj-6p2QIw