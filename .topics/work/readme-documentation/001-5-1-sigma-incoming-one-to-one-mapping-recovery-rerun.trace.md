# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-10-08 00:26:21
  - Trace: [001-5-anchor-incoming-regression-recovery-continuation.trace.md](001-5-anchor-incoming-regression-recovery-continuation.trace.md)
  - Origin:
    - [relative](001-5-anchor-incoming-regression-recovery-continuation.trace.md)
- Current
  - Current Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-10-08 00:55:49
  - Authors: Anchor; Sigma
  - Why: Require a real-host 17-Workspace Incoming/Replace and source-deletion rerun before reopening Evidence/README.
  - Summary: Test exact 17-Workspace host-root mapping and safe Incoming source lifecycle without weakening comparison gates.
  - Status: ready/local

---

# Sigma Incoming One-To-One Mapping Recovery Rerun

## Handoff Parties

- Purpose: Verify that the Incoming receiver now maps each of the 17 carried qualified Workspaces to its existing exact local VS Code Workspace without unnecessary repository-location dialogs, while retaining fail-closed and missing-source behavior.
- From: Anchor
- From Kind: role
- From Reference: [Anchor](business::.topics/roles/001-1-1-1-1-1-anchor-canonical-holder-cutover-role.trace.md)
- To: Sigma
- To Kind: role
- To Reference: [Sigma](business::.topics/roles/001-4-1-1-sigma-role-canonical-assignment-modes-qualification-continuation.trace.md)

## Transfers

- validate-17-workspace-replace
  - Transfer Kind: work
  - Description: Apply the 17-Workspace candidate locally, run npm run dev:build:local, refresh VS Code and activate the new Handoff carrier as Incoming. Verify all 17 existing Workspaces match the corresponding carried Workspace IDs and no redundant Locate local repository dialogs occur. Use Replace only after reviewing mapped targets; if one source genuinely does not qualify, report that exact Workspace instead of blindly selecting a different folder.
  - Controlling Artifact: [VS Code README And Documentation Consolidation](001-vs-code-readme-and-documentation-consolidation.trace.md)
  - Boundary: local verification only; no commit/push or release

- verify-incoming-lifecycle
  - Transfer Kind: work
  - Description: With an Incoming card active, remove the ZIP from the Discovery directory, expand the card and refresh Incoming. Confirm no crash or stale ZIP reuse, a clear and closeable blocked state, and successful requalification after restoring and refreshing the ZIP. Verify Accept/Reject remains unavailable if an exact Workspace comparison is not qualified, and unaffected Incoming cards stay usable.
  - Controlling Artifact: [VS Code README And Documentation Consolidation](001-vs-code-readme-and-documentation-consolidation.trace.md)
  - Boundary: do not intentionally corrupt local repositories or force an unqualified Replace

## Required Context

- implementation-evidence
  - Material: Exact Incoming Workspace mapping evidence
  - Material Reference: [Incoming exact mapping regression evidence](001-3-1-incoming-exact-workspace-mapping-regression-evidence.trace.md)
  - Purpose: Explain why rootPath is not a host path, what changed, and what the test does not establish
  - Availability: available

## Reference Context

- previous-regression
  - Material: Earlier Incoming lifecycle Evidence and bounded continuation
  - Material Reference: [Previous Incoming fix](001-3-incoming-local-comparison-and-discovery-source-resilience-eviden.trace.md)
  - Purpose: Keep missing/changed source handling and preview behavior within the acceptance boundary
  - Availability: available

## Retained Responsibilities

- none

## Exclusions And Dependencies

- other-work
  - Kind: unresolved-dependency
  - Description: Postpone new Evidence-authoring/README-media testing until this Incoming mapping receives PASS or bounded rework. The existing Task and prior Handoffs remain the controlling sources for those later stages.
  - Responsible Party Or Role: Anchor

## Completion Expectation

- Signal Kind: disposition
- Signal Meaning: Return PASS only when the locked local build is green, all 17 carried Workspaces resolve to the matching local Workspace without name/path inference, Replace reaches a reviewable selection, missing/changed ZIP handling does not crash or reuse stale bytes, and no unqualified Accept/Reject is enabled. Otherwise provide exact failing Workspace, action, message and screenshot with bounded rework.
- Return To: Anchor
- Return To Reference: [Anchor](business::.topics/roles/001-1-1-1-1-1-anchor-canonical-holder-cutover-role.trace.md)

## Interpretation Limits

- Does Not Mean: a PASS on Incoming closes the unrelated Evidence/README/cold-start/Marketplace work or that merely opening a mapped Workspace accepts or mutates it.
- Must Not Be Used To Claim: automatic commit/push, publication, unqualified repository mutation, semantic supersession of older carriers, or Task closure.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-5-anchor-incoming-regression-recovery-continuation.trace.md](001-5-anchor-incoming-regression-recovery-continuation.trace.md)
  - Value: yCA_osvVEax992t4FxEm1y-ElSgxfS8lO7CX82l5j0M

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: pgxq8tBw-Tj9Ex95-or-9QVn1qbJy1X4a1RRSZ8fmYo