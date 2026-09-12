# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-12 22:30:04
  - Trace: [001-3-6-4-1-3-1-1-1-2-1-2-2-1-2-1-2-1-2-1-2-1-2-1-2-1-1-1-1-kodax-to-anchor-vs-code-major-003-incoming-auto-stage-wiring-blo.trace.md](001-3-6-4-1-3-1-1-1-2-1-2-2-1-2-1-2-1-2-1-2-1-2-1-2-1-1-1-1-kodax-to-anchor-vs-code-major-003-incoming-auto-stage-wiring-blo.trace.md)
  - Origin:
    - [relative](001-3-6-4-1-3-1-1-1-2-1-2-2-1-2-1-2-1-2-1-2-1-2-1-2-1-1-1-1-kodax-to-anchor-vs-code-major-003-incoming-auto-stage-wiring-blo.trace.md)
- Current
  - Current Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-12 22:49:54
  - Authors: Anchor
  - Why: Kodax cannot access the exact locked toolchain in its host; Sigma can supply the minimum real Windows observation without taking source-debugging responsibility.
  - Summary: Bounded Windows build/lifecycle/auto-stage observation for the blocked Kodax candidate.
  - Status: ready/local

---

# Anchor To Sigma — VS Code Major 003 Incoming Auto-Stage Windows Gate

## Handoff Parties

- Purpose: execute the minimum real Windows validation gate for the carried Incoming auto-stage candidate without transferring implementation, debugging, dependency repair, or source-edit responsibility to Sigma.
- From: Anchor
- From Kind: role
- From Reference: [Anchor Role — Successor Evolution Continuation](business::.topics/roles/001-1-1-1-anchor-successor-evolution-role.trace.md)
- To: Sigma
- To Kind: role
- To Reference: [Sigma Role](business::.topics/roles/001-4-sigma-role.trace.md)

## Transfers

- exact-windows-build-gate
  - Transfer Kind: work
  - Description: land the carried candidate through the normal Tiinex Incoming/Merge path and run the repository's ordinary exact-lock build gate in the real Windows checkout. Sigma supplies execution/observation only.
  - Boundary: if the build fails, stop and return only the command output. Do not repair source, apply a patch, substitute dependencies, or debug the implementation.

- incoming-auto-stage-live-observation
  - Transfer Kind: work
  - Description: only after a successful ordinary build, verify the documented `tiinex.landing.stage` behavior through one successful Incoming Replace and one successful Incoming Merge using safe disposable/test material, plus one `stage=no` observation if practical without disturbing unrelated work.
  - Boundary: observe Source Control/index state only; do not diagnose or repair failures. Preserve unrelated pre-existing dirty work and stop if the test cannot be performed safely.

## Required Context

- extension-vscode-workspace
  - Material: complete candidate Extension VS Code Workspace returned by Kodax.
  - Material Reference: [Extension VS Code Workspace](extension-vscode::.topics/.workspaces/tiinex-extension-vscode.workspace.md)
  - Purpose: exact candidate bytes under test.
  - Availability: available

- business-role-context
  - Material: current Business Workspace carrying Anchor and Sigma Role authority.
  - Material Reference: [Business Workspace](business::.topics/.workspaces/tiinex-business.workspace.md)
  - Purpose: recipient Role grounding and human-gate boundary.
  - Availability: available

## Reference Context

- kodax-auto-stage-return
  - Material: Kodax return carrying the actual auto-stage candidate bytes, dirty-work safety evidence, and exact-toolchain blocker.
  - Material Reference: [Kodax Auto-Stage Candidate Return](001-3-6-4-1-3-1-1-1-2-1-2-2-1-2-1-2-1-2-1-2-1-2-1-2-1-1-1-1-kodax-to-anchor-vs-code-major-003-incoming-auto-stage-wiring-blo.trace.md)
  - Purpose: exact implementation boundary, blocker and preflight evidence.
  - Availability: available

## Gate Procedure

1. Bring the carried Extension VS Code candidate into the real Windows checkout through normal Tiinex Incoming/Merge transport. No loose patch or source edit.
2. Use the repository's declared lockfile dependency state; run `npm ci` only if the local dependency state is not already known exact.
3. Run `npm run dev:build`.
4. On build FAIL: stop and return the command output only.
5. On build PASS: run the broadest ordinary repository validation already available in that checkout if it is a normal established command; do not invent a new test suite.
6. Restart VS Code extensions and confirm Discovery, Incoming, Outgoing and Transport load and Discovery Refresh exists.
7. With `Tiinex: Landing: Stage = yes`, perform one safe successful Incoming Replace and one safe successful Incoming Merge; confirm the Tiinex-landed closure appears staged in Source Control while unrelated dirty work is not absorbed.
8. If practical and safe, set `Landing: Stage = no`, repeat one minimal successful Incoming operation and confirm the landed result is left unstaged.
9. Return `PASS` or the smallest screenshot/video/terminal output that demonstrates the first failure. Do not repair it.

## Retained Responsibilities

- implementation-ownership
  - Retained By: Kodax
  - Responsibility: diagnose and repair any implementation defect exposed by the gate; Sigma must not become debugger or source repairer.

- final-audit-and-reconciliation
  - Retained By: Anchor
  - Responsibility: classify Sigma evidence, accept/reject the candidate, route defects, and merge only sufficiently qualified bytes into Master Recovery.

## Exclusions And Dependencies

- no-human-source-repair
  - Kind: excluded-scope
  - Description: no Git patch application, source editing, Copilot repair, dependency substitution or implementation diagnosis by Sigma.

- exact-toolchain-required
  - Kind: unresolved-dependency
  - Description: build/validation claims require the declared lockfile toolchain. If the real host cannot provide it, return that blocker rather than substituting versions.
  - Responsible Party Or Role: execution environment; Kodax retains implementation ownership.

- no-release-or-remote-mutation
  - Kind: excluded-scope
  - Description: no release, Marketplace publication, push, deployment or unrelated source work is authorized.

## Completion Expectation

- Signal Kind: return
- Signal Meaning: Anchor receives the minimum real Windows build/lifecycle/auto-stage evidence needed to accept the candidate or return one concrete failure to Kodax.
- Return To: Anchor
- Return To Reference: [Anchor Role — Successor Evolution Continuation](business::.topics/roles/001-1-1-1-anchor-successor-evolution-role.trace.md)

## Interpretation Limits

- Does Not Mean: a PASS authorizes release/publication, or Sigma owns implementation QA beyond this bounded host observation.
- Must Not Be Used To Claim: broader product acceptance, shared Core/Docs semantic changes, or correctness outside the bounded auto-stage/lifecycle gate.
- Authority Limits: Sigma is a bounded real-host sensor and human acceptance surface; Kodax owns implementation; Anchor owns orchestration and final reconciliation.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-3-6-4-1-3-1-1-1-2-1-2-2-1-2-1-2-1-2-1-2-1-2-1-2-1-1-1-1-kodax-to-anchor-vs-code-major-003-incoming-auto-stage-wiring-blo.trace.md](001-3-6-4-1-3-1-1-1-2-1-2-2-1-2-1-2-1-2-1-2-1-2-1-2-1-1-1-1-kodax-to-anchor-vs-code-major-003-incoming-auto-stage-wiring-blo.trace.md)
  - Value: qWkBtt2g60BIaaOE1f-EvQIihi2v0hfb-uyuUmxQQms

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: Mn122Uwn5jfZeF1X0xwFA8-Kx-4ptDGLP1imyGAQSQc