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
  - Created At: 2026-10-10 02:10:01
  - Authors: Anchor
  - Why: Establish tested two-root transfer authority without inventing Parent or multi-file cross-Workspace continuity.
  - Summary: One bounded cross-Workspace Alone Same Keep Parent with journaled two-root rollback, real CLI and host tests; full lineage/Evidence/Transition remain.
  - Status: ready/local

---

# Anchor To Anchor — Bounded Two-Root Cross-Workspace Apply

## Handoff Parties

- Purpose: preserve first executable, manually CLI-verified two-Workspace transfer and crash recovery while keeping all unsupported Parent, asset and external-reference cases blocked before Sigma
- From: Anchor
- From Kind: role
- From Reference: [Anchor](business::.topics/roles/001-1-1-1-1-1-anchor-canonical-holder-cutover-role.trace.md)
- To: Anchor
- To Kind: role
- To Reference: [Anchor](business::.topics/roles/001-1-1-1-1-1-anchor-canonical-holder-cutover-role.trace.md)

## Transfers

- bounded-cross-workspace-move-continuation
  - Transfer Kind: work-and-responsibility
  - Description: Extend a qualified Core-only standalone two-root journal into full five-scope cross-Workspace Move/Rebase with explicit Parent, selected assets, incoming and outgoing reference rewrites and publication evidence; then finish Evidence and reusable Transition UX
  - Controlling Artifact: [VS Code Finalization Task](001-vscode-extension-integration-and-final-acceptance.trace.md)
  - Boundary: source-only local development; no remote Git mutation, implicit Role grants, npm/Marketplace publication or inferred installed Windows Sigma acceptance

## Required Context

- controlling-task
  - Material: original eight-lane VS Code integration, P0 user observations and final acceptance boundary
  - Material Reference: [VS Code Finalization Task](001-vscode-extension-integration-and-final-acceptance.trace.md)
  - Purpose: retain all originally reported Windows failures without prematurely closing the gate
  - Availability: available
- previous-anchor-handoff
  - Material: immediately preceding read-only two-Workspace snapshot/incoming Parent and Git connector recovery checkpoint
  - Material Reference: [Previous Anchor Checkpoint](001-15-anchor-to-anchor-cross-workspace-two-root-snapshot.trace.md)
  - Purpose: dual source/target Workspace inventory and bounded incoming reference authority
  - Availability: available
- core-owner
  - Material: portable Core tooling and host-source authority task
  - Material Reference: [Core Task](core::.topics/work/portable-agent-surfaces/001-portable-agent-capability-projection-and-synchronization-contrac.trace.md)
  - Purpose: Core, not VS Code, owns numeric and semantic graph, reference rewriting and transaction mechanics
  - Availability: available
- anchor-role
  - Material: canonical Business Anchor role
  - Material Reference: [Anchor Role](business::.topics/roles/001-1-1-1-1-1-anchor-canonical-holder-cutover-role.trace.md)
  - Purpose: valid exact holder and next branch recovery
  - Availability: available
- sigma-role
  - Material: canonical Sigma role
  - Material Reference: [Sigma Role](business::.topics/roles/001-4-1-1-sigma-role-canonical-assignment-modes-qualification-continuation.trace.md)
  - Purpose: bounded installed Windows human test only at actual completion
  - Availability: available
- prior-sigma-test
  - Material: last blocked installed Windows Sigma acceptance handoff
  - Material Reference: [Prior Sigma Handoff](001-7-1-anchor-to-sigma-vscode-final-acceptance-handoff.trace.md)
  - Purpose: prevent a Core CLI success from being mistaken for a user Windows pass
  - Availability: available

## Reference Context

- full-core-regression
  - Material: complete 95-file Core test suite, 11 independent terminated shards, 618 PASS, zero FAIL, one SKIP; shard receipts 161 through 171 carried
  - Material Reference: [Full Core Shards](verification/160-effective14-core-full-shards.txt)
  - Purpose: source-wide nonregression of lineage, publication and transaction functions
  - Availability: available
- focused-crash-recovery
  - Material: eight tests for qualified single-artifact cross-root Apply, incoming/drift/asset/dynamic blocks, source restoration on injected error, real SIGKILL after target promotion, journal phase divergence, manual CLI recovery, active plan tamper denial and target reference insertion mid-transaction
  - Material Reference: [Cross Root Focus](verification/172-effective14-two-root-transaction-focused.txt)
  - Purpose: exact positive and negative two-root transaction assurance
  - Availability: available
- actual-packed-cli
  - Material: offline-installed @tiinex/core package, independent CLI plan-cross-workspace-standalone and apply-cross-workspace-standalone, physical relocated file bytes/C14n verification and stale replay BLOCK
  - Material Reference: [Manual Packed CLI](verification/173-effective14-packed-core-manual-cli.txt)
  - Purpose: demonstrate tooling works outside VS Code for humans and sandboxed LLMs
  - Availability: available
- packed-vscode
  - Material: host P0 full regression against installed local Core .tgz, positive reviewed bounded Cross-Workspace Apply and blocked broader read-only case
  - Material Reference: [Packed Core Host](verification/174-effective14-packed-vscode-host.txt)
  - Purpose: preserve thin host and user consent boundaries
  - Availability: available
- transition-roundtrip
  - Material: packed Core Create→persist→reopen Transition Definition source test PASS
  - Material Reference: [Transition Source](verification/175-effective14-packed-transition.txt)
  - Purpose: retain the earlier limited flow while repeatable forms remain open
  - Availability: available
- detailed-qualification
  - Material: precise qualified operation, two-root journal/recovery behavior and blocked unsafe cases
  - Material Reference: [Scope and Safety](verification/178-effective14-scope-and-safety.txt)
  - Purpose: stop next Anchor from confusing a standalone vertical slice with full cross-Workspace graph transfer
  - Availability: available

## Retained Responsibilities

- core-only-two-root-owner
  - Retained By: Core
  - Responsibility: owner of physical dual-Workspace reference inspection, snapshot/read receipt, semantic Parent limits, numeric target allocation, two-root journaling and crash recovery with direct CLI exposure
  - Boundary: host never fabricates Parent/references or bypasses Core qualification
- final-windows-acceptance
  - Retained By: Sigma
  - Responsibility: one installed Windows final user observation only after original P0 gates are complete
  - Boundary: no forced npm publish or debugger role

## Exclusions And Dependencies

- no-general-cross-workspace-release
  - Kind: excluded-scope
  - Description: only Alone + Same + Keep Parent with a parentless, descendantless, reference-free source artifact can execute; no selected asset, child, incoming reader, retained Parent or Git-dependent link may pass Apply
- external-reference-rewrite
  - Kind: unresolved-dependency
  - Description: qualified cross-Workspace reference rewriting and immutable Git permalink on left-behind Parent, and multi-file cross-root artifact+asset transactions remain future work; current API returns BLOCK and connector read recovery hints
- non-instantaneous-two-root-visibility
  - Kind: excluded-scope
  - Description: a cross-root transfer has separate source backup and non-overwriting target promotion with crash journal rollback; it is a compensating durable transaction and cannot be called a single instantaneous filesystem operation
- evidence-historical-schema
  - Kind: unresolved-dependency
  - Description: historical Evidence Current Schema revision drift and Evidence-as-Parent recovery are not repaired by cross-Workspace transfer
- transition-repeat-ux
  - Kind: unresolved-dependency
  - Description: Save as Transition and reusable human/agent form defaults remain incomplete despite Definition roundtrip source success
- actual-windows-vsix
  - Kind: unresolved-dependency
  - Description: local offline package and simulated VS Code host are not installed Windows VSIX acceptance; no Sigma handoff in this checkpoint

## Verified Effective-Turn-14 Source Changes

- Core created `src/tooling/portable/adapters/node/lineage.crossWorkspace.transfer.js` with `inspectPortableCrossWorkspaceStandaloneTransfer`, `applyPortableCrossWorkspaceStandaloneTransfer`, `recoverPortableCrossWorkspaceTransfer`; exports via public Node and CLI `plan-cross-workspace-standalone`, `apply-cross-workspace-standalone`, `recover-cross-workspace-standalone`.
- Planner uses existing full source/target Core inspector and rechecks all supported-local reference evidence, denies incoming readers/retained Parents/assets/dynamic formats, verifies original C14n-v2 self, allocates one distinct target numeric sibling with unchanged semantic Parent, and binds source SHA-256/strong fingerprint and two snapshot digests.
- Apply independently rebuilds the complete plan before and under locks, stages exact bytes on target, journals identical full transaction identities in BOTH roots, moves source into a durable backup, checks target snapshot once more after source staging, promotes with a non-overwriting hardlink, and verifies exact output SHA-256/C14n and old source removal. One two-root compensating journal handles injected errors, SIGKILL crash recovery, phase-divergent journal updates and unknown-byte collision refusal.
- VS Code `lineageMaintenance.ts` surfaces an explicit review/confirm/Apply for only the ready Core qualified subset; all remaining Cross-Workspace cases retain read-only inspection/connector recovery hints and BLOCK.
- Fresh full 95 Core test files 618 PASS, 0 FAIL, 1 SKIP; independent manually installed offline Core CLI PLAN→APPLY→physical-byte-reopen PASS, hosted VS Code regression and Transition source PASS, static release audit without warnings. No actual user Windows visual acceptance claimed.

## Next Bounded Steps

1. Cold-ground exact Anchor carrier, verify 17 Workspaces, only Core/VS Code changed, original 19 test/proof receipts physically carried and every other Workspace byte-identical.
2. Extend Core journal change model for selected assets and multiple `.trace.md` files with full qualified incoming/outgoing references and deterministic cascade/rollback, including all five selection scopes. Keep every unqualified case BLOCK and manually test the packed CLI.
3. Feed accepted immutable GitHub read-only host receipts into reference rewriting only when each retained Parent and remote reader's exact commit/path/bytes matches. Never infer push from local `.git` or automatically mutate GitHub.
4. Repair historical Evidence Current Schema and audit Evidence-as-Parent from both old and new creation flows; simplify Save as Transition, reusable form defaults and value-preserving human/LLM Repeat.
5. Re-run packed Core, full host and negative CLI suite; only then create a separately bounded Sigma installed Windows handoff. User owns local Windows npm/build tests, not earlier Core development.

## Completion Expectation

- Signal Kind: result
- Signal Meaning: next Anchor continues general graph/asset/Parent cross-Workspace and Evidence/Transition P0 from exact bounded source and negative receipts, without claiming full Sigma acceptance
- Return To: Anchor

## Interpretation Limits

- Does Not Mean: full cross-Workspace Move/Rebase, global arbitrary runtime reference closure, remote Git publication, imported assets, historical Evidence repair, intuitive Transition Repeat, Marketplace readiness or installed Windows acceptance already proven
- Must Not Be Used To Claim: complete multi-Workspace graph mutation from one standalone artifact transfer, all links safe, or any remote Workspace or role was mutated

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-vscode-extension-integration-and-final-acceptance.trace.md](001-vscode-extension-integration-and-final-acceptance.trace.md)
  - Value: cjZcy22E70O7lAaL4bykf-sJEEvjp1a8E-CoCj6zXOo

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: BQM0a7gRYIawAqNhZ5mbLko4S-gtpPljfnZiO24d13w