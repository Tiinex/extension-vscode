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
  - Created At: 2026-09-11 17:20:45
  - Authors: Kodax
  - Why: Sigma requested explicit repo-local Tasks and lineage so Kodax changes stay scoped to the VS Code repository.
  - Summary: Keep Sigma dogfood work repo-owned and bounded to extension-vscode.
  - Status: ready/local

---

# Kodax Sigma extension stabilization

## Objective

Keep Sigma dogfood corrections and implementation work explicitly owned by `extension-vscode` so code changes, local UX decisions, tests, and repo-local continuity remain scoped to the VS Code host repository rather than depending on Business coordination artifacts or conversational memory.

## Done Criteria

- New Kodax implementation Tasks for the active VS Code operator lane are parented in this repository.
- `extension-vscode` is the only mutable Workspace for this lineage unless Sigma explicitly expands scope.
- Business, Core and Docs remain read-only authority/context; required shared-contract changes are recorded as blockers or returned proposals instead of being patched privately in the host.
- Sigma live dogfood is treated as the acceptance frontier for Merge, Replace, Incoming, Outgoing, Pack, Handoff authoring, Attach and transport ergonomics.
- Windows-host behavior is not called accepted until it has been exercised in Sigma's real VS Code flow.
- Existing carrier/Handoff semantics continue to come from qualified Tiinex Tooling rather than host-private reinterpretation.
- Release/publication remains out of scope unless separately authorized.

## Scope

`extension-vscode` source, repo-local `.topics` lineage, focused tests, local package qualification and Sigma-facing operator UX only.

## Dependencies

- Parent VS Code Handoff discovery/manufacture minimum Task.
- Qualified public Tiinex Core/Tooling contracts used by the extension.
- Sigma acceptance feedback from real VS Code dogfood.

## Boundary

This lineage does not grant mutation authority over Business, Core, Docs or other Tiinex repositories. Shared semantic gaps remain explicit external dependencies until delegated to their owning repository.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-vs-code-handoff-discovery-and-manufacture-minimum.trace.md](../001-vs-code-handoff-discovery-and-manufacture-minimum.trace.md)
  - Value: WrR1L02KLX6Hmie0wz1JokOvZvXxPJ0Rz6kvs-1Wmtc

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: dhAbPyn3Um3C4zoZ4VLrDkFePAYujy2qRC7rIA-wMY0