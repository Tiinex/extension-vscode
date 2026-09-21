# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-20 16:25:38
  - Trace: [001-4-2-sigma-live-gate-correction-qualified-participants-multi-handoff.trace.md](001-4-2-sigma-live-gate-correction-qualified-participants-multi-handoff.trace.md)
  - Origin:
    - [relative](001-4-2-sigma-live-gate-correction-qualified-participants-multi-handoff.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-20 21:46:07
  - Authors: Anchor
  - Why: Recent live replay showed that invalid historical Handoffs were accepted into Outgoing and only failed late during Pack while qualified participant presentation remained absent.
  - Summary: Qualify the full Local/participant/multi-Handoff host flow before the final Sigma replay.
  - Status: ready/local

---

# Major 002 Host-Flow Acceptance — Early Route Qualification And Qualified Participants

## Objective

Sigma is an explicitly required human participant in this current work because Sigma owns the final live VS Code operator acceptance gate.

Restore one end-to-end host flow in which Local mode survives restart, invalid Handoff routes are rejected before attachment, Core-qualified participant authority is presented without Role-inventory inference, and two valid Handoff routes can be packed through shared Core allocation/closure mechanics before the final human replay.

## Done Criteria

- A Handoff whose endpoint identity contradicts its exact Role material, whose exact schema-reference qualification is insufficient, or whose Required Context cannot close is rejected during Attach rather than being tracked and failing later during Pack.
- A Handoff with no semantic participant declaration remains attachable with no invented participant choices.
- A Handoff under this Task projects Sigma from exact current-work participant authority plus the exact canonical Sigma Role material and presents the exact Core-qualified set in a multi-select confirmation surface.
- The host does not derive participant choices from Role inventory, Handoff endpoints, speaker state, filenames, cache presence, package presence or user identity.
- Local Core mode remains usable after Extension Host restart for Incoming, Replace, Outgoing and Pack; Latest/Published mode retains strict version/source checks.
- One valid single-route package and one valid two-route package manufacture, orient and cold-ground through the exact selected Core source without host-owned route/carrier inference.
- Progress stages remain visible across materially slow qualification/preview/manufacture/requalification phases and clean up on terminal paths.
- The strongest executable Core/VS Code regression and package-integration suites available locally are green before Sigma receives another replay carrier; any unavailable typecheck is reported as unverified rather than passed.

## Required Context

- Parent correction Task `001-4-2-sigma-live-gate-correction-qualified-participants-multi-handoff.trace.md`.
- Canonical Sigma Role `business::.topics/roles/001-4-1-sigma-canonical-holder-cutover-role.trace.md`.
- Current accepted Core multi-Handoff allocation and participant-authority implementation.
- Sigma silent-video evidence reproducing late Pack failure from an invalid historical Handoff and absence of the participant confirmation surface.

## Dependencies

- Exact current Business, Core and Extension VS Code Workspaces from the accepted Major 002 replay carrier.
- Canonical Anchor and Sigma Role material carried in Business.
- Current shared Core multi-Handoff carrier-allocation, endpoint-role material and participant-authority mechanics.
- Current VS Code Local-mode runtime-selection correction.

## Scope

Extension VS Code host orchestration, shared Core participant/route projection consumption, exact early qualification, Local runtime selection regression coverage and final Major 002 acceptance only.

## Exclusions

- No weakening of Handoff endpoint identity, Required Context, schema-reference, Role material, participant authority, carrier allocation or cold-grounding contracts.
- No new Participant/Meeting/Session schema, no unrelated product work, no Reduction cleanup and no remote commit/push/publication in this Task.
- Historical invalid Handoffs are preserved as historical material; this Task does not rewrite them merely to make Pack succeed.

## Acceptance Boundary

Anchor owns implementation/reconciliation for this bounded repair. Sigma performs only the final human VS Code replay after the automated host-flow matrix is green.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-4-2-sigma-live-gate-correction-qualified-participants-multi-handoff.trace.md](001-4-2-sigma-live-gate-correction-qualified-participants-multi-handoff.trace.md)
  - Value: 2S-G4OAhW3BkSfNG4UAiiXwKSf32fipGhQhI5XPvi5o

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: YqSxXayZj-mD4OI4RVtMEA9sNEal9PwsZXUfkas9lZ8