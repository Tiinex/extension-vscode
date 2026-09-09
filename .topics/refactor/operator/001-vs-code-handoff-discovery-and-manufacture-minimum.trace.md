# Continuity Context

- Envelope Schema: tiinex.root.v1
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-09 15:01:37
  - Trace: [001-turn-2-vs-code-integration-and-operator-frontier.trace.md](../001-turn-2-vs-code-integration-and-operator-frontier.trace.md)
  - Origin:
    - [relative](../001-turn-2-vs-code-integration-and-operator-frontier.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-09 18:11:03
  - Authors: Anchor
  - Why: Manual Handoff merging is now the highest-friction operator bottleneck and the existing VS Code Receive → Review → Return surface is close enough to qualify before broader host work.
  - Summary: Qualify the bare-minimum Handoff discovery and canonical return-package flow in extension-vscode.
  - Status: ready/local

---

# VS Code Handoff discovery and manufacture minimum

## Objective

Make the existing Receive → Review → Return operator path usable for ordinary Tiinex Handoff packages before broader VS Code integration continues.

## Done Criteria

- The operator can manually select a `.handoff-package.zip`, with bounded inbox discovery remaining optional rather than authoritative.
- Selected Handoff material is passed through the qualified Tiinex bootstrap/grounding path; the extension does not privately reinterpret carrier semantics.
- The operator can select the controlling Handoff/Task and the exact Workspace set required for a return.
- Return manufacture uses the public Tiinex Handoff tooling surface and produces one canonical Handoff package plus the exact copy/paste routing text.
- Every carried Workspace is full-source within the return scope, and stale sibling context is never promoted over the operator's selected current source.
- Manufacture or qualification failure remains an explicit blocker; an ordinary ZIP is never relabelled as a Handoff.
- The minimum flow is covered by a small focused test set around discovery, source selection, manufacture and failure handling.
- VS Code 0.1.8 publication remains out of scope.

## Scope

`extension-vscode` host UX and its bridge to public Tiinex Core/Tooling contracts. Shared Core, Docs, Interop, provider, Verse and Runtime changes are change proposals back to Refactor Anchor unless the task is explicitly expanded.

## Dependencies

- Parent VS Code Turn-2 integration Task.
- Current public `@tiinex/core` Handoff/portable Tooling surface.
- Existing Receive → Review → Return implementation in `extension-vscode`.

## Out Of Scope

- Native-chat runtime bridge.
- VSIX 0.1.8 publication.
- Redefining Handoff, carrier, Workspace or lineage semantics in the extension.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-turn-2-vs-code-integration-and-operator-frontier.trace.md](../001-turn-2-vs-code-integration-and-operator-frontier.trace.md)
  - Value: wz5I2dE4nCCjlh-4ldRwx28Nb-8xYCeVXnSprBYpH-U

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: WrR1L02KLX6Hmie0wz1JokOvZvXxPJ0Rz6kvs-1Wmtc