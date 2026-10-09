# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-10-08 19:21:01
  - Trace: [004-vscode-file-attachment-and-form-presentation-acceptance.trace.md](004-vscode-file-attachment-and-form-presentation-acceptance.trace.md)
  - Origin:
    - [relative](004-vscode-file-attachment-and-form-presentation-acceptance.trace.md)
- Current
  - Current Schema: tiinex.evidence.v1
  - Created At: 2026-10-09 10:48:05
  - Authors: Anchor
  - Why: Detect and correct browser-visible form races internally before one comprehensive Sigma Windows acceptance.
  - Summary: Chromium replay of two independent Evidence-v1 material entries, true Core readback, and generic Preview/Create field freeze with source-owned host regression.
  - Status: ready/local

---

# Evidence-v1 Browser Authoring Busy-State And Two-Material Roundtrip

## Supported Claim Or Question

- Supported Claim Or Question: Can a Core-qualified Evidence-v1 form attach, preserve and preview two separate materials without letting an in-progress Preview/Create mutate the submitted state?
- Evidence Role: bounded regression evidence from the production webview's JavaScript in a real Chromium DOM and exact Core validation, not installed Windows acceptance.
- Review Context: Recent Evidence-v1 host corrections already retain separately attached material rows and Core-projected initial values. The browser-level replay found that Preview/Create previously disabled only primary action buttons; field controls stayed editable and Create hid the status row.

## Provenance

- Known Source: qualified latest Anchor-owned VS Code `src/artifactAuthoringPanel.ts`, its source-owned `test/run.mjs`, the current Docs/Native/Core `tiinex.evidence.v1` contract, Chromium/Playwright DOM interaction, and Core creation/validation/parse receipt.
- Preservation Basis: bounded production webview source delta and permanent regression in the carried VS Code Workspace; tests exercise the HTML/JS generated from Core-qualified bindings. The initial two-material browser payload was given to Core's real renderer, validated, and read back as separate entry values.
- Provenance Limits: Chromium simulates the webview host's message API and external file-attaching command; it does not verify Windows VS Code Explorer menus, installation, extension build, or provider-specific source path resolution.

## Evidence Material

- browser-two-material-flow
  - Material: [`src/artifactAuthoringPanel.ts`](../../../src/artifactAuthoringPanel.ts)
  - Material Kind: executable webview host implementation and Chromium DOM replay
  - Description: First source fills the empty Evidence material row. The next independent source creates a second row; both retain their separate references and descriptions. A later Preview submits both rows; Core seals, validates and parses the two distinct materials without collapsing their sources.
  - Material Provenance: Qualified live Evidence-v1 `named-declaration-section` receipt, actual generated HTML and Chromium message events.
  - Material Limits: the browser replay does not prove that Windows has installed a working extension or that the referenced source files have been copied or verified.
- preview-create-state-safety
  - Material: [`test/run.mjs`](../../../test/run.mjs)
  - Material Kind: permanent host regression and Chromium runtime behavior
  - Description: The new shared busy-state guard disables all editable controls during pending Preview/Create while preserving prior disabled state; late file-reference events cannot modify the pending form, and the `Creating…` progress text remains visible. Controls resume after the host returns status.
  - Material Provenance: Actual current webview function and 194/194 transpiled-runtime VS Code host tests under qualified local Core/Native source.
  - Material Limits: global TypeScript transpilation for this sandbox is not a full dependency-backed `tsc` compile. Installation and Windows final acceptance remain explicit.
- host-and-schema-cross-check
  - Material: Docs/Native schema source and Core v1 creation contract; browser submitted two independently named source records and Core validated both with exact descriptor fields.
  - Material Kind: cross-owner positive semantic qualification
  - Description: The host uses the qualified Core contract and preserves `Material`, `Material Kind`, `Description`, `Material Provenance`, and `Material Limits` per entry; no field meaning is duplicated or inferred in host code.
  - Material Provenance: exact v1 local schema and real Core creator and validator; earlier full Core suite 514 PASS with one skip.
  - Material Limits: synthetic browser asset references do not establish asset custody or move/rebase capability.

## Preservation And Fidelity

- Preservation State: source/test correction and this Evidence are present under one VS Code owner Workspace, with qualified Docs/Native/Core semantics unchanged and Move/Rebase excluded.
- Fidelity Notes: no prior material value may change merely because Preview/Create begins, and browser-generated two-entry records survive Core validation and field-level parse.
- Known Losses: no complete installed VS Code `tsc` build because `undici-types` cannot currently be fetched (`EAI_AGAIN`); no full Windows user acceptance or actual filesystem asset relocation.

## Interpretation Limits

- Does Not Prove: Windows platform acceptance, release readiness, remote schema publication, or CLI/LLM authoring parity.
- Not Yet Used As: a Sigma Windows PASS or an assertion that all UI races are solved.
- Must Not Be Treated As: host permission to synthesize user metadata, accept changes after Preview submission, bypass Core, or perform ordinary-file Move/Rebase in this Evidence branch.
- Need For Review: first install/build in Windows from the canonical qualified carrier; then test Attach to Form with two files, individually described per-material fields, Preview/Create, re-opened Evidence, a child Evidence, Handoff and Outgoing, including busy form feedback.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [004-vscode-file-attachment-and-form-presentation-acceptance.trace.md](004-vscode-file-attachment-and-form-presentation-acceptance.trace.md)
  - Value: uTAy3YDbOCW2ADJ0tUp3EYGgRqDLXTtyJ5oFEerORqg

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: PrPXoVVn2sucCyyud8FfGuXC01Cg8zoZ_AHbZ4xQeH8