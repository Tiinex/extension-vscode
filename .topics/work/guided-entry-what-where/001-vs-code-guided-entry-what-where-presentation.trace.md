# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-10-05 21:10:09
  - Authors: Anchor; Sigma
  - Why: Dogfood the new Workspace-local work-area convention while implementing the bounded VS Code presentation layer over verified Core Target discovery.
  - Summary: Present Core WHAT and WHERE projections as sequential VS Code Guided Entry choices without host-owned Target semantics.
  - Status: ready/local

---

# VS Code Guided Entry What Where Presentation

## Objective

Present Core-owned Guided Entry composition in VS Code as an explicit human WHAT -> WHERE flow without duplicating Entry/Target semantics in the host.

## Done Criteria

- the first QuickPick presents Core-projected purpose Entry `modes` as `Guided Entry · What`
- after a WHAT selection, VS Code asks Core for compatible Target options and shows `Guided Entry · Where (optional)` only when at least one non-generic Target is discovered
- `Generic / no target` remains available and exact provider/host Target labels come only from Core projection data
- selected WHERE identity is passed back to Core through `--target-entry-id` for final transport rendering
- VS Code contains no hardcoded `ChatGPT Web` or OpenAI Target compatibility semantics
- the `projectWorkspaceCarrierEntry` wrapper preserves the pre-WHERE positional runner call shape while accepting the new optional Target identity
- real carried projection demonstrates Explore + ChatGPT Web composition through Core
- VS Code runtime bridge regression passes 147/147 and focused Core Entry/Target projection regression passes 16/16

## Scope

- VS Code host presentation/input and its thin Core wrapper only
- one pre-existing `.vscode/tasks.json` task-group mismatch may be corrected because it blocks the repository's own verification and the existing test already defines the intended build-task grouping
- no Target parsing, capability matching, provider-specific semantics, Entry migration, Work-tree migration, Process migration, remote mutation, or release/publish work

## Dependencies

- Core WHAT/WHERE Entry/Target discovery and composition from the current P1 Target Entry checkpoint
- `tiinex.entry.target.v1` and the current `interop-openai` ChatGPT Web Target Entry remain the semantic sources; this Task does not redefine them
- typed Process maintenance checkpoint remains the governing Process-quality baseline for any material Process changes, but this host presentation Task does not modify Process semantics

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: 3HmodjVCrGj59v_BFu_GDFDeRJq5F5rJTUnbxSh8gqI