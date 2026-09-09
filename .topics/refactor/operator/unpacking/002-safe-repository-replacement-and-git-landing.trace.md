# Continuity Context

- Envelope Schema: tiinex.root.v1
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-09 18:11:03
  - Trace: [001-vs-code-handoff-discovery-and-manufacture-minimum.trace.md](../001-vs-code-handoff-discovery-and-manufacture-minimum.trace.md)
  - Origin:
    - [relative](../001-vs-code-handoff-discovery-and-manufacture-minimum.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-09 19:31:55
  - Authors: Anchor
  - Why: Received full-source Workspace snapshots must be merge-free, explicit, and reversible enough for ordinary operator use.
  - Summary: Handle branch/dirty decisions, snapshot replacement, staging, optional exact commit, and bounded push per Workspace.
  - Status: ready/local

---

# Safe repository replacement and Git landing

## Objective

Land each selected qualified Workspace snapshot into its matched local repository only after branch and dirty-worktree decisions are explicit and bounded.

## Done Criteria

- Origin/repository identity and declared branch/ref are checked before replacement whenever the Workspace declares them.
- Branch mismatch offers Switch or Skip for that Workspace; declining does not abort unrelated Workspace landings.
- Dirty repositories offer Stash, Commit, Discard, or Skip before replacement.
- The selected pre-landing action is completed and verified before source files are replaced.
- Replacement preserves `.git` and currently ignored paths, rejects collisions with ignored paths, removes other existing source paths, and overlays the qualified `.workspace.zip` snapshot.
- Every landed repository is staged with `git add -A` regardless of auto-commit policy.
- Auto-commit can commit the landing; when it does not, a generated Tiinex commit message remains available for copy/use by the operator.
- Auto-push can run only for the exact commit created by this landing invocation and never after a manual/non-landing commit path.

## Scope

`extension-vscode` local landing orchestration and bounded Git actions around an already-qualified Workspace snapshot.

## Dependencies

- Parent VS Code Handoff discovery/manufacture minimum Task.
- Qualified Tiinex Workspace landing projection and exact Workspace archive checksums.
- Existing host Git helpers and VS Code Git repository discovery.

## Boundary

No force push, no invented upstream, no private Handoff semantics, and no mutation of skipped repositories.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-vs-code-handoff-discovery-and-manufacture-minimum.trace.md](../001-vs-code-handoff-discovery-and-manufacture-minimum.trace.md)
  - Value: WrR1L02KLX6Hmie0wz1JokOvZvXxPJ0Rz6kvs-1Wmtc

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: oLmTcJR_eRb_RNNkMYQZ7OTIsjhX61yE3QXQ3YAv7Gk