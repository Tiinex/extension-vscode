# Continuity Context

- Envelope Schema: tiinex.root.v1
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-10 00:05:15
  - Trace: [001-discovery-tree-and-folder-gate.trace.md](../001-discovery-tree-and-folder-gate.trace.md)
  - Origin:
    - [relative](../001-discovery-tree-and-folder-gate.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-10 00:05:16
  - Authors: Anchor
  - Why: Sigma split auto discovery refresh from the independent option to place the newest qualified carrier in Incoming.
  - Summary: Separate automatic tree refresh from automatic newest-carrier Incoming selection.
  - Status: ready/local

---

# Discovery refresh and latest-to-Incoming policies

## Objective

Separate automatic Discovery refresh from automatic selection of the newest qualified carrier as Incoming.

## Done Criteria

- `tiinex.discovery.autoRefresh` is a Yes/No boolean that only refreshes the Discovery tree when package files change.
- `tiinex.discovery.latestToIncoming` is a separate Yes/No boolean.
- latest-to-Incoming qualifies the carrier and updates Incoming but performs no Receive/landing mutation.
- A newly observed latest package is handled once per refresh transition rather than generating repeated selection spam.

## Scope

`extension-vscode` Discovery refresh policy, latest-to-Incoming selection policy and tests only.

## Dependencies

Parent Discovery tree/folder Task and qualified Incoming selection path.

## Boundary

No repository replacement, commit or push follows from either setting.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-discovery-tree-and-folder-gate.trace.md](../001-discovery-tree-and-folder-gate.trace.md)
  - Value: NeDQCTF9qBrH4ttsRw2J27wDb_NoUBuemNCAYTDkDjY

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: S2wRyqD-2-CeTTCZpiBtSIK1jlT27TS-d0PCQ6naQ1g