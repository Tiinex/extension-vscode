# Continuity Context

- Envelope Schema: tiinex.root.v1
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-10 00:05:18
  - Trace: [001-live-outgoing-context.trace.md](001-live-outgoing-context.trace.md)
  - Origin:
    - [relative](001-live-outgoing-context.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-10 01:57:40
  - Authors: Anchor
  - Why: Sigma wants native direct actions, no redundant name prompt for From-Incoming, and explicit carrier dimension behavior.
  - Summary: Separate Blank/Same-as-Incoming actions with carrier-parent continuity and Tooling-owned numbering.
  - Status: ready/local

---

# Fast Outgoing creation and carrier-dimension continuity

## Objective

Replace slow dropdown-driven Outgoing creation with direct native actions while preserving the carrier dimension separately from Handoff artifact lineage.

## Done Criteria

- Outgoing exposes separate conditional title actions for `New Blank` and `New Same as Incoming`; no first-step dropdown is required.
- `New Same as Incoming` is available only when Incoming exists, does not prompt for a friendly name, binds the Incoming package as carrier parent, and opens one multi-select for which Incoming Workspaces participate in Outgoing.
- Selected Outgoing Workspaces are live references, not snapshots; current local source is resolved when packaging occurs.
- `New Same as Incoming` preserves the Incoming carrier prefix/major lineage and lets shared Tooling allocate the next collision-safe child sequence (`-N`) rather than inventing a local counter.
- `New Blank` has no package parent, prompts for an operator-visible carrier name with a parent-folder-derived prefix suggestion, and starts a new carrier major root at `001` through Tooling-owned manufacture semantics.
- Outgoing Workspace siblings are always shown/selected in case-insensitive alphabetical order.
- `Bump Major` is conditional on a From-Incoming Outgoing context and uses shared Tooling's existing package-major contract; it advances the major dimension and resets child suffixes rather than manually rewriting carrier coordinates.
- Package action is hidden until Outgoing is actually packagerable.

## Dependencies

Parent live Outgoing context Task, qualified Incoming carrier state when present, and shared Tiinex manufacture/package-major Tooling.

## Scope

`extension-vscode` Outgoing state/actions, Workspace selection, package-parent/major bridge, tests and docs.

## Boundary

Do not freeze future per-file source scoping, Workspace ZIP exclusion, bootstrap exclusion or encryption semantics in this task.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-live-outgoing-context.trace.md](001-live-outgoing-context.trace.md)
  - Value: eYrk3i4MIAvJqwP2pQdyY_SupL_TElaBGoKc_ejGgd0

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: TkoHjB_5f6-Z_Ct1Rsral8a04kHzocm4skgKZBuZzGw