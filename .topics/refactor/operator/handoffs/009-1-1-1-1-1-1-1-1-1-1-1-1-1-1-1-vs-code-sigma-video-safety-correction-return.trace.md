# Continuity Context

- Envelope Schema: tiinex.root.v1
- Parent
  - Parent Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-10 21:08:39
  - Trace: [009-1-1-1-1-1-1-1-1-1-1-1-1-1-1-vs-code-sigma-dogfood-return.trace.md](009-1-1-1-1-1-1-1-1-1-1-1-1-1-1-vs-code-sigma-dogfood-return.trace.md)
  - Origin:
    - [relative](009-1-1-1-1-1-1-1-1-1-1-1-1-1-1-vs-code-sigma-dogfood-return.trace.md)
- Current
  - Current Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-10 22:22:37
  - Authors: Kodax
  - Why: Sigma's live VS Code video exposed a real Code.exe Tooling invocation failure plus mutation affordance and single-repository scaling requirements that are now corrected fail-closed.
  - Summary: Return post-video single-root, Review/Execute and operator discoverability corrections for Sigma live retest.
  - Status: ready/local

---

## Handoff Parties

- Purpose: Return the post-video VS Code correction candidate to Sigma for another live Windows dogfood pass, with mutation review made explicit and repository-session transitions kept safe for both ordinary single-folder use and multi-repository Receive.
- From: Kodax
- From Kind: role
- From Reference: [Kodax Role](business::.topics/roles/001-6-kodax-role.trace.md)
- To: Sigma
- To Kind: role
- To Reference: [Sigma Role](business::.topics/roles/001-4-sigma-role.trace.md)

## Transfers

- incoming-review-and-runtime-correction
  - Transfer Kind: work
  - Description: Incoming Merge/Replace now uses an actual Node executable rather than VS Code Code.exe for shared Tooling, exposes Review Merge Plan / Review Replace Plan before any mutation, and retains a separate final Execute Plan confirmation with exact repository roots and source delta counts.
  - Controlling Artifact: [VS Code Handoff discovery and manufacture minimum](../001-vs-code-handoff-discovery-and-manufacture-minimum.trace.md)
  - Boundary: Shared Tiinex comparison remains byte-source authority; host presentation never treats a failed comparison as permission to mutate.

- scalable-repository-session-safety
  - Transfer Kind: work
  - Description: One-repository Incoming operations stay in ordinary single-folder/single-repository mode. A dedicated temporary multi-root workspace is opened only when more than one distinct repository is selected and required target repositories are not already open. Multiple full Workspace snapshots targeting the same repository, nested target repository roots, or changed local Git state after review block before mutation.
  - Controlling Artifact: [Workspace discovery and multi-root mapping](../unpacking/001-workspace-discovery-and-multi-root-mapping.trace.md)
  - Boundary: VS Code session transitions are host orchestration only. The extension never mutates a hidden repository, silently converts a single-repository operation into multi-root, or invents precedence between overlapping mutation roots.

- video-ux-corrections
  - Transfer Kind: work
  - Description: Incoming mutation actions use explicit Review labels/icons; Explorer exposes a dedicated Tiinex submenu for New Handoff and Attach Handoff; Outgoing can attach qualified Handoffs found while browsing its Workspace material; Pack obtains a persistent global Outgoing destination before manufacture and reports missing-route/package blockers visibly.
  - Controlling Artifact: [Sigma video correction continuation](../explorer/001/review/002-sigma-video-correction-next-anchor-continuation.trace.md)
  - Boundary: These are discoverability and orchestration corrections only; Handoff, Pointer and package semantics remain shared-Tooling-owned.

- qualification-receipt
  - Transfer Kind: work
  - Description: Repository-local validation passes TypeScript, build, 55/55 focused regression cases and deterministic VSIX construction. A direct current-Core compare between the materialized extension source and the received Handoff package returns ready/changed with both source frontiers qualified, proving the former Code.exe shared-compare failure is no longer present in the host command path.
  - Controlling Artifact: [VS Code Handoff discovery and manufacture minimum](../001-vs-code-handoff-discovery-and-manufacture-minimum.trace.md)
  - Boundary: The VSIX is qualification evidence only. Windows UI behavior and the real Node resolution path still require Sigma live-host confirmation; no publication is authorized.

## Required Context

- extension-vscode-workspace
  - Material: current full extension-vscode source containing the post-video Incoming/Outgoing/session-safety corrections.
  - Material Reference: [Extension VS Code Workspace](extension-vscode::.topics/.workspaces/tiinex-extension-vscode.workspace.md)
  - Purpose: executable source for the next Sigma dogfood pass and the only Workspace mutated by Kodax.
  - Availability: available

- prior-sigma-dogfood-return
  - Material: prior Kodax-to-Sigma dogfood Handoff that Sigma exercised in the real Windows VS Code host.
  - Material Reference: [Prior Sigma dogfood Handoff](009-1-1-1-1-1-1-1-1-1-1-1-1-1-1-vs-code-sigma-dogfood-return.trace.md)
  - Purpose: preserve the exact artifact continuation that produced the observed video feedback.
  - Availability: available

- business-workspace
  - Material: current Business Role context for Sigma, Kodax and retained Anchor authority.
  - Material Reference: [Business Workspace](business::.topics/.workspaces/tiinex-business.workspace.md)
  - Purpose: role/authority grounding only; unchanged source.
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

- sigma-video-acceptance
  - Material: Sigma's silent live-host video demonstrated that Discovery to Incoming was understandable, while Merge/Replace needed stronger pre-mutation affordance, shared compare failed by invoking Code.exe, Pack feedback/destination was unclear, authoring/Attach needed more discoverability, and ordinary single-repository VS Code use must not be forced into multi-root.
  - Purpose: acceptance evidence driving this correction tranche.
  - Availability: available

- mutation-safety-model
  - Material: Review first exposes What/Where/How/Impact/Safety; mutation occurs only through a separate Execute Plan. Local Git state is rechecked after confirmation, ignored paths and symlinks remain protected, and multi-repository execution is explicitly not represented as a cross-repository atomic transaction.
  - Purpose: keep destructive-capable UI comprehensible and fail-closed as repository count grows.
  - Availability: available

## Retained Responsibilities

- sigma-live-retest
  - Retained By: Sigma
  - Retained By Reference: [Sigma Role](business::.topics/roles/001-4-sigma-role.trace.md)
  - Responsibility: Re-run the ordinary Windows VS Code path, first with one repository open, then optionally with more than one selected repository, and report the first concrete interaction/runtime mismatch.
  - Boundary: Do not treat local success as release approval.

- sigma-feedback-continuation
  - Retained By: Kodax
  - Retained By Reference: [Kodax Role](business::.topics/roles/001-6-kodax-role.trace.md)
  - Responsibility: Keep the next correction bounded to observed extension-vscode host behavior and preserve fail-closed shared-semantic boundaries.
  - Boundary: Shared Core/Docs changes remain outside this lane.

- shared-authoring-gap
  - Retained By: Anchor
  - Retained By Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)
  - Responsibility: Own or delegate the existing shared Core generic Handoff endpoint-reference authoring gap.
  - Boundary: Kodax continues to block unsupported role-grounded generic authoring rather than synthesize semantic bytes in VS Code.

- release
  - Retained By: Anchor
  - Retained By Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)
  - Responsibility: Retain publication, remote mutation and release disposition.
  - Boundary: This return is a dogfood carrier, not a release.

## Exclusions And Dependencies

- cross-repository-atomicity
  - Kind: excluded-scope
  - Description: Multi-repository Review/Execute is independently guarded per repository but is not an atomic distributed transaction. The extension does not claim rollback across already-completed repositories if a later independent repository operation fails.
  - Responsible Party Or Role: Kodax / Sigma operator awareness.

- non-git-source-mutation
  - Kind: excluded-scope
  - Description: Incoming Merge/Replace now requires a qualified Git repository mutation target; no generic non-Git destructive replacement contract is introduced by this tranche.
  - Responsible Party Or Role: Anchor / future shared or host design.

- untrusted-carrier-hardening
  - Kind: excluded-scope
  - Description: Package-supplied bootstrap trust hardening and broader Windows archive alias/device/ADS protections remain outside this tranche.
  - Responsible Party Or Role: Anchor / shared Tooling owners.

- release-publication
  - Kind: excluded-scope
  - Description: No VSIX Marketplace publication, npm publish, GitHub push or release version advance is authorized.
  - Responsible Party Or Role: Anchor / Sigma at explicit release gates.

## Completion Expectation

- Signal Kind: return
- Signal Meaning: Sigma live-tests the corrected single-repository and explicit Review/Execute Incoming path plus the clearer Outgoing/Attach/Pack affordances, then returns the first concrete mismatch or confirms the tranche is usable enough to advance.
- Return To: Kodax
- Return To Reference: [Kodax Role](business::.topics/roles/001-6-kodax-role.trace.md)

## Interpretation Limits

- Does Not Mean: Merge/Replace is risk-free, multi-repository execution is atomic, arbitrary hidden repositories may be mutated, generic Handoff authoring is complete in Core 0.1.1, arbitrary internet Handoff packages are trusted, or the extension is release-qualified.
- Must Not Be Used To Claim: selecting several carried Workspaces authorizes overlapping filesystem mutation, a single repository should be converted into a multi-root workspace, VS Code owns Handoff/package semantics, or a green local VSIX authorizes publication.
- Authority Limits: bounded extension-vscode host implementation and qualification only; shared Core/Docs retain semantic authority and Anchor retains cross-repository/release disposition.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [009-1-1-1-1-1-1-1-1-1-1-1-1-1-1-vs-code-sigma-dogfood-return.trace.md](009-1-1-1-1-1-1-1-1-1-1-1-1-1-1-vs-code-sigma-dogfood-return.trace.md)
  - Value: E1BIE_ZuZBZ1Zt-atChPZso-aFpW87Gku34VBHktXvY

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: BhIVmYF_VFWkhSw1S8z_6WONhMFG8a0Umxo7mSWBaiE