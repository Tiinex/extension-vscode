# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-12 11:09:13
  - Trace: [001-3-6-4-1-3-1-1-1-2-1-1-anchor-to-sigma-vs-code-major-003-full-source-live-host-acceptance-handoff.trace.md](001-3-6-4-1-3-1-1-1-2-1-1-anchor-to-sigma-vs-code-major-003-full-source-live-host-acceptance-handoff.trace.md)
  - Origin:
    - [relative](001-3-6-4-1-3-1-1-1-2-1-1-anchor-to-sigma-vs-code-major-003-full-source-live-host-acceptance-handoff.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-12 13:50:30
  - Authors: Anchor
  - Why: Sigma live-host feedback shows Git commit/push friction remains the largest daily operator cost and current auto-stage/commit/push behavior is not usable enough to close Major 003.
  - Summary: Repair post-stage auto commit/push behavior and make a first-class per-repository manual Tiinex Commit flow so routine work no longer depends on VS Code Tasks.
  - Status: ready/local

---

# VS Code Major 003 — Sigma Git Automation And Manual SCM Ergonomics Repair

## Objective

Finish the planned Major 003 Git-operator ergonomics so routine repository commits no longer require VS Code Tasks, while preserving explicit operator control and fail-safe automatic commit/push behavior.

## Done Criteria

- Replace separate landing commit/push settings with one post-stage policy: `Do Nothing`, `Commit`, `Commit + Push`. Auto-stage remains independently configurable.
- `Commit + Push` is impossible without the same Tiinex operation first creating the exact commit; manual/unrelated commits are never auto-pushed.
- A per-repository staged-state watcher may trigger post-stage automation only after the selected repository state is stable/debounced, conflict-free, and the exact staged fingerprint is reverified before mutation.
- Automatic commit requires at least one qualified Tiinex artifact in the staged closure. Source-only staging does not auto-commit and reports that gate clearly rather than silently doing nothing.
- Automatic commit does not race partial staging: if relevant unstaged changes remain or staged state changes during validation/message derivation, fail closed and wait for a later explicit stable event.
- Manual mode remains first-class when policy is `Do Nothing`: expose a Tiinex action per Git repository in the VS Code Source Control surface when technically supported, with fallback command only if host limitations require it.
- Manual flow supports existing staged content or explicit Stage All, then shared staged validation, commit-message derivation, review/edit, and `Leave staged` / `Commit` / `Commit + Push` outcomes. Explicit manual mode may commit source-only changes because the operator initiated the action.
- Remove the normal need for the old commit-message Task/command workflow once the SCM operator path is qualified; keep only compatibility/fallback behavior if a real host limitation requires it.
- Auto-stage/landing flow reports why no auto-commit or push occurred, including stage failure, artifact-gate failure, conflicts, unstaged remainder, changed fingerprint, missing upstream or push safety blockers.
- Existing Discovery, Incoming, Merge/Replace, Pack, artifact navigation and generic authoring regressions remain green.
- The Sigma-provided `media/tiinex.svg` asset is preserved in the carried Extension VS Code source and is not semantically interpreted by this Task.

## Scope

VS Code Major 003 Git ergonomics and human/operator control only. This is the previously planned operator-efficiency tranche refined by Sigma's live-host feedback.

## Dependencies

- Current Extension VS Code Major 003 source frontier and existing Git operator foundations.
- Current Core staged-validation / artifact qualification surface as read-only shared authority.
- Sigma live-host feedback recorded in the active Major 003 acceptance context.

## Exclusions

- No Core/Docs semantic changes.
- No Transport queue implementation in this tranche.
- No Merge algorithm redesign in this tranche.
- No artifact/Handoff schema semantics redesign.
- No background push, implicit remote mutation or push of unrelated/manual commits.
- No release or Marketplace publication.

## Acceptance Boundary

Major 003 remains open until Sigma later verifies the actual Windows/main-host UX. Machine tests do not substitute for that human gate.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-3-6-4-1-3-1-1-1-2-1-1-anchor-to-sigma-vs-code-major-003-full-source-live-host-acceptance-handoff.trace.md](001-3-6-4-1-3-1-1-1-2-1-1-anchor-to-sigma-vs-code-major-003-full-source-live-host-acceptance-handoff.trace.md)
  - Value: ktc6_1MBLf360MtSO2bJqJoMCACF77fIpWuqe_rcD3E

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: by8CGNC3wDBtCW_eWSalYe6WtM5fIVjEpn4p7buNFKY