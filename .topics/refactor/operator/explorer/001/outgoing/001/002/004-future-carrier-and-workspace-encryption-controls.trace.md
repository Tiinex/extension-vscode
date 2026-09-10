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
  - Why: Sigma wants future root and Workspace encryption controls, but current shared encryption/key contracts are not frozen.
  - Summary: Reserve lock/unlock UX without inventing encryption semantics in VS Code.
  - Status: ready/local

---

# Future carrier and Workspace encryption controls

## Objective

Reserve native lock/unlock actions at Outgoing root and Workspace levels for future qualified encryption support.

## Done Criteria

- Root and per-Workspace encryption controls are visualized only when a shared Tooling encryption/profile contract exists.
- Locked/unlocked state is explicit and reviewable before package manufacture.
- VS Code never invents cryptographic formats, key storage, or encryption authority locally.
- Encryption composes with Workspace source inclusion/scoping without changing Handoff From/To semantics.

## Scope

Future `extension-vscode` UI and public Tooling bridge only.

## Dependencies

Parent Outgoing carrier-parent/package-routing Task and future shared encryption/key-handling contracts.

## Boundary

No encryption implementation or key persistence is introduced in the current tree milestone.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [002-carrier-parent-and-package-routing.trace.md](../002-carrier-parent-and-package-routing.trace.md)
  - Value: WIgnSCew-93wHnvHlpdq7eW75D4XImDJkb15-vHJT8I

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: UAghV3RaeTvaYRkvZcjXpU4nXcIpJvVd3yZ6Jw5EnvU