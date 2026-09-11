# Continuity Context

- Envelope Schema: tiinex.root.v1
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-11 21:23:55
  - Trace: [001-1-vs-code-major-003-schema-scalable-artifact-authoring-task.trace.md](001-1-vs-code-major-003-schema-scalable-artifact-authoring-task.trace.md)
  - Origin:
    - [relative](001-1-vs-code-major-003-schema-scalable-artifact-authoring-task.trace.md)
- Current
  - Current Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-11 21:23:56
  - Authors: Anchor
  - Why: The current generic form foundation is good but schema selection, path planning, endpoint assists and compatibility helpers still contain Handoff-specific host assumptions.
  - Summary: Delegate schema-scalable Core-driven artifact authoring convergence to Kodax while keeping Core/Docs read-only and Attach to Outgoing as the only intended Handoff-specific VS Code behavior.
  - Status: ready/local

---

# Anchor To Kodax — VS Code Major 003 Schema-Scalable Artifact Authoring

## Handoff Parties

- Purpose: replace the remaining Handoff-specialized VS Code authoring architecture with a schema-scalable Core-driven artifact creation surface while preserving `Attach to Outgoing` as the only intended Handoff-specific host behavior.
- From: Anchor
- From Kind: role
- From Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)
- To: Kodax
- To Kind: role
- To Reference: [Kodax Role](business::.topics/roles/001-6-kodax-role.trace.md)

## Transfers

- generic-artifact-authoring-host
  - Transfer Kind: work-and-responsibility
  - Description: refactor the active Extension VS Code authoring entry/model/panel/write flow so qualified Core schema creation capabilities drive schema selection, form structure, continuation, rendering and validation without schema-specific host implementations.
  - Controlling Artifact: [VS Code Major 003 Task](../001-1-vs-code-major-003-schema-scalable-artifact-authoring-task.trace.md)
  - Boundary: semantic rules stay in Core/Docs; do not copy Viewer/App implementation details as new VS Code truth.

- handoff-special-case-reduction
  - Transfer Kind: work-and-responsibility
  - Description: reduce active Handoff-specific authoring code to thin schema preselection/compatibility where useful. Preserve only the VS Code host option `Attach to Outgoing`, which controls carrier-route inclusion and must not mutate artifact semantics or bytes.
  - Controlling Artifact: [VS Code Major 003 Task](../001-1-vs-code-major-003-schema-scalable-artifact-authoring-task.trace.md)
  - Boundary: endpoint/Parent/path semantics may not remain hardcoded merely because Handoff was the first artifact type exposed by the host.

- scalability-proof
  - Transfer Kind: work
  - Description: demonstrate the same authoring machinery with at least one non-Handoff create-capable schema in a focused disposable test, with no new schema-specific VS Code form/path code.
  - Controlling Artifact: [VS Code Major 003 Task](../001-1-vs-code-major-003-schema-scalable-artifact-authoring-task.trace.md)
  - Boundary: do not add a second special implementation and call it generic.

- shared-capability-escalation
  - Transfer Kind: responsibility
  - Description: when exact schema-generic path/reference capability is absent from current Core, return the smallest exact shared blocker to Anchor rather than implementing private host semantics.
  - Controlling Artifact: [VS Code Major 003 Task](../001-1-vs-code-major-003-schema-scalable-artifact-authoring-task.trace.md)
  - Boundary: Core and Docs are read-only in this Handoff.

## Required Context

- extension-vscode-workspace
  - Material: complete current Extension VS Code Workspace.
  - Material Reference: [Extension VS Code Workspace](extension-vscode::.topics/.workspaces/tiinex-extension-vscode.workspace.md)
  - Purpose: writable authoring host source and exact current operator state.
  - Availability: available

- core-workspace
  - Material: complete current Core Workspace.
  - Material Reference: [Core Workspace](core::.topics/.workspaces/tiinex-core.workspace.md)
  - Purpose: read-only shared creation/runtime capability source including `inspect-creation-contract`, `schema-guide`, `plan-artifact`, `create-local-draft`, validation, and existing Handoff compatibility operations.
  - Availability: available

- docs-workspace
  - Material: complete current Docs Workspace.
  - Material Reference: [Docs Workspace](docs::.topics/.workspaces/tiinex-docs.workspace.md)
  - Purpose: read-only canonical schema semantics.
  - Availability: available

- app-workspace
  - Material: complete current App Workspace.
  - Material Reference: [App Workspace](app::.topics/.workspaces/tiinex-app.workspace.md)
  - Purpose: read-only reference for the schema-factory/product-side creation philosophy; not implementation authority for VS Code.
  - Availability: available

- business-workspace
  - Material: current Business Workspace containing Anchor/Kodax Role endpoints.
  - Material Reference: [Business Workspace](business::.topics/.workspaces/tiinex-business.workspace.md)
  - Purpose: exact endpoint Role authority and orchestration context.
  - Availability: available

## Reference Context

- repository-local-frontier
  - Material: current Extension VS Code repository-local orchestration frontier.
  - Material Reference: [VS Code Repository Local Orchestration Frontier](001-vs-code-repository-local-orchestration-frontier.trace.md)
  - Purpose: preserve repository-local specialist work placement prospectively.
  - Availability: available

- sigma-authoring-expectation
  - Material: Sigma's current acceptance principle: Handoff must not be special in authoring; the only intended VS Code-specific Handoff extra is `Attach to Outgoing`.
  - Purpose: human product/architecture acceptance boundary for this Major.
  - Availability: available

## Retained Responsibilities

- shared-core-capability-routing
  - Retained By: Anchor
  - Responsibility: route any proven missing generic Core creation/path/reference capability to Loom/Core under a separate Handoff.
  - Boundary: Kodax must not mutate Core privately.

- semantic-authority
  - Retained By: Axiom / Docs
  - Responsibility: canonical schema meaning and new semantic contracts remain outside this host refactor.

- human-acceptance
  - Retained By: Sigma
  - Responsibility: test the resulting VS Code authoring ergonomics when Kodax reports a bounded live-test checkpoint.

## Exclusions And Dependencies

- core-mutation
  - Kind: excluded-scope
  - Description: no Core source changes under this Handoff; return an exact capability blocker if needed.
- docs-mutation
  - Kind: excluded-scope
  - Description: no schema semantic edits under this Handoff.
- release
  - Kind: excluded-scope
  - Description: no Marketplace/npm publication or remote release.
- unrelated-operator-redesign
  - Kind: excluded-scope
  - Description: unpack, Incoming, Merge/Replace and package manufacture are preserved, not redesigned.

## Completion Expectation

- Signal Kind: return
- Signal Meaning: Kodax returns one repo-owned VS Code Major 003 result containing either the completed schema-scalable authoring convergence with a non-Handoff proof and `Attach to Outgoing` as the only Handoff-specific host behavior, or the smallest exact shared Core capability blocker preventing that architecture.
- Return To: Anchor
- Return To Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)

## Interpretation Limits

- Does Not Mean: Handoff semantics move into VS Code, a successful Handoff form proves genericity, or a convenience shortcut is allowed to become a second semantic implementation.
- Must Not Be Used To Claim: Core/Docs mutation authority, schema-specific host ownership, release readiness, or human acceptance before Sigma tests the resulting flow.
- Authority Limits: Kodax owns only the Extension VS Code host/refactor tranche; Anchor owns shared routing; Core/Docs retain semantic/mechanical authority; Sigma retains UX acceptance.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-1-vs-code-major-003-schema-scalable-artifact-authoring-task.trace.md](001-1-vs-code-major-003-schema-scalable-artifact-authoring-task.trace.md)
  - Value: w3g1uYOkYJ647I9oyrn0pu_0THS6mhvttRGl20e9edE

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: PRlSlv3y9uHKB2UZX3JtQdL3VlxmFnEq3arTNVmCQo0