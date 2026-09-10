# Continuity Context

- Envelope Schema: tiinex.root.v1
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-10 00:05:18
  - Trace: [001-live-outgoing-context.trace.md](../001-live-outgoing-context.trace.md)
  - Origin:
    - [relative](../001-live-outgoing-context.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-10 00:05:19
  - Authors: Anchor
  - Why: Sigma explicitly distinguished Handoff artifact continuity from the carrier dimension and expects From Incoming packaging to continue the incoming ZIP lineage.
  - Summary: Preserve package-parent lineage for From-Incoming Outgoing and leave pointer manufacture to Tooling.
  - Status: ready/local

---

# Outgoing carrier parent and routing

## Objective

Preserve the carrier dimension when packaging Outgoing without confusing package parentage with Handoff artifact Parent semantics.

## Done Criteria

- `New (From Incoming)` records the active Incoming `.handoff-package.zip` as the package parent used by shared manufacture.
- `New (Blank)` does not infer a package parent.
- Package route selection targets a reviewed/written Handoff artifact; Tooling manufactures the corresponding package routing/pointer material.
- Additional participant Role context is passed as package routing context without creating extra From/To endpoints.
- Current source bytes are resolved at package time from live selected Workspaces or qualified package-parent reuse where supported.

## Scope

`extension-vscode` Outgoing package-parent selection/routing bridge and tests only.

## Dependencies

Parent live Outgoing context Task, qualified Incoming carrier and public shared Tiinex manufacture path.

## Deferred

Bootstrap exclusion, Workspace source-ZIP exclusion, encryption and narrower per-file Workspace scoping are intentionally not frozen here.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-live-outgoing-context.trace.md](../001-live-outgoing-context.trace.md)
  - Value: eYrk3i4MIAvJqwP2pQdyY_SupL_TElaBGoKc_ejGgd0

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: WIgnSCew-93wHnvHlpdq7eW75D4XImDJkb15-vHJT8I