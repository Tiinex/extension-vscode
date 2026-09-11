# Continuity Context

- Envelope Schema: tiinex.root.v1
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-11 17:20:45
  - Trace: [001-kodax-sigma-extension-stabilization.trace.md](../001-kodax-sigma-extension-stabilization.trace.md)
  - Origin:
    - [relative](../001-kodax-sigma-extension-stabilization.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-11 17:21:10
  - Authors: Kodax
  - Why: Sigma observed Merge/Replace remaining actionable and noisy when Incoming already matched local source exactly.
  - Summary: Hide redundant Incoming actions for exact matches and preserve safe post-landing Git ordering.
  - Status: ready/local

---

# Incoming exact-match no-op and post-landing Git ergonomics

## Objective

Make Incoming Merge/Replace truthfully non-actionable when carried Workspace bytes already match local source, while keeping successful changed-source application safe and predictable through the post-landing Git boundary.

## Done Criteria

- An Incoming Workspace whose qualified carried source exactly matches local source exposes no Merge or Replace action.
- An Incoming package whose selected/eligible Workspaces all exactly match local source exposes no package-level Merge or Replace action and presents a quiet up-to-date state.
- Mixed packages skip exact-match Workspaces silently and plan/apply only changed Workspaces.
- A stale or programmatic Merge/Replace invocation that discovers an exact match resolves as a no-op without redundant applying/already-matches notifications.
- Changed-source Merge/Replace still uses qualified compare/planning before mutation and rechecks local Git state before the first write.
- After safe landing from clean, stashed, or explicitly pre-committed state, the invocation stages only its landed changes, provides the deterministic trusted commit message, and evaluates optional commit/push policy in order.
- When the operator elects to preserve unrelated local changes, landing must not auto-stage or absorb those human changes into the Tiinex commit flow.
- Conflict or ambiguous repository state fails closed and never auto-commits or auto-pushes.
- Focused regression coverage protects exact-match action visibility, mixed-package skipping, no-op notification behavior and post-landing Git ordering.

## Scope

`extension-vscode` Incoming tree/action state, host orchestration, Git follow-up and tests only.

## Dependencies

- Parent Kodax Sigma extension stabilization Task.
- Existing qualified Incoming comparison/landing Tooling.
- Existing repository-overlap, duplicate-target and TOCTOU safety gates.

## Boundary

No Core/Business/Docs mutation. Shared comparison or landing contract gaps are blockers/proposals to the owning repository rather than host-private semantic patches.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-kodax-sigma-extension-stabilization.trace.md](../001-kodax-sigma-extension-stabilization.trace.md)
  - Value: dhAbPyn3Um3C4zoZ4VLrDkFePAYujy2qRC7rIA-wMY0

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: E8gb1W-r7r3yJusHa1r7q1-klrJNpEEkRDG9ZbDiIPg