# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.evidence.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/core/evidence/tiinex.evidence.v1.schema.md)
  - Created At: 2026-10-08 17:54:00
  - Authors: Anchor
  - Why: Preserve the observed 80-second Incoming Markdown delay and owner-correct VS Code resolution before the next Sigma host test.
  - Summary: Windows delay diagnosis, Core-qualified preview scheduling fix and explicit host performance acceptance boundary.
  - Status: ready/local

---

# Incoming Qualified Preview Versus Local Review Regression

## Supported Claim Or Question

- Supported Claim Or Question: Why does the Windows Markdown Preview open roughly 80 seconds after Send to Incoming, compared with the operator's prior observation of about 3–6 seconds while Incoming was still qualifying?
- Evidence Role: source-path diagnosis, bounded VS Code scheduling candidate and test boundary for a new Sigma host run.
- Review Context: Sigma observed a current approximately 1m20s first-Markdown delay and slow Incoming qualification in the October 8, 2026 Windows extension, after preceding Role Discovery changes.

## Provenance

- Known Source: direct operator feedback in this conversation; latest qualified 17-Workspace package `tiinex-031-1-2-2-2-2-2-2-2-1-1-1-1-anchor-to-sigma.handoff-package.zip`; exact carried VS Code source at `src/operatorTrees.ts`, `src/carrierIndex.ts`, `src/operatorParty.ts`, `src/host/zip.ts`.
- Preservation Basis: candidate source and regression assertions are included in this Workspace, and the acceptance baseline is preserved as observed operator timing rather than a synthetic benchmark.
- Provenance Limits: host-specific 80-second wall time has not been reproduced in the local Linux runtime. Earlier fast-build/version identity has not been independently qualified, so this is an observed regression report, not a reconstructed historical implementation proof.

## Evidence Material

- Material Kind: Windows performance observation, verified source dependency chain and scoped candidate.
- Material: Prior `setIncoming` awaited full `qualifyIncoming()` **and then** `refreshIncomingReviewReadiness()`, comparing the carrier against all open local Workspaces **before** publishing qualified Incoming state and opening its Handoff Markdown. This optional local review comparison is not required to display a Core-qualified Handoff, but remains required for exact Accept/Reject. `restoreIncomingQueue()` also held ready state behind the comparison. The current `src/operatorTrees.ts` promotes after Core orientation, overlaps exact Operator Party lookup with orientation when enabled, opens a qualified Handoff Preview, then enqueues the independent local comparison. `src/vscode/incomingReviewScheduler.ts` serializes comparisons and prevents stale/closed cards from being repainted. Instrumentation separates ZIP index, Core orientation, recipient resolution, Markdown opened/revealed and local review comparison. In this Linux environment, indexing the 83,406,823-byte 17-Workspace carrier (725 Markdown artifacts, 2,366 files) took about 472 ms; standalone Core orientation took about 3.46 seconds. Scheduler ordering/cancellation/failure tests passed and all 71 TypeScript/TSX files parsed, but these local timings are not Windows acceptance; full npm compilation remains unavailable without installed `node_modules`.

## Preservation And Fidelity

- Preservation State: qualified candidate source, regression coverage and this Evidence in the carried `vscode` Workspace.
- Fidelity Notes: distinguishes host observation from local source proof and instrumented Linux measurements; preserves the real Core provenance of orientation and comparison.
- Known Losses: no current Windows before/after trace; no performance claim that the 3–6-second previous experience is restored yet.

## Interpretation Limits

- Not Yet Used As: Windows performance PASS, full workflow/release acceptance, remote commit/push authorization, or proof all historical preview latency is accounted for.
- Does Not Prove: which exact Core subprocess is slowest on Windows or whether disk/antivirus/runtime cache contributes; new instrumentation discriminates these possibilities on rerun.
- Must Not Be Treated As: permission to bypass package orientation, fabricate Role assignment, present stale local review as ready, or infer currentness from filename.
- Need For Review: Windows Send to Incoming with the same open repositories, measure click-to-first-visible-Markdown and observe `Tiinex Incoming index`, `Tiinex Incoming Core orientation`, `Tiinex Incoming carrier qualification`, `Tiinex Incoming role-matched preview`, and `Tiinex Incoming local review comparison`. Verify that Markdown appears before the comparison finishes, while Accept/Reject stay blocked until a fresh exact check. Test Close while comparison is in flight, multiple Incoming packages, manual/no Operator Party and Preview/Outgoing/Transport regressions.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: M31R_YfQun12JfmdTR-Id15Uj6No_3ThUO5zcnlbziU