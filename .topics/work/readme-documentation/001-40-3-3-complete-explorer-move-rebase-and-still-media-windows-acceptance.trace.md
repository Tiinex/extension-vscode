# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-10-09 13:15:24
  - Trace: [001-40-3-anchor-dual-fork-convergence-and-owner-gated-continuation.trace.md](001-40-3-anchor-dual-fork-convergence-and-owner-gated-continuation.trace.md)
  - Origin:
    - [relative](001-40-3-anchor-dual-fork-convergence-and-owner-gated-continuation.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-10-09 16:49:01
  - Authors: Anchor
  - Why: Remove missing context commands and dead-end file relocation UX while limiting media growth.
  - Summary: Expose qualified Core move/relocation in Explorer and Attach to Form, replace GIF with still PNG, and test before Sigma.
  - Status: ready/local

---

# Complete Explorer Move/Rebase And Still Media Windows Acceptance

## Objective

Close the user-observed gap where Core Move/Rebase and asset relocation existed but VS Code exposed no Explorer command, while Attach to Form offered a misleading Yes option that could only block. Keep the user's chosen no-Git-LFS, cropped-static-image presentation policy and do not use animated GIFs for current `.topics` README media.

## Done Criteria

- VS Code Explorer submenu contains `Tiinex: Move/Rebase Artifact` on `.trace.md` files; `Attach to Form` remains available on files, not folders.
- Explorer action binds only an unambiguous qualified local Workspace, asks which Core operation to project (Move, Prepend or Normalize Directory), shows a Markdown plan including byte/path/Parent effects, requires explicit Apply confirmation, and reports Core errors. The Core plan governs exact source integrity, collision checks, journal, lock and recovery; no host-owned filename/Parent serializer.
- Attach to Form's ordinary-file relocation Yes path requests an exact numeric lineage coordinate because the prospective artifact does not yet have an allocated filename. It uses Core's complete Workspace asset/reference inspection, preview and durable Apply before sending the new file reference to the form; No preserves the old file and attaches its existing reference.
- **Known limitation:** the explicit coordinate is not automatically allocated from the incomplete form's future Create; full Create+Relocate atomicity remains a separate qualified Core/host improvement. Do not claim it.
- Invalid Workspace/unsafe paths, symlinks, unqualified .trace.md inventory, unsupported text references, source drift, target collisions, stale plans and missing approvals fail closed. No arbitrary-binary metadata rewrite.
- Parent-unqualified artifact handling offers a human-readable route to choose a qualified Parent via the directory instead of only emitting a machine error.
- Remove large presentation GIF binaries from `.topics/presentation/vscode-extension/readme`, replace with carefully cropped still PNGs. No Git LFS or rewritten Git history. Preserve historical Tiinex Task trace references as past capture instructions, but don't claim their old GIF links remain available; newer presentation/retained evidence must point to PNGs.
- Test the generated TypeScript module callbacks and real Core Node ESM binding in a temporary Workspace; verify user cancel is nonmutating, Core move and ordinary-file apply use exact source bytes, markdown links rewrite, lock cleanup, and wrong Workspace blocks. Run full Core regression, VS Code host regression, schema-check, Interop and release audit. Real Windows extension activation and true npm-backed full `tsc` build remain Sigma's first gate.

## Scope

VS Code host affordance and small Core Node-export completion, Evidence-v1 reference attachment, presentation media hygiene. No new v2 schema, no Move/Rebase rule invented in VS Code, no mass historical schema/task rewriting, no Git LFS setup and no repository-wide history rewrite.

## Dependencies

- Core qualified Move/Rebase/asset projection and transaction apply within `core::.topics/work/001-deterministic-lineage-maintenance-projection-and-apply-task.trace.md`.
- `vscode::.topics/work/authoring-experience/004-vscode-file-attachment-and-form-presentation-acceptance.trace.md` and previous Sigma Transition authoring Windows task.
- Source-owned `@tiinex/core/node` is required for exact Node inspector and apply; the host must not fall back to host-semantic mutation when Core is unavailable.

## Completion Signal

A single Anchor → Sigma carrier that is cold `grounded-to-act`, with accessible artifact and ordinary-file contexts, two cropped PNGs rather than GIFs, test receipts, explicit Windows build stop and a bounded acceptance video path. Sigma creates disposable examples and can discard them without sending all ZIPs back to Anchor.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-40-3-anchor-dual-fork-convergence-and-owner-gated-continuation.trace.md](001-40-3-anchor-dual-fork-convergence-and-owner-gated-continuation.trace.md)
  - Value: c9K9o9f1xd-hwbnqWOT110tTOVJc095E-83pBwoYvKg

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: TVNyJTR33emKF0OzyWa1iF_9MJyuFbFHNaQvA_q0moI