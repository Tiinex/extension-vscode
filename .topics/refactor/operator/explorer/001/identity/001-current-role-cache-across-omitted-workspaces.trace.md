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
  - Created At: 2026-09-10 01:57:41
  - Authors: Anchor
  - Why: Sigma needs Role choices even when the Role-owning Workspace is omitted, without showing historical iterations.
  - Summary: Resolve only current Roles through qualified local/carrier cache material, including participants.
  - Status: ready/local

---

# Current Role identity cache across omitted Workspaces

## Objective

Resolve From/To/participant Role choices correctly even when the Role-owning Workspace is not included as source in the current carrier, without showing superseded Role iterations or inventing authority.

## Done Criteria

- Prefer current Role artifacts from qualified open/local Workspaces when available.
- When a Role-owning Workspace is absent, reuse only qualified carrier-cached endpoint/identity material already supported by Tiinex Tooling/carrier representation.
- Investigate and document the existing Tooling/cache contract before adding any VS Code-private cache format.
- For a logical Role label with multiple lineage iterations, present only the latest qualified/current Role artifact, not historical predecessors.
- From defaults to configured `tiinex.operator.role` only when resolvable; otherwise use None/Unknown according to the schema/tooling contract rather than fabricating a reference.
- To may prefer the Incoming From Role when unambiguous, but remains explicitly selectable.
- Additional participants remain supported separately from exactly one From and exactly one To and do not gain endpoint authority.
- Handoff Markdown can be prepared in scratch/virtual preview and inspected before any artifact is written to repository disk.

## Dependencies

Parent native carrier-tree operator Task, qualified carrier endpoint cache material, current local Workspace artifacts, and public shared Tiinex identity/Handoff Tooling.

## Scope

`extension-vscode` endpoint catalog presentation and Tooling integration research/tests only.

## Boundary

Do not redefine Role cache, pointer or identity semantics owned by shared Tooling/Core. If the current public surface is insufficient, record the blocker for the owning Anchor instead of creating a private cross-repository contract.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-native-carrier-tree-operator.trace.md](../../001-native-carrier-tree-operator.trace.md)
  - Value: S0cOLmqgAnRbfOPzsX0MBgnI5i1-keNsrHsa2TgrjBI

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: SCHudYgPSg0WSAH4iNg2Uz8JjF2nGtKwSzSF0bTY-6A