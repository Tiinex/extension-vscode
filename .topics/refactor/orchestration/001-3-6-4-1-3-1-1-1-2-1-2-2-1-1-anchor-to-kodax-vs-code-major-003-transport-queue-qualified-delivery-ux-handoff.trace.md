# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-12 14:52:08
  - Trace: [001-3-6-4-1-3-1-1-1-2-1-2-2-1-vs-code-major-003-transport-queue-qualified-delivery-ux-task.trace.md](001-3-6-4-1-3-1-1-1-2-1-2-2-1-vs-code-major-003-transport-queue-qualified-delivery-ux-task.trace.md)
  - Origin:
    - [relative](001-3-6-4-1-3-1-1-1-2-1-2-2-1-vs-code-major-003-transport-queue-qualified-delivery-ux-task.trace.md)
- Current
  - Current Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-12 14:52:08
  - Authors: Anchor
  - Why: Manufactured carriers need a first-class human delivery queue after Pack, and forwarding existing carriers must remain byte-preserving and authority-safe.
  - Summary: Delegate the bounded Transport TreeView and qualified package/route delivery UX to Kodax using Core Major 009 transport projection.
  - Status: ready/local

---

# Anchor To Kodax — VS Code Major 003 Transport Queue And Qualified Delivery UX

## Handoff Parties

- Purpose: delegate the bounded Extension VS Code Transport tranche now that Core Major 009 provides qualified bootstrap/package/material/recipient transport projection primitives.
- From: Anchor
- From Kind: role
- From Reference: [Anchor Role — Successor Evolution Continuation](business::.topics/roles/001-1-1-1-anchor-successor-evolution-role.trace.md)
- To: Kodax
- To Kind: role
- To Reference: [Kodax Role](business::.topics/roles/001-6-kodax-role.trace.md)

## Transfers

- transport-tree-and-package-lifecycle
  - Transfer Kind: work-and-responsibility
  - Description: implement a first-class Transport TreeView that receives exact manufactured carriers after successful Pack and can hold multiple carriers simultaneously. Package roots expose Copy Package, Copy Transport Text and Close; Close is queue dismissal only.
  - Controlling Artifact: [Transport Queue Task](../001-3-6-4-1-3-1-1-1-2-1-2-2-1-vs-code-major-003-transport-queue-qualified-delivery-ux-task.trace.md)
  - Boundary: finished package bytes plus Core projection are authority; Outgoing draft state is not authority after manufacture.

- qualified-recipient-delivery-projection
  - Transfer Kind: work-and-responsibility
  - Description: for exact routed Handoff carriers, render one simple recipient row per qualified Core route projection and use Core-provided route-specific transport text. Route-less Workspace/bootstrap carriers retain package-level actions with no synthetic child.
  - Controlling Artifact: [Transport Queue Task](../001-3-6-4-1-3-1-1-1-2-1-2-2-1-vs-code-major-003-transport-queue-qualified-delivery-ux-task.trace.md)
  - Boundary: Role presence, package filename, repository identity or UI placement must never manufacture recipient rows.

- forwarding-and-prepared-state
  - Transfer Kind: work-and-responsibility
  - Description: allow Discovery/Incoming package or selected qualified Handoff route to be sent to Transport without repack/mutation. Track host-local prepared state by exact package SHA plus route id; green checks mean package/text prepared, never delivered/accepted.
  - Controlling Artifact: [Transport Queue Task](../001-3-6-4-1-3-1-1-1-2-1-2-2-1-vs-code-major-003-transport-queue-qualified-delivery-ux-task.trace.md)
  - Boundary: host-local queue/check state is disposable presentation state and must not become Tiinex semantic carrier material.

- file-copy-host-capability
  - Transfer Kind: work
  - Description: provide real file clipboard copy where safely supported by the current host; otherwise expose an honest fallback such as Copy Path/Reveal Package. Do not report Copy Package success when only filename text was copied.
  - Controlling Artifact: [Transport Queue Task](../001-3-6-4-1-3-1-1-1-2-1-2-2-1-vs-code-major-003-transport-queue-qualified-delivery-ux-task.trace.md)
  - Boundary: OS-specific clipboard mechanics are host capability only, not transport semantics.

## Required Context

- extension-vscode-workspace
  - Material: complete current Extension VS Code Workspace including the accepted Major 003 Git-ergonomics return.
  - Material Reference: [Extension VS Code Workspace](extension-vscode::.topics/.workspaces/tiinex-extension-vscode.workspace.md)
  - Purpose: writable host source and current operator UI frontier.
  - Availability: available

- core-workspace
  - Material: complete accepted Core Major 009 Workspace.
  - Material Reference: [Core Workspace](core::.topics/.workspaces/tiinex-core.workspace.md)
  - Purpose: exact shared bootstrap/package/material/transport projection authority and portable APIs.
  - Availability: available

- docs-workspace
  - Material: current Docs Workspace including accepted Handoff Package V1 semantics from Docs Major 007.
  - Material Reference: [Docs Workspace](docs::.topics/.workspaces/tiinex-docs.workspace.md)
  - Purpose: canonical package/material/recipient semantic boundary.
  - Availability: available

- business-workspace
  - Material: current Business Workspace containing Anchor and Kodax Roles.
  - Material Reference: [Business Workspace](business::.topics/.workspaces/tiinex-business.workspace.md)
  - Purpose: exact endpoint Role authority only.
  - Availability: available

## Reference Context

- core-major-009-return
  - Material: accepted Core Major 009 return.
  - Material Reference: [Core Major 009 Return](core::.topics/refactor/orchestration/handoffs/003-1-1-1-1-1-loom-to-anchor-core-major-009-minimal-carrier-material-represent.trace.md)
  - Purpose: exact implemented transport projection mechanics and limitations.
  - Availability: available

- git-ergonomics-return
  - Material: current Kodax Git-ergonomics return immediately preceding this tranche.
  - Material Reference: [Git Ergonomics Return](001-3-6-4-1-3-1-1-1-2-1-2-2-kodax-to-anchor-vs-code-major-003-git-automation-and-scm-ergonom.trace.md)
  - Purpose: exact current Major 003 source frontier and preserved Git acceptance boundary.
  - Availability: available

## Retained Responsibilities

- package-semantics
  - Retained By: Axiom / Docs
  - Responsibility: package role, material carriage and recipient semantics remain canonical Docs authority.

- transport-mechanics
  - Retained By: Loom / Core
  - Responsibility: Start/route transport text and recipient projection remain Core-owned mechanics.

- human-acceptance
  - Retained By: Sigma
  - Responsibility: later judge Transport ergonomics, file-copy usefulness and prepared-state clarity in the real Windows/main-host extension.

- orchestration
  - Retained By: Anchor
  - Responsibility: audit this return and sequence later Merge and Artifact/Handoff authoring tranches without silently widening this one.

## Exclusions And Dependencies

- merge-redesign
  - Kind: excluded-scope
  - Description: do not fix Incoming Merge/conflict materialization under this Handoff.

- authoring-discoverability-redesign
  - Kind: excluded-scope
  - Description: do not redesign New Artifact / Feedback / Handoff discoverability under this Handoff.

- delivery-verification
  - Kind: excluded-scope
  - Description: no host can claim external delivery/receipt merely because package/text were copied.

- release-and-remote-action
  - Kind: excluded-scope
  - Description: no Marketplace release, publication, repository push or other remote mutation is authorized by this Handoff.

## Completion Expectation

- Signal Kind: return
- Signal Meaning: Kodax returns one repo-owned Extension VS Code checkpoint with Transport TreeView, Core-driven package/route transport projection, forwarding, honest prepared-state/file-copy behavior, focused regression evidence and preserved existing operator surfaces.
- Return To: Anchor
- Return To Reference: [Anchor Role — Successor Evolution Continuation](business::.topics/roles/001-1-1-1-anchor-successor-evolution-role.trace.md)

## Interpretation Limits

- Does Not Mean: a prepared route was delivered, recipient accepted anything, Merge is repaired, generic Artifact authoring is fully discoverable, or Major 003 has Sigma acceptance.
- Must Not Be Used To Claim: VS Code owns transport semantics, Role carriage implies recipient authority, host-local prepared state is semantic package truth, or package copying grants remote mutation authority.
- Authority Limits: Kodax owns only the bounded Transport host tranche; Core/Docs retain shared package authority; Sigma retains human acceptance; Anchor retains sequencing.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-3-6-4-1-3-1-1-1-2-1-2-2-1-vs-code-major-003-transport-queue-qualified-delivery-ux-task.trace.md](001-3-6-4-1-3-1-1-1-2-1-2-2-1-vs-code-major-003-transport-queue-qualified-delivery-ux-task.trace.md)
  - Value: sufHOx2saiDuYiZ_GBJrHKiUMux0SUBnPVOZaDZkpMc

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: d8BHLIkN1FrFgwXTs9ReKheVQpeSgbA7Oo3fhrwwNJU