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
  - Created At: 2026-10-10 01:35:22
  - Authors: Anchor
  - Why: Preserve read-only Git and connector recovery while cross-Workspace Move/Rebase stays blocked until joint referential closure.
  - Summary: Read-only pinned Git source and provider receipt qualification, manual Core CLI and full source tests; cross-Workspace Apply, Evidence and Transition remain open.
  - Status: ready/local

---

# Anchor → Anchor — Read-Only Git Publication Recovery

## Handoff Parties

- Purpose: preserve Core-owned read-only Git source and provider publication qualifications as the necessary evidence frontier for future cross-Workspace Move/Rebase, without incorrectly authorizing a remote or two-Workspace move
- From: Anchor
- From Kind: role
- From Reference: [Anchor](business::.topics/roles/001-1-1-1-1-1-anchor-canonical-holder-cutover-role.trace.md)
- To: Anchor
- To Kind: role
- To Reference: [Anchor](business::.topics/roles/001-1-1-1-1-1-anchor-canonical-holder-cutover-role.trace.md)

## Transfers

- cross-workspace-immutable-publication-evidence
  - Transfer Kind: work-and-responsibility
  - Description: extend the qualified read-only Git publication proof and Core local reference closure into an exact cross-Workspace source+target reference transaction; maintain independent CLI and fail-closed missing/contradictory evidence while returning to historical Evidence and reusable Transition P0 issues
  - Controlling Artifact: [VS Code Extension Finalization](001-vscode-extension-integration-and-final-acceptance.trace.md)
  - Boundary: local Core/VS Code source and tests; no remote writes, implicit Parent rewrite, published-permalink invention or Sigma acceptance

## Required Context

- controlling-extension-task
  - Material: original VS Code finalization eight-lane Task
  - Material Reference: [Extension Task](001-vscode-extension-integration-and-final-acceptance.trace.md)
  - Purpose: owner-bound P0 work and eventual human installed acceptance
  - Availability: available
- immediate-predecessor
  - Material: previous Core-owned local Workspace reference-closure Anchor checkpoint
  - Material Reference: [Previous Anchor Checkpoint](001-13-anchor-to-anchor-core-reference-closure-checkpoint.trace.md)
  - Purpose: exact local reference scanner, snapshot-bound mutation and mixed file journal
  - Availability: available
- core-source-owner
  - Material: Core portable agent and operation catalog Task
  - Material Reference: [Core Task](core::.topics/work/portable-agent-surfaces/001-portable-agent-capability-projection-and-synchronization-contrac.trace.md)
  - Purpose: keep host and CLI on one Core semantics and recovery contract
  - Availability: available
- anchor-role
  - Material: canonical Business Anchor role
  - Material Reference: [Anchor Role](business::.topics/roles/001-1-1-1-1-1-anchor-canonical-holder-cutover-role.trace.md)
  - Purpose: correct recipient authority and route qualification
  - Availability: available
- sigma-role
  - Material: canonical Business Sigma role
  - Material Reference: [Sigma Role](business::.topics/roles/001-4-1-1-sigma-role-canonical-assignment-modes-qualification-continuation.trace.md)
  - Purpose: human-only final Windows installed acceptance boundary
  - Availability: available
- prior-sigma-observation
  - Material: previous Sigma Windows test Handoff that exposed the remaining practical P0 symptoms
  - Material Reference: [Prior Sigma Handoff](001-7-1-anchor-to-sigma-vscode-final-acceptance-handoff.trace.md)
  - Purpose: preserve original user acceptance conditions; do not infer them from CLI tests
  - Availability: available

## Reference Context

- full-core-regression
  - Material: 93 Core .test.mjs files in 11 successful independently terminated shards; 605 PASS, zero FAIL, one SKIP. Exact 11 shard logs are carried as 121–131
  - Material Reference: [Full Core Test Summary](verification/120-effective12-core-full-shards.txt)
  - Purpose: exact source owner nonregression and recorded negative evidence
  - Availability: available
- publication-source-test
  - Material: read-only Git candidate, no-Git recovery, provider-bound source identity, wrong source/ref/bytes negative tests
  - Material Reference: [Publication Focus Tests](verification/132-effective12-cross-git-focused.txt)
  - Purpose: avoid local Git objects or synthetic provider responses gaining unsupported publication authority
  - Availability: available
- scanner-recovery
  - Material: cross-Workspace Inspector produces an optional GitHub connector action while still blocking cross-Workspace Apply
  - Material Reference: [Scanner Recovery Tests](verification/133-effective12-cross-git-inspection.txt)
  - Purpose: LLM fallback without host-only semantics
  - Availability: available
- offline-core-host
  - Material: offline-installed @tiinex/core package VS Code authoring and scope tests PASS
  - Material Reference: [Offline Core Host](verification/134-effective12-packed-core-host.txt)
  - Purpose: packed Core consumer contract, not sibling source-only test
  - Availability: available
- manual-provider-cli
  - Material: independent Core CLI read-only publication qualification from offline-installed tarball, unresolved without accepted evidence and qualified only for an exact synthetic test receipt
  - Material Reference: [Manual Publication CLI](verification/137-effective12-packed-publication-cli.txt)
  - Purpose: standalone humans and LLMs can obtain/review provider action and feed a normalized receipt
  - Availability: available
- manual-local-git-cli
  - Material: independent installed Core CLI against an actual disposable Git repository, exact commit/source material candidate and wrong-commit denial
  - Material Reference: [Manual Local Git CLI](verification/138-effective12-packed-local-git-cli.txt)
  - Purpose: local git reading is one optional alternative, never remote publication proof
  - Availability: available
- exact-frontier
  - Material: changed source files, verified capabilities and remaining cross-Workspace/Evidence/Transition blockers
  - Material Reference: [Qualification Frontier](verification/139-effective12-qualification-frontier.txt)
  - Purpose: avoid treating read-only evidence proof as a cross-Workspace transaction
  - Availability: available

## Retained Responsibilities

- core-source-and-integrity
  - Retained By: Core
  - Responsibility: independent exact Git source candidate, read-only provider action/receipt, source digest, cross-Workspace reference and Parent continuity, atomic durable transaction once all evidence is present
  - Boundary: Host may execute read-only GitHub connector requests but never convert unverified URLs or raw search snippets into source authority
- sigma-final-windows
  - Retained By: Sigma
  - Responsibility: one bounded installed Windows acceptance after source/host P0 qualification
  - Boundary: no live debugging or registry publishing required of user

## Exclusions And Dependencies

- no-remote-mutation
  - Kind: excluded-scope
  - Description: no git fetch/push/checkout, GitHub write, npm/Marketplace publish, implicit holder assignment or Task closure
- joint-cross-workspace-apply
  - Kind: unresolved-dependency
  - Description: confirmed historical Git publication is only one read-only prerequisite. Complete incoming/outgoing references across both source and target Workspaces, exact external Parent locator rewrite, atomic multi-Workspace locks/journal and rollback remain unqualified, so cross-Workspace Apply stays BLOCKED
- real-publication-provider-evidence
  - Kind: unresolved-dependency
  - Description: no actual GitHub-hosted material was read this turn; accepted normalized fixture responses test the consumer contract but must not be represented as real remote provenance
- historical-evidence-repair
  - Kind: unresolved-dependency
  - Description: Evidence Current Schema older permalink and Evidence-as-Parent errors remain unresolved and require qualified migration and create/reopen audit
- transition-repeat-ui
  - Kind: unresolved-dependency
  - Description: effortless Save as Transition / repeatable form inheritance for humans and LLMs remains open despite source-level Definition Create/reopen regression PASS
- installed-vsix
  - Kind: unresolved-dependency
  - Description: Core offline-package test and static release-check do not replace Sigma-installed Windows confirmation

## Verified Effective-Turn-12 Change

- `lineage.crossWorkspacePublication.js`: pure Core read-only publication evidence operation accepts exact source/target Workspace IDs, GitHub owner/repo, SHA-40 commit, .topics trace path and verified source bytes; uses existing host tool binding, plan/action receipt acceptance and SHA-256 content matching. Discovered GitHub fetch/repository-read connector leads to an executable host READ action, not a relocation Apply. No available connector leads to explicit alternatives rather than guessed publication claims.
- `lineage.gitSource.inspect.js`: local Git read-only exact commit/path and github.com origin parser; self-verified source yields a candidate only, never a proof of publication. Missing .git/object provides connector/repository-read alternative. No remote networking or mutation.
- The existing `lineage.scoped-move.inspect.js` offers bounded publication recovery when targetWorkspaceId is different, while continuing to block actual cross-Workspace mutation.
- Core CLI `qualify-cross-workspace-publication` and `inspect-cross-workspace-git-source`, public Node exports, help/README and source tests; manually verified using independently installed offline Core .tgz. Synthetic host read receipt is explicitly a test fixture, not actual remote GitHub proof.
- Full Core regression: 93 test files, 605 PASS, zero FAIL, one SKIP; packaged Core host, Transition roundtrip and static VS Code release-check PASS; local sandbox never assumed access to GitHub network.

## Next Bounded Steps

1. Orient and ground exact Anchor pointer from the manufactured 17-Workspace package; qualify 15 unchanged Workspaces, Core+VS Code-only changes, physical test receipts, wrong Role and bad route blockers.
2. Build read-only **joint reference inventory** for source+target Workspaces and resolve incoming external references into exact Parent/asset identities. Couple it to accepted SHA-pinned provider receipt and only then design atomic multi-Workspace plan/preview/apply/rollback. Unsupported dynamic/binary and undeclared external Workspaces must BLOCK.
3. Reuse the proven provider-host-action path in native agent/tool discovery and VS Code UI as guidance, not as a private inaccessible engine. Real connector read is host/LLM-authorized and never required if a separate qualified read route exists.
4. Repair historical Evidence Current Schema with qualified digest/schema migration; test fresh and historical child-of-Evidence create/reopen. Simplify Save as Transition from automatically inherited safe scalar/form source context, keeping side effects explicit.
5. Re-run packed Core CLI manual tests, host and full negative regression, then produce one bounded new Sigma gate and full Anchor recovery after original P0s close.

## Completion Expectation

- Signal Kind: result
- Signal Meaning: next Anchor either delivers proof-qualified cross-Workspace transaction and Evidence/Transition P0 work or identifies exact safe blockers, with full native Tiinex Handoff recovery
- Return To: Anchor

## Interpretation Limits

- Does Not Mean: GitHub publication was actually fetched this turn, cross-Workspace move is now executable, a local git origin is a publication receipt, or Evidence/Transition human UX is complete
- Must Not Be Used To Claim: Sigma PASS, repository network availability, arbitrary dynamic reference closure, guessed permalinks, git pushes, remote mutations or authorization by filename chronology

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-vscode-extension-integration-and-final-acceptance.trace.md](001-vscode-extension-integration-and-final-acceptance.trace.md)
  - Value: cjZcy22E70O7lAaL4bykf-sJEEvjp1a8E-CoCj6zXOo

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: aW_o7F19YBb93sdir97Jmh_zOi0K-6fPxZAQdc-5ACA