# Continuity Context

- Envelope Schema: tiinex.root.v1
- Parent
  - Parent Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-09 21:23:36
  - Trace: [004-anchor-to-anchor-vs-code-dev-build-typecheck-correction-return.trace.md](004-anchor-to-anchor-vs-code-dev-build-typecheck-correction-return.trace.md)
  - Origin:
    - [relative](004-anchor-to-anchor-vs-code-dev-build-typecheck-correction-return.trace.md)
- Current
  - Current Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-09 21:45:47
  - Authors: Anchor
  - Why: Sigma proved the first versioned junction was not loaded after build/restart; direct ai-provenance source inspection showed it also registers the junction in VS Code extensions.json.
  - Summary: Return registry-aware unversioned Windows main-host junction linking matching the proven ai-provenance development loop.
  - Status: ready/local

---

# VS Code ai-provenance main-host link parity return

## Handoff Parties

- Purpose: Return the corrected VS Code-local main-host development link after Sigma proved the first versioned-junction implementation did not load Tiinex in the normal VS Code window.
- From: Anchor
- From Kind: role
- From Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)
- To: Anchor
- To Kind: role
- To Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)

## Transfers

- ai-provenance-link-parity
  - Transfer Kind: work
  - Description: The local development loop now follows the proven ai-provenance Windows main-host shape: an unversioned `~/.vscode/extensions/tiinex.tiinex-vscode` junction points to the checkout and setup explicitly writes the linked location into VS Code's `extensions.json` registry metadata instead of relying on implicit discovery of a versioned folder.
  - Controlling Artifact: [Main-host link parity with ai-provenance](../development/004/002-ai-provenance-main-host-link-parity.trace.md)
  - Boundary: Developer convenience only; no extension runtime semantics or package version changed.

- native-restart-ux
  - Transfer Kind: work
  - Description: The custom `.tiinex-dev` reload-marker protocol and `src/devReload.ts` are removed. The default build task only rebuilds the registered junction-backed extension, leaving restart-required UX to VS Code as in ai-provenance.
  - Controlling Artifact: [Main-host link parity with ai-provenance](../development/004/002-ai-provenance-main-host-link-parity.trace.md)
  - Boundary: No Extension Development Host or per-edit VSIX is required.

- reversible-local-state
  - Transfer Kind: work
  - Description: Reversible link metadata is confined to ignored `.vscode/link/`; setup cleans the superseded `.tiinex-dev/` marker and an owned old versioned Tiinex junction from the first implementation.
  - Controlling Artifact: [Main-host link parity with ai-provenance](../development/004/002-ai-provenance-main-host-link-parity.trace.md)
  - Boundary: `.vscode/link/` is local-only and excluded from canonical source carriage by ignore rules.

## Required Context

- parent-return
  - Material: prior VS Code dev-build correction return
  - Material Reference: [Parent return](004-anchor-to-anchor-vs-code-dev-build-typecheck-correction-return.trace.md)
  - Purpose: Preserve the immediately preceding checkpoint and Receive hardening.
  - Availability: available

- link-parity-task
  - Material: ai-provenance main-host link parity Task
  - Material Reference: [Link parity Task](../development/004/002-ai-provenance-main-host-link-parity.trace.md)
  - Purpose: Exact repository-local lineage for this correction.
  - Availability: available

- extension-vscode-workspace
  - Material: complete current extension-vscode source and repo-local lineage
  - Material Reference: [Extension VS Code Workspace](extension-vscode::.topics/.workspaces/tiinex-extension-vscode.workspace.md)
  - Purpose: Only mutated Workspace.
  - Availability: available

- core-workspace
  - Material: current public Core portable Tooling context
  - Material Reference: [Core Workspace](core::.topics/.workspaces/tiinex-core.workspace.md)
  - Purpose: Shared semantics remain external authority and unchanged.
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

- ai-provenance-reference
  - Material: `Tiinex/ai-provenance` `.vscode/tasks.json` and `scripts/ensure-windows-main-host-dev-extension-link.ps1` on master.
  - Purpose: Proven implementation evidence showing an unversioned main-host junction plus explicit `extensions.json` registration and a plain build task.
  - Availability: available

- sigma-runtime-report
  - Material: Sigma reported that the first Tiinex versioned junction plus build/restart still left no Tiinex extension loaded in normal VS Code.
  - Purpose: Reproduction evidence that implicit folder discovery was insufficient in the real host.
  - Availability: available

## Retained Responsibilities

- anchor-review
  - Retained By: Anchor
  - Retained By Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)
  - Responsibility: Review this corrected development-link checkpoint alongside the Receive hardening before broader use.

- sigma-local-test
  - Retained By: Anchor
  - Retained By Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)
  - Responsibility: Sigma may rerun the one-time link task, default build task and main-host restart to verify the normal VS Code instance now loads Tiinex.

- publication
  - Retained By: Anchor
  - Retained By Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)
  - Responsibility: 0.1.8 publication remains outside this checkpoint.

## Exclusions And Dependencies

- sibling-workspace-mutation
  - Kind: excluded-scope
  - Description: Business, Core and Docs remain carried context only and are not mutated.
  - Responsible Party Or Role: Anchor

- receive-semantics
  - Kind: excluded-scope
  - Description: This correction does not alter Receive/unpacking semantics or the prior audit hardening.
  - Responsible Party Or Role: Anchor

- windows-host-runtime
  - Kind: unresolved-dependency
  - Description: The exact junction/registry mutation is Windows-main-host behavior and must be exercised in Sigma's VS Code installation; container qualification covers source, TypeScript, tests, packaging and static contract checks but not a live Windows VS Code host.
  - Responsible Party Or Role: Anchor

## Completion Expectation

- Signal Kind: return
- Signal Meaning: The failed first linked-development implementation has been replaced with ai-provenance-style registry-aware main-host linking and is ready for Anchor review / Sigma live-host verification.
- Return To: Anchor
- Return To Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)

## Interpretation Limits

- Does Not Mean: Receive is broad-release-ready, Handoff/package UX is final, or 0.1.8 is authorized.
- Must Not Be Used To Claim: the live Windows host path is proven until Sigma exercises the updated link task.
- Authority Limits: VS Code owns this local developer-experience correction only; shared Tiinex Tooling and organizational authority remain unchanged.
- Transport Limits: Full-source return may carry unchanged required sibling Workspace material from the qualified package parent, but only extension-vscode source is changed.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [004-anchor-to-anchor-vs-code-dev-build-typecheck-correction-return.trace.md](004-anchor-to-anchor-vs-code-dev-build-typecheck-correction-return.trace.md)
  - Value: 4dDm8MpVAZrfUOzrvqNs2bRDhIOcWdJWtUs2JgRmkSs

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: 44eFMgBIvnSFPcPBLpfhCJMWgNdsrdDL5Ebd1UVmqE4