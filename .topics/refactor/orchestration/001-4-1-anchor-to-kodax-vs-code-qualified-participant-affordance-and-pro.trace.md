# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-20 11:56:48
  - Trace: [001-4-vs-code-qualified-participant-affordance-and-progress-feedback.trace.md](001-4-vs-code-qualified-participant-affordance-and-progress-feedback.trace.md)
  - Origin:
    - [relative](001-4-vs-code-qualified-participant-affordance-and-progress-feedback.trace.md)
- Current
  - Current Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-20 11:57:41
  - Authors: Anchor
  - Why: Core Task 029-1 is qualified and reconciled; the remaining bounded host work belongs in Extension VS Code before Sigma live acceptance.
  - Summary: Delegate qualified participant affordance and long-operation progress UX to Kodax without moving semantics into VS Code.
  - Status: ready/local

---

# Anchor To Kodax — VS Code Qualified Participant Affordance And Progress Feedback

## Handoff Parties

- Purpose: implement the bounded VS Code host adoption of the qualified Core human-session/participant projection and remove apparently dead waits from the Outgoing operator flow without recreating semantic authority in the host.
- From: Anchor
- From Kind: role
- From Reference: [Anchor Role — Canonical Holder Cutover Continuation](business::.topics/roles/001-1-1-1-1-1-anchor-canonical-holder-cutover-role.trace.md)
- To: Kodax
- To Kind: role
- To Reference: [Kodax Role — Canonical Holder Cutover Continuation](business::.topics/roles/001-6-1-kodax-canonical-holder-cutover-role.trace.md)

## Transfers

- qualified-participant-affordance
  - Transfer Kind: work-and-responsibility
  - Description: make Additional carrier Role/participant choices consume the exact shared Core projection for the current route. Do not offer Role/cache/endpoint inventory as a valid semantic participant when participant authority is unresolved.
  - Controlling Artifact: [VS Code Qualified Participant Affordance And Progress Feedback](001-4-vs-code-qualified-participant-affordance-and-progress-feedback.trace.md)
  - Boundary: VS Code presents Core-qualified state only; participant, Role, holder and assignment semantics remain shared/Core + canonical-authority owned.

- active-speaker-host-state
  - Transfer Kind: work
  - Description: preserve or introduce only the minimum host-local active-speaker presentation/state needed for multi-human usability, with an explicit non-authoritative boundary.
  - Controlling Artifact: [VS Code Qualified Participant Affordance And Progress Feedback](001-4-vs-code-qualified-participant-affordance-and-progress-feedback.trace.md)
  - Boundary: speaker labels do not create Party identity, Role holding, holder binding, semantic participation, delegation or acceptance.

- outgoing-progress-feedback
  - Transfer Kind: work
  - Description: make materially slow Workspace qualification, Core runtime preparation, route/preflight qualification, preview and manufacture phases visibly active. Reduce repeated work only when exact qualification behavior is preserved.
  - Controlling Artifact: [VS Code Qualified Participant Affordance And Progress Feedback](001-4-vs-code-qualified-participant-affordance-and-progress-feedback.trace.md)
  - Boundary: progress UX must not bypass, weaken or reinterpret Core qualification.

## Required Context

- extension-vscode-workspace
  - Material: complete current Extension VS Code Workspace.
  - Material Reference: [Extension VS Code Workspace](extension-vscode::.topics/.workspaces/tiinex-extension-vscode.workspace.md)
  - Purpose: exact writable host source for this bounded implementation.
  - Availability: available

- core-workspace
  - Material: reconciled current Core Workspace including Loom's qualified Task `029-1` implementation and Evidence.
  - Material Reference: [Core Workspace](core::.topics/.workspaces/tiinex-core.workspace.md)
  - Purpose: exact read-only shared mechanics/API source to consume rather than duplicate.
  - Availability: available

- business-workspace
  - Material: current Business Workspace including Anchor/Kodax Roles and accepted session/participant semantic reconciliation.
  - Material Reference: [Business Workspace](business::.topics/.workspaces/tiinex-business.workspace.md)
  - Purpose: exact Role/process/semantic coordination context for this transfer.
  - Availability: available

- core-qualification-evidence
  - Material: Loom qualification Evidence for Core Task `029-1`.
  - Material Reference: [Qualified Human Session And Participant Projection — Qualification](core::.topics/grounding/evidence/045-qualified-human-session-and-participant-projection-qualification.trace.md)
  - Purpose: exact shared projection behavior and regression boundary.
  - Availability: available

- anchor-semantic-reconciliation
  - Material: accepted Anchor Decision over Axiom's human session/participant/meeting semantic return.
  - Material Reference: [Anchor Reconciliation — Human Session, Participant And Meeting Semantics](business::.topics/processes/gpt/grounding/001-1-4-1-2-anchor-reconciliation-human-session-participant-and-meeting-sema.trace.md)
  - Purpose: controlling separation of speaker, Party/person, Role, assignment, holder, participant and process applicability.
  - Availability: available

## Reference Context

- sigma-live-observation
  - Material: current human observation that VS Code can present Sigma under Additional carrier Roles before Core later rejects semantic participant authority, plus visibly quiet waits during qualification/Pack that can look stalled.
  - Material Reference: [VS Code Qualified Participant Affordance And Progress Feedback](001-4-vs-code-qualified-participant-affordance-and-progress-feedback.trace.md)
  - Purpose: reproduce the exact operator-facing failure shape without promoting chat state into semantics.
  - Availability: available

## Retained Responsibilities

- shared-mechanics
  - Retained By: Loom / Core
  - Responsibility: own host-neutral participant/session/process projections and qualification mechanics.
- semantic-authority
  - Retained By: Axiom / Docs plus accepted Business reconciliation
  - Responsibility: own canonical meaning of Party/Role/assignment/participant/process boundaries.
- human-ux-acceptance
  - Retained By: Sigma
  - Responsibility: execute the real VS Code operator workflow and accept/reject the resulting UX after technical return.
- orchestration-and-progression
  - Retained By: Anchor
  - Responsibility: reconcile Kodax return, preserve fixed Major scope, route exact blockers, and manufacture the Sigma acceptance carrier.

## Exclusions And Dependencies

- core-semantic-redesign
  - Kind: excluded-scope
  - Description: do not invent or change shared participant/session semantics in VS Code. Return an exact blocker if Core lacks a mechanically necessary projection.
- remote-mutation
  - Kind: excluded-scope
  - Description: no commit, push, publication, deployment or Marketplace release is authorized by this Handoff.
- repository-cleanup
  - Kind: excluded-scope
  - Description: org-wide Reduction and `.topics` hygiene are intentionally deferred to a later bounded cleanup Major.

## Completion Expectation

- Signal Kind: return
- Signal Meaning: Kodax returns exact Extension VS Code source/evidence showing qualified participant affordance, explicit speaker-state non-authority, visible long-operation progress and focused regressions, or one exact shared-Core blocker if the host cannot consume the required projection without semantic invention.
- Return To: Anchor
- Return To Reference: [Anchor Role — Canonical Holder Cutover Continuation](business::.topics/roles/001-1-1-1-1-1-anchor-canonical-holder-cutover-role.trace.md)

## Interpretation Limits

- Does Not Mean: technical host qualification is Sigma acceptance, a speaker label establishes identity/Role/participation, Core semantics move into VS Code, or remote mutation is authorized.
- Must Not Be Used To Claim: final product acceptance, release readiness, semantic participation from Role inventory, or permission to expand this Major into unrelated Extension work.
- Authority Limits: Kodax owns only the bounded VS Code implementation/technical qualification; Anchor owns reconciliation/progression; Sigma owns final human UX acceptance.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-4-vs-code-qualified-participant-affordance-and-progress-feedback.trace.md](001-4-vs-code-qualified-participant-affordance-and-progress-feedback.trace.md)
  - Value: 93jlbfIzvFjF1-HFyrShDt-uRfyt_wNrZ7Vq1yHXZkE

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: jhAK6JsvAuhbxeI3n-p6dtdkAGZNL861CIzEXQZP0o0