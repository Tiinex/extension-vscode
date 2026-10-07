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
  - Created At: 2026-10-07 13:33:44
  - Authors: Anchor; Sigma
  - Why: Preserve Sigma feedback and the distinction between endpoint Reference provenance and exact package-local participant Role qualification before the next acceptance rerun.
  - Summary: Record the exact-only Additional Participants discovery bug, shared current Role leaf correction, and direct Core qualification of all Business current Role leaves as package-local participant Roles.
  - Status: ready/local

---

# Additional Participant Current Role Discovery Correction Evidence

## Supported Claim Or Question

- Supported Claim Or Question: whether the Attach Handoff Additional Participants picker was incorrectly restricted to exact Handoff endpoint References, and whether current Role authoring-assist leaves can instead be safely offered when Core requalifies their exact Workspace/path material before Attach and Pack.
- Evidence Role: bounded Sigma return plus implementation and Core qualification evidence.
- Target Artifact: Sigma Local Handoff Form Acceptance Review.
- Review Context: Sigma confirmed Reject now works and continuation/consolidation carrier dimensions are correct, but Additional Participants still showed only one Party/Role candidate (Sigma) while Handoff authoring discovered many current Roles.

## Provenance

- Known Source: Sigma screenshot/observation, current carried Core/Business/VS Code sources, Core operator-context projection, direct `project-handoff-participants` probes, and focused Core participant/package regressions.
- Preservation Basis: Core remains owner of current Role leaves and semantic participant qualification. VS Code only widens presentation from exact endpoint References to the Core-projected current Role leaf authoring surface, then supplies exact Workspace/path identities back to Core for participant qualification.
- Provenance Limits: full locked VS Code build and visual picker acceptance remain Sigma-local.

## Evidence Material

- Material: Additional Participants current-Role discovery correction, shared Guided Entry current-role correction, and exact Core package-local participant requalification probes.
- Material Kind: Human review return plus bounded implementation/regression evidence.
- Root Cause: `loadPartyAuthoringReferenceChoicesForSources(..., currentRoleLeavesOnly=true)` still selected only `currentRoleEndpoints`, which are the exact Handoff endpoint Reference subset. In Business that surface contains only Sigma. Core separately projects eight current Role authoring-assist leaves: Anchor, Axiom, Glimmer, Kodax, Loom, Pilot, and two Prism lineages.
- Shared Discovery Correction: current-role-only authoring discovery now unions Core `currentRoleEndpoints` and `currentRoleAuthoringEndpoints`; lineage/currentness remains Core-owned and historical parents remain absent.
- Attach Handoff Correction: Additional Participants consumes that shared current Role leaf projection instead of the exact endpoint catalog. It remains Role-only because Core's semantic participant model is explicitly participant Role authority.
- Package-local Identity: when a current Role has no exact Handoff endpoint Reference, VS Code supplies the exact Core-recognized Workspace identity `workspaceId::artifactPath`. This does not promote endpoint provenance. Core requalifies the Role bytes, schema, c14n-v2 self-integrity, Workspace/path identity, and participant semantics before Attach and again before Pack.
- Direct Qualification: each of the nine Business current Role leaves was independently projected through Core `project-handoff-participants` using its Workspace-qualified path identity. All nine returned ready/qualified with one semantic participant and zero participant qualification findings.
- Anchor Probe: Anchor, which remains authoring-assist for Handoff endpoint authoring, qualifies as an exact package-local participant Role when identified as `business::.topics/roles/001-1-1-1-1-1-anchor-canonical-holder-cutover-role.trace.md`. This demonstrates that endpoint Reference qualification and package-local participant material qualification are intentionally distinct authority seams.
- Guided Entry: the same exact-only filter was present after shared discovery, so Guided Entry Primary Role/Participants now also exposes every Core-current Role leaf and uses the Workspace-qualified identity fallback before its own Core projection/GitHub pinning fallback.
- UX: Additional Participant title is now `Additional participants · current Roles`; Workspace grouping and relative path presentation remain shared with the Handoff/Guided Entry picker presentation.
- Organization Boundary: Organization/Party recipients remain available through Handoff `To`. Additional participant authority remains Role-based until Core gains an explicit participant-Party/organization membership model; VS Code does not infer that membership.
- Focused Core Regression: Handoff participant projection, Package V1, and endpoint Role/route binding pass 53/53.
- Host Verification: affected TypeScript surfaces transpile without syntax diagnostics and static wiring checks confirm no exact-only qualification filter remains in Attach Handoff or Guided Entry current-Role selection.

## Preservation And Fidelity

- Preservation State: local implementation plus this Evidence; no commit/push/publication has occurred.
- Fidelity Notes: no Business Role artifact was mutated and no authoring-assist endpoint was reclassified as an exact Handoff endpoint. The widened picker relies on Core's separate exact package-local participant material qualification.
- Known Losses: real VS Code picker rendering and full local TypeScript build remain Sigma gates.

## Interpretation Limits

- Not Yet Used As: Sigma PASS, landing authority, commit/push authority, release readiness, Marketplace readiness, or Task closure.
- Does Not Prove: organization membership-based participant authority or that an Organization may be used as an Additional Participant Role.
- Must Not Be Treated As: host permission to infer Role currentness or participant authority from filenames, labels, chronology, or organization membership.
- Need For Review: rerun the local build and Attach Handoff; verify the picker shows the current Role leaf set rather than only Sigma and that selecting Anchor/another current Role successfully attaches and later packs through Core requalification.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-3-sigma-local-handoff-form-acceptance-review.trace.md](001-3-sigma-local-handoff-form-acceptance-review.trace.md)
  - Value: lFKPnCPOIa8UmsuSyZNwu4GsXetEL7di8iVDEzgqhv8

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: J7HfAsIHE-9eINH57WuLqx5AZpDwR2b5RO0DY-Nf__E