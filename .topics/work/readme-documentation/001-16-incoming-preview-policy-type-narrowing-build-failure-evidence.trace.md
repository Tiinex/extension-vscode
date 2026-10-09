# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.evidence.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/core/evidence/tiinex.evidence.v1.schema.md)
  - Created At: 2026-10-08 18:14:52
  - Authors: Anchor
  - Why: Preserve build blocker and limited source-verified fix without claiming full host acceptance.
  - Summary: Windows TS2367 in pre-orientation autoShow setting and minimal typed VS Code correction with bounded strict compile check.
  - Status: ready/local

---

# Incoming Preview Policy Type Narrowing Build Failure

## Supported Claim Or Question

- Supported Claim Or Question: Why does a Windows build of the prior Incoming Preview latency candidate fail with TypeScript TS2367, and which smallest owner-correct correction removes it?
- Evidence Role: direct Sigma Windows build-failure report, localized host-source fix and bounded compilation checks; not Windows acceptance.
- Review Context: following the Anchor → Sigma Incoming-first-preview Handoff, Sigma reported `src/operatorTrees.ts:2032:22` TS2367 when building the carried VS Code Workspace.

## Provenance

- Known Source: direct operator compiler diagnostic `This comparison appears to be unintentional because the types '"ask"' and '"no"' have no overlap.`; the exact carried VS Code source `src/operatorTrees.ts` and corresponding `test/run.mjs`; VS Code configuration enum from `package.json`.
- Preservation Basis: qualified owner Workspace source and regression assertion carried in the next complete Tiinex Handoff Package. No standalone `.patch` as normal transport.
- Provenance Limits: the full Windows build and host behavior must be verified by Sigma after Incoming Replace, build and reload.

## Evidence Material

- Material Kind: typed configuration regression and bounded owner-correct fix.
- Material: the added pre-orientation Operator Party lookup used `this.config().get('incoming.autoShowPartyHandoff', 'ask') === 'no'`. TypeScript inferred the narrow literal return type `"ask"`, causing TS2367 for comparison to `"no"`. `package.json` declares the accepted values `no`, `ask`, `yes`; a later `autoShowIncomingPartyHandoff` call already uses `get<'no' | 'ask' | 'yes'>` for the same policy.
- Minimal Correction: change the pre-orientation lookup to `this.config().get<'no' | 'ask' | 'yes'>('incoming.autoShowPartyHandoff', 'ask') === 'no'`; update the existing host source regression assertion in `test/run.mjs` to require the explicit union annotation.
- Independent Compile Check: a strict TypeScript fixture reproduces TS2367 with the previous unannotated call and passes with the three-value generic annotation; zero parse errors across 71 candidate TypeScript/TSX source files; JavaScript syntax check of modified test file passes. This is stronger than a syntax-only check for the specific failure but is not the full extension build.
- Semantic Boundaries: `no` still suppresses pre-orientation role lookup, `ask` and `yes` still allow it, Core/Native semantics remain unchanged. No new editor policy or user-facing setting introduced.

## Preservation And Fidelity

- Preservation State: fix and regression coverage in qualified VS Code Workspace; exact prior source and build diagnostic remain recoverable through the parent carrier and this Evidence.
- Fidelity Notes: distinguishes actual reported Windows TS error from locally reproduced strict fixture, and source-level checks from complete Windows host acceptance.
- Known Losses: no successful full TypeScript compilation with VS Code/Node dependencies in this runtime, no remeasured click-to-first-Markdown latency on Windows.

## Interpretation Limits

- Not Yet Used As: full `npm run dev:build:local` PASS, Windows first-preview timing PASS, Incoming/Outgoing release acceptance, or remote write authorization.
- Does Not Prove: absence of other compile errors once this first error is cleared, or restored historical 3–6-second preview timing.
- Must Not Be Treated As: permission to skip qualified route orientation, accept stale review comparisons, or deliver loose patches when Incoming Replace can recover.
- Need For Review: receive the next complete Handoff Package via Incoming; review qualified Workspace Replace and build/reload the extension. If build succeeds, resume previous first-Markdown vs local review timing test, plus Outgoing and Evidence regressions as applicable. If it fails, report the next exact compiler diagnostic.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: VKBdes2o72PWApInDYYnU4-bds87vz5X_EH8tjD9LrA