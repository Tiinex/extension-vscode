# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-12 14:21:59
  - Trace: [001-3-6-4-1-3-1-1-1-2-1-2-2-kodax-to-anchor-vs-code-major-003-git-automation-and-scm-ergonom.trace.md](001-3-6-4-1-3-1-1-1-2-1-2-2-kodax-to-anchor-vs-code-major-003-git-automation-and-scm-ergonom.trace.md)
  - Origin:
    - [relative](001-3-6-4-1-3-1-1-1-2-1-2-2-kodax-to-anchor-vs-code-major-003-git-automation-and-scm-ergonom.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-12 14:52:08
  - Authors: Anchor
  - Why: Core Major 009 now provides the package/route transport projections needed to complete the operator delivery lifecycle in VS Code.
  - Summary: Add a Core-driven Transport queue for manufactured and forwarded carriers without inventing package, recipient or delivery semantics.
  - Status: ready/local

---

# VS Code Major 003 — Transport Queue And Qualified Delivery UX

## Objective

Complete the next bounded operator tranche by turning manufactured or forwarded Tiinex carriers into a first-class Transport queue whose presentation is derived only from the qualified finished package bytes and shared Core transport projections.

## Done Criteria

- Add a first-class `Transport` TreeView alongside Discovery, Incoming and Outgoing.
- A successful Pack no longer disappears into an implicit filesystem-only result: the exact manufactured carrier is re-oriented from its finished ZIP bytes, Outgoing is cleared/rotated as today, and the carrier is added to Transport.
- Transport supports multiple simultaneous manufactured or forwarded carriers.
- Every Transport package root exposes package-level `Copy Package`, `Copy Transport Text`, and `Close` actions.
- `Close` removes the item from the active Transport queue only; it does not delete or mutate the ZIP.
- Package-level transport text comes verbatim from shared Core projection. VS Code does not reconstruct Start/Continue text.
- A route-less Workspace or bootstrap-only carrier has no synthetic child row. Package-level actions remain fully usable.
- A routed Handoff carrier expands to one simple row per exact qualified recipient route, labelled from Core recipient projection such as `To Sigma`, `To Anchor`, or `To Kodax`.
- Each route row exposes route-specific `Copy Transport Text`; a convenience `Copy Package` may mirror the package-level copy action but must reference the same immutable ZIP bytes/state.
- Prepared state is host-local presentation state keyed by exact package SHA-256 plus route id (or package-only key for route-less carriers). A route becomes checked only after package bytes and that route's transport text have both been prepared/copied. The check means `prepared`, never `delivered` or `accepted`.
- Route-less package prepared state becomes checked after package bytes plus generic package transport text have both been prepared.
- Discovery and Incoming can `Send to Transport` without receiving, merging, repacking, rewriting or changing carrier lineage. A specific Handoff route may be sent to Transport as a delivery selection while still referencing the same package bytes.
- Transport state is rebuilt/qualified from actual package bytes after reload; host-local queue/prepared bookkeeping is never semantic package authority and is not embedded into a Tiinex carrier.
- File-copy UX is capability-bound: use a real OS file clipboard action where the host safely supports it; otherwise fail over visibly to an honest `Copy Path` / `Reveal Package` style action rather than claiming file clipboard success.
- Core 009 bootstrap-only, Workspace/material, and routed Handoff package roles all render without VS Code inventing package/recipient semantics.
- No top-level JSON artifact, hidden semantic sidecar, duplicate transport manifest, or VS Code-owned transport-text template is introduced.
- Existing Discovery, Incoming, Outgoing, Git Operator, generic authoring, navigation and Pack regression surfaces remain green.

## Scope

Transport/delivery queue UX and the minimum host-local bookkeeping/capability mechanics needed for that queue only.

## Dependencies

- Accepted Core Major 009 package/material/transport projection mechanics.
- Accepted Docs Major 007 package/material/recipient semantics.
- Current Extension VS Code Major 003 source including the accepted Git-ergonomics return.
- Qualified local/Incoming carrier indexing and package orientation already present in the extension.

## Explicitly Out Of Scope

- Merge/conflict materialization redesign.
- New Artifact / Feedback authoring discoverability redesign.
- Handoff form semantics or schema-specific authoring.
- Multiple simultaneous unmanufactured Outgoing drafts.
- Marketplace/release publication.
- Remote delivery verification or claims that a recipient actually received/accepted a carrier.

## Starting Authority

- Core Major 009 is the shared authority for generic package transport text, route-specific Handoff transport text, recipient projection, bootstrap-only carrier semantics and artifact-readable package roundtrip.
- VS Code may present and queue those projections mechanically but must not infer recipients from carried Roles, filenames, repositories, package placement or UI context.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-3-6-4-1-3-1-1-1-2-1-2-2-kodax-to-anchor-vs-code-major-003-git-automation-and-scm-ergonom.trace.md](001-3-6-4-1-3-1-1-1-2-1-2-2-kodax-to-anchor-vs-code-major-003-git-automation-and-scm-ergonom.trace.md)
  - Value: B83tsdZNsyoeRI4KyzcuEkU2xT28b1wpjmIYBJ8Vlcs

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: sufHOx2saiDuYiZ_GBJrHKiUMux0SUBnPVOZaDZkpMc