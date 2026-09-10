# Continuity Context

- Envelope Schema: tiinex.root.v1
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-09 21:39:08
  - Trace: [002-ai-provenance-main-host-link-parity.trace.md](../002-ai-provenance-main-host-link-parity.trace.md)
  - Origin:
    - [relative](../002-ai-provenance-main-host-link-parity.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-10 00:33:13
  - Authors: Anchor
  - Why: Sigma reproduced first-link failure because Save-State rejected an empty PreviousEntries collection.
  - Summary: Allow clean Windows VS Code registries with no prior Tiinex extension entries through the linked-development setup.
  - Status: ready/local

---

# Empty extension-registry link-state compatibility

## Objective

Make the Windows main-host development linker accept a clean VS Code extension registry where no prior `tiinex.tiinex-vscode` registry entries exist, so the normal `npm install -> Link -> Build` chain remains valid on first setup and after a full checkout replacement.

## Done Criteria

- `Save-State` accepts an empty `PreviousEntries` collection and persists it as an empty prior-state list.
- `Write-Registry` accepts an empty entry collection so unlink/restore remains valid when there was no prior registry entry.
- Regression coverage fails if either mandatory collection parameter again rejects the empty collection case.
- The normal build/test qualification remains green after the linker correction.
- No package version, Handoff semantics, Receive semantics, or sibling Workspace source changes.

## Scope

`extension-vscode` Windows developer-link script, regression tests, and repository-local lineage only.

## Dependencies

- Parent ai-provenance main-host link parity Task.
- Windows PowerShell parameter binding for mandatory collection parameters.
- Existing `npm install -> Link -> Build` developer-loop contract.

## Evidence Trigger

Sigma ran **Tiinex: Link this checkout** on Windows and PowerShell failed at `Save-State -PreviousEntries $previous` because `$previous` was an empty array.

## Boundary

Developer-loop reliability only. This does not alter Tiinex carrier authority, Core Tooling behavior, or release state.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [002-ai-provenance-main-host-link-parity.trace.md](../002-ai-provenance-main-host-link-parity.trace.md)
  - Value: Cmj5acH-8CofSRPjRFeNf5IZtlUWj9CMNlDfLO2BNGo

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: Nveuu3S5qKwReFH5zQ6pih-4YpY8XJwaCsBOoFgdxmg