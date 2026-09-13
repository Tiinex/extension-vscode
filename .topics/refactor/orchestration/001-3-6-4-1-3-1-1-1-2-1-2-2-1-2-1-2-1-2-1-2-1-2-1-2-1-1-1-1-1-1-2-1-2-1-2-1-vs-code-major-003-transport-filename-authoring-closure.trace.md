# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-13 12:12:21
  - Trace: [001-3-6-4-1-3-1-1-1-2-1-2-2-1-2-1-2-1-2-1-2-1-2-1-2-1-1-1-1-1-1-2-1-2-1-2-kodax-to-anchor-vs-code-major-003-operation-scoped-ask-and-ask-d.trace.md](001-3-6-4-1-3-1-1-1-2-1-2-2-1-2-1-2-1-2-1-2-1-2-1-2-1-1-1-1-1-1-2-1-2-1-2-kodax-to-anchor-vs-code-major-003-operation-scoped-ask-and-ask-d.trace.md)
  - Origin:
    - [relative](001-3-6-4-1-3-1-1-1-2-1-2-2-1-2-1-2-1-2-1-2-1-2-1-2-1-1-1-1-1-1-2-1-2-1-2-kodax-to-anchor-vs-code-major-003-operation-scoped-ask-and-ask-d.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-13 12:29:19
  - Authors: Anchor
  - Why: Sigma live-accepted auto-stage, commit, and push, but Transport Copy Package still pastes into ChatGPT as a UUID filename and artifact/handoff authoring plus Attach-to-Outgoing remain unverified.
  - Summary: Close the remaining VS Code MVP transport filename fidelity and generic authoring/attach/pack gaps after Sigma live-accepted Git automation.
  - Status: ready/local

---

# VS Code Major 003 Transport Filename + Authoring Closure

## Objective
Close the remaining VS Code MVP operator gaps after Sigma live-accepted auto-stage, commit, and push behavior.

## Accepted Baseline
- Auto-stage is live-accepted by Sigma.
- Post-stage `ask`, local commit, and push behavior are live-accepted by Sigma.
- Commit message behavior is accepted.
- Do not re-open those product decisions except to prevent a demonstrated regression.

## Scope
- Diagnose and fix `Transport > Copy Package` so pasting the copied carrier into ChatGPT preserves the actual Tiinex carrier basename instead of a generated UUID filename.
- Treat Windows Explorer copy/paste into ChatGPT as the live reference behavior: the original carrier filename is preserved there.
- Preserve exact carrier bytes and current transport-text behavior.
- Verify the generic authoring surfaces live enough for MVP:
  - New Artifact
  - New Feedback
  - New Handoff
  - Attach Handoff to Outgoing
  - Pack includes the attached qualified Handoff route.
- Prefer proving existing behavior over rewriting working authoring code.
- Preserve validation / stage / commit / push separation.
- Do not add shadow Markdown documentation beyond the repository's minimal README unless the controlling Tiinex artifact model genuinely requires it.
- No Core/Docs semantic changes, dependency substitution, release, Marketplace publication, or unrelated feature work.

## Dependencies
- Current qualified Extension VS Code Workspace returned by Kodax.
- Sigma live acceptance of auto-stage, ask/commit/commit-push behavior.
- Exact supported locked toolchain where available.

## Validation Ownership
Kodax owns diagnosis, implementation, ordinary build/compile health, relevant broad validation, focused evidence only where it adds value, and the return carrier. Sigma must not be asked to patch source, debug ordinary repository health, or repair dependencies.

## Live Acceptance Needed
Use Sigma only for the smallest Windows/ChatGPT observation that cannot be proven in the execution host:
- Copy Package -> paste into ChatGPT -> report displayed filename.
- Author/create/attach/pack interaction where host UI behavior needs confirmation.

## Done Criteria
- Exact supported toolchain ordinary build/compile passes, or the environment blocker is returned explicitly without implementation-ready claims.
- Broad existing validation passes where the environment permits.
- Copy Package preserves the original carrier basename when pasted into ChatGPT, matching Explorer-style behavior.
- New Artifact / Feedback / Handoff are discoverable and usable.
- A created or existing qualified Handoff can be attached to Outgoing and the packed carrier contains that route.
- No regression of accepted auto-stage / ask / commit / commit-push behavior.
- Return exactly one qualified Kodax -> Anchor Handoff package containing the actual candidate Workspace bytes and explicit evidence/blockers.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-3-6-4-1-3-1-1-1-2-1-2-2-1-2-1-2-1-2-1-2-1-2-1-2-1-1-1-1-1-1-2-1-2-1-2-kodax-to-anchor-vs-code-major-003-operation-scoped-ask-and-ask-d.trace.md](001-3-6-4-1-3-1-1-1-2-1-2-2-1-2-1-2-1-2-1-2-1-2-1-2-1-1-1-1-1-1-2-1-2-1-2-kodax-to-anchor-vs-code-major-003-operation-scoped-ask-and-ask-d.trace.md)
  - Value: ovfTVg9ey2UiwJGeU-YTWnUAoQe2oygXW-fN4TpwFJ4

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: M2pme-v1-QeZczlFbpws0_23Dgze29ttUG6PUzeGc7Q