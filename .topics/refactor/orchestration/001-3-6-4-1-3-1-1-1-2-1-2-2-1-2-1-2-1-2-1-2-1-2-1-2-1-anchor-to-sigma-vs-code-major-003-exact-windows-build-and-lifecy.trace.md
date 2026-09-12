# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-12 21:05:01
  - Trace: [001-3-6-4-1-3-1-1-1-2-1-2-2-1-2-1-2-1-2-1-2-1-2-1-2-kodax-to-anchor-vs-code-major-003-build-cleanliness-repair-candi.trace.md](001-3-6-4-1-3-1-1-1-2-1-2-2-1-2-1-2-1-2-1-2-1-2-1-2-kodax-to-anchor-vs-code-major-003-build-cleanliness-repair-candi.trace.md)
  - Origin:
    - [relative](001-3-6-4-1-3-1-1-1-2-1-2-2-1-2-1-2-1-2-1-2-1-2-1-2-kodax-to-anchor-vs-code-major-003-build-cleanliness-repair-candi.trace.md)
- Current
  - Current Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-12 21:14:34
  - Authors: Anchor
  - Why: Kodax returned the actual candidate bytes but could not satisfy the exact locked compile/build gate because npm registry DNS failed in its host; use Sigma only as the bounded real Windows execution surface.
  - Summary: Route the carried candidate bytes to Sigma for the minimum exact Windows build and lifecycle observation unavailable in Kodax's host, without source editing or debugging.
  - Status: ready/local

---

# Anchor To Sigma — VS Code Major 003 Exact Windows Build And Lifecycle Gate

## Handoff Parties

- Purpose: execute the minimum real Windows gate that the Kodax host could not perform, using the carried candidate workspace bytes without asking Sigma to apply source edits or debug the implementation.
- From: Anchor
- From Kind: role
- From Reference: [Anchor Role — Successor Evolution Continuation](business::.topics/roles/001-1-1-1-anchor-successor-evolution-role.trace.md)
- To: Sigma
- To Kind: role
- To Reference: [Sigma Role](business::.topics/roles/001-4-sigma-role.trace.md)

## Transfers

- windows-coarse-build-gate
  - Transfer Kind: work
  - Description: use the actual carried Extension VS Code candidate bytes through the normal Tiinex transport/Incoming-Merge path, then run the exact ordinary Windows build gate. Sigma is an execution/observation surface only; no manual patching, source editing, diagnosis, or implementation ownership is transferred.
  - Controlling Artifact: [Build Cleanliness And Validation Gate Repair Task](001-3-6-4-1-3-1-1-1-2-1-2-2-1-2-1-2-1-2-1-2-1-2-1-vs-code-major-003-build-cleanliness-and-validation-gate-repair.trace.md)
  - Boundary: if the build fails, stop and return the command output to Anchor. Do not repair source locally.

- lifecycle-observation-after-build-pass
  - Transfer Kind: work
  - Description: only if the ordinary build passes, restart VS Code extensions and verify Discovery, Incoming, Outgoing, and Transport load and that Discovery Refresh exists. This is the previously observed real-host lifecycle gate, not a new implementation task.
  - Controlling Artifact: [Build Cleanliness And Validation Gate Repair Task](001-3-6-4-1-3-1-1-1-2-1-2-2-1-2-1-2-1-2-1-2-1-2-1-vs-code-major-003-build-cleanliness-and-validation-gate-repair.trace.md)
  - Boundary: report observations only; do not debug or repair failures.

## Required Context

- extension-vscode-workspace
  - Material: complete candidate Extension VS Code Workspace carrying Kodax's one-line build-cleanliness repair plus prior Major 003 work.
  - Material Reference: [Extension VS Code Workspace](extension-vscode::.topics/.workspaces/tiinex-extension-vscode.workspace.md)
  - Purpose: exact bytes under test.
  - Availability: available

- business-role-context
  - Material: current Business Workspace carrying Anchor and Sigma Role authority.
  - Material Reference: [Business Workspace](business::.topics/.workspaces/tiinex-business.workspace.md)
  - Purpose: recipient Role grounding and human-gate boundary.
  - Availability: available

## Reference Context

- kodax-blocked-candidate-return
  - Material: Kodax return carrying the actual one-line candidate repair and the unresolved exact-toolchain validation blocker.
  - Material Reference: [Kodax Build-Cleanliness Candidate Return](001-3-6-4-1-3-1-1-1-2-1-2-2-1-2-1-2-1-2-1-2-1-2-1-2-kodax-to-anchor-vs-code-major-003-build-cleanliness-repair-candi.trace.md)
  - Purpose: exact implementation delta, blocker boundary, and validation evidence.
  - Availability: available

## Gate Procedure

1. Bring the carried Extension VS Code candidate into the real Windows checkout through the normal Tiinex Incoming/Merge transport path. Do not apply a loose patch.
2. Ensure the repository uses the declared lockfile toolchain; run `npm ci` if the local dependency state is not already known to be the exact lockfile state.
3. Run `npm run dev:build`.
4. If the build fails, stop and send the build output to Anchor.
5. If the build passes, run `VS Code: Restart Extensions`.
6. Verify Discovery, Incoming, Outgoing, and Transport all load.
7. Trigger Discovery Refresh and verify the command exists and runs.
8. Return only PASS or the smallest screenshot/video/output that demonstrates the failure.

## Retained Responsibilities

- implementation-ownership
  - Retained By: Kodax
  - Responsibility: retain diagnosis and source-repair ownership for any implementation failure exposed by this gate; Sigma must not repair source.
- progression-and-final-audit
  - Retained By: Anchor
  - Responsibility: classify the returned evidence, accept or reject the candidate checkpoint, route any defect, and update recovery only after sufficient qualification.
- shared-semantics
  - Retained By: Core / Docs authority
  - Responsibility: shared schemas and Core semantics remain unchanged and outside this gate.

## Exclusions And Dependencies

- no-source-debugging-by-sigma
  - Kind: excluded-scope
  - Description: Sigma is not responsible for Git patch application, source editing, Copilot repair, implementation diagnosis, or ordinary build debugging.
- exact-locked-toolchain
  - Kind: unresolved-dependency
  - Description: the Windows gate must use the declared lockfile toolchain; if exact dependency installation is unavailable, return that blocker rather than substitute versions.
  - Responsible Party Or Role: execution environment / Kodax retains implementation ownership.
- no-publication
  - Kind: excluded-scope
  - Description: no Core/Docs mutation, release, push, deployment, Marketplace publication, or unrelated feature work is authorized.

## Completion Expectation

- Signal Kind: return
- Signal Meaning: return real Windows build/lifecycle observation to Anchor so Anchor can accept or reject the candidate checkpoint.
- Return To: Anchor
- Return To Reference: [Anchor Role — Successor Evolution Continuation](business::.topics/roles/001-1-1-1-anchor-successor-evolution-role.trace.md)

## Interpretation Limits

- Does Not Mean: a successful build automatically accepts all UX, a lifecycle PASS substitutes for the exact build gate, or Sigma owns implementation repair.
- Must Not Be Used To Claim: release/publication readiness, Core/Docs semantic authority, acceptance of unrelated VS Code features, or that manual human source edits are part of normal transport.
- Authority Limits: Sigma supplies bounded real-host observation; Kodax owns implementation diagnosis/repair; Anchor owns orchestration, audit, recovery, and defect routing.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-3-6-4-1-3-1-1-1-2-1-2-2-1-2-1-2-1-2-1-2-1-2-1-2-kodax-to-anchor-vs-code-major-003-build-cleanliness-repair-candi.trace.md](001-3-6-4-1-3-1-1-1-2-1-2-2-1-2-1-2-1-2-1-2-1-2-1-2-kodax-to-anchor-vs-code-major-003-build-cleanliness-repair-candi.trace.md)
  - Value: bQ3UT1bV9HoQ7i8MSSNTbxYj0lIUKDzU21yhsMZMMl4

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: WgkJSd4vHpnMil0ih3nHxT1cp59gkRGIdtoQV7KgUoI