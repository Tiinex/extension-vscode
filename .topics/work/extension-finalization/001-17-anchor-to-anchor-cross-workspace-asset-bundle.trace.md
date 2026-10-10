# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-10-09 20:50:08
  - Trace: [001-vscode-extension-integration-and-final-acceptance.trace.md](001-vscode-extension-integration-and-final-acceptance.trace.md)
  - Origin:
    - [relative](001-vscode-extension-integration-and-final-acceptance.trace.md)
- Current
  - Current Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-10-10 02:28:37
  - Authors: Anchor
  - Why: Preserve independently testable Core artifact and asset crash recovery with exact remaining P0 boundaries before Sigma.
  - Summary: Cross Workspace artifact+asset bundle Core/CLI/VS Code and tests; Parent, Evidence and Transition remain blocked.
  - Status: ready/local

---

# Anchor To Anchor — Bounded Cross-Workspace Artifact And Asset Bundle

## Handoff Parties

- Purpose: continue source-owned Move/Rebase and original Sigma P0 closure after qualifying a durable two-Workspace artifact+asset transaction, without confusing this bounded subset with full graph transport or installed Windows acceptance
- From: Anchor
- From Kind: role
- From Reference: [Anchor](business::.topics/roles/001-1-1-1-1-1-anchor-canonical-holder-cutover-role.trace.md)
- To: Anchor
- To Kind: role
- To Reference: [Anchor](business::.topics/roles/001-1-1-1-1-1-anchor-canonical-holder-cutover-role.trace.md)

## Transfers

- cross-workspace-parent-and-schema-continuation
  - Transfer Kind: work-and-responsibility
  - Description: continue Core-owned two-root lineage Move/Rebase from tested standalone artifact+assets toward qualified Parent/children/external references, then close historical Evidence Current Schema and reusable Transition UX with exact source tests and user acceptance
  - Controlling Artifact: [Extension Integration Task](001-vscode-extension-integration-and-final-acceptance.trace.md)
  - Boundary: only verified local code/tests; no automatic Sigma Role assignment, full Move/Rebase claim, npm/Marketplace publication, Git remote mutation or unreviewed schema migration

## Required Context

- controlling-extension-task
  - Material: original eight-lane VS Code finalization Task and previous user-reported Windows P0 failures
  - Material Reference: [Extension Integration Task](001-vscode-extension-integration-and-final-acceptance.trace.md)
  - Purpose: keep Evidence on Evidence, Attach yes, Save as Transition and Move/Rebase acceptance distinct and actionable
  - Availability: available
- preceding-anchor-handoff
  - Material: immediate preceding standalone two-root Apply and SIGKILL recovery checkpoint
  - Material Reference: [Previous Anchor Checkpoint](001-16-anchor-to-anchor-two-root-standalone-transfer.trace.md)
  - Purpose: preserve qualified immutable input, two-root journal, no-overwrite and recovery boundaries
  - Availability: available
- core-owner-task
  - Material: Core portable operation and agent/source owner Task
  - Material Reference: [Core Task](core::.topics/work/portable-agent-surfaces/001-portable-agent-capability-projection-and-synchronization-contrac.trace.md)
  - Purpose: ensure graph, assets, Parent and transactions remain portable and Core-owned
  - Availability: available
- anchor-role
  - Material: canonical Anchor Role
  - Material Reference: [Anchor Role](business::.topics/roles/001-1-1-1-1-1-anchor-canonical-holder-cutover-role.trace.md)
  - Purpose: exact continuation holder
  - Availability: available
- sigma-role
  - Material: canonical Sigma Role
  - Material Reference: [Sigma Role](business::.topics/roles/001-4-1-1-sigma-role-canonical-assignment-modes-qualification-continuation.trace.md)
  - Purpose: final-only human Windows observation after source qualification
  - Availability: available
- previous-sigma-test
  - Material: earlier Sigma Windows Handoff with unresolved observed user failures
  - Material Reference: [Previous Sigma Test](001-7-1-anchor-to-sigma-vscode-final-acceptance-handoff.trace.md)
  - Purpose: do not infer human PASS from current source/CLI testing
  - Availability: available

## Reference Context

- full-core-regression
  - Material: entire 96-file Core test suite over eleven complete shards, 626 PASS, zero FAIL and one SKIP; original eleven shard receipts 181 through 191 are carried
  - Material Reference: [Core Regression Summary](verification/180-effective15-full-core-regression.txt)
  - Purpose: source-wide nonregression and new mixed cross-root transaction tests
  - Availability: available
- bounded-bundle-and-recovery
  - Material: eight fresh tests for real artifact+PNG two-root Plan/Apply, source and output SHA, C14n, replay, incoming/dynamic reader block, SIGKILL during partial promotion, CLI recovery and explicit third-Workspace rejection
  - Material Reference: [Bundle Test Receipt](verification/192-effective15-bounded-two-root-bundle-focused.txt)
  - Purpose: qualified narrow executable scope and durable rollback
  - Availability: available
- standalone-manual-cli
  - Material: actual offline npm pack/install of @tiinex/core into isolated consumer; manually executed plan-cross-workspace-assets and apply-cross-workspace-assets, independently reopened actual target artifacts, checked PNG bytes and source absence, blocked stale replay
  - Material Reference: [Packaged Manual CLI](verification/194-effective15-packed-core-manual-cli.txt)
  - Purpose: first-class CLI usable by humans and sandboxed LLM agents rather than VS Code-only pathway
  - Availability: available
- packed-host
  - Material: complete VS Code host source suite against offline-installed Core tarball; real bounded cross-Workspace artifact+asset selection, preview, modal approval and physical Move/Rebase Apply PASS
  - Material Reference: [Packaged VS Code Host](verification/195-effective15-packed-vscode-host.txt)
  - Purpose: exact consumer ABI and thin host behavior
  - Availability: available
- transition-roundtrip
  - Material: prior Core-backed Transition Definition Create/persist/reopen source regression PASS
  - Material Reference: [Transition Roundtrip](verification/196-effective15-packed-transition-regression.txt)
  - Purpose: preserve existing source workflow but not claim one-click reusable Transition behavior
  - Availability: available
- precise-boundaries
  - Material: strict qualified subset, source change inventory, crash ownership boundaries and explicit remaining P0 blockers
  - Material Reference: [Effective Fifteen Safety Boundary](verification/199-effective15-precise-scope-and-safety.txt)
  - Purpose: prevent scope creep and false Sigma-ready promotion
  - Availability: available

## Retained Responsibilities

- core-owner
  - Retained By: Core
  - Responsibility: inspect both roots, determine exact asset ownership and target dimension, rewrite selected Markdown asset references, reseal self integrity, hold both locks and journals, restore only journal-owned source/target bytes after crash
  - Boundary: host must not calculate or bypass Core semantic/transaction authority
- final-sigma-observer
  - Retained By: Sigma
  - Responsibility: one bounded installed Windows extension acceptance test after all technical P0 owners are qualified
  - Boundary: no npm registry work, developer debugging, or open-ended repair loop

## Exclusions And Dependencies

- not-general-cross-workspace
  - Kind: excluded-scope
  - Description: executable bundle is only one Parentless Tiinex artifact with 1–16 exact-dimension opaque assets, Same + Keep Parent and reference-free supported-local source/target Workspaces. It is not Tree, Branch, child, retained-Parent or third-Workspace migration
- not-global-reference-certification
  - Kind: unresolved-dependency
  - Description: local inspectors and read-only Git/connector provenance do not prove no readers in unknown third Workspaces, archives or remote branches; explicit extra Workspaces block. General cross-Workspace Apply needs full closure or verified permalink rebind for every affected external Parent and reader
- historical-evidence
  - Kind: unresolved-dependency
  - Description: historical Evidence Current Schema Git revision still blocks Evidence-as-Parent without exact historical schema authority or approved qualified coordinated repair; fresh Evidence-as-Parent source test does not cure old Workspace bytes
- reusable-transitions
  - Kind: unresolved-dependency
  - Description: Transition Definition Create/reopen passes, but Save as Transition still does not infer incompatible source form values as legitimate Purpose/Role/Effect. Simple reusable authoring/invocation requires separate semantics instead of unsafe copying
- no-installed-windows
  - Kind: unresolved-dependency
  - Description: no actual Windows VSIX rebuild/installation or user Sigma test was performed; npm registry and Windows build remain user's environment boundary

## Verified Effective-Turn-15 Change

- New `src/tooling/portable/adapters/node/lineage.crossWorkspace.bundle.js`: Core-only strict source/target qualification for Scope Alone + Assets, Same, Keep Parent and exactly one Parentless artifact with 1–16 binary assets. Core independently inspects two supported-local Workspace roots and rejects declared third Workspace, external readers, retained Parent, children or programmable/dynamic text reference surfaces. Target artifact gets an available dimension; each asset inherits that exact dimension, source Markdown links to moved assets are rebound and C14n-v2 is resealed.
- Bundle plan/project independently binds exact source/output SHA-256 and both immutable Workspace snapshots; Apply recomputes the full physical plan under the real owner contract. One mirrored two-root durable journal, cooperative locks, per-file stage/backup, EEXIST-exclusive hardlink promotion and inode-qualified rollback protect unexpected target bytes. Manual recovery after SIGKILL at source staging, first-target promotion and complete output promotion restores BOTH original source files. A committed journal releases locks before best-effort journal garbage collection.
- New Core CLI `plan-cross-workspace-assets --request`, `apply-cross-workspace-assets --plan` and `recover-cross-workspace-assets --request`, Core public Node exports and help/README. VS Code scoped Move/Rebase uses Core plan/Apply for the exact qualified cross-Workspace Alone+Assets Same+Keep choice, with explicit Preview and modal consent. Every other cross-Workspace choice retains the older read-only Git/Parent recovery hints.
- Tests: complete 96 Core files, 626 PASS/zero FAIL/one SKIP; eight focused new mixed transaction/CLI/crash tests PASS; offline npm pack→isolated reinstall→real CLI Plan/Apply→C14n/binary/replay verification PASS; packed VS Code host P0 suite, Transition Create/reopen and static release-check PASS. No user Windows acceptance was performed.

## Next Bounded Steps

1. Cold start from exact Anchor pointer and verify 17 Workspaces, two changed, fifteen untouched, exact carried test receipts, and refused wrong Role/route.
2. Build Core cross-Workspace graph+asset+reader-closure with qualified children/Parent and verified immutable Browse+Git permalink fallback. A two-root snapshot is not global read authority; never fabricate it or report a partial move as ready.
3. Qualify historical Evidence Current Schema authority using read-only provider/connector proof where available; otherwise offer explicit scoped safe repair with full descendant digest cascade, never silently upgrade historical schema versions. Verify existing and fresh Evidence-as-Parent via CLI and audit.
4. Redesign reusable Transition/form authoring so people and LLMs can repeat safely without refilling incompatible schemas; preserve original fields and source provenance, require explicit semantic mapping for Purpose/Role/Effect instead of inventing it.
5. Repeat manual offline-packed CLI, negative crash/drift, host and Core tests; only after all P0 gates, prepare one bounded Sigma Windows Handoff. User owns local VSIX/npm switch and final Windows acceptance.

## Completion Expectation

- Signal Kind: result
- Signal Meaning: successor Anchor resumes full closure/Evidence/Transition from exact new mixed asset Core milestone, with safety gaps explicit; separate Sigma handoff only when qualified
- Return To: Anchor

## Interpretation Limits

- Does Not Mean: all Cross-Workspace selections and Parent policies executable, a third-Workspace reader absent, the historical Evidence migration done, reusable Transition UX complete or Windows acceptance passed
- Must Not Be Used To Claim: a multi-root transaction is an instantaneous atomic filesystem rename, unknown remote references are verified, Git publication exists merely because local Git does, or current source tests are equivalent to Sigma human acceptance

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-vscode-extension-integration-and-final-acceptance.trace.md](001-vscode-extension-integration-and-final-acceptance.trace.md)
  - Value: cjZcy22E70O7lAaL4bykf-sJEEvjp1a8E-CoCj6zXOo

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: BJUkSbaJ5-mPhzRMdoQpMmEEq-G44ULgFdqbykuAsLQ