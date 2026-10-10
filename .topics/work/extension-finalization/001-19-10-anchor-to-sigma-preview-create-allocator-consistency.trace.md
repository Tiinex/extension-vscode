# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-10-10 17:39:04
  - Trace: [001-19-9-sigma-evidence-publication-windows-retest-task.trace.md](001-19-9-sigma-evidence-publication-windows-retest-task.trace.md)
  - Origin:
    - [relative](001-19-9-sigma-evidence-publication-windows-retest-task.trace.md)
- Current
  - Current Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-10-10 18:30:45
  - Authors: Anchor
  - Why: Core allocated a different path from the Markdown-only preview copy than from the real Workspace without any user mutation; use identical Core material roots.
  - Summary: Windows source-level false-stale Preview/Create root allocation fix, with Core stale protections retained and artifact publication reserved for validator repair.
  - Status: ready/local

---

# Anchor To Sigma — Same-Workspace Preview / Create Path Consistency

## Handoff Parties

- Purpose: retest installed Windows Preview → Create consistency for both Evidence and Topic; close the reproduced false-stale host path allocation defect while retaining true stale blocking. Publication lifecycle is deferred to existing validator/repair, not a new status workflow.
- From: Anchor
- From Kind: role
- From Reference: [Anchor](business::.topics/roles/001-1-1-1-1-1-anchor-canonical-holder-cutover-role.trace.md)
- To: Sigma
- To Kind: role
- To Reference: [Sigma](business::.topics/roles/001-4-1-1-sigma-role-canonical-assignment-modes-qualification-continuation.trace.md)

## Transfers

- preview-create-windows-retest
  - Transfer Kind: work
  - Description: activate exactly this carried VS Code + Core + Native + Docs source on Windows. Create a fresh Evidence, continue it from itself as Parent by making a new Evidence, then create an ordinary Topic in a Workspace containing non-Markdown files in `.topics` such as prior receipts/assets. Confirm Preview and Create agree on the allocated path and no false `tiinex.authoring.preview-stale-recreate-required` is raised. Deliberately create an intervening numbered sibling before Create if practical; a changed allocation must still BLOCK without writing an artifact. Then complete existing scoped Sigma checks as previously agreed.
  - Controlling Artifact: [Current Sigma Windows Retest](001-19-9-sigma-evidence-publication-windows-retest-task.trace.md)
  - Boundary: no automatic installed-Windows PASS, no remote mutation, no bypass of stale checks, no implied public artifact status after Git push, and no extension of Move/Rebase transactional scope

## Required Context

- current-sigma-scope
  - Material: existing qualified Sigma Evidence publication, fresh Parent, assets, transitions, and bounded Move/Rebase Windows acceptance task
  - Material Reference: [Current Sigma Windows Retest](001-19-9-sigma-evidence-publication-windows-retest-task.trace.md)
  - Purpose: preserve original Sigma instructions and scoped blocker evidence
  - Availability: available
- prior-sigma-handoff
  - Material: immediately previous 001-19-9 Anchor-to-Sigma publication correction with all 17 Workspaces
  - Material Reference: [Prior Sigma Handoff](001-19-9-1-anchor-to-sigma-evidence-publication-retest.trace.md)
  - Purpose: preserve the source checkpoint and exact packaged ancestry
  - Availability: available
- extension-task
  - Material: canonical VS Code extension integration and Windows final acceptance requirement
  - Material Reference: [Extension Finalization](001-vscode-extension-integration-and-final-acceptance.trace.md)
  - Purpose: prevent false Sigma PASS based only on Linux/source tests
  - Availability: available
- anchor-role
  - Material: qualified Anchor role for corrective source ownership
  - Material Reference: [Anchor Role](business::.topics/roles/001-1-1-1-1-1-anchor-canonical-holder-cutover-role.trace.md)
  - Purpose: source repair responsibility and return recipient
  - Availability: available
- sigma-role
  - Material: qualified Sigma role for installed Windows verification
  - Material Reference: [Sigma Role](business::.topics/roles/001-4-1-1-sigma-role-canonical-assignment-modes-qualification-continuation.trace.md)
  - Purpose: exact handoff consumer
  - Availability: available

## Reference Context

- core-path-allocation-reproduction
  - Material: actual portable Core `prepare-materialization` in a directory with `.topics/001-baseline.trace.md` plus `.topics/230-debug.txt` allocates `.topics/231-test-topic.trace.md`; the old Markdown-only preview copy allocates `.topics/002-test-topic.trace.md`, even without any user change
  - Material Reference: [Current Sigma Windows Retest](001-19-9-sigma-evidence-publication-windows-retest-task.trace.md)
  - Purpose: evidence that the prior host generated a false stale error by comparing different Core material universes
  - Availability: available
- bounded-host-fix-and-e2e
  - Material: `src/authoring.ts` Preview asks Core to allocate against the actual root, exactly like `writePreparedArtifactDraft`; scratch remains read-only isolated Markdown rendering. A scenario in the existing `test/transitionRoundtrip.integration.mjs` checks the source-mode divergence and still BLOCKs a real intervening numbered file. Existing VS Code host tests including assets and Move/Rebase PASS against offline-installed Core; static release check 0 errors and warnings
  - Material Reference: [Current Sigma Windows Retest](001-19-9-sigma-evidence-publication-windows-retest-task.trace.md)
  - Purpose: explicit qualified claim and boundary of the repaired host path
  - Availability: available

## Retained Responsibilities

- anchor-validation-and-repair
  - Retained By: Anchor
  - Responsibility: continue the existing Core validator/repair design for promoting an artifact from draft/local only when its exact remote origin publication is verified; stale permalink checks must not guess an origin or rewrite history silently
  - Boundary: no new status engine, Git-push hook, publishing button, schema format or repair implementation was introduced by this checkpoint
- anchor-remaining-source-review
  - Retained By: Anchor
  - Responsibility: examine any new installed Windows findings, including duplicate identical Transition discovery and Create plan UX if confirmed. Keep external reader 3+ Workspace mutation blocked.
  - Boundary: no source change without reproduced cause and no bypass of canonical Core ownership

## Exclusions And Dependencies

- actual-windows-result
  - Kind: unresolved-dependency
  - Description: no source or offline-packaged Core test establishes Windows VSIX acceptance; only Sigma can verify the actual installed host and report PASS/BLOCK
- draft-to-publication
  - Kind: excluded-scope
  - Description: user deliberately deferred implementation; local/draft is not itself a schema-publication defect. Future validator warning/repair only after exact published artifact bytes/origin can be verified; no premature status flip or new process.
- intentionally-out-of-scope
  - Kind: excluded-scope
  - Description: Save as Transition remains hidden; third-Workspace atomic cross-reader update and true historical schema migration remain blocked under agreed Sigma scope.

## Completion Expectation

- Signal Kind: disposition
- Signal Meaning: Sigma reports PASS, PASS WITH OBSERVATIONS or BLOCK, including the first failing Windows step and whether same-root Preview/Create no longer shows a false stale error. If possible, confirm that genuine new path collision still fails closed.
- Return To: Anchor
- Return To Reference: [Anchor](business::.topics/roles/001-1-1-1-1-1-anchor-canonical-holder-cutover-role.trace.md)

## Interpretation Limits

- Does Not Mean: publication-after-push, duplicate presets, technical preview UX, or any remaining Move/Rebase issues are corrected by the one-line source fix
- Must Not Be Used To Claim: Windows installation PASS before Sigma checks, asset transport beyond accepted scope, historical schema migration, Marketplace publication or an automatic transition from draft/local to public

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-19-9-sigma-evidence-publication-windows-retest-task.trace.md](001-19-9-sigma-evidence-publication-windows-retest-task.trace.md)
  - Value: Lj6PB79HKrHOgRGN9TFRLzxL0QBK0ZwZknWxMWtZ8rw

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: b8ASJzuDwDws2Z6e8c58_fY7jIGI0J4PoJQRHG0p1GI