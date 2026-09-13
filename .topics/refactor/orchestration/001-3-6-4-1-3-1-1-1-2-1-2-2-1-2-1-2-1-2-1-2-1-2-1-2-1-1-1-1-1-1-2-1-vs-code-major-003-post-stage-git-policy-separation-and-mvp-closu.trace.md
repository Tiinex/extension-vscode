# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-12 23:39:41
  - Trace: [001-3-6-4-1-3-1-1-1-2-1-2-2-1-2-1-2-1-2-1-2-1-2-1-2-1-1-1-1-1-1-2-kodax-to-anchor-vs-code-major-003-mvp-commit-policy-and-authorin.trace.md](001-3-6-4-1-3-1-1-1-2-1-2-2-1-2-1-2-1-2-1-2-1-2-1-2-1-1-1-1-1-1-2-kodax-to-anchor-vs-code-major-003-mvp-commit-policy-and-authorin.trace.md)
  - Origin:
    - [relative](001-3-6-4-1-3-1-1-1-2-1-2-2-1-2-1-2-1-2-1-2-1-2-1-2-1-1-1-1-1-1-2-kodax-to-anchor-vs-code-major-003-mvp-commit-policy-and-authorin.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-13 10:19:45
  - Authors: Anchor
  - Why: Sigma confirmed that staging triggers correctly but commit is incorrectly blocked by artifact validator findings; staging must remain the operator's Git selection boundary while qualified manufacture remains strict.
  - Summary: Separate ordinary post-stage Git commit/push automation from Tiinex artifact qualification while preserving auto-stage and authoring/Handoff MVP behavior.
  - Status: ready/local

---

# VS Code Major 003 — Post-Stage Git Policy Separation And MVP Closure

## Objective

Correct the remaining post-stage behavior so Git commit/push automation follows the operator's staged selection without re-running Tiinex artifact qualification in the commit path, while preserving the already-live-accepted auto-stage behavior and the existing authoring/Handoff attachment MVP surface.

## Sigma Live Evidence

- The extension loads and Incoming Merge/Replace auto-staging now works on Windows.
- Manual staging correctly triggers the post-stage watcher.
- Current post-stage behavior then performs Tiinex qualification/validation and can block commit on artifact-closure findings, including findings on non-staged Parents.
- Sigma explicitly owns qualification before staging when qualification is desired. Staging is the operator's explicit Git selection boundary; ordinary Git commit/push must remain usable for WIP, RFCs, intentionally incomplete artifacts, and other non-qualified states.
- A staged Tiinex artifact may legitimately reference a Parent that is not staged; Parent qualification is not a prerequisite for writing ordinary Git history.


## Done Criteria

- Ordinary post-stage commit/push no longer runs Tiinex artifact qualification as a blocking gate.
- `do-nothing`, `ask`, `commit`, and `commit-push` operate on the explicit staged selection with existing Git safety and idempotence preserved.
- Manual staging participates regardless of `tiinex.landing.stage`.
- Qualified manufacture/Recovery/acceptance/release boundaries remain strict and unchanged.
- New Artifact / Feedback / Handoff plus Attach-to-Outgoing / Pack remain functional and discoverable.
- Exact `npm run dev:build` and broad existing validation pass before implementation-ready return.
- Kodax returns actual candidate bytes; Sigma is not asked to patch or debug ordinary repository health.

## Dependencies

- Latest qualified Extension VS Code Major 003 candidate workspace from Kodax.
- Carried Business Role/process context for Anchor/Kodax responsibility boundaries.
- Exact lockfile dependency set/toolchain for build and broad validation.
- Existing Core/Docs qualification semantics remain read-only shared authority.
- Sigma only for the smallest unavoidable Windows host observation after Kodax completes ordinary technical validation.

## Product Contract

Keep these responsibilities separate:

- Validation/qualification decides what Tiinex may call qualified/correct.
- Staging decides what the operator intends to include in the next Git commit.
- Commit records Git history.
- Push transports Git history.

The post-stage Git automation must therefore detect only whether relevant Tiinex material is present in the staged selection and then apply the configured post-stage policy. It must not re-run artifact validation/qualification as a commit blocker.

### Policies

- `do-nothing`: leave staged state intact; no Tiinex commit or push action.
- `ask`: once per stable staged Tiinex state, ask whether to commit. Decline leaves staging intact. Accept commits exactly the staged selection; no push implied.
- `commit`: commit exactly the staged selection automatically.
- `commit-push`: commit exactly the staged selection, then push only the exact commit created by that same invocation under existing branch/upstream/exact-push safety rules.

The policy is independent of `tiinex.landing.stage`. Manual staging must participate even when auto-stage is disabled.

Do not Stage-All. Do not silently include unrelated unstaged work. Preserve debounce/idempotence and Git conflict/branch/upstream safety. Remove only qualification/validator gating that incorrectly owns the commit boundary; do not weaken qualification requirements for Handoff manufacture, Recovery, accepted returns, release, or other explicitly qualified operations.

## Authoring And Handoff MVP Surface

Preserve and live-qualify the already-present:

- New Artifact
- New Feedback
- New Handoff
- Attach Handoff to Outgoing
- Outgoing Pack carrying the intentionally attached Handoff

Do not invent VS Code-private artifact semantics. Repair only discoverability/wiring proven broken.

## Validation Discipline

- Exact locked toolchain first.
- `npm run dev:build` must pass before implementation-ready return.
- Run broad existing repository validation.
- Prefer coarse repository health and end-to-end/operator-flow evidence over helper-level test proliferation.
- Add focused tests only where they protect the responsibility boundary itself (for example: validator findings do not block ordinary commit, while qualified manufacture remains strict).
- Kodax owns diagnosis, implementation, validation, and technical conclusion. Sigma must not patch source or perform ordinary debugging.

## Windows Acceptance Target

Return the smallest live gate that demonstrates:

1. Manually stage Tiinex material that has known qualification findings or an unstaged Parent; `ask` still prompts and accepted commit succeeds with exactly the staged selection.
2. `do-nothing` leaves staged state untouched.
3. `commit` commits exactly staged state.
4. `commit-push` commits then pushes only the exact created commit under existing Git safety rules.
5. `tiinex.landing.stage = no` does not disable post-stage policy for manual staging.
6. Authoring and Attach-to-Outgoing / Pack flow still work.

## Scope

VS Code Major 003 MVP closure only: post-stage Git-policy responsibility separation, associated UX/documentation, and preservation/live qualification of authoring/attachment behavior.

## Exclusions

- No Core/Docs semantic changes.
- No artifact population normalization under this Task.
- No weakening of qualified Handoff/Recovery/release gates.
- No release or Marketplace publication.
- No loose patch/manual source application for Sigma.

## Return Boundary

Return one qualified Kodax-to-Anchor carrier containing actual candidate workspace bytes, exact source delta, coarse build/broad validation receipt, operator-flow evidence, and only the smallest unavoidable Sigma Windows gate.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-3-6-4-1-3-1-1-1-2-1-2-2-1-2-1-2-1-2-1-2-1-2-1-2-1-1-1-1-1-1-2-kodax-to-anchor-vs-code-major-003-mvp-commit-policy-and-authorin.trace.md](001-3-6-4-1-3-1-1-1-2-1-2-2-1-2-1-2-1-2-1-2-1-2-1-2-1-1-1-1-1-1-2-kodax-to-anchor-vs-code-major-003-mvp-commit-policy-and-authorin.trace.md)
  - Value: oNTvlm79JV-E9mPr8vOsoRxpsnlcuwp7c9qQfYUn6Z0

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: 1FKrZtxtrfWZiqZRh9zuM4beuz5DV5Ed5ZJrxBNwwtY