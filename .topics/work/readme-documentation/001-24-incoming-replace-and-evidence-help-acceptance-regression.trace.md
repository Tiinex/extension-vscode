# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.evidence.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/core/evidence/tiinex.evidence.v1.schema.md)
  - Created At: 2026-10-08 21:53:50
  - Authors: Anchor
  - Why: Preserve exact Windows observations, improve immediate responsiveness and keep Native material semantics separate.
  - Summary: Sigma reports 15s hidden Replace picker, intermittent Incoming refresh and missing Evidence help; bounded Core/VS Code correction.
  - Status: ready/local

---

# Incoming Replace Immediate Picker And Evidence Field Help Regression

## Supported Claim Or Question

- Supported Claim Or Question: Can Incoming Replace stop blocking 15 seconds before showing its Workspace selector, while maintaining exact Core comparison and giving genuinely useful Evidence field help?
- Evidence Role: direct Windows observations and local VS Code host correction with isolated behavior tests, awaiting installed Windows build/acceptance.
- Review Context: Sigma repeatedly clicked Replace because no chooser appeared for roughly 15 seconds; some Incoming receipts intermittently ask for Refresh; first Evidence field help says no human meaning/source, and files remain one Material field.

## Provenance

- Known Source: [Windows field-help screenshot](windows-form-help-media/20261008-evidence-field-help-unavailable.png) and [single Evidence Material screenshot](windows-form-help-media/20261008-evidence-material-single-field.png), direct Sigma text, host source `src/operatorTrees.ts`, `src/vscode/incomingWorkspacePicker.ts`, `src/core/artifactAuthoringModel.ts`, `src/artifactAuthoringPanel.ts` and exact Core source projection.
- Preservation Basis: exact screenshot bytes retained, source and tests carried in a qualified VS Code Workspace snapshot.
- Provenance Limits: 15-second latency is observed by Sigma, not independently benchmarked in Windows after the fix. Intermittent source drift lacks the exact file-size/time comparison logs at the point of failure.

## Evidence Material

- Material Kind: bounded VS Code UI correction and acceptance tests.
- Material: `mergeReplaceIncoming` previously awaited `packageDeltaView()` (comparing many Workspaces against their local repositories) **before** calling `showQuickPick`. The new host adapter creates/displays the Workspace QuickPick immediately. It resolves exact-byte comparison asynchronously to unselect only Core-qualified identical Workspaces, without overriding user-touched selection; cancellation safely disposes, and an unavailable comparison is stated explicitly while actual apply retains Core validation. A per-carrier host guard prevents concurrent repeated clicks. This is presentation scheduling only, not a new byte comparison algorithm.
- Screenshot Description: field help UX and intermittent source drift.
- Description: the model propagates Core's separately verified exact named `fieldRule` to each matched field and the webview shows it with exact schema/commit/field line; group-context prose remains labelled as such. `guardIncomingSource` logs the qualified and observed byte lengths and modification timestamps when a source changes, without bypassing the current integrity block. The earlier Auto Incoming requalification/retry remains in place; intermittent Refresh requests cannot be declared fixed without a new observed repro/log.
- Tests: five interactive picker mock checks PASS, actual Core CLI + VS Code model + generated Evidence HTML shows exact rules for claim, Evidence Role, Material and Material Kind; 74 TypeScript sources parse, `test/run.mjs` JS syntax PASS, `npm run release:audit` zero errors/warnings. Full VS Code build is not established in this host because npm dependencies are missing.

## Preservation And Fidelity

- Preservation State: one owner-scoped implementation candidate; source-reference provenance is supplied by Core not parsed by VS Code.
- Fidelity Notes: placeholder/default selection is a recommendation only; the user retains choice and Core retains apply authorization.
- Known Losses: no Windows seconds measurement or detailed intermittent source-change sequence, and Native individual-material schema is still an open owner task.

## Interpretation Limits

- Not Yet Used As: Windows Replace latency PASS, generic form release readiness, repeatable Evidence material semantics or source-change resolution.
- Does Not Prove: that initial quick-pick showing reduces Core comparison duration; the goal is immediate interaction and visible progress.
- Must Not Be Treated As: authorization to skip exact local Workspace byte qualification, silently accept a source changed after indexing or materialize per-file claims outside Native.
- Need For Review: Sigma Incoming → Replace → Build → Reload; time click-to-visible Workspace picker, change a selection while defaults are computing, apply through qualified Review. Inspect Evidence fields and source links; supply extension-host `Tiinex Incoming source drift at action` log if Refresh is still required. Retain per-file Evidence acceptance as a separate Native/Core gate.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: -sUdI-JOP9tUCUuWwFDa9fCC-5ige2_Hdz4bn2vcKGk