# Continuity Context

- Envelope Schema: tiinex.root.v1
- Parent
  - Parent Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-10 12:52:05
  - Trace: [009-1-1-1-vs-code-multi-incoming-and-safe-merge-replace-return.trace.md](009-1-1-1-vs-code-multi-incoming-and-safe-merge-replace-return.trace.md)
  - Origin:
    - [relative](009-1-1-1-vs-code-multi-incoming-and-safe-merge-replace-return.trace.md)
- Current
  - Current Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-10 13:34:45
  - Authors: Anchor
  - Why: Sigma's silent-video acceptance found one more Outgoing creation/selection UX mismatch after the prior qualified multi-Incoming return.
  - Summary: Return the latest source-first Outgoing New/source-selection UX correction.
  - Status: ready/local

---

## Handoff Parties

- Purpose: Return the latest extension-vscode source after Sigma's silent-video Outgoing New/source-selection correction, preserving the already-qualified multi-Incoming and safe Merge/Replace behavior while handing back a source-first hot-reload candidate.
- From: Anchor
- From Kind: role
- From Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)
- To: Anchor
- To Kind: role
- To Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)

## Transfers

- outgoing-new-ux-correction
  - Transfer Kind: work
  - Description: Outgoing New is now one stable entrypoint. With open Incoming carriers it first presents one single-select containing Blank plus the open Incoming packages. Blank asks for the lowercase Outgoing label and starts an independent lineage; selecting Incoming inherits that carrier identity/dimension context without an extra name prompt. Incoming choices use the same newest-first timestamp ordering as Discovery.
  - Controlling Artifact: [Outgoing carrier continuity Task](../explorer/001/outgoing/002-fast-carrier-create-and-dimension-continuity.trace.md)
  - Boundary: Shared Tiinex Tooling remains authoritative for canonical carrier manufacture and lineage allocation.

- outgoing-workspace-selection-correction
  - Transfer Kind: work
  - Description: Select Workspaces now changes source membership only. It retains Local-first then Incoming-newest-first priority, duplicate Workspace source correction and explicit re-confirmation, but no longer opens a second lineage/parent prompt. Native New and Select icons were tightened for easier visual pattern recognition.
  - Controlling Artifact: [Sigma video correction continuation Task](../explorer/001/review/002-sigma-video-correction-next-anchor-continuation.trace.md)
  - Boundary: Outgoing still performs no source merge; one effective source is carried per qualified Workspace identity.

- merge-replace-preserved
  - Transfer Kind: work
  - Description: The prior multi-Incoming and plan-first Merge/Replace engine is intentionally unchanged by this correction. Package- and Workspace-level entrypoints, Git/non-Git safety, pre-operation .gitignore protection, real Git conflict states, dirty/branch prompts and final Execute Plan boundary remain as previously qualified.
  - Controlling Artifact: [Incoming merge policy Task](../explorer/001/incoming/002-batch-workspace-merge-and-post-merge-git-policy.trace.md)
  - Boundary: Sigma has not yet completed the real-repository Merge/Replace acceptance pass for this exact source.

- source-qualification
  - Transfer Kind: work
  - Description: Source-only qualification after the correction passed TypeScript typecheck and 48/48 focused bridge tests. No VSIX manufacture is required for Sigma's normal iteration path; the intended handoff is full source so Sigma can build the linked checkout locally with Ctrl+Shift+B / VS Code restart-extension flow.
  - Controlling Artifact: [VS Code Handoff discovery and manufacture minimum](../001-vs-code-handoff-discovery-and-manufacture-minimum.trace.md)
  - Boundary: Mechanical source qualification is not Windows/Sigma acceptance or release authority.

## Required Context

- extension-vscode-workspace
  - Material: complete current extension-vscode source including the latest Outgoing New and selection correction
  - Material Reference: [Extension VS Code Workspace](extension-vscode::.topics/.workspaces/tiinex-extension-vscode.workspace.md)
  - Purpose: Full writable source for the next linked-main-host iteration.
  - Availability: available

- parent-return-handoff
  - Material: immediately preceding multi-Incoming and Merge/Replace return Handoff
  - Material Reference: [Prior return](009-1-1-1-vs-code-multi-incoming-and-safe-merge-replace-return.trace.md)
  - Purpose: Exact continuation parent and safety baseline.
  - Availability: available

- outgoing-task
  - Material: Outgoing carrier/source-selection context
  - Material Reference: [Outgoing Task](../explorer/001/outgoing/002-fast-carrier-create-and-dimension-continuity.trace.md)
  - Purpose: Controls New, source membership and carrier-continuity behavior.
  - Availability: available

- incoming-task
  - Material: multi-Incoming Merge/Replace and Git-policy context
  - Material Reference: [Incoming Task](../explorer/001/incoming/002-batch-workspace-merge-and-post-merge-git-policy.trace.md)
  - Purpose: Retains the safe apply model unchanged through this UX iteration.
  - Availability: available

- review-task
  - Material: Sigma video correction continuation context
  - Material Reference: [Review continuation Task](../explorer/001/review/002-sigma-video-correction-next-anchor-continuation.trace.md)
  - Purpose: Human UX evidence and correction lineage.
  - Availability: available

- core-workspace
  - Material: unchanged shared Core portable Tooling contract
  - Material Reference: [Core Workspace](core::.topics/.workspaces/tiinex-core.workspace.md)
  - Purpose: Shared manufacture authority.
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

- sigma-hot-reload-loop
  - Material: Sigma consumes full-source Handoff packages and builds the linked extension locally; prebuilt VSIX delivery is unnecessary for ordinary UX iterations.
  - Purpose: Keep the next operator iteration source-first and avoid redundant binary transport.
  - Availability: available

- qualification-receipt
  - Material: `npm run typecheck` and `npm test` passed; 48/48 focused cases passed.
  - Purpose: Mechanical source qualification for this exact continuation.
  - Availability: available

## Retained Responsibilities

- windows-sigma-acceptance
  - Retained By: Anchor
  - Retained By Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)
  - Responsibility: Continue Sigma's linked Windows main-host UX acceptance, with Merge/Replace real-repository testing still outstanding.

- shared-refactor-frontier
  - Retained By: Anchor
  - Retained By Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)
  - Responsibility: Reconcile any shared Tooling/carrier-manufacture contract issue at the Refactor frontier rather than reimplementing shared semantics in VS Code.

- release-authority
  - Retained By: Anchor
  - Retained By Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)
  - Responsibility: Own later release/publication disposition; this source handoff does not authorize publication.

## Exclusions And Dependencies

- sibling-source-mutation
  - Kind: excluded-scope
  - Description: Business, Core and Docs source remain unchanged.
  - Responsible Party Or Role: Anchor

- real-repository-acceptance
  - Kind: unresolved-dependency
  - Description: Sigma's real local Merge/Replace acceptance remains pending after the Outgoing UX correction.
  - Responsible Party Or Role: Anchor

- release
  - Kind: excluded-scope
  - Description: No Marketplace/npm/GitHub release or remote publication is authorized.
  - Responsible Party Or Role: Anchor

## Completion Expectation

- Signal Kind: return
- Signal Meaning: Ground this full-source continuation, use the linked checkout/hot-reload development loop, and continue Sigma acceptance from the corrected Outgoing New/source-selection state before further release disposition.
- Return To: Anchor
- Return To Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)

## Interpretation Limits

- Does Not Mean: Sigma has accepted Merge/Replace on real repositories, the extension is release-approved, or VSIX delivery is required for normal source iteration.
- Must Not Be Used To Claim: that Select Workspaces chooses carrier lineage, that Outgoing merges duplicate sources, or that VS Code owns shared carrier manufacture semantics.
- Authority Limits: Bounded extension-vscode implementation and source qualification only.
- Transport Limits: Return as one canonical full-source Anchor-to-Anchor Handoff carrier.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [009-1-1-1-vs-code-multi-incoming-and-safe-merge-replace-return.trace.md](009-1-1-1-vs-code-multi-incoming-and-safe-merge-replace-return.trace.md)
  - Value: N2FZzyS1NHmAqpiHaJJdMX0SPpWXArC4KuQYcMEWpB0

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: pcw8ruy4_6Blu33P1Dx4f-D7Ozg9pzjqBwt0hl4TK68