# Continuity Context

- Envelope Schema: tiinex.root.v1
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-11 21:23:55
  - Trace: [001-1-vs-code-major-003-schema-scalable-artifact-authoring-task.trace.md](001-1-vs-code-major-003-schema-scalable-artifact-authoring-task.trace.md)
  - Origin:
    - [relative](001-1-vs-code-major-003-schema-scalable-artifact-authoring-task.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-11 22:11:27
  - Authors: Anchor
  - Why: Sigma latest source is stable enough to delegate and the dominant remaining daily friction is the repeated stage/message/commit/push loop; this scope revision is explicit before Kodax consumes the Major.
  - Summary: Before specialist execution, revise Major 003 into two fixed ordered tranches: multi-repository Git operator ergonomics, then schema-scalable artifact authoring.
  - Status: ready/local

---

# VS Code Major 003 — Operator Completion Plan Revision

## Objective

Revise the still-unconsumed VS Code Carrier Major 003 plan before specialist execution so the Major has two explicit ordered outcomes instead of silently growing later: first remove Sigma's current multi-repository Git commit/push latency, then complete the already-planned schema-scalable artifact authoring convergence. The Major remains one fixed operator-completion sprint and closes only when both tranches are qualified or a shared blocker is explicitly returned and accepted.

## Plan Revision Boundary

- The original Major 003 schema-scalable authoring Task/Handoff was manufactured into carrier `tiinex-vscode-003` but was never consumed by a Kodax session.
- Exact carrier `003` bytes remain immutable and are not reused.
- This Task is a child progression inside the same Carrier Major and records the informed pre-execution plan revision.
- No further product scope may be added to Major 003 without another explicit Anchor/Sigma reconciliation.

## Done Criteria

### Tranche A — Multi-Repository Git Operator Ergonomics

- Provide one explicit Tiinex operator flow that can select multiple current local Tiinex repositories and drive the ordinary `stage → shared staged validation → derive commit message → review/edit → commit → push` loop without requiring Sigma to repeat the current manual Source Control ritual repository by repository.
- Discovery of eligible repositories is derived from current qualified local Workspace/repository context rather than a hardcoded repository list.
- Before any commit is created, surface a concise review model per selected repository: root/repository label, branch, upstream/push eligibility, staged/dirty state, derived commit message, and any staged-validation blocker.
- Commit messages continue to come from each repository's own `tools/tiinex-commit-message.mjs`; the extension must not reimplement repository-specific message derivation.
- Shared Core staged validation remains authoritative for staged Tiinex material. A repository with no staged Tiinex artifacts may report that truthfully and still participate when otherwise safe.
- The operator must be able to edit/review a derived message before committing. An edited message is explicit human input; it must not be confused with Core/schema authority.
- Remote push is never background/implicit. One explicit final confirmation must identify exactly which repositories/branches/upstreams will be pushed.
- Push safety is commit-exact: push only commits created by the same explicit flow, only when branch/upstream identity remains unchanged and pre-operation publication state is compatible. Detached HEAD, missing/changed upstream, unrelated ahead/behind state, validation failure or changed HEAD fails closed for that repository.
- Batch execution returns an exact per-repository result. Partial completion may be reported but must never be hidden; a failed repository cannot cause unrelated later pushes to be inferred successful.
- Preserve the existing single-repository `Tiinex: Stage, Commit & Push with Tiinex` command as compatibility surface unless removing it is clearly safer and migration is documented.
- No automatic background stage/commit/push behavior is introduced.

## Tranche B — Schema-Scalable Artifact Authoring

After Tranche A reaches a qualified checkpoint, continue the existing Major 003 authoring objective defined by `001-1-vs-code-major-003-schema-scalable-artifact-authoring-task.trace.md`:

- Core/runtime-qualified create-capable schemas drive schema selection and form structure.
- VS Code does not own schema semantics, generic Parent/path naming, required fields or reference-domain meaning.
- Prove genericity with at least one non-Handoff create-capable schema without schema-specific host form/path code.
- Handoff is ordinary authoring. The only intended VS Code-specific Handoff behavior is optional `Attach to Outgoing`, which selects transport routing without changing artifact bytes or semantics.
- Return exact Core/Docs capability blockers rather than implementing private host semantics.

## Preserved Operator Surfaces

- Discovery, Incoming, Merge/Replace and Pack are accepted working surfaces and must not be redesigned by this Major.
- Preserve Sigma's latest Discovery Clear/auto-clear ergonomics and post-Pack Discovery suppression.
- Do not regress current main-host extension activation/build/link behavior.

## Dependencies

- Current latest Extension VS Code Workspace from Anchor recovery, including Sigma Discovery Clear/auto-clear and post-Pack suppression changes.
- Current Core portable staged-validation and artifact-creation capabilities as read-only shared authority.
- Current Docs schemas as read-only semantic authority.
- Current App schema-factory behavior as read-only parity/context for the authoring tranche.
- Existing repository-owned `tools/tiinex-commit-message.mjs` helpers and configured Git upstreams on the live Sigma host.

## Scope

Extension VS Code Git/operator UX, generic authoring host/model/panel integration, focused tests and documentation. Shared Core/Docs/App remain read-only unless an exact blocker is returned to Anchor for separate delegation.

## Exclusions

- No Marketplace/npm release.
- No background pushes.
- No silent commit-message generation from unstaged bytes.
- No Core or Docs mutation under this Handoff.
- No redesign of Incoming/Pack/Discovery mechanics beyond regression fixes required by this Major.
- No third schema-specific authoring implementation disguised as generic support.

## Acceptance Boundary

Major 003 is complete only when the Git loop materially removes Sigma's multi-repository commit/push friction and artifact authoring is demonstrably schema-scalable. Green unit tests alone do not establish human ergonomics; return a bounded Sigma test checkpoint for each tranche when needed.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-1-vs-code-major-003-schema-scalable-artifact-authoring-task.trace.md](001-1-vs-code-major-003-schema-scalable-artifact-authoring-task.trace.md)
  - Value: w3g1uYOkYJ647I9oyrn0pu_0THS6mhvttRGl20e9edE

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: FCnGlRBfoEGZ0pDcslu1hBSqZhoaPCy01MTpFB1YoOo