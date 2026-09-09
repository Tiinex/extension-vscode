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
  - Created At: 2026-09-09 19:57:38
  - Authors: Anchor
  - Why: Sigma requested the previously successful ai-provenance-style local development loop before further VS Code UX iteration.
  - Summary: Run VS Code operator UX iterations from the checkout through watch build and Extension Development Host instead of per-edit VSIX installs.
  - Status: ready/local

---

# Local extension development loop

## Objective

Make VS Code operator UX iteration local and fast so Sigma can test extension changes from the source checkout without receiving and installing a newly manufactured VSIX after every edit.

## Done Criteria

- Repository-local VS Code tasks provide a TypeScript watch build and an explicit one-shot local build.
- A repository-local Extension Development Host launch configuration starts against the checkout and depends on the watch task.
- Backend changes require only the normal Extension Development Host restart/reload cycle; VSIX manufacture is reserved for qualification/release evidence.
- The development loop does not change package version or imply 0.1.8 publication.

## Scope

`extension-vscode` development configuration and documentation only.

## Dependencies

- Parent VS Code Handoff discovery/manufacture minimum Task.
- Existing TypeScript build pipeline.

## Boundary

Developer convenience only. No shared Tooling semantics, release authority, or sibling Workspace mutation.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-vs-code-handoff-discovery-and-manufacture-minimum.trace.md](../001-vs-code-handoff-discovery-and-manufacture-minimum.trace.md)
  - Value: WrR1L02KLX6Hmie0wz1JokOvZvXxPJ0Rz6kvs-1Wmtc

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: U1ixpgDLyFwh_FCoIjLCIwlM6hi2seBH2aTi44agv2Y