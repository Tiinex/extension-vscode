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
  - Created At: 2026-09-10 00:05:15
  - Authors: Anchor
  - Why: Sigma requires Discovery to remain non-mutating, prompt for a folder when absent, and browse artifact-bearing carrier structure.
  - Summary: Read-only carrier discovery rooted in an explicit operator-selected folder.
  - Status: ready/local

---

# Discovery tree and folder gate

## Objective

Make Discovery a read-only carrier browser rooted in one explicit operator-selected folder.

## Done Criteria

- Discovery lists `.handoff-package.zip` files with timestamps and permits artifact-tree expansion without landing.
- No implicit Downloads default exists.
- When no discovery folder is configured, opening/expanding Discovery asks for a folder; cancelling leaves an explanatory `You need to select a discovery folder` node and permits the prompt again on the next reopen.
- Discovery has a native title action for changing the folder and a separate refresh action.
- Expanding packages indexes Markdown/Tiinex artifact material only and never invokes Receive/landing.

## Scope

`extension-vscode` Discovery TreeView, discovery-folder setting, carrier indexing and tests only.

## Dependencies

Parent native carrier tree operator Task and existing ZIP/artifact indexing helpers.

## Boundary

Discovery is observation only. Setting Incoming is a separate action and still performs qualification before any Incoming state is accepted.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-native-carrier-tree-operator.trace.md](../../001-native-carrier-tree-operator.trace.md)
  - Value: S0cOLmqgAnRbfOPzsX0MBgnI5i1-keNsrHsa2TgrjBI

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: NeDQCTF9qBrH4ttsRw2J27wDb_NoUBuemNCAYTDkDjY