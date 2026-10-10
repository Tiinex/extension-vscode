# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-10-10 16:27:58
  - Trace: [001-19-8-sigma-scoped-windows-acceptance-task.trace.md](001-19-8-sigma-scoped-windows-acceptance-task.trace.md)
  - Origin:
    - [relative](001-19-8-sigma-scoped-windows-acceptance-task.trace.md)
- Current
  - Current Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-10-10 16:29:16
  - Authors: Anchor
  - Why: User accepted fail-closed multi-root release scope and paused generic Save as Transition; request one installed Windows Sigma observation without extra implementation.
  - Summary: Exact 001-19-7 candidate with complete 99-file Core PASS, offline packed Core/host PASS and bounded Windows-only human acceptance task.
  - Status: ready/local

---

# Anchor To Sigma — Scoped VS Code Windows Acceptance (001-19-8)

## Handoff Parties

- Purpose: one bounded Windows acceptance of the full 17-Workspace candidate against the explicit release scope agreed after 001-19-7; avoid an obsolete Save as Transition acceptance step or a claim of three-Workspace atomic writes
- From: Anchor
- From Kind: role
- From Reference: [Anchor](business::.topics/roles/001-1-1-1-1-1-anchor-canonical-holder-cutover-role.trace.md)
- To: Sigma
- To Kind: role
- To Reference: [Sigma](business::.topics/roles/001-4-1-1-sigma-role-canonical-assignment-modes-qualification-continuation.trace.md)

## Transfers

- scoped-human-windows-test
  - Transfer Kind: work
  - Description: run the one bounded human acceptance procedure in the newly qualified Sigma Task, on disposable workspaces with the exact Windows-installed/locally linked build of this candidate. Stop at first unexpected failure and return concise PASS, PASS WITH OBSERVATIONS or BLOCK. Sigma does not own troubleshooting or source edits. Expected fail-closed boundaries are not failures.
  - Controlling Artifact: [Current Sigma Acceptance Task](001-19-8-sigma-scoped-windows-acceptance-task.trace.md)
  - Boundary: no implicit final release readiness, Marketplace publishing, historical migration authority, remote mutation, multi-root Apply, or recipient Role-holder assumption

## Required Context

- sigma-current-task
  - Material: self-contained six-step Windows VS Code observation, including explicitly paused Save as Transition and supported Move/Rebase scope
  - Material Reference: [Current Sigma Acceptance Task](001-19-8-sigma-scoped-windows-acceptance-task.trace.md)
  - Purpose: replace stale 001-7 test requirements for this candidate, preserve user's chosen scope
  - Availability: available
- most-recent-anchor-carrier
  - Material: exact 001-19-7 Anchor checkpoint, including Core read-only three-Workspace reader census and bounded two-root transaction
  - Material Reference: [Previous Anchor](001-19-7-anchor-to-anchor-cross-workspace-reader-census.trace.md)
  - Purpose: preserve source provenance, known architectural exclusions and full recovery chain
  - Availability: available
- source-and-root-task
  - Material: controlling VS Code finalization Task and all owner boundaries
  - Material Reference: [VS Code Finalization](001-vscode-extension-integration-and-final-acceptance.trace.md)
  - Purpose: do not silently claim completed Marketplace release or broader three-root transaction
  - Availability: available
- native-evidence-presets
  - Material: qualified Core Native Evidence package plus three Definition/Generation pairs and explicit Companion, used by this candidate
  - Material Reference: [Native Evidence Semantic Package](native::.topics/.schemas/core/evidence/evidence-semantic-package.trace.md)
  - Purpose: source-of-truth for three Evidence authoring presets
  - Availability: available
- sigma-role
  - Material: canonical Sigma human observation/acceptance role
  - Material Reference: [Sigma Role](business::.topics/roles/001-4-1-1-sigma-role-canonical-assignment-modes-qualification-continuation.trace.md)
  - Purpose: bounded test recipient
  - Availability: available
- anchor-role
  - Material: canonical Anchor recovery/implementation role
  - Material Reference: [Anchor Role](business::.topics/roles/001-1-1-1-1-1-anchor-canonical-holder-cutover-role.trace.md)
  - Purpose: repair failures without making Sigma debug them
  - Availability: available

## Reference Context

- full-core-regression
  - Material: exact 001-19-7 carrier source, 99 Core test files, 663 pass, zero fail, one skip, 12 complete shards without timeout
  - Material Reference: [Previous Anchor](001-19-7-anchor-to-anchor-cross-workspace-reader-census.trace.md)
  - Purpose: close the previous checkpoint's incomplete full-suite test gap; no Core code changes since that carrier
  - Availability: available
- offline-packed-core-and-host
  - Material: offline `npm pack` → isolated `npm install` of exact Core source → existing full VS Code host boundary and Transition roundtrip tests PASS, including three Evidence and six Handoff presets, Move/Rebase and assets. Static extension release check: zero errors and warnings.
  - Material Reference: [VS Code Finalization](001-vscode-extension-integration-and-final-acceptance.trace.md)
  - Purpose: independent distribution-consumer assurance before Windows testing
  - Availability: available
- explicit-user-scope
  - Material: user-approved deferral of multi-root atomic rewrites, external reader/Parent changes, general Save as Transition UI and genuine incompatible schema migration; preserve safe BLOCK instead
  - Material Reference: [Previous Anchor](001-19-7-anchor-to-anchor-cross-workspace-reader-census.trace.md)
  - Purpose: avoid creating new P0 or silently enabling unsafe behavior during Sigma testing
  - Availability: available

## Retained Responsibilities

- anchor-source-and-safety
  - Retained By: Anchor
  - Responsibility: all code repairs, Core/Native semantic authority, schema migration design, future external multi-Workspace transaction extensions and recovery packaging on unexpected Sigma failure
  - Boundary: Sigma never patches Core, bypasses a validator, diagnoses package internals or approves third-Workspace mutation
- marketplace-publication
  - Retained By: Anchor
  - Responsibility: post-acceptance reduction, accurate public docs, final VSIX packaging and separate publication authorization
  - Boundary: no npm/Marketplace publish, git push or external modifications are authorized by this Handoff

## Exclusions And Dependencies

- actual-windows-host
  - Kind: unresolved-dependency
  - Description: Linux/sandbox Core and Node host integration do not prove a Windows-installed extension. Sigma must build, activate, and observe the exact carried candidate and return the result.
- deferred-large-moves
  - Kind: excluded-scope
  - Description: moving external readers or Parents outside the Core-qualified closed two-Workspace transaction remains fail-closed; third and unknown roots do not get automatic rewrite or unconditional no-reader certification.
- deferred-general-transition-editor
  - Kind: excluded-scope
  - Description: Save as Transition is intentionally hidden; original Core Definition/Generation/Companion authoring contracts remain, LLMs may author canonical artifacts with Core qualification; templates from three Evidence presets remain.
- historical-distinct-schema
  - Kind: excluded-scope
  - Description: actually distinct historical schema bytes do not become valid via pinned GitHub receipt alone; migration/verified older rules require later explicit approval. Authentic read-only GitHub HTTPS path on Windows should be reported separately if a real fixture exists.
- no-publication
  - Kind: excluded-scope
  - Description: Marketplace, npm, git push, remote writes, release promotion and valuable data mutations prohibited.

## Completion Expectation

- Signal Kind: disposition
- Signal Meaning: Sigma returns PASS / PASS WITH OBSERVATIONS / BLOCK plus first failed step and exact visible symptom; real historical HTTPS must be labelled PASS/BLOCK/NOT TESTED separately; no background debugging
- Return To: Anchor
- Return To Reference: [Anchor](business::.topics/roles/001-1-1-1-1-1-anchor-canonical-holder-cutover-role.trace.md)

## Interpretation Limits

- Does Not Mean: installed Windows acceptance, full reference closure outside qualified scope, general historical migration, executable Transition invocation or publication approval merely because this carrier is Core-qualified
- Must Not Be Used To Claim: Sigma PASS, Marketplace-ready documentation/reduction, real online GitHub test PASS or any authorized 3+ Workspace atomic mutation before independent evidence exists

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-19-8-sigma-scoped-windows-acceptance-task.trace.md](001-19-8-sigma-scoped-windows-acceptance-task.trace.md)
  - Value: i3ngluoEYF_JnJMUfDomojDHiK3lkDn7r6aLqSf-UOY

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: weE2gH1lq0VGot62L2e0Er4y9sWmRnCM4nRQeQo_JAQ