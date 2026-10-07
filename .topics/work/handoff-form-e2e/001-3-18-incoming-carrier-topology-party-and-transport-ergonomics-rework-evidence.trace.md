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
  - Created At: 2026-10-07 10:22:18
  - Authors: Anchor; Sigma
  - Why: Preserve the latest real-host acceptance return and Core/host authority boundary before the next Sigma rerun.
  - Summary: Record Sigma Incoming lifecycle, replacement-row/Discovery ergonomics, continuation topology, Party qualification and partial-package findings plus bounded repairs.
  - Status: ready/local

---

# Incoming Carrier Topology Party And Transport Ergonomics Rework Evidence

## Supported Claim Or Question

- Supported Claim Or Question: whether Sigma's latest successful real-host exploration exposed a bounded set of Incoming lifecycle, Transport/Discovery ergonomics, carrier-topology naming, Party presentation, and partial endpoint packaging gaps that can be repaired without moving Core qualification authority into VS Code.
- Evidence Role: human acceptance return plus bounded implementation/regression evidence for the next Sigma rerun.
- Target Artifact: Sigma Local Handoff Form Acceptance Review.
- Review Context: Sigma confirmed New Handoff is fast, Role discovery is fast, Native Handoff presets render, Bootstrap Replacement manufacture works, and Handoff packing can complete. Sigma additionally observed that Replace no longer auto-refreshed Incoming; confirmed Reject did not invoke Reset All Dirty Workspaces; Bootstrap Replacement Copy Transport Text belonged on the replacement package row rather than the Transport title; Discovery lacked per-row Close; multi-route New Outgoing displayed the wrong continuation child suffix for consolidation; Additional Participants remained narrower and less pedagogical than Handoff Parties; an Anchor label-only endpoint became Kind unknown with no Reference while Sigma preserved an exact Reference; and a partial Handoff package could be manufactured with only the exact Sigma endpoint route represented.

## Provenance

- Known Source: Sigma screenshots/direct real-host observations plus the exact carried 17-Workspace control package, current Core/VS Code sources, direct Core operator-context and transport-name projections, focused Core tests, and host source/runtime probes.
- Preservation Basis: all semantic claims about Role/Party qualification and continuation child allocation are supported by Core projections. VS Code changes are bounded to host lifecycle, reusable presentation, operator confirmation, and selection ordering.
- Provenance Limits: full `npm run dev:build:local`, Git reset/stage side effects, VS Code menu rendering, and final human ergonomics remain Sigma-local gates.

## Evidence Material

- Material: latest Sigma Incoming/Outgoing/Transport/Party acceptance return plus the bounded host repairs, Core qualification receipts, carrier-topology projections, and regression evidence.
- Material Kind: human acceptance-rework evidence plus implementation and focused verification.
- Incoming Replace/Merge: successful `applyIncomingWorkspaces` now performs the same full `refreshIncoming()` re-orientation/requalification as manual Refresh. This restores automatic Incoming state refresh after mutation rather than relying on a partial tree repaint.
- Incoming Reject: Reject remains prompt-first and single-flight. After the one Reject confirmation, the host now calls shared `inspectDirtyWorkspaces` / `resetDirtyWorkspaces` helpers that power the manual Reset All Dirty Workspaces command. Every dirty Git repository is reset/cleaned; rejected disposition is recorded only after reset succeeds. Reset failure leaves the package undecided and actions are restored. Successful Reject then runs full Incoming refresh while preserving `REJECTED · local review` and Close.
- Shared reset boundary: the manual `Tiinex: Reset All Dirty Workspaces` command retains its own explicit confirmation but delegates to the same reset engine, preventing duplicated Git reset implementations or a second Reject confirmation.
- Bootstrap Replacement row UX: `Build Bootstrap Replacement` remains a Transport title action. Global title-level Copy is removed. A `tiinex-bootstrap-replacement*` Transport package gets a dedicated context where `Copy Transport Text` appears inline, Guided Entry is absent, and ordinary reveal/Close behavior remains. Copy uses the replacement package's existing Core-projected route-less transport text.
- Discovery Close: Discovery package rows now expose Close. Close suppresses that exact package from the current Discovery session and watcher refreshes without deleting the carrier file or changing the broad Clear cutoff.
- Carrier topology ordering: New Outgoing now asks the operator to select route topology before requesting a continuation transport name. Route ordinal is route index + 1; N-route consolidation is ordinal N+1. The selected ordinal is persisted as `packageParentOrdinal` and reused for Outgoing naming and pointerless Workspace child-dimension expectations.
- Direct Core topology proof: from the carried two-route parent, Core projects continuation filenames ending in child suffix `-1`, `-2`, and `-3` for ordinal 1, ordinal 2, and consolidation ordinal 3 respectively. VS Code no longer substitutes a Role-derived or default ordinal after topology selection.
- Party picker presentation: the shared Workspace-backed presentation categorizes Core-projected candidates as Roles, Organizations, Groups, People, Parties, or Other based on the qualified schema identity while retaining the same Workspace display name and relative artifact path presentation.
- Direct Core Party proof: Sigma is a `qualified-exact` current Role; Anchor is an `authoring-assist` current Role; Tiinex is an `authoring-assist` `tiinex.party.organization.v1` Party. VS Code does not promote Anchor or Tiinex into exact references.
- Label-only endpoint UX: Handoff From/To help text now explicitly distinguishes exact candidates from label-only authoring-assist candidates. Selecting an assist candidate warns that Kind will be `unknown`, no exact Reference will be written, and package manufacture may omit semantic endpoint pointers for that party.
- Additional Participants boundary: the participant picker keeps the shared Workspace grouping but remains exact current Role-only because that is the current Core participant contract. The host explicitly directs recipient Parties/Organizations to the Handoff To field and does not infer organization membership or participant authority.
- Organization boundary: Organization is represented as a Party category for Handoff endpoints. No claim is made that organization membership automatically delegates work to all members; such delegation requires future qualified membership/representation semantics in Core.
- Partial package readiness: before actual Pack, the host inspects included Handoff markdown endpoints. If any From/To Reference is absent or Kind is unknown, the operator receives a modal explaining that the Handoff can remain schema-valid but Core can materialize semantic endpoint pointers only for exact qualified References. Human execution requires explicit `Pack Partial`; Preview is not burdened with this confirmation.
- Focused Core regression: 73/73 tests pass across endpoint Role/route binding, multi-root operator context, Handoff participant projection, Native Handoff transitions, Transition catalog, Package V1, and Bootstrap carrier export.
- Host verification: touched TypeScript files transpile without syntax diagnostics; `package.json` parses; shared Party/Organization presentation probe passes; static lifecycle/menu/topology/partial-pack probe passes.

## Preservation And Fidelity

- Preservation State: implementation and this Evidence are local and will be carried in the next shared Handoff package; no commit/push/publication has occurred.
- Fidelity Notes: Core remains owner of Role/Party exact-vs-assist qualification, current Role leaves, Transition semantics, Handoff/package materialization, and carrier continuation naming. VS Code owns host Git reset/stage actions, auto-refresh, menu/button presentation, topology selection timing, operator warnings, and reusable candidate grouping.
- Known Losses: exact real-host Git reset behavior, automatic Incoming refresh timing, VS Code inline button placement, and human perception of the new partial/label-only warnings require Sigma rerun.

## Interpretation Limits

- Not Yet Used As: Sigma PASS, full build PASS, landing authority, commit/push authority, release readiness, Marketplace readiness, organization delegation authority, or Task closure.
- Does Not Prove: that every Organization may receive/delegate a Handoff without an exact Core-qualified Party Reference, that authoring-assist Anchor should be upgraded to exact, or that partial packaging should be globally blocked.
- Must Not Be Treated As: permission for VS Code to infer Party membership, Role authority, exact References, carrier child lineage, or semantic endpoint pointers independently of Core.
- Need For Review: rerun the locked local build and bounded Incoming/Transport/Discovery/Outgoing/Handoff flows; return PASS or exact bounded rework.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-3-sigma-local-handoff-form-acceptance-review.trace.md](001-3-sigma-local-handoff-form-acceptance-review.trace.md)
  - Value: lFKPnCPOIa8UmsuSyZNwu4GsXetEL7di8iVDEzgqhv8

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: S_uvDYnGxXnfUFwjL2PDMMt8XWvhJXQADarFxtmAJhE