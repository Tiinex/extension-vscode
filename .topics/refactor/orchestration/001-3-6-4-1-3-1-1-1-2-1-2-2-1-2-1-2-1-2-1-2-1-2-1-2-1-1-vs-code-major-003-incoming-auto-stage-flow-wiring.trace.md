# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-12 21:14:34
  - Trace: [001-3-6-4-1-3-1-1-1-2-1-2-2-1-2-1-2-1-2-1-2-1-2-1-2-1-anchor-to-sigma-vs-code-major-003-exact-windows-build-and-lifecy.trace.md](001-3-6-4-1-3-1-1-1-2-1-2-2-1-2-1-2-1-2-1-2-1-2-1-2-1-anchor-to-sigma-vs-code-major-003-exact-windows-build-and-lifecy.trace.md)
  - Origin:
    - [relative](001-3-6-4-1-3-1-1-1-2-1-2-2-1-2-1-2-1-2-1-2-1-2-1-2-1-anchor-to-sigma-vs-code-major-003-exact-windows-build-and-lifecy.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-12 21:57:49
  - Authors: Anchor
  - Why: Sigma live Windows observation shows Landing: Stage=yes is configured but Incoming Merge/Replace does not reliably stage landed changes; source audit shows the newer incomingApply path bypasses the existing staging seam.
  - Summary: Wire the existing landing stage policy through real Incoming Merge/Replace flows with coarse build and integration proof.
  - Status: ready/local

---

# VS Code Major 003 — Incoming Auto-Stage Flow Wiring

## Objective

Restore the documented `tiinex.landing.stage = yes` behavior for the actual Incoming Merge and Replace operator flows without weakening dirty-work safety, duplicating staging semantics, or adding narrow tests that merely mirror implementation details.

## Live Evidence

- Sigma's real Windows extension is loading again and no lifecycle regression is currently observed.
- Extension settings show `Landing: Stage = yes`.
- After Incoming Merge/Replace, landed changes are not reliably staged as the setting promises.
- Anchor source audit found the existing staging policy and `stageLandingChanges(...)` path in `src/landing.ts`, while the newer Incoming Merge/Replace flow in `src/incomingApply.ts` does not consume that policy or invoke the staging path.
- Git-native merge may incidentally affect the index, but that is not evidence that Tiinex's declared stage policy is wired through every successful Incoming mutation path.

## Done Criteria

- Trace the complete successful Incoming Merge and Replace operator paths and explain precisely where post-landing staging is currently lost.
- Reuse the existing stage-policy semantics rather than inventing a second VS Code-only policy.
- When `tiinex.landing.stage = yes`, successful safe Merge/Replace outcomes stage the Tiinex-landed closure as intended.
- When staging is disabled, the same flows remain unstaged.
- Preserve the existing protection against absorbing unrelated pre-existing human dirty work; Preserve+Merge or equivalent dirty-work conditions must fail safe rather than staging foreign changes.
- Preserve the already live-confirmed Transport filename fidelity, distinct Package/Text actions, extension activation/restart behavior, and the current build-cleanliness repair.
- Run coarse repository health before claiming readiness: exact locked-toolchain `npm run dev:build` must pass, followed by the broadest existing validation that can run without dependency substitution.
- Add or adjust only integration/flow coverage that proves the operator contract where existing coverage is missing; do not create one microtest per helper or implementation branch.
- If the execution host cannot obtain the exact locked dependencies, keep the work explicitly blocked rather than shifting patch/source application or ordinary debugging to Sigma.

## Scope

Extension VS Code Major 003 Incoming Merge/Replace staging wiring and the minimum integration evidence required to prove the documented operator behavior.

## Dependencies

- Current Extension VS Code Major 003 candidate bytes carried from the qualified Kodax return.
- Existing `tiinex.landing.stage` policy and landing staging implementation in the current workspace.
- Exact locked Extension VS Code toolchain for `npm run dev:build` and broad validation.
- Sigma only for the smallest unavoidable Windows live observation after Kodax has completed ordinary technical validation.

## Exclusions

- No Core/Docs semantic changes.
- No dependency substitution, type suppression, release, Marketplace publication, push, deployment, or unrelated feature work.
- No manual Git patch/source-application step for Sigma.
- Do not broaden into generic Git automation redesign unless the existing stage-policy seam is demonstrably insufficient; surface that as a separate owner/scope finding instead.

## Return Boundary

Return one qualified Kodax-to-Anchor carrier containing the actual candidate workspace bytes, root-cause explanation, exact source delta, coarse build/validation receipt, integration evidence, and any remaining minimal Windows observation. Do not return a loose patch or ask Sigma to repair source.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-3-6-4-1-3-1-1-1-2-1-2-2-1-2-1-2-1-2-1-2-1-2-1-2-1-anchor-to-sigma-vs-code-major-003-exact-windows-build-and-lifecy.trace.md](001-3-6-4-1-3-1-1-1-2-1-2-2-1-2-1-2-1-2-1-2-1-2-1-2-1-anchor-to-sigma-vs-code-major-003-exact-windows-build-and-lifecy.trace.md)
  - Value: WgkJSd4vHpnMil0ih3nHxT1cp59gkRGIdtoQV7KgUoI

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: swbttpZ87SVQgQass47prpGiWdpP3Dj8ZxHPKxKvL68