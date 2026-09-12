# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-12 16:21:47
  - Trace: [001-3-6-4-1-3-1-1-1-2-1-2-2-1-2-1-vs-code-major-003-incoming-merge-conflict-materialization-task.trace.md](001-3-6-4-1-3-1-1-1-2-1-2-2-1-2-1-vs-code-major-003-incoming-merge-conflict-materialization-task.trace.md)
  - Origin:
    - [relative](001-3-6-4-1-3-1-1-1-2-1-2-2-1-2-1-vs-code-major-003-incoming-merge-conflict-materialization-task.trace.md)
- Current
  - Current Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-12 16:21:48
  - Authors: Anchor
  - Why: Transport is accepted; the next unresolved operator defect is Merge behavior that cannot presently materialize conflicts for Sigma.
  - Summary: Delegate the bounded Merge repair: safe additions, local preservation, actionable same-path conflicts, and no Merge-to-Replace fallback.
  - Status: ready/local

---

# Anchor To Kodax — VS Code Major 003 Incoming Merge Conflict Materialization

## Handoff Parties

- Purpose: continue VS Code Major 003 with the bounded Incoming Merge repair so Merge performs safe union behavior and materializes actionable conflicts instead of redirecting the operator to Replace.
- From: Anchor
- From Kind: role
- From Reference: [Anchor Role — Successor Evolution Continuation](business::.topics/roles/001-1-1-1-anchor-successor-evolution-role.trace.md)
- To: Kodax
- To Kind: role
- To Reference: [Kodax Role](business::.topics/roles/001-6-kodax-role.trace.md)

## Transfers

- incoming-merge-repair
  - Transfer Kind: work-and-responsibility
  - Description: implement the exact bounded Merge behavior in the controlling Task: preserve local-only material, add non-colliding Incoming material, turn same-path byte divergence into an actionable conflict, and remove the ordinary Merge-to-Replace fallback.
  - Controlling Artifact: [Incoming Merge Conflict Materialization Task](001-3-6-4-1-3-1-1-1-2-1-2-2-1-2-1-vs-code-major-003-incoming-merge-conflict-materialization-task.trace.md)
  - Boundary: Replace remains separate and destructive-by-intent; Merge must not silently become Replace or invent semantic resolution.

- native-conflict-ux
  - Transfer Kind: work-and-responsibility
  - Description: make text conflicts visible in the normal working tree using ordinary conflict conventions and VS Code-native editing/diff affordances where possible, while binary conflicts fail closed without overwriting either side.
  - Controlling Artifact: [Incoming Merge Conflict Materialization Task](001-3-6-4-1-3-1-1-1-2-1-2-2-1-2-1-vs-code-major-003-incoming-merge-conflict-materialization-task.trace.md)
  - Boundary: do not create JSON sidecars, hidden host manifests, or Tiinex semantic artifacts merely to track UI conflict state.

- regression-return
  - Transfer Kind: work
  - Description: return focused regression evidence and exact source delta proving exact-match no-op, safe additions, local-only preservation, text conflict materialization, binary fail-closed behavior, no Replace fallback, and conflict protection from post-stage auto-commit.
  - Controlling Artifact: [Incoming Merge Conflict Materialization Task](001-3-6-4-1-3-1-1-1-2-1-2-2-1-2-1-vs-code-major-003-incoming-merge-conflict-materialization-task.trace.md)
  - Boundary: Sigma live-host acceptance remains later.

## Required Context

- extension-vscode-workspace
  - Material: complete current Extension VS Code Workspace containing the accepted Transport queue and previous Major 003 operator work.
  - Material Reference: [Extension VS Code Workspace](extension-vscode::.topics/.workspaces/tiinex-extension-vscode.workspace.md)
  - Purpose: writable implementation owner and exact continuation source.
  - Availability: available

- core-workspace
  - Material: current Core Workspace used read-only for source-frontier/reconciliation and staged-validation contracts.
  - Material Reference: [Core Workspace](core::.topics/.workspaces/tiinex-core.workspace.md)
  - Purpose: shared byte-state/comparison authority; no Core mutation is transferred.
  - Availability: available

## Reference Context

- transport-return
  - Material: immediately preceding VS Code Major 003 Transport return.
  - Material Reference: [Transport Return](001-3-6-4-1-3-1-1-1-2-1-2-2-1-2-kodax-to-anchor-vs-code-major-003-transport-queue-and-qualified.trace.md)
  - Purpose: exact repo-local Parent frontier and accepted Transport source state.
  - Availability: available

## Retained Responsibilities

- shared-core-semantics
  - Retained By: Loom / Core
  - Responsibility: shared source-frontier/reconciliation semantics remain Core-owned; Kodax consumes them without private reinterpretation.

- human-acceptance
  - Retained By: Sigma
  - Responsibility: later judge Merge ergonomics and conflict-resolution usability on the Windows main host.

- orchestration
  - Retained By: Anchor
  - Responsibility: audit the return, preserve Major scope, then route first-class Artifact/Feedback/Handoff authoring as the next bounded tranche.

## Exclusions And Dependencies

- artifact-authoring
  - Kind: excluded-scope
  - Description: New Artifact/Feedback/Handoff discoverability and form UX remain the next separate Major 003 tranche.

- transport-redesign
  - Kind: excluded-scope
  - Description: accepted Transport queue behavior is not redesigned here.

- release-and-remote-mutation
  - Kind: excluded-scope
  - Description: no Marketplace publication, release, push, or other remote mutation is authorized.

## Completion Expectation

- Signal Kind: return
- Signal Meaning: Kodax returns one repo-owned Major 003 checkpoint with truthful Merge behavior, actionable text conflicts, fail-closed binary conflicts, preserved Replace semantics, focused tests and no unrelated authoring/Transport expansion.
- Return To: Anchor
- Return To Reference: [Anchor Role — Successor Evolution Continuation](business::.topics/roles/001-1-1-1-anchor-successor-evolution-role.trace.md)

## Interpretation Limits

- Does Not Mean: conflicts were semantically resolved, Replace is deprecated, Sigma accepted Merge UX, artifact authoring is complete, or VS Code Major 003 is closed.
- Must Not Be Used To Claim: authority to alter Core semantics, auto-resolve divergent Tiinex artifacts, delete local-only material, or commit unresolved conflicts.
- Authority Limits: Kodax owns only the bounded Extension VS Code Merge implementation; Core retains shared semantics, Anchor retains progression, Sigma retains human acceptance.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-3-6-4-1-3-1-1-1-2-1-2-2-1-2-1-vs-code-major-003-incoming-merge-conflict-materialization-task.trace.md](001-3-6-4-1-3-1-1-1-2-1-2-2-1-2-1-vs-code-major-003-incoming-merge-conflict-materialization-task.trace.md)
  - Value: SKl7LaVGve4az4QkWIpyrya6sUQ34y2xdabfxyR1aZQ

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: XSRLDmP2YwlA1zRs4aIjP2M3gPq0OaYdSPkaBR_mbVg