# Continuity Context

- Envelope Schema: tiinex.root.v1
- Parent
  - Parent Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-10 16:08:02
  - Trace: [009-1-1-1-1-1-1-1-1-vs-code-logical-and-safe-checkout-payload-planning-return.trace.md](009-1-1-1-1-1-1-1-1-vs-code-logical-and-safe-checkout-payload-planning-return.trace.md)
  - Origin:
    - [relative](009-1-1-1-1-1-1-1-1-vs-code-logical-and-safe-checkout-payload-planning-return.trace.md)
- Current
  - Current Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-10 16:27:48
  - Authors: Anchor
  - Why: Sigma observed nested payload Handoffs leaking into Logical and requested Outgoing tree-local loading feedback.
  - Summary: Correct Logical to outer carrier scope and add visible Outgoing loading state.
  - Status: ready/local

---

## Handoff Parties

- Purpose: Return the exact extension-vscode source after correcting Logical to remain strictly at the outer Handoff-package layer and adding an in-tree Outgoing loading spinner, while preserving the previously qualified multi-Incoming, Outgoing, Merge/Replace and payload-planning behavior.
- From: Anchor
- From Kind: role
- From Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)
- To: Anchor
- To Kind: role
- To Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)

## Transfers

- outer-only-logical-projection
  - Transfer Kind: work
  - Description: Discovery, Incoming and Outgoing Logical still project each Workspace once with `Lineage`, `Handoffs`, and `Files`, but those groups are now strictly carrier-layer projections. Logical no longer indexes or traverses nested `.workspace.zip` payload contents. Incoming Handoffs are derived only from package-local qualified Handoff route pointers associated with the Workspace; carrier-level endpoint/lineage pointers may appear only under their associated Workspace Lineage. Logical Files shows the outer Workspace descriptor and optional Workspace archive only, without expanding that archive.
  - Controlling Artifact: [Projection Task](../explorer/001/projection/002-video-truth-mode-and-conditional-actions.trace.md)
  - Boundary: Historical Handoffs, Tiinex artifacts and repository files inside carried Workspace payload ZIPs are not Logical children. The global `Files` projection remains the explicit place where a Workspace archive may be expanded.

- outgoing-tree-loading-state
  - Transfer Kind: work
  - Description: Outgoing now exposes a native spinning `Loading…` state directly on the Outgoing root while Local Workspace qualification or package manufacture is running. The root is materialized before New performs the initial Workspace qualification, so progress is visible in the tree instead of only through VS Code notification/status progress.
  - Controlling Artifact: [Projection Task](../explorer/001/projection/002-video-truth-mode-and-conditional-actions.trace.md)
  - Boundary: The spinner is presentation state only and does not alter package semantics, selection precedence or mutation authority.

- preserved-ux-and-safety
  - Transfer Kind: work
  - Description: Multi-Incoming ordering/move behavior, Local-first Outgoing source selection with duplicate reconfirmation, Merge/Replace safety, payload include/omit planning, remembered bootstrap preference, exact visible Outgoing filename projection and stable action ordering remain unchanged by this patch.
  - Controlling Artifact: [VS Code Handoff discovery and manufacture minimum](../001-vs-code-handoff-discovery-and-manufacture-minimum.trace.md)
  - Boundary: Shared Core checkout-only manufacture/unpack remains unresolved and is not reimplemented inside extension-vscode.

- source-qualification
  - Transfer Kind: work
  - Description: Sigma's exact hot-reload build path `npm run dev:build` completed with exit 0 after the patch, and the focused bridge suite completed 49/49 cases green. No VSIX is included or required.
  - Controlling Artifact: [VS Code Handoff discovery and manufacture minimum](../001-vs-code-handoff-discovery-and-manufacture-minimum.trace.md)
  - Boundary: Mechanical build/test qualification is not Sigma Windows-host UX acceptance.

## Required Context

- extension-vscode-workspace
  - Material: complete current extension-vscode source with outer-only Logical projection and Outgoing in-tree loading state
  - Material Reference: [Extension VS Code Workspace](extension-vscode::.topics/.workspaces/tiinex-extension-vscode.workspace.md)
  - Purpose: Full writable source for Sigma's linked Ctrl+B hot-reload loop.
  - Availability: available

- parent-return-handoff
  - Material: immediately preceding Logical/payload-planning return Handoff
  - Material Reference: [Prior return](009-1-1-1-1-1-1-1-1-vs-code-logical-and-safe-checkout-payload-planning-return.trace.md)
  - Purpose: Exact continuation parent and source baseline.
  - Availability: available

- projection-task
  - Material: tree projection and conditional-action requirements
  - Material Reference: [Projection Task](../explorer/001/projection/002-video-truth-mode-and-conditional-actions.trace.md)
  - Purpose: Controls outer carrier Logical semantics, Files presentation and stable action placement.
  - Availability: available

- outgoing-task
  - Material: Outgoing carrier creation and dimension continuity context
  - Material Reference: [Outgoing Task](../explorer/001/outgoing/002-fast-carrier-create-and-dimension-continuity.trace.md)
  - Purpose: Controls Outgoing identity, package parent, source selection and package planning.
  - Availability: available

- incoming-task
  - Material: multi-Incoming Merge/Replace and Git-policy context
  - Material Reference: [Incoming Task](../explorer/001/incoming/002-batch-workspace-merge-and-post-merge-git-policy.trace.md)
  - Purpose: Preserve safe apply semantics while Incoming presentation evolves.
  - Availability: available

- core-workspace
  - Material: unchanged shared Core 0.1.1 portable Tooling contract
  - Material Reference: [Core Workspace](core::.topics/.workspaces/tiinex-core.workspace.md)
  - Purpose: Canonical manufacture, orientation, Workspace-provider and future checkout-unpack authority.
  - Availability: available

- docs-workspace
  - Material: unchanged schema/continuity context
  - Material Reference: [Docs Workspace](docs::.topics/.workspaces/tiinex-docs.workspace.md)
  - Purpose: Schema authority remains outside this extension patch.
  - Availability: available

- business-workspace
  - Material: unchanged Anchor Role context
  - Material Reference: [Business Workspace](business::.topics/.workspaces/tiinex-business.workspace.md)
  - Purpose: Role/delegation authority.
  - Availability: available

## Reference Context

- sigma-logical-boundary-feedback
  - Material: Sigma demonstrated that Incoming Logical was still surfacing historical Handoffs from inside a carried Workspace ZIP and clarified that Logical must show only the Handoff-package layer, never nested payload contents.
  - Purpose: Human UX evidence controlling the outer-only projection correction.
  - Availability: available

- sigma-outgoing-loading-feedback
  - Material: Sigma requested the same visible in-tree loading affordance for Outgoing that Incoming already exposes, rather than relying only on status/notification progress.
  - Purpose: Human UX evidence controlling the Outgoing spinner.
  - Availability: available

- qualification-receipt
  - Material: `npm run dev:build` passed and `npm test` passed 49/49 focused bridge cases after the final patch.
  - Purpose: Mechanical source qualification.
  - Availability: available

## Retained Responsibilities

- checkout-only-core-contract
  - Retained By: Anchor
  - Retained By Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)
  - Responsibility: At the shared Refactor/Core frontier, define and implement qualified checkout-only Workspace manufacture/unpack before extension-vscode may Package omitted Workspace payloads.

- bootstrap-omission-core-contract
  - Retained By: Anchor
  - Retained By Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)
  - Responsibility: Define truthful bootstrap-absence transport semantics in shared Core before extension-vscode may package without the bootstrap ZIP.

- windows-sigma-acceptance
  - Retained By: Anchor
  - Retained By Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)
  - Responsibility: Continue Sigma's linked Windows UX acceptance of outer-only Logical, Outgoing loading, Merge/Replace and Package behavior.

- release-authority
  - Retained By: Anchor
  - Retained By Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)
  - Responsibility: Own later release/publication disposition; this source Handoff does not authorize publication.

## Exclusions And Dependencies

- sibling-source-mutation
  - Kind: excluded-scope
  - Description: Business, Core and Docs source remain unchanged in this return.
  - Responsible Party Or Role: Anchor

- checkout-only-manufacture
  - Kind: unresolved-dependency
  - Description: Current shared Core cannot yet manufacture/qualify checkout-only Workspace carriage safely.
  - Responsible Party Or Role: Anchor

- bootstrap-absence
  - Kind: unresolved-dependency
  - Description: Current shared Tooling bootstrap contract does not yet express complete bootstrap payload omission.
  - Responsible Party Or Role: Anchor

- release
  - Kind: excluded-scope
  - Description: No Marketplace/npm/GitHub release or remote publication is authorized.
  - Responsible Party Or Role: Anchor

## Completion Expectation

- Signal Kind: return
- Signal Meaning: Ground this full-source continuation, run Sigma's Ctrl+B hot-reload build, confirm Logical never exposes nested Workspace payload history, and confirm Outgoing shows its spinner directly in the tree during long qualification/manufacture work.
- Return To: Anchor
- Return To Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)

## Interpretation Limits

- Does Not Mean: nested Workspace payload contents are removed from the carrier, checkout-only/bootstrap-less carriers are manufacturable, Sigma has accepted Merge/Replace or Package on real repositories, or the extension is release-approved.
- Must Not Be Used To Claim: that Logical is a recursive repository browser, that VS Code may post-edit a qualified carrier, or that loading presentation changes semantic authority.
- Authority Limits: Bounded extension-vscode UX/projection implementation plus source qualification; shared carrier/unpack semantics remain Core authority.
- Transport Limits: Return as one canonical full-source Anchor-to-Anchor Handoff carrier.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [009-1-1-1-1-1-1-1-1-vs-code-logical-and-safe-checkout-payload-planning-return.trace.md](009-1-1-1-1-1-1-1-1-vs-code-logical-and-safe-checkout-payload-planning-return.trace.md)
  - Value: apmqznYxRGIqIrOfvLxp1Q-iy-yjFX2ZWL0W3-maiuE

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: 2uE1J1M9m6hI2rBwrsc1DAx1lSkPL-bsZxrzprUeMLU