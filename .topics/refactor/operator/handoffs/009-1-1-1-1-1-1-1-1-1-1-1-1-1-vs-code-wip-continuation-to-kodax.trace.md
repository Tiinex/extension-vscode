# Continuity Context

- Envelope Schema: tiinex.root.v1
- Parent
  - Parent Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-10 20:01:49
  - Trace: [009-1-1-1-1-1-1-1-1-1-1-1-1-vs-code-emergency-full-source-continuation-to-master-anchor.trace.md](009-1-1-1-1-1-1-1-1-1-1-1-1-vs-code-emergency-full-source-continuation-to-master-anchor.trace.md)
  - Origin:
    - [relative](009-1-1-1-1-1-1-1-1-1-1-1-1-vs-code-emergency-full-source-continuation-to-master-anchor.trace.md)
- Current
  - Current Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-10 20:15:33
  - Authors: Anchor
  - Why: Preserve the exhausted VS Code Anchor's exact WIP while using a bounded implementation role for continuation rather than another Anchor.
  - Summary: Delegate the interrupted extension-vscode generic authoring, Handoff attach/package and bounded merge continuation to Kodax without shared-source mutation.
  - Status: ready/local

---

## Handoff Parties

- Purpose: Continue the interrupted extension-vscode operator lane from the exact accepted WIP returned by the exhausted VS Code Anchor, using Kodax as the bounded implementation role rather than creating another Anchor. Preserve public Core/Docs boundaries, finish the current generic Artifact Authoring + Handoff attach/package slice, qualify it, and return one full-source Handoff for Refactor review and Sigma dogfood.
- From: Anchor
- From Kind: role
- From Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)
- To: Kodax
- To Kind: role
- To Reference: [Kodax Role](business::.topics/roles/001-6-kodax-role.trace.md)

## Transfers

- extension-vscode-successor-wip
  - Transfer Kind: work
  - Description: Continue from the exact current extension-vscode WIP now accepted by Refactor Anchor. Review the interrupted generic Artifact Authoring implementation before mutation, then finish the bounded operator-host slice without re-discovering architecture already preserved in the Parent emergency Handoff.
  - Controlling Artifact: [VS Code Handoff discovery and manufacture minimum](../001-vs-code-handoff-discovery-and-manufacture-minimum.trace.md)
  - Boundary: extension-vscode is the only writable Workspace. Business, Docs and Core are read-only shared authority/dependency context.

- generic-artifact-authoring-and-handoff-package
  - Transfer Kind: work
  - Description: Finish the generic Artifact Authoring UX with Handoff as the first dogfood artifact, preserving the agreed layering Docs semantic authority -> public Core creation/authoring contract -> host-neutral projection -> VS Code host rendering. Complete Handoff attach/detach and Outgoing package integration only through public Core operations. Package creation and Handoff creation remain separate operations.
  - Controlling Artifact: [Outgoing Task](../explorer/001/outgoing/002-fast-carrier-create-and-dimension-continuity.trace.md)
  - Boundary: Do not import or interpret raw Docs schemas in extension-vscode; do not create artifact-specific semantic authority in the host; return a precise Core/Docs capability gap if a required shared projection or manufacture contract is absent.

- preserve-merge-dogfood-boundary
  - Transfer Kind: work
  - Description: Preserve the implemented selection-first Merge/Replace safety model and focused regression coverage. Repair only regressions directly caused by continuation work. Real human Merge/Replace acceptance remains Sigma's final dogfood slice after Refactor review.
  - Controlling Artifact: [Incoming Task](../explorer/001/incoming/002-batch-workspace-merge-and-post-merge-git-policy.trace.md)
  - Boundary: Do not use this lane to broaden landing semantics or claim Sigma acceptance.

- qualification-and-return
  - Transfer Kind: work
  - Description: Run the exact hot-reload build path used by Sigma (`npm run dev:build`) when dependencies are available, run focused/full extension tests, and preserve explicit limitations when the execution environment cannot reproduce the Windows host. Return one canonical full-source Handoff carrying current extension-vscode plus the minimum read-only context needed for Refactor reconciliation.
  - Controlling Artifact: [VS Code Handoff discovery and manufacture minimum](../001-vs-code-handoff-discovery-and-manufacture-minimum.trace.md)
  - Boundary: Technical PASS is not Sigma human acceptance and does not authorize release/publication.

## Required Context

- extension-vscode-workspace
  - Material: exact accepted current extension-vscode WIP, including the emergency Parent Handoff and unfinished generic Artifact Authoring source.
  - Material Reference: [Extension VS Code Workspace](extension-vscode::.topics/.workspaces/tiinex-extension-vscode.workspace.md)
  - Purpose: sole writable implementation source.
  - Availability: available

- business-workspace
  - Material: current Business source including Anchor/Kodax Roles and Refactor coordination/recovery lineage.
  - Material Reference: [Business Workspace](business::.topics/.workspaces/tiinex-business.workspace.md)
  - Purpose: delegation and authority context only.
  - Availability: available

- docs-workspace
  - Material: current canonical schemas/semantics, including Handoff/package and Secure Transport semantics.
  - Material Reference: [Docs Workspace](docs::.topics/.workspaces/tiinex-docs.workspace.md)
  - Purpose: semantic authority; read-only in this lane.
  - Availability: available

- core-workspace
  - Material: current shared Core Tooling including source-frontier comparison, Secure Transport mechanics and public authoring/manufacture operations.
  - Material Reference: [Core Workspace](core::.topics/.workspaces/tiinex-core.workspace.md)
  - Purpose: public shared capability boundary; read-only in this lane.
  - Availability: available

- parent-emergency-handoff
  - Material: exact interrupted VS Code Anchor WIP return with preserved Sigma UX decisions, packaging/cache blockers and current qualification state.
  - Material Reference: [VS Code emergency continuation Parent](009-1-1-1-1-1-1-1-1-1-1-1-1-vs-code-emergency-full-source-continuation-to-master-anchor.trace.md)
  - Purpose: do not repeat discovery; continue from the recorded WIP intent and exclusions.
  - Availability: available

## Reference Context

- sigma-current-ux-direction
  - Material: Sigma has approved continuing a reusable generic Artifact Authoring surface rather than a permanent Handoff-specific form. Handoff is the first substantial consumer; host-only actions such as Attach to Outgoing stay separate from artifact semantics.
  - Purpose: human UX direction for continuation without granting semantic authority.
  - Availability: available

## Retained Responsibilities

- shared-core-and-docs-gaps
  - Retained By: Anchor
  - Retained By Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)
  - Responsibility: own or delegate shared Core/Docs changes, including carrier route-ordinal/inherited-prefix manufacture alignment, exact current-Core dependency identity, checkout-only/bootstrap-omission questions, cache contracts and any missing host-neutral authoring projection.
  - Boundary: Kodax must return a blocker/proposal rather than mutate shared Workspaces or duplicate shared semantics locally.

- sigma-human-dogfood
  - Retained By: Anchor
  - Retained By Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)
  - Responsibility: authorize and interpret Sigma's real Windows/VS Code Merge, packaging and authoring acceptance after the returned implementation is reconciled.
  - Boundary: Kodax technical evidence cannot substitute for Sigma observation.

- release-publication
  - Retained By: Anchor
  - Retained By Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)
  - Responsibility: retain VSIX/Marketplace/npm/GitHub release decisions and dependency-version reconciliation.
  - Boundary: no remote mutation or publication in this lane.

## Exclusions And Dependencies

- shared-workspace-mutation
  - Kind: excluded-scope
  - Description: Business, Docs and Core are read-only. Do not patch them from this lane.
  - Responsible Party Or Role: Anchor.

- carrier-manufacture-contract
  - Kind: unresolved-dependency
  - Description: Current shared manufacture may still disagree with Sigma's route-ordinal child dimension and inherited carrier name/prefix expectation. Fail closed on mismatch and return the exact shared capability gap; do not rename or post-edit qualified carrier bytes.
  - Responsible Party Or Role: Anchor / Loom if shared Tooling work is required.

- cache-contract
  - Kind: unresolved-dependency
  - Description: Do not invent cache.trace.md/cache.zip semantics in extension-vscode. Use only qualified shared Docs/Core support, otherwise return a precise blocker/proposal.
  - Responsible Party Or Role: Anchor / Axiom or Loom as appropriate.

- secure-transport-host-ux
  - Kind: excluded-scope
  - Description: Secure Transport V1 is available in current shared Core, but this successor tranche is for the interrupted authoring/package/landing WIP. Do not broaden into password-sealed Workspace UX unless Refactor explicitly follows up after this tranche is stable.
  - Responsible Party Or Role: Anchor.

- arbitrary-untrusted-carriers
  - Kind: excluded-scope
  - Description: Trusted/bundled preflight before package-supplied bootstrap execution and Windows ZIP alias/device/ADS hardening remain outside this tranche. Do not claim arbitrary internet ZIP safety.
  - Responsible Party Or Role: Anchor / shared Tooling owners.

- release
  - Kind: excluded-scope
  - Description: No VSIX publication, Marketplace publication, npm publication, GitHub push or deployment is authorized.
  - Responsible Party Or Role: Anchor / Sigma at explicit release gates.

## Completion Expectation

- Signal Kind: return
- Signal Meaning: Return one canonical full-source Kodax-to-Anchor Handoff after the interrupted generic Artifact Authoring + Handoff attach/package tranche is either technically qualified or stopped at a precise shared capability blocker. Include exact tests/builds actually run, remaining human dogfood, and the smallest faithful continuation state.
- Return To: Anchor
- Return To Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)

## Interpretation Limits

- Does Not Mean: extension-vscode is release-qualified, Merge/Replace is Sigma-accepted, packaging is complete, generic Artifact Authoring covers every Tiinex schema, shared carrier/cache gaps are solved, Secure Transport UI is implemented, or arbitrary/untrusted Receive is safe.
- Must Not Be Used To Claim: Kodax owns Tiinex semantics, may mutate shared Business/Docs/Core, may bypass public Core with private imports, or may publish/commit/push remotely.
- Authority Limits: bounded extension-vscode implementation and technical qualification only; Refactor Anchor retains cross-repo architecture, shared capability placement, reconciliation, human acceptance and release authority.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [009-1-1-1-1-1-1-1-1-1-1-1-1-vs-code-emergency-full-source-continuation-to-master-anchor.trace.md](009-1-1-1-1-1-1-1-1-1-1-1-1-vs-code-emergency-full-source-continuation-to-master-anchor.trace.md)
  - Value: 3c9LH3or0QGVO1fQgYodhKM4kCi6pDvgqUQk8o6dLss

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: -LsRRCh7CO_RrH-Pg2FPA_MNeXm_9XhGQCHsJ7_Q9A8