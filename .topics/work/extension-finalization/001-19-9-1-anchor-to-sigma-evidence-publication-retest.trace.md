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
  - Created At: 2026-10-10 17:39:39
  - Authors: Anchor
  - Why: A recorded Sigma BLOCK exposed a release metadata maintenance gap; source-proofed Evidence binding and centralized release checks are now ready for installed retest.
  - Summary: Corrected canonical Evidence publishing and existing schema release-gate; request installed Windows P0 retest, retain explicit stale-preview and Move/Rebase video observations.
  - Status: ready/local

---

# Anchor To Sigma — Pinned Evidence Publication and Windows Retest (001-19-9)

## Handoff Parties

- Purpose: retest the recorded Windows Evidence schema/permalink/Parent failure using a source-qualified first-party publication binding and a shared release gate; do not claim stale-preview or Move/Rebase video observations fixed without real Windows evidence
- From: Anchor
- From Kind: role
- From Reference: [Anchor](business::.topics/roles/001-1-1-1-1-1-anchor-canonical-holder-cutover-role.trace.md)
- To: Sigma
- To Kind: role
- To Reference: [Sigma](business::.topics/roles/001-4-1-1-sigma-role-canonical-assignment-modes-qualification-continuation.trace.md)

## Transfers

- pinned-evidence-windows-retest
  - Transfer Kind: work
  - Description: run the fresh Evidence creation → pinned Current Schema → qualified new Evidence Parent continuation on the exact installed Windows build; stop at first unexpected failure and return the precise form state and visible text. When these P0 steps PASS, resume the already scoped six-step Sigma acceptance for presets, PNG assets, semantic Move/Rebase and fail-closed external readers. Do not modify repository source as Sigma.
  - Controlling Artifact: [Current Windows Retest](001-19-9-sigma-evidence-publication-windows-retest-task.trace.md)
  - Boundary: no automatic Sigma PASS, no release/publish, no bypass of stale preview or unqualified Parent, no claim all previously filmed observations are closed

## Required Context

- current-windows-task
  - Material: self-contained Sigma Evidence permalink/Parent continuity retest and remaining scoped acceptance
  - Material Reference: [Current Windows Retest](001-19-9-sigma-evidence-publication-windows-retest-task.trace.md)
  - Purpose: prevent a non-pinned Evidence source and silent integrity patch from being accepted
  - Availability: available
- previous-sigma-candidate
  - Material: full 001-19-8 Anchor → Sigma candidate, whose actual Windows videos revealed the bare Evidence schema reference and subsequent Parent and stale-preview errors
  - Material Reference: [Previous Sigma Handoff](001-19-8-1-anchor-to-sigma-scoped-windows-gate.trace.md)
  - Purpose: preserve exact source lineage and record previously observed BLOCK
  - Availability: available
- controlling-task
  - Material: original owner VS Code extension integration and final acceptance task
  - Material Reference: [Extension Finalization](001-vscode-extension-integration-and-final-acceptance.trace.md)
  - Purpose: retain parent release and acceptance boundary
  - Availability: available
- first-party-evidence-package
  - Material: Native Evidence Semantic Package with three real Core-qualified Evidence Generation/Companion presets
  - Material Reference: [Native Evidence Semantic Package](native::.topics/.schemas/core/evidence/evidence-semantic-package.trace.md)
  - Purpose: preserve existing qualified preset semantics
  - Availability: available
- anchor-role
  - Material: Anchor source owner, repair and release controller
  - Material Reference: [Anchor Role](business::.topics/roles/001-1-1-1-1-1-anchor-canonical-holder-cutover-role.trace.md)
  - Purpose: return point for actual Windows findings
  - Availability: available
- sigma-role
  - Material: Sigma installed Windows acceptance owner
  - Material Reference: [Sigma Role](business::.topics/roles/001-4-1-1-sigma-role-canonical-assignment-modes-qualification-continuation.trace.md)
  - Purpose: exact human test recipient
  - Availability: available

## Reference Context

- published-evidence-source
  - Material: GitHub verified `Tiinex/docs` schema Git blob d73eca4ef294d2450faa2513c64e137bcf08e497, immutable commit 9ef3c2caed38152b1948c93cb45c985786660d91. Native Evidence binding was corrected in its existing V1 schema.json; `schemas sync` regenerated catalog/runtime. No new file format, fake commit, blanket republishing or Source-side Markdown patch.
  - Material Reference: [Previous Sigma Handoff](001-19-8-1-anchor-to-sigma-scoped-windows-gate.trace.md)
  - Purpose: explain changed first-party authority while preserving origin checkpoint
  - Availability: available
- shared-release-gate
  - Material: existing Core `schemas check --require-published` now fail-closes on absent/invalid pinned binding for all first-party schemas, and Native's existing release test checks offline binding/Docs byte invariants. Old Native checkpoint BLOCKS on Evidence; new one READY with 111 published schemas.
  - Material Reference: [Current Windows Retest](001-19-9-sigma-evidence-publication-windows-retest-task.trace.md)
  - Purpose: prevent recurrence in later first-party release candidates
  - Availability: available
- source-e2e-evidence
  - Material: 99-file Core 664 PASS 0 FAIL 1 SKIP, Native 8 PASS 0 FAIL, independent packed-Core consumer install and VS Code host/Transition regression PASS, static release check no errors/warnings. Fresh Evidence Create→Parent→Create and existing Core repair/reseal test PASS.
  - Material Reference: [Current Windows Retest](001-19-9-sigma-evidence-publication-windows-retest-task.trace.md)
  - Purpose: verify the exact fixed source and preserve independent Windows gate
  - Availability: available

## Retained Responsibilities

- anchor-source-failures
  - Retained By: Anchor
  - Responsibility: investigate any still-reproduced stale-preview, Move/Rebase destination UX, PNG reference or automatic technical preview only after exact observed failure; maintain Core authority, explicit closed scope and existing repair tooling
  - Boundary: no unsafe bypass, hidden technical debt, new schema convention, or silent revision of historical artefacts
- public-release
  - Retained By: Anchor
  - Responsibility: perform later Marketplace preflight, reduction, and separate publication authorization after installed Sigma acceptance
  - Boundary: no git push, npm publish, Marketplace action or remote change is authorized by this Handoff

## Exclusions And Dependencies

- installed-windows-acceptance
  - Kind: unresolved-dependency
  - Description: no Linux/source/packaged Core test proves user-installed Windows VSIX. Sigma must re-run exact candidate and report first unexpected failure.
- stale-preview-unverified
  - Kind: unresolved-dependency
  - Description: user video independently showed tiinex.authoring.preview-stale-recreate-required and later parent-blocked. New publication binding and repair tests do not prove the host preview lifecycle fixed; keep BLOCK if reproduced.
- move-and-assets-unverified
  - Kind: unresolved-dependency
  - Description: the ordinary file destination picker, PNG relocation/reference and technical preview shown in videos remain separate Windows observations until exact semantic command and post-Apply references are verified. No Core transaction changes made here.
- accepted-future-scope
  - Kind: excluded-scope
  - Description: general Save as Transition UI deliberately hidden, 3+ Workspace atomic external-reader update deferred, actually incompatible historical schemas BLOCK, no publication or remote mutation.

## Completion Expectation

- Signal Kind: disposition
- Signal Meaning: Sigma returns PASS, PASS WITH OBSERVATIONS or BLOCK with exact first failed Windows step and message; historic HTTPS PASS/BLOCK/NOT TESTED stated separately when applicable
- Return To: Anchor
- Return To Reference: [Anchor](business::.topics/roles/001-1-1-1-1-1-anchor-canonical-holder-cutover-role.trace.md)

## Interpretation Limits

- Does Not Mean: all Windows observations have already passed, that schema publication automatically repairs an older edited artifact, or that a third Workspace can be atomically rewritten
- Must Not Be Used To Claim: installed Windows acceptance, public release authority, real-network historical verification, arbitrary historical migration or feature completion beyond the exact reviewed scope

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-19-9-sigma-evidence-publication-windows-retest-task.trace.md](001-19-9-sigma-evidence-publication-windows-retest-task.trace.md)
  - Value: Lj6PB79HKrHOgRGN9TFRLzxL0QBK0ZwZknWxMWtZ8rw

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: tacBF1uMITsp4SShdl5KY1o9jniWO00uXOnJ02abuWs