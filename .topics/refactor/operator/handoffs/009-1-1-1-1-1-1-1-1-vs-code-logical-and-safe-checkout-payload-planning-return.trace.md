# Continuity Context

- Envelope Schema: tiinex.root.v1
- Parent
  - Parent Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-10 14:48:46
  - Trace: [009-1-1-1-1-1-1-1-vs-code-hot-reload-build-typecheck-fix-return.trace.md](009-1-1-1-1-1-1-1-vs-code-hot-reload-build-typecheck-fix-return.trace.md)
  - Origin:
    - [relative](009-1-1-1-1-1-1-1-vs-code-hot-reload-build-typecheck-fix-return.trace.md)
- Current
  - Current Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-10 16:08:02
  - Authors: Anchor
  - Why: Preserve the qualified extension work without inventing checkout-only carrier semantics outside Core.
  - Summary: Return Sigma-approved Logical/Incoming UX and safe checkout-payload planning; retain payloadless manufacture/unpack at shared Core frontier.
  - Status: ready/local

---

## Handoff Parties

- Purpose: Return the exact extension-vscode source after Sigma-approved Incoming move/loading, simple Logical Workspace projection, Operator Handoff auto-reveal, and safe checkout-payload planning, while returning the cross-Core manufacture/unpack portion of payload omission to the shared Refactor frontier.
- From: Anchor
- From Kind: role
- From Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)
- To: Anchor
- To Kind: role
- To Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)

## Transfers

- discovery-incoming-move-and-loading
  - Transfer Kind: work
  - Description: Opening a discovered Handoff package immediately hides that path from Discovery and presents it in Incoming as a lightweight `Loading…` package root while qualification runs. Closing Incoming restores the package to Discovery without moving bytes on disk. Pending roots expose Close but not Merge/Replace, and duplicate open requests for the same package path are ignored.
  - Controlling Artifact: [Projection Task](../explorer/001/projection/002-video-truth-mode-and-conditional-actions.trace.md)
  - Boundary: Package bytes are not trusted or projected until qualification succeeds; qualification failure returns the package to Discovery.

- simple-logical-workspace-projection
  - Transfer Kind: work
  - Description: Logical no longer invents carrier-wide Artifacts/Pointers/Workspaces categories. Discovery, Incoming and Outgoing Logical project each Workspace once. Expanding a Workspace exposes exactly `Lineage`, `Handoffs`, and `Files`: Lineage shows the Tiinex artifact directory structure subject to the existing Lineage/Leaves mode, Handoffs shows Handoff artifacts tied to that Workspace plus Outgoing drafts where applicable, and Files lazily shows the complete carried/local payload-visible file tree.
  - Controlling Artifact: [Projection Task](../explorer/001/projection/002-video-truth-mode-and-conditional-actions.trace.md)
  - Boundary: Logical simplifies package interpretation only; it does not recursively invent semantic categories inside Workspace payloads.

- incoming-role-handoff-auto-reveal
  - Transfer Kind: work
  - Description: `tiinex.incoming.autoShowRoleHandoff` remains `yes | no | ask` with `ask` default, but now applies to one or more qualified Handoff routes whose From/To matches the configured Operator role. Every matching actual Handoff artifact is opened; pointer files remain non-openable routing material.
  - Controlling Artifact: [Incoming Task](../explorer/001/incoming/002-batch-workspace-merge-and-post-merge-git-policy.trace.md)
  - Boundary: Role text is only a UI match/default and grants no Role authority.

- outgoing-payload-planning
  - Transfer Kind: work
  - Description: Outgoing Files now exposes inline payload controls on each Workspace descriptor and the bootstrap descriptor. Workspace ZIP omission is accepted only when an Incoming descriptor asserts repository plus exact commit, or when a Local Git Workspace is clean, has origin, has a branch/upstream, and exact HEAD equals the published upstream commit. The selected Local checkout identity is captured as exact repository plus commit. Re-embedding is always available.
  - Controlling Artifact: [Outgoing Task](../explorer/001/outgoing/002-fast-carrier-create-and-dimension-continuity.trace.md)
  - Boundary: Dirty/unpublished/unqualified Local repositories cannot omit payload ZIPs. `.git` is not packaged or mutated by this planning path.

- bootstrap-payload-preference
  - Transfer Kind: work
  - Description: The bootstrap payload include/omit choice is stored in VS Code workspace-scoped state and therefore survives Outgoing New/Close cycles for the same project. Outgoing Files reflects the planned choice immediately.
  - Controlling Artifact: [Outgoing Task](../explorer/001/outgoing/002-fast-carrier-create-and-dimension-continuity.trace.md)
  - Boundary: The choice is a planned Outgoing transport preference, not a change to shared Core bootstrap semantics.

- payload-manufacture-fail-closed
  - Transfer Kind: work
  - Description: Package rechecks checkout eligibility for every Local checkout-only Workspace. If any Workspace payload or the bootstrap payload is planned omitted, VS Code then blocks manufacture with an explicit shared-Core frontier message rather than post-editing or fabricating a carrier. Current Core 0.1.1 still requires archive-backed complete Workspace providers and its Tooling bootstrap delivery contract remains embedded/persistent rather than absent.
  - Controlling Artifact: [VS Code Handoff discovery and manufacture minimum](../001-vs-code-handoff-discovery-and-manufacture-minimum.trace.md)
  - Boundary: Checkout-only manufacture and unpack/checkout materialization require shared Core changes and are intentionally not reimplemented inside extension-vscode.

- minor-ux-cleanup
  - Transfer Kind: work
  - Description: Replacing an existing Outgoing context now presents `Replace | Cancel` instead of redundant Yes/No wording. Existing stable title-action ordering, Local-first Workspace picker, duplicate-source reconfirmation, Files carrier projection, exact visible root identity, and Merge/Replace semantics remain intact.
  - Controlling Artifact: [Projection Task](../explorer/001/projection/002-video-truth-mode-and-conditional-actions.trace.md)
  - Boundary: No new merge precedence or mutation semantics are introduced here.

- source-qualification
  - Transfer Kind: work
  - Description: On the re-grounded exact source, Sigma's hot-reload path `npm run dev:build` completed with exit 0 and the focused bridge suite completed 49/49 cases green, including checkout-payload eligibility regression coverage. No VSIX is included or required.
  - Controlling Artifact: [VS Code Handoff discovery and manufacture minimum](../001-vs-code-handoff-discovery-and-manufacture-minimum.trace.md)
  - Boundary: Mechanical build/test qualification is not Sigma Windows-host acceptance and does not qualify the retained Core frontier.

## Required Context

- extension-vscode-workspace
  - Material: complete current extension-vscode source with Logical/Incoming/payload-planning changes
  - Material Reference: [Extension VS Code Workspace](extension-vscode::.topics/.workspaces/tiinex-extension-vscode.workspace.md)
  - Purpose: Full writable source for Sigma's linked Ctrl+B hot-reload loop.
  - Availability: available

- parent-return-handoff
  - Material: immediately preceding hot-reload build-fix return Handoff
  - Material Reference: [Prior return](009-1-1-1-1-1-1-1-vs-code-hot-reload-build-typecheck-fix-return.trace.md)
  - Purpose: Exact continuation parent and source baseline.
  - Availability: available

- projection-task
  - Material: tree projection and conditional-action requirements
  - Material Reference: [Projection Task](../explorer/001/projection/002-video-truth-mode-and-conditional-actions.trace.md)
  - Purpose: Controls Files/Logical/Lineage presentation and stable action placement.
  - Availability: available

- outgoing-task
  - Material: Outgoing carrier creation and dimension continuity context
  - Material Reference: [Outgoing Task](../explorer/001/outgoing/002-fast-carrier-create-and-dimension-continuity.trace.md)
  - Purpose: Controls Outgoing identity, package-parent, carrier dimensions and package planning.
  - Availability: available

- incoming-task
  - Material: multi-Incoming Merge/Replace and Git-policy context
  - Material Reference: [Incoming Task](../explorer/001/incoming/002-batch-workspace-merge-and-post-merge-git-policy.trace.md)
  - Purpose: Preserve the safe apply model while Incoming presentation evolves.
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

- sigma-ux-acceptance-direction
  - Material: Sigma approved the Discovery-to-Incoming move metaphor, immediate Incoming loading root, simple Workspace-only Logical root, Workspace subgroups Lineage/Handoffs/Files, yes/no/ask Operator-Handoff reveal, safe payload omission only for reproducible committed checkout material, and remembered bootstrap payload preference.
  - Purpose: Human UX evidence controlling this iteration.
  - Availability: available

- shared-core-frontier-evidence
  - Material: Installed Core 0.1.1 package-v1 manufacture requires complete Workspace archive providers; Workspace archive construction emits `.workspace.zip`, and Tooling bootstrap accepts `embedded` or `persistent` delivery but no absent bootstrap transport. Therefore checkout-only Workspace/bootstrap transport cannot be truthfully manufactured or unpacked by the current shared contract.
  - Purpose: Explain why extension-vscode intentionally stops at safe planning and fails closed on Package for omitted payloads.
  - Availability: available

- qualification-receipt
  - Material: `npm run dev:build` passed on the re-grounded current source and `npm test` passed 49/49 focused bridge cases.
  - Purpose: Mechanical source qualification.
  - Availability: available

## Retained Responsibilities

- checkout-only-core-contract
  - Retained By: Anchor
  - Retained By Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)
  - Responsibility: At the shared Refactor/Core frontier, define and implement a qualified Workspace descriptor transport that can omit `.workspace.zip` while binding an exact checkout-capable repository+commit, then teach orientation/landing/unpack to materialize that exact commit without weakening existing archive-backed qualification.

- bootstrap-omission-core-contract
  - Retained By: Anchor
  - Retained By Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)
  - Responsibility: Decide whether and how a carrier can truthfully omit the bootstrap ZIP while retaining a non-lying bootstrap descriptor and cold-start contract; current Core embedded/persistent modes do not express absence.

- windows-sigma-acceptance
  - Retained By: Anchor
  - Retained By Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)
  - Responsibility: Continue Sigma's linked Windows UX acceptance of Logical, loading/move behavior, payload controls, then resume real Merge/Replace and Package testing once the shared payload frontier is resolved.

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
  - Description: Current shared Core cannot manufacture/qualify a carrier whose selected Workspace descriptor has no Workspace archive provider; extension-vscode therefore blocks Package instead of faking transport.
  - Responsible Party Or Role: Anchor

- payloadless-unpack
  - Kind: unresolved-dependency
  - Description: Current shared landing/orientation expects qualified archive-backed Workspace providers; exact repository+commit checkout materialization belongs in shared Core before payloadless Incoming can be executed safely.
  - Responsible Party Or Role: Anchor

- bootstrap-absence
  - Kind: unresolved-dependency
  - Description: Current shared Tooling bootstrap contract supports embedded or persistent delivery, not complete omission of the bootstrap ZIP/descriptor relationship.
  - Responsible Party Or Role: Anchor

- release
  - Kind: excluded-scope
  - Description: No Marketplace/npm/GitHub release or remote publication is authorized.
  - Responsible Party Or Role: Anchor

## Completion Expectation

- Signal Kind: return
- Signal Meaning: Ground this full-source continuation, run Sigma's Ctrl+B hot-reload build, verify the simplified Logical and Incoming move/loading UX, exercise payload toggles, and carry the explicit checkout/bootstrap omission contract to the shared Core frontier before enabling Package for omitted payloads.
- Return To: Anchor
- Return To Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)

## Interpretation Limits

- Does Not Mean: checkout-only or bootstrap-less carriers are currently manufacturable, Sigma has accepted Merge/Replace or Package on real repositories, or the extension is release-approved.
- Must Not Be Used To Claim: that VS Code can post-edit a qualified carrier, that a branch name substitutes for an exact commit, that a dirty/unpublished Workspace may omit payload bytes, or that Logical categories grant artifact authority.
- Authority Limits: Bounded extension-vscode UX/planning implementation plus source qualification; shared carrier/unpack semantics remain Core authority.
- Transport Limits: Return as one canonical full-source Anchor-to-Anchor Handoff carrier.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [009-1-1-1-1-1-1-1-vs-code-hot-reload-build-typecheck-fix-return.trace.md](009-1-1-1-1-1-1-1-vs-code-hot-reload-build-typecheck-fix-return.trace.md)
  - Value: Bhkm-LzMzIyuc8FjkIMIPYnMoyjW5vBLLM0zQGUvn7Q

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: apmqznYxRGIqIrOfvLxp1Q-iy-yjFX2ZWL0W3-maiuE