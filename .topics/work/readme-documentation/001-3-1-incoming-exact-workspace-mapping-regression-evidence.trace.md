# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.evidence.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/core/evidence/tiinex.evidence.v1.schema.md)
  - Created At: 2026-10-08 00:25:49
  - Trace: [001-3-incoming-local-comparison-and-discovery-source-resilience-eviden.trace.md](001-3-incoming-local-comparison-and-discovery-source-resilience-eviden.trace.md)
  - Origin:
    - [relative](001-3-incoming-local-comparison-and-discovery-source-resilience-eviden.trace.md)
- Current
  - Current Schema: [tiinex.evidence.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/core/evidence/tiinex.evidence.v1.schema.md)
  - Created At: 2026-10-08 00:55:30
  - Authors: Anchor; Sigma
  - Why: Preserve the root-cause and bounded regression before a fresh Anchor cold start and the Windows human rerun.
  - Summary: Core per-root outputs demonstrate why relative rootPath cannot match VS Code hostRoot and how exact 17-of-17 matching was restored.
  - Status: ready/local

---

# Incoming Exact Workspace Mapping Regression Evidence

## Supported Claim Or Question

- Supported Claim Or Question: Did the earlier Incoming repair accidentally treat Core's Workspace-relative rootPath as an absolute VS Code host root, thereby removing qualified local Workspace matches and prompting redundant Locate local repository dialogs?
- Evidence Role: bounded implementation and executable regression evidence for Incoming source matching

## Provenance

- Known Source: Sigma screenshots describing the 031-1-2-2-2 failure; the exact source and embedded bootstrap from the received 031-1-2-2-2 carrier; portable Core project-workspace-package-sources receipts from all 17 carried Workspace snapshots; VS Code packageBuilder.ts, core/workspaceChoice.ts, new core/incomingWorkspaceMapping.ts and test/run.mjs
- Preservation Basis: Preserve the exact Core projection fields, host root supplied to per-root discovery and reproducible negative-test conditions, without replacing semantic Workspace identity by a display label or directory basename
- Provenance Limits: The 17 roots were reconstructed from the carried Workspace archives in this sandbox; a Windows VS Code locked-dependency TypeScript build and a human 17-Workspace Replace/Accept exercise remain open

## Evidence Material

- Material: Core's app Workspace returns workspaceId app, rootPath ., workspaceTargetPath .topics/.workspaces/tiinex-app.workspace.md. Core returned 22 source candidates across 17 roots due to some repositories carrying additional nested Workspace artifacts; the existing canonical Workspace selector picks one direct artifact per root. Production Incoming root matching previously compared relative rootPath with an absolute host root and filtered valid items.
- Material Kind: qualified per-root Core projection, implementation correction, real-carrier reproduction and negative regression evidence
- Description: Incoming now assigns physical root from the explicit scoped VS Code Workspace root, optionally checks Core's qualified absolute hostRoot when present, selects the canonical top-level Workspace artifact and validates Workspace IDs are unambiguous. It never compares relative rootPath or repository display names to the host root. A functional test with the actual 17 carried Workspaces selected 17 of 17 expected identities. A separate negative probe covered renamed host directories, explicit foreign hostRoot, absent sources, competing top-level artifacts and duplicate Workspace IDs. All passed.

## Preservation And Fidelity

- Preservation State: local uncommitted VS Code candidate included in the child Handoff carrier
- Fidelity Notes: Original carrier and Core semantics retained. No Core implementation changed. Direct Core receipts from the received carrier were read, rather than invented Workspace identities. Existing independent Incoming activation, source-change detection and fail-closed local comparison checks remain in the carried VS Code candidate.
- Known Losses: No Windows host UI playback or source deletion during a real VS Code session is demonstrated by the sandbox checks

## Interpretation Limits

- Does Not Prove: real Windows package Replace has completed, that all byte-exact comparisons pass, or that every target repository can safely be overwritten
- Not Yet Used As: Sigma human acceptance, release readiness, Marketplace publication or Task closure
- Must Not Be Treated As: permission to skip Core qualified Workspace identity, canonical direct-Workspace selection, missing-source requalification or actual bytes comparison

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-3-incoming-local-comparison-and-discovery-source-resilience-eviden.trace.md](001-3-incoming-local-comparison-and-discovery-source-resilience-eviden.trace.md)
  - Value: _3jDgiOq0u6p0oGOkfa0FXgAXo0p4H-5NV3RU8FNSnM

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: PN-27E8sBabbAh92_rH23im3wZjWOKZrJeCvyL2qrGc