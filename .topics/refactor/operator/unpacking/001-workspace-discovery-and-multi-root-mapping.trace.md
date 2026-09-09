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
  - Created At: 2026-09-09 19:31:55
  - Authors: Anchor
  - Why: Sigma requested unpacking to become multi-root-native before broader VS Code Handoff UX is bridged.
  - Summary: Match received Workspaces to active multi-root repositories and explicitly add or skip missing repositories.
  - Status: ready/local

---

# Workspace discovery and multi-root mapping

## Objective

Map every qualified Workspace carried by a received Handoff package against the repositories already present in the active VS Code multi-root workspace, and make missing Workspace handling explicit before any source replacement occurs.

## Done Criteria

- Package Workspace inventory comes from qualified Tiinex package/landing projections rather than private carrier reinterpretation.
- Existing repositories are matched using the qualified repository identity/ref information available from Workspace artifacts and local Git facts.
- Each unmatched Workspace is explicitly offered as Add or Skip; Skip mutates nothing for that Workspace.
- Add asks for a destination with the picker initially biased to the parent directory shared by the largest number of current workspace repositories.
- A successfully added repository is inserted into the currently open `.code-workspace` file using a relative path when a saved workspace file exists.
- No repository or workspace-folder addition silently replaces an existing folder.

## Scope

`extension-vscode` discovery, local Git-repository discovery, folder selection, and active multi-root workspace configuration updates.

## Dependencies

- Parent VS Code Handoff discovery/manufacture minimum Task.
- Qualified Tiinex Workspace landing projection.
- VS Code built-in Git and multi-root workspace APIs.

## Boundary

Host UX and local workspace configuration only. This Task does not redefine Workspace identity, repository identity, or carrier semantics.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-vs-code-handoff-discovery-and-manufacture-minimum.trace.md](../001-vs-code-handoff-discovery-and-manufacture-minimum.trace.md)
  - Value: WrR1L02KLX6Hmie0wz1JokOvZvXxPJ0Rz6kvs-1Wmtc

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: jkt0Ul3trMu7cAGV3Zx990mpbsnxnvXnZaFlXCy_BFw