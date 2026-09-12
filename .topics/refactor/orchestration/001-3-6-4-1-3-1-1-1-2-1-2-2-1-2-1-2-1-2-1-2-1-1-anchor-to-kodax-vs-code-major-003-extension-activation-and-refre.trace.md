# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-12 20:19:19
  - Trace: [001-3-6-4-1-3-1-1-1-2-1-2-2-1-2-1-2-1-2-1-2-1-vs-code-major-003-extension-activation-and-refresh-lifecycle-reg.trace.md](001-3-6-4-1-3-1-1-1-2-1-2-2-1-2-1-2-1-2-1-2-1-vs-code-major-003-extension-activation-and-refresh-lifecycle-reg.trace.md)
  - Origin:
    - [relative](001-3-6-4-1-3-1-1-1-2-1-2-2-1-2-1-2-1-2-1-2-1-vs-code-major-003-extension-activation-and-refresh-lifecycle-reg.trace.md)
- Current
  - Current Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-12 20:19:54
  - Authors: Anchor
  - Why: Sigma's live Windows video exposed a larger extension lifecycle regression during the filename/icon acceptance observation, so the same Major 003 lane must repair activation/registration before final acceptance.
  - Summary: Delegate the live post-build/restart activation/provider/refresh regression repair to a fresh Kodax while preserving the confirmed Transport filename and icon wins.
  - Status: ready/local

---

# Anchor To Kodax — VS Code Major 003 Extension Activation And Refresh Lifecycle Regression Repair

## Handoff Parties

- Purpose: repair the live post-build/restart Extension VS Code lifecycle regression that can leave Tiinex views without registered data providers and `tiinex.discovery.refresh` unavailable, while preserving the already live-confirmed Transport filename and icon improvements.
- From: Anchor
- From Kind: role
- From Reference: [Anchor Role — Successor Evolution Continuation](business::.topics/roles/001-1-1-1-anchor-successor-evolution-role.trace.md)
- To: Kodax
- To Kind: role
- To Reference: [Kodax Role](business::.topics/roles/001-6-kodax-role.trace.md)

## Transfers

- lifecycle-regression-repair
  - Transfer Kind: work-and-responsibility
  - Description: own the Extension VS Code Major 003 lifecycle investigation and repair. Sigma's Windows video shows Discovery, Incoming, Outgoing and Transport losing their registered data providers after the build/restart sequence and `tiinex.discovery.refresh` returning command-not-found; a later reload/reopen restores Discovery. Reproduce or mechanically explain the lifecycle path, fix the root cause, and add focused regression evidence around activation, command registration and implicated view-provider registration.
  - Controlling Artifact: [Extension Activation And Refresh Lifecycle Regression Repair Task](001-3-6-4-1-3-1-1-1-2-1-2-2-1-2-1-2-1-2-1-2-1-vs-code-major-003-extension-activation-and-refresh-lifecycle-reg.trace.md)
  - Boundary: do not treat a later successful reload as proof that the earlier missing providers/command were harmless; the observed restart/reload path must become reliable or the exact remaining blocker must be returned.

- preserve-transport-wins
  - Transfer Kind: responsibility
  - Description: preserve the previous bounded repair's live-confirmed behavior: Copy Package pastes into ChatGPT with the canonical Tiinex carrier filename instead of a UUID-like basename, and package-vs-transport-text copy actions are visually distinct.
  - Controlling Artifact: [Extension Activation And Refresh Lifecycle Regression Repair Task](001-3-6-4-1-3-1-1-1-2-1-2-2-1-2-1-2-1-2-1-2-1-vs-code-major-003-extension-activation-and-refresh-lifecycle-reg.trace.md)
  - Boundary: lifecycle repair must not regress the accepted filename fidelity or scanability improvement.

- epistemic-ownership
  - Transfer Kind: responsibility
  - Description: Kodax owns the root-cause hypothesis, discriminating experiments, implementation choice and interpretation. If a real Windows/VS Code observation is still required, ask Sigma for the smallest test, state the expected outcomes first, and keep diagnosis with Kodax rather than the human operator.
  - Controlling Artifact: [Extension Activation And Refresh Lifecycle Regression Repair Task](001-3-6-4-1-3-1-1-1-2-1-2-2-1-2-1-2-1-2-1-2-1-vs-code-major-003-extension-activation-and-refresh-lifecycle-reg.trace.md)
  - Boundary: no broad exploratory burden is shifted to Sigma.

## Required Context

- extension-vscode-workspace
  - Material: complete current Extension VS Code Workspace containing the prior filename-fidelity/icon repair and the live-observed lifecycle regression frontier.
  - Material Reference: [Extension VS Code Workspace](extension-vscode::.topics/.workspaces/tiinex-extension-vscode.workspace.md)
  - Purpose: exact repo-local source and regression frontier for the bounded Major 003 continuation.
  - Availability: available

- business-role-context
  - Material: current Business Workspace carrying Anchor and Kodax Role authority used by this Handoff.
  - Material Reference: [Business Workspace](business::.topics/.workspaces/tiinex-business.workspace.md)
  - Purpose: recipient Role grounding and authority boundary.
  - Availability: available

## Reference Context

- prior-kodax-return
  - Material: Kodax-to-Anchor filename-fidelity and scanability repair return whose live Windows test confirmed the filename/icon wins but also exposed the lifecycle regression.
  - Material Reference: [Prior Kodax Return](001-3-6-4-1-3-1-1-1-2-1-2-2-1-2-1-2-1-2-1-2-kodax-to-anchor-vs-code-major-003-transport-filename-fidelity-an.trace.md)
  - Purpose: preserve exact prior delta and qualification limits while continuing the same Major 003 lane.
  - Availability: available

## Retained Responsibilities

- progression-and-final-audit
  - Retained By: Anchor
  - Responsibility: audit the Kodax return against the controlling Task, reconcile the Major 003 frontier, maintain the program map, and decide when the coherent Sigma Windows acceptance gate is actually ready.

- live-observation
  - Retained By: Sigma
  - Responsibility: perform only the smallest Kodax-defined Windows/VS Code observation that cannot be proven locally and report the observed UI/result without diagnosing source code.

- shared-semantics
  - Retained By: Core / Docs authority
  - Responsibility: shared Tiinex schemas, semantics, carrier construction and validation remain outside this Extension VS Code host repair.

## Exclusions And Dependencies

- no-core-docs-or-remote-mutation
  - Kind: excluded-scope
  - Description: no Core/Docs semantic mutation, repository push, release, Marketplace publication, deployment or other remote mutation is authorized.

- exact-locked-toolchain
  - Kind: unresolved-dependency
  - Description: if the exact locked Extension VS Code dependency set remains unavailable in the execution host, return that limitation explicitly and do not substitute dependency versions or overstate full validation.
  - Responsible Party Or Role: Kodax / later exact-toolchain execution host.

- coherent-major-gate
  - Kind: unresolved-dependency
  - Description: Major 003 remains open until the observed lifecycle regression is closed and the coherent live Windows acceptance surface is ready; prior filename/icon success alone does not close the Major.
  - Responsible Party Or Role: Anchor / Sigma gate after Kodax return.

## Completion Expectation

- Signal Kind: return
- Signal Meaning: Kodax returns one repo-local Extension VS Code checkpoint with the lifecycle root cause explained and repaired, activation/command/provider regression evidence added, prior Transport filename/icon wins preserved, and any exact-toolchain or live-host limit stated precisely.
- Return To: Anchor
- Return To Reference: [Anchor Role — Successor Evolution Continuation](business::.topics/roles/001-1-1-1-anchor-successor-evolution-role.trace.md)

## Interpretation Limits

- Does Not Mean: the whole Major 003 is accepted, Sigma has completed the coherent Windows gate, exact locked-toolchain validation necessarily passed, or any release/remote operation is authorized.
- Must Not Be Used To Claim: permission to hide lifecycle failures with retries, widen into unrelated features, change Core/Docs semantics, regress the confirmed filename/icon behavior, or infer acceptance from a later successful reload alone.
- Authority Limits: Kodax owns only this bounded Extension VS Code lifecycle repair; Anchor retains cross-Major progression/final audit and Sigma retains human live-host observation.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-3-6-4-1-3-1-1-1-2-1-2-2-1-2-1-2-1-2-1-2-1-vs-code-major-003-extension-activation-and-refresh-lifecycle-reg.trace.md](001-3-6-4-1-3-1-1-1-2-1-2-2-1-2-1-2-1-2-1-2-1-vs-code-major-003-extension-activation-and-refresh-lifecycle-reg.trace.md)
  - Value: C4BXrvAxzXg_T5XtuqoPoTAiNOQirJzdJD_3QL2zhFM

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: ecIb4g4nWVFUjeYnTwx8WVVYriyxAKFMJPlEMoAdn64