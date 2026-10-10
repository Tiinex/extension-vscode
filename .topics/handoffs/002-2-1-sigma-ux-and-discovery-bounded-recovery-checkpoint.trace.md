# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.evidence.v1](https://github.com/Tiinex/docs/blob/9ef3c2caed38152b1948c93cb45c985786660d91/.topics/.schemas/core/evidence/tiinex.evidence.v1.schema.md)
  - Created At: 2026-10-10 23:22:31
  - Trace: [002-2-sigma-discovery-latency-manual-benchmark.trace.md](002-2-sigma-discovery-latency-manual-benchmark.trace.md)
  - Origin:
    - [relative](002-2-sigma-discovery-latency-manual-benchmark.trace.md)
- Current
  - Current Schema: [tiinex.evidence.v1](https://github.com/Tiinex/docs/blob/9ef3c2caed38152b1948c93cb45c985786660d91/.topics/.schemas/core/evidence/tiinex.evidence.v1.schema.md)
  - Created At: 2026-10-10 23:33:39
  - Authors: Sigma
  - Summary: Replace, New Artifact, Role discovery and grounding discipline bounded recovery
  - Status: ready/local

---

# Sigma UX And Discovery — Bounded Recovery Checkpoint

## Supported Claim Or Question

- Supported Claim Or Question: Which reported Windows UX/grounding deviations have bounded corrections or measured evidence, and what remains for Anchor and Sigma?
- Evidence Role: exact local source/test checkpoint to support the formally qualified Sigma-to-Anchor return; not Windows or marketplace acceptance.
- Target Artifact: Finish VS Code Extension — Integration And Final Human Acceptance Gate.
- Review Context: The human Sigma observed Replace initially selecting all Workspaces before later reducing to one, a ~45-second New Artifact opening with repeated clicks, slow Roll discovery, possible Transition latency, and improvised docs Markdown replacing Tiinex formal artifact discipline. The same Sigma confirmed Windows compile PASS, 17-Workspace Handoff context, and removal of Transition UI duplicates.

## Provenance

- Known Source: qualified incoming Anchor-to-Sigma carrier, local continued VS Code source, human screenshots and direct observations, earlier manually measured packaged Core CLI probes, and new host-level regression executions.
- Preservation Basis: the qualified inbound 17-Workspace carrier remains immutable. This workspace is a bounded local continuation. No remote mutation, release publish, cross-Workspace source change or Task closure has occurred.
- Provenance Limits: Linux sandbox host probes cannot prove exact Windows 45-second bottleneck; the Role Core operator-context timing probes contained zero Role/Party candidates, so they are not a full Windows Role picker acceptance case.

## Evidence Material

- replace-selection
  - Material: `src/vscode/incomingWorkspacePicker.ts` starts with zero speculative selections while exact Core comparison resolves; then defaults only to Workspaces not matched exactly, unless the user has already changed the selection. It never forces all Workspaces selected on comparison failure. `test/incomingWorkspacePicker.behavior.cjs` passes the pending, exact-one, manually overridden, and failed comparison cases.
  - Material Kind: local source plus executed behavioral host simulation.
  - Description: addresses misleading initial selection without disallowing intentionally narrow or broad scoped replacement.
- new-artifact-interaction
  - Material: `src/operatorTrees.ts` provides immediate host progress across local Workspace choice and Core schema catalog; single-flight prevents repeated clicks from multiplying expensive discovery. It logs Workspace choice, catalog, and panel readiness durations. Core remains the qualification owner.
  - Material Kind: local source review, TypeScript transpilation; Windows-installed execution still outstanding.
  - Description: makes waiting visible but does NOT claim 45-second delay eliminated.
- role-interaction
  - Material: `src/operatorParty.ts` displays progress before Workspace discovery and independent Core Role qualification, logging phase timings and p95 root time. `src/operatorTrees.ts` protects the Role picker from concurrent clicks and shares its already-qualified Workspace promise in two further Operator Party resolution paths. `test/operatorPartyPicker.behavior.cjs` passed immediate progress, Core-before-items, and no redundant Workspace scan.
  - Material Kind: bounded host simulation and direct local source review.
  - Description: improves responsiveness and prevents duplicated interactive work without changing Role identity or Core result qualification.
- transition-identity-and-latency
  - Material: Core manual `project-transition-neighborhood` again exposed three candidates; the earlier corrected VS Code enriched-snapshot replacement remains unchanged. Existing VS Code Transition instrumentation reports runtime versus projection elapsed time. Sigma already reported no duplicates in the installed Windows dropdown.
  - Material Kind: manual Core CLI operation, qualified source, and direct human Windows observation.
  - Description: no additional Core identity/deduplication algorithm introduced.
- benchmark-baseline
  - Material: prior Linux Core independent process probes: Workspace sources 1.09–1.16s; VS Code artifact catalog 1.24–1.36s; Operator Context 2.05–2.15s VS Code and 3.68–3.73s Native; Transition neighborhood 1.02–1.05s VS Code and 1.60–1.75s Native. No single probe explains ~45 seconds. Workspace discovery is bounded to three concurrent separate Core subprocesses, not 17 parallel jobs.
  - Material Kind: local measured Tooling execution / prior qualified benchmark evidence.
  - Description: no proof that broad `.topics` enumeration is the bottleneck; repeated process launch and host orchestration remain hypotheses pending host phase timings.
- grounding-discipline
  - Material: previous agent-created freeform Docs markdown was called out as a yellow/red grounding drift risk. This result is a canonical `tiinex.evidence.v1` artifact authored, sealed, and staged through Core Tooling, with a formal Handoff return. Workspace-count preservation is intended delivery context, not a hard selection prohibition.
  - Material Kind: user observation and formal Tooling authoring boundary.
  - Description: process-owner remediation for model compliance remains open; no speculative Core/Interop rewriting within this VS Code return.

## Bounded Verification Notes

- PASS: `test/incomingWorkspacePicker.behavior.cjs`, `test/operatorPartyPicker.behavior.cjs`, `test/authoringBoundaries.regression.cjs`, `test/webviewSourceContext.regression.cjs`, `test/nativeAgentDiscovery.regression.cjs`, `test/nativeAgentRoleSync.regression.cjs`, `test/transport-completion-source.test.cjs`, and `test/lineageMaintenanceTypeContract.test.cjs`, executed locally with Node and preinstalled global TypeScript. All passed.
- PASS: manual packaged Core `project-transition-neighborhood` returns three Evidence candidates; no claim of full Windows dropdown verification in this local run.
- NOT RUN: the `dist`-dependent `test/deferredFormAttachment.test.cjs` because a compiled `dist` was unavailable; full `npm run dev:build` was not attempted in the dependency-incomplete sandbox. No npm registry install attempted.
- Existing unchanged Windows Sigma observations: build PASS, full Handoff presentation PASS, Transition dropdown duplicate removal PASS, but Replace/Role/New Artifact UX remains awaiting retest.
- Relevant regression gates continue to include Evidence Preview/Create and Parent, PNG, Move/Rebase, incoming Replace selection integrity and package roundtrip.

## Preservation And Fidelity

- Preservation State: retain all 17 qualified Workspaces in the returned carrier; bounded source modifications only in the VS Code Workspace, plus formal evidence/Handoff and a bounded host behavior regression.
- Fidelity Notes: no change to Core's semantic qualifiers, authority, hashes, Transition identities, producer contract, delivery scope guards, or publication policy. Receiver may select genuinely narrow Workspaces intentionally; this patch adds no hard Workspace-selection guard.
- Known Losses: Windows cold/warm latency, long UI wait root cause, the exact contributor of 45-second New Artifact delay and human UI behavior after these changes remain unverified. Full extension build and full end-to-end integration need a prepared Windows/local dependency environment.

## Interpretation Limits

- Not Yet Used As: Sigma PASS, Marketplace go-ahead, Task closure, Core optimization result, source-wide artifact cleanup, or proof that every end-user report is eliminated.
- Does Not Prove: that `.topics` size is the limiting factor, that retained cache is safe across unobserved filesystem changes, or that host progress implies a faster Core operation.
- Must Not Be Treated As: permission for a broader Core read-scope optimization, a changed Role authority model, source deletion from Docs, an npm mirror workaround, or remote mutation.
- Need For Review: Anchor should review the bounded VS Code UI/logging changes and obtain full installed Windows behavior after a qualified build. Grounding-specific drift belongs with the proper Process/Interop owner and later cold-start retro testing.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [002-2-sigma-discovery-latency-manual-benchmark.trace.md](002-2-sigma-discovery-latency-manual-benchmark.trace.md)
  - Value: tOzkUxzAtPJsGf7cyt6nRwNyyeStQljGmzmcMhX43ck

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: QH_Zsgkas3HiMeva2HMWxYHJj1D4PCbgeLBEiI6imtU