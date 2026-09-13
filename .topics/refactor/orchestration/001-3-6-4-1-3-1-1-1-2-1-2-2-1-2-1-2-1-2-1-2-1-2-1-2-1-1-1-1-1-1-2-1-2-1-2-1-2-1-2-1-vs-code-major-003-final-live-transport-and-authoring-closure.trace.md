# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-13 13:14:03
  - Trace: [001-3-6-4-1-3-1-1-1-2-1-2-2-1-2-1-2-1-2-1-2-1-2-1-2-1-1-1-1-1-1-2-1-2-1-2-1-2-1-2-sigma-to-anchor-vs-code-major-003-live-mvp-gate-blocked-by-host.trace.md](001-3-6-4-1-3-1-1-1-2-1-2-2-1-2-1-2-1-2-1-2-1-2-1-2-1-1-1-1-1-1-2-1-2-1-2-1-2-1-2-sigma-to-anchor-vs-code-major-003-live-mvp-gate-blocked-by-host.trace.md)
  - Origin:
    - [relative](001-3-6-4-1-3-1-1-1-2-1-2-2-1-2-1-2-1-2-1-2-1-2-1-2-1-1-1-1-1-1-2-1-2-1-2-1-2-1-2-sigma-to-anchor-vs-code-major-003-live-mvp-gate-blocked-by-host.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-13 16:14:04
  - Authors: Anchor
  - Why: The real Windows Copy Package → ChatGPT gate still shows a UUID filename, and authoring/attach remains unverified live.
  - Summary: Close the remaining UUID filename and live authoring/attach MVP gates without reopening accepted Git automation.
  - Status: ready/local

---

# VS Code Major 003 — Final Live Transport And Authoring Closure

## Objective
Close the remaining VS Code MVP gaps without reopening already accepted Git automation: exact carrier basename preservation when `Copy Package` is pasted into ChatGPT on Windows, plus live-qualified generic Artifact/Feedback/Handoff authoring and Handoff attachment into Outgoing packaging.

## Scope
- Diagnose the still-reproduced Windows host failure where `Copy Package` pastes into ChatGPT as a UUID-named `.zip` instead of the exact Tiinex carrier basename.
- Treat the real Windows → ChatGPT paste result as the acceptance gate; local clipboard round-trip assertions are supporting evidence only.
- Preserve package bytes and carrier lineage; do not rename the carrier payload to a UUID or invent a second transport identity.
- Verify the already-present `New Artifact`, `New Feedback`, and `New Handoff` surfaces through the real operator flow; change only demonstrably broken or unclear behavior.
- Verify `Attach Handoff to Outgoing` and then `Pack` actually carries the attached qualified Handoff route.
- Preserve accepted auto-stage, Ask / Commit / Commit+Push behavior and commit-message ergonomics.
- Remove or avoid new shadow documentation surfaces; Tiinex artifacts carry durable work/provenance unless a minimal repo README is genuinely required.

## Dependencies
- Current qualified VS Code candidate carried by the Sigma → Anchor return.
- Existing Core/Docs semantics remain read-only authority unless a separate owner handoff is required.
- Real Windows/ChatGPT observation is available only through Sigma; Kodax owns the hypothesis, implementation, and interpretation.

## Acceptance Evidence
- `npm run dev:build` passes on exact candidate bytes.
- `npm run validate` passes on exact candidate bytes, or an exact environment blocker is returned without claiming implementation readiness.
- Windows `Copy Package` → direct paste into ChatGPT displays the exact Tiinex carrier filename, not a UUID.
- New Artifact / Feedback / Handoff creates qualified artifacts through the intended generic authoring path.
- Attach Handoff → Outgoing → Pack yields a carrier containing the attached qualified Handoff route.
- Already accepted Git automation remains unchanged/green.
- Any required Sigma test is the smallest live host observation needed to distinguish remaining hypotheses; Sigma performs no source repair or debugging.

## Exclusions
- No Core/Docs semantic invention.
- No unrelated Git automation redesign.
- No artifact-history cleanup or lineage renaming in this tranche.
- No loose patch/source-application transport to Sigma.

## Done Criteria
- One qualified Kodax → Anchor return carrying exact candidate bytes, coarse build/validation evidence, and explicit live-gate instructions if the host-only gate remains.
- Direct return uses the explicitly reserved non-Major package sibling index 1.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-3-6-4-1-3-1-1-1-2-1-2-2-1-2-1-2-1-2-1-2-1-2-1-2-1-1-1-1-1-1-2-1-2-1-2-1-2-1-2-sigma-to-anchor-vs-code-major-003-live-mvp-gate-blocked-by-host.trace.md](001-3-6-4-1-3-1-1-1-2-1-2-2-1-2-1-2-1-2-1-2-1-2-1-2-1-1-1-1-1-1-2-1-2-1-2-1-2-1-2-sigma-to-anchor-vs-code-major-003-live-mvp-gate-blocked-by-host.trace.md)
  - Value: ufuM2P1lRj-zgey7RV7tO_2Eu9yvLhjk4w29ZEI8yMA

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: tp17pVz3FwmNuxyesqieWGlyDywKebsxfy5MIwDQPcw