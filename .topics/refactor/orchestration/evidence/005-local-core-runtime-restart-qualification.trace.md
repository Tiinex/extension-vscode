# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-20 16:25:38
  - Trace: [001-4-2-sigma-live-gate-correction-qualified-participants-multi-handoff.trace.md](../001-4-2-sigma-live-gate-correction-qualified-participants-multi-handoff.trace.md)
  - Origin:
    - [relative](../001-4-2-sigma-live-gate-correction-qualified-participants-multi-handoff.trace.md)
- Current
  - Current Schema: tiinex.evidence.v1
  - Created At: 2026-09-20 21:12:49
  - Authors: Anchor
  - Why: Sigma reproduced the package-version blocker after Switch all to Local and restart across Incoming/Outgoing/Replace.
  - Summary: Qualify linked-extension Local Core source selection across restart without weakening Published/Latest mode.
  - Status: ready/local

---

# Local Core Runtime Restart Qualification

## Supported Claim Or Question

- Supported Claim Or Question: whether the Extension VS Code Local dependency workflow remains usable across a linked Extension Host restart without weakening Published/Latest package binding or adding Replace-specific exceptions.
- Evidence Role: Anchor technical qualification for the bounded Local runtime-selection correction discovered during Sigma's repeated Major 002 live gate.

## Provenance

- Known Source: Sigma's Windows/main-host observation that `Switch all to Local` followed by restart caused Incoming, Outgoing Workspace selection and Replace to fail with `tiinex.core-package.version-mismatch:0.1.1:0.35.0`; exact current extension-vscode candidate source; exact current Core source retained from the accepted Loom lane.
- Preservation Basis: direct source inspection of the shared runtime-binding seam, a deterministic linked-extension restart regression harness, the full executable bridge suite and package-integration suite.
- Provenance Limits: local sandbox qualification plus Sigma's observed Windows failure signal; no remote commit/push, npm publication or final Windows acceptance is claimed.

## Evidence Material

- Material Kind: shared host runtime-selection repair plus executable regression evidence.
- Material: `src/host/corePackageBinding.ts` now resolves the linked VS Code extension path back to the real checkout before looking for ordinary sibling Core source. Published/Latest mode remains lock-matching installed-package mode. A lock/install version mismatch may select sibling-source mode only when the installed local Core version exactly matches that sibling checkout's `@tiinex/core` package version; otherwise qualification remains fail-closed.
- Local Mode Contract: `Switch all to Local` may intentionally leave the reviewed dependency declaration and lockfile on the published line while `npm install --no-save --package-lock=false --install-links file:../core` installs local Core bytes. Restart no longer loses that Local intent merely because the Extension Host loads the checkout through the VS Code extension junction.
- Latest Mode Contract: when installed Core again matches the lockfile version, the installed package runtime wins even when a sibling Core checkout exists; sibling presence alone cannot force Local mode.
- Cross-Workflow Boundary: Incoming, Outgoing and Replace now consume the same runtime binding. The earlier Replace-only version-mismatch bypass was removed so one host contract owns the behavior.
- Regression: 113/113 Tiinex VS Code bridge cases pass, including the explicit linked-extension restart Local/Latest/fail-closed matrix.
- Package Integration: 4/4 package integration scenarios pass, including extracted VSIX use of its bundled lockfile/public Core entrypoint.
- Typecheck Limit: full TypeScript typecheck remains unavailable in the current sandbox because `@types/node` and `@types/vscode` are absent; the compiler reports TS2688 for those two missing type libraries. This is not treated as PASS.
- Supporting Logs: `evidence/005-local-core-runtime-restart-validation/bridge-validation.txt`, `package-integration.txt`, and `typecheck-attempt.txt` preserve the exact local qualification outputs.

## Preservation And Fidelity

- Preservation State: the fix changes only host runtime-source selection and removes the earlier Replace-specific mismatch bypass; participant, Handoff, carrier-allocation and Core semantic ownership remain unchanged.
- Fidelity Notes: Local mode is inferred only from a concrete lock/install mismatch plus exact sibling checkout package identity/version after resolving the linked extension path; Published/Latest behavior remains strict when installed and lock versions agree.
- Known Losses: none in the bounded source correction. Windows/main-host final acceptance remains outstanding.

## Interpretation Limits

- Does Not Prove: Marketplace/registry release readiness, Windows filesystem/Junction behavior beyond the Sigma replay environment, semantic correctness outside the Local runtime-binding seam, or Major 002 completion.
- Must Not Be Treated As: permission to accept arbitrary package-version drift, a global relaxation of dependency integrity, or a substitute for Sigma's final live replay.
- Not Yet Used As: remote landing evidence or final human acceptance.
- Remaining Gate: Sigma repeats the ordinary Windows Local workflow after restart: Incoming, Replace, Outgoing local Workspace selection, participant/endpoints, two Handoff pointers and Pack.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-4-2-sigma-live-gate-correction-qualified-participants-multi-handoff.trace.md](../001-4-2-sigma-live-gate-correction-qualified-participants-multi-handoff.trace.md)
  - Value: 2S-G4OAhW3BkSfNG4UAiiXwKSf32fipGhQhI5XPvi5o

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: nIfBDHuYWLjCBxfSjOKQ6jtMBrFahgWo9I-Cl5TU4rA