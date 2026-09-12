# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-12 20:29:38
  - Trace: [001-3-6-4-1-3-1-1-1-2-1-2-2-1-2-1-2-1-2-1-2-1-2-kodax-to-anchor-vs-code-major-003-activation-and-refresh-lifecyc.trace.md](001-3-6-4-1-3-1-1-1-2-1-2-2-1-2-1-2-1-2-1-2-1-2-kodax-to-anchor-vs-code-major-003-activation-and-refresh-lifecyc.trace.md)
  - Origin:
    - [relative](001-3-6-4-1-3-1-1-1-2-1-2-2-1-2-1-2-1-2-1-2-1-2-kodax-to-anchor-vs-code-major-003-activation-and-refresh-lifecyc.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-12 20:43:21
  - Authors: Anchor
  - Why: Sigma's real Windows npm run dev:build exposed a TypeScript compile failure that focused tests did not detect; restore build cleanliness and validation discipline without per-feature test bloat.
  - Summary: Repair the compile-broken Major 003 source baseline and require a coarse exact-toolchain compile/typecheck gate before implementation-ready return.
  - Status: ready/local

---

# VS Code Major 003 — Build Cleanliness And Validation Gate Repair

## Objective

Restore a build-clean Extension VS Code Major 003 baseline after Sigma's real Windows `npm run dev:build` gate failed with TypeScript error TS2345 in `src/operatorTrees.ts:681`. Treat this as a release-blocking/review-blocking source-integrity failure, not as a request for another feature-specific regression test.

## Live Evidence

- Sigma ran the ordinary development build on the real Windows checkout after the lifecycle return.
- `tsc -p tsconfig.json` fails at `src/operatorTrees.ts:681` because `existing?.routeIds` has type `string[] | null | undefined` while `qualifyTransportPackage(...)` requires `string[] | null`.
- The failing line was already present in the prior Transport filename/icon checkpoint and was not introduced by the lifecycle repair.
- Therefore the previous focused regression frontier was insufficient to establish a build-clean source baseline. The lifecycle work may still be useful, but the Major cannot proceed while the ordinary compile gate fails.

## Done Criteria

- Mechanically explain how the compile-broken Transport source escaped the prior return and how that interacts with the previously observed clean/build/restart lifecycle failure.
- Fix the source-level TypeScript error at the correct semantic boundary without weakening types, using `any`, suppressing diagnostics, or changing shared Core/Docs semantics.
- Preserve the live-confirmed canonical Transport package filename and package-vs-text visual distinction.
- Preserve the lifecycle hardening only to the extent it remains justified after the source baseline compiles; do not use lifecycle resilience to hide a failed build.
- Establish one coarse repository health gate: the ordinary locked-toolchain `npm run dev:build` or equivalent TypeScript build/typecheck must succeed before the checkpoint is presented as implementation-ready.
- Do not add a bespoke regression test merely to prove this TypeScript assignment. Existing focused tests may remain, but compile/typecheck is the primary detector for this class of failure.
- Run the broadest existing validation available without dependency substitution. If Kodax cannot obtain the exact locked dependencies in its execution host, keep the chat active and ask Sigma for the smallest coarse real-host command needed to prove build cleanliness before authoring a ready return.
- After build cleanliness is proven, request only the minimal Windows lifecycle observation still needed to confirm Discovery/Incoming/Outgoing/Transport providers and refresh commands survive the ordinary build/restart path.

## Scope

Extension VS Code Major 003 source/build integrity, the minimum source correction for the compile failure, and revalidation of the immediately related lifecycle/Transport checkpoint.

## Dependencies

- Exact locked Extension VS Code toolchain for the ordinary `npm run dev:build` / TypeScript compile gate.
- Sigma may act only as the minimal real Windows execution surface if Kodax cannot obtain that exact toolchain in its host; Sigma does not own diagnosis or source repair.

## Exclusions

- No Core/Docs semantic changes.
- No dependency-version substitution, type suppression, `any` escape hatch, release, Marketplace publication, push, deployment, or unrelated feature work.
- No proliferation of per-feature tests when the ordinary compile/typecheck gate already detects the defect class.

## Return Boundary

Return one repo-local checkpoint to Anchor only after the source baseline is demonstrably build-clean under the exact locked toolchain (locally or via a minimal Sigma real-host gate), with the root-cause explanation, exact source delta, validation receipt, and any remaining live-host lifecycle observation stated separately.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-3-6-4-1-3-1-1-1-2-1-2-2-1-2-1-2-1-2-1-2-1-2-kodax-to-anchor-vs-code-major-003-activation-and-refresh-lifecyc.trace.md](001-3-6-4-1-3-1-1-1-2-1-2-2-1-2-1-2-1-2-1-2-1-2-kodax-to-anchor-vs-code-major-003-activation-and-refresh-lifecyc.trace.md)
  - Value: xJu5ZfyC6Fmo3zxDJN3ehVcsH7mcly8djVbCpsjDZNk

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: 7cBm5dTkQ_jG9CNj-Wv708uFid9wOEPc43i8syOlGYo