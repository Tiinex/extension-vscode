# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-10-09 17:37:34
  - Trace: [001-40-3-3-3-2-close-windows-move-rebase-quickpick-type-compilation-blocker.trace.md](001-40-3-3-3-2-close-windows-move-rebase-quickpick-type-compilation-blocker.trace.md)
  - Origin:
    - [relative](001-40-3-3-3-2-close-windows-move-rebase-quickpick-type-compilation-blocker.trace.md)
- Current
  - Current Schema: tiinex.evidence.v1
  - Created At: 2026-10-09 17:37:50
  - Authors: Anchor
  - Why: Ground and preserve the first real Sigma compile failure and the corrected exact host source.
  - Summary: Cropped silent Windows build evidence, source-owned QuickPick typing fix and actual Core Explorer regression with no claimed Windows rebuild PASS.
  - Status: ready/local

---

# Windows QuickPick Type Regression And Host Source Correction

## Supported Claim Or Question

- Supported Claim Or Question: What blocked the first Windows Sigma build after a qualified Incoming, and does the narrowly corrected Move/Rebase picker remain semantically compatible with VS Code's QuickPick typing and Core plan/apply operations?
- Evidence Role: Windows-observed build blocker with source-owned focused regression and internal post-fix host test receipt; NOT a passed Windows rebuild.
- Review Context: operator-provided silent `20261009-1724-38.2804460.mp4` (201.1 seconds) shows the newly downloaded carrier qualifying in Incoming and Markdown Handoff opening, then VS Code local build error at ~02:55–03:20 before any functional Sigma acceptance.

## Provenance

- Known Source: two small crops from the original silent Windows video showing the real TypeScript compiler output; `src/vscode/lineageMaintenance.ts` correction; `test/lineageMaintenance.integration.cjs` and new `test/lineageMaintenanceTypeContract.test.cjs`; actual Node Core filesystem plan/apply receipts and full host test receipt.
- Preservation Basis: cropped still frames and test receipts preserved in this owner Workspace; the 100 MB original video is not embedded in `.topics` or carrier to avoid unnecessary Git/media growth.
- Provenance Limits: the locally qualified Core and host tree were used. No full dependency-backed `tsc` because the build dependencies and VS Code types were not locally installed and npm registry name resolution is unavailable. The Windows build is Sigma's first unresolved acceptance gate.

## Evidence Material

- windows-ts2769
  - Material: [Actual Windows compiler output around 03:10](windows-quickpick-build-media/001-windows-quickpick-tsc-190-01.jpg)
  - Material Kind: cropped source video frame (JPEG)
  - Description: Real Windows `npm run dev:build:local` fails in `lineageMaintenance.ts`: string-valued QuickPick `kind` items conflict with `vscode.QuickPickItemKind`, followed by selection properties inferred on `string[]` (`TS2339`).
  - Material Provenance: exact frame region from user's original silent screen recording, with timestamp retained in filename.
  - Material Limits: one still frame, not an independent complete build log.
- windows-first-error
  - Material: [First TS2769 and reserved VS Code item kind](windows-quickpick-build-media/001-windows-quickpick-tsc-195-01.jpg)
  - Material Kind: cropped source video frame (JPEG)
  - Description: Error message states `Type 'string' is not assignable to type 'QuickPickItemKind | undefined'` for the source's `kind: 'move'` option; other options produce the same conflict.
  - Material Provenance: original same Windows video.
  - Material Limits: does not establish the entire Windows error inventory beyond the visible six-count Problems pane.
- source-owned-fix
  - Material: `src/vscode/lineageMaintenance.ts` and `test/lineageMaintenanceTypeContract.test.cjs`.
  - Material Kind: source code and semantic TypeScript contract test
  - Description: operation choices are now explicitly `OperationChoice extends vscode.QuickPickItem` with a separate `operation` discriminant and `showQuickPick<OperationChoice>`. A standalone TypeScript program models the real VS Code reserved `kind` field and checks the extracted source picker with zero type errors, including typed `.operation` and `.label` access.
  - Material Provenance: current VS Code owner Workspace; local TypeScript compiler API from Node 22 host.
  - Material Limits: targeted VS Code type model, not complete installed TypeScript packages or full `tsc`.
- host-regression
  - Material: [Merged host regression receipt](windows-quickpick-build-media/001-vscode-bridge-regression-02.log) and [Release audit receipt](windows-quickpick-build-media/001-vscode-release-audit-03.log)
  - Material Kind: actual source-owned JavaScript tests and host release audit
  - Description: 191/191 VS Code bridge cases, source transpile of 82 TypeScript files with no syntax errors, Move/Prepend/Normalize with actual Core filesystem mutation, negative Workspace block, deferred attachments and atomic Create/rollback host tests. Release audit returns `ready` with zero errors/warnings.
  - Material Provenance: temporary transpilation and local Core dependency binding; no source schema mutation.
  - Material Limits: still does not replace a Windows dependency-backed TS compilation and extension activation.

## Preservation And Fidelity

- Preservation State: actual corrected VS Code source, source-owned tests, small screenshots and textual receipts in canonical full transport.
- Fidelity Notes: Core operation payload retains the same `kind` values; only the host UI selection's discriminator changes. The media are cropped still images and no new GIF/LFS dependency is introduced.
- Known Losses: no full source video inside carrier; Windows `tsc` and post-Reload extension-host functional results require Sigma rerun.

## Interpretation Limits

- Does Not Prove: Windows build passed or all Move/Rebase and file attachment UX passed in installed extension.
- Not Yet Used As: final Sigma acceptance.
- Must Not Be Treated As: authority to bypass the types, weaken Core validation or create a host-owned Move/Rebase engine.
- Need For Review: rerun Windows Build first. If another error appears, stop at exact first error; Anchor will fix it before resuming full Sigma tests. Once Build passes, use the existing atomic attachment and Move/Rebase acceptance Task, not new test improvisation.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-40-3-3-3-2-close-windows-move-rebase-quickpick-type-compilation-blocker.trace.md](001-40-3-3-3-2-close-windows-move-rebase-quickpick-type-compilation-blocker.trace.md)
  - Value: 2kwxQLXkGg-IfNNeMVV1yIU5rvtZjVAIcJ9mSZmX1FE

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: is4dpEnY4LyUJPUvokXXpGNJFCgwaSP4UsngZuEKoGM