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
  - Created At: 2026-09-12 20:29:38
  - Authors: Kodax
  - Why: The default linked build rewrote VS Code extension registry metadata immediately before a clean compilation removed dist, creating a lifecycle window that matches Sigma’s providerless/command-not-found observation and later reload recovery.
  - Summary: Return the bounded lifecycle repair that removes the build-time registry/entrypoint race, adds activation registration regression evidence, and preserves prior Transport wins.
  - Status: ready/local

---

# Kodax To Anchor — VS Code Major 003 Activation And Refresh Lifecycle Repair Return

## Handoff Parties

- Purpose: return the bounded Extension VS Code lifecycle repair that removes the build-time registry/entrypoint activation race, proves provider/refresh registration ordering, and preserves the already live-confirmed Transport filename and icon behavior.
- From: Kodax
- From Kind: role
- From Reference: [Kodax Role](business::.topics/roles/001-6-kodax-role.trace.md)
- To: Anchor
- To Kind: role
- To Reference: [Anchor Role — Successor Evolution Continuation](business::.topics/roles/001-1-1-1-anchor-successor-evolution-role.trace.md)

## Transfers

- lifecycle-root-cause-and-repair
  - Transfer Kind: work
  - Description: The ordinary linked build previously executed `npm install -> Link this checkout -> build`; the Link task always rewrote the `tiinex.tiinex-vscode` entry in VS Code `extensions.json` with fresh registry metadata, and `build` immediately ran `clean`, deleting `dist/` before TypeScript re-emitted `dist/extension.js`. That creates an exact lifecycle race in which the main host can observe the rewritten extension registration while the declared `main` entrypoint is absent; if activation lands in that window, no Tiinex TreeView provider or command reaches registration, while a later reload after compilation naturally recovers. The default build now depends on dependency installation only, `dev:build` compiles in place without deleting `dist/`, and the explicit Link task skips `extensions.json` mutation when exactly one matching linked entry at the current package version already exists.
  - Controlling Artifact: [Extension Activation And Refresh Lifecycle Regression Repair Task](001-3-6-4-1-3-1-1-1-2-1-2-2-1-2-1-2-1-2-1-2-1-vs-code-major-003-extension-activation-and-refresh-lifecycle-reg.trace.md)
  - Boundary: this is a mechanical root-cause isolation and host-lifecycle repair; it is not a claim that the Windows main host has already re-observed the corrected sequence.

- activation-registration-regression-evidence
  - Transfer Kind: work
  - Description: Focused regression coverage now loads the compiled extension under a mocked VS Code host, forces async startup to fail immediately after synchronous registration begins, and proves that Discovery, Incoming, Outgoing and Transport TreeViews plus `tiinex.discovery.refresh`, `tiinex.incoming.refresh`, `tiinex.outgoing.refresh` and `tiinex.transport.refresh` are already registered. This separates registration correctness from later startup work and demonstrates that the live all-provider/all-command absence requires activation not to reach the normal registration path.
  - Controlling Artifact: [Extension Activation And Refresh Lifecycle Regression Repair Task](001-3-6-4-1-3-1-1-1-2-1-2-2-1-2-1-2-1-2-1-2-1-vs-code-major-003-extension-activation-and-refresh-lifecycle-reg.trace.md)
  - Boundary: the harness proves the extension-side ordering and degraded-startup behavior; it does not emulate the Windows extension registry or VS Code process lifecycle.

- development-loop-contract-hardening
  - Transfer Kind: work
  - Description: Regression coverage now fails if the normal build reintroduces Link/registry mutation or a clean-before-compile development build. It also checks the explicit Link task's idempotent registry guard and preserves the existing one-time link/unlink contract. README guidance now distinguishes one-time registry repair from ordinary build/restart iteration and explains why the two must not be coupled.
  - Controlling Artifact: [Extension Activation And Refresh Lifecycle Regression Repair Task](001-3-6-4-1-3-1-1-1-2-1-2-2-1-2-1-2-1-2-1-2-1-vs-code-major-003-extension-activation-and-refresh-lifecycle-reg.trace.md)
  - Boundary: no release/install semantics or Marketplace path is changed.

- preserve-transport-wins
  - Transfer Kind: responsibility
  - Description: The prior canonical carrier filename and package-vs-text icon repairs are unchanged. The dependency-independent regression run still passes the command/icon distinction assertions and the Windows clipboard-format/basename regression before reaching the expected missing-Core boundary.
  - Controlling Artifact: [Prior Kodax Return](001-3-6-4-1-3-1-1-1-2-1-2-2-1-2-1-2-1-2-1-2-kodax-to-anchor-vs-code-major-003-transport-filename-fidelity-an.trace.md)
  - Boundary: no carrier/package bytes, Transport authority, or copy semantics were widened by this lifecycle repair.

## Required Context

- extension-vscode-workspace
  - Material: complete current Extension VS Code Workspace with the lifecycle repair, regression harness and preserved prior Transport changes.
  - Material Reference: [Extension VS Code Workspace](extension-vscode::.topics/.workspaces/tiinex-extension-vscode.workspace.md)
  - Purpose: exact repo-local source checkpoint returned for Anchor review.
  - Availability: available

- business-role-context
  - Material: current Business Workspace carrying Kodax and Anchor Role authority.
  - Material Reference: [Business Workspace](business::.topics/.workspaces/tiinex-business.workspace.md)
  - Purpose: endpoint Role grounding and return authority only.
  - Availability: available

## Reference Context

- lifecycle-task
  - Material: controlling Extension Activation And Refresh Lifecycle Regression Repair Task.
  - Material Reference: [Lifecycle Repair Task](001-3-6-4-1-3-1-1-1-2-1-2-2-1-2-1-2-1-2-1-2-1-vs-code-major-003-extension-activation-and-refresh-lifecycle-reg.trace.md)
  - Purpose: exact done criteria and live-observation boundary.
  - Availability: available

- incoming-handoff
  - Material: Anchor-to-Kodax delegation for this lifecycle repair.
  - Material Reference: [Incoming Handoff](001-3-6-4-1-3-1-1-1-2-1-2-2-1-2-1-2-1-2-1-2-1-1-anchor-to-kodax-vs-code-major-003-extension-activation-and-refre.trace.md)
  - Purpose: transferred work/responsibility and exclusion boundary.
  - Availability: available

## Validation Evidence

- `node test/run.mjs` passes 47 dependency-independent cases, including the new development-loop lifecycle contract and mocked activation registration proof, then stops at the pre-declared exact-Core boundary with `tiinex.core-package.unavailable: Cannot find module '@tiinex/core/package.json'`.
- The same passing frontier includes the existing package-vs-text icon distinction assertions and the Windows clipboard `FileDrop` / `Preferred DropEffect` / `FileNameW` basename-fidelity regression.
- `package.json` and `.vscode/tasks.json` parse successfully; `test/run.mjs` and `scripts/clean.mjs` pass Node syntax checking.
- An exact offline `npm ci --ignore-scripts --offline` attempt fails closed because the locked `undici-types@6.20.0` tarball is not present in the execution host cache; no dependency versions were substituted.
- Neither `pwsh` nor Windows PowerShell is available in this execution host, so the updated PowerShell linker cannot be parser- or host-executed here; its contract is covered by source-backed regression assertions and remains subject to the smallest live Windows observation.

## Retained Responsibilities

- progression-and-final-audit
  - Retained By: Anchor
  - Responsibility: audit this return against the controlling Task, reconcile the Major 003 frontier, and decide when the coherent live Windows gate is ready.

- live-reobservation
  - Retained By: Sigma
  - Responsibility: after taking this checkpoint, run the smallest discriminating sequence: one-time Link only if registration repair is actually needed, then `Ctrl+Shift+B`, wait for successful completion, run `VS Code: Restart Extensions`, and confirm all four Tiinex views have providers and Discovery refresh executes instead of reporting command-not-found.

- shared-semantics
  - Retained By: Core / Docs authority
  - Responsibility: shared schemas, carrier semantics and Core behavior remain unchanged.

## Exclusions And Dependencies

- no-core-docs-or-remote-mutation
  - Kind: excluded-scope
  - Description: no Core/Docs semantic mutation, repository push, release, Marketplace publication, deployment or other remote mutation was performed or authorized.

- exact-locked-toolchain
  - Kind: unresolved-dependency
  - Description: the exact locked dependency set cannot be installed in this execution host from cache because `undici-types@6.20.0` is unavailable, so full typecheck/build/package/VSIX qualification is not claimed.
  - Responsible Party Or Role: later exact-toolchain execution host.

- windows-linker-runtime
  - Kind: unresolved-dependency
  - Description: Windows PowerShell and the live VS Code extension registry are unavailable here, so the idempotent linker branch and repaired build/restart lifecycle require one real-host observation.
  - Responsible Party Or Role: Sigma live-host gate after Anchor review.

- coherent-major-gate
  - Kind: unresolved-dependency
  - Description: Major 003 remains open until the repaired ordinary build/restart sequence is re-observed without provider loss or command-not-found; the prior filename/icon success and this mechanical repair do not by themselves close the Major.
  - Responsible Party Or Role: Anchor / Sigma.

## Completion Expectation

- Signal Kind: return
- Signal Meaning: Anchor receives one repo-local Extension VS Code checkpoint where the observed lifecycle failure has a mechanically isolated build/link root cause, the unsafe registry-clean coupling is removed, activation/provider/refresh registration has focused regression evidence, prior Transport wins are preserved, and exact-toolchain/live-Windows limits are explicit.
- Return To: Anchor
- Return To Reference: [Anchor Role — Successor Evolution Continuation](business::.topics/roles/001-1-1-1-anchor-successor-evolution-role.trace.md)

## Interpretation Limits

- Does Not Mean: the whole Major 003 is accepted, Sigma's live Windows gate has passed, exact locked-toolchain validation passed, or release/publication is authorized.
- Must Not Be Used To Claim: a source-level retry hides activation failure, registry mutation is never needed, or a later reload alone constitutes acceptance. The explicit Link task remains the repair path when registration is actually missing or stale; ordinary builds simply stop mutating it every time.
- Authority Limits: Kodax returns implementation and deterministic evidence for this bounded Extension VS Code lifecycle repair only; Anchor retains progression/final audit and Sigma retains the human live-host observation.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-3-6-4-1-3-1-1-1-2-1-2-2-1-2-1-2-1-2-1-2-1-vs-code-major-003-extension-activation-and-refresh-lifecycle-reg.trace.md](001-3-6-4-1-3-1-1-1-2-1-2-2-1-2-1-2-1-2-1-2-1-vs-code-major-003-extension-activation-and-refresh-lifecycle-reg.trace.md)
  - Value: C4BXrvAxzXg_T5XtuqoPoTAiNOQirJzdJD_3QL2zhFM

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: xJu5ZfyC6Fmo3zxDJN3ehVcsH7mcly8djVbCpsjDZNk