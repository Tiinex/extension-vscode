# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-20 11:56:48
  - Trace: [001-4-vs-code-qualified-participant-affordance-and-progress-feedback.trace.md](001-4-vs-code-qualified-participant-affordance-and-progress-feedback.trace.md)
  - Origin:
    - [relative](001-4-vs-code-qualified-participant-affordance-and-progress-feedback.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-20 16:25:38
  - Authors: Anchor
  - Why: Sigma's live operator replay showed that participant selection disappeared, two-Handoff Pack still blocks at a host-owned route/carrier seam, and progress remains too coarse during long operations.
  - Summary: Correct the three bounded Sigma live-gate defects without widening the current VS Code Major.
  - Status: ready/local

---

# Sigma Live Gate Correction — Qualified Participants, Multi-Handoff Pack And Progress

## Objective

Close the three bounded host defects returned by Sigma's real VS Code replay without widening the Major: restore qualified participant selection, consume shared Core carrier-allocation truth for multi-Handoff Pack rather than host-owned lineage inference, and make remaining long-running Pack phases visibly staged.

## Done Criteria

- Restore the additional-participant affordance when and only when the exact Core participant projection for the current route exposes qualified semantic participant Role material.
- Do not fall back to Role/cache/endpoint inventory. Unresolved or absent participant authority remains unavailable/unresolved rather than being offered as a valid choice.
- Preserve host-local speaker labels as non-authoritative presentation state only.
- Remove or replace host-owned carrier-dimension/parent-route inference in `expectedOutgoingCarrierDimension()` and the current pre-Pack blocker once shared Core exposes the exact allocation/continuation projection; if Core proves the existing manufacture receipt already owns the required truth, consume that instead of duplicating logic.
- A valid Outgoing with two attached Handoff pointers against a qualified Incoming parent must reach shared manufacture without being rejected solely by VS Code path-matching heuristics.
- Invalid/ambiguous parent-route cases remain fail-closed with exact shared finding/projection text; do not weaken route qualification to make the live repro pass.
- Keep the current visible progress improvement and add finer stage updates for materially slow phases: workspace/source qualification, Core runtime preparation where observable, route/allocation preflight, preview, manufacture, finished-package requalification/Transport enqueue.
- Ensure progress state cleans up after success, failure and cancellation/abort paths that exist today.
- Add focused regressions reproducing Sigma's participant disappearance and two-Handoff Pack blocker plus stage-report lifecycle tests.
- Run the strongest extension-vscode bridge/package-builder/build qualification available against the accepted Core dependency and return exact limitations if registry/network access blocks full typecheck.
- Produce technical Evidence and one Kodax → Anchor return Handoff.

## Required Context

- Parent Task: `.topics/refactor/orchestration/001-4-vs-code-qualified-participant-affordance-and-progress-feedback.trace.md`.
- Sigma Feedback: `.topics/refactor/orchestration/feedback/001-sigma-live-vs-code-gate-feedback-participant-multi-handoff-pack.trace.md`.
- Accepted Core participant/session projection from Core Task `029-1`.
- Parallel Core/Loom Task for exact multi-Handoff carrier allocation/route continuation projection; consume the returned shared contract when available and return an exact blocker rather than inventing host semantics before then.

## Dependencies

- Current accepted Extension VS Code candidate and corrected carriage closure.
- Current accepted Core frontier.
- Sigma live silent-video replay and durable Feedback artifact.

## Scope

Extension VS Code participant presentation, Outgoing/Pack host orchestration, shared Core projection consumption, progress/stage presentation, focused tests and exact host qualification only.

## Exclusions

- No new Participant, Session, Meeting, Conversation, Handoff or carrier semantics.
- No broad Transport redesign, unrelated Git UX changes, Reduction cleanup, release publication or remote mutation.
- No host-side carrier allocation algorithm once shared Core truth is available.

## Acceptance Boundary

Kodax owns host correction and technical qualification. Loom/Core owns shared allocation mechanics. Anchor reconciles both returns. Sigma repeats the same live operator workflow and remains the final human gate.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-4-vs-code-qualified-participant-affordance-and-progress-feedback.trace.md](001-4-vs-code-qualified-participant-affordance-and-progress-feedback.trace.md)
  - Value: 93jlbfIzvFjF1-HFyrShDt-uRfyt_wNrZ7Vq1yHXZkE

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: 2S-G4OAhW3BkSfNG4UAiiXwKSf32fipGhQhI5XPvi5o