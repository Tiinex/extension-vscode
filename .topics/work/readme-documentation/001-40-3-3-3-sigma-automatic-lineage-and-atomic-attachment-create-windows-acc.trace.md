# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-10-09 16:49:01
  - Trace: [001-40-3-3-complete-explorer-move-rebase-and-still-media-windows-acceptance.trace.md](001-40-3-3-complete-explorer-move-rebase-and-still-media-windows-acceptance.trace.md)
  - Origin:
    - [relative](001-40-3-3-complete-explorer-move-rebase-and-still-media-windows-acceptance.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-10-09 17:18:58
  - Authors: Anchor
  - Why: Close the last attachment regression without making Sigma allocate dimensions or debug partial moves.
  - Summary: Windows gate for deferred Attach to Form, automatic Core artifact lineage and journaled Create plus ordinary file relocation.
  - Status: ready/local

---

# Sigma Automatic Lineage And Atomic Attachment Create Windows Acceptance

## Objective

Close the remaining Sigma UX gap in Attach to Form: with a local qualified form, ordinary files can be staged as pending references, and at Create Core derives their numeric lineage from the exact artifact draft path, commits original file relocation and the new artifact in one reviewable journaled transaction. Do not ask Sigma to manually enter a lineage coordinate or debug missing UI commands.

## Done Criteria

- Incoming → qualified Replace → local Windows Build linked extension → Reload. On actual TypeScript/build failure stop immediately with error; release audit and transpiled source tests do **not** count as native Windows build PASS.
- Right-click a disposable PNG in a qualified local Workspace; `Tiinex → Attach to Form` works on files, not folders. Choose the right open Evidence form and Material field; select **No** first and confirm reference only, source remains.
- Repeat with **Yes — move when this artifact is created**. The original file remains present, source bytes unchanged, and no manual lineage textbox appears. Form status indicates pending relocation.
- Fill Evidence Title and minimum mandatory information, one or two separately described Evidence Material entries. Optionally change Title or Parent before Preview; Core must derive the final artifact numeric lineage from the current qualified projected draft, not from the earlier preview or an operator typed coordinate.
- Preview shows final proposed reference filenames using one dimension and sequential `-01` / `-02`, while the originals still exist. Cancel confirm once: nothing moved or authored. Then Create, review plan, confirm: artifact plus linked file outputs exist, original source paths are absent, Markdown links resolve locally, self-integrity and schema validation pass.
- Re-open generated Evidence and verify per-material text descriptions and links, and that a nonclosing form reflects committed references. A pending reference removed before Create must not cause the source file to move.
- Negative cases: changed source bytes after Preview, target collision, unsupported text asset, invalid/ambiguous Workspace or symlink are blocked by Core before mutation; no hidden retry or fallback to guessing coordinates. If durable journal recovery is required, stop and preserve its findings.
- Regression: Explorer Move/Rebase Move/Prepend/Normalize still opens from qualified `.trace.md`; form `Save as Transition` still opens the separate Core-backed definition, and Incoming/Outgoing Pack, Handoff Pointer and canonical carrier filename still work.
- Presentation media stays on the cropped PNG policy, with no animated GIFs, Git LFS setup or rewritten Git history.

## Scope

One owner-qualified Windows Sigma acceptance of prospective Evidence-v1 artifact creation and ordinary-file asset relocation. Source semantics in Core, host projection in VS Code. The operator's test carriers and files are disposable and do not need to be returned.

## Dependencies

- Previous Windows acceptance Task `001-40-3-3-complete-explorer-move-rebase-and-still-media-windows-acceptance.trace.md` and its Handoff; this is its narrowed successor.
- Core `core::.topics/work/topics-discovery/001-unify-scoped-topics-discovery-with-qualified-transition-applicab.trace.md` (same .topics path/index and target authority).
- Existing VS Code `Attach to Form` and Source/Parent qualification contract. No change to Evidence-v1 schema.

## Completion Signal

Sigma confirms a complete single video of Windows Replace/Build/Reload, file No/Yes deferred Attach, preview/cancel/create, artifact and PNG filenames and Handoff transport, or reports the exact first blocker. Anchor then evaluates only qualified findings; neither fabricated Windows PASS nor patch-only transport is permitted.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-40-3-3-complete-explorer-move-rebase-and-still-media-windows-acceptance.trace.md](001-40-3-3-complete-explorer-move-rebase-and-still-media-windows-acceptance.trace.md)
  - Value: TVNyJTR33emKF0OzyWa1iF_9MJyuFbFHNaQvA_q0moI

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: LSSUIW2yGnIYzgBHLmIrqIfzEQhQFX_Jznm0oHu2BVU