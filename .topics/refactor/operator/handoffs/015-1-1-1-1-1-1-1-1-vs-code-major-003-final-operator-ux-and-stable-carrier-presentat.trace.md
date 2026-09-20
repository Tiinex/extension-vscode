# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-19 23:34:00
  - Trace: [015-1-1-1-1-1-1-1-vs-code-major-003-routed-carrier-filename-authority-final-window.trace.md](015-1-1-1-1-1-1-1-vs-code-major-003-routed-carrier-filename-authority-final-window.trace.md)
  - Origin:
    - [relative](015-1-1-1-1-1-1-1-vs-code-major-003-routed-carrier-filename-authority-final-window.trace.md)
- Current
  - Current Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-20 00:01:25
  - Authors: Anchor
  - Why: Close Sigma's remaining live Windows operator-flow deviations without weakening shared Core or rewriting carrier bytes.
  - Summary: Final bounded VS Code UX deltas for date display, pointer removal, stable single-Major naming, and native package reveal.
  - Status: ready/local

---

## Handoff Parties

- Purpose: return the VS Code Major 003 candidate after Sigma's live Windows pass isolated the final operator-facing UX deltas: canonical date display, pointer removal semantics, stable fresh-root prefix/single-Major naming, and native package reveal.
- From: Anchor
- From Kind: role
- From Reference: [Anchor Role](business::.topics/roles/001-1-1-1-1-1-anchor-canonical-holder-cutover-role.trace.md)
- To: Anchor
- To Kind: role
- To Reference: [Anchor Role](business::.topics/roles/001-1-1-1-1-1-anchor-canonical-holder-cutover-role.trace.md)

## Transfers

- vscode-major-003-final-operator-ux-window
  - Transfer Kind: work-and-responsibility
  - Description: continue from the exact 002-1-1-1-1-1 extension-vscode frontier with four bounded host UX deltas applied. Handoff candidate dates render with deterministic YYYY-MM-DD HH:mm:ss ordering; participant pointer projections expose direct Remove actions while Handoff pointer removal cascades route exclusion plus all attached participant pointers; fresh-root Outgoing keeps the operator prefix stable and carries exactly one 001 carrier Major instead of filesystem-derived prefix advancement plus a second Core Major; Transport exposes Reveal Package, selecting in the VS Code Explorer when the output is inside any open Workspace and otherwise using the native OS reveal command.
  - Controlling Artifact: [Routed carrier filename authority final window](015-1-1-1-1-1-1-1-vs-code-major-003-routed-carrier-filename-authority-final-window.trace.md)
  - Boundary: shared Core validation, route qualification, carrier bytes, and carrier lineage remain unchanged. This transfer changes only VS Code host presentation, operator mutation controls, and outer transport basename publication where Core declares no filename authority.

## Required Context

- canonical-date-display
  - Material: Attach Handoff and artifact-feed timestamp presentation now uses the existing deterministic `timestamp` formatter instead of host-locale `toLocaleString`, producing YYYY-MM-DD HH:mm:ss.
  - Material Reference: [operatorTrees.ts](../../../../src/operatorTrees.ts)
  - Purpose: remove locale-dependent month/day ordering from operator decisions.
  - Availability: available

- pointer-removal-semantics
  - Material: participant Role pointer previews/projections expose Remove Participant Pointer. Projected Handoff pointers expose Remove Handoff Pointer; removing the Handoff pointer excludes that route and clears all participant pointers for the route. Endpoint Role pointers remain route-owned and are not independently deletable.
  - Material Reference: [operatorTrees.ts](../../../../src/operatorTrees.ts)
  - Purpose: let operators undo projected optional participant selections without manufacturing contradictory endpoint topology.
  - Availability: available

- stable-root-prefix-single-major
  - Material: blank Outgoing no longer scans the output directory to advance a local numeric series before Core adds carrier lineage. The operator supplies one stable prefix and the fresh root is presented with exactly carrier Major 001; primary-route selection only contributes the qualified route suffix and does not replace the prefix or append another Major token.
  - Material Reference: [outgoingUx.ts](../../../../src/core/outgoingUx.ts)
  - Purpose: prevent observed names such as `test-test-002-001-...` and preserve the operator's selected prefix across route selection.
  - Availability: available

- routed-outer-basename-boundary
  - Material: routed manufacture still previews and manufactures with Core's exact qualified output basename inside the scratch stage, verifies the Core preview/build filename is stable, and then publishes those unchanged bytes under the host-selected stable Outgoing basename. Core's carrier projection declares filename authority false; carrier bytes and lineage are not rewritten.
  - Material Reference: [packageBuilder.ts](../../../../src/packageBuilder.ts)
  - Purpose: preserve one stable operator prefix without treating the outer transport filename as semantic Handoff authority.
  - Availability: available

- native-reveal-package
  - Material: Transport's former Copy Package action is presented as Reveal Package. Outputs inside any open VS Code Workspace execute native `revealInExplorer`; outputs outside all open Workspaces execute native `revealFileInOS`, which delegates selection to the operating-system file explorer.
  - Material Reference: [operatorTrees.ts](../../../../src/operatorTrees.ts)
  - Purpose: take the operator to the manufactured file instead of placing a file object on the clipboard.
  - Availability: available

- regression-coverage
  - Material: package contribution/static regression reaches 51 named passes with the new command/menu/date/naming/reveal assertions before this host's known missing exact installed `@tiinex/core` package gate. All TypeScript sources transpile without syntax diagnostics in a disposable verification copy; a full linked TypeScript/VSIX build remains a Windows acceptance responsibility.
  - Material Reference: [run.mjs](../../../../test/run.mjs)
  - Purpose: retain bounded proof while not claiming a dependency-qualified build unavailable on this host.
  - Availability: available

## Reference Context

- sigma-live-ux-observation
  - Material: Sigma's Windows video and screenshots showed locale date rendering, no direct pointer deletion control, a fresh-root primary scenario projecting `test-test-002-001-...`, and the Transport action still labeled Copy Package.
  - Purpose: preserve the exact operator-facing observations that drove this bounded delta.
  - Availability: available

- primary-route-selection-retained
  - Material: selecting one Primary Outgoing route when multiple routes are attached remains acceptable and unchanged; only the resulting prefix/Major projection is corrected.
  - Purpose: avoid conflating route selection with the naming defect.
  - Availability: available

## Retained Responsibilities

- sigma-windows-final-ux-pack-acceptance
  - Retained By: Sigma
  - Retained By Reference: [Sigma Role](business::.topics/roles/001-4-1-sigma-canonical-holder-cutover-role.trace.md)
  - Responsibility: switch linked dependencies to Latest, build the extension, verify date/pointer/reveal behavior, repeat the fresh Boardgame multi-route Pack flow, and report only observed deltas.
  - Boundary: no Core validation workaround, post-edit of manufactured carrier bytes, or manual lineage renaming.

- anchor-final-closure
  - Retained By: Anchor
  - Retained By Reference: [Anchor Role](business::.topics/roles/001-1-1-1-1-1-anchor-canonical-holder-cutover-role.trace.md)
  - Responsibility: consume Sigma's next live observation and close Major 003 if green, otherwise isolate only the exact remaining VS Code delta.
  - Boundary: no unrelated feature expansion.

## Exclusions And Dependencies

- pilot-invalid-carrier-upstream
  - Kind: unresolved-dependency
  - Description: the malformed Pilot-manufactured Boardgame carrier remains assigned to Master Anchor/Core and is not repaired or normalized in the VS Code extension lane.
  - Responsible Party Or Role: Master Anchor / Core

- exact-local-dependency-gate
  - Kind: unresolved-dependency
  - Description: this host does not contain the exact installed npm dependency set required for a linked `tsc`/VSIX build. Static regression and syntax qualification are available; Sigma's Windows linked build remains the runtime acceptance gate.
  - Responsible Party Or Role: Sigma / Anchor

## Completion Expectation

- Signal Kind: return
- Signal Meaning: rebuild the linked extension and repeat the same fresh Boardgame flow. Verify DATE, POINTER DELETE/CASCADE, PREFIX+MAJOR, REVEAL PACKAGE, and PACK. Return only failures/deltas; video is sufficient evidence.
- Return To: Anchor
- Return To Reference: [Anchor Role](business::.topics/roles/001-1-1-1-1-1-anchor-canonical-holder-cutover-role.trace.md)

## Interpretation Limits

- Does Not Mean: outer carrier filenames became semantic Handoff authority, endpoint Role pointers can be removed independently, route-primary selection was removed, Core validation was weakened, or the live Windows Pack is already accepted.
- Must Not Be Used To Claim: VS Code Major 003 closure before Sigma performs the linked Windows build and final operator-flow observation.
- Authority Limits: bounded VS Code host UX, fresh-root presentation, outer transport publication, and final acceptance continuity only.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [015-1-1-1-1-1-1-1-vs-code-major-003-routed-carrier-filename-authority-final-window.trace.md](015-1-1-1-1-1-1-1-vs-code-major-003-routed-carrier-filename-authority-final-window.trace.md)
  - Value: P8cPCdaAFqnHsZOoQ7jpudSoYAVrd35hdK1VbbPzb-g

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: 4I3Q8-9DKhW-qt2v7Y1UwtEnLnHdpS8rPQYnu76UNJ4