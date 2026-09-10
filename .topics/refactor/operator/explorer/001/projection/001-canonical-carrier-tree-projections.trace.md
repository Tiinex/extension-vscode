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
  - Created At: 2026-09-10 00:05:15
  - Authors: Anchor
  - Why: Sigma requires equivalent actions regardless of tree visualization and a truthful artifact-focused file projection.
  - Summary: Keep Logical/Files and Leaves/Lineage as action-equivalent views over one carrier model.
  - Status: ready/local

---

# Canonical carrier tree projections

## Objective

Keep Logical / Files and Leaves / Lineage as presentation-only projections over one canonical carrier/artifact model so actions remain equivalent in every view.

## Done Criteria

- Discovery, Incoming and Outgoing each retain independent projection and lineage view state.
- File mode exposes only directories needed to reach Tiinex Markdown artifacts; it is not a generic repository file browser.
- Logical mode groups the same indexed artifacts by Tiinex kind.
- Leaves mode hides parent-only lineage artifacts; Lineage mode includes the reachable parent chain represented in the indexed material.
- Package, Workspace and artifact action identity does not change when projection toggles.
- Markdown artifacts open in preview without first materializing them to a repository path.

## Scope

`extension-vscode` TreeView projection helpers, carrier index presentation and regression tests only.

## Dependencies

Parent native carrier tree operator Task and the existing carrier/artifact index model.

## Boundary

Presentation/indexing only. No carrier mutation, landing, encryption, scoped source packaging or new cross-repository semantics.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-native-carrier-tree-operator.trace.md](../../001-native-carrier-tree-operator.trace.md)
  - Value: S0cOLmqgAnRbfOPzsX0MBgnI5i1-keNsrHsa2TgrjBI

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: tka8k-FPAEcQoENWPtsjXZ7lvQnXo5XzRXR-YTux9JI