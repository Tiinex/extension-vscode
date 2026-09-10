# Continuity Context

- Envelope Schema: tiinex.root.v1
- Parent
  - Parent Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-09 21:57:02
  - Trace: [006-anchor-to-anchor-vs-code-dev-loop-self-review-correction-return.trace.md](006-anchor-to-anchor-vs-code-dev-loop-self-review-correction-return.trace.md)
  - Origin:
    - [relative](006-anchor-to-anchor-vs-code-dev-loop-self-review-correction-return.trace.md)
- Current
  - Current Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-10 00:23:52
  - Authors: Anchor
  - Why: Sigma and Anchor converged on a VS Code-native carrier-tree UX and requested complete lineage plus stronger self-review before the next live test tier.
  - Summary: Return native Discovery/Incoming/Outgoing trees, simple Handoff preview authoring, multi-route packaging and self-review qualification.
  - Status: ready/local

---

# VS Code native carrier-tree operator return

## Handoff Parties

- Purpose: Return the first VS Code-native Discovery / Incoming / Outgoing carrier-tree milestone, including Sigma's agreed settings, live Outgoing model, Handoff preview-before-write authoring, multi-route package projection and the strengthened self-review receipts, while preserving unresolved Receive broad-release and future package-profile work for later disposition.
- From: Anchor
- From Kind: role
- From Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)
- To: Anchor
- To Kind: role
- To Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)

## Transfers

- native-carrier-tree-operator
  - Transfer Kind: work
  - Description: The retired monolithic operator webview has been replaced as the active surface by three native VS Code TreeViews: Discovery, Incoming and Outgoing. Each section has native title/item actions and independent Logical/Files plus Leaves/Lineage projections over one canonical action model.
  - Controlling Artifact: [Native carrier tree operator](../explorer/001-native-carrier-tree-operator.trace.md)
  - Boundary: Presentation and VS Code-local orchestration only; shared Tiinex Tooling remains semantic authority.

- discovery-and-incoming-policy
  - Transfer Kind: work
  - Description: Discovery now requires an explicit folder, indexes .handoff-package.zip carriers and Tiinex Markdown artifacts without landing, and separates automatic refresh from optional newest-carrier-to-Incoming selection. Incoming holds one qualified carrier, supports exact-role Handoff auto-preview with yes/no/ask, and exposes explicit per-Workspace Merge state that becomes a passed check after successful merge.
  - Controlling Artifact: [Discovery folder gate](../explorer/001/discovery/001-discovery-tree-and-folder-gate.trace.md)
  - Boundary: Discovery is read-only; setting a carrier as Incoming qualifies it but does not perform Receive/landing.

- outgoing-live-context
  - Transfer Kind: work
  - Description: Outgoing supports New Blank and New From Incoming. From Incoming mirrors carrier Workspaces and binds the active Incoming carrier as package parent; Blank has no inferred carrier parent. Workspace source is live rather than staged and siblings are always ordered alphabetically by Workspace id.
  - Controlling Artifact: [Live Outgoing context](../explorer/001/outgoing/001-live-outgoing-context.trace.md)
  - Boundary: Selecting a Workspace does not snapshot or freeze its repository state.

- simple-handoff-authoring
  - Transfer Kind: work
  - Description: An Outgoing Workspace can prepare a bounded Handoff by short subject, intent, one From, one To and optional additional Role participants. Current Role choices are deduplicated to the latest local Role per label across qualified local Workspaces with package-carried endpoint Role pointers as fallback. Shared Tooling prepares the Handoff in scratch material and the exact .trace.md bytes open in Markdown preview before any repository write; writing reviewed bytes is a separate explicit action.
  - Controlling Artifact: [Simple Handoff authoring](../explorer/001/outgoing/001/001-simple-handoff-authoring-and-preview-before-write.trace.md)
  - Boundary: Operator role text is a preference only and grants no authority. Additional participant Roles do not become extra From/To endpoints.

- multi-route-packaging
  - Transfer Kind: work
  - Description: Written Handoffs can be independently marked as Outgoing routes. One or more marked routes are passed through the public shared --workspace-routes manufacture surface; with multiple routes the operator selects one primary route only for copied human routing text while all marked routes remain in the carrier. Pointer Markdown is manufactured by shared Tooling.
  - Controlling Artifact: [Multiple Handoff routes](../explorer/001/outgoing/001/002/001-multiple-handoff-routes.trace.md)
  - Boundary: Route selection is distinct from artifact Parent continuity and Workspace inclusion.

- developer-loop-chain
  - Transfer Kind: work
  - Description: Sigma live-verified that the registry-aware main-host junction loads Tiinex in the ordinary Windows VS Code instance. The default build task now executes npm install -> Link this checkout -> build, so replacing the checkout refreshes dependencies before the link/build cycle. Local link state remains under ignored .vscode/link/.
  - Controlling Artifact: [Build/link/install chain](../development/004/002/002-build-link-install-chain.trace.md)
  - Boundary: This is a local development loop, not release installation or VSIX publication.

- self-review-and-smoke
  - Transfer Kind: work
  - Description: Review removed retired webview/inbox source, renamed compatibility surfaces to Incoming/Outgoing vocabulary, invalidates Discovery cache on same-path carrier rebuilds, includes Roles from all qualified local Workspaces, guards and hides tree-item-only commands from Command Palette misuse, and renders completed Incoming Workspace state with a passed check. Direct shared-Tooling smoke manufacture returned ready with two qualified Handoff routes and clean orientation; a second smoke added Sigma as an additional participant Role and emitted the participant Role pointer while manufacture remained ready.
  - Controlling Artifact: [Native tree self-review](../explorer/001/review/001-native-tree-self-review-and-manufacture-smoke.trace.md)
  - Boundary: Smoke packages were isolated qualification artifacts and are not release outputs.

- qualification-receipt
  - Transfer Kind: work
  - Description: Final repository-local qualification after the implementation review passes TypeScript typecheck, clean build and 43/43 focused regression cases. The candidate VSIX remains version 0.1.7 and is qualification evidence only; no 0.1.8 release authority is claimed.
  - Controlling Artifact: [Native tree self-review](../explorer/001/review/001-native-tree-self-review-and-manufacture-smoke.trace.md)
  - Boundary: The final full-source Handoff carrier, not the VSIX candidate, is the return artifact.

## Required Context

- parent-return
  - Material: prior VS Code dev-loop self-review return
  - Material Reference: [Parent Handoff](006-anchor-to-anchor-vs-code-dev-loop-self-review-correction-return.trace.md)
  - Purpose: Preserve the qualified parent carrier and prior Receive safety corrections.
  - Availability: available

- operator-frontier
  - Material: VS Code Handoff discovery and manufacture minimum
  - Material Reference: [Operator minimum Task](../001-vs-code-handoff-discovery-and-manufacture-minimum.trace.md)
  - Purpose: Controlling VS Code-local operator frontier.
  - Availability: available

- tree-operator
  - Material: native carrier tree operator
  - Material Reference: [Tree operator Task](../explorer/001-native-carrier-tree-operator.trace.md)
  - Purpose: Umbrella lineage for Discovery, Incoming, Outgoing, projections and authoring/routing work.
  - Availability: available

- self-review
  - Material: native tree self-review and manufacture smoke
  - Material Reference: [Self-review Task](../explorer/001/review/001-native-tree-self-review-and-manufacture-smoke.trace.md)
  - Purpose: Review corrections and direct multi-route/shared-Tooling qualification evidence.
  - Availability: available

- extension-vscode-workspace
  - Material: complete current extension-vscode source
  - Material Reference: [Extension VS Code Workspace](extension-vscode::.topics/.workspaces/tiinex-extension-vscode.workspace.md)
  - Purpose: Only mutated Workspace in this return.
  - Availability: available

- core-workspace
  - Material: current public Core portable Tooling context
  - Material Reference: [Core Workspace](core::.topics/.workspaces/tiinex-core.workspace.md)
  - Purpose: Shared Tooling/package semantic authority; unchanged sibling source.
  - Availability: available

- docs-workspace
  - Material: canonical schema and continuity semantics
  - Material Reference: [Docs Workspace](docs::.topics/.workspaces/tiinex-docs.workspace.md)
  - Purpose: Schema/lineage authority only; unchanged sibling source.
  - Availability: available

- business-workspace
  - Material: Anchor and Role authority context
  - Material Reference: [Business Workspace](business::.topics/.workspaces/tiinex-business.workspace.md)
  - Purpose: Role/org-root context only; unchanged sibling source.
  - Availability: available

## Reference Context

- agreed-tree-model
  - Material: Sigma's design direction: Discovery = available carriers, Incoming = one active carrier, Outgoing = live package context; native TreeView actions remain equivalent under Logical/Files and Leaves/Lineage views.
  - Purpose: Explain the operator UX implemented by this checkpoint.
  - Availability: available

- role-and-participant-model
  - Material: Sigma requested current/latest Role choices, operator Role as a default only, incoming-From as a possible return-To default, package-carried Role cache fallback and additional participant Roles without changing exactly-one From/To semantics.
  - Purpose: Explain endpoint-resolution and participant support.
  - Availability: available

- future-package-controls
  - Material: Sigma requested later Workspace source omission/scoping, optional bootstrap delivery and root/Workspace encryption controls.
  - Purpose: Preserve explicit future UX intent without inventing current shared package contracts.
  - Availability: available

## Retained Responsibilities

- sigma-tree-ux-test
  - Retained By: Anchor
  - Retained By Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)
  - Responsibility: Exercise the native Discovery / Incoming / Outgoing tree UX in the real Windows VS Code host and report interaction/visual issues before broader Receive use.

- receive-real-repository-gate
  - Retained By: Anchor
  - Retained By Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)
  - Responsibility: Keep Receive against Sigma's real multi-repo workspace gated until the current review owner explicitly clears it; disposable/scratch testing remains the next mutation tier.

- final-handoff-package-ux
  - Retained By: Anchor
  - Retained By Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)
  - Responsibility: Continue discussion and refinement of Handoff authoring/package controls after the first native tree milestone is reviewed rather than freezing the current minimal form as final UX.

## Exclusions And Dependencies

- sibling-workspace-mutation
  - Kind: excluded-scope
  - Description: Business, Core and Docs are carried context only. No source mutation in those Workspaces is authorized by this lane.
  - Responsible Party Or Role: Anchor

- untrusted-carrier-hardening
  - Kind: unresolved-dependency
  - Description: Trusted/bundled preflight before package-supplied bootstrap execution and Windows archive-path alias hardening remain separately lineaged broad-release work.
  - Responsible Party Or Role: Anchor

- source-scope-and-bootstrap-profile
  - Kind: unresolved-dependency
  - Description: Descriptor-only Workspace carriage, bounded per-file source scope and optional bootstrap delivery require shared-qualified package/profile contracts before VS Code may expose them as effective package semantics.
  - Responsible Party Or Role: Anchor

- encryption
  - Kind: unresolved-dependency
  - Description: Root/Workspace encryption lock controls are UX-reserved only and are not implemented in this checkpoint.
  - Responsible Party Or Role: Anchor

- unified-commit-message-surface
  - Kind: unresolved-dependency
  - Description: Repository-specific commit-message tasks are recorded for later replacement by one reusable VS Code-native commit-message surface; this checkpoint does not remove that legacy task yet.
  - Responsible Party Or Role: Anchor

- publication
  - Kind: excluded-scope
  - Description: Version 0.1.8 publication/release remains outside this lane. Candidate packaging stays at 0.1.7 evidence only.
  - Responsible Party Or Role: Anchor

## Completion Expectation

- Signal Kind: return
- Signal Meaning: Review the native carrier-tree checkpoint and its full extension-vscode source, then either return bounded corrections or clear the next Sigma live UX/disposable Receive test tier.
- Return To: Anchor
- Return To Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)

## Interpretation Limits

- Does Not Mean: native tree UX is final, real multi-repository Receive is cleared, arbitrary internet Handoffs are trusted, future source/bootstrap/encryption controls exist, or 0.1.8 is authorized.
- Must Not Be Used To Claim: Outgoing is a staging snapshot, operator role text grants authority, participant Roles create extra Handoff endpoints, Discovery performs landing, or VS Code privately owns Handoff/pointer/package semantics.
- Authority Limits: VS Code-local operator presentation/orchestration only; shared Tooling and carried artifacts retain semantic authority.
- Transport Limits: Full-source return carries Business/Core/Docs unchanged from the qualified parent context and the modified extension-vscode Workspace only.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [006-anchor-to-anchor-vs-code-dev-loop-self-review-correction-return.trace.md](006-anchor-to-anchor-vs-code-dev-loop-self-review-correction-return.trace.md)
  - Value: WbvLVqXc3etcEqvIu7a4Ax5Aws58M9bVsypHy6Topj4

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: Rx6c4sn8wow70PVNii3uPmfWqmyCrTw0j-rR1qmdr9g