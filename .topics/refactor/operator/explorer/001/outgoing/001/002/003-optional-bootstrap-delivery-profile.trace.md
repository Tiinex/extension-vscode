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
  - Why: Sigma wants lightweight carriers for recipients that already have Tiinex Viewer/VS Code Tooling, while preserving self-contained cold-start truth by default.
  - Summary: Reserve a future bootstrap on/off root control behind a qualified shared carrier profile.
  - Status: ready/local

---

# Optional carrier bootstrap delivery profile

## Objective

Reserve a future Outgoing root toggle for including or omitting the portable bootstrap when the recipient is known to use a Tiinex-aware viewer/VS Code host.

## Done Criteria

- The default remains a self-contained embedded-bootstrap carrier.
- A bootstrap-off control is enabled only when shared Tooling defines and qualifies a non-self-contained recipient profile.
- The UI makes the reduced portability/executability of bootstrap-off carriers explicit.
- Carrier profile selection remains package-level state and does not alter Handoff artifact semantics.

## Scope

Future `extension-vscode` Outgoing carrier-profile presentation and public Tooling bridge only.

## Dependencies

Parent Outgoing carrier-parent/package-routing Task and a shared qualified carrier-profile contract supporting omitted bootstrap delivery.

## Boundary

Do not suppress bootstrap files by post-processing ZIP bytes in VS Code.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [002-carrier-parent-and-package-routing.trace.md](../002-carrier-parent-and-package-routing.trace.md)
  - Value: WIgnSCew-93wHnvHlpdq7eW75D4XImDJkb15-vHJT8I

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: nSH-GkE5uTT0JY8GPheRtxK9b4ekHi5V2ReVx9G3wnE