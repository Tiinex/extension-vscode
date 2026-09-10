# Continuity Context

- Envelope Schema: tiinex.root.v1
- Parent
  - Parent Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-10 22:47:32
  - Trace: [009-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-vs-code-sigma-inline-action-and-authoring-correction-return.trace.md](009-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-vs-code-sigma-inline-action-and-authoring-correction-return.trace.md)
  - Origin:
    - [relative](009-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-vs-code-sigma-inline-action-and-authoring-correction-return.trace.md)
- Current
  - Current Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-10 23:30:35
  - Authors: Kodax
  - Why: Sigma live-testing showed the action-node rewrite regressed established Merge/Replace/Close/Pack controls; rollback the UX and forward-port only qualified safety and transport improvements.
  - Summary: Restore the proven inline TreeView UX while preserving newer mutation safety, delta display, pointerless Pack, reveal behavior and exact transport-text handling for Sigma retest.
  - Status: ready/local

---

## Handoff Parties

- Purpose: Return the Sigma-requested UX rollback and transport-correction pass: preserve the proven inline operator controls, keep the new mutation safety logic, add local-delta display, allow pointerless Pack, and make Handoff transport/reveal behavior explicit without redefining shared Tiinex semantics.
- From: Kodax
- From Kind: role
- From Reference: [Kodax Role](business::.topics/roles/001-6-kodax-role.trace.md)
- To: Sigma
- To Kind: role
- To Reference: [Sigma Role](business::.topics/roles/001-4-sigma-role.trace.md)

## Transfers

- proven-inline-ux-restored
  - Transfer Kind: work
  - Description: Restore the pre-regression TreeView action placement exactly: Incoming Merge and Replace are inline buttons on the Incoming carrier row, each unapplied Workspace row and each Workspace archive row; Close is restored on the Incoming carrier row; Outgoing Pack and Close are inline buttons on the Outgoing carrier row. The action-child-node experiment is removed. Merge, Replace and Pack now use explicit icons while retaining the established row locations.
  - Controlling Artifact: [VS Code Handoff discovery and manufacture minimum](../001-vs-code-handoff-discovery-and-manufacture-minimum.trace.md)
  - Boundary: Inline mutation buttons enter Review only. They do not bypass comparison, explicit Execute confirmation or pre-mutation requalification.

- mutation-safety-forward-port
  - Transfer Kind: work
  - Description: Preserve the newer shared-compare process handling, safe Node executable selection, Review-before-Execute UX, single-repository operation, explicit multi-root transition only for multiple distinct repository targets, duplicate/overlapping repository-root blocking, and post-confirmation Git-state revalidation before the first source mutation.
  - Controlling Artifact: [Workspace discovery and multi-root mapping](../unpacking/001-workspace-discovery-and-multi-root-mapping.trace.md)
  - Boundary: Multi-repository mutation remains independently guarded rather than represented as an atomic distributed transaction.

- local-delta-display
  - Transfer Kind: work
  - Description: Discovery and Incoming each expose an All/Delta display toggle. Delta is projected by shared source-frontier comparison against qualified open local repository sources. Exact-equal Workspaces are hidden; added/byte-changed paths remain visible and local-only removals remain visible in the Workspace delta summary. Unresolved or failed comparisons remain visible rather than being mistaken for equality.
  - Controlling Artifact: [Native carrier tree operator](../explorer/001-native-carrier-tree-operator.trace.md)
  - Boundary: Delta is a read-only presentation projection. It grants no landing or mutation authority and never hides unqualified differences as exact state.

- unrestricted-workspace-pack
  - Transfer Kind: work
  - Description: Pack is permitted whenever Outgoing contains one or more qualified Workspace sources. With zero attached Handoff routes, shared Tooling manufactures a pointerless Workspace carrier. With one or more attached Handoff routes, shared Tooling manufactures the qualified Handoff carrier. From-Incoming carrier/source selection does not force creation of a Handoff merely to transport Workspace state.
  - Controlling Artifact: [Outgoing carrier parent and routing](../explorer/001/outgoing/001/002-carrier-parent-and-package-routing.trace.md)
  - Boundary: Pointerless Workspace transport creates no Handoff, endpoint, transfer, acceptance or completion semantics.

- package-reveal-and-route-text
  - Transfer Kind: work
  - Description: After successful manufacture, Discovery refreshes immediately when the written ZIP lands in the selected Discovery folder. If the ZIP is inside an open VS Code Workspace, the completion action reveals it in the VS Code Explorer; otherwise the action opens/reveals it in the operating-system file explorer. Exactly one Handoff route causes the exact shared-Tooling transport text to be copied before the completion notification. Multiple routes are not auto-selected; each attached Handoff row exposes a Copy action that uses the exact transport text retained from the most recent successful Pack.
  - Controlling Artifact: [Multiple Handoff routes](../explorer/001/outgoing/001/002/001-multiple-handoff-routes.trace.md)
  - Boundary: Transport text is copied from qualified shared Tooling output and is never reconstructed by the VS Code host.

- authoring-and-attach-discoverability
  - Transfer Kind: work
  - Description: Keep the discoverable Handoff authoring entry point and Explorer Tiinex submenu. Attach Handoff remains available for Markdown Handoff artifacts and reveals/focuses the Tiinex Outgoing panel after successful attachment. Outgoing Workspace rows remain an explicit New Handoff entry point.
  - Controlling Artifact: [Simple Handoff authoring](../explorer/001/outgoing/001/001-simple-handoff-authoring-and-preview-before-write.trace.md)
  - Boundary: Shared Tooling remains schema/path/integrity authority; the extension does not synthesize unsupported endpoint authority.

- qualification-receipt
  - Transfer Kind: work
  - Description: Repository-local validation passes TypeScript typecheck, clean build, 57/57 focused regression cases and deterministic VSIX construction. A direct shared-Core pointerless Workspace-carrier smoke also returns ready with zero Handoff routes, a qualified extension-vscode Workspace binding, clean qualification and a written recipient-facing ZIP.
  - Controlling Artifact: [Native tree self-review](../explorer/001/review/001-native-tree-self-review-and-manufacture-smoke.trace.md)
  - Boundary: The VSIX and smoke carrier are qualification evidence only. Sigma's real Windows host remains the acceptance environment for exact TreeView rendering and interaction behavior.

## Required Context

- extension-vscode-workspace
  - Material: complete current extension-vscode source after UX rollback and safety/transport forward-port.
  - Material Reference: [Extension VS Code Workspace](extension-vscode::.topics/.workspaces/tiinex-extension-vscode.workspace.md)
  - Purpose: executable source for Sigma dogfood and the only Workspace source mutated in this continuation.
  - Availability: available

- parent-kodax-return
  - Material: prior Kodax-to-Sigma inline-action and authoring correction Handoff.
  - Material Reference: [Parent Handoff](009-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-vs-code-sigma-inline-action-and-authoring-correction-return.trace.md)
  - Purpose: preserve exact Handoff artifact continuity across Sigma's regression report and this rollback pass.
  - Availability: available

- business-workspace
  - Material: current Business Role context for Sigma, Kodax and retained Anchor authority.
  - Material Reference: [Business Workspace](business::.topics/.workspaces/tiinex-business.workspace.md)
  - Purpose: endpoint and authority grounding only; unchanged source.
  - Availability: available

- core-workspace
  - Material: qualified public Core/Tooling runtime and package/compare contracts.
  - Material Reference: [Core Workspace](core::.topics/.workspaces/tiinex-core.workspace.md)
  - Purpose: shared comparison, authoring, qualification and package semantic authority; unchanged source.
  - Availability: available

- docs-workspace
  - Material: canonical Tiinex schema and continuity semantics.
  - Material Reference: [Docs Workspace](docs::.topics/.workspaces/tiinex-docs.workspace.md)
  - Purpose: semantic authority only; unchanged source.
  - Availability: available

## Reference Context

- sigma-regression-acceptance
  - Material: Sigma's live screenshots/video and follow-up requirements: preserve the earlier inline Merge/Replace/Close UX, keep per-Workspace controls, keep Pack on the Outgoing carrier row, add an All/Delta display option, permit Pack without Handoff routes, refresh Discovery after output, distinguish VS Code Explorer vs OS Explorer reveal, and expose exact Handoff transport text without arbitrary multi-route selection.
  - Purpose: acceptance evidence driving this correction.
  - Availability: available

- rollback-policy
  - Material: The pre-video carrier was used as the UX baseline and newer safety/transport logic was forward-ported onto it rather than continuing the action-node rewrite.
  - Purpose: reduce regression surface and preserve a user-tested operator interaction model.
  - Availability: available

## Retained Responsibilities

- sigma-live-retest
  - Retained By: Sigma
  - Retained By Reference: [Sigma Role](business::.topics/roles/001-4-sigma-role.trace.md)
  - Responsibility: Verify the real Windows host: Merge/Replace buttons on carrier, Workspace and Workspace archive rows; Incoming/Outgoing Close; Pack on Outgoing carrier; Delta toggles; pointerless Pack; Discovery refresh; reveal behavior; Handoff transport copy; authoring and Attach discoverability.
  - Boundary: Start with one repository; only exercise the explicit multi-root transition when selecting more than one distinct repository target.

- bounded-followup
  - Retained By: Kodax
  - Retained By Reference: [Kodax Role](business::.topics/roles/001-6-kodax-role.trace.md)
  - Responsibility: Treat Sigma's next live result as acceptance evidence and keep corrections bounded to observed extension-vscode behavior.
  - Boundary: Core, Docs and Business remain read-only unless authority is explicitly expanded.

- shared-authoring-gap
  - Retained By: Anchor
  - Retained By Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)
  - Responsibility: Own or delegate the existing Core 0.1.1 generic Handoff endpoint-reference authoring gap and shared carrier naming/dimension semantics where the host cannot qualify the requested behavior.
  - Boundary: Kodax blocks unsupported semantics rather than fabricating Core authority.

- release
  - Retained By: Anchor
  - Retained By Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)
  - Responsibility: Retain publication, remote mutation and release disposition.
  - Boundary: This remains a dogfood checkpoint, not a release.

## Exclusions And Dependencies

- real-host-rendering
  - Kind: unresolved-dependency
  - Description: Static manifest/tests prove contribution intent but exact inline-button rendering and context-menu placement require Sigma's real Windows VS Code host.
  - Responsible Party Or Role: Sigma / Kodax.

- cross-repository-atomicity
  - Kind: excluded-scope
  - Description: Multiple repositories are independently requalified and guarded; this pass does not claim transactional rollback across repositories after an operating-system write failure.
  - Responsible Party Or Role: Kodax / Sigma operator awareness.

- untrusted-carrier-hardening
  - Kind: excluded-scope
  - Description: Broad-release package-supplied bootstrap trust hardening and additional Windows archive alias/device/ADS protections remain outside this trusted dogfood lane.
  - Responsible Party Or Role: Anchor / shared Tooling owners.

- release-publication
  - Kind: excluded-scope
  - Description: No Marketplace publication, npm publish, GitHub push or version advance is authorized.
  - Responsible Party Or Role: Anchor / Sigma at explicit release gates.

## Completion Expectation

- Signal Kind: return
- Signal Meaning: Sigma retests the restored proven UX plus the forward-ported safety/transport behavior and returns the first concrete mismatch or confirms the operator flow is usable enough to advance.
- Return To: Kodax
- Return To Reference: [Kodax Role](business::.topics/roles/001-6-kodax-role.trace.md)

## Interpretation Limits

- Does Not Mean: pointerless Workspace transport is a Handoff, multi-repository mutation is atomic, generic Handoff authoring is fully supported by Core 0.1.1, arbitrary carriers are trusted, or release is authorized.
- Must Not Be Used To Claim: a button grants mutation authority, a one-repository action should create multi-root state, transport text may be reconstructed by the host, package membership creates Handoff semantics, or green local validation replaces Sigma live-host acceptance.
- Authority Limits: bounded extension-vscode implementation and qualification only; shared Core/Docs retain semantic authority and Anchor retains shared-contract/release disposition.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [009-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-vs-code-sigma-inline-action-and-authoring-correction-return.trace.md](009-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-vs-code-sigma-inline-action-and-authoring-correction-return.trace.md)
  - Value: jCWFAOPVGebPY-aB8iSz6lKkPzqaSNxuy7Vjdi5jQTE

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: GIbgiLdh30fOgXiVindSoMOvPlmrpYjStOR-uzjIbXU