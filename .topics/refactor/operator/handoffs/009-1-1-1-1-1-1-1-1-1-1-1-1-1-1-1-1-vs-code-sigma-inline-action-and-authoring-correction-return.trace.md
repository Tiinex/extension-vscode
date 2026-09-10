# Continuity Context

- Envelope Schema: tiinex.root.v1
- Parent
  - Parent Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-10 22:22:37
  - Trace: [009-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-vs-code-sigma-video-safety-correction-return.trace.md](009-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-vs-code-sigma-video-safety-correction-return.trace.md)
  - Origin:
    - [relative](009-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-vs-code-sigma-video-safety-correction-return.trace.md)
- Current
  - Current Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-10 22:47:32
  - Authors: Kodax
  - Why: Sigma's second live video clarified that mutation/package operations are row buttons, exposed the missing Explorer Attach menu, and showed the shared compare bridge masking structured Core qualification exits as process failures.
  - Summary: Return inline Merge/Replace/Pack actions, discoverable Handoff creation/Attach, Outgoing reveal, and structured Core receipt handling for Sigma retest.
  - Status: ready/local

---

## Handoff Parties

- Purpose: Return Sigma's second live VS Code video correction pass with operator actions restored to row buttons, Handoff creation/Attach made discoverable, and shared Tooling process receipts handled without masking fail-closed qualification errors as generic process failures.
- From: Kodax
- From Kind: role
- From Reference: [Kodax Role](business::.topics/roles/001-6-kodax-role.trace.md)
- To: Sigma
- To Kind: role
- To Reference: [Sigma Role](business::.topics/roles/001-4-sigma-role.trace.md)

## Transfers

- inline-operator-actions
  - Transfer Kind: work
  - Description: Incoming Review Merge and Review Replace are no longer child tree nodes. They are inline row actions on the Incoming package and on each unapplied Workspace row in both Logical and Files projections. Applied Workspaces switch to passed-state contexts and no longer expose mutation actions. Pack is likewise an inline action on the Outgoing carrier ZIP/root row rather than a child node.
  - Controlling Artifact: [VS Code Handoff discovery and manufacture minimum](../001-vs-code-handoff-discovery-and-manufacture-minimum.trace.md)
  - Boundary: Row actions still only enter Review; no source mutation occurs before the separate Execute Plan confirmation and pre-mutation requalification.

- handoff-authoring-and-attach-discoverability
  - Transfer Kind: work
  - Description: New Handoff is an inline + action on Outgoing Workspace rows in both Logical and Files projections, and the command-palette New Outgoing Handoff command now enters the real authoring flow. Explorer retains a Tiinex submenu for Markdown files/folders; Attach can create an Outgoing context when none exists and successful Attach reveals/focuses the Tiinex Outgoing panel automatically.
  - Controlling Artifact: [Simple Handoff authoring](../explorer/001/outgoing/001/001-simple-handoff-authoring-and-preview-before-write.trace.md)
  - Boundary: Shared Core remains Handoff schema/path/integrity authority. Attach changes package-route selection only and does not rewrite Handoff artifact Parent semantics.

- shared-tooling-process-receipt-correction
  - Transfer Kind: work
  - Description: The host now preserves valid structured Core JSON receipts even when portable Tooling exits non-zero because the receipt contains qualification errors. Semantic comparison blockers therefore surface as shared comparison blockers instead of generic child-process failures. In the desktop host, the VS Code executable is used through Electron-as-Node unless tiinex.nodePath is explicitly configured, matching VS Code's supported child-process contract and avoiding dependence on an unrelated system Node PATH entry.
  - Controlling Artifact: [Turn 2 portable Tooling and allocation discipline](core::.topics/refactor/tooling/001-turn-2-portable-tooling-and-allocation-discipline.trace.md)
  - Boundary: Non-zero execution without valid JSON remains a process failure; valid blocked receipts remain fail-closed and never authorize mutation.

- repository-session-safety-preserved
  - Transfer Kind: work
  - Description: One distinct repository stays in ordinary single-folder/single-repository operation. More than one distinct required repository may open a dedicated temporary multi-root workspace in a new VS Code window only after explicit confirmation. Duplicate full snapshots targeting one root, nested/overlapping roots, and local Git state changes after Review remain blockers before mutation.
  - Controlling Artifact: [Workspace discovery and multi-root mapping](../unpacking/001-workspace-discovery-and-multi-root-mapping.trace.md)
  - Boundary: Multi-root is a host transition for genuinely multi-repository work only; it is never inferred merely from carrier Workspace count.

- qualification-receipt
  - Transfer Kind: work
  - Description: Repository-local validate passes typecheck, build, 56/56 focused regression cases and deterministic VSIX construction. Direct current-Core source-frontier comparison between the modified extension-vscode source and Sigma's prior dogfood carrier returns ready/changed with zero qualification errors, confirming the compare bridge is executable after this correction.
  - Controlling Artifact: [VS Code Handoff discovery and manufacture minimum](../001-vs-code-handoff-discovery-and-manufacture-minimum.trace.md)
  - Boundary: VSIX output is qualification evidence only. Real Windows menu rendering, inline button placement and the received Merge/Replace path still require Sigma live-host confirmation; no release is authorized.

## Required Context

- extension-vscode-workspace
  - Material: current complete extension-vscode source with second-video UX/runtime corrections.
  - Material Reference: [Extension VS Code Workspace](extension-vscode::.topics/.workspaces/tiinex-extension-vscode.workspace.md)
  - Purpose: executable source for Sigma's next dogfood pass and the only Workspace mutated in this continuation.
  - Availability: available

- parent-sigma-video-return
  - Material: prior Kodax-to-Sigma video safety correction Handoff.
  - Material Reference: [Parent Handoff](009-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-vs-code-sigma-video-safety-correction-return.trace.md)
  - Purpose: preserve exact artifact continuity from the candidate Sigma just exercised.
  - Availability: available

- business-workspace
  - Material: current Business Role context for Sigma, Kodax and retained Anchor authority.
  - Material Reference: [Business Workspace](business::.topics/.workspaces/tiinex-business.workspace.md)
  - Purpose: endpoint and authority grounding only; unchanged source.
  - Availability: available

- core-workspace
  - Material: current public Core/Tooling source and bootstrap runtime contract.
  - Material Reference: [Core Workspace](core::.topics/.workspaces/tiinex-core.workspace.md)
  - Purpose: shared comparison, authoring, qualification and package semantic authority; unchanged source.
  - Availability: available

- docs-workspace
  - Material: canonical Tiinex schema and continuity semantics.
  - Material Reference: [Docs Workspace](docs::.topics/.workspaces/tiinex-docs.workspace.md)
  - Purpose: semantic authority only; unchanged source.
  - Availability: available

## Reference Context

- sigma-second-video-acceptance
  - Material: Sigma confirmed Merge/Replace and Pack are buttons rather than tree nodes, requested per-Workspace Merge/Replace, showed the Explorer Attach submenu absent in the real host, and requested that Attach reveal the Tiinex panel. Sigma also requested a clear path into the already-started Handoff authoring work.
  - Purpose: acceptance evidence driving this correction slice.
  - Availability: available

- operator-action-pattern
  - Material: Data remains in the tree; imperative operations sit on the row they affect. Package-wide actions sit on the carrier row, Workspace actions sit on the Workspace row, and Handoff route actions sit on Handoff rows.
  - Purpose: keep the tree browseable and reduce accidental mutation affordances as carrier size grows.
  - Availability: available

## Retained Responsibilities

- sigma-live-retest
  - Retained By: Sigma
  - Retained By Reference: [Sigma Role](business::.topics/roles/001-4-sigma-role.trace.md)
  - Responsibility: Verify in ordinary Windows VS Code that Incoming package/Workspace rows expose Merge and Replace buttons, Outgoing carrier exposes Pack, Outgoing Workspace exposes New Handoff, Explorer Markdown context exposes Tiinex > Attach Handoff, and successful Attach reveals Outgoing.
  - Boundary: Start with one repository and only exercise multi-root when selecting more than one distinct repository.

- sigma-feedback-continuation
  - Retained By: Kodax
  - Retained By Reference: [Kodax Role](business::.topics/roles/001-6-kodax-role.trace.md)
  - Responsibility: Keep subsequent fixes bounded to observed extension-vscode behavior, preserving shared semantic authority and fail-closed mutation boundaries.
  - Boundary: Core/Docs/Business source mutation remains outside this lane.

- shared-authoring-gap
  - Retained By: Anchor
  - Retained By Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)
  - Responsibility: Own or delegate the existing Core 0.1.1 generic Handoff endpoint-reference authoring gap.
  - Boundary: Kodax continues to block unsupported semantic authoring rather than synthesize missing Core authority in VS Code.

- release
  - Retained By: Anchor
  - Retained By Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)
  - Responsibility: Retain publication, remote mutation and release disposition.
  - Boundary: This is another dogfood checkpoint, not a release.

## Exclusions And Dependencies

- real-host-rendering
  - Kind: unresolved-dependency
  - Description: Static manifest/tests prove contribution intent but only Sigma's real Windows host can confirm the exact inline/menu rendering and interaction placement after reload.
  - Responsible Party Or Role: Sigma / Kodax.

- cross-repository-atomicity
  - Kind: excluded-scope
  - Description: Multi-repository Review/Execute remains independently guarded per repository and is not represented as an atomic distributed transaction.
  - Responsible Party Or Role: Kodax / Sigma operator awareness.

- untrusted-carrier-hardening
  - Kind: excluded-scope
  - Description: Package-supplied bootstrap trust hardening and broader Windows archive alias/device/ADS protections remain outside this dogfood slice.
  - Responsible Party Or Role: Anchor / shared Tooling owners.

- release-publication
  - Kind: excluded-scope
  - Description: No Marketplace publication, npm publish, GitHub push or release version advance is authorized.
  - Responsible Party Or Role: Anchor / Sigma at explicit release gates.

## Completion Expectation

- Signal Kind: return
- Signal Meaning: Sigma live-tests the row-action placement, authoring/Attach discoverability and corrected shared comparison path and returns the first concrete mismatch or confirms this operator slice is usable enough to advance.
- Return To: Kodax
- Return To Reference: [Kodax Role](business::.topics/roles/001-6-kodax-role.trace.md)

## Interpretation Limits

- Does Not Mean: Merge/Replace is risk-free, multi-repository execution is atomic, generic Handoff authoring is fully supported by Core 0.1.1, arbitrary Handoff packages are trusted, or the extension is release-qualified.
- Must Not Be Used To Claim: action buttons themselves grant mutation authority, a single-repository operation should be converted to multi-root, Attach changes Handoff Parent semantics, VS Code owns carrier/package semantics, or a green local VSIX authorizes publication.
- Authority Limits: bounded extension-vscode host implementation and qualification only; shared Core/Docs retain semantic authority and Anchor retains cross-repository/release disposition.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [009-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-vs-code-sigma-video-safety-correction-return.trace.md](009-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-vs-code-sigma-video-safety-correction-return.trace.md)
  - Value: BhIVmYF_VFWkhSw1S8z_6WONhMFG8a0Umxo7mSWBaiE

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: jCWFAOPVGebPY-aB8iSz6lKkPzqaSNxuy7Vjdi5jQTE