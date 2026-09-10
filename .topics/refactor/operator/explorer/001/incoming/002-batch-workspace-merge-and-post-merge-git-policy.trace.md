# Continuity Context

- Envelope Schema: tiinex.root.v1
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-10 00:05:17
  - Trace: [001-active-carrier-and-explicit-workspace-merge.trace.md](001-active-carrier-and-explicit-workspace-merge.trace.md)
  - Origin:
    - [relative](001-active-carrier-and-explicit-workspace-merge.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-10 01:57:38
  - Authors: Anchor
  - Why: Sigma prefers one multi-select merge action and wants staging/commit/push policy evaluated only after merge.
  - Summary: Select Incoming Workspaces once, then apply safe landing and stage/commit/push in order.
  - Status: ready/local

---

# Batch Incoming Workspace merge and post-merge Git policy

## Objective

Make Incoming replacement fast and explicit by selecting the Workspaces to merge in one multi-select step, then applying the established safe landing rules and Git policy in a predictable order.

## Done Criteria

- Incoming has one `Select Workspaces to Merge` action rather than requiring one Merge button per Workspace.
- The multi-select lists qualified Incoming Workspaces in deterministic case-insensitive alphabetical order and skips already merged session entries.
- Only selected Workspaces are eligible for mutation in that invocation.
- Existing origin/branch/dirty/unasserted-ref safeguards still run for selected Workspaces; unselected Workspaces remain untouched.
- After successful source replacement: stage by default; if `tiinex.landing.stage = no`, leave the changes unstaged.
- Commit policy is evaluated only after selected merges complete and only for changes staged by the same invocation. `ask` prompts once at the appropriate boundary; `no` leaves staged changes and makes the trusted commit message available; `yes` commits.
- Push is eligible only for commits created by that same merge invocation and never reacts to a later manual commit.
- Successful merged Workspaces show session-local green checks; reopening Incoming resets those checks.

## Dependencies

Parent Incoming carrier Task, existing audited landing safeguards, and public shared Tiinex landing/qualification Tooling.

## Scope

`extension-vscode` Incoming selection UX, landing orchestration around existing shared Tooling qualification, host Git follow-up, tests and docs.

## Safety Boundary

No mutation is triggered by Discovery or merely setting Incoming. Real repositories remain protected by explicit Workspace selection and the previously audited landing safeguards.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-active-carrier-and-explicit-workspace-merge.trace.md](001-active-carrier-and-explicit-workspace-merge.trace.md)
  - Value: -TLenuIcc79Rp9uoCvAUsh6it926ukWIS2hgsUhDqJ0

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: J4YRXgAfUDrTeqNIOXmrJznKOo3ZwptNwNG-9Y-o2tg