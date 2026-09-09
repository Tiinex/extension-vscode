# Continuity Context

- Envelope Schema: tiinex.root.v1
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-09 19:31:55
  - Trace: [002-safe-repository-replacement-and-git-landing.trace.md](../002-safe-repository-replacement-and-git-landing.trace.md)
  - Origin:
    - [relative](../002-safe-repository-replacement-and-git-landing.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-09 20:36:50
  - Authors: Anchor
  - Why: Real repository testing must not run received repo code, stage preserved secrets, hide unasserted branches, mutate every ready Workspace implicitly, or drop package-carried Required Context.
  - Summary: Close five Refactor Anchor Receive audit blockers before real multi-root repository testing.
  - Status: ready/local

---

# Receive audit hardening before Sigma real-repository testing

## Objective

Close the Refactor Anchor audit findings that can cause implicit code execution, accidental secret staging, branch ambiguity, over-broad Workspace mutation, or loss of package-carried Required Context during VS Code Receive.

## Done Criteria

- Post-landing staging/commit convenience never executes `tools/tiinex-commit-message.mjs` or other code from the received repository snapshot; landing uses a trusted extension-owned deterministic message, while repository-local commit-message derivation remains only an explicit separate operator command.
- Paths that were ignored before landing remain excluded from the landing stage even if the incoming `.gitignore` stops ignoring them; exclusion is verified after staging and fails closed if any protected path remains staged.
- A qualified Workspace without a declared Ref shows current branch and declared-Ref state and requires explicit acknowledgement or Skip before it can be selected for mutation.
- Every ready local Workspace is explicitly selected for Receive; clean matched carried context is never mutated solely because shared Tooling projected it ready.
- Qualified package-carried Required Context remains retained in `ReceivedHandoffContext` independently of whether every Required Context Workspace was locally landed.
- Focused regression tests cover all five audit findings and the existing Receive regression suite remains green.

## Scope

`extension-vscode` Receive orchestration, host Git staging/commit plumbing, received-context representation, tests, and local documentation only.

## Dependencies

- Parent safe repository replacement and Git landing Task.
- Refactor Anchor audit of the `tiinex-vscode-001-1` checkpoint.
- Existing shared Tooling Workspace landing projection and carrier grounding receipts.

## Boundary

No Core/Docs/Business mutation, no Handoff/package authoring redesign, no 0.1.8 publication, no package-supplied-bootstrap redesign, and no broad Windows archive-path policy change in this child.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [002-safe-repository-replacement-and-git-landing.trace.md](../002-safe-repository-replacement-and-git-landing.trace.md)
  - Value: oLmTcJR_eRb_RNNkMYQZ7OTIsjhX61yE3QXQ3YAv7Gk

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: w0uIa4SlgWzdvRl6MxlV9uUII19TfxukdRnVkJaCM9k