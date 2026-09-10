# Continuity Context

- Envelope Schema: tiinex.root.v1
- Parent
  - Parent Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-10 14:06:44
  - Trace: [009-1-1-1-1-1-vs-code-video-picker-projection-correction-return.trace.md](009-1-1-1-1-1-vs-code-video-picker-projection-correction-return.trace.md)
  - Origin:
    - [relative](009-1-1-1-1-1-vs-code-video-picker-projection-correction-return.trace.md)
- Current
  - Current Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-10 14:32:45
  - Authors: Anchor
  - Why: Preserve the accepted source-selection UX while making Outgoing Files and package identity visually truthful before Merge/Package testing.
  - Summary: Return the Outgoing Files/root/icon UX correction for Sigma hot-reload acceptance.
  - Status: ready/local

---

## Handoff Parties

- Purpose: Return the latest extension-vscode source after Sigma's Outgoing Files/root/icon UX correction while preserving the existing multi-Incoming, source-selection, Merge/Replace and Package semantics for continued hot-reload acceptance.
- From: Anchor
- From Kind: role
- From Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)
- To: Anchor
- To Kind: role
- To Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)

## Transfers

- outgoing-files-carrier-projection
  - Transfer Kind: work
  - Description: Outgoing `Files` no longer renders the human-friendly Workspace-root view. It now renders a recipient-style flat carrier surface with the fixed READ/bootstrap/package nodes and deterministic alphabetic Workspace descriptor/archive pairs; Workspace archives expand into the selected Local or Incoming source material. `Logical` remains the human-friendly Workspace projection.
  - Controlling Artifact: [Projection Task](../explorer/001/projection/002-video-truth-mode-and-conditional-actions.trace.md)
  - Boundary: This pre-manufacture Files view only renders package paths that are deterministic before manufacture. Route/cache/endpoint pointer paths that depend on final qualification remain owned by shared Tooling and are not invented locally.

- outgoing-visible-package-identity
  - Transfer Kind: work
  - Description: Outgoing root display no longer emits fake `?` or ellipsis route fragments. Before one included written route is resolvable it shows the carrier label as a `.handoff-package.zip` candidate; once the route and carrier dimension are resolvable it shows the complete projected slug. The tooltip always carries the full visible filename so narrow TreeViews can still expose it without relying on clipped text.
  - Controlling Artifact: [Outgoing carrier continuity Task](../explorer/001/outgoing/002-fast-carrier-create-and-dimension-continuity.trace.md)
  - Boundary: Shared Tiinex Tooling remains final authority for canonical manufacture/output naming and collision allocation.

- outgoing-icon-parity
  - Transfer Kind: work
  - Description: Incoming and Outgoing carrier roots now use the same native archive icon. Outgoing Files uses native Markdown/ZIP file icons and expandable Workspace archive nodes, reducing the previous visual mismatch while leaving the already-approved multi-select Workspace picker unchanged.
  - Controlling Artifact: [Sigma video correction continuation Task](../explorer/001/review/002-sigma-video-correction-next-anchor-continuation.trace.md)
  - Boundary: Conditional title actions remain left of always-visible New/Refresh actions so persistent actions do not change position.

- merge-replace-and-picker-preserved
  - Transfer Kind: work
  - Description: Multi-Incoming ordering, Local-first source priority, duplicate source re-confirmation, Merge/Replace Git/non-Git safety, .git/.gitignore protections, branch/dirty handling and final Execute Plan boundary are unchanged in this correction.
  - Controlling Artifact: [Incoming merge policy Task](../explorer/001/incoming/002-batch-workspace-merge-and-post-merge-git-policy.trace.md)
  - Boundary: Sigma's real-repository Merge/Replace and Package acceptance remains pending.

- source-qualification
  - Transfer Kind: work
  - Description: The corrected source passed the full focused bridge test path with 48/48 cases green after build. No VSIX is part of this iteration; Sigma consumes the full-source Handoff and builds/hot-reloads locally.
  - Controlling Artifact: [VS Code Handoff discovery and manufacture minimum](../001-vs-code-handoff-discovery-and-manufacture-minimum.trace.md)
  - Boundary: Mechanical source qualification is not Windows/Sigma acceptance or release authority.

## Required Context

- extension-vscode-workspace
  - Material: complete current extension-vscode source including the Outgoing Files/root/icon correction
  - Material Reference: [Extension VS Code Workspace](extension-vscode::.topics/.workspaces/tiinex-extension-vscode.workspace.md)
  - Purpose: Full writable source for Sigma's linked hot-reload loop.
  - Availability: available

- parent-return-handoff
  - Material: immediately preceding Sigma video/picker/projection return Handoff
  - Material Reference: [Prior return](009-1-1-1-1-1-vs-code-video-picker-projection-correction-return.trace.md)
  - Purpose: Exact continuation parent and accepted source baseline.
  - Availability: available

- outgoing-task
  - Material: Outgoing carrier creation and dimension continuity context
  - Material Reference: [Outgoing Task](../explorer/001/outgoing/002-fast-carrier-create-and-dimension-continuity.trace.md)
  - Purpose: Controls Outgoing identity, package-parent and carrier dimension behavior.
  - Availability: available

- projection-task
  - Material: tree projection and conditional-action requirements
  - Material Reference: [Projection Task](../explorer/001/projection/002-video-truth-mode-and-conditional-actions.trace.md)
  - Purpose: Controls Files/Logical/Lineage presentation parity.
  - Availability: available

- incoming-task
  - Material: multi-Incoming Merge/Replace and Git-policy context
  - Material Reference: [Incoming Task](../explorer/001/incoming/002-batch-workspace-merge-and-post-merge-git-policy.trace.md)
  - Purpose: Preserve the safe apply model unchanged through this UX iteration.
  - Availability: available

- core-workspace
  - Material: unchanged shared Core portable Tooling contract
  - Material Reference: [Core Workspace](core::.topics/.workspaces/tiinex-core.workspace.md)
  - Purpose: Shared carrier manufacture authority.
  - Availability: available

- docs-workspace
  - Material: unchanged schema/continuity context
  - Material Reference: [Docs Workspace](docs::.topics/.workspaces/tiinex-docs.workspace.md)
  - Purpose: Schema authority.
  - Availability: available

- business-workspace
  - Material: unchanged Anchor Role context
  - Material Reference: [Business Workspace](business::.topics/.workspaces/tiinex-business.workspace.md)
  - Purpose: Role/delegation authority.
  - Availability: available

## Reference Context

- sigma-ux-feedback
  - Material: Sigma requested Outgoing Files to visually match Incoming's carrier/file structure, requested removal of fake `?`/ellipsis filename fragments, confirmed the Workspace multi-select is good, and noted Outgoing icon UX inconsistency.
  - Purpose: Human UX evidence for this exact correction.
  - Availability: available

- hot-reload-loop
  - Material: Sigma consumes full-source Handoff packages and builds/restarts the linked extension locally rather than consuming prebuilt VSIX files.
  - Purpose: Keep transport source-first.
  - Availability: available

- qualification-receipt
  - Material: `npm test` passed with 48/48 focused bridge cases after the final correction.
  - Purpose: Mechanical source qualification for this exact continuation.
  - Availability: available

## Retained Responsibilities

- windows-sigma-acceptance
  - Retained By: Anchor
  - Retained By Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)
  - Responsibility: Continue Sigma's linked Windows main-host UX acceptance, including first real Merge/Replace and Package testing.

- shared-refactor-frontier
  - Retained By: Anchor
  - Retained By Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)
  - Responsibility: Reconcile any shared Tooling/carrier-manufacture contract issue at the Refactor frontier rather than reimplementing shared semantic authority in VS Code.

- release-authority
  - Retained By: Anchor
  - Retained By Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)
  - Responsibility: Own later release/publication disposition; this source Handoff does not authorize publication.

## Exclusions And Dependencies

- sibling-source-mutation
  - Kind: excluded-scope
  - Description: Business, Core and Docs source remain unchanged.
  - Responsible Party Or Role: Anchor

- exact-route-generated-files
  - Kind: excluded-scope
  - Description: Pre-manufacture Outgoing Files does not invent route/cache/endpoint pointer filenames whose exact package-local path depends on final shared Tooling qualification.
  - Responsible Party Or Role: Anchor

- real-repository-acceptance
  - Kind: unresolved-dependency
  - Description: Sigma's real local Merge/Replace and Package acceptance remains pending.
  - Responsible Party Or Role: Anchor

- release
  - Kind: excluded-scope
  - Description: No Marketplace/npm/GitHub release or remote publication is authorized.
  - Responsible Party Or Role: Anchor

## Completion Expectation

- Signal Kind: return
- Signal Meaning: Ground this full-source continuation, build/hot-reload it through Sigma's linked development loop, verify Outgoing Files/root/icon parity, then continue into real Merge/Replace and Package acceptance.
- Return To: Anchor
- Return To Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)

## Interpretation Limits

- Does Not Mean: Sigma has accepted Merge/Replace or Package on real repositories, route-generated carrier files are locally authoritative before manufacture, or the extension is release-approved.
- Must Not Be Used To Claim: that Outgoing Files is a manufactured ZIP, that VS Code owns canonical carrier naming, or that Workspace source selection performs merge.
- Authority Limits: Bounded extension-vscode UX implementation and source qualification only.
- Transport Limits: Return as one canonical full-source Anchor-to-Anchor Handoff carrier.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [009-1-1-1-1-1-vs-code-video-picker-projection-correction-return.trace.md](009-1-1-1-1-1-vs-code-video-picker-projection-correction-return.trace.md)
  - Value: qSr35A-bBU7uvg6CrZ5NXdBnETGcUPHCg2M3Bh0ZJjQ

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: tW9auVjMLmSJoJcfC-ZLBC-I97GI0fiB9s8aF2NvHSo