# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.evidence.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/core/evidence/tiinex.evidence.v1.schema.md)
  - Created At: 2026-10-08 17:33:40
  - Authors: Anchor
  - Why: Preserve observed Windows latency and narrow the next acceptance round to measured Core-qualified phases.
  - Summary: Sigma reports ~30-second post-qualification preview delay; bounded host-only source scheduling and reuse candidate.
  - Status: ready/local

---

# Post-Qualification Role Discovery And Preview Latency

## Supported Claim Or Question

- Supported Claim Or Question: Why does Sigma still observe approximately 30 seconds before Incoming's role-matched Handoff Preview appears after package qualification, despite the previous bounded Operator Party projection batch?
- Evidence Role: direct operator-observed Windows latency plus a bounded VS Code host-only candidate and measured isolated behavior. Not an end-to-end host acceptance.
- Review Context: Sigma's new 2026-10-08 report: "det är fortfarande långsam role Discovery så tar 30 sekunder innan preview dyker upp när den väl är klar med kvalificering". Latest delivered carrier included prior per-root role projection and nonblocking startup fixes, but not this remaining latency path.

## Provenance

- Known Source: the exact user's Windows observation, the carried `vscode` source files, the current qualified README/host stabilisation work and isolated source-executed regression checks.
- Preservation Basis: exact modified VS Code source `src/packageBuilder.ts`, `src/operatorParty.ts`, `src/operatorTrees.ts`, and `test/run.mjs` in the next full qualified Workspace snapshot. Prior Evidence and controlling Task remain present.
- Provenance Limits: Sigma has not supplied stage-by-stage console timings or an additional screen recording for this report. Thirty seconds is the human-observed delay and must not be reinterpreted as a measured Core command duration. It remains uncertain whether the delay is dominated by Workspace source discovery, Role projection, or opening/revealing the Markdown preview until the new host logs are collected.

## Evidence Material

- Material Kind: post-qualification latency report and scoped execution-path discovery.
- Material: `loadIncomingLocalWorkspaceChoices()` still looped over all visible VS Code Workspace roots sequentially before the previous three-way parallel Role qualification began. `autoShowIncomingPartyHandoff()` called `resolveOperatorParty()` without forwarding the `localWorkspaceChoices()` in-flight/cached Core-qualified source projection already prefetched at startup. `pickOperatorParty()` likewise discovered all roots a second time after the user selected a qualified candidate.
- Source Candidate: `src/packageBuilder.ts` now projects each root in an independent Core subprocess via `orderedBoundedMap(roots, 3, ...)`, preserving caller root order and Core-owned status/findings. It flattens results and calls the unchanged `exactIncomingWorkspaceMap()` so distinct qualified roots remain distinct and collisions still block. It logs a source-discovery aggregate duration, with runtime-preparation time separated.
- Source Candidate 2: `src/operatorParty.ts` accepts an *optional lazy* qualified-source provider and uses it only for an explicit qualified target. No/Manual identity does not trigger discovery. The picker forwards the exact already qualified choices after selection, so it no longer starts another full scan to resolve the selected role.
- Source Candidate 3: `src/operatorTrees.ts` passes `() => this.localWorkspaceChoices()` to automatic Incoming role-matched preview, reusing the already-prefetched/in-flight Workspace choice promise while continuing exact Role/Party matching via Core. Two log lines separately time party resolution and opening/revealing the qualified Handoff routes after any human modal confirmation.
- Local Verification: all 70 VS Code TypeScript source files parsed without syntax errors; isolated source-executed behavioral tests passed for three-way bounded independence, stable root ordering, unqualified plain root, duplicate identity rejection and cleanup, lazy None/Manual, role selection without second discovery, and qualified incoming reuse. This is not a typecheck, full npm suite, measured Windows gain or package/preview acceptance.

## Preservation And Fidelity

- Preservation State: exact source-bearing candidate and this qualified Evidence record; no loose patch transport, no Core or Native source changes.
- Fidelity Notes: the original 30-second report is a human observation. The synthetic test's millisecond timing proves scheduling behavior only, not absolute Windows performance.
- Known Losses: no Windows phase split or before/after trace, and no meaningful Core runtime benchmark for 17 actual open host roots.

## Interpretation Limits

- Not Yet Used As: Windows pass, release approval, visual preview acceptance or permanent performance SLA.
- Does Not Prove: that every remaining 30 seconds is eliminated, that Role currentness (e.g. duplicate Prism) has been corrected, or that Core processes can be made unbounded/conflated safely.
- Must Not Be Treated As: reason to duplicate Role semantics in VS Code, to trust a stored Party setting as current authority, to change Native, or to deliver detached `.patch` as the normal repair mechanism.
- Need For Review: Sigma receives through qualified Incoming/Replace, locally builds/reloads, then repeats the same automatic Incoming role-matched Handoff Preview and Pick Operator Party paths with the actual open Workspace set. Capture wall-clock times and extension-host log phrases `Tiinex Workspace source discovery`, `Tiinex Operator Party discovery`, `Tiinex Operator Party qualification`, `Tiinex Incoming role-matched preview: Operator Party resolved`, and `... routes opened/revealed`. If latency remains long, return those phase measurements and exact user action so the next fix targets the measured stage. Keep Outgoing/transport and persisted Evidence smoke checks within the existing Windows stabilization Handoff.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: 7LjwITHop2xevNJssL8k418FNe0x9Nedy7--M8ygUy4