# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.evidence.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/core/evidence/tiinex.evidence.v1.schema.md)
  - Created At: 2026-10-08 18:34:36
  - Authors: Anchor
  - Why: Reduce the remaining Windows Operator Party wait without changing Core/Native authority or release scope.
  - Summary: VS Code pickup of already-qualified Workspace roots and Core Role/Party picker projection avoids duplicate discovery and selected-role requery.
  - Status: ready/local

---

# Operator Party Picker Repeated Qualification Latency Candidate

## Supported Claim Or Question

- Supported Claim Or Question: Which redundant host-side discovery steps remain on the Operator Party picker after Windows first Markdown Preview improves to roughly 6–12 seconds, and can those steps be eliminated without weakening Core authority?
- Evidence Role: bounded VS Code host performance repair candidate, isolated test results and acceptance boundary.
- Review Context: Sigma reported that first Markdown Preview and the Operator Party picker now each take roughly 6–12 seconds, a substantial improvement over the earlier ~1m20s Preview delay, while wanting Role Discovery still faster.

## Provenance

- Known Source: direct Sigma Windows timing report on 2026-10-08; exact carried `src/operatorParty.ts`, `src/operatorTrees.ts` and `src/packageBuilder.ts` in the preceding canonical 17-Workspace package; isolated TypeScript-transpiled host tests and static source audit.
- Preservation Basis: full qualified vscode Workspace source snapshot and its `test/run.mjs` regression assertions in the next Tiinex carrier.
- Provenance Limits: the 6–12-second host timing is Sigma's estimate, not a fresh instrumented Windows benchmark; isolated host mocks cannot prove a particular new latency in seconds.

## Evidence Material

- Material Kind: repeated discovery path and bounded repair.
- Material: `TiinexOperatorTrees.start()` already primes its `localWorkspaceChoices()` promise and invalidates it when `.topics` files or Workspace folders change. `TiinexOperatorTrees.pickOperatorParty()` previously ignored that per-host promise and invoked `pickOperatorParty(extensionPath)` which called `loadQualifiedLocalWorkspaceChoices()` again, redundantly discovering open Workspace roots.
- Minimal Source Change: the button passes `() => this.localWorkspaceChoices()` into `pickOperatorParty`, reusing the in-flight or finished Core-qualified roots and established host invalidation. The picker still independently qualifies all visible Role/Party candidates with bounded, ordered Core projections per qualified Workspace; it does not infer a Role from filenames or skip invalid/duplicate identities.
- Second Redundant Step: after a selected Role/Party was already represented in the same Core-qualified picker surface, the picker previously called `resolveOperatorParty` again and repeated the Core projection merely to report the selected result. The new `resolvedPartyFromQualifiedSurface` helper performs the same exact-target match against that existing qualified snapshot. Later authoring and transport continue their own authoritative gates. None/Manual retain their explicit no-discovery path.
- Verification: isolated functional/mocked tests exercised independently scoped Workspace qualification, stable order, duplicate Workspace ID refusal, reuse of prefetched Workspace choices, exactly one Role/Party surface projection for selecting a qualified candidate, cancellation, None, Manual and separate incoming role resolution. All tests passed in the local runtime; 71 TypeScript/TSX source files parsed with zero errors, `test/run.mjs` passed JS syntax checking, and `npm run release:audit` returned ready with zero errors/warnings.

## Preservation And Fidelity

- Preservation State: exact code delta and permanent source regression assertions in the qualified VS Code Workspace, plus this Evidence.
- Fidelity Notes: the code eliminates duplicate steps but does not change the first-time Core qualifications required for an untouched repository.
- Known Losses: no full `npm run dev:build:local` or end-to-end Windows picker latency number from this repair; no claim of a restored historical 3–6-second experience.

## Interpretation Limits

- Not Yet Used As: final Windows acceptance, complete TS typecheck, release clearance or permission to change Core/Native semantics.
- Does Not Prove: cold first-click Role Discovery is faster if no Workspace choices have yet been qualified, or that all role candidates can be safely cached indefinitely.
- Must Not Be Treated As: permission to bypass fail-closed identity collisions or return a guessed stale role for a changed Workspace.
- Need For Review: Sigma uses canonical Incoming Replace → build → reload, then compares first and second Operator Party picker opens (plus selecting Anchor), logs `Tiinex Operator Party discovery` and `Tiinex Operator Party qualification` times, and retests first Markdown Preview and Outgoing as smoke gates. If Role qualification remains >~6 seconds on the second open, inspect Core projection cost before introducing caching or a separate targeted projector.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: TnRLfYuPszEBu85MHe42Bb8wsOY4YovB965D6aqS3oY