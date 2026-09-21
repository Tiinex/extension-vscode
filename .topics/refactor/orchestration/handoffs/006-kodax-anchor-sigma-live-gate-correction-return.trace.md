# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-20 16:25:38
  - Trace: [001-4-2-sigma-live-gate-correction-qualified-participants-multi-handoff.trace.md](../001-4-2-sigma-live-gate-correction-qualified-participants-multi-handoff.trace.md)
  - Origin:
    - [relative](../001-4-2-sigma-live-gate-correction-qualified-participants-multi-handoff.trace.md)
- Current
  - Current Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-20 18:31:12
  - Authors: Kodax
  - Why: Complete the bounded Kodax host correction lane for Task 001-4-2.
  - Summary: Return Core-qualified participant affordance, Core-owned multi-Handoff allocation consumption, staged progress, and technical qualification for Anchor reconciliation and Sigma replay.
  - Status: ready/local

---

## Handoff Parties

- Purpose: return the bounded Sigma live-gate VS Code correction to Anchor for reconciliation with the shared Core allocation lane and replay through Sigma's exact human operator workflow.
- From: Kodax
- From Kind: role
- From Reference: [Kodax Canonical Holder Cutover Role](business::.topics/roles/001-6-1-kodax-canonical-holder-cutover-role.trace.md)
- To: Anchor
- To Kind: role
- To Reference: [Anchor Canonical Holder Cutover Role](business::.topics/roles/001-1-1-1-1-1-anchor-canonical-holder-cutover-role.trace.md)

## Transfers

- qualified-participant-affordance-correction
  - Transfer Kind: work
  - Description: Attach/Create now exposes an operator confirmation affordance only when the exact Core participant projection is qualified and non-empty. The affordance represents the complete Core-qualified semantic participant Role set; cancellation leaves the Handoff unattached, and absent/unresolved/blocked participant authority is never replaced by endpoint/cache/Role inventory or speaker state.
  - Controlling Artifact: [Sigma Live Gate Correction](../001-4-2-sigma-live-gate-correction-qualified-participants-multi-handoff.trace.md)
  - Boundary: VS Code presents and forwards Core-qualified participant material only; it does not derive Participant, Role, holder-binding or speaker semantics.

- multi-handoff-core-allocation-consumption
  - Transfer Kind: work
  - Description: The routed Handoff Pack path no longer calls host-owned `expectedOutgoingCarrierDimension()` and no longer rejects a valid continuation because a child Handoff artifact Parent path fails a VS Code path-match heuristic. Every attached Handoff route is forwarded to shared manufacture. The host consumes Core `carrierAllocation`, requires qualified state, cross-checks allocation dimension against Core lineage projection, and requires preview/build allocation stability.
  - Controlling Artifact: [Sigma Live Gate Correction](../001-4-2-sigma-live-gate-correction-qualified-participants-multi-handoff.trace.md)
  - Boundary: Parent Pointer order, selected parent route, sibling ordinal and child carrier dimension remain Core-owned. Invalid or ambiguous parent topology remains fail-closed with shared Core reason text; no host replacement algorithm was added.

- routed-carrier-filename-consumption
  - Transfer Kind: work
  - Description: Routed Handoff Pack now uses the Core preview's qualified carrier filename as its base and applies only destination-local collision suffixing before publication. It no longer feeds a host-projected routed carrier dimension/filename back as a qualification precondition.
  - Controlling Artifact: [VS Code Sigma Live-Gate Correction Technical Evidence](../evidence/003-vs-code-sigma-live-gate-correction-technical-evidence.trace.md)
  - Boundary: Pointerless Workspace-carrier allocation remains the previously bounded path; this transfer concerns routed Handoff continuation only.

- progress-stage-lifecycle
  - Transfer Kind: work
  - Description: Long-running Outgoing work remains visibly staged across Workspace/source qualification, Core runtime/context qualification, Handoff route qualification, route/allocation preview, manufacture/requalification, Core-derived output allocation, publication, discovery refresh and Transport enqueue. Pack loading state clears in `finally` on terminal success/failure.
  - Controlling Artifact: [VS Code Sigma Live-Gate Correction Technical Evidence](../evidence/003-vs-code-sigma-live-gate-correction-technical-evidence.trace.md)
  - Boundary: Current Pack progress is non-cancellable; no artificial cancellation semantics were introduced.

- technical-qualification
  - Transfer Kind: work
  - Description: Final qualification is 107/107 bridge core cases and 4/4 real package-builder/VSIX integration scenarios against the exact carried Core implementation surface used for bootstrap. All 50 TypeScript source files parse/transpile with zero syntax diagnostics. Full repository semantic typechecking remains unavailable because lockfile-pinned development type packages are absent and npm registry lookup fails with `EAI_AGAIN`.
  - Controlling Artifact: [VS Code Sigma Live-Gate Correction Technical Evidence](../evidence/003-vs-code-sigma-live-gate-correction-technical-evidence.trace.md)
  - Boundary: This is bounded technical evidence, not Sigma acceptance, registry-tarball equivalence or release approval.

## Required Context

- extension-vscode-workspace
  - Material: exact current Extension VS Code Workspace containing the bounded source correction, focused regressions and retained qualification logs.
  - Material Reference: [Extension VS Code Workspace](extension-vscode::.topics/.workspaces/tiinex-extension-vscode.workspace.md)
  - Purpose: writable/reconcilable implementation source for Anchor and the subsequent Sigma replay candidate.
  - Availability: available

- technical-evidence
  - Material: Kodax technical qualification Evidence for Task `001-4-2`.
  - Material Reference: [VS Code Sigma Live-Gate Correction Technical Evidence](../evidence/003-vs-code-sigma-live-gate-correction-technical-evidence.trace.md)
  - Purpose: preserve executed bridge/package results, exact build limitation, implementation boundary and interpretation limits.
  - Availability: available

- sigma-live-feedback
  - Material: exact durable Sigma Feedback that triggered this correction.
  - Material Reference: [Sigma Live VS Code Gate Feedback](../feedback/001-sigma-live-vs-code-gate-feedback-participant-multi-handoff-pack.trace.md)
  - Purpose: preserve the human reproduction: participant affordance disappearance, two-Handoff Pack host blocker, and coarse progress.
  - Availability: available

- controlling-task
  - Material: bounded correction Task authored by Anchor.
  - Material Reference: [Sigma Live Gate Correction](../001-4-2-sigma-live-gate-correction-qualified-participants-multi-handoff.trace.md)
  - Purpose: exact scope, Done Criteria, exclusions and acceptance boundary.
  - Availability: available

- business-stable-full-source-frontier
  - Material: exact Business Turn 2 stable full-source frontier required by carried extension-vscode lineage continuity.
  - Material Reference: [Turn 2 Stable Full-Source Frontier](business::.topics/initiatives/refactor/001-turn-2-stable-full-source-frontier.trace.md)
  - Purpose: keep fresh Anchor cold-start Parent continuity locally resolvable without remote reconstruction.
  - Availability: available

- anchor-canonical-holder-role
  - Material: canonical Anchor Role authorizing selected-Handoff consumption/session binding.
  - Material Reference: [Anchor Canonical Holder Cutover Role](business::.topics/roles/001-1-1-1-1-1-anchor-canonical-holder-cutover-role.trace.md)
  - Purpose: preserve exact recipient holder-assignment authority, including canonical `Holder Relationship -> Assignment Modes: explicit-session, handoff` material.
  - Availability: available

## Reference Context

- core-participant-contract
  - Material: Exact participant projection consumed by the host is the carried shared Core manufacture receipt `plan.requirements.participantRoles`; explicit host participant input is accepted only when it matches Core's exact semantic participant set.
  - Purpose: prevent Anchor/Sigma from interpreting the restored UI as host-owned participant selection semantics.
  - Availability: available

- core-carrier-allocation-contract
  - Material: Exact carried shared Core manufacture receipt now exposes `carrierAllocation`; ordinary non-Major continuation derives qualified sibling allocation from parent package Handoff Pointer topology and blocks ambiguous parallel parent topology when no exact selector exists.
  - Purpose: identify the shared contract the VS Code bridge now consumes instead of `expectedOutgoingCarrierDimension()` or child-artifact Parent-path inference.
  - Availability: available

- source-change-map
  - Material: `src/core/carrierAllocation.ts` (new), `src/packageBuilder.ts`, `src/operatorTrees.ts`, and `test/run.mjs`.
  - Purpose: compact bounded review map; exact carried source remains authoritative.
  - Availability: available

## Retained Responsibilities

- core-return-reconciliation
  - Retained By: Anchor
  - Retained By Reference: [Anchor Canonical Holder Cutover Role](business::.topics/roles/001-1-1-1-1-1-anchor-canonical-holder-cutover-role.trace.md)
  - Responsibility: reconcile this Kodax host return with the parallel Loom/Core allocation return/current shared frontier before presenting one exact candidate to Sigma.

- live-ux-acceptance
  - Retained By: Sigma
  - Retained By Reference: [Sigma Canonical Holder Cutover Role](business::.topics/roles/001-4-1-sigma-canonical-holder-cutover-role.trace.md)
  - Responsibility: replay the same real Windows/main-host VS Code participant / two-Handoff Pack / long-progress flow and report acceptance or one concrete bounded defect. Machine-green evidence does not replace this gate.

- bounded-host-correction-response
  - Retained By: Kodax
  - Retained By Reference: [Kodax Canonical Holder Cutover Role](business::.topics/roles/001-6-1-kodax-canonical-holder-cutover-role.trace.md)
  - Responsibility: address any exact host-side correction returned by Anchor reconciliation or Sigma replay that remains inside Task `001-4-2` scope.

## Exclusions And Dependencies

- shared-semantic-redesign
  - Kind: excluded-scope
  - Description: No new Participant, Session, Meeting, Conversation, Handoff, Role, holder-binding or carrier-allocation semantics are defined or authorized by this return.
  - Responsible Party Or Role: Anchor / shared semantic owners

- repository-semantic-typecheck
  - Kind: unresolved-dependency
  - Description: `tsc -p tsconfig.json --noEmit` cannot perform semantic checking because `@types/node` and `@types/vscode` are absent; npm registry acquisition fails with `EAI_AGAIN`. Exact logs are retained in technical Evidence.
  - Responsible Party Or Role: Kodax / environment

- npm-core-tarball-equivalence
  - Kind: unresolved-dependency
  - Description: Qualification used the exact carried Core runtime implementation with a disposable ignored manifest-version shim required by the extension's lock/version gate. It does not independently prove byte equivalence to the registry tarball named `@tiinex/core@0.35.0`.
  - Responsible Party Or Role: Anchor

- windows-live-acceptance
  - Kind: unresolved-dependency
  - Description: Sigma has not yet replayed this exact reconciled source in the real Windows/main-host VS Code flow.
  - Responsible Party Or Role: Sigma

- release
  - Kind: excluded-scope
  - Description: No Marketplace/npm publication, deployment, release approval, unrelated Git UX work, Transport redesign or remote repository mutation is authorized by this Handoff.
  - Responsible Party Or Role: Anchor

## Completion Expectation

- Signal Kind: acknowledgement
- Signal Meaning: Anchor should reconcile this bounded host correction with the exact shared Core allocation return/current frontier, preserve the technical limitations, and route one exact reconciled candidate to Sigma for the repeated live gate or return one bounded correction to Kodax.
- Return To: Kodax
- Return To Reference: [Kodax Canonical Holder Cutover Role](business::.topics/roles/001-6-1-kodax-canonical-holder-cutover-role.trace.md)

## Interpretation Limits

- Does Not Mean: Sigma has accepted the corrected UX, a full semantic typecheck passed, the npm Core tarball was independently verified, host participant selection owns participant semantics, or routed carrier allocation moved into VS Code.
- Must Not Be Used To Claim: participant authority from endpoint/cache/Role inventory or speaker labels; permission to accept only a subset of Core's exact semantic participant set; host authority to infer parent route Pointer order/sibling ordinal/child carrier dimension; or permission to suppress shared Core blocked/ambiguous allocation findings.
- Authority Limits: bounded extension-vscode presentation/orchestration implementation and technical qualification for Task `001-4-2`; semantic participant and carrier allocation authority remain in shared Core/accepted Business boundaries.
- Transport Limits: return the exact extension-vscode Workspace, technical Evidence, controlling Task/Feedback, Business stable-frontier closure and canonical Anchor holder Role needed for a fresh recipient to ground without remote reconstruction. Do not infer missing recipient or semantic authority during transport.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-4-2-sigma-live-gate-correction-qualified-participants-multi-handoff.trace.md](../001-4-2-sigma-live-gate-correction-qualified-participants-multi-handoff.trace.md)
  - Value: 2S-G4OAhW3BkSfNG4UAiiXwKSf32fipGhQhI5XPvi5o

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: XDX0vY4xyWaVsERoArH-NWFNp4lHTh-709Ivifllsd8