# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-10-07 19:53:23
  - Trace: [001-vs-code-readme-and-documentation-consolidation.trace.md](001-vs-code-readme-and-documentation-consolidation.trace.md)
  - Origin:
    - [relative](001-vs-code-readme-and-documentation-consolidation.trace.md)
- Current
  - Current Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-10-09 10:50:42
  - Authors: Anchor
  - Why: Deliver bounded broad Sigma acceptance after 194 host tests, 514 Core passes and actual Chromium-to-Core roundtrip.
  - Summary: Single Windows gate for qualified Evidence-v1 multiple materials, Preview/Create busy state, lineage and Handoff carrier; host tests and full Core regression already passed.
  - Status: ready/local

---

# Sigma Evidence-v1 Two-Material Windows Acceptance

## Handoff Parties

- Purpose: Deliver one owner-qualified Evidence-v1 Windows acceptance candidate after an internal Chromium production-webview replay, real Core two-material creation/validation/readback, 194 VS Code host tests, 514 Core regression passes, and canonical 17-Workspace transport. The user requested one broad Sigma gate, not repeated individual debugging rounds.
- From: Anchor
- From Kind: role
- From Reference: [Anchor](business::.topics/roles/001-1-1-1-1-1-anchor-canonical-holder-cutover-role.trace.md)
- To: Sigma
- To Kind: role
- To Reference: [Sigma](business::.topics/roles/001-4-1-1-sigma-role-canonical-assignment-modes-qualification-continuation.trace.md)

## Transfers

- install-and-build-first
  - Transfer Kind: work
  - Description: In Windows use normal Incoming → qualified Workspace mapping → Replace. Execute the local linked-extension build and Reload Window before interacting with Evidence. If TypeScript compilation or extension activation fails, STOP the acceptance session and report the exact error; do not treat Linux transpilation as a genuine build. npm registry in the Anchor container returned EAI_AGAIN for missing `undici-types@6.20.0`, so the full dependency-backed Windows build remains intentionally open.
  - Controlling Artifact: [VS Code README And Documentation Consolidation](001-vs-code-readme-and-documentation-consolidation.trace.md)
  - Boundary: binary build and Windows host gate, not an instruction to apply git patches or bypass Tiinex Incoming/Replace

- evidence-two-independent-materials
  - Transfer Kind: work
  - Description: If build and Reload pass, right-click an eligible file/parent → New Artifact → Evidence. Use one Evidence claim with two independent Material entries. For the first source use Attach to Form to attach a file and supply Entry name, Material Kind, Description; for the second attach another file while the first material row is already occupied, and give it a different Entry name, Kind and Description. Confirm each reference remains in its own row with distinct notes/provenance/limits, use Preview, then Create and reopen the Markdown. Both entries and their exact fields must survive. Repeat with a Core-projected preset/initial value if the UI exposes such a route. Try Add and Remove on a disposable third material; do not infer meaning from a file extension.
  - Controlling Artifact: [VS Code README And Documentation Consolidation](001-vs-code-readme-and-documentation-consolidation.trace.md)
  - Boundary: the form attaches references only and does not perform asset Move/Rebase, which belongs to a different branch

- preview-create-lineage-and-transport
  - Transfer Kind: work
  - Description: During Preview/Create confirm that all form controls are disabled, late Attach to Form cannot mutate the submission, status `Creating…` remains visible and controls recover after a result. Create an Evidence B under newly created Evidence A and verify carrier-lineage Parent semantics. Create a Handoff under Evidence B, then create an Outgoing Handoff Package via the normal qualified workflow, with Start and Handoff Pointer. Verify resulting artifact fields and canonical `tiinex-<dimension>-<from>-to-<to>.handoff-package.zip` basename. Sigma may discard its test files and carriers; a silent Windows screen recording plus exact error or PASS receipt is sufficient.
  - Controlling Artifact: [VS Code README And Documentation Consolidation](001-vs-code-readme-and-documentation-consolidation.trace.md)
  - Boundary: acceptance covers observed host behavior only; it neither approves Move/Rebase nor establishes CLI/LLM Native Surface parity from the separate fork

## Required Context

- browser-core-cross-owner-evidence
  - Material: real Chromium production-webview replay, two-material exact Core Markdown/validation/readback, Preview/Create race correction and permanent VS Code test
  - Material Reference: [Evidence-v1 Browser Authoring Busy-State And Two-Material Roundtrip](../authoring-experience/004-4-evidence-v1-browser-authoring-busy-state-and-two-material-roundt.trace.md)
  - Purpose: do not waste Sigma time re-debugging a race already caught internally; verify it in the actual Windows extension instead
  - Availability: available

- source-qualified-evidence-v1
  - Material: existing Docs/Native Evidence-v1 schema, individual Material fields and Core ownership
  - Material Reference: [Native Evidence-v1 Multi-Material Schema Qualification](docs::.topics/work/evidence-material-v1/001-native-evidence-v1-multi-material-schema-qualification.trace.md)
  - Purpose: Native semantics are v1 until release; existing Validator-v2 is the separate permitted exception
  - Availability: available

- core-material-roundtrip
  - Material: real multi-material Core creation/validation and exact source schema identity
  - Material Reference: [Core Evidence-v1 Real Multi-Material Roundtrip And Source Qualification](core::.topics/work/evidence-material-entry-model/002-core-evidence-v1-real-multi-material-roundtrip-and-source-qualif.trace.md)
  - Purpose: preserve one claim with independently described materials rather than semicolon-flattened references
  - Availability: available

- producer-test-currentness
  - Material: Core bootstrap Producer version expectation grounded to exact executing manifest, with no runtime version mutation
  - Material Reference: [Core Bootstrap Producer Version Test Currentness](core::.topics/work/evidence-material-entry-model/003-core-bootstrap-producer-version-test-currentness.trace.md)
  - Purpose: keep 514/0/1 full Core result meaningful without hiding source/test drift
  - Availability: available

## Reference Context

- retained-prior-attachment-fixes
  - Material: prior correct Attach to Form no-overwrite, repeated Core initial value restoration, canonical ChatGPT package filename guard
  - Material Reference: [Anchor ChatGPT Carrier Filename Discipline And Evidence-v1 Continuation](001-37-anchor-chatgpt-carrier-filename-discipline-and-evidence-v1-conti.trace.md)
  - Purpose: user expects normal Tiinex packages, not detached patches or short-name ZIP aliases
  - Availability: available

- native-ux-owner-task
  - Material: existing qualified VS Code attachment/presentation task
  - Material Reference: [VS Code Form Attachment And Presentation Acceptance](../authoring-experience/004-vscode-file-attachment-and-form-presentation-acceptance.trace.md)
  - Purpose: one shared generic source-bound Form architecture
  - Availability: available

## Retained Responsibilities

- post-sigma-disposition
  - Retained By: Anchor
  - Responsibility: receive Sigma PASS/FAIL, preserve exact unsuccessful source/step if blocked and apply bounded correction through owner workspaces; do not reinterpret a failed Windows build as an Evidence schema failure; the separate CLI/LLM Native Surface fork owns portable authoring parity
  - Boundary: no automatic release authorization from local browser/Core checks or one successful Windows Create

## Exclusions And Dependencies

- separate-branch-and-compatibility-boundaries
  - Kind: excluded-scope
  - Description: No Move/Rebase, no asset relocation, no CLI/LLM native authoring parity implementation, no Evidence-v2, no invented GitHub schema permalink, no host-owned validation, no hidden patch transport, no retained disposable Sigma test ZIP obligation. Do not silently rewrite or split semantic Evidence materials.
  - Responsible Party Or Role: Anchor

## Completion Expectation

- Signal Kind: disposition
- Signal Meaning: Return a single Sigma Windows result with explicit Build status and evidence material results: Incoming/Replace, two independent material references/metadata, Preview/Create busy behavior, reopened Markdown, Evidence A → Evidence B, Handoff and Outgoing canonical carrier. Prefer one silent video; only request exact failing artifacts if screenshot/video and error are insufficient.
- Return To: Anchor
- Return To Reference: [Anchor](business::.topics/roles/001-1-1-1-1-1-anchor-canonical-holder-cutover-role.trace.md)

## Interpretation Limits

- Does Not Mean: Windows acceptance is already complete, the user should debug manually, or any separate fork's Native Surface API has reached parity.
- Must Not Be Used To Claim: full extension TypeScript build PASS before Windows test, no skipped Core tests, remote Docs publication or production launch approval.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-vs-code-readme-and-documentation-consolidation.trace.md](001-vs-code-readme-and-documentation-consolidation.trace.md)
  - Value: P9l0JbWGxC5NqesjDRJwSr-zcOGkm_B44j4pS9wffdI

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: gVDCI2SrZgZYBFf9pqIxtLIYG49jYfGkINKRETGN-oc