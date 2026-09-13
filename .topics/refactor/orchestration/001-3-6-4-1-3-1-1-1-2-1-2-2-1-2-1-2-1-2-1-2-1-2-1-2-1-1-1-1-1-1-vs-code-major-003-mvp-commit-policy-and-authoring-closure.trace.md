# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-12 22:49:54
  - Trace: [001-3-6-4-1-3-1-1-1-2-1-2-2-1-2-1-2-1-2-1-2-1-2-1-2-1-1-1-1-1-anchor-to-sigma-vs-code-major-003-incoming-auto-stage-windows-ga.trace.md](001-3-6-4-1-3-1-1-1-2-1-2-2-1-2-1-2-1-2-1-2-1-2-1-2-1-1-1-1-1-anchor-to-sigma-vs-code-major-003-incoming-auto-stage-windows-ga.trace.md)
  - Origin:
    - [relative](001-3-6-4-1-3-1-1-1-2-1-2-2-1-2-1-2-1-2-1-2-1-2-1-2-1-1-1-1-1-anchor-to-sigma-vs-code-major-003-incoming-auto-stage-windows-ga.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-12 23:15:17
  - Authors: Anchor
  - Why: Sigma live-accepted extension lifecycle and Incoming auto-staging, then identified the remaining MVP gaps: post-stage commit/push behavior and operator-visible artifact/Handoff authoring/attachment.
  - Summary: Close the remaining live VS Code MVP surface: post-stage Ask/Commit/Commit+Push semantics independent of auto-staging, plus live qualification of generic artifact authoring and Handoff attachment.
  - Status: ready/local

---

# VS Code Major 003 — MVP Commit Policy And Authoring Closure

## Objective

Close the remaining live-operator gaps for VS Code Major 003 after Sigma confirmed that the extension loads normally again and Incoming Merge/Replace auto-staging now works on Windows. The remaining MVP surface is post-stage commit/push behavior plus live discoverability and qualification of the already-implemented generic artifact authoring and Handoff-to-Outgoing flow.

## Sigma Live Evidence

- The current Windows extension loads without the previously observed lifecycle/provider regression.
- `tiinex.landing.stage = yes` now stages successful Incoming Merge/Replace results as intended.
- Sigma was not prompted to commit after staging. Current source inspection shows `tiinex.git.postStagePolicy` currently exposes `do-nothing`, `commit`, and `commit-push`; there is no operator `ask` policy.
- The post-stage watcher is intentionally independent of Incoming auto-staging and observes stable Git staged state, so manual staging can be a valid trigger when the staged closure contains qualified Tiinex material and existing safety gates pass.
- Generic authoring and Handoff attachment commands already exist in the current source (`New Artifact`, `New Feedback`, `New Handoff`, `Attach Handoff to Outgoing`). Treat this as a live discoverability/behavior qualification problem first, not permission to reimplement schema or transport semantics.


## Done Criteria

- Post-stage policy exposes `do-nothing`, `ask`, `commit`, and `commit-push` with the bounded semantics below.
- Manually staged qualified Tiinex material participates in post-stage evaluation independently of `tiinex.landing.stage`.
- `ask` prompts once per stable qualifying staged state; decline leaves staging intact, accept creates the local commit, and no push is implied.
- `commit` and `commit-push` preserve existing validation, conflict, unstaged-remainder, branch/upstream, and exact-push safety gates.
- Generic Artifact/Feedback/Handoff authoring is live-discoverable and Handoff attachment to Outgoing works for new or existing qualified Handoffs without mutating artifact semantics.
- Exact `npm run dev:build` and broad existing validation pass before implementation-ready return.
- Kodax returns actual candidate bytes and a minimal Windows acceptance gate; no loose patch or ordinary debugging is shifted to Sigma.

## Dependencies

- Current Extension VS Code Major 003 Workspace including the live-accepted Incoming auto-stage repair and existing generic authoring implementation.
- Current Business Role/process context for Anchor/Kodax authority and qualified-return discipline.
- Exact lockfile dependency set/toolchain for build and broad validation.
- Existing Core/Docs artifact creation and transport semantics as read-only shared authority.
- Sigma only for the smallest unavoidable Windows live-host acceptance after Kodax has completed ordinary technical validation.

## Product Contract

### Post-Stage Commit Policy

Keep `tiinex.landing.stage` and post-stage commit policy independent.

The post-stage policy must support an operator-readable progression equivalent to:

- `do-nothing`: staged changes remain staged; no Tiinex commit or push is initiated.
- `ask`: when a stable staged closure qualifies, prompt the operator whether to create the Tiinex commit. Declining leaves the staged state intact. Accepting creates the reviewed/derived local commit but does not imply push.
- `commit`: automatically create the qualified local Tiinex commit after the existing safety/validation gates pass.
- `commit-push`: apply the same commit gates, then push only the exact commit created by that same qualified invocation under the existing push-safety rules.

The policy is driven by qualified staged Tiinex state, not by who staged it. Therefore manual Source Control staging containing a qualified Tiinex artifact must participate in the same post-stage policy even when `tiinex.landing.stage = no` or no Incoming operation occurred.

Do not Stage-All in background automation. Preserve debounce/idempotence so an unchanged staged state does not repeatedly prompt or commit. Preserve existing conflict, unstaged-remainder, qualified-Tiinex, validation, branch/upstream and exact-push safety boundaries.

### Artifact Authoring And Handoff Attachment

Qualify the already-present generic authoring surface in the real operator UX:

- `New Artifact` is discoverable without requiring command-name archaeology and remains Core/schema-driven.
- `New Feedback` and `New Handoff` remain shortcuts through the same generic create flow rather than private host schemas.
- Creating a Handoff while an eligible Outgoing context exists can intentionally attach it to Outgoing after the exact reviewed bytes are written and re-qualified.
- An existing qualified Handoff can be attached intentionally to an eligible Outgoing context without changing the Handoff artifact bytes or semantics.
- Packing Outgoing includes the intentionally attached Handoff route/package material as defined by the existing transport model.

If these authoring/attachment behaviors already work, avoid code churn; return precise live acceptance instructions and only repair discoverability or broken wiring actually demonstrated by evidence.

## Validation Discipline

- Exact locked dependencies/toolchain first.
- `npm run dev:build` must pass before implementation-ready return.
- Run the broadest existing repository validation available without dependency substitution.
- Prefer coarse repository health and operator-flow/integration evidence over adding helper-level microtests for every branch.
- Focused tests are supporting evidence only where they prove a gap not covered by the coarse gates.
- Kodax owns diagnosis, implementation, build health, validation and technical conclusion. Sigma is only a bounded real-Windows observation surface where host behavior cannot be proven in Kodax's environment.

## Windows Acceptance Target

Return a minimal live-host gate covering:

1. `do-nothing`: manually stage qualified Tiinex material; no prompt/commit occurs.
2. `ask`: manually stage qualified Tiinex material; one clear prompt occurs; decline leaves staging intact; accept creates the local commit.
3. `commit`: qualifying staged Tiinex material auto-commits after gates pass.
4. `commit-push`: qualifying staged Tiinex material commits and then pushes only the exact created commit under existing push safety.
5. `tiinex.landing.stage = no` does not disable the post-stage policy for manually staged qualified Tiinex material.
6. `New Artifact` / `New Feedback` / `New Handoff` are readily discoverable.
7. A new or existing qualified Handoff can be attached to Outgoing and is reflected in the resulting package/route flow without mutating its artifact bytes.

## Scope

Extension VS Code Major 003 MVP closure only: post-stage policy operator semantics, live authoring discoverability, Handoff attachment wiring/UX, documentation, and the minimum validation needed to prove these surfaces.

## Exclusions

- No Core or Docs semantic changes. Return an exact blocker to Anchor if shared authority is insufficient.
- No schema duplication or VS Code-private artifact semantics.
- No release, Marketplace publication, unrelated feature work, or remote push except the explicit bounded live acceptance of `commit-push` when Sigma elects to perform it.
- No loose patch/manual source application for Sigma.

## Return Boundary

Return one qualified Kodax-to-Anchor carrier containing the actual candidate workspace bytes, exact source delta, coarse build/broad validation receipt, operator-flow evidence, and the smallest remaining Windows gate. Do not claim Major 003 MVP completion until Sigma live acceptance confirms the intended operator behavior.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-3-6-4-1-3-1-1-1-2-1-2-2-1-2-1-2-1-2-1-2-1-2-1-2-1-1-1-1-1-anchor-to-sigma-vs-code-major-003-incoming-auto-stage-windows-ga.trace.md](001-3-6-4-1-3-1-1-1-2-1-2-2-1-2-1-2-1-2-1-2-1-2-1-2-1-1-1-1-1-anchor-to-sigma-vs-code-major-003-incoming-auto-stage-windows-ga.trace.md)
  - Value: Mn122Uwn5jfZeF1X0xwFA8-Kx-4ptDGLP1imyGAQSQc

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: nznqTBhxtXAFmZ72A_Irm2MBWJFGRsYLxWwxdDjxLyE