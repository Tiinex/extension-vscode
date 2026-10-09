# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-10-09 17:18:58
  - Trace: [001-40-3-3-3-sigma-automatic-lineage-and-atomic-attachment-create-windows-acc.trace.md](001-40-3-3-3-sigma-automatic-lineage-and-atomic-attachment-create-windows-acc.trace.md)
  - Origin:
    - [relative](001-40-3-3-3-sigma-automatic-lineage-and-atomic-attachment-create-windows-acc.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-10-09 17:37:34
  - Authors: Anchor
  - Why: Prevent the human Sigma acceptance from becoming a live TypeScript debugger after Incoming.
  - Summary: Resolve six observed Windows TypeScript picker errors in VS Code while preserving Core Move/Rebase and deferring Sigma build acceptance.
  - Status: ready/local

---

# Close Windows Move-Rebase QuickPick Type Compilation Blocker

## Objective

Fix the first true Windows `npm run dev:build:local` blocker reported by Sigma before exposing further tests. Preserve Core Move/Rebase and atomic Attach to Form, but stop describing a host transpilation test as a real VS Code TypeScript build. Once corrected, carry a normal Tiinex Anchor → Sigma Handoff for one bounded Windows rerun.

## Done Criteria

- Source ownership is `vscode/src/vscode/lineageMaintenance.ts`, not Native/Core or a new schema. The exact Windows first error is `TS2769` at lines 66–68: `showQuickPick` infers an invalid `QuickPickItemKind` from string-valued `kind` fields; the returned selection is then inferred as a `string[]`, causing three `TS2339` accesses to `.kind` or `.label`. Six compiler errors total appear in the screen recording.
- Replace only the host operation choice metadata with a *separate* discriminant typed as `'move' | 'prepend' | 'normalize-directory'`; call `showQuickPick` using a real `vscode.QuickPickItem`-compatible generic; preserve the Core operation `kind` values when constructing a request. Do not mask the compiler with `as any` or remove the branch.
- Update source-owned host tests to actually select each operation via the newly typed discriminator. Add a semantic TypeScript overload regression fixture that models the VS Code `QuickPickItem.kind` property and checks the actual picker source. Exercise actual Core plan/apply on disposable filesystem fixtures.
- Re-run the full transpiled host regression and release audit. The locally installed environment has no `@types/vscode`, `@types/node` and project TypeScript packages; network-dependent `npm ci` is not supported. **Do not assert the full dependency-backed Windows `tsc` passes here.** A subsequent Windows `dev:build:local` is still the first Sigma gate; stop and report any next compiler failure before functional tests.
- Preserve the previous qualified automatic lineage + atomic Evidence/PNG Attach to Form behavior, qualified Transition forms, Move/Rebase Core semantics, PNG media policy and standard Handoff/Incoming/Outgoing.

## Scope

One TypeScript host binding correction at the Move/Rebase operation picker, tests, documentation/evidence and the formal rerun transport. No schema changes, no dimension moves, no asset migration, no Git history rewrite and no unrelated host behavior changes.

## Dependencies

- Parent Sigma Task `001-40-3-3-3-sigma-automatic-lineage-and-atomic-attachment-create-windows-acc.trace.md`.
- Prior qualified 17-Workspace Anchor → Sigma atomic attachment carrier and `001-40-3-3-3-1-sigma-automatic-lineage-and-atomic-file-attachment-windows-accep.trace.md`.
- Core Move/Rebase owner Task `core::.topics/work/001-deterministic-lineage-maintenance-projection-and-apply-task.trace.md`.
- Core atomic attachment Evidence `core::.topics/work/topics-discovery/001-4-atomic-core-artifact-and-ordinary-attachment-creation-verificati.trace.md`.

## Completion Signal

Anchored and cold-grounded Sigma package containing the corrected source, current host/TypeScript regression evidence and the prior complete acceptance protocol. Windows Sigma starts with one clean linked dependency build; only after PASS does it proceed to Evidence Attach, Move/Rebase, Save as Transition and transport tests.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-40-3-3-3-sigma-automatic-lineage-and-atomic-attachment-create-windows-acc.trace.md](001-40-3-3-3-sigma-automatic-lineage-and-atomic-attachment-create-windows-acc.trace.md)
  - Value: LSSUIW2yGnIYzgBHLmIrqIfzEQhQFX_Jznm0oHu2BVU

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: 2kwxQLXkGg-IfNNeMVV1yIU5rvtZjVAIcJ9mSZmX1FE