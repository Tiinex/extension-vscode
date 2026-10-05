# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-10-05 21:10:09
  - Trace: [001-vs-code-guided-entry-what-where-presentation.trace.md](001-vs-code-guided-entry-what-where-presentation.trace.md)
  - Origin:
    - [relative](001-vs-code-guided-entry-what-where-presentation.trace.md)
- Current
  - Current Schema: [tiinex.evidence.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/core/evidence/tiinex.evidence.v1.schema.md)
  - Created At: 2026-10-05 21:11:16
  - Authors: Anchor; Sigma
  - Why: Keep the host result and its exact verification boundary durable in the owning VS Code Workspace rather than relying on chat chronology.
  - Summary: Record WHAT/WHERE host implementation, real carrier projection, 147/147 VS Code regression, 16/16 Core projection regression and the bounded npm typing-environment limitation.
  - Status: ready/local

---

# VS Code Guided Entry What Where Verification Evidence

## Supported Claim Or Question

- Supported Claim Or Question: whether the bounded VS Code host implementation presents Core-owned WHAT and WHERE Entry projections without duplicating Target semantics or weakening existing Guided Entry behavior.
- Evidence Role: implementation and regression evidence for the Workspace-local VS Code Guided Entry What Where Presentation Task.
- Target Artifact: VS Code Guided Entry What Where Presentation.
- Review Context: Core already owns purpose Entry `modes`, compatible Target `targetOptions`, Target identity/capability projection and final WHAT+WHERE transport rendering; VS Code should remain a presentation/input host.

## Provenance

- Known Source: exact Workspace bytes recovered from Handoff Package `tiinex-023-1-1-1-1-1-1-1-1-1-1-1-1-anchor-to-anchor.handoff-package(1).zip`, whose package SHA-256 is `24ff7f5b6a4d675d512fb0e40b423445fc4acfbf1e59ea3756061828cc2cacfa`.
- Preservation Basis: bounded local edits only in the VS Code Workspace; Core, Native and OpenAI Interop semantic sources remained unchanged during this host tranche.
- Provenance Limits: the container could not reinstall the repository's exact dev dependency chain from npm because registry DNS/cache access was unavailable, so a fresh canonical `npm run build` with `@types/vscode@1.95.0` is not claimed by this Evidence.

## Evidence Material

- Material: source diff, real carrier projection, full VS Code runtime regression, focused Core Entry/Target regression and environment-bound build observation.
- Material Kind: local implementation/regression evidence.
- Host Source Changes: `src/tiinex/bootstrap.ts` exposes optional Target projection fields and forwards `--target-entry-id`; `src/operatorTrees.ts` presents `Guided Entry · What` followed by optional `Guided Entry · Where (optional)` from Core-projected options; `test/run.mjs` covers target forwarding, positional-runner compatibility and no OpenAI hardcoding; `.vscode/tasks.json` corrects the pre-existing Local build shortcut from default Test group to non-default Build group so the repository's own intended verification contract is internally consistent.
- Core Ownership Boundary: VS Code asks Core for compatible `targetOptions` only after WHAT selection, displays the projection, and returns the selected Target identity to Core for final rendering. No Target compatibility logic, target-name list or OpenAI capability table is implemented in the host.
- Compatibility Boundary: `projectWorkspaceCarrierEntry` accepts the new Target identity while detecting the pre-WHERE positional `ProcessRunner` call shape, preventing an accidental API break for older host/test callers.
- Real Carrier Projection: exact current carrier plus Core/Native/OpenAI content projects WHAT values `Explore`, `Resume`, `Start`, `Custom`; WHERE values `Generic / no target`, `ChatGPT Web`; selecting `Explore + ChatGPT Web` returns status `ready`, canonical target `openai.chatgpt.web`, and transport containing both `Entry intent: Explore` and `Target intent: ChatGPT Web`.
- VS Code Runtime Regression: full bridge runtime suite passes `147/147` after the pre-existing task-group mismatch is corrected; the newly added WHAT/WHERE tests are included in that count.
- Core Focused Regression: `test/entry-catalog.test.mjs` plus `test/workspace-entry-projection.test.mjs` pass `16/16` against exact current Native, Business and OpenAI Interop roots.
- TypeScript Environment Observation: an ordinary `npm ci --ignore-scripts --offline` cannot restore `undici-types`; an online attempt fails with npm registry DNS `EAI_AGAIN`. The TypeScript source changes transpile successfully and the generated runtime behavior is exercised by the regression suite, but fresh repository-wide typecheck/build with the exact locked dev dependencies remains an external-environment gate rather than a product pass claimed here.

## Preservation And Fidelity

- Preservation State: provider-neutral Target semantics remain Core-owned; OpenAI-specific material remains in `interop-openai`; no legacy Entry/Work/Process migration or remote mutation occurred.
- Fidelity Notes: the UI order is explicitly WHAT -> WHERE -> optional Role/Participants, matching the current Entry composition model while preserving existing routed-Handoff authority and session-role behavior.
- Known Losses: none in canonical artifact/source semantics; generated `dist/` and `node_modules/` are ignored development/runtime surfaces and are not authority.

## Interpretation Limits

- Not Yet Used As: release acceptance, migration authority, Task closure, or remote-mutation evidence
- Does Not Prove: VSIX release readiness, Marketplace publication readiness, extension-host GUI interaction on a real desktop, or a clean canonical TypeScript build in an environment where the exact locked npm dev dependencies can be installed.
- Must Not Be Treated As: permission to hardcode provider Targets in VS Code, move legacy Entries into `what/`, migrate Work trees, close Task 018, perform remote Git mutation, or claim broader P1 architecture acceptance.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-vs-code-guided-entry-what-where-presentation.trace.md](001-vs-code-guided-entry-what-where-presentation.trace.md)
  - Value: 3HmodjVCrGj59v_BFu_GDFDeRJq5F5rJTUnbxSh8gqI

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: wl891nGHR7WLG0De6D3C0ZDwlL2SyvduDc_W1apZuDA