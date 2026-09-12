# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-12 11:08:47
  - Trace: [001-3-6-4-1-3-1-1-1-2-1-vs-code-major-003-sigma-full-source-live-host-acceptance-task.trace.md](001-3-6-4-1-3-1-1-1-2-1-vs-code-major-003-sigma-full-source-live-host-acceptance-task.trace.md)
  - Origin:
    - [relative](001-3-6-4-1-3-1-1-1-2-1-vs-code-major-003-sigma-full-source-live-host-acceptance-task.trace.md)
- Current
  - Current Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-12 11:09:13
  - Authors: Anchor
  - Why: Sigma should receive one coherent full-source gate with one technical command and bounded observations, not loose dependency/debugging instructions.
  - Summary: Give Sigma one full-source front-door acceptance path for the final VS Code Major 003 technical and human gates.
  - Status: ready/local

---

# Anchor To Sigma — VS Code Major 003 Full-Source Live-Host Acceptance

## Handoff Parties

- Purpose: give Sigma one full-source, front-door VS Code Major 003 acceptance path after navigation, generic authoring, Core007 host adoption and Git operator work have been technically reconciled.
- From: Anchor
- From Kind: role
- From Reference: [Anchor Role — Successor Evolution Continuation](business::.topics/roles/001-1-1-1-anchor-successor-evolution-role.trace.md)
- To: Sigma
- To Kind: role
- To Reference: [Sigma Role](business::.topics/roles/001-4-sigma-role.trace.md)

## Transfers

- technical-front-door
  - Transfer Kind: work
  - Description: after landing the exact carried Core and Extension VS Code source, run exactly `npm run test:local-core -- --core ../core` from the `extension-vscode` repository. If it fails, stop and return the exact output; do not debug or substitute dependencies.
  - Controlling Artifact: [Sigma Live-Host Acceptance Task](001-3-6-4-1-3-1-1-1-2-1-vs-code-major-003-sigma-full-source-live-host-acceptance-task.trace.md)
  - Boundary: this command may install exact locked public third-party dev dependencies inside a disposable harness; it does not publish or mutate durable first-party dependency declarations.

- live-host-observation
  - Transfer Kind: work-and-responsibility
  - Description: only after the technical gate passes, rebuild/reload the linked main-host extension and perform the bounded navigation, generic authoring and explicit Git-operator observations declared by the Task. Stop at the first materially wrong behavior and return screenshot/video plus the shortest reproduction.
  - Controlling Artifact: [Sigma Live-Host Acceptance Task](001-3-6-4-1-3-1-1-1-2-1-vs-code-major-003-sigma-full-source-live-host-acceptance-task.trace.md)
  - Boundary: Sigma observes and accepts/rejects UX; Sigma does not repair source under this Handoff.

## Required Context

- extension-vscode-workspace
  - Material: complete current Extension VS Code Workspace.
  - Material Reference: [Extension VS Code Workspace](extension-vscode::.topics/.workspaces/tiinex-extension-vscode.workspace.md)
  - Purpose: exact accepted Major 003 source to test.
  - Availability: available

- core-workspace
  - Material: complete current Core Workspace.
  - Material Reference: [Core Workspace](core::.topics/.workspaces/tiinex-core.workspace.md)
  - Purpose: exact local Core source used by the disposable technical harness.
  - Availability: available

- business-workspace
  - Material: complete current Business Workspace.
  - Material Reference: [Business Workspace](business::.topics/.workspaces/tiinex-business.workspace.md)
  - Purpose: exact Sigma/Anchor Role and human-gate authority context.
  - Availability: available

## Reference Context

- final-kodax-return
  - Material: final VS Code Major 003 technical return.
  - Material Reference: [VS Code Final Return](001-3-6-4-1-3-1-1-1-2-kodax-to-anchor-vs-code-major-003-final-generic-authoring-and-lo.trace.md)
  - Purpose: exact implemented state and prior third-party toolchain blocker.
  - Availability: available

## Retained Responsibilities

- defect-routing
  - Retained By: Anchor
  - Responsibility: classify and route any returned technical or UX defect to the narrowest durable owner instead of asking Sigma to invent workarounds.
- implementation-repair
  - Retained By: Kodax / Loom / Axiom as separately delegated by Anchor
  - Responsibility: perform source changes only after an evidenced owner classification.

## Exclusions And Dependencies

- no-source-debugging-by-sigma
  - Kind: excluded-scope
  - Description: Sigma is not responsible for debugging implementation source or repairing failed tooling/dependencies.
- locked-third-party-dependencies
  - Kind: unresolved-dependency
  - Description: the disposable technical gate requires the exact locked public dev dependencies; if ordinary registry/cache access cannot provide them, return the exact blocker.
  - Responsible Party Or Role: Anchor / execution environment.
- no-publication
  - Kind: excluded-scope
  - Description: no npm/Marketplace publication or remote release action is required or authorized.

## Completion Expectation

- Signal Kind: return
- Signal Meaning: Sigma returns technical-gate output plus bounded live-host PASS/FAIL observations for navigation, generic authoring/Handoff attach behavior and Git operator ergonomics; Anchor then closes or reopens VS Code Major 003 from exact evidence.
- Return To: Anchor
- Return To Reference: [Anchor Role — Successor Evolution Continuation](business::.topics/roles/001-1-1-1-anchor-successor-evolution-role.trace.md)

## Interpretation Limits

- Does Not Mean: a technical PASS automatically means UX acceptance, a UX PASS substitutes for full validation, or Sigma owns implementation repair.
- Must Not Be Used To Claim: release/publication readiness, schema authority from host behavior, hidden Git mutation authority or acceptance of unrelated VS Code features outside the bounded Task.
- Authority Limits: Sigma owns the human observation/acceptance gate; Anchor owns orchestration and defect routing; repository owners own implementation.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-3-6-4-1-3-1-1-1-2-1-vs-code-major-003-sigma-full-source-live-host-acceptance-task.trace.md](001-3-6-4-1-3-1-1-1-2-1-vs-code-major-003-sigma-full-source-live-host-acceptance-task.trace.md)
  - Value: 6V4xVc-DfuC2Xq68eZQSOFXqCNPDd3JJNEKcmeJigb8

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: ktc6_1MBLf360MtSO2bJqJoMCACF77fIpWuqe_rcD3E