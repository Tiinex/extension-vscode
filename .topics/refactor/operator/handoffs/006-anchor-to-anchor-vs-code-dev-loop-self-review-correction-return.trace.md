# Continuity Context

- Envelope Schema: tiinex.root.v1
- Parent
  - Parent Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-09 21:45:47
  - Trace: [005-anchor-to-anchor-vs-code-ai-provenance-main-host-link-parity-return.trace.md](005-anchor-to-anchor-vs-code-ai-provenance-main-host-link-parity-return.trace.md)
  - Origin:
    - [relative](005-anchor-to-anchor-vs-code-ai-provenance-main-host-link-parity-return.trace.md)
- Current
  - Current Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-09 21:57:02
  - Authors: Anchor
  - Why: Sigma exposed a missing dev:setup script from an already-materialized Link task, demonstrating that prior review did not validate task-to-script wiring end to end.
  - Summary: Return stale dev:setup compatibility and task/script self-review qualification.
  - Status: ready/local

---

# VS Code dev-loop self-review correction return

## Handoff Parties

- Purpose: Return the narrow VS Code-local correction after Sigma exposed a stale Link task calling `npm run dev:setup` while the current package script no longer declared that name, and strengthen the qualification gate so task/script drift is caught before another return.
- From: Anchor
- From Kind: role
- From Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)
- To: Anchor
- To Kind: role
- To Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)

## Transfers

- stale-task-compatibility
  - Transfer Kind: work
  - Description: `package.json` now keeps `dev:setup` as a compatibility alias to `dev:link`. The canonical current Link task still calls the registry-aware PowerShell linker directly, while an already-materialized older npm-backed Link task can recover instead of failing with `Missing script: dev:setup`.
  - Controlling Artifact: [Dev-loop self-review Task](../development/004/002/001-dev-loop-self-review-and-stale-task-compatibility.trace.md)
  - Boundary: Compatibility only; no extension runtime or Receive semantics change.

- task-script-review-gate
  - Transfer Kind: work
  - Description: Focused regression coverage now walks every repository-owned VS Code npm task and requires its named package script to exist, and walks PowerShell `-File` task targets and requires each referenced file to exist. This is the missing self-review check that would have exposed the reported drift.
  - Controlling Artifact: [Dev-loop self-review Task](../development/004/002/001-dev-loop-self-review-and-stale-task-compatibility.trace.md)
  - Boundary: Repository-local qualification only.

- qualification-receipt
  - Transfer Kind: work
  - Description: Full `npm run validate` passed after the correction: typecheck, clean build, 43/43 focused tests and deterministic VSIX candidate construction. The delta versus return 005 is limited to the new local Task plus `package.json`, `test/run.mjs` and README compatibility documentation before this Handoff is authored.
  - Controlling Artifact: [Dev-loop self-review Task](../development/004/002/001-dev-loop-self-review-and-stale-task-compatibility.trace.md)
  - Boundary: The live Windows junction/registry mutation still cannot be executed inside the Linux qualification container and remains a Sigma live-host verification dependency.

## Required Context

- parent-return
  - Material: ai-provenance main-host link parity return
  - Material Reference: [Parent return](005-anchor-to-anchor-vs-code-ai-provenance-main-host-link-parity-return.trace.md)
  - Purpose: Preserve the corrected registry-aware linking baseline.
  - Availability: available

- self-review-task
  - Material: dev-loop self-review and stale-task compatibility Task
  - Material Reference: [Task](../development/004/002/001-dev-loop-self-review-and-stale-task-compatibility.trace.md)
  - Purpose: Exact repository-local lineage for this correction.
  - Availability: available

- extension-vscode-workspace
  - Material: complete current extension-vscode source
  - Material Reference: [Extension VS Code Workspace](extension-vscode::.topics/.workspaces/tiinex-extension-vscode.workspace.md)
  - Purpose: Only mutated Workspace.
  - Availability: available

- core-workspace
  - Material: current public Core portable Tooling context
  - Material Reference: [Core Workspace](core::.topics/.workspaces/tiinex-core.workspace.md)
  - Purpose: Shared semantics remain unchanged external authority.
  - Availability: available

- docs-workspace
  - Material: canonical schema and continuity semantics
  - Material Reference: [Docs Workspace](docs::.topics/.workspaces/tiinex-docs.workspace.md)
  - Purpose: Schema/lineage authority only; unchanged.
  - Availability: available

- business-workspace
  - Material: Anchor Role and organizational authority context
  - Material Reference: [Business Workspace](business::.topics/.workspaces/tiinex-business.workspace.md)
  - Purpose: Endpoint role and org-root lineage context only; unchanged.
  - Availability: available

## Reference Context

- sigma-build-report
  - Material: Sigma's live Windows task output `npm error Missing script: "dev:setup"` from **Tiinex: Link this checkout**.
  - Purpose: Concrete reproduction that exposed the missing compatibility/review gate.
  - Availability: available

- prior-task-shape
  - Material: The 001-2 through 001-4 returned Workspaces used an npm-backed Link task naming `dev:setup`; return 005 moved the canonical task to the direct PowerShell linker.
  - Purpose: Explain why a stale/materialized task can legitimately encounter the removed script even after the canonical task changed.
  - Availability: available

## Retained Responsibilities

- sigma-live-windows-check
  - Retained By: Anchor
  - Retained By Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)
  - Responsibility: Exercise Link -> Build -> Restart Extensions in the actual Windows VS Code main host. Container qualification cannot prove VS Code's live registry/junction recognition.

- receive-and-package-ux
  - Retained By: Anchor
  - Retained By Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)
  - Responsibility: Continue operator Receive testing and later Handoff/package UX discussion separately; this correction does not advance those semantics.

## Exclusions And Dependencies

- sibling-workspace-mutation
  - Kind: excluded-scope
  - Description: Business, Core and Docs remain carried context only and are not mutated.
  - Responsible Party Or Role: Anchor

- windows-live-host
  - Kind: unresolved-dependency
  - Description: Actual `%USERPROFILE%\.vscode\extensions` junction creation, `extensions.json` registration and native restart prompt require a Windows VS Code host and cannot be truthfully claimed from this Linux container.
  - Responsible Party Or Role: Anchor

- publication
  - Kind: excluded-scope
  - Description: No 0.1.8 publication or version authority is granted.
  - Responsible Party Or Role: Anchor

## Completion Expectation

- Signal Kind: return
- Signal Meaning: The reported missing-script failure is compatibility-corrected and the self-review gate now covers task-to-script/file wiring; hand back for Anchor review and Sigma live-host verification.
- Return To: Anchor
- Return To Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)

## Interpretation Limits

- Does Not Mean: the live Windows link path has been proven in-container, Receive is broad-release-ready, Handoff/package UX is final, or 0.1.8 is authorized.
- Must Not Be Used To Claim: native **Restart Extensions** UX is verified until Sigma observes it in the linked Windows host.
- Authority Limits: VS Code-local developer-loop correction only.
- Transport Limits: Full-source return may carry unchanged required sibling Workspace material from the qualified package parent, but only extension-vscode source is changed.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [005-anchor-to-anchor-vs-code-ai-provenance-main-host-link-parity-return.trace.md](005-anchor-to-anchor-vs-code-ai-provenance-main-host-link-parity-return.trace.md)
  - Value: 44eFMgBIvnSFPcPBLpfhCJMWgNdsrdDL5Ebd1UVmqE4

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: WbvLVqXc3etcEqvIu7a4Ax5Aws58M9bVsypHy6Topj4