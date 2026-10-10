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
  - Created At: 2026-10-10 18:44:34
  - Authors: Anchor
  - Why: Installed Sigma feedback showed six aliases for three Evidence Transitions and an unnecessary technical approval during already-authorized Create; retain exact Core qualification.
  - Summary: Windows retest of Core-verified Native preset alias deduplication and explicit asset Create without duplicated transaction consent; all existing safety gates remain.
  - Status: ready/local

---

# Anchor To Sigma — Deduplicated Native Presets And Direct Explicit Create

## Handoff Parties

- Purpose: bounded Windows retest of the two reproduced usability defects after the previous Core path-allocation fix, with all other Sigma controls unchanged
- From: Anchor
- From Kind: role
- From Reference: [Anchor](business::.topics/roles/001-1-1-1-1-1-anchor-canonical-holder-cutover-role.trace.md)
- To: Sigma
- To Kind: role
- To Reference: [Sigma](business::.topics/roles/001-4-1-1-sigma-role-canonical-assignment-modes-qualification-continuation.trace.md)

## Transfers

- sigma-windows-source-retest
  - Transfer Kind: work
  - Description: Build and activate exactly the carried VS Code version against the carried Core/Native. With Native open as a local Workspace, open New Evidence and confirm exactly three qualified Native presets, not six aliases; choose each preset and confirm correct field defaults. Add two ordinary PNG materials, explicitly choose move-on-Create, then click Create: there must be no extraneous Markdown transaction-plan editor tab or duplicate Apply approval, while both assets and artifact are committed atomically. Verify Preview/Create for fresh Evidence, Evidence Parent and Topic remains non-stale unless an actual source/path changes. Check that explicit standalone Move/Rebase still shows its review and approval; fail-closed external readers remain blocked.
  - Controlling Artifact: [Prior Sigma Windows Retest](001-19-9-sigma-evidence-publication-windows-retest-task.trace.md)
  - Boundary: no installed Windows PASS is claimed by offline Core/host tests; no external origin publication, Handoff schema V2, Save as Transition UI, third-Workspace write, or remote mutation

## Required Context

- previous-sigma-handoff
  - Material: exact immediately prior 001-19-10 Preview/Create consistency Handoff with all 17 Workspaces
  - Material Reference: [Previous Sigma Handoff](001-19-10-anchor-to-sigma-preview-create-allocator-consistency.trace.md)
  - Purpose: preserve deployed scope, architecture and parent continuity
  - Availability: available
- release-sigma-scope
  - Material: Evidence/Topic/Parent/asset/Move-Rebase scoped user Windows acceptance task
  - Material Reference: [Sigma Windows Retest](001-19-9-sigma-evidence-publication-windows-retest-task.trace.md)
  - Purpose: qualify tested behaviors without adding requirements
  - Availability: available
- extension-finalization
  - Material: original VS Code extension finalization and user Windows acceptance task
  - Material Reference: [VS Code Finalization](001-vscode-extension-integration-and-final-acceptance.trace.md)
  - Purpose: preserve the final installed acceptance boundary
  - Availability: available
- anchor-role
  - Material: canonical qualified Anchor recipient/producer role
  - Material Reference: [Anchor Role](business::.topics/roles/001-1-1-1-1-1-anchor-canonical-holder-cutover-role.trace.md)
  - Purpose: transfer qualified implementation provenance
  - Availability: available
- sigma-role
  - Material: canonical Sigma role and actual Windows acceptance owner
  - Material Reference: [Sigma Role](business::.topics/roles/001-4-1-1-sigma-role-canonical-assignment-modes-qualification-continuation.trace.md)
  - Purpose: receiving authorization
  - Availability: available

## Reference Context

- duplicate-core-reproduction
  - Material: existing Core `project-transition-neighborhood` against actual Native `.topics` returns six Evidence candidates for three definitions: each composed Native and local file version reports the exact same SHA, canonical id, semantic package-relative path and qualified defaults. Host presentation now collapses ONLY a verified embedded/local Native alias; independent versions, SHA values, paths and defaults retain distinct selection ids. An actual Core CLI run was projected through the edited VS Code helper and yielded exactly three presets plus Manual.
  - Material Reference: [Prior Sigma Windows Retest](001-19-9-sigma-evidence-publication-windows-retest-task.trace.md)
  - Purpose: prove the installed duplication cause without altering Core semantics
  - Availability: available
- combined-create-single-intent
  - Material: When the operator chose `move when this artifact is created` for each file, then clicks Create, host no longer opens a Markdown plan and requests a second approval. Core still owns preflight, atomic apply, journal, rollback and drift requalification. Separate explicit Move/Rebase continues to require reviewed confirmation. The existing deferred-form E2E and existing host boundaries PASS against offline npm-packed Core.
  - Material Reference: [Prior Sigma Handoff](001-19-10-anchor-to-sigma-preview-create-allocator-consistency.trace.md)
  - Purpose: preserve atomicity and prevent UX permission duplication
  - Availability: available

## Retained Responsibilities

- publication-validator-repair
  - Retained By: Anchor
  - Responsibility: only consider `draft/local` → published origin after exact remote state and immutable artifact bytes are verified using existing stale-permalink validator/repair architecture; do not infer publication merely from a Git push, nor rewrite arbitrary history
  - Boundary: no new publication UI, status engine, schema or automatic remote writes in this checkpoint
- windows-acceptance
  - Retained By: Sigma
  - Responsibility: test actual installed VSIX and report PASS, PASS WITH OBSERVATIONS or BLOCK including timestamps/screens
  - Boundary: source tests and Linux npm packing do not mean Windows-installed PASS

## Exclusions And Dependencies

- publication-of-created-artifacts
  - Kind: excluded-scope
  - Description: user requested deliberate validator/repair design. Unverified draft-to-published promotion remains out of scope and unimplemented; published schema reference on new Evidence is already separate and verified.
- three-plus-workspace-mutation
  - Kind: excluded-scope
  - Description: external unclosed graph and third-Workspace mutations remain fail-closed; expanding atomic transaction breadth is post-Sigma.
- actual-Windows-result
  - Kind: unresolved-dependency
  - Description: fresh installed Windows tests for this exact source checkpoint have not run here. Prior videos are blocker evidence, not successful retests.

## Completion Expectation

- Signal Kind: disposition
- Signal Meaning: Sigma provides installed Windows PASS, PASS WITH OBSERVATIONS or BLOCK; specifically confirms three Evidence presets when Native folder is open, direct Create with two PNG assets without a plan editor/double approval, Evidence Parent/Topic no false preview-stale, and standalone Move/Rebase confirmation unchanged
- Return To: Anchor
- Return To Reference: [Anchor](business::.topics/roles/001-1-1-1-1-1-anchor-canonical-holder-cutover-role.trace.md)

## Interpretation Limits

- Does Not Mean: Core catalog lost any representation, assets move without operator consent, general publishing has been implemented, a new transition definition editor exists, or Windows installed tests have passed
- Must Not Be Used To Claim: Marketplace approval, general 3+ Workspace atomic mutation, historical schema migrations, or automatic remote publication

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-19-9-sigma-evidence-publication-windows-retest-task.trace.md](001-19-9-sigma-evidence-publication-windows-retest-task.trace.md)
  - Value: Lj6PB79HKrHOgRGN9TFRLzxL0QBK0ZwZknWxMWtZ8rw

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: n7A_FmZTdAT_qK6_AwWqZ9nA27WgOaf7DwBxwWH7NTQ