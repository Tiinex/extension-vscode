# Continuity Context

- Envelope Schema: tiinex.root.v1
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-09 23:35:17
  - Trace: [001-native-carrier-tree-operator.trace.md](../../001-native-carrier-tree-operator.trace.md)
  - Origin:
    - [relative](../../001-native-carrier-tree-operator.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-10 00:05:17
  - Authors: Anchor
  - Why: Sigma wants Incoming to show merge actions per Workspace and replace successful actions with a session-local green check.
  - Summary: One qualified Incoming carrier with explicit per-Workspace merge state.
  - Status: ready/local

---

# Incoming carrier and explicit Workspace merge state

## Objective

Represent exactly one active qualified carrier as Incoming and make Workspace mutation explicit per Workspace.

## Done Criteria

- Selecting a carrier as Incoming qualifies it before accepting state.
- Incoming exposes the same carrier/artifact projections as Discovery.
- Each mergeable Workspace has an explicit Merge action.
- A successful merge replaces the action with a green check for the current Incoming session.
- Reopening the same carrier resets merge-session checks.
- Existing Receive branch/dirty/repository safeguards remain the mutation authority behind Merge.

## Scope

`extension-vscode` Incoming TreeView state, explicit Workspace Merge action presentation and tests only.

## Dependencies

Parent native carrier tree operator Task and existing qualified Receive/landing orchestration.

## Boundary

Incoming state is not itself repository staging and does not mutate a Workspace until its explicit Merge action is accepted.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-native-carrier-tree-operator.trace.md](../../001-native-carrier-tree-operator.trace.md)
  - Value: S0cOLmqgAnRbfOPzsX0MBgnI5i1-keNsrHsa2TgrjBI

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: -TLenuIcc79Rp9uoCvAUsh6it926ukWIS2hgsUhDqJ0