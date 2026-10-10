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
  - Created At: 2026-10-10 00:45:46
  - Authors: Anchor
  - Why: Preserve owner-correct lineage continuity and no half-applied unsafe Move/Rebase
  - Summary: Same-directory anchored Prepend/Append New Parent; changed Parent digest cascade, Core and host tests, strict unsafe modes.
  - Status: ready/local

---

# Anchor To Anchor — Anchored Semantic Insertion And CLI Recovery

## Handoff Parties

- Purpose: preserve Core-owned Prepend/Append New Parent graph insertions, exact target dimension and Parent digest continuity; keep unqualified Keep Parent, cross-Workspace and incomplete asset reference closure blocked instead of returning an unsafe Sigma candidate
- From: Anchor
- From Kind: role
- From Reference: [Anchor](business::.topics/roles/001-1-1-1-1-1-anchor-canonical-holder-cutover-role.trace.md)
- To: Anchor
- To Kind: role
- To Reference: [Anchor](business::.topics/roles/001-1-1-1-1-1-anchor-canonical-holder-cutover-role.trace.md)

## Transfers

- move-rebase-continuity-phase3
  - Transfer Kind: work-and-responsibility
  - Description: extend exact Core selection/placement matrix to remaining Keep Parent and reference-closure conditions without semantic duplications in VS Code; preserve the current two safe insertion operations, mixed asset transaction and real manual CLI test; then progress Evidence/Transition usability blockers before new Sigma gate
  - Controlling Artifact: [VS Code Integration Task](001-vscode-extension-integration-and-final-acceptance.trace.md)
  - Boundary: local source and tests; no remote write, automatic schema migration, Marketplace publish or human Windows acceptance inferred

## Required Context

- controlling-extension-task
  - Material: original eight-lane VS Code finalization and Sigma acceptance Task
  - Material Reference: [VS Code Integration Task](001-vscode-extension-integration-and-final-acceptance.trace.md)
  - Purpose: maintain original video-observed P0 symptoms and avoid premature closure
  - Availability: available
- preceding-anchor-handoff
  - Material: immediately preceding mixed artifact and binary asset Core CLI checkpoint
  - Material Reference: [Mixed Asset CLI Checkpoint](001-10-anchor-to-anchor-mixed-asset-cli-checkpoint.trace.md)
  - Purpose: inherited Same + Keep Parent, strict mixed binary SHA and atomic recovery semantics
  - Availability: available
- core-agent-task
  - Material: Core portable operation catalog and source authority Task
  - Material Reference: [Core Agent Task](core::.topics/work/portable-agent-surfaces/001-portable-agent-capability-projection-and-synchronization-contrac.trace.md)
  - Purpose: Core owns graph semantic mutations, portable CLI and programmatic projection
  - Availability: available
- vscode-agent-task
  - Material: VS Code native agent adapter Task
  - Material Reference: [VS Code Agent Task](../native-agent-surface/001-vs-code-native-agent-tools-and-generated-customizations-adapter.trace.md)
  - Purpose: host remains thin, no parallel semantic move engine
  - Availability: available
- anchor-role
  - Material: canonical Business Anchor Role
  - Material Reference: [Anchor Role](business::.topics/roles/001-1-1-1-1-1-anchor-canonical-holder-cutover-role.trace.md)
  - Purpose: local bounded continuation and recovery
  - Availability: available
- sigma-role
  - Material: canonical Business Sigma Role
  - Material Reference: [Sigma Role](business::.topics/roles/001-4-1-1-sigma-role-canonical-assignment-modes-qualification-continuation.trace.md)
  - Purpose: eventual bounded final Windows observation only
  - Availability: available
- previous-sigma-result
  - Material: previous Anchor to Sigma Handoff which remained blocked after recorded Windows test
  - Material Reference: [Sigma Handoff](001-7-1-anchor-to-sigma-vscode-final-acceptance-handoff.trace.md)
  - Purpose: preserve original human P0 findings and not infer installed acceptance
  - Availability: available

## Reference Context

- full-core-source-suite
  - Material: all 89 Core .test.mjs files in ten independently terminated complete shards: 584 PASS, zero FAIL, one SKIP; individual shard receipts 061 through 070 are carried
  - Material Reference: [Full Core Sharded Summary](verification/060-effective9-core-full-sharded.txt)
  - Purpose: prove both shared scaffold integrity and lineage transaction regressions while avoiding previous monolithic timeout
  - Availability: available
- host-p0-integration
  - Material: fresh complete VS Code host authoring suite using offline-installed @tiinex/core package; all PASS including scope/anchor UI and fail-closed PNG
  - Material Reference: [Packaged Core Host](verification/071-effective9-packed-core-vscode-host.txt)
  - Purpose: exact consumer ABI, source scope and host selection don't silently fork Core
  - Availability: available
- actual-packaged-cli
  - Material: independent Node CLI plan, local journaled Apply, re-open disk/self audit and replay BLOCK for both qualified Prepend and Append against physically offline-installed @tiinex/core .tgz
  - Material Reference: [CLI Manual Proof](verification/072-effective9-cli-manual-offline-package.txt)
  - Purpose: prove tooling is genuinely available outside VS Code and not a mock
  - Availability: available
- scope-regression
  - Material: focused lineage and binary asset projection, real Apply and negative tests, 34 PASS/zero FAIL
  - Material Reference: [Core Focused Regression](verification/073-effective9-lineage-focused.txt)
  - Purpose: preserve scope, dimension, changed Parent, dangling references and mutation blockers
  - Availability: available
- marketplace-static-audit
  - Material: VS Code static release-check ready with zero errors and warnings
  - Material Reference: [Static Audit](verification/074-effective9-release-static.txt)
  - Purpose: source-manifest sanity only; not installed VSIX PASS
  - Availability: available
- transition-source-regression
  - Material: Core-backed Transition Definition creation/persist/reopen test using offline-installed Core package
  - Material Reference: [Transition Regression](verification/075-effective9-transition-roundtrip.txt)
  - Purpose: preserve previous source-level Transition creation while UI reuse remains incomplete
  - Availability: available
- exact-frontier
  - Material: bounded implementation inventory, parent rewrite semantics and explicit unsafe/unqualified combinations
  - Material Reference: [Qualification Frontier](verification/078-effective9-qualification-frontier.txt)
  - Purpose: successor must not promote source smoke to complete Move/Rebase or Sigma acceptance
  - Availability: available

## Retained Responsibilities

- semantically-owned-insertion
  - Retained By: Core
  - Responsibility: parent graph, numeric anchor, self/integrity cascade, binary fingerprint, transaction journal, rollback and reference validation
  - Boundary: no host interpolation of Parent or raw textual path mutation
- final-human-acceptance
  - Retained By: Sigma
  - Responsibility: one bounded installed Windows acceptance only after internal gates become qualified
  - Boundary: no debugging, npm registry work or live patching required of Sigma

## Exclusions And Dependencies

- no-cross-workspace-release
  - Kind: excluded-scope
  - Description: no git push, remote mutation, Marketplace or npm publish, Task closure or inferred Sigma acceptance
- prepend-append-keep-parent
  - Kind: unresolved-dependency
  - Description: numeric placement and semantic Parent must be independently represented before Prepend/Append + Keep Parent is executable; currently fail-closed
- asset-external-reference-closure
  - Kind: unresolved-dependency
  - Description: newly exposed VS Code scope choices cannot assert complete Workspace reference inventory solely from same-directory listing; binary-containing scopes block in host until a real Core-owned closure inspection qualifies
- cross-workspace-git
  - Kind: unresolved-dependency
  - Description: cross-Workspace Move/Rebase and Git permalink fallback need qualified immutable provenance and full incoming/outgoing reference closure
- evidence-transition
  - Kind: unresolved-dependency
  - Description: historical Evidence Current Schema repair / qualified new Evidence Parent and truly simple reusable Transition/form repeat remain open original Windows P0 and ergonomics work
- installed-vsix
  - Kind: unresolved-dependency
  - Description: dependency-backed Windows VS Code build and installed user confirmation remain Sigma's local final test; a Core offline tarball integration is not a Windows PASS

## Verified Effective-Turn-9 Change

- Core `lineage.maintenance.projection.js` reuses pure five-scope `projectPortableMoveSelection` to qualify append/prepend with New Parent on exact same-directory artifact anchors. A new Core-only graph insertion plan and Parent digest verifier forbid semantic cycles, branched Prepend, target dimension drift and unrelated sibling coordinate rewrites; Same + Keep Parent remains unchanged. Prepend/Append + Keep Parent cannot be misreported as Apply-ready.
- Core shared `scaffold.relocation.js` now receives original artifact bytes, treating an explicit semantic Parent rewrite as a real content mutation and resealing all descendant Parent digests Parent-first. This fixes a surfaced core bug where a child's Parent integrity remained bound to the old root after Append.
- Core local journaled `lineage.maintenance.apply.js` accepts strictly qualified combined asset + scoped semantic insert, with exact binary SHA, source requalification, output collision, rollback and replay-blocking. Public Node Core exports input fingerprint helpers; no VS Code semantic duplication.
- VS Code `lineageMaintenance.ts` offers Source Scope → Artifact Anchor → Same/Prepend/Append → relevant Parent Policy, calls Core pure selection and plan, and only applies ready plans. Asset scopes are deliberately blocked when complete external reference closure isn't established. Existing explorer ordinary file, deferred Attach and legacy menus retain previous behavior.
- Manual offline package CLI and actual consumer-backed VS Code host tests PASS, fresh complete Core 89 files/584 PASS/one SKIP; cross-Workspace, Prepend/Append + Keep Parent and all unqualified/reference-unsafe combinations remain BLOCKED.

## Next Bounded Steps

1. Ground exact Anchor route of carrier; verify 17 Workspaces, only Core and VS Code changed, 15 byte-identical, receipts physical, wrong Role and wrong route blocked.
2. Finish Core numeric placement and semantic Parent orthogonality for Keep Parent and Prepend/Append, including selected descendants and preserved external relative references, without extra host graph engines. Manual packed Core CLI must again plan/apply/reopen/rollback.
3. Add a Core-owned complete reference-closure inspection that VS Code can cite as an exact receipt so binary selections can safely Apply, rather than trusting directory enumeration or caller-set complete flags. Cover external cross-Workspace with honest Git publication/permalink fallback only when provable.
4. Qualify historical Evidence Current Schema repair and same-runtime Create→reopen→Parent Evidence compatibility, and redesign repeating Transition creation without demanding manual mapping of the entire schema.
5. Repeat all P0 source/host regressions, produce qualified full recovery and only then a separate bounded Sigma Handoff. User remains owner of local VSIX/npm swap and final Windows observation; do not turn them into debugger.

## Completion Expectation

- Signal Kind: result
- Signal Meaning: complete next owner-correct P0 gates and test receipts for full Move/Rebase, Evidence and Transition; return unqualified corners as blockers instead of guessing
- Return To: Anchor

## Interpretation Limits

- Does Not Mean: complete five-scope Move/Rebase workflow, cross-Workspace moves, Git permalink migration, full Source Closure, Evidence repair, simple Transition UX or Windows acceptance already passed
- Must Not Be Used To Claim: Sigma authorization, automatic release, current Parent rewrite for Keep Parent options, or installed VS Code PASS merely from CLI and source tests

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-vscode-extension-integration-and-final-acceptance.trace.md](001-vscode-extension-integration-and-final-acceptance.trace.md)
  - Value: cjZcy22E70O7lAaL4bykf-sJEEvjp1a8E-CoCj6zXOo

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: _Xe2rBTXfG17dF0quz_Uc_5YVWrr1xkwErSqr28wFu4