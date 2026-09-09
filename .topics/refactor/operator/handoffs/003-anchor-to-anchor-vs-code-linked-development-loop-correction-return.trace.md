# Continuity Context

- Envelope Schema: tiinex.root.v1
- Parent
  - Parent Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-09 20:01:13
  - Trace: [002-anchor-to-anchor-vs-code-receive-unpacking-checkpoint-return.trace.md](002-anchor-to-anchor-vs-code-receive-unpacking-checkpoint-return.trace.md)
  - Origin:
    - [relative](002-anchor-to-anchor-vs-code-receive-unpacking-checkpoint-return.trace.md)
- Current
  - Current Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-09 20:24:43
  - Authors: Anchor
  - Why: Sigma rejected the F5 Extension Development Host path and requested the smoother ai-provenance-style link once, build, restart, test workflow.
  - Summary: Return the corrected linked same-window development loop while retaining Handoff/package UX for later discussion.
  - Status: ready/local

---

# VS Code linked in-place development loop correction return

## Handoff Parties

- Purpose: Return the corrected local VS Code development loop after Sigma rejected the Extension Development Host/F5 path; Receive/unpacking behavior from the prior checkpoint remains unchanged.
- From: Anchor
- From Kind: role
- From Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)
- To: Anchor
- To Kind: role
- To Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)

## Transfers

- linked-same-window-development-loop
  - Transfer Kind: work-and-responsibility
  - Description: Normal Tiinex VS Code UX iteration now uses a one-time repository-local development link into the active VS Code extensions directory. The setup task compiles first, preserves any displaced installed Tiinex copies outside the extensions directory, and creates a symlink/junction to the exact checkout. Thereafter the default build task recompiles in place and emits a development-only reload signal; the running linked extension offers **Restart Extensions** in the same VS Code window.
  - Controlling Artifact: [Linked in-place extension reload loop](../development/004/001-linked-in-place-extension-reload-loop.trace.md)
  - Boundary: One manual Extension Host/VS Code restart is still required immediately after initial linking. Ordinary iterations do not require F5, an Extension Development Host window or per-edit VSIX installation.

- reversible-development-link
  - Transfer Kind: work
  - Description: The linker is idempotent for the same checkout, supports stable VS Code and Insiders extension roots plus an explicit override, preserves prior installed copies before linking, and provides an unlink task that restores those copies. Development markers are ignored and excluded from candidate VSIX packaging.
  - Controlling Artifact: [Linked in-place extension reload loop](../development/004/001-linked-in-place-extension-reload-loop.trace.md)
  - Boundary: The linker mutates only the user's local VS Code extensions installation when explicitly run; it does not mutate sibling Tiinex Workspaces or release state.

- focused-qualification
  - Transfer Kind: responsibility
  - Description: Source-internal qualification passes TypeScript typecheck, clean build, 41/41 focused regression cases and candidate VSIX construction using the carried Core 0.1.1 published-file shape. The linked setup/build/unlink path was also exercised end-to-end against an isolated temporary extensions directory, including preservation/restoration of an existing installed copy and reload-signal generation.
  - Controlling Artifact: [VS Code Handoff discovery and manufacture minimum](../001-vs-code-handoff-discovery-and-manufacture-minimum.trace.md)
  - Boundary: Candidate VSIX bytes are qualification evidence only and are not the development delivery mechanism. No 0.1.8 publication is authorized.

## Required Context

- previous-receive-checkpoint
  - Material: VS Code Receive unpacking checkpoint return
  - Material Reference: [Previous checkpoint](002-anchor-to-anchor-vs-code-receive-unpacking-checkpoint-return.trace.md)
  - Purpose: Receive/unpacking work remains intact; only its rejected Extension Development Host development-loop statement is superseded by this return.
  - Availability: available

- current-operator-task
  - Material: VS Code Handoff discovery and manufacture minimum
  - Material Reference: [Operator minimum Task](../001-vs-code-handoff-discovery-and-manufacture-minimum.trace.md)
  - Purpose: The broader Handoff authoring/package UX remains intentionally open for later Sigma discussion.
  - Availability: available

- extension-vscode-workspace
  - Material: complete current extension-vscode source and repo-local lineage
  - Material Reference: [Extension VS Code Workspace](extension-vscode::.topics/.workspaces/tiinex-extension-vscode.workspace.md)
  - Purpose: Only mutated Workspace returned by this correction.
  - Availability: available

- core-workspace
  - Material: current public Core portable Tooling context
  - Material Reference: [Core Workspace](core::.topics/.workspaces/tiinex-core.workspace.md)
  - Purpose: Shared semantics remain external authority and were not modified.
  - Availability: available

- docs-workspace
  - Material: canonical schema and continuity semantics
  - Material Reference: [Docs Workspace](docs::.topics/.workspaces/tiinex-docs.workspace.md)
  - Purpose: Preserve schema/lineage authority without mutation.
  - Availability: available

- business-workspace
  - Material: Anchor Role and organizational authority context
  - Material Reference: [Business Workspace](business::.topics/.workspaces/tiinex-business.workspace.md)
  - Purpose: Endpoint role and org-root lineage context only; Business was not modified.
  - Availability: available

## Reference Context

- development-lineage
  - Material: local development-loop parent plus linked-loop corrective child
  - Purpose: `development/004` records the original no-VSIX objective; `development/004/001` explicitly supersedes only its rejected Extension Development Host/watch mechanism with linked same-window iteration while preserving lineage to the operator Task and org-root authority chain.
  - Availability: available

- operator-ux-feedback
  - Material: Sigma feedback on development ergonomics
  - Purpose: The accepted target pattern is `link once -> build task -> Restart Extensions -> test in the same window`; F5/Extension Development Host is not the desired primary loop.
  - Availability: available

## Retained Responsibilities

- handoff-authoring-and-package-ux
  - Retained By: Anchor
  - Retained By Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)
  - Responsibility: Continue the parent operator-minimum Task only after the Handoff creation/return-manufacture UX is discussed separately with Sigma.

- shared-contract-frontier
  - Retained By: Anchor
  - Retained By Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)
  - Responsibility: Any Core/Docs/Business or final CLI/Interop contract change remains outside this VS Code-only correction.

- publication
  - Retained By: Anchor
  - Retained By Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)
  - Responsibility: 0.1.8 publication and release gating remain unresolved and outside this lane.

## Exclusions And Dependencies

- handoff-manufacture-product-design
  - Kind: unresolved-dependency
  - Description: Low-text/one-click Handoff authoring and canonical return-package UX remain deliberately open for later discussion with Sigma.
  - Responsible Party Or Role: Anchor

- sibling-workspace-mutation
  - Kind: excluded-scope
  - Description: Business, Core and Docs are carried/read as required context only. No sibling source or lineage artifact was modified by this correction.
  - Responsible Party Or Role: Anchor

- release-0-1-8
  - Kind: excluded-scope
  - Description: Package version remains 0.1.7; no GitHub, Marketplace or release mutation is authorized or performed.
  - Responsible Party Or Role: Anchor

## Completion Expectation

- Signal Kind: return
- Signal Meaning: The rejected F5/Extension Development Host development loop has been replaced and qualified with the requested linked same-window build/restart pattern. The broader operator-minimum Task remains open for Handoff authoring/package UX work.
- Return To: Anchor
- Return To Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)

## Interpretation Limits

- Does Not Mean: the whole VS Code operator minimum is complete, Handoff authoring/package UX is product-final, 0.1.8 is approved, or sibling Workspaces may be mutated.
- Must Not Be Used To Claim: development linking grants semantic authority, candidate VSIX installation is required for normal iteration, or the old F5/Extension Development Host path remains the recommended loop.
- Authority Limits: VS Code owns this host-local development convenience only; shared Tiinex Tooling and organizational authority remain unchanged.
- Transport Limits: Return transport may carry unchanged required sibling Workspace material from the qualified package parent, but only extension-vscode source is changed.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [002-anchor-to-anchor-vs-code-receive-unpacking-checkpoint-return.trace.md](002-anchor-to-anchor-vs-code-receive-unpacking-checkpoint-return.trace.md)
  - Value: d4patFGLypeWx4z6Wc7qfiyD5eoLn-bBNU8cKDE8www

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: RrgRQRLpqnBnTOlMh7_LYesx7c2bS7blzzxR9og61CY