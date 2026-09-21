# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-11 16:58:55
  - Trace: [001-vs-code-repository-local-orchestration-frontier.trace.md](001-vs-code-repository-local-orchestration-frontier.trace.md)
  - Origin:
    - [relative](001-vs-code-repository-local-orchestration-frontier.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-20 11:56:48
  - Authors: Anchor
  - Why: Sigma's live workflow exposed a host/Core authority mismatch and ambiguous waits after Core Task 029-1 established the shared projection boundary.
  - Summary: Align VS Code participant choices with qualified Core authority and keep long Outgoing operations visibly alive.
  - Status: ready/local

---

# VS Code Qualified Participant Affordance And Progress Feedback

## Objective

Consume the qualified shared-Core human-session/participant projection from Core Task `029-1` and repair the VS Code host seam exposed by Sigma's live workflow: the host must not offer an additional carrier Role as semantically selectable when Core cannot qualify that participant for the exact route, and long-running qualify/preview/manufacture work must remain visibly alive to the operator.

Keep semantics in Core. VS Code owns presentation, host-local active-speaker state, progress feedback, and bounded orchestration only.

## Done Criteria

- Additional carrier Role choices are derived from the exact Core projection for the current Handoff/route rather than from Role/cache/endpoint inventory alone.
- A qualified semantic participant choice remains distinct from Role identity, holder-assignment authorization and current holder binding; unresolved participant authority is rendered unavailable/unresolved rather than offered as a valid participant.
- Host-local active-speaker labels may be displayed or switched for operator usability, but never become Party identity, Role holding, holder binding, semantic participation, delegation or acceptance authority.
- Existing Handoff authoring and participant-pointer manufacture remain Core-owned; VS Code does not recreate participant semantics or pointer qualification.
- The Outgoing flow presents visible progress/stage feedback across materially slow phases such as local Workspace qualification, Core runtime preparation, route/preflight qualification, preview and manufacture so a user is not left with an apparently dead UI.
- Avoidable repeated qualification/runtime preparation may be reduced only where exact behavior remains equivalent; otherwise retain the work and expose its stage rather than weakening qualification.
- Add focused regressions for qualified participant availability, unresolved participant suppression, speaker-label non-authority, Pack failure behavior, and progress-state lifecycle including cleanup after success/failure/cancel where applicable.
- Run the strongest extension-vscode regression/build qualification available against the exact carried source and the qualified Core return.
- Produce technical Evidence and one Kodax → Anchor return Handoff.

## Required Context

- Business controlling Major: `business::.topics/processes/gpt/grounding/001-1-4-1-anchor-major-001-session-participant-and-operator-continuity-har.trace.md`.
- Anchor semantic reconciliation: `business::.topics/processes/gpt/grounding/001-1-4-1-2-anchor-reconciliation-human-session-participant-and-meeting-sema.trace.md`.
- Core Task: `core::.topics/grounding/029-1-qualified-human-session-and-participant-projection.trace.md`.
- Core qualification Evidence: `core::.topics/grounding/evidence/045-qualified-human-session-and-participant-projection-qualification.trace.md`.
- Loom → Anchor return: `core::.topics/grounding/handoffs/077-loom-to-anchor-qualified-human-session-and-participant-projectio.trace.md`.
- Sigma live observation: VS Code currently can offer `Additional carrier Roles` before the selected route has semantic participant authority, and long operations contain visually quiet waits that can look stalled.

## Dependencies

- Qualified Core Task `029-1` return and Evidence from Loom.
- Accepted Business/Axiom semantic reconciliation for human session, participant and meeting semantics.
- Current qualified Extension VS Code source frontier carried by the accepted recovery package.
- Sigma live observation of participant-selection failure and long silent Outgoing waits.

## Scope

Extension VS Code host orchestration, participant affordance projection, active-speaker presentation boundary, progress/stage UX, focused host tests, and only the minimum dependency wiring required to consume the qualified Core projection.

## Exclusions

- No new Participant, Meeting, Conversation or Session semantic schema.
- No Core semantic changes unless an exact missing shared primitive is demonstrated; return such a blocker to Anchor instead.
- No durable person inference from display name, account, message order, writing style or speaker prefix.
- No carrier-lineage, artifact-lineage or filename semantic changes.
- No unrelated repository cleanup, Reduction pass, release publication, deployment or remote mutation.

## Acceptance Boundary

Kodax owns bounded implementation and technical qualification. Anchor reconciles the return. Sigma executes the real VS Code operator flow as the final human UX/acceptance gate before this Major closes.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-vs-code-repository-local-orchestration-frontier.trace.md](001-vs-code-repository-local-orchestration-frontier.trace.md)
  - Value: IK318Q6V1V3YKWjWVhnm9M52xidg8QI1By5r_giIVJg

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: 93jlbfIzvFjF1-HFyrShDt-uRfyt_wNrZ7Vq1yHXZkE