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
  - Created At: 2026-10-10 00:13:15
  - Authors: Anchor
  - Why: Prevent partial Move/Rebase execution and preserve semantic Parent continuity under the owner contract.
  - Summary: Core five-scope selection and scoped Same/Keep Parent identity plus asset reference false-positive regression.
  - Status: ready/local

---

# Anchor To Anchor — Move Selection And Parent Continuity Phase 1

## Handoff Parties

- Purpose: continue the root-cause redesign of Core Move/Rebase after Sigma's failed Windows acceptance, carrying the first qualified safe graph-selection, Same+Keep Parent continuity, false-positive asset inspection correction and exact unresolved feature matrix
- From: Anchor
- From Kind: role
- From Reference: [Anchor](business::.topics/roles/001-1-1-1-1-1-anchor-canonical-holder-cutover-role.trace.md)
- To: Anchor
- To Kind: role
- To Reference: [Anchor](business::.topics/roles/001-1-1-1-1-1-anchor-canonical-holder-cutover-role.trace.md)

## Transfers

- bounded-move-rebase-redesign-continuation
  - Transfer Kind: work-and-responsibility
  - Description: build one Core-owned graph selection/placement/reference closure and atomic transaction for Alone, Alone+Assets, Self+Leaves, Branch, Tree; preserve semantic Parent identity on Keep with qualified relative/Workspace references, complete external reference closure and verified Git permalink only when needed; align Attach/Transition host UX after the Core gate
  - Controlling Artifact: [Extension Finalization](001-vscode-extension-integration-and-final-acceptance.trace.md)
  - Boundary: no premature Sigma acceptance, no remote publication or implicit Role grants; preserve user assets/lineage on cancel/block/failure

## Required Context

- controlling-integration-task
  - Material: exact eight-lane VS Code finalization and acceptance Task
  - Material Reference: [Extension Finalization](001-vscode-extension-integration-and-final-acceptance.trace.md)
  - Purpose: maintain owner boundaries and original unresolved P0 cases
  - Availability: available
- previous-sigma-handoff
  - Material: existing Anchor to Sigma acceptance Handoff, which is BLOCK after video feedback and is superseded by this Anchor continuation
  - Material Reference: [Prior Sigma Handoff](001-7-1-anchor-to-sigma-vscode-final-acceptance-handoff.trace.md)
  - Purpose: do not assume Sigma's Windows PASS; specific user observations govern corrective work
  - Availability: available
- previous-anchor-handoff
  - Material: qualified earlier Anchor post-Sigma recovery
  - Material Reference: [Previous Anchor Recovery](001-8-anchor-to-anchor-post-sigma-gate-recovery.trace.md)
  - Purpose: exact source frontier and portable `npm pack` integration test contract
  - Availability: available
- core-ownership
  - Material: Core portable operation/capability projection Task
  - Material Reference: [Core Task](core::.topics/work/portable-agent-surfaces/001-portable-agent-capability-projection-and-synchronization-contrac.trace.md)
  - Purpose: keep Core owner for graph transformation and safe references, not host approximations
  - Availability: available
- canonical-anchor-role
  - Material: canonical Business Anchor Role
  - Material Reference: [Anchor Role](business::.topics/roles/001-1-1-1-1-1-anchor-canonical-holder-cutover-role.trace.md)
  - Purpose: qualified local continuation rather than an inferred Sigma transfer
  - Availability: available
- canonical-sigma-role
  - Material: canonical Business Sigma Role
  - Material Reference: [Sigma Role](business::.topics/roles/001-4-1-1-sigma-role-canonical-assignment-modes-qualification-continuation.trace.md)
  - Purpose: eventual bounded Windows acceptance only after internal gates
  - Availability: available

## Reference Context

- core-focused-proof
  - Material: fresh targeted Core lineage/apply/transaction/assets/C14n tests, 65 PASS/0 FAIL
  - Material Reference: [Core Focused](verification/045-core-continuity-focused.txt)
  - Purpose: evidence for non-regression of existing semantic and rollback paths
  - Availability: available
- core-final-guards-proof
  - Material: fresh 18 PASS/0 FAIL after source-guard updates
  - Material Reference: [Final Scope Tests](verification/046-core-asset-selection.txt)
  - Purpose: five scope projection, exact Parent identity, immutable Parent digest, asset false positives, unsupported placement/cross-Workspace denials
  - Availability: available
- installed-tarball-consumer
  - Material: offline `npm pack` latest Core, isolated reinstall then VS Code host regression PASS
  - Material Reference: [Packed Core Host](verification/047-packed-core-vscode-host.txt)
  - Purpose: no source-only assumption for VS Code consumption
  - Availability: available
- incomplete-broad-suite
  - Material: sandbox interrupted full sharded Core attempt, no terminal pass receipt; explicit bounded limits and unfinished features
  - Material Reference: [Broad Run Block](verification/048-broad-core-incomplete.txt)
  - Purpose: prevent overclaiming broad Core suite or new Sigma gate
  - Availability: available
- source-change-inventory
  - Material: exact Core files changed and pending owner work
  - Material Reference: [Source Changes](verification/049-core-selection-implementation.txt)
  - Purpose: fast local recovery without duplicate patches
  - Availability: available

## Retained Responsibilities

- core-graph-and-transaction-ownership
  - Retained By: Core / Native
  - Responsibility: authoritative Parent graph, dimensions, schema qualification, binary/artifact combined transaction, reference closure, Git publication validation and integrity first-parent reseal
  - Boundary: host can select files and display preview, never invent or bypass link semantics
- host-and-final-acceptance
  - Retained By: VS Code / Sigma
  - Responsibility: VS Code owns thin target-anchor + scope/placement/Parent choice UX, Sigma owns one final installed Windows observation only
  - Boundary: no invisible partial Apply or human debugging as qualification

## Exclusions And Dependencies

- no-sigma-yet
  - Kind: excluded-scope
  - Description: current phase is not a full Move/Rebase rework and is explicitly NOT Sigma-ready
- atomic-mixed-assets
  - Kind: unresolved-dependency
  - Description: Core selector identifies exact-dimension assets but scoped Apply intentionally blocks until binary+artifact+external references share one journal/rollback contract
- graph-parent-policy
  - Kind: unresolved-dependency
  - Description: new scoped Prepend/Append parent policies and fork/cycle/target transforms require separate qualification; Same+Keep Parent is the only currently executable new scoped placement
- cross-workspace-and-git
  - Kind: unresolved-dependency
  - Description: automatic cross-Workspace move and Browse+Git historical permalink fallback are not implemented; fail closed rather than silently losing relative continuity
- historical-evidence-and-transition
  - Kind: unresolved-dependency
  - Description: historical Current Schema repair, Evidence-on-Evidence qualification and Save as Transition repeat ergonomics remain unfixed in this phase, not implicitly closed by source tests

## Verified Effective-Turn-7 Findings

- Move scopes defined as Alone, Alone+Assets (exact same dimension), Self+Leaves (semantic descendants and their assets), Branch (ascend until but not including fork, then descend), Tree (local root and all local descendants); selection never includes files outside original source directory.
- `scoped-move` Same+Keep Parent runs through existing durable `projectPortableLineageMaintenance` and `applyPortableLineageMaintenancePlan` only when all Parent materials are present. A new postcondition verifies exact resolved Parent identity and matching verified parent digest at the *destination* after reference rewrite; missing Parent, unsupported scope/placement and cross-Workspace are blocked. Tests include actual Apply and stale-input negative.
- Asset Workspace inspection had a false positive on arbitrary non-Markdown filename mentions, including unrelated `test/run.mjs`. Now requires a path literal resolvable from that file to the source asset, while genuine unsafe TS/HTML asset references still block, and Markdown links are still rebound in a durable transaction.
- Fresh 65 Core tests PASS, subsequent 18 tests PASS, offline `npm pack`→install→VS Code host regression PASS. Broader Core run interrupted with no terminal receipt. No npm registry/publish focus, as user owns Windows build.

## Next Bounded Steps

1. Add Core mixed artifact+asset journal support and complete pre/post reference closure (including external readers); test collision, drift, symlink, interrupted Apply and rollback for all five scopes. Never allow user-visible scope to report success with omitted assets.
2. Qualify Placement `Prepend`, `Same`, `Append` plus Parent Policy `Keep`/`New`; Prepend only when selection has a straight semantic chain; explicitly guard forking/multiple roots, target children, cycles, coordinate collision and full integrity cascade. Keep Parent must always retain its original semantic identity after path rewrite.
3. Cross-Workspace: qualify live reference policy, handle surviving inbound/outbound edges, then verify exact commit-pinned Browse+Git publication evidence as historical fallback or block; never invent a URL or substitute branch HEAD.
4. Integrate thin VS Code UX picking scope and existing trace target, no host graph logic; then map Attach Yes to Same/artifact planned dimension and slug-local `-01/-02` numbering, all at Create.
5. Fix Core/Native Current Schema drift for historical Evidence, validate after creating/reopening an Evidence child, then redesign Save as Transition repeat/preset UX for humans and schema-governed agents. Run packed Core and full positive/negative host tests before a separate Sigma Handoff.

## Completion Expectation

- Signal Kind: result
- Signal Meaning: next Anchor implements bounded graph and mixed transaction work from one Core owner and returns exact test evidence, preserving user-facing BLOCK state until ready
- Return To: Anchor

## Interpretation Limits

- Does Not Mean: all five Move/Rebase scopes executable; Sigma Windows gate passed; historical Evidence fixed; Transition repeat UX implemented; or any published Core/VSIX available
- Must Not Be Used To Claim: partial selection projection equals atomic mixed Apply, Git remote mutation allowed, Schema authority manufactured, or human acceptance inferred

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-vscode-extension-integration-and-final-acceptance.trace.md](001-vscode-extension-integration-and-final-acceptance.trace.md)
  - Value: cjZcy22E70O7lAaL4bykf-sJEEvjp1a8E-CoCj6zXOo

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: XybknSRCrr8o3QeeJ0XCjoq6he1RUqE82d-qRm8mSiA