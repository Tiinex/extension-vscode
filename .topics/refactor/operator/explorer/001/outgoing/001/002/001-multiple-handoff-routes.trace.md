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
  - Created At: 2026-09-10 00:08:29
  - Authors: Anchor
  - Why: Sigma wants one or more Handoff pointers per Outgoing package without turning pointer Markdown into a manual authoring surface.
  - Summary: One Outgoing carrier can later advertise multiple explicit Tooling-manufactured Handoff routes.
  - Status: ready/local

---

# Multiple Handoff routes in one Outgoing carrier

## Objective

Allow one Outgoing carrier to advertise one or more explicit Handoff routes without requiring the operator to hand-author pointer Markdown.

## Done Criteria

- Outgoing can mark one or more reviewed Handoffs as package routes.
- Shared Tiinex Tooling manufactures the corresponding package-local Handoff pointers.
- When more than one route is present, one route is explicitly selected only for the human-facing routing text while all selected routes remain in the shared carrier.
- Route actions remain available independent of Logical/Files and Leaves/Lineage projection.
- From/To endpoint Role pointers and additional participant Role pointers remain Tooling-owned transport projections.

## Scope

`extension-vscode` Outgoing route-selection state, package-builder bridge and tests only.

## Dependencies

Parent Outgoing carrier-parent/package-routing Task and the public multi-route `--workspace-routes` shared Tooling surface.

## Boundary

Do not create free-form pointer authoring or infer route authority from tree position.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [002-carrier-parent-and-package-routing.trace.md](../002-carrier-parent-and-package-routing.trace.md)
  - Value: WIgnSCew-93wHnvHlpdq7eW75D4XImDJkb15-vHJT8I

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: -J5hHtACmbgY_WbwXV7aLiyhFJ2MXpgns0jheJa81F4