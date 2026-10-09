# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: tiinex.evidence.v1
  - Created At: 2026-10-09 09:51:32
  - Authors: Anchor
  - Why: Protect real Evidence-v1 per-material fidelity and avoid making Sigma discover preventable host UX data loss.
  - Summary: Qualified repeatable Evidence Material receives subsequent files in independent rows without overwriting prior sources or inferred metadata.
  - Status: ready/local

---

# VS Code Evidence-v1 Attach to Form Per-Material Preservation Regression

## Supported Claim Or Question

- Supported Claim Or Question: Does Attach to Form preserve independent Evidence-v1 material entries when multiple files are attached to a single form rather than overwrite the first reference or silently discard a later source?
- Evidence Role: bounded source correction and executable host-webview behavior verification; does not assert installed Windows acceptance.
- Review Context: The qualified pre-launch Evidence-v1 schema has repeated named `Evidence Material` declarations. The existing host event used an empty input or the first input in the chosen section, so an occupied repeated Material could be overwritten by the next file attachment.

## Provenance

- Known Source: carried and qualified `src/artifactAuthoringPanel.ts`, source-owned `test/run.mjs`, exact Native Evidence-v1 creation binding and local Core schema receipts.
- Preservation Basis: exact VS Code source plus test files included in this Tiinex carrier; existing local Core test suite and Docs/Native schemas are packaged unchanged.
- Provenance Limits: the webview message handler was exercised as executable JavaScript with a simulated DOM. Windows Explorer menu and actual Webview runtime are pending one combined Sigma Windows session.

## Evidence Material

- previously-occupied-source
  - Material: [`artifactAuthoringPanel.ts`](../../../src/artifactAuthoringPanel.ts)
  - Material Kind: host source correction
  - Description: A new qualifying file is inserted into an empty repeated material entry; when no empty entry remains, the page inserts one new named-declaration row instead of replacing the first material's previously entered reference, description, provenance or limits.
  - Material Provenance: direct host webview event helper `attachQualifiedReference` and generic repeated-entry wiring.
  - Material Limits: no file relocation or provenance claims are inferred from the reference itself; required Entry name, Material Kind and Description remain intentionally human-supplied.
- repeated-entry-negative-tests
  - Material: [`test/run.mjs`](../../../test/run.mjs)
  - Material Kind: executable host regression
  - Description: Runs the production webview event helper under a stub DOM for empty first slot, occupied slot and multiple occupied slots; verifies that non-Core-qualified fields and attachments during Preview/Create do not mutate the form.
  - Material Provenance: dedicated runnable test in the existing VS Code test runner, independently executed under Node during this batch.
  - Material Limits: no real VS Code installed extension build has been executed in the current Linux container.
- core-schema-consistency
  - Material: Official Core test result and `schemas-check`: 514 PASS, 0 FAIL, 1 SKIP; Docs/Native schema synchronization ready with zero findings.
  - Material Kind: source-bound regression and qualification outcome
  - Description: Core's actual Evidence-v1 `named-declaration-section` remains unchanged, with separately required Material, Material Kind, Description and optional per-entry provenance, limits and representation.
  - Material Provenance: tests executed against the qualified Native and Business content roots carried by the preceding Anchor-to-Anchor package.
  - Material Limits: local Core verification is not Windows Sigma acceptance; Native's unrelated historical Process topology failure remains a separate owner issue.

## Preservation And Fidelity

- Preservation State: bounded VS Code source and permanent tests in the carried Workspace, without modifying published or qualified schema files.
- Fidelity Notes: references are never turned into invented semantic claims; existing values are preserved when a new independent material is attached; Core still owns final validation.
- Known Losses: complete dependency-backed VS Code TypeScript build, installed Windows editor interaction and manual reopening of saved Evidence material entries remain to be checked.

## Interpretation Limits

- Does Not Prove: release readiness, full Windows stability, successful asset relocation, or automatic per-entry provenance verification.
- Not Yet Used As: Sigma final acceptance or a general Move/Rebase implementation.
- Must Not Be Treated As: permission to split one coherent video/transcript bundle automatically, invent material metadata, or move physical files into lineage by host event.
- Need For Review: after normal Incoming Replace, local Build/Reload and real Windows Explorer Attach to Form, verify first and second material rows retain their distinct source references and user-entered details across Preview/Create/reopen; ensure the same receiving form still rejects unqualified external file movement.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: 184h1Pz55yzCbGxkuvtb-pn_PT738CO7JfUG6HF2U44