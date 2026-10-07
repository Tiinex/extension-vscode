# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-10-06 20:05:01
  - Trace: [001-3-sigma-local-handoff-form-acceptance-review.trace.md](001-3-sigma-local-handoff-form-acceptance-review.trace.md)
  - Origin:
    - [relative](001-3-sigma-local-handoff-form-acceptance-review.trace.md)
- Current
  - Current Schema: [tiinex.evidence.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/core/evidence/tiinex.evidence.v1.schema.md)
  - Created At: 2026-10-07 07:53:31
  - Authors: Anchor; Sigma
  - Why: Make the latest human return and portable Core/host ownership boundary durable before the next bounded Sigma rerun.
  - Summary: Record Sigma fast-form/current-Role success, shared Workspace-grouped Role/Identity picker architecture, generic zero-input Native Handoff Transition correction, and remaining Incoming human gates.
  - Status: ready/local

---

# Handoff Picker Unification And Generic Transition Rework Evidence

## Supported Claim Or Question

- Supported Claim Or Question: whether the latest Sigma Handoff-form rerun can preserve the now-fast form/current-Role behavior while making Role/Identity pickers pedagogically consistent across VS Code and restoring general embedded Handoff authoring Transitions independently of Parent schema.
- Evidence Role: bounded human-return plus implementation/regression evidence for the next Sigma rerun.
- Target Artifact: Sigma local Handoff form acceptance review.
- Review Context: Sigma reported that the Handoff form now opens almost immediately and current Role choices arrive quickly. Sigma still observed no Native Transition presets, requested Role/Identity choices be grouped by qualified Workspace using the same Workspace naming as Outgoing, requested the same discovery/presentation in other extension Role pickers (notably Guided Entry and Attach Handoff), and reported Reject confirmation/cancel behavior working while a confirmed Reject appeared to do nothing beyond removing decision actions and leaving Close. Accept was not rerun in that round.

## Provenance

- Known Source: latest Sigma screenshots/direct observations plus current carried Core/Native/VS Code sources and focused local probes.
- Preservation Basis: Core remains semantic owner of current Role leaves, Role/Identity qualification, Transition definitions/attachments, and review readiness. VS Code owns only Workspace-root presentation, host picker grouping, Stage All invocation, and Incoming lifecycle controls.
- Provenance Limits: the full locked VS Code build and real-host UI remain Sigma-local gates.

## Evidence Material

- Material: Latest Sigma Handoff-form rerun observations plus shared Role/Identity picker presentation/discovery, generic Native Transition correction, Incoming local-review presentation, and focused verification.
- Material Kind: Human review return plus bounded implementation and regression evidence.

- Handoff picker presentation: one reusable VS Code presentation helper now maps Core-projected Party/Role candidates to short human labels, Workspace display names, relative artifact paths, and groups such as `Tiinex Business · Roles` / `Tiinex Business · Identities`. Workspace display names use the same `Workspace.title || workspaceId` rule as Outgoing.
- Handoff webview: From/To native selects render grouped `<optgroup>` sections. Option text is the short Role/Identity name plus relative `.topics/...` path; raw semantic qualification/debug labels are no longer primary picker text.
- Current Role lineage boundary: the Handoff form continues to consume Core `authoringReferenceCandidates`, where Role candidates are current lineage leaves only while Identity candidates remain independently qualified.
- Guided Entry: its separate N×`projectWorkspaceSessionRoles` host discovery loop is removed. It consumes the same cached `loadPartyAuthoringReferenceChoicesForSources(..., currentRoleLeavesOnly=true)` Core-backed projection and uses the same Workspace grouping for Primary Role and Participants.
- Attach Handoff participants: participant selection now uses the same grouped Workspace presentation; exact durable participant binding is still requalified by Core before Attach/Pack.
- Legacy endpoint picker: the older exact From/To QuickPick now uses the same authoring-reference discovery projection, filters to exact References, and uses the same Workspace/Role/Identity grouping.
- Generic Native Handoff Transitions: Core previously filtered a Transition out whenever a Parent `inputSchemaId` was present but the definition had no matching `inputSchemaIds`. The Native Handoff authoring transitions explicitly declare `Input Roles: none`; therefore they are parent-independent. Core now applies input-schema filtering only when the Transition actually declares input schema constraints.
- Generic Transition real probe: `project-transition-neighborhood` for output `tiinex.handoff.v1` with Parent/input schema `tiinex.evidence.v1` returns `Discuss / review`, `Open bounded conversation / brainstorm`, and `Perform bounded work`, with 3 attached candidates and zero findings.
- Core regression: focused Transition/operator-context/participant suite passes 18/18, including a new regression proving zero-input Native Handoff transitions remain available with an unrelated Parent schema.
- Picker presentation probe: short names, relative paths, Workspace naming, and Role/Identity group ordering pass for multiple Workspaces.
- Incoming Reject semantics: confirmed Reject is intentionally a host-local review disposition only. It does not mutate/revert repository bytes or manufacture Tiinex semantic rejection authority. The package row now exposes persistent `REJECTED · local review` presentation while Close remains the lifecycle action for removing the row.
- Accept remains unproven in the real host after the latest Sigma round. Source wiring still requires successful `Stage All Workspaces` before setting the accepted review decision.

## Preservation And Fidelity

- Preservation State: current implementation and this Evidence are carried locally; no commit/push/publication has occurred.
- Fidelity Notes: picker categorization never computes Role lineage/currentness in VS Code. It only groups Core-returned candidates and reuses qualified Workspace titles. Generic Transition availability is corrected in Core rather than special-cased in the VS Code host.
- Known Losses: no full locked VS Code `npm run dev:build:local` / complete validation can be claimed from this sandbox.

## Interpretation Limits

- Not Yet Used As: Sigma PASS, landing authority, commit/push authority, release readiness, Marketplace readiness, or Task closure.
- Does Not Prove: real-host visual grouping, Accept→Stage All success, or that confirmed Reject presentation is sufficiently obvious to Sigma.
- Must Not Be Treated As: permission for VS Code to infer Role lineage/currentness or Transition applicability itself.
- Need For Review: rerun the locked local build and the bounded form/Guided Entry/Attach Handoff/Incoming checks; return PASS or exact bounded rework.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-3-sigma-local-handoff-form-acceptance-review.trace.md](001-3-sigma-local-handoff-form-acceptance-review.trace.md)
  - Value: lFKPnCPOIa8UmsuSyZNwu4GsXetEL7di8iVDEzgqhv8

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: M4Rch_9-g5SoYRGhJ1hTwW6_oMZEli0M4hBwxWMevw0