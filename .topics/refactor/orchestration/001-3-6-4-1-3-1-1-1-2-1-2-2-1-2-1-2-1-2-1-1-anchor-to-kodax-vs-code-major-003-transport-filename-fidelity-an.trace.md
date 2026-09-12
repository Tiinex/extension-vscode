# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-12 19:09:48
  - Trace: [001-3-6-4-1-3-1-1-1-2-1-2-2-1-2-1-2-1-2-1-vs-code-major-003-transport-filename-fidelity-and-scanability-re.trace.md](001-3-6-4-1-3-1-1-1-2-1-2-2-1-2-1-2-1-2-1-vs-code-major-003-transport-filename-fidelity-and-scanability-re.trace.md)
  - Origin:
    - [relative](001-3-6-4-1-3-1-1-1-2-1-2-2-1-2-1-2-1-2-1-vs-code-major-003-transport-filename-fidelity-and-scanability-re.trace.md)
- Current
  - Current Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-12 19:10:16
  - Authors: Anchor
  - Why: Sigma live-observed filename loss and visually ambiguous copy actions after the accepted authoring return; repair them before the coherent Major 003 acceptance gate.
  - Summary: Delegate the bounded Windows Copy Package filename-fidelity and Transport action scanability repair to fresh Kodax.
  - Status: ready/local

---

# Anchor To Kodax — VS Code Major 003 Transport Filename Fidelity And Scanability Repair

## Handoff Parties

- Purpose: delegate the bounded Major 003 live Transport repair for original carrier filename preservation on Windows file clipboard and visually distinct package-vs-text actions before the coherent Sigma acceptance gate.
- From: Anchor
- From Kind: role
- From Reference: [Anchor Role — Successor Evolution Continuation](business::.topics/roles/001-1-1-1-anchor-successor-evolution-role.trace.md)
- To: Kodax
- To Kind: role
- To Reference: [Kodax Role](business::.topics/roles/001-6-kodax-role.trace.md)

## Transfers

- transport-filename-fidelity
  - Transfer Kind: work-and-responsibility
  - Description: own reproduction, diagnosis and bounded repair of the observed Windows `Copy Package` behavior where ChatGPT receives `<uuid>.zip` while Windows Explorer copy preserves the canonical Tiinex carrier filename.
  - Controlling Artifact: [Transport Filename Fidelity And Scanability Repair Task](001-3-6-4-1-3-1-1-1-2-1-2-2-1-2-1-2-1-2-1-vs-code-major-003-transport-filename-fidelity-and-scanability-re.trace.md)
  - Boundary: preserve exact carrier bytes/identity and honest capability fallback; do not solve the symptom by repacking, mutating or semantically renaming the qualified carrier.

- transport-scanability
  - Transfer Kind: work-and-responsibility
  - Description: make package-copy and transport-text-copy actions visually distinguishable with coherent native VS Code icon/title presentation, specifically reducing repeated text-reading burden for dyslexic scanning.
  - Controlling Artifact: [Transport Filename Fidelity And Scanability Repair Task](001-3-6-4-1-3-1-1-1-2-1-2-2-1-2-1-2-1-2-1-vs-code-major-003-transport-filename-fidelity-and-scanability-re.trace.md)
  - Boundary: keep the change bounded to the observed action ambiguity; do not redesign unrelated operator iconography.

- epistemic-live-host-loop
  - Transfer Kind: responsibility
  - Description: when Windows/ChatGPT behavior cannot be discriminated locally, formulate the hypothesis and smallest live test for Sigma, state expected outcomes, then interpret the returned observation yourself. Sigma supplies observation, not source diagnosis.
  - Controlling Artifact: [Transport Filename Fidelity And Scanability Repair Task](001-3-6-4-1-3-1-1-1-2-1-2-2-1-2-1-2-1-2-1-vs-code-major-003-transport-filename-fidelity-and-scanability-re.trace.md)
  - Boundary: remain within this Task; escalate scope/authority conflicts to Anchor instead of absorbing them.

## Required Context

- extension-vscode-workspace
  - Material: complete current Extension VS Code Workspace after the accepted first-class authoring-discoverability return and this controlling repair Task/Handoff.
  - Material Reference: [Extension VS Code Workspace](extension-vscode::.topics/.workspaces/tiinex-extension-vscode.workspace.md)
  - Purpose: exact source frontier and repo-local authority for the bounded repair.
  - Availability: available

## Reference Context

- controlling-task
  - Material: current Transport Filename Fidelity And Scanability Repair Task.
  - Material Reference: [Transport Filename Fidelity And Scanability Repair Task](001-3-6-4-1-3-1-1-1-2-1-2-2-1-2-1-2-1-2-1-vs-code-major-003-transport-filename-fidelity-and-scanability-re.trace.md)
  - Purpose: exact Done Criteria and exclusions.
  - Availability: available

- authoring-return
  - Material: accepted Kodax return immediately preceding this repair.
  - Material Reference: [First-Class Artifact Authoring Discoverability Return](001-3-6-4-1-3-1-1-1-2-1-2-2-1-2-1-2-1-2-kodax-to-anchor-vs-code-major-003-first-class-artifact-authoring.trace.md)
  - Purpose: preserve the accepted current source and explicit locked-toolchain/Core-catalog limitations.
  - Availability: available

## Retained Responsibilities

- major-orchestration-and-final-audit
  - Retained By: Anchor
  - Responsibility: audit/reconcile the return, keep the wider Tiinex program map, coordinate any shared-scope dependency, refresh full Recovery and decide the coherent Sigma acceptance gate.

- human-live-observation
  - Retained By: Sigma
  - Responsibility: when Kodax asks for one bounded Windows/ChatGPT observation, execute the described test and report the observed result without being required to diagnose implementation source.

- shared-semantics
  - Retained By: Core / Docs authority
  - Responsibility: carrier/transport/schema semantics remain shared authority; this VS Code repair is host mechanics/presentation only.

## Exclusions And Dependencies

- no-core-or-docs-mutation
  - Kind: excluded-scope
  - Description: no Core/Docs schema, catalog, transport semantic or validator change is authorized by this Handoff.

- no-release-or-remote-mutation
  - Kind: excluded-scope
  - Description: no Marketplace publication, release, repository push, deployment or other remote mutation is authorized.

- live-host-observation-may-be-required
  - Kind: unresolved-dependency
  - Description: cross-application Windows file-paste filename behavior may require one real Sigma observation if local automated evidence cannot prove the receiving-host result.
  - Responsible Party Or Role: Kodax for hypothesis/test design; Sigma for observation; Anchor for any scope escalation.

## Completion Expectation

- Signal Kind: return
- Signal Meaning: Kodax returns one repo-local Major 003 checkpoint where Copy Package preserves original carrier filename as far as the VS Code/Windows boundary can truthfully control, package/text actions are visibly distinct, focused regressions are clean, any required Sigma live observation is explicit, and no package/semantic authority was widened.
- Return To: Anchor
- Return To Reference: [Anchor Role — Successor Evolution Continuation](business::.topics/roles/001-1-1-1-anchor-successor-evolution-role.trace.md)

## Interpretation Limits

- Does Not Mean: ChatGPT delivery/acceptance is proven, Sigma has accepted the full Major 003 UX, Feedback create capability is fixed, full locked-toolchain validation passed, or any release/remote work is complete.
- Must Not Be Used To Claim: permission to mutate carrier bytes after qualification, invent transport semantics in VS Code, hardcode receiver behavior, or make Sigma responsible for implementation diagnosis.
- Authority Limits: Kodax owns only this bounded host implementation; Anchor retains orchestration/final audit and Sigma retains human observation/acceptance.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-3-6-4-1-3-1-1-1-2-1-2-2-1-2-1-2-1-2-1-vs-code-major-003-transport-filename-fidelity-and-scanability-re.trace.md](001-3-6-4-1-3-1-1-1-2-1-2-2-1-2-1-2-1-2-1-vs-code-major-003-transport-filename-fidelity-and-scanability-re.trace.md)
  - Value: xp_bXNOci1TdgjmdCxaC6kQVGl-p6kcQke7n6NKCxOk

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: kC8u9yHF6NqZgQ61vxHWafoOW-n6hAByMt883cI-AOY