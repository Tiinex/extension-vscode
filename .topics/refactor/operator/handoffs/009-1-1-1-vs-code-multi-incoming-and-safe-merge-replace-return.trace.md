# Continuity Context

- Envelope Schema: tiinex.root.v1
- Parent
  - Parent Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-10 02:22:33
  - Trace: [009-1-1-canonical-anchor-return-to-refactor-frontier.trace.md](009-1-1-canonical-anchor-return-to-refactor-frontier.trace.md)
  - Origin:
    - [relative](009-1-1-canonical-anchor-return-to-refactor-frontier.trace.md)
- Current
  - Current Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-10 12:52:05
  - Authors: Anchor
  - Why: Sigma refined the operator model after the preceding return; this child preserves the canonical Anchor endpoint while returning the newly qualified source and retained shared boundaries.
  - Summary: Return the qualified multi-Incoming, safe Merge/Replace, Outgoing source-selection, projection and performance continuation.
  - Status: ready/local

---

## Handoff Parties

- Purpose: Return the qualified VS Code operator-tree continuation after Sigma's current Incoming/Outgoing, safe Merge/Replace, carrier-dimension, projection, icon and performance corrections, while retaining shared carrier manufacture semantics and Windows/Sigma acceptance at the Refactor frontier.
- From: Anchor
- From Kind: role
- From Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)
- To: Anchor
- To Kind: role
- To Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)

## Transfers

- multi-incoming-native-tree
  - Transfer Kind: work
  - Description: Incoming now holds multiple qualified Handoff packages concurrently without implicitly merging them. Package roots are ordered newest-opened first, reopening moves a package to the top, and Close is an inline package-root action. Discovery nested file projection now retains carrier package context through directory descendants, fixing Tiinex artifacts disappearing below expanded nodes. Logical/Files and Leaves/Lineage controls stay left of stable actions, mutation actions stay left of Refresh, and native semantic ThemeIcons strengthen visual pattern recognition.
  - Controlling Artifact: [Native carrier tree Task](../explorer/001-native-carrier-tree-operator.trace.md)
  - Boundary: Incoming packages remain independent qualified sources until an operator explicitly chooses an apply action.

- safe-merge-replace
  - Transfer Kind: work
  - Description: Merge / Replace is exposed inline on every Incoming package root and Workspace. Package-level use opens a Workspace multi-select preselecting every Workspace that owns a qualified Handoff route whose From or To matches `tiinex.operator.role`; multiple matching routes may therefore preselect multiple Workspaces. Each selected Workspace then independently chooses Merge, Replace or Skip. The entire flow is dry until one final Execute Plan confirmation.
  - Controlling Artifact: [Incoming merge policy Task](../explorer/001/incoming/002-batch-workspace-merge-and-post-merge-git-policy.trace.md)
  - Boundary: No real Sigma repository was mutated during qualification.

- git-and-filesystem-safety
  - Transfer Kind: work
  - Description: Git roots retain `.git`, and local pre-operation `.gitignore` rules protect ignored material even if a later branch or incoming snapshot changes ignore rules. Dirty same-branch repositories may Preserve+Merge only when changed path sets are proven non-overlapping; Commit and Discard remain explicit. Dirty differing branches allow Commit or Discard only, followed by an explicit branch-switch confirmation. Exact incoming snapshots that resolve to a local commit with a common base use real `git merge --no-commit --no-ff`, leaving genuine unmerged index entries for VS Code Source Control / Merge Editor. Without a provable Git base, and for local Workspaces without `.git`, Merge is file-safe and blocks differing overlaps rather than guessing; Replace preserves ignored local material and protected symlinks. Commit-message helper execution is deferred until after final Execute confirmation.
  - Controlling Artifact: [Incoming merge policy Task](../explorer/001/incoming/002-batch-workspace-merge-and-post-merge-git-policy.trace.md)
  - Boundary: Filesystem fallback does not pretend to infer ancestry or deletion intent that cannot be proven.

- outgoing-source-selection
  - Transfer Kind: work
  - Description: Outgoing now has one always-visible New action plus Select Workspaces, Package, conditional Bump/Clear Major and Refresh in stable toolbar order. New requires confirmation before replacing an existing Outgoing context. Select Workspaces lists Local first, then open Incoming packages newest to oldest; duplicate Workspace identity selections are resolved by that visual priority, loser selections are de-selected, and the corrected picker is shown again for explicit confirmation. Outgoing never merges duplicate sources: exactly one effective source is carried per Workspace. One selected Incoming package becomes the natural carrier parent; several Incoming packages require an explicit lineage-parent or new-root choice.
  - Controlling Artifact: [Outgoing carrier continuity Task](../explorer/001/outgoing/002-fast-carrier-create-and-dimension-continuity.trace.md)
  - Boundary: Workspace source selection is descriptor-only; expensive Incoming extraction occurs only at manufacture and local artifact indexing occurs only on expansion.

- carrier-dimension-semantics
  - Transfer Kind: work
  - Description: New independent Outgoing lineage is represented as major `001`. Child continuation derives the expected next carrier dimension from the ordinal position of the exact continued Handoff route in the parent carrier's qualified route sequence, never from the Handoff artifact filename number. Bump Major remains an explicit stable-checkpoint action. VS Code checks shared manufacture's projected and built carrier dimension against the expected value and fails closed instead of emitting a semantically wrong lineage.
  - Controlling Artifact: [Outgoing carrier continuity Task](../explorer/001/outgoing/002-fast-carrier-create-and-dimension-continuity.trace.md)
  - Boundary: Shared Tooling still owns the qualified outer filename and carrier manufacture. If its allocator does not implement route-ordinal child dimensions for multi-route parents, that is a retained shared Turn-2 contract correction rather than something VS Code may privately rewrite.

- performance-correction
  - Transfer Kind: work
  - Description: Local Outgoing Workspace qualification now uses a bounded parallel pool instead of serial portable-Tooling calls, and local tree expansion indexes only the canonical `.topics` artifact namespace rather than recursively walking the whole repository. Incoming-source selection remains descriptor-only. This directly removes the known structural causes of long Outgoing UI stalls without introducing stale private caches.
  - Controlling Artifact: [Sigma video correction continuation Task](../explorer/001/review/002-sigma-video-correction-next-anchor-continuation.trace.md)
  - Boundary: Real Windows main-host latency still requires Sigma's interactive acceptance run.

- qualification-receipt
  - Transfer Kind: work
  - Description: Final `npm run validate` passed after all corrections: TypeScript typecheck passed, 47/47 focused bridge cases passed, and the 0.1.7 VSIX was manufactured successfully. Added functional Git tests prove `.gitignore` matching for not-yet-created paths, exact dirty-path de-duplication, and a real divergent merge leaving `MERGE_HEAD` plus unmerged index paths. Final VSIX SHA-256 is `b6983319d889780c4ba5f82e54fd3db95e1202bcd6305362b0fe5f9cc55419f1`; bundled Core remains exact `@tiinex/core` 0.1.1 with representation SHA-256 `eb8f5c1717a82ed04fa12c9cbc3f770102815725dbf0189b286acdeb657a9ae9`.
  - Controlling Artifact: [VS Code Handoff discovery and manufacture minimum](../001-vs-code-handoff-discovery-and-manufacture-minimum.trace.md)
  - Boundary: Candidate VSIX and source qualification are not release authority or Windows/Sigma UX acceptance.

- refactor-frontier-return
  - Transfer Kind: responsibility
  - Description: Refactor Anchor should reconcile this full extension-vscode source at the retained Turn-2 frontier, own any shared carrier allocator/outer-filename contract work that is required, and coordinate the next Windows linked-main-host Sigma acceptance pass.
  - Controlling Artifact: [Refactor Anchor delegation](../../handoffs/001-refactor-anchor-to-vs-code-anchor-turn-2-integration.trace.md)
  - Boundary: Business, Core and Docs source were not mutated, and no release/publication action was taken.

## Required Context

- extension-vscode-workspace
  - Material: complete current extension-vscode source with multi-Incoming, Outgoing source selection, Merge/Replace safety, projection/icon and performance corrections
  - Material Reference: [Extension VS Code Workspace](extension-vscode::.topics/.workspaces/tiinex-extension-vscode.workspace.md)
  - Purpose: Full writable source returned to Refactor Anchor.
  - Availability: available

- parent-return-handoff
  - Material: immediately preceding canonical Anchor return Handoff
  - Material Reference: [Canonical prior return](009-1-1-canonical-anchor-return-to-refactor-frontier.trace.md)
  - Purpose: Exact continuation parent for this correction cycle.
  - Availability: available

- refactor-parent-handoff
  - Material: original bounded Turn-2 delegation
  - Material Reference: [Refactor Anchor delegation](../../handoffs/001-refactor-anchor-to-vs-code-anchor-turn-2-integration.trace.md)
  - Purpose: Restores retained authority/frontier boundaries.
  - Availability: available

- incoming-task
  - Material: Incoming merge and Git-policy context
  - Material Reference: [Incoming Task](../explorer/001/incoming/002-batch-workspace-merge-and-post-merge-git-policy.trace.md)
  - Purpose: Review target for explicit apply and Git safety behavior.
  - Availability: available

- outgoing-task
  - Material: Outgoing carrier and dimension continuity context
  - Material Reference: [Outgoing Task](../explorer/001/outgoing/002-fast-carrier-create-and-dimension-continuity.trace.md)
  - Purpose: Review target for source selection, package parentage and carrier dimensions.
  - Availability: available

- projection-task
  - Material: projection and conditional-action context
  - Material Reference: [Projection Task](../explorer/001/projection/002-video-truth-mode-and-conditional-actions.trace.md)
  - Purpose: Review target for tree truth, stable actions and Tiinex artifact visibility.
  - Availability: available

- review-task
  - Material: Sigma video correction continuation context
  - Material Reference: [Review continuation Task](../explorer/001/review/002-sigma-video-correction-next-anchor-continuation.trace.md)
  - Purpose: Human-UX correction lineage retained across this iteration.
  - Availability: available

- core-workspace
  - Material: unchanged carried Core 0.1.1 public portable Tooling contract
  - Material Reference: [Core Workspace](core::.topics/.workspaces/tiinex-core.workspace.md)
  - Purpose: Shared manufacture and operation authority.
  - Availability: available

- docs-workspace
  - Material: unchanged canonical schema/continuity context
  - Material Reference: [Docs Workspace](docs::.topics/.workspaces/tiinex-docs.workspace.md)
  - Purpose: Schema authority.
  - Availability: available

- business-workspace
  - Material: unchanged Anchor Role and Turn-2 organizational context
  - Material Reference: [Business Workspace](business::.topics/.workspaces/tiinex-business.workspace.md)
  - Purpose: Role/delegation authority.
  - Availability: available

## Reference Context

- ux-contract-summary
  - Material: Incoming may hold several independent carriers; package and Workspace Merge/Replace share one plan-first engine; Outgoing selects one prioritized source per Workspace and performs no source merge; package/root Close stays inline; title-bar conditional actions stay left of stable New/Refresh actions.
  - Purpose: Compact review map for the implemented operator behavior.
  - Availability: available

- technical-qualification
  - Material: `npm run validate` green with 47/47 focused tests and VSIX SHA-256 `b6983319d889780c4ba5f82e54fd3db95e1202bcd6305362b0fe5f9cc55419f1`.
  - Purpose: Separate mechanical/source qualification from real-host acceptance.
  - Availability: available

## Retained Responsibilities

- shared-refactor-frontier
  - Retained By: Anchor
  - Retained By Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)
  - Responsibility: Reconcile returned extension-vscode source with current shared Tooling contracts and correct any route-ordinal carrier allocator or outer-filename contract at the shared owner if required.

- windows-sigma-acceptance
  - Retained By: Anchor
  - Retained By Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)
  - Responsibility: Coordinate the Windows linked-main-host Extension Host test and Sigma UX acceptance for exact layout, icons, latency and real local Merge/Replace interaction.

- release-authority
  - Retained By: Anchor
  - Retained By Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)
  - Responsibility: Own later release recommendation/publication gates.

## Exclusions And Dependencies

- sibling-source-mutation
  - Kind: excluded-scope
  - Description: No Business, Core or Docs source mutation was performed in this lane.
  - Responsible Party Or Role: Anchor

- real-repository-destructive-test
  - Kind: excluded-scope
  - Description: Merge/Replace was qualified with focused temporary Git fixtures and source tests; Sigma's real local repositories were not used as destructive test targets.
  - Responsible Party Or Role: Anchor

- shared-carrier-allocation
  - Kind: unresolved-dependency
  - Description: VS Code now expresses and checks route-ordinal carrier child dimensions, but shared manufacture owns allocation and must agree for multi-route carrier parents. VS Code intentionally does not rewrite manufactured carrier names or lineage privately.
  - Responsible Party Or Role: Anchor

- real-windows-host
  - Kind: unresolved-dependency
  - Description: Interactive Windows VS Code main-host behavior, icon rendering and end-to-end latency cannot be truthfully accepted from this Linux qualification host.
  - Responsible Party Or Role: Anchor

- release
  - Kind: excluded-scope
  - Description: No 0.1.8 publication, Marketplace/npm/GitHub release or remote mutation is authorized by this return.
  - Responsible Party Or Role: Anchor

## Completion Expectation

- Signal Kind: return
- Signal Meaning: Refactor Anchor should ground this full-source continuation, reconcile any retained shared Tooling boundary, then run the Windows/Sigma acceptance pass against the returned extension candidate before release disposition.
- Return To: Anchor
- Return To Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)

## Interpretation Limits

- Does Not Mean: Sigma has accepted this exact build, real repositories have been safely merged/replaced in production use, shared multi-route carrier allocation has already been corrected, or VS Code 0.1.8 is release-approved.
- Must Not Be Used To Claim: that filename-local Handoff numbering defines carrier dimensions, that Incoming sources are implicitly merged in Outgoing, or that VS Code owns shared carrier manufacture semantics.
- Authority Limits: Bounded extension-vscode implementation and technical qualification only.
- Transport Limits: Return as one canonical full-source Anchor-to-Anchor Handoff carrier with extension-vscode as the current writable source and carried Business/Core/Docs authority unchanged.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [009-1-1-canonical-anchor-return-to-refactor-frontier.trace.md](009-1-1-canonical-anchor-return-to-refactor-frontier.trace.md)
  - Value: 1WXA1D2wXm93kOxin4jvmj1ZJHGSIdkKtuuOT6p_UEI

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: N2FZzyS1NHmAqpiHaJJdMX0SPpWXArC4KuQYcMEWpB0