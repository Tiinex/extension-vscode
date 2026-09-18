# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: tiinex.evidence.v1
  - Created At: 2026-09-18 19:59:47
  - Trace: [002-1-outgoing-major-preview-and-local-core-runtime-qualification.trace.md](002-1-outgoing-major-preview-and-local-core-runtime-qualification.trace.md)
  - Origin:
    - [relative](002-1-outgoing-major-preview-and-local-core-runtime-qualification.trace.md)
- Current
  - Current Schema: tiinex.evidence.v1
  - Created At: 2026-09-18 20:37:12
  - Authors: Anchor
  - Why: Sigma reproduced Incoming-Core runtime mismatch after the first Major repair and requested no-overwrite behavior for outgoing carrier files.
  - Summary: Qualify exact selected Core runtime manufacture for Local/Incoming sources and collision-safe transport filenames without changing carrier lineage.
  - Status: ready/local

---

# Outgoing Selected Core Runtime And Collision-Safe Filename Qualification

## Supported Claim Or Question

- Supported Claim Or Question: does VS Code Outgoing execute manufacture with the exact selected Core Workspace source for both Local and Incoming selections, while allocating a free human-output filename without changing carrier Major or sibling lineage
- Evidence Role: focused follow-up qualification of the existing Outgoing Major/runtime repair after Sigma reproduced an Incoming-Core runtime mismatch and requested no-overwrite behavior

## Provenance

- Known Source: integrated full-recovery `004-1-2`, Sigma's reproduced runtime-source mismatch, the exact carried Core Workspace in that recovery, and the current extension-vscode source
- Preservation Basis: exact-source reproduction, bounded extension-vscode source correction, deterministic collision-allocation assertions, actual package manufacture using Incoming Core as the selected Core source, and syntax checks on emitted runtime files
- Provenance Limits: full TypeScript typecheck/build remains unavailable in this host because Node/VS Code type packages are not installed; the pre-existing extension test suite still stops later on an unrelated stale menu-context assertion
- Semantic Authority Boundary: disk filename collisions are transport presentation only and must not select or mutate carrier Major/sibling lineage; Core remains final carrier-lineage and manufacture authority

## Evidence Material

- Material: `src/packageBuilder.ts`, `src/operatorTrees.ts`, `src/core/outgoingUx.ts`, `src/host/carrierPublish.ts`, corresponding `dist` outputs, and focused tests
- Material Kind: bounded extension-vscode runtime/source-binding and human-output collision handling
- Incoming Core Runtime Repair: when Outgoing selects Core from an Incoming carrier, the exact carried Core Workspace archive is extracted into bounded scratch material and its own `tools/tiinex-portable.mjs` runtime is used for qualification and manufacture
- Local Core Preservation: Local Core selection continues to execute the exact selected Local Core Workspace runtime
- Fail-Closed Preservation: `tooling-bootstrap.runtime-source.mismatch` remains unchanged; the host now resolves the mismatch by binding manufacture to the exact selected Core source instead of weakening the Core gate
- Collision Policy: occupied output filenames allocate Core's existing transport-only collision instance (`--2`, `--3`, ...) while the qualified carrier dimension remains unchanged
- Collision Example: if `tiinex-core-005.handoff-package.zip` and `tiinex-core-005--2.handoff-package.zip` already exist, the next human-output projection is `tiinex-core-005--3.handoff-package.zip`; this does not imply carrier Major `006`
- Sibling Boundary: the same collision suffix rule applies to a sibling carrier filename without changing its topology-derived sibling ordinal; disk occupancy never chooses a carrier sibling
- Incoming-Core Manufacture Qualification: a real pointerless package manufacture using Incoming Core from full recovery `004-1-2` plus a qualified Local extension-vscode Workspace completed successfully as `tiinex-test-001.handoff-package.zip`
- Focused Collision Qualification: deterministic helper assertions select collision instance `3` when instances `1` and `2` already exist
- Syntax Qualification: changed emitted JavaScript surfaces pass `node --check`
- Existing Test Boundary: focused tests pass through the new collision/runtime coverage, after which the unchanged suite still fails on the previously known stale `outgoingHandoffUnattached` menu assertion

## Preservation And Fidelity

- Preservation State: only extension-vscode source/dist, focused tests, and this Evidence are changed by this correction
- Fidelity Notes: preview and manufacture use the same collision instance; filename collision handling remains non-authoritative transport presentation
- Known Losses: no full VS Code compile/typecheck receipt in this host because required type packages are unavailable

## Interpretation Limits

- Does Not Prove: full extension release readiness, Sigma live-host acceptance, or resolution of unrelated stale menu tests
- Not Yet Used As: authority to publish a VSIX or alter Core carrier numbering semantics
- Must Not Be Treated As: permission to advance a Major or sibling merely because a filename is occupied
- Authority Limits: bounded VS Code Outgoing source-runtime binding and collision-safe transport filename projection

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [002-1-outgoing-major-preview-and-local-core-runtime-qualification.trace.md](002-1-outgoing-major-preview-and-local-core-runtime-qualification.trace.md)
  - Value: 7wbaylVOhwbEY0x2HO0z8-Ic05zkYOKsHDLBJEzMT4g

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: Fbv3-VtcURVolWmBIjj0A4l6bLJksL0LNo9XRlLL794