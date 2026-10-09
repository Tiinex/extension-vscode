# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-10-08 19:21:01
  - Trace: [004-vscode-file-attachment-and-form-presentation-acceptance.trace.md](004-vscode-file-attachment-and-form-presentation-acceptance.trace.md)
  - Origin:
    - [relative](004-vscode-file-attachment-and-form-presentation-acceptance.trace.md)
- Current
  - Current Schema: [tiinex.evidence.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/core/evidence/tiinex.evidence.v1.schema.md)
  - Created At: 2026-10-08 21:22:29
  - Authors: Anchor
  - Why: Make schema help genuinely grounded while preserving operator UX and Native/Core ownership.
  - Summary: Core-qualified source line/provenance help in existing single-page Evidence/Handoff forms, locally tested and Windows pending.
  - Status: ready/local

---

# VS Code Source-Grounded Field Help Acceptance Candidate

## Supported Claim Or Question

- Supported Claim Or Question: Does VS Code consume the exact new `form-field-help` Core/CLI operation in its existing single-page authoring flow without duplicating schema authority or blocking a valid form on an older Core runtime?
- Evidence Role: locally exercised VS Code UI candidate awaiting Sigma's installed Windows acceptance.
- Review Context: existing Attach to Form and Quick/Full host UI are already present but Windows-complete form acceptance remains open. Preserve right-click placement, existing parent, optional Preview, and no mandatory wizard.

## Provenance

- Known Source: modified VS Code `src/tiinex/bootstrap.ts`, `src/authoring.ts`, `src/core/artifactAuthoringModel.ts`, `src/artifactAuthoringPanel.ts`, and `test/run.mjs`, plus the exact Core form-field-help operation.
- Preservation Basis: changed VS Code source, behavior regression source and this Evidence travel in the canonical Handoff Package, not as a detached Git patch.
- Provenance Limits: dynamic webview behavior was checked with the generated HTML and TypeScript transpilation in an isolated host mock. A full local VS Code typecheck is not claimed; npm packages were not fully available in this runtime.

## Evidence Material

- Material Kind: bounded VS Code source, locally tested form presentation, and regressions.
- Material: `loadArtifactAuthoringModel` requests Core contract, guide and `form-field-help` concurrently from the same qualified runtime, falling back to base model if help is unavailable on older Core. The host model binds source only for an exact schema, group, input, field and line match. `? Field help` displays schema repository, commit, group, line and bounded excerpt, explicitly called group-level context. Exact external link only for valid `Tiinex/*` repository, 40-hex commit and `.topics/.schemas` path. Unknown provenance is explicitly unavailable. Isolated behavior mocks PASS for exact Evidence Material, missing Material Kind, cross-schema mismatch, rendered HTML and script syntax. Changed TypeScript files parse without errors, `npm run release:audit` reports ready with zero errors/warnings. Full local extension build unavailable due incomplete npm dependencies; Sigma Windows acceptance remains required.

## Preservation And Fidelity

- Preservation State: source/test/Evidence carried in qualified VS Code Workspace snapshot.
- Fidelity Notes: no `operatorTrees.ts` domain logic added and no new host-level schema prose parser. UI shows exact provenance only when Core actually returned it.
- Known Losses: npm `ci --offline` lacked cached `undici-types`; online `npm ci` did not finish within the execution window. Therefore full Windows build and real field interaction remain pending Sigma verification.

## Interpretation Limits

- Not Yet Used As: Windows acceptance, full Forms V1 implementation or Editor release authorization.
- Does Not Prove: Native `.forms` profile schema is creatable/discoverable or Evidence supports individually described files.
- Must Not Be Treated As: a Quick Form profile discovery implementation or permission to ignore required Core creation fields.
- Need For Review: Windows Incoming → Replace → `npm run dev:build:local` → Reload, open Evidence and Handoff using ordinary right-click context; inspect Field help for Material and a distinct field, verify exact source and no false field-specific claims, then Preview/Create/reopen an artifact. Report any exact build or UI error. Retain user-confirmed Incoming/Outgoing transport success unless new evidence contradicts it.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [004-vscode-file-attachment-and-form-presentation-acceptance.trace.md](004-vscode-file-attachment-and-form-presentation-acceptance.trace.md)
  - Value: uTAy3YDbOCW2ADJ0tUp3EYGgRqDLXTtyJ5oFEerORqg

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: 3U51s92oKvfcN-ibcBqTJ6hbPgrDg8gWeFtsjyiLv74