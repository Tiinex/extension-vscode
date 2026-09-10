# Continuity Context

- Envelope Schema: tiinex.root.v1
- Parent
  - Parent Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-10 17:50:20
  - Trace: [009-1-1-1-1-1-1-1-1-1-1-1-vs-code-shared-context-compare-and-carrier-identity-guard-return.trace.md](009-1-1-1-1-1-1-1-1-1-1-1-vs-code-shared-context-compare-and-carrier-identity-guard-return.trace.md)
  - Origin:
    - [relative](009-1-1-1-1-1-1-1-1-1-1-1-vs-code-shared-context-compare-and-carrier-identity-guard-return.trace.md)
- Current
  - Current Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-10 20:01:49
  - Authors: Anchor
  - Why: The active conversation is reaching its context ceiling before the generic Artifact Authoring slice can be fully qualified; preserve exact WIP and authority instead of risking continuity loss.
  - Summary: Freeze exact current VS Code WIP and return it to Master Anchor for immediate delegation to a fresh VS Code lane.
  - Status: ready/local

---

## Handoff Parties

- Purpose: Emergency full-source return of the current extension-vscode WIP to Master/Refactor Anchor because the active conversation/session is reaching its context ceiling. Preserve the exact current VS Code source, audit it as continuation WIP rather than a completed feature, then delegate the lane to a fresh VS Code Anchor/session with the same bounded authority and shared-dependency constraints.
- From: Anchor
- From Kind: role
- From Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)
- To: Anchor
- To Kind: role
- To Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)

## Transfers

- current-extension-vscode-wip
  - Transfer Kind: work
  - Description: Preserve the exact current extension-vscode source at the interruption point. The source includes the latest Sigma-reviewed Discovery/Incoming/Outgoing UX and an unfinished generic Artifact Authoring implementation. Treat it as active WIP, not as a completed or release-qualified feature.
  - Controlling Artifact: [VS Code Handoff discovery and manufacture minimum](../001-vs-code-handoff-discovery-and-manufacture-minimum.trace.md)
  - Boundary: Master/Refactor Anchor should audit/adopt this source and delegate continuation to a fresh VS Code Anchor/session rather than continuing implementation in this exhausted conversation.

- generic-artifact-authoring-wip
  - Transfer Kind: work
  - Description: A generic Artifact Authoring direction is in progress with Handoff as the first dogfood artifact. New source includes `src/artifactAuthoringPanel.ts`, `src/core/artifactAuthoringModel.ts`, authoring bridge changes, Handoff attach/detach command plumbing, and host UX work. The agreed architecture is Docs semantic authority -> public Core creation/authoring contract -> host-neutral authoring projection -> VS Code Webview/form. VS Code must not import raw Docs schemas or accumulate artifact-specific semantic knowledge; if Core cannot provide fields/choices/cardinality/defaults/constraints ergonomically, return a concrete Core capability gap instead of duplicating semantics locally.
  - Controlling Artifact: [VS Code Handoff discovery and manufacture minimum](../001-vs-code-handoff-discovery-and-manufacture-minimum.trace.md)
  - Boundary: Current implementation is incomplete and should be reviewed before further mutation.

- latest-ux-decisions
  - Transfer Kind: work
  - Description: Preserve Sigma's latest accepted UX decisions: Discovery-to-Incoming uses an arrow-down action; section toolbar ordering is stable with New/Select at the far left, projection toggle then folder selector near each other, Refresh at the right; Merge and Replace are separate text actions; Pack is a text action on the Outgoing package root and should only appear after New; Discovery and Outgoing each have explicit folder selection; Outgoing materializes packages to an Outgoing folder; Handoff creation is available both from Outgoing and File Explorer context menus through the same generic authoring form; Attach to Outgoing is a host action and defaults checked when appropriate; attach/detach must dedupe routes and create the required outer Handoff/from/to role pointers plus optional extra Role participants through shared Core semantics.
  - Controlling Artifact: [Projection Task](../explorer/001/projection/002-video-truth-mode-and-conditional-actions.trace.md)
  - Boundary: Ergonomic host behavior only; artifact semantics remain Core/Docs-owned.

- handoff-package-and-cache-design
  - Transfer Kind: work
  - Description: Continue the agreed Handoff/package design. A Handoff artifact lives in exactly one Workspace. Attaching it to Outgoing creates carrier-level routing/provenance through shared Core; detaching removes the carrier attachment but does not delete the Handoff. A Handoff created against a non-local Incoming Workspace must be written into the copied Outgoing workspace payload, never mutate Incoming. `cache.trace.md` / `cache.zip` should represent only minimal dependency closure for attached artifacts such as Roles when their source Workspace is not otherwise carried; do not invent this format in VS Code if current shared Core/Docs does not expose it. Package creation and Handoff creation remain separate operations.
  - Controlling Artifact: [Outgoing Task](../explorer/001/outgoing/002-fast-carrier-create-and-dimension-continuity.trace.md)
  - Boundary: Exact cache semantics and carrier manufacture remain shared Core/Docs responsibilities.

- merge-landing-state
  - Transfer Kind: work
  - Description: Merge/Replace implementation remains bounded dogfood WIP and Sigma intentionally planned to test it last. Preserve the plan-first safety model: no mutation until final Execute; Git-native conflicts when provable ancestry exists; file-safe mode otherwise; `.git` is never replaced; `.gitignore`/ignored material is respected; Git and non-Git local Workspaces are both supported; package-level Merge/Replace can select multiple Workspaces while Workspace-level actions scope directly to one Workspace. Current shared Core source-frontier comparison is used as read-only preflight.
  - Controlling Artifact: [Incoming Task](../explorer/001/incoming/002-batch-workspace-merge-and-post-merge-git-policy.trace.md)
  - Boundary: Not yet Sigma-accepted on real repositories.

- qualification-at-freeze
  - Transfer Kind: work
  - Description: Immediately before this emergency handoff freeze, the exact hot-reload build path `npm run dev:build` completed successfully on the current WIP. The full regression suite was not rerun after the latest authoring/toolbar WIP because the session ceiling required immediate artifactization.
  - Controlling Artifact: [VS Code Handoff discovery and manufacture minimum](../001-vs-code-handoff-discovery-and-manufacture-minimum.trace.md)
  - Boundary: Build success is not full feature qualification or Windows-host acceptance.

## Required Context

- extension-vscode-workspace
  - Material: exact current full-source extension-vscode WIP frozen at the session-ceiling interruption
  - Material Reference: [Extension VS Code Workspace](extension-vscode::.topics/.workspaces/tiinex-extension-vscode.workspace.md)
  - Purpose: Writable continuation source for the newly delegated VS Code lane.
  - Availability: available

- business-workspace
  - Material: current read-only Business snapshot carried from the shared dependency refresh
  - Material Reference: [Business Workspace](business::.topics/.workspaces/tiinex-business.workspace.md)
  - Purpose: Role/delegation and Refactor coordination authority.
  - Availability: available

- docs-workspace
  - Material: current read-only Docs snapshot
  - Material Reference: [Docs Workspace](docs::.topics/.workspaces/tiinex-docs.workspace.md)
  - Purpose: Canonical schema, Handoff/cache/transport semantics and validators.
  - Availability: available

- core-workspace
  - Material: current read-only Core snapshot including source-frontier comparison and Secure Transport mechanics
  - Material Reference: [Core Workspace](core::.topics/.workspaces/tiinex-core.workspace.md)
  - Purpose: Public shared Tooling and authoring/manufacture capability frontier.
  - Availability: available

- projection-task
  - Material: current Sigma-driven tree/UX projection requirements
  - Material Reference: [Projection Task](../explorer/001/projection/002-video-truth-mode-and-conditional-actions.trace.md)
  - Purpose: Controls the human-facing transport browser behavior.
  - Availability: available

- outgoing-task
  - Material: current Outgoing creation/source selection/carrier continuity requirements
  - Material Reference: [Outgoing Task](../explorer/001/outgoing/002-fast-carrier-create-and-dimension-continuity.trace.md)
  - Purpose: Controls Outgoing/package behavior.
  - Availability: available

- incoming-task
  - Material: current Incoming Merge/Replace and Git policy requirements
  - Material Reference: [Incoming Task](../explorer/001/incoming/002-batch-workspace-merge-and-post-merge-git-policy.trace.md)
  - Purpose: Controls safe landing semantics.
  - Availability: available

## Reference Context

- generic-authoring-boundary
  - Material: Master Anchor approved continuing a generic Artifact Authoring UX in VS Code with Handoff as first dogfood consumer, while requiring reusable semantic logic to remain in public Core and forbidding direct Docs schema interpretation in the extension.
  - Purpose: Prevent the fresh VS Code lane from turning the current authoring WIP into a permanent Handoff-specific engine.
  - Availability: available

- sigma-handoff-authoring-ux
  - Material: Handoff authoring must be ergonomic and discoverable without relying on F1. The same form/wizard should be used from Outgoing and File Explorer context menus. Templates/pre-defined intents should provide ergonomic defaults without bypassing schema requirements. `Attach to Outgoing` is a host checkbox/action, not Handoff semantic content. Existing Handoffs can be attached/detached from Explorer and Outgoing without duplicates.
  - Purpose: Human acceptance target for the authoring slice.
  - Availability: available

- carrier-dimension-semantics
  - Material: Carrier child dimensions are the ordinal position of the selected continuation Handoff route within the parent carrier's route sequence, not filename numbering or output sibling reservation. Dimension spans are dense. Incoming-derived Outgoing inherits the carrier name/prefix and parent dimensions before appending the selected route ordinal.
  - Purpose: Preserve Sigma's clarified carrier model and the existing fail-closed manufacture boundary.
  - Availability: available

## Retained Responsibilities

- delegate-fresh-vscode-lane
  - Retained By: Anchor
  - Retained By Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)
  - Responsibility: Audit/adopt this emergency full-source WIP and delegate continuation to a fresh VS Code Anchor/session with the current extension source and required shared context intact.
  - Boundary: Do not treat this Handoff as a completion signal for generic authoring, Packaging, or Merge/Replace.

- shared-core-capability-gaps
  - Retained By: Anchor
  - Retained By Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)
  - Responsibility: Resolve or delegate shared Core/Docs gaps rather than allowing extension-vscode to recreate shared semantics locally. Known gaps include carrier route-ordinal/inherited-prefix manufacture alignment, checkout-only Workspace carriage, bootstrap omission, exact current-Core dev binding, and any missing host-neutral authoring/cache projection needed by the generic form.
  - Boundary: Business/Docs/Core remain read-only in the VS Code lane unless Master/Refactor Anchor explicitly expands authority.

- sigma-dogfood
  - Retained By: Anchor
  - Retained By Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)
  - Responsibility: After the authoring/package slice is stable enough for human testing, return a full-source VS Code Handoff to Sigma. Sigma intends to test Merge/Replace last.
  - Boundary: No release/publication before explicit acceptance gates.

## Exclusions And Dependencies

- shared-source-mutation
  - Kind: excluded-scope
  - Description: Business, Docs and Core are carried as current shared context/dependencies and must not be mutated by the delegated VS Code lane without explicit expansion.
  - Responsible Party Or Role: Master/Refactor Anchor.

- incomplete-authoring
  - Kind: unresolved-dependency
  - Description: Generic Artifact Authoring is mid-implementation. Review the new authoring panel/model/bridge code, finish it only against public Core capabilities, add/repair focused tests, and rerun the exact Ctrl+B build path plus tests before returning to Sigma.
  - Responsible Party Or Role: delegated VS Code Anchor.

- carrier-manufacture-contract
  - Kind: unresolved-dependency
  - Description: Shared manufacture may still disagree with Sigma's route-ordinal child dimension and inherited carrier prefix/name model. VS Code must continue to fail closed rather than rename or post-edit qualified carrier bytes.
  - Responsible Party Or Role: Master/Refactor Anchor / Core frontier.

- cache-contract
  - Kind: unresolved-dependency
  - Description: Before implementing `cache.trace.md` / `cache.zip` generation in VS Code, confirm the canonical Docs/Core contract and shared manufacture/unpack support. Return a proposal if the required public capability is missing.
  - Responsible Party Or Role: Master/Refactor Anchor / Core/Docs frontier.

- release
  - Kind: excluded-scope
  - Description: No VSIX/npm/GitHub publication or remote repository mutation is authorized by this emergency continuation Handoff.
  - Responsible Party Or Role: Master/Refactor Anchor / Sigma at explicit release gates.

## Completion Expectation

- Signal Kind: return
- Signal Meaning: Master/Refactor Anchor should reconcile this exact full-source WIP, then delegate the active extension-vscode continuation to a fresh VS Code Anchor/session. The delegated lane should finish the generic Artifact Authoring + Handoff attach/package slice within public Core boundaries, qualify it with Sigma's exact Ctrl+B build path and focused tests, return a full-source Handoff for human dogfood, and leave Merge/Replace human testing as the final acceptance slice.
- Return To: Anchor
- Return To Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)

## Interpretation Limits

- Does Not Mean: Generic Artifact Authoring is complete, Handoff/cache packaging is complete, Merge/Replace has been Sigma-accepted, arbitrary/untrusted Receive is safe, or release/publication is authorized.
- Must Not Be Used To Claim: extension-vscode may interpret raw Docs schemas, invent cache/carrier semantics, mutate shared Business/Docs/Core, or silently repair shared Tooling output.
- Authority Limits: Exact current extension-vscode WIP plus bounded host UX integration against public shared contracts. Shared semantic/runtime changes remain Master/Refactor-owned.
- Transport Limits: Return as one canonical full-source Anchor-to-Anchor Handoff carrier suitable for delegation to a fresh VS Code lane.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [009-1-1-1-1-1-1-1-1-1-1-1-vs-code-shared-context-compare-and-carrier-identity-guard-return.trace.md](009-1-1-1-1-1-1-1-1-1-1-1-vs-code-shared-context-compare-and-carrier-identity-guard-return.trace.md)
  - Value: 70Lj2Pm8SrcgcuFRtAPB6s1VmLU-UiOvU7y-4uGVNDs

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: 3c9LH3or0QGVO1fQgYodhKM4kCi6pDvgqUQk8o6dLss