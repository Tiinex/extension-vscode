# Continuity Context

- Envelope Schema: tiinex.root.v1
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-10 00:05:19
  - Trace: [002-carrier-parent-and-package-routing.trace.md](../002-carrier-parent-and-package-routing.trace.md)
  - Origin:
    - [relative](../002-carrier-parent-and-package-routing.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-10 00:08:30
  - Authors: Anchor
  - Why: Sigma wants the future ability to omit `.workspace.zip` and later scope selected Workspace source files.
  - Summary: Defer descriptor-only and narrower Workspace source carriage until shared Tooling defines it.
  - Status: ready/local

---

# Optional Workspace source carriage and bounded file scope

## Objective

Prepare a future Outgoing control that can carry Workspace metadata without necessarily carrying the complete `.workspace.zip`, and later narrow carried source to an explicitly supported bounded file scope.

## Done Criteria

- A future Workspace-level control can distinguish Workspace descriptor carriage from Workspace source archive carriage when shared Tooling exposes a qualified contract for that representation.
- Complete source remains the default until a narrower qualified profile exists.
- Future file selection is explicit, reviewable and Tooling-qualified rather than inferred by the VS Code tree.
- UI state never pretends that omitted source is equivalent to a complete Workspace snapshot.

## Scope

Future `extension-vscode` Outgoing presentation/bridge only after shared package profile support exists.

## Dependencies

Parent Outgoing carrier-parent/package-routing Task and a future shared Tooling contract for descriptor-only or bounded Workspace source carriage.

## Boundary

No speculative package flags or private archive rewriting are implemented in the current tree milestone.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [002-carrier-parent-and-package-routing.trace.md](../002-carrier-parent-and-package-routing.trace.md)
  - Value: WIgnSCew-93wHnvHlpdq7eW75D4XImDJkb15-vHJT8I

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: 93Zlr4Jhz-mGqcx2_VgEcyEO9BdAk0mOlU6tK6J3XZo