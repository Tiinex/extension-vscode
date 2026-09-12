# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-12 13:50:30
  - Trace: [001-3-6-4-1-3-1-1-1-2-1-2-vs-code-major-003-sigma-git-automation-scm-ergonomics-repair-task.trace.md](001-3-6-4-1-3-1-1-1-2-1-2-vs-code-major-003-sigma-git-automation-scm-ergonomics-repair-task.trace.md)
  - Origin:
    - [relative](001-3-6-4-1-3-1-1-1-2-1-2-vs-code-major-003-sigma-git-automation-scm-ergonomics-repair-task.trace.md)
- Current
  - Current Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-12 14:21:59
  - Authors: Kodax
  - Why: The bounded Git repair is implemented and exact-Core runtime regressions pass; return control to Anchor while preserving the dependency-omitted full-typecheck and Sigma live-host gates.
  - Summary: Return the implemented SCM-first Git ergonomics repair with exact automatic commit/push safety and focused regression evidence for later Sigma acceptance.
  - Status: ready/local

---

# Kodax To Anchor — VS Code Major 003 Git Automation And SCM Ergonomics Repair Return

## Handoff Parties

- Purpose: return the bounded Major 003 Git-ergonomics repair with one SCM-first manual flow, one post-stage automation policy, exact same-operation push safety, explicit blocker reporting and focused regression evidence for later Sigma Windows acceptance.
- From: Kodax
- From Kind: role
- From Reference: [Kodax Role](business::.topics/roles/001-6-kodax-role.trace.md)
- To: Anchor
- To Kind: role
- To Reference: [Anchor Role — Successor Evolution Continuation](business::.topics/roles/001-1-1-1-anchor-successor-evolution-role.trace.md)

## Transfers

- scm-first-manual-operator
  - Transfer Kind: work-and-responsibility
  - Description: added `Tiinex: Commit Repository…` to the per-repository `scm/sourceControl` surface. The explicit flow can use the existing staged index or an operator-selected Stage All, runs shared staged validation, derives a reviewable message, and offers Leave staged / Commit / Commit + Push. Manual mode may commit source-only staging because the operator initiated the action; Commit + Push is offered only when preflight makes publication safe.
  - Controlling Artifact: [Git Ergonomics Task](001-3-6-4-1-3-1-1-1-2-1-2-vs-code-major-003-sigma-git-automation-scm-ergonomics-repair-task.trace.md)
  - Boundary: the older single-repository Stage/Commit/Push and standalone commit-message commands remain registered only as hidden compatibility surfaces; the coordinated multi-repository flow remains available separately.

- singular-post-stage-automation
  - Transfer Kind: work-and-responsibility
  - Description: replaced the separate landing commit/push settings with `tiinex.git.postStagePolicy` = Do Nothing / Commit / Commit + Push while retaining independent `tiinex.landing.stage`. A 750 ms debounced watcher observes each built-in Git repository state; Receive schedules the same watcher after its explicit safe staging instead of owning a second commit/push path. Automatic preparation never Stage-Alls, rejects conflicts and unstaged remainder, requires shared Core validation plus at least one qualified Tiinex artifact in staged closure, and re-verifies branch/upstream/HEAD/working-state/staged-diff fingerprints after validation and message derivation.
  - Controlling Artifact: [Git Ergonomics Task](001-3-6-4-1-3-1-1-1-2-1-2-vs-code-major-003-sigma-git-automation-scm-ergonomics-repair-task.trace.md)
  - Boundary: source-only staging is never auto-committed; a changed fingerprint fails closed and waits for a later stable repository event.

- exact-commit-publication-safety
  - Transfer Kind: work-and-responsibility
  - Description: automatic Commit + Push now fails closed before commit unless an upstream exists and is exactly aligned, then pushes only the exact commit produced by the same Tiinex operation after branch/upstream/HEAD and one-ahead/zero-behind requalification. Manual or unrelated commits cannot enter this push path. If publication fails after the local commit exists, the host explicitly reports that exact local commit and does not falsely claim the commit was skipped.
  - Controlling Artifact: [Git Ergonomics Task](001-3-6-4-1-3-1-1-1-2-1-2-vs-code-major-003-sigma-git-automation-scm-ergonomics-repair-task.trace.md)
  - Boundary: no background push or implicit remote mutation is introduced.

- regression-and-checkpoint-evidence
  - Transfer Kind: work
  - Description: added focused regressions for the singular policy/SCM menu, conflict-before-Stage-All, source-only automatic gate, unstaged remainder, fingerprint drift, explicit source-only local commit, and exact same-operation Commit + Push. A disposable package-boundary run against the exact carried Core 0.1.1 source passed 86/86 bridge/core cases. The native carrier checkout passes 40 dependency-independent cases before the expected missing-installed-Core boundary. Changed TypeScript modules transpile/syntax-check cleanly. `package-lock.json` and `media/tiinex.svg` remain byte-identical to the received Workspace snapshot.
  - Controlling Artifact: [Git Ergonomics Task](001-3-6-4-1-3-1-1-1-2-1-2-vs-code-major-003-sigma-git-automation-scm-ergonomics-repair-task.trace.md)
  - Boundary: repository-wide `tsc --noEmit` cannot start in the carried checkout because the omitted `node_modules` leaves the declared `node` and `vscode` type libraries unavailable (TS2688); no alternate dependency versions were substituted and no full `npm run validate` PASS is claimed here.

## Required Context

- extension-vscode-workspace
  - Material: complete current Extension VS Code Workspace containing the Git-ergonomics implementation, focused regressions, README updates and generated runtime outputs.
  - Material Reference: [Extension VS Code Workspace](extension-vscode::.topics/.workspaces/tiinex-extension-vscode.workspace.md)
  - Purpose: writable return checkpoint and exact Major 003 continuation.
  - Availability: available

## Reference Context

- controlling-task
  - Material: current Major 003 Git automation and SCM ergonomics repair Task.
  - Material Reference: [Git Ergonomics Task](001-3-6-4-1-3-1-1-1-2-1-2-vs-code-major-003-sigma-git-automation-scm-ergonomics-repair-task.trace.md)
  - Purpose: exact Done Criteria, exclusions and completion boundary.
  - Availability: available

- exact-carried-core
  - Material: qualified carried Core Workspace used read-only for exact package-boundary regression execution.
  - Material Reference: [Core Workspace](core::.topics/.workspaces/tiinex-core.workspace.md)
  - Purpose: shared staged-validation/runtime authority reference; not required package material for this Extension VS Code return.
  - Availability: available

## Retained Responsibilities

- human-acceptance
  - Retained By: Sigma
  - Responsibility: verify the repaired per-repository Source Control action, post-stage Do Nothing / Commit / Commit + Push behavior and blocker ergonomics in the live Windows/main-host environment before Major 003 UX acceptance is claimed.

- orchestration
  - Retained By: Anchor
  - Responsibility: audit this checkpoint, route the live-host acceptance gate and keep Transport/Merge/release work separate from this Git tranche.

- shared-semantics
  - Retained By: Loom / Axiom through Core/Docs
  - Responsibility: staged validation and schema semantics remain shared authority; VS Code must not recreate them locally.

## Exclusions And Dependencies

- no-transport-or-merge-redesign
  - Kind: excluded-scope
  - Description: no Transport queue, Copy Package/Transport redesign or Merge/conflict-materialization redesign is included.

- no-release-or-remote-mutation
  - Kind: excluded-scope
  - Description: no Marketplace publication, release, background push or unrelated remote mutation is authorized or performed.

- full-typescript-toolchain-unavailable
  - Kind: unresolved-dependency
  - Description: the carried Workspace intentionally omits installed dev dependencies, so the declared `node` and `vscode` type definition libraries are unavailable and repository-wide `tsc --noEmit` stops at TS2688 before source typechecking. Exact-Core runtime regression evidence is complete, but full installed-toolchain validation must be rerun where the lockfile dependencies are available.
  - Responsible Party Or Role: Anchor / later execution host with the declared locked development dependencies installed.

## Completion Expectation

- Signal Kind: return
- Signal Meaning: Kodax returns the implemented Major 003 Git-ergonomics repair with SCM-first manual commit control, singular fail-safe post-stage automation, exact same-operation push protection and 86/86 exact-Core regression evidence; full installed-toolchain validation and Sigma live Windows acceptance remain explicit later gates.
- Return To: Anchor
- Return To Reference: [Anchor Role — Successor Evolution Continuation](business::.topics/roles/001-1-1-1-anchor-successor-evolution-role.trace.md)

## Interpretation Limits

- Does Not Mean: Sigma accepted the UX, `npm run validate` passed in this dependency-omitted carrier, background push is authorized, source-only staging may auto-commit, or Transport/Merge/release work is complete.
- Must Not Be Used To Claim: permission to push unrelated/manual commits automatically, substitute dependency versions, move Core/Docs semantics into VS Code, or publish a release.
- Authority Limits: Kodax owns only the bounded Extension VS Code Git tranche returned here; Sigma retains human acceptance and Anchor retains progression/orchestration.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-3-6-4-1-3-1-1-1-2-1-2-vs-code-major-003-sigma-git-automation-scm-ergonomics-repair-task.trace.md](001-3-6-4-1-3-1-1-1-2-1-2-vs-code-major-003-sigma-git-automation-scm-ergonomics-repair-task.trace.md)
  - Value: by8CGNC3wDBtCW_eWSalYe6WtM5fIVjEpn4p7buNFKY

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: B83tsdZNsyoeRI4KyzcuEkU2xT28b1wpjmIYBJ8Vlcs