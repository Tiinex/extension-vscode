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
  - Created At: 2026-10-10 01:50:12
  - Authors: Anchor
  - Why: Preserve independently runnable two-root reference-closure preview before adding source-destination transaction authority.
  - Summary: Core two physical Workspace snapshots, incoming and Parent references, separate immutable Git read recovery; Apply remains blocked.
  - Status: ready/local

---

# Anchor → Anchor — Cross-Workspace Dual-Snapshot Continuity Preflight

## Handoff Parties

- Purpose: continue Core-owned joint source+target Workspace Move/Rebase from a physically tested read-only dual snapshot, incoming/outgoing reference classification, per-Parent GitHub read-only recovery and independently runnable CLI; keep unqualified two-root mutation safely blocked
- From: Anchor
- From Kind: role
- From Reference: [Anchor](business::.topics/roles/001-1-1-1-1-1-anchor-canonical-holder-cutover-role.trace.md)
- To: Anchor
- To Kind: role
- To Reference: [Anchor](business::.topics/roles/001-1-1-1-1-1-anchor-canonical-holder-cutover-role.trace.md)

## Transfers

- cross-workspace-two-root-continuity-transaction
  - Transfer Kind: work-and-responsibility
  - Description: extend independently qualified source and target reference inventories, exact original Parent and asset relations and read-only immutable Git publication evidence into a fail-closed, complete, atomic two-Workspace source/destination transaction; preserve standalone Core CLI and a thin VS Code host before returning Evidence and Transition original P0 issues
  - Controlling Artifact: [VS Code Extension Finalization](001-vscode-extension-integration-and-final-acceptance.trace.md)
  - Boundary: local source and test scope only; no GitHub remote mutation, arbitrary parent retargeting, implicit complete global reference claims, Sigma acceptance or role reassignment

## Required Context

- controlling-extension-task
  - Material: original eight-lane VS Code integration and Sigma final acceptance Task
  - Material Reference: [Extension Task](001-vscode-extension-integration-and-final-acceptance.trace.md)
  - Purpose: preserve original user-observed Windows P0 conditions and final acceptance boundary
  - Availability: available
- prior-anchor-git-handoff
  - Material: immediately previous read-only immutable Git publication and connector recovery checkpoint
  - Material Reference: [Previous Anchor Handoff](001-14-anchor-to-anchor-cross-workspace-git-publication-evidence.trace.md)
  - Purpose: retain previous commit/path/bytes authority distinction and safe connector alternatives
  - Availability: available
- core-agent-owner
  - Material: Core portable operation/capability source authority Task
  - Material Reference: [Core Agent Task](core::.topics/work/portable-agent-surfaces/001-portable-agent-capability-projection-and-synchronization-contrac.trace.md)
  - Purpose: do not create an independent VS Code graph rewrite or private host-only tools
  - Availability: available
- anchor-role
  - Material: canonical Business Anchor role
  - Material Reference: [Anchor Role](business::.topics/roles/001-1-1-1-1-1-anchor-canonical-holder-cutover-role.trace.md)
  - Purpose: preserve qualified selected continuation and holder role
  - Availability: available
- sigma-role
  - Material: canonical Business Sigma role
  - Material Reference: [Sigma Role](business::.topics/roles/001-4-1-1-sigma-role-canonical-assignment-modes-qualification-continuation.trace.md)
  - Purpose: maintain final installed Windows human acceptance boundary
  - Availability: available
- prior-sigma-result
  - Material: earlier Anchor→Sigma Windows acceptance that exposed the remaining practical P0 symptoms
  - Material Reference: [Prior Sigma Handoff](001-7-1-anchor-to-sigma-vscode-final-acceptance-handoff.trace.md)
  - Purpose: prevent false completed P0 assertions from noninstalled source tests
  - Availability: available

## Reference Context

- full-core-tests
  - Material: all 94 Core .test.mjs files in eleven independently completed shards: 610 PASS, zero FAIL, one SKIP; original shard logs 141–151 carried
  - Material Reference: [Full Core Shards](verification/140-effective13-core-full-shards.txt)
  - Purpose: preserve source-wide regression and first-party test coverage
  - Availability: available
- focused-dual-workspace-regressions
  - Material: 15 focused Source/Git/double-Workspace tests including physically separate source and target, incoming link, actual retained Parent, bad/symlink/missing anchor, manual CLI and snapshot drift
  - Material Reference: [Cross-Workspace Focus](verification/152-effective13-core-cross-focused.txt)
  - Purpose: direct Core positive classification and fail-closed mutation negative coverage
  - Availability: available
- portable-actual-cli
  - Material: installed offline-packed Core CLI two-root inspection result, physical source+target SHA-256 snapshots, source reader and retained Parent dependencies
  - Material Reference: [Manual Two-Root CLI](verification/153-effective13-core-cross-manual-preview.txt)
  - Purpose: manual non-VS Code first-class action; inspected but executable false
  - Availability: available
- drift-recheck
  - Material: exact previously inspected two-root snapshots reverified, and a target-Workspace injected file found on the subsequent recheck with BLOCK
  - Material Reference: [Clean Recheck](verification/154-effective13-core-two-root-snapshot-recheck.txt)
  - Purpose: distinguish safe read receipts from unreviewed filesystem drift
  - Availability: available
- drift-block
  - Material: target Workspace changed after Preview; CLI returned blocked and zero source/target mutation
  - Material Reference: [Drift BLOCK](verification/155-effective13-core-two-root-snapshot-drift.txt)
  - Purpose: require both roots to remain byte-identical before future mutation is even contemplated
  - Availability: available
- actual-packed-host
  - Material: VS Code authoring host regression against offline-installed @tiinex/core with scoped different-Workspace target anchor and safe read-only BLOCK
  - Material Reference: [Packaged Core Host](verification/156-effective13-packed-core-host.txt)
  - Purpose: ensure the host consumes Core's exact multi-root inspection rather than rejecting cross-workspace target paths prematurely or inventing Apply
  - Availability: available
- transition-source-check
  - Material: existing Transition Definition Create/persist/reopen source test PASS, repeatable human form UX not qualified
  - Material Reference: [Transition Source Regression](verification/157-effective13-packed-core-transition.txt)
  - Purpose: protect previous source-level behavior while user ergonomics remains open
  - Availability: available
- exact-boundary
  - Material: file-by-file Core/VS Code change inventory, manual CLI steps and explicit unqualified dual-root Apply, global reference reachability and Git evidence limits
  - Material Reference: [Qualification Frontier](verification/159-effective13-core-preview-only-boundaries.txt)
  - Purpose: avoid treating read-only dual root preview as atomic cross-Workspace relocation authority
  - Availability: available

## Retained Responsibilities

- source-graph-and-recovery-owner
  - Retained By: Core
  - Responsibility: Workspace source/target identity, qualified incoming/outgoing references, exact numeric coordinate vs semantic Parent, per-Parent published immutable Git proof, same journal across both roots only after proof of atomicity, rollback and reproducible CLI
  - Boundary: no VS Code-specific duplicate graph owner or temporary convenience filename rewrite
- sigma-installed-verification
  - Retained By: Sigma
  - Responsibility: one bounded installed Windows extension acceptance after actual user P0 closure
  - Boundary: not a patch developer, npm publisher or registry-debugger

## Exclusions And Dependencies

- no-remote-writes
  - Kind: excluded-scope
  - Description: no GitHub write, npm/Marketplace publish, remote worktree mutation, Role assignment, full Sigma gate or Task closure
- cross-workspace-executable-plan
  - Kind: unresolved-dependency
  - Description: existing source+destination Workspace identity model and transaction journal need a fully qualified multi-root apply with incoming reference rewrite and rollback; new two-root inspector returns BLOCK/executable:false until this is implemented and proven
- global-reference-and-git-closure
  - Kind: unresolved-dependency
  - Description: local two-root physical scans exclude ignored directories, dynamic/runtime/binary metadata and any undeclared third Workspace; accepted commit-pinned exact remote bytes from a read-only connector are required for historical Git Parent/Browse continuity rather than merely a URL or local Git object
- evidence-current-schema
  - Kind: unresolved-dependency
  - Description: historical Evidence Current Schema authority drift and Evidence-on-Evidence reparent qualification remain P0 issues; qualify an explicit migration and post-create/reopen audit
- reusable-transition-form
  - Kind: unresolved-dependency
  - Description: repeat/Save as Transition preserving original field values without extra manual form remains an original user UX task
- installed-windows-proof
  - Kind: unresolved-dependency
  - Description: offline Core .tgz and host tests alone are not installed Windows VSIX acceptance

## Verified Effective-Turn-13 Changes

- Factored `inspectPortableWorkspaceReferenceInventory` out of existing Core single-Workspace scanner so both consumers read the same exact physical supported-local snapshot authority; previous single-Workspace Core behavior and tests still pass.
- NEW `lineage.crossWorkspace.inspect.js`: read-only two-root Workspace inspection, exact selected graph/asset inventory, qualified existing target anchor, incoming references in both roots, retained Parent dependencies and distinct immutable GitHub repository-read recovery for each needed historical Parent. No source/destination file mutation. Source and destination SHA-256 manifests are explicit; a new independently runnable recheck compares both roots and blocks drift before any future mutation.
- Core CLI `inspect-cross-workspace-continuity --request` and `recheck-cross-workspace-continuity --request` are exposed from an independently packed/installed @tiinex/core. The first returns BLOCK/executable:false with reasons and Git connector suggestions, the latter gives read-only PASS only while both roots match. No live remote GitHub operation or manufactured proof occurred.
- VS Code scoped Explorer target anchor may belong to a second qualified physical local Workspace and calls the same Core dual-root inspector, showing bounded reason and read-only repository-read hint; it never calls Apply for cross-Workspace today. Host tests confirm original source and destination bytes unchanged.
- Verified 94/94 Core files (610 PASS, zero FAIL, one SKIP) in eleven terminated shards; targeted 15 Core cross-workspace/publication/reference-inspection tests PASS; offline tarball installed Core manual preview/recheck/drift CLI and authoring/Transition host + static release-check PASS.

## Next Bounded Steps

1. Orient and ground exact Anchor pointer of this native 17-Workspace carrier; verify changed Core+VS Code only, 15 byte-identical Workspaces and physical receipts, wrong Role/route BLOCK.
2. Design and qualify a Core multi-root transaction model with separate `fromWorkspaceId` and `toWorkspaceId`, exact selected artifact/asset byte binding, target numeric-coordinate reservation, qualified Parent+incoming/outgoing live reference rewrites and source/destination SHA snapshots. Preflight everything, then one durable two-root Apply/rollback and genuine CLI tests. Never treat an inspected Git permalink as a replacement for actual journaled reference continuity.
3. Integrate exact read-only GitHub connector evidence into each broken Parent and incoming reader, accepting only immutable commit/path/sha-matched provider receipts or blocking; support alternate host read tools for sandboxed LLMs.
4. Repair historical Evidence Current Schema and Evidence-on-Evidence; qualify repeatable Transition/form from carried source values for both agents and humans.
5. Repack Core offline, run full source/host and negative two-root rollback/collision/drift tests, create separate bounded Sigma Handoff only after all P0 original user acceptance conditions pass.

## Completion Expectation

- Signal Kind: result
- Signal Meaning: next Anchor extends the proven dual-root preview to an atomic qualified transaction or preserves exact safe blockers; then completes Evidence/Transition, not premature Sigma
- Return To: Anchor

## Interpretation Limits

- Does Not Mean: any Cross-Workspace file was moved, multi-root Apply was authorized, remote GitHub publication was actually verified, external unknown references are absent or Sigma accepted
- Must Not Be Used To Claim: a passing read-only snapshot recheck equals transaction authority, all references in unseen Workspaces are known or historical Parent identity can be silently changed

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-vscode-extension-integration-and-final-acceptance.trace.md](001-vscode-extension-integration-and-final-acceptance.trace.md)
  - Value: cjZcy22E70O7lAaL4bykf-sJEEvjp1a8E-CoCj6zXOo

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: KbRSCVMskN_Ws0S3IN6XHjoSik4blIqq9Lu8hRVh8RU