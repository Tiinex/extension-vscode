# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-10-10 16:27:58
  - Trace: [001-19-8-sigma-scoped-windows-acceptance-task.trace.md](001-19-8-sigma-scoped-windows-acceptance-task.trace.md)
  - Origin:
    - [relative](001-19-8-sigma-scoped-windows-acceptance-task.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-10-10 17:39:04
  - Authors: Anchor
  - Why: Real installed Sigma video exposed a stale first-party publication binding; source and maintenance gate corrected without host-side Markdown patch.
  - Summary: Retest exact pinned Evidence Current Schema and Evidence Parent continuation on Windows, with prior Sigma scope retained and unresolved UX observations explicit.
  - Status: ready/local

---

# Sigma — Evidence Publication and Parent Continuity Windows Retest (2026-10-10)

## Objective

Re-run the first unexpected Windows failure in the last scoped Sigma attempt using this exact new 17-Workspace candidate. The two silent Windows recordings demonstrated a new Evidence with a bare Current Schema reference, subsequent manual Markdown editing, failed Evidence → Evidence preview, and a Parent BLOCK. This candidate corrects schema publication at its registered Native/Core source. It does **not** declare unrelated UI or stale-preview defects fixed without a reproduction. Sigma observes; Anchor owns source repair.

## Scope

- Only the filmed fresh Evidence publication and Evidence → Evidence continuation failure is retested first; after it passes, complete the previously approved bounded Sigma scenarios.
- Installed VS Code on Windows, no source modifications by Sigma; old third-Workspace and historical-migration exclusions remain unchanged.

## Dependencies

- Exact carried Core, Native, Docs and VS Code candidate built/activated together on Windows, plus disposable Evidence and PNG fixtures.
- First-party published schema binding is verified from GitHub at an immutable commit; existing Core repair is required for old invalid local Evidence, never a hand-edit.
- Actual installed Windows acceptance is required; source and Linux host tests cannot substitute.

## Release-Qualified Source

- `tiinex.evidence.v1` in first-party Native is now pinned to the exact published `Tiinex/docs` source at commit `9ef3c2caed38152b1948c93cb45c985786660d91`, Git blob `d73eca4ef294d2450faa2513c64e137bcf08e497`, path `.topics/.schemas/core/evidence/tiinex.evidence.v1.schema.md`. These source bytes were separately read and verified through GitHub; no post-creation Markdown patch is necessary.
- Use `schemas check <native> --docs <docs> --require-published` for the **release** requirement, not for ordinary local draft authoring. This compares all catalog bindings to exact Docs bytes, immutable URL and commit fields and fails on missing publication; Native's existing package tests also include an offline release publication audit. Local work remains allowed with unpublished schemas until publication qualification.
- In the sandbox, 99 existing Core test files passed 664 assertions / 0 failures / 1 skip; Native's existing tests passed 8/8; offline-packaged Core installed in an isolated consumer and VS Code's existing host/Transition tests passed. Static extension release check: 0 errors, 0 warnings. These are **not** installed Windows results.

## First-Round Retest (stop on the first unexpected failure)

1. **Actual candidate.** Build/reload Windows VS Code from this exact carried Core, Native, Docs, and VS Code snapshot, using the user's normal local linked-Core workflow. Confirm extension activation, or return BLOCK and exact build/activation message.
2. **Fresh Evidence creation.** Create a disposable Evidence via New Artifact, with a simple source note and no Parent. Reopen its `.trace.md`; `Current Schema` must be an **immutable GitHub link**, not bare `tiinex.evidence.v1` and not `qualified-local-unpublished`. No hand-edits or external Markdown repair permitted.
3. **Evidence → Evidence without hand editing.** In the same Workspace, select the *freshly created* Evidence as Parent of a second new Evidence. Preview once, then Create; confirm the new Evidence retains a qualified Parent. If `tiinex.authoring.preview-stale-recreate-required` or `tiinex.authoring.parent-blocked:blocked` appears, stop, return **BLOCK** and the exact first error, stage, and whether a form was reopened. Do not bypass Preview, suppress stale guards, or alter integrity.
4. **Existing old Evidence is a separate repair scenario.** Do not hand-patch the Markdown's Current Schema. If the previous bare-schema Evidence still needs to be reused, invoke the existing *Core-qualified Repair Artifact* route which validates and reseals integrity; only then retest Parent. An old artifact that lacks such qualification should remain BLOCK. Distinguish this from a fresh clean Evidence test.
5. **After steps 1–3 PASS, resume the previously agreed six-step Sigma scope.** Verify three Evidence presets, two PNG Material entries and their references after Apply, the intended *semantic* Move/Rebase path vs ordinary file destination, safe two-Workspace Apply and external-reader BLOCK, Save as Transition remaining hidden. Historical external HTTPS is PASS/BLOCK/NOT TESTED separately. Technical Markdown preview opening automatically is an existing UX observation, not hidden or claimed fixed by this schema repair.

## Expected Results and Exact Boundaries

- New Evidence uses the new pinned schema reference on first Create, with no network lookup needed at authoring time.
- A fresh Evidence Parent can be continued safely; a stale preview should stay fail-closed, not masked by disabling checks. The source of any *still reproduced* stale-preview error is a separate Anchor investigation.
- The previously observed ordinary file destination picker may not be semantic Move/Rebase; report which command was used before concluding that the destination picker is defective.
- Two attached PNGs must remain referenced and byte-current after approved Create; capture if either reference is missing or points to the wrong location, but a source copy remaining does not automatically prove a failed relocation.
- 3+ Workspace readers outside the Core-qualified two-root transaction must BLOCK. Save as Transition is intentionally hidden. Byte-incompatible historical schemas must BLOCK. No publish or Git writes.

## Done Criteria

Return **PASS**, **PASS WITH OBSERVATIONS**, or **BLOCK**, citing the first failed step and exact visible behavior. A silent video is sufficient. Neither this Task nor Core test success establishes installed Windows Sigma PASS or Marketplace authorization.

## Interpretation Limits

- Does Not Prove: other historical schema migration, every live GitHub transport, arbitrary cross-Workspace reader updates, external-asset mutation, new generic Transition Definition authoring, or release approval.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-19-8-sigma-scoped-windows-acceptance-task.trace.md](001-19-8-sigma-scoped-windows-acceptance-task.trace.md)
  - Value: i3ngluoEYF_JnJMUfDomojDHiK3lkDn7r6aLqSf-UOY

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: Lj6PB79HKrHOgRGN9TFRLzxL0QBK0ZwZknWxMWtZ8rw