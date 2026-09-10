# Continuity Context

- Envelope Schema: tiinex.root.v1
- Parent
  - Parent Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-10 16:27:48
  - Trace: [009-1-1-1-1-1-1-1-1-1-vs-code-outer-logical-boundary-and-outgoing-spinner-return.trace.md](009-1-1-1-1-1-1-1-1-1-vs-code-outer-logical-boundary-and-outgoing-spinner-return.trace.md)
  - Origin:
    - [relative](009-1-1-1-1-1-1-1-1-1-vs-code-outer-logical-boundary-and-outgoing-spinner-return.trace.md)
- Current
  - Current Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-10 17:48:11
  - Authors: Anchor
  - Why: The Refactor Anchor refreshed shared dependencies while preserving the newer VS Code lane; current Core comparison is now integrated and shared manufacture blockers must be returned without mutating Core.
  - Summary: Return current VS Code source after shared Business/Docs/Core refresh and shared source-frontier compare adoption.
  - Status: ready/local

---

## Handoff Parties

- Purpose: Return the current extension-vscode lane after reconciling the Refactor Anchor shared-context refresh read-only, adopting current Business/Docs/Core dependencies, and integrating current shared Core source-frontier comparison as the preflight for Incoming Merge/Replace without rolling back the newer local extension source.
- From: Anchor
- From Kind: role
- From Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)
- To: Anchor
- To Kind: role
- To Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)

## Transfers

- current-extension-vscode-source
  - Transfer Kind: work
  - Description: Preserve and return the recipient lane's current extension-vscode source, including the latest Sigma-driven Discovery/Incoming/Outgoing UX: deterministic `YYYY-MM-DD HH:mm:ss` timestamps; package move semantics between Discovery and Incoming; tree-local Incoming/Outgoing loading feedback; outer-carrier-bounded Logical Handoff projection; Files pointer destination expansion; Markdown preview navigation; operator Handoff reveal; one-click Bump Major; and payload/bootstrap planning that remains fail-closed where shared manufacture support is absent.
  - Controlling Artifact: [Projection Task](../explorer/001/projection/002-video-truth-mode-and-conditional-actions.trace.md)
  - Boundary: This source is the active VS Code lane and was intentionally retained across the dependency refresh rather than replaced by an older Refactor snapshot.

- shared-source-frontier-preflight
  - Transfer Kind: work
  - Description: Incoming Merge/Replace now invokes the current shared Core `compare-source-frontiers` operation before strategy selection. The comparison is exact read-only path/byte evidence between one selected Incoming Workspace and its qualified Local Workspace. Exact Workspaces skip mutation; changed Workspaces surface compact `+added ~changed -removed` evidence; any non-qualified comparison state fails visible instead of choosing a winner.
  - Controlling Artifact: [Shared-context refresh](business::.topics/initiatives/refactor/extensions/handoffs/001-refactor-anchor-to-vs-code-anchor-current-shared-context-refresh.trace.md)
  - Boundary: VS Code consumes the shared comparison primitive and does not reimplement source-frontier comparison or infer merge authority from comparison output.

- refreshed-shared-dependencies
  - Transfer Kind: work
  - Description: Current Business, Docs and Core from the dependency-refresh carrier were reconciled as the shared dependency/context frontier. Core includes Secure Transport V1 mechanics and source-frontier comparison/reconciliation Tooling. The carried shared repositories were not mutated.
  - Controlling Artifact: [Shared-context refresh](business::.topics/initiatives/refactor/extensions/handoffs/001-refactor-anchor-to-vs-code-anchor-current-shared-context-refresh.trace.md)
  - Boundary: Business/Docs/Core remain Refactor-owned shared frontiers; this Handoff carries exact current snapshots for context and integration only.

- qualification
  - Transfer Kind: work
  - Description: Sigma's exact hot-reload build path `npm run dev:build` completed with exit 0 against the refreshed Core dependency, and the focused bridge suite completed 50/50 cases green. The added regression coverage binds source-frontier compare invocation and fail-closed carrier-dimension mismatch handling.
  - Controlling Artifact: [VS Code Handoff discovery and manufacture minimum](../001-vs-code-handoff-discovery-and-manufacture-minimum.trace.md)
  - Boundary: Mechanical source qualification is not Sigma Windows-host acceptance of Merge/Replace/Package on real repositories.

## Required Context

- extension-vscode-workspace
  - Material: complete current extension-vscode source after shared dependency reconciliation and comparison-preflight integration
  - Material Reference: [Extension VS Code Workspace](extension-vscode::.topics/.workspaces/tiinex-extension-vscode.workspace.md)
  - Purpose: Writable continuation source for Sigma's linked Ctrl+B hot-reload lane.
  - Availability: available

- business-workspace
  - Material: current Business source from the Refactor Anchor shared-context refresh
  - Material Reference: [Business Workspace](business::.topics/.workspaces/tiinex-business.workspace.md)
  - Purpose: Current Refactor control, Role/delegation and cross-repository context.
  - Availability: available

- docs-workspace
  - Material: current Docs source from the Refactor Anchor shared-context refresh
  - Material Reference: [Docs Workspace](docs::.topics/.workspaces/tiinex-docs.workspace.md)
  - Purpose: Current schema and transport/representation authority.
  - Availability: available

- core-workspace
  - Material: current Core source from the Refactor Anchor shared-context refresh
  - Material Reference: [Core Workspace](core::.topics/.workspaces/tiinex-core.workspace.md)
  - Purpose: Current portable Tooling, source-frontier comparison and Secure Transport V1 mechanics.
  - Availability: available

- shared-context-refresh
  - Material: exact Refactor Anchor dependency-refresh Handoff controlling this reconciliation
  - Material Reference: [Shared-context refresh](business::.topics/initiatives/refactor/extensions/handoffs/001-refactor-anchor-to-vs-code-anchor-current-shared-context-refresh.trace.md)
  - Purpose: Preserve the explicit boundary that extension-vscode stays locally authoritative while Business/Docs/Core remain read-only shared dependencies.
  - Availability: available

- projection-task
  - Material: Sigma-driven tree projection and conditional-action requirements
  - Material Reference: [Projection Task](../explorer/001/projection/002-video-truth-mode-and-conditional-actions.trace.md)
  - Purpose: Controls Logical/Files truth, pointer navigation, loading state and stable action placement.
  - Availability: available

- outgoing-task
  - Material: Outgoing creation, source selection and carrier-dimension continuity context
  - Material Reference: [Outgoing Task](../explorer/001/outgoing/002-fast-carrier-create-and-dimension-continuity.trace.md)
  - Purpose: Controls Outgoing identity and exact source-selection UX.
  - Availability: available

- incoming-task
  - Material: multi-Incoming Merge/Replace and Git-policy context
  - Material Reference: [Incoming Task](../explorer/001/incoming/002-batch-workspace-merge-and-post-merge-git-policy.trace.md)
  - Purpose: Controls safe plan-first landing semantics.
  - Availability: available

## Reference Context

- sigma-carrier-dimension-semantics
  - Material: Sigma clarified that each continuation suffix is the ordinal of the selected recipient Handoff route in the parent carrier's Handoff sequence, not a filename-derived number and not an output-attempt/sibling-allocation counter. One route therefore yields `-1`; the third route yields `-3`.
  - Purpose: Controls the Outgoing projected dimension and identifies a remaining shared Core manufacture-contract gap.
  - Availability: available

- source-frontier-reconciliation
  - Material: Current Core `compare-source-frontiers` reports the retained extension-vscode WIP changed relative to the prior carried extension snapshot while current Business/Docs/Core were adopted from the refresh. The comparison primitive is now used by Incoming apply as read-only preflight.
  - Purpose: Evidence that the dependency refresh did not reset the active extension lane and that current shared comparison mechanics are consumed directly.
  - Availability: available

- qualification-receipt
  - Material: `npm run dev:build` passed and `npm test` passed 50/50 focused bridge cases after current Core adoption.
  - Purpose: Mechanical source qualification.
  - Availability: available

## Retained Responsibilities

- carrier-dimension-shared-contract
  - Retained By: Anchor
  - Retained By Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)
  - Responsibility: Reconcile shared Core carrier continuation manufacture with the agreed carrier dimension rule: append the selected recipient Handoff route's ordinal under the parent carrier. Current Core `manufacture-handoff-package` instead derives ordinary written-child continuation from an output sibling-allocation reservation/default index. VS Code projects the route ordinal and fails closed if shared manufacture returns another dimension; it does not rewrite the carrier.
  - Boundary: This is a shared Core contract blocker/proposal returned to Refactor Anchor. Do not solve it by mutating carried Core from the VS Code lane.

- checkout-only-workspace-carriage
  - Retained By: Anchor
  - Retained By Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)
  - Responsibility: Define qualified checkout-only Workspace manufacture/unpack in shared Core before extension-vscode may Package a Workspace whose payload ZIP is omitted. The UI may plan omission only when clean exact published checkout evidence exists; Package remains fail-closed otherwise.

- bootstrap-payload-omission
  - Retained By: Anchor
  - Retained By Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)
  - Responsibility: Define truthful bootstrap-without-embedded-ZIP transport semantics in shared Core before extension-vscode may manufacture that Outgoing shape.

- secure-transport-ux
  - Retained By: Anchor
  - Retained By Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)
  - Responsibility: Integrate Secure Transport V1 into the human VS Code flow only after Receive/compare/safe landing/package/Handoff behavior is stable; current shared mechanics are dependency context, not an instruction to invent editor-host transport semantics now.

- windows-sigma-acceptance
  - Retained By: Anchor
  - Retained By Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)
  - Responsibility: Continue Sigma's linked Windows UX acceptance, especially real Merge/Replace conflict handling and Package behavior after shared contract blockers are resolved.

## Exclusions And Dependencies

- shared-source-mutation
  - Kind: excluded-scope
  - Description: Business, Docs and Core carried by the refresh were consumed read-only and are not mutated by this lane.
  - Responsible Party Or Role: Refactor Anchor.

- carrier-dimension-manufacture
  - Kind: unresolved-dependency
  - Description: Shared Core manufacture continuation numbering is not yet aligned with the agreed Handoff-route ordinal carrier-dimension semantics. VS Code detects the mismatch and blocks instead of post-editing a qualified package.
  - Responsible Party Or Role: Refactor Anchor / Core frontier.

- checkout-only-manufacture
  - Kind: unresolved-dependency
  - Description: Current shared Core still requires embedded Workspace snapshot archives for qualified recipient grounding/manufacture; checkout-only payload omission remains unavailable.
  - Responsible Party Or Role: Refactor Anchor / Core frontier.

- bootstrap-absence
  - Kind: unresolved-dependency
  - Description: Current shared bootstrap contract still expects the embedded portable Tooling payload; remembered bootstrap omission remains a plan-only choice until shared semantics exist.
  - Responsible Party Or Role: Refactor Anchor / Core frontier.

- release
  - Kind: excluded-scope
  - Description: No VSIX/npm/GitHub publication or remote repository mutation is authorized.
  - Responsible Party Or Role: Refactor Anchor / Sigma at explicit release gates.

## Completion Expectation

- Signal Kind: return
- Signal Meaning: Reconcile the returned current extension-vscode source into the Refactor frontier, preserve the refreshed Business/Docs/Core dependencies, resolve the shared carrier-dimension manufacture contract and remaining checkout/bootstrap transport blockers, then return the shared capability frontier so Sigma can continue real Merge/Replace/Package dogfood without VS Code inventing shared semantics.
- Return To: Anchor
- Return To Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)

## Interpretation Limits

- Does Not Mean: Merge/Replace has been Sigma-accepted on real repositories, checkout-only/bootstrap-less Handoff carriers are manufacturable, Secure Transport UX is complete, or extension-vscode may mutate Business/Docs/Core.
- Must Not Be Used To Claim: source-frontier comparison grants merge authority; Outgoing may silently accept a shared manufacture dimension different from its Handoff-route ordinal projection; or VS Code may post-edit qualified carrier bytes to repair shared-contract gaps.
- Authority Limits: Current extension-vscode UX/host implementation plus read-only adoption of shared dependencies and use of shared comparison mechanics. Shared Core/Docs/Business contract changes remain Refactor-owned.
- Transport Limits: Return as one canonical full-source Anchor-to-Anchor Handoff carrier.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [009-1-1-1-1-1-1-1-1-1-vs-code-outer-logical-boundary-and-outgoing-spinner-return.trace.md](009-1-1-1-1-1-1-1-1-1-vs-code-outer-logical-boundary-and-outgoing-spinner-return.trace.md)
  - Value: 2uE1J1M9m6hI2rBwrsc1DAx1lSkPL-bsZxrzprUeMLU

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: MfvXGaT1Zwgoob2mTkDaYkU91GytWSE89pqUf_FIjBY