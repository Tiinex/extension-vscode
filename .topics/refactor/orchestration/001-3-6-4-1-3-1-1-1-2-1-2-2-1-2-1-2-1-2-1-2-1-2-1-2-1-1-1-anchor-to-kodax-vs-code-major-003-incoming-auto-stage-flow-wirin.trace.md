# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-12 21:57:49
  - Trace: [001-3-6-4-1-3-1-1-1-2-1-2-2-1-2-1-2-1-2-1-2-1-2-1-2-1-1-vs-code-major-003-incoming-auto-stage-flow-wiring.trace.md](001-3-6-4-1-3-1-1-1-2-1-2-2-1-2-1-2-1-2-1-2-1-2-1-2-1-1-vs-code-major-003-incoming-auto-stage-flow-wiring.trace.md)
  - Origin:
    - [relative](001-3-6-4-1-3-1-1-1-2-1-2-2-1-2-1-2-1-2-1-2-1-2-1-2-1-1-vs-code-major-003-incoming-auto-stage-flow-wiring.trace.md)
- Current
  - Current Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-12 21:58:51
  - Authors: Anchor
  - Why: Sigma live Windows evidence and Anchor source audit show Landing: Stage=yes is not wired through the newer Incoming operator path; the repair must remain specialist-owned and transport-pure.
  - Summary: Delegate the real Incoming Merge/Replace auto-stage wiring repair to Kodax with coarse build and flow validation.
  - Status: ready/local

---

# Anchor To Kodax — VS Code Major 003 Incoming Auto-Stage Flow Wiring

## Handoff Parties

- Purpose: repair the documented `Landing: Stage` operator contract in the actual Incoming Merge/Replace flows, preserving dirty-work safety and proving the workspace is build-clean before return.
- From: Anchor
- From Kind: role
- From Reference: [Anchor Role — Successor Evolution Continuation](business::.topics/roles/001-1-1-1-anchor-successor-evolution-role.trace.md)
- To: Kodax
- To Kind: role
- To Reference: [Kodax Role](business::.topics/roles/001-6-kodax-role.trace.md)

## Transfers

- incoming-stage-policy-wiring
  - Transfer Kind: work-and-responsibility
  - Description: trace successful Incoming Merge and Replace from operator command through mutation completion, then wire the existing landing stage policy into the real operator path where safe.
  - Boundary: reuse the existing stage-policy semantics; do not create a second private policy merely for Incoming.

- operator-flow-validation
  - Transfer Kind: responsibility
  - Description: establish that `stage=yes` stages the Tiinex-landed closure, `stage=no` leaves it unstaged, and pre-existing unrelated dirty work is never silently absorbed.
  - Boundary: prefer coarse build and flow/integration evidence over helper-level test proliferation.

- specialist-epistemic-ownership
  - Transfer Kind: responsibility
  - Description: Kodax owns diagnosis, implementation, ordinary compile/build health, relevant integration validation, and the technical conclusion. Sigma is only a minimal real Windows observation surface when something genuinely cannot run in Kodax's host.
  - Boundary: no loose patch, no manual source application, and no ordinary debugging shifted to Sigma.

## Required Context

- extension-vscode-workspace
  - Material: complete current Extension VS Code candidate Workspace containing the live-restored lifecycle/Transport changes and build-cleanliness repair candidate.
  - Material Reference: [Extension VS Code Workspace](extension-vscode::.topics/.workspaces/tiinex-extension-vscode.workspace.md)
  - Purpose: exact repo-local source frontier for this repair.
  - Availability: available

- business-role-context
  - Material: current Business Workspace carrying Anchor and Kodax Role authority and grounding/qualified-return discipline.
  - Material Reference: [Business Workspace](business::.topics/.workspaces/tiinex-business.workspace.md)
  - Purpose: endpoint Role grounding and process boundary.
  - Availability: available

## Reference Context

- controlling-task
  - Material: VS Code Major 003 — Incoming Auto-Stage Flow Wiring Task.
  - Material Reference: [Incoming Auto-Stage Flow Wiring Task](001-3-6-4-1-3-1-1-1-2-1-2-2-1-2-1-2-1-2-1-2-1-2-1-2-1-1-vs-code-major-003-incoming-auto-stage-flow-wiring.trace.md)
  - Purpose: exact objective, done criteria, validation discipline and exclusions.
  - Availability: available

## Retained Responsibilities

- final-audit-and-reconciliation
  - Retained By: Anchor
  - Responsibility: audit Kodax's qualified return, reconcile accepted bytes into the current program frontier, preserve cross-Major boundaries and refresh Recovery.

- human-host-observation
  - Retained By: Sigma
  - Responsibility: provide only bounded Windows/VS Code observations requested by Kodax after ordinary technical gates are complete, and make product/human acceptance judgements where applicable.

## Exclusions And Dependencies

- exact-locked-toolchain
  - Kind: unresolved-dependency
  - Description: `npm run dev:build` under exact locked dependencies is a coarse implementation-ready gate; inability to run it remains an explicit blocker rather than permission to substitute dependencies or overclaim readiness.
  - Responsible Party Or Role: Kodax

- no-shared-semantics-or-remote-mutation
  - Kind: excluded-scope
  - Description: no Core/Docs semantics change, release, Marketplace publication, push, deployment or unrelated feature work is authorized.

## Completion Expectation

- Signal Kind: return
- Signal Meaning: Kodax returns one qualified carrier containing actual candidate workspace bytes where the Incoming stage policy is wired through the real Merge/Replace path, dirty-work safety is preserved, coarse build/broad validation is green, integration evidence is sufficient, and any remaining minimal Windows observation is stated separately.
- Return To: Anchor
- Return To Reference: [Anchor Role — Successor Evolution Continuation](business::.topics/roles/001-1-1-1-anchor-successor-evolution-role.trace.md)

## Interpretation Limits

- Does Not Mean: VS Code Major 003 is fully accepted or release-ready.
- Must Not Be Used To Claim: that Git's incidental index state proves Tiinex stage-policy behavior, or that focused helper tests substitute for operator-flow evidence.
- Authority Limits: Kodax owns this bounded implementation/validation lane; Anchor retains program progression/final audit; Sigma remains human observation/acceptance, not source repair.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-3-6-4-1-3-1-1-1-2-1-2-2-1-2-1-2-1-2-1-2-1-2-1-2-1-1-vs-code-major-003-incoming-auto-stage-flow-wiring.trace.md](001-3-6-4-1-3-1-1-1-2-1-2-2-1-2-1-2-1-2-1-2-1-2-1-2-1-1-vs-code-major-003-incoming-auto-stage-flow-wiring.trace.md)
  - Value: swbttpZ87SVQgQass47prpGiWdpP3Dj8ZxHPKxKvL68

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: SbPddZBsgrcUS7iaRacf9ZdR40b2Lmuy7KesnZEV89Y