# Continuity Context

- Envelope Schema: tiinex.root.v1
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-09 18:11:03
  - Trace: [001-vs-code-handoff-discovery-and-manufacture-minimum.trace.md](../001-vs-code-handoff-discovery-and-manufacture-minimum.trace.md)
  - Origin:
    - [relative](../001-vs-code-handoff-discovery-and-manufacture-minimum.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-09 23:35:17
  - Authors: Anchor
  - Why: Sigma requested a simpler VS Code-native object model where carrier truth is browsable without turning the Tiinex panel into another generic file browser.
  - Summary: Native Discovery, Incoming and Outgoing carrier-tree operator.
  - Status: ready/local

---

# Native carrier tree operator

## Objective

Replace the monolithic operator webview with native VS Code carrier trees for Discovery, Incoming and Outgoing while preserving shared Tiinex Tooling as semantic authority.

## Done Criteria

- Discovery, Incoming and Outgoing are distinct native TreeViews with VS Code-native title/item actions.
- Every section independently supports Logical/Files and Leaves/Lineage projections without changing canonical node/action identity.
- Discovery is read-only package/artifact discovery; selecting or expanding a carrier cannot trigger landing.
- Incoming holds exactly one active qualified carrier and exposes explicit per-Workspace Merge state.
- Outgoing is a live selection context rather than a source snapshot and supports Blank / From Incoming creation.
- Handoff drafts can be prepared through shared Tooling and previewed as Markdown before any repository write.

## Scope

`extension-vscode` native operator presentation, carrier indexing, in-memory operator state, local authoring bridge and tests only.

## Dependencies

Parent VS Code Handoff discovery/manufacture minimum Task and current public `@tiinex/core` Tooling.

## Out Of Scope

Changing Core/Docs/Business, redefining carrier semantics, encryption, arbitrary per-file source scoping, 0.1.8 publication or implicit Receive mutation.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-vs-code-handoff-discovery-and-manufacture-minimum.trace.md](../001-vs-code-handoff-discovery-and-manufacture-minimum.trace.md)
  - Value: WrR1L02KLX6Hmie0wz1JokOvZvXxPJ0Rz6kvs-1Wmtc

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: S0cOLmqgAnRbfOPzsX0MBgnI5i1-keNsrHsa2TgrjBI