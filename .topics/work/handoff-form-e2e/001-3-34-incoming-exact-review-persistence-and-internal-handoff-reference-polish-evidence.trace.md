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
  - Created At: 2026-10-07 18:13:44
  - Authors: Anchor; Sigma
  - Why: Preserve Sigma latest real-host findings and the Core-versus-host authority boundary before the next bounded rerun.
  - Summary: Record the non-sticky authoring, global Operator Party, exact-match Incoming decision, restart persistence, Reject readiness and Core-qualified internal Handoff Reference polish.
  - Status: ready/local

---

# Incoming Exact Review Persistence And Internal Handoff Reference Polish Evidence

## Supported Claim Or Question

- Supported Claim Or Question: whether Sigma's latest real-host findings can be corrected without moving Party/Role qualification or Handoff endpoint authority into VS Code.
- Evidence Role: bounded implementation and regression evidence for the next Sigma rerun.
- Target Artifact: Sigma Local Handoff Form Acceptance Review.
- Review Context: Sigma reported four host issues after the Operator Party / Return To pass: the Handoff authoring header consumed too much vertical space because it was sticky; Operator Party was persisted as a Workspace setting rather than a user-profile preference; all-exact Incoming still required Replace/Merge before Accept/Reject and Reject therefore returned `review is not decision-ready`; and Incoming state disappeared on VS Code restart. Sigma also observed that discovered current Role/Party selections did not always render Handoff Reference fields.

## Provenance

- Known Source: Sigma screenshots/direct observations, the exact carried 17-Workspace parent package, current Core/VS Code source, direct Core operator-context projections, focused Core regressions, and host source/runtime probes.
- Preservation Basis: Core remains owner of Party/Role discovery, semantic endpoint qualification, canonical Workspace coordinates and Handoff reference projection. VS Code remains owner of UI layout, user-profile preferences, local Incoming review persistence, Git actions and supported view/menu presentation.
- Provenance Limits: full `npm run dev:build:local`, VS Code restart behavior and final human ergonomics remain Sigma-local gates.

## Evidence Material

- Material: non-sticky authoring layout, Operator Party global persistence, exact-match Incoming decision readiness, Incoming queue persistence, Reject readiness correction, and Core-qualified internal Handoff references.
- Material Kind: implementation plus focused verification.
- Authoring layout: the Handoff authoring top area is no longer `position: sticky`; Workspace/Title/Party controls scroll away normally so the remaining schema form can use the editor height.
- Operator Party persistence: `tiinex.operator.party` is now read from the user-profile/global setting. Pick Operator Party clears any legacy Workspace override before writing the selected canonical/unknown/None value globally. Party authority remains unaffected by the setting.
- Exact-match Incoming decision readiness: review readiness is now determined by the carried Workspace set itself. When every carried Workspace compares `exact`, the package immediately projects decision-ready state; Replace is therefore hidden by the existing context-menu split and Accept/Reject become available without a redundant Replace/Merge action.
- Reject correction: the old `reviewPerformed` precondition no longer blocks Reject for an already-exact carrier. Reject still uses the existing single-flight guard, confirmation, exact recheck and Reset All Dirty Workspaces transaction.
- Incoming persistence: Incoming package paths and accepted/rejected local-review disposition are persisted in Workspace state and restored on extension start. Restored packages are re-oriented/requalified and their current exactness is recomputed rather than trusting stale comparison state. Close removes the persisted entry. Missing carrier bytes are dropped or represented as blocked pending material rather than silently granting review state.
- Discovery interaction: restored Incoming/pending paths remain excluded from Discovery presentation so persistence does not duplicate the same carrier in both surfaces.
- Internal Handoff resolution Reference: Core now qualifies an exact bounded `workspaceId::artifactPath` coordinate as an optional internal Handoff resolution Reference when the Party/Role candidate is readable/current but lacks a provider/public permalink. This does not upgrade `authoring-assist` semantic endpoint authority; it supplies an exact artifact-resolution aid under the existing schema rule that References cannot override readable endpoint identity.
- Host reference handling: VS Code consumes only the Reference supplied by Core. It no longer invents a Workspace Reference itself. A current Role such as Anchor may therefore remain semantically `authoring-assist` while authoring `To Kind: role` plus a Core-qualified internal `To Reference`. Return To uses the same Core-supplied reference behavior.
- Direct Core projection: current Business candidates including Anchor and Kodax project `referenceQualification: qualified-workspace-coordinate` with canonical `business::.topics/...` reference targets; Sigma remains `qualified-exact` while also using its exact bounded coordinate when no stronger provider Reference exists.
- Focused Core regression: 62/62 tests pass across Handoff core/reference qualification, operator-context Workspace boundary/scope, endpoint Role route binding, participant projection and Package V1.
- Host verification: affected TypeScript sources transpile without syntax diagnostics; `test/run.mjs` parses; `package.json` parses; static probes confirm non-sticky layout, global Operator Party handling, exact-only review readiness, Incoming restore/persist wiring and removal of the old Replace/Merge decision-ready error.

## Preservation And Fidelity

- Preservation State: implementation and this Evidence are local and will be carried in the next shared Handoff package; no commit/push/publication has occurred.
- Fidelity Notes: exact bounded Workspace References are resolution aids only. Semantic endpoint authority, Party scope, Role currentness and package material closure remain Core-owned.
- Known Losses: no full locked VS Code build, actual extension restart, or final real-host Incoming/Handoff interaction is claimed from this sandbox.

## Interpretation Limits

- Not Yet Used As: Sigma PASS, landing authority, commit/push authority, release readiness, Marketplace readiness, or Task closure.
- Does Not Prove: that provider/public provenance exists for an internal Workspace Reference, or that a persisted accepted/rejected local review is Tiinex semantic disposition authority.
- Must Not Be Treated As: permission for VS Code to manufacture Party/Role References or organization membership independently of Core.
- Need For Review: run the locked build; verify the authoring header scrolls away; verify Sigma/Anchor/Kodax dropdown selections render their Core-projected References; verify Pick Operator Party writes User/Profile rather than Workspace; verify an all-exact Incoming package immediately exposes Accept/Reject with Replace hidden; Reject succeeds without the old decision-ready warning; restart VS Code and verify Incoming remains until Close.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-3-sigma-local-handoff-form-acceptance-review.trace.md](001-3-sigma-local-handoff-form-acceptance-review.trace.md)
  - Value: lFKPnCPOIa8UmsuSyZNwu4GsXetEL7di8iVDEzgqhv8

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: Gg6sJD6Rq_Hzp60vv8WQcaDfnPtSp8YvYpb4KEqt6zo