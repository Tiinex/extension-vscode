# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-19 22:32:24
  - Trace: [015-1-1-1-1-1-1-vs-code-major-003-root-carrier-profile-binding-final-windows-gat.trace.md](015-1-1-1-1-1-1-vs-code-major-003-root-carrier-profile-binding-final-windows-gat.trace.md)
  - Origin:
    - [relative](015-1-1-1-1-1-1-vs-code-major-003-root-carrier-profile-binding-final-windows-gat.trace.md)
- Current
  - Current Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-19 23:34:00
  - Authors: Anchor
  - Why: Resolve Sigma's remaining fresh-root Pack filename mismatch without weakening Core or changing pointerless Workspace filename semantics.
  - Summary: Bind routed Handoff publication to Core preview filename and exact collision allocation.
  - Status: ready/local

---

## Handoff Parties

- Purpose: return the VS Code Major 003 candidate after Sigma's final fresh-root Pack attempt isolated the remaining blocker to host-side routed-carrier filename authority and collision allocation.
- From: Anchor
- From Kind: role
- From Reference: [Anchor Role](business::.topics/roles/001-1-1-1-1-1-anchor-canonical-holder-cutover-role.trace.md)
- To: Anchor
- To Kind: role
- To Reference: [Anchor Role](business::.topics/roles/001-1-1-1-1-1-anchor-canonical-holder-cutover-role.trace.md)

## Transfers

- vscode-major-003-core-filename-authority-final-windows-gate
  - Transfer Kind: work-and-responsibility
  - Description: continue from the exact 002-1-1-1-1 extension-vscode frontier with the routed Handoff Pack filename seam corrected. VS Code no longer compares a speculative Outgoing Handoff filename against Core's qualified routed filename. It first previews Core's exact routed basename, allocates any host-local collision suffix against that exact basename, re-previews if a suffix is required, and requires manufacture to return the same Core filename before publication.
  - Controlling Artifact: [Root carrier profile final Windows gate](015-1-1-1-1-1-1-vs-code-major-003-root-carrier-profile-binding-final-windows-gat.trace.md)
  - Boundary: pointerless Workspace carriers retain their explicit host-projected filename contract; routed Handoff carrier filename authority remains shared Core human-output projection only.

## Required Context

- routed-filename-authority
  - Material: routed Handoff packaging obtains the exact basename from the first qualified Core preview through `humanOutput.primary.filename`; the host no longer enforces `expectedCarrierFilename` on routed Handoff preview or manufacture.
  - Material Reference: [packageBuilder.ts](../../../../src/packageBuilder.ts)
  - Purpose: keep routed filename projection owned by shared Core rather than a host-local guess.
  - Availability: available

- collision-allocation
  - Material: routed Handoff collision allocation now runs against the exact Core preview basename via `nextCarrierCollisionInstance`; when an ordinal suffix is needed, VS Code re-previews with `--collision-instance` and requires the manufactured Core filename to equal that final preview filename.
  - Material Reference: [packageBuilder.ts](../../../../src/packageBuilder.ts)
  - Purpose: prevent a host-local speculative filename from selecting the wrong collision instance.
  - Availability: available

- pointerless-boundary
  - Material: pointerless Workspace Pack still passes the visible host-projected filename into shared Tooling and verifies exact preview/manufacture filename equality; only the routed Handoff branch changes authority handling.
  - Material Reference: [packageBuilder.ts](../../../../src/packageBuilder.ts)
  - Purpose: preserve the already-qualified pointerless filename contract.
  - Availability: available

- regression-coverage
  - Material: static regression reaches 51 named passes before this host's known missing installed `@tiinex/core` gate; a focused routed-filename authority assertion passes, and TypeScript syntax transpilation of the two changed source files reports no diagnostics.
  - Material Reference: [test/run.mjs](../../../../test/run.mjs)
  - Purpose: preserve the exact ownership/collision correction without broadening Pack semantics.
  - Availability: available

## Reference Context

- sigma-final-pack-blocker
  - Material: Sigma's next Windows Pack reached Core manufacture and failed only at `tiinex.package-builder.carrier-filename-shared-contract-mismatch`, with host expected `test-test-001-cartographer-to-steward.handoff-package.zip` and Core actual `tiinusen-boardgame-...handoff-package.zip`.
  - Purpose: preserve the exact remaining live-host delta as observational evidence rather than required carrier material.
  - Availability: available

- shared-core-filename-boundary
  - Material: shared Core carrier projection explicitly marks filename semantic authority as false while its qualified human-output projection deterministically supplies the routed transport basename from exact Workspace/route/lineage facts. VS Code uses that Core human-output result for publication and never renames qualified bytes.
  - Purpose: distinguish transport filename projection from Handoff semantic authority while still using Core as the deterministic filename source.
  - Availability: available

- root-profile-fix-retained
  - Material: the prior fresh-root `--carrier-profile` correction remains unchanged. This filename correction occurs after Core preview succeeds and does not weaken Major source closure.
  - Purpose: prevent regression back to the previous `tiinex-foundation` fallback blocker.
  - Availability: available

## Retained Responsibilities

- sigma-windows-build-pack-acceptance
  - Retained By: Sigma
  - Retained By Reference: [Sigma Role](business::.topics/roles/001-4-1-sigma-canonical-holder-cutover-role.trace.md)
  - Responsibility: rebuild the linked extension on Windows and repeat the same fresh Boardgame Outgoing/Handoff Pack flow. Return BUILD and PACK PASS/FAIL plus the first blocker code if Pack still fails.
  - Boundary: live observation only; no Core filename or validation workaround.

- anchor-final-closure
  - Retained By: Anchor
  - Retained By Reference: [Anchor Role](business::.topics/roles/001-1-1-1-1-1-anchor-canonical-holder-cutover-role.trace.md)
  - Responsibility: consume Sigma's next Pack observation and close the VS Code Major 003 lane if green, otherwise isolate only the exact remaining delta.
  - Boundary: no unrelated feature expansion.

## Exclusions And Dependencies

- pilot-invalid-carrier-upstream
  - Kind: unresolved-dependency
  - Description: the separate malformed Pilot-manufactured Boardgame carrier remains with Master Anchor/Core and is not repaired in this VS Code lane.
  - Responsible Party Or Role: Master Anchor / Core

- exact-local-dependency-gate
  - Kind: unresolved-dependency
  - Description: this host still lacks the exact installed npm dependency set for a full linked TypeScript/VSIX build; Sigma's Windows linked build remains the exact runtime acceptance gate.
  - Responsible Party Or Role: Sigma / Anchor

## Completion Expectation

- Signal Kind: return
- Signal Meaning: rebuild the linked extension, reproduce the same fresh Boardgame routed Handoff Pack, and return BUILD PASS/FAIL, PACK PASS/FAIL, and FIRST-BLOCKER NONE or the exact remaining code.
- Return To: Anchor
- Return To Reference: [Anchor Role](business::.topics/roles/001-1-1-1-1-1-anchor-canonical-holder-cutover-role.trace.md)

## Interpretation Limits

- Does Not Mean: routed carrier filenames became semantic Handoff authority, pointerless Workspace filename behavior changed, shared Core Major qualification was weakened, or Windows Pack has already passed.
- Must Not Be Used To Claim: Major 003 closure before Sigma verifies the corrected source in the live linked extension.
- Authority Limits: bounded VS Code routed carrier filename/collision host integration and final acceptance continuity only.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [015-1-1-1-1-1-1-vs-code-major-003-root-carrier-profile-binding-final-windows-gat.trace.md](015-1-1-1-1-1-1-vs-code-major-003-root-carrier-profile-binding-final-windows-gat.trace.md)
  - Value: pU9RwugbmzTlII3SydMKJqkX6qoF8CfpgL1j0E7O2eI

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: P8cPCdaAFqnHsZOoQ7jpudSoYAVrd35hdK1VbbPzb-g