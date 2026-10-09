# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-10-09 16:49:01
  - Trace: [001-40-3-3-complete-explorer-move-rebase-and-still-media-windows-acceptance.trace.md](001-40-3-3-complete-explorer-move-rebase-and-still-media-windows-acceptance.trace.md)
  - Origin:
    - [relative](001-40-3-3-complete-explorer-move-rebase-and-still-media-windows-acceptance.trace.md)
- Current
  - Current Schema: tiinex.evidence.v1
  - Created At: 2026-10-09 16:50:55
  - Authors: Anchor
  - Why: Provide bounded internal executable proof before asking Sigma to test Windows UX.
  - Summary: Real temp Workspace host and Core inspect/preview/Apply tests, regression receipts and cropped PNG media replacement.
  - Status: ready/local

---

# Explorer Move/Rebase And Attach To Form Transaction Verification

## Supported Claim Or Question

- Supported Claim Or Question: Does the previously missing VS Code Move/Rebase context-menu affordance now invoke the qualified Core plan/preview/Apply, and can a nonartifact file be relocated through Attach to Form without unreviewed file mutation?
- Evidence Role: bounded source-and-local-host integration evidence. A true installed Windows VS Code session remains to be accepted by Sigma.

## Provenance

- Known Source: current VS Code `src/vscode/lineageMaintenance.ts`, `lineageMaintenanceInventory.ts`, `attachFileToForm.ts`, `operatorTrees.ts`, `package.json`; exact current `@tiinex/core/node` projection, asset workspace inspection, journal Apply and test receipt.
- Preservation Basis: full 17-Workspace canonical Handoff carries changed source and tests byte-exact. Logs are attached below; screenshot replacement includes exact PNG SHA-256 and sizes.
- Provenance Limits: Node 22 CommonJS/ESM test harness executes actual source-transpiled host callbacks and real Core; it does not launch the Windows VS Code extension itself or cover every unseen proprietary file-reference encoding.

## Evidence Material

- explorer-artifact-move
  - Material: [`lineageMaintenance.integration.cjs`](../../../test/lineageMaintenance.integration.cjs) and [manual integration receipt](sigma-move-rebase-media-verification/001-lineage-host-manual-03.log)
  - Material Kind: executable host callback integration and Core real filesystem apply
  - Description: Real self-sealed `.trace.md` is Core-planned from `.topics/assets/` to `.topics/review/`; preview/confirm/Apply succeeds with self-integrity and the old path removed. Further cases exercise a real Prepend Parent-chain rewrite and Normalize Directory compaction. Unqualified Workspace fails closed. Explorer now exposes Core Move/Prepend/Normalize selection and a read-only Markdown preview; explicit confirmation required.
  - Material Provenance: actual Core Node API loaded from qualified checkout and host TypeScript transpiled in test VM.
  - Material Limits: the expanded callback test manually exercises Move, Prepend and Normalize with actual Core source and temporary files, while Core owns the negative/positive transactional semantics. Full Windows Explorer placement/UX not yet verified.
- binary-attach-to-form
  - Material: [manual integration receipt](sigma-move-rebase-media-verification/001-lineage-host-manual-03.log)
  - Material Kind: real Core asset inspect/transaction with fake VS Code event receiver
  - Description: Cancel produces no mutation; Yes asks for exact target dimension and Core relocates source into a noncolliding `001-1-1-<slug>-01.png`, preserving bytes. Only after ready Apply does `authoring-file-attached` receive a Markdown reference to the new path; cleanup leaves no transaction lock. Separate real Markdown reference test rebinds `../assets/source.png` into the same-folder `001-1-1-source-01.png` after relocation.
  - Material Provenance: Node 22, real Core inspector+durable Apply, no patched host metadata writer.
  - Material Limits: lineage dimension must be user-supplied before prospective artifact Create. No atomic create+asset transfer claimed. Unsupported or ambiguous source representations remain blocked.
- core-regressions
  - Material: [Core full suite](sigma-move-rebase-media-verification/001-core-regression-01.log)
  - Material Kind: executable regression log
  - Description: 552 PASS, 0 FAIL, 1 SKIP after export of existing Core asset inspector/transaction recovery through the Node public entry. Existing Core transaction tests include injected failure rollback, tampering, source drift, collisions and symlink rejection.
  - Material Provenance: actual Core source and qualified local Native/Business test roots.
  - Material Limits: one previously skipped Core test persists; this is not Windows acceptance.
- vscode-host-regressions
  - Material: [VS Code host regression](sigma-move-rebase-media-verification/001-vscode-host-regression-02.log)
  - Material Kind: transpiled-real-source host tests
  - Description: Existing 191 bridge tests plus standalone command/affordance assertions run without failure, including Core-authorized Attach to Form, new Explorer context menu and migrated presentation media. VS Code release audit and Docs/Native schema check pass independently.
  - Material Provenance: actual TypeScript host and extension JSON with locally composed Core runtime; no dependency-backed TypeScript build claimed.
  - Material Limits: installed Windows extension build/reload must be Sigma's first gate.
- cropped-still-media
  - Material: [Tiinex overview](../../presentation/vscode-extension/readme/01-tiinex-overview.png) and [Guided Entry context](../../presentation/vscode-extension/readme/02-guided-entry-what-where.png)
  - Material Kind: cropped PNG stills replacing previous presentation GIFs
  - Description: Former GIF bytes 10,854,479 and 43,524,156 were removed; new stills are 207,557 and 155,171 bytes (total 362,728 bytes versus 54,378,635 previous bytes). PNG SHA-256 are `78add1b82b172220218409ae19b3b581a544dcd9ccc12bf1f278ad0980ea4633` and `a83f7b8862a4084c3e3d2b61defc54491b334c448d2a87949201d2d5772a14a1`.
  - Material Provenance: original GIF visual frames converted, cropped and PNG-optimized in the current Workspace; no Git LFS or historical Git rewrite.
  - Material Limits: loss of animation/time context is deliberate; original historical Task instructions still mention GIF filenames and are superseded by this more economical presentation convention.

## Preservation And Fidelity

- Preservation State: source, exact attached logs, two cropped PNGs and Core regression qualification preserved in the canonical 17-Workspace carrier; source GIF binaries omitted.
- Fidelity Notes: no host copy of Core lineage/asset filename allocator. Material relocation retains original bytes and the tested source Markdown reference is correctly rebound. No remote or Git mutation.
- Known Losses: animation motion/timing intentionally discarded, Windows GUI experience still pending, and proprietary/binary embedded reference formats unsupported.

## Interpretation Limits

- Does Not Prove: installed Windows build PASS, automatic lineage allocation from incomplete artifact form, all arbitrary filename or asset metadata formats, or Git history shrinking.
- Not Yet Used As: Sigma final acceptance or production release approval.
- Must Not Be Treated As: permission to bypass Core preview/qualification, rewrite git history or reinterpret old historical GIF-capture Tasks as a current delivery requirement.
- Need For Review: Windows first-build, right-click Move/Rebase modes, No/Yes Attach to Form with deliberate explicit coordinate, reference fidelity/reopened Evidence, blocked Parent recovery and Outgoing carrier.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-40-3-3-complete-explorer-move-rebase-and-still-media-windows-acceptance.trace.md](001-40-3-3-complete-explorer-move-rebase-and-still-media-windows-acceptance.trace.md)
  - Value: TVNyJTR33emKF0OzyWa1iF_9MJyuFbFHNaQvA_q0moI

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: RmyAcKq_gDAhOHHkOlDdmoA6MHoKC_As9vCNu8Glqek