# Continuity Context

- Envelope Schema: tiinex.root.v1
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-09 23:35:17
  - Trace: [001-native-carrier-tree-operator.trace.md](../../001-native-carrier-tree-operator.trace.md)
  - Origin:
    - [relative](../../001-native-carrier-tree-operator.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-10 00:05:18
  - Authors: Anchor
  - Why: Sigma requires Outgoing to be live selection rather than staging, with deterministic alphabetical Workspace sibling ordering.
  - Summary: Blank or From-Incoming package context over live alphabetically ordered Workspaces.
  - Status: ready/local

---

# Live Outgoing context

## Objective

Make Outgoing a live package-selection context rather than a snapshot/staging area.

## Done Criteria

- `New` offers `Blank` and `From Incoming`.
- Blank starts without an Incoming carrier parent.
- From Incoming mirrors the carried Workspace set and binds the Incoming carrier as package parent.
- Adding a local Workspace retains its live repository root; later repository edits remain eligible for the eventual package build.
- Outgoing Workspace siblings are always presented and selected in case-insensitive alphabetical Workspace-id order.
- The Outgoing friendly name is operator-chosen with a parent-folder-derived prefix suggestion.

## Scope

`extension-vscode` in-memory Outgoing context, live Workspace selection/order and tests only.

## Dependencies

Parent native carrier tree operator Task and existing package-builder Workspace source projection.

## Boundary

No per-file source scoping, source-ZIP exclusion, bootstrap exclusion or encryption is frozen in this Task; those remain future package-surface work.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-native-carrier-tree-operator.trace.md](../../001-native-carrier-tree-operator.trace.md)
  - Value: S0cOLmqgAnRbfOPzsX0MBgnI5i1-keNsrHsa2TgrjBI

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: eYrk3i4MIAvJqwP2pQdyY_SupL_TElaBGoKc_ejGgd0