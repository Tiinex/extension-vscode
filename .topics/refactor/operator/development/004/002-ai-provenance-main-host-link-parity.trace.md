# Continuity Context

- Envelope Schema: tiinex.root.v1
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-09 20:20:52
  - Trace: [001-linked-in-place-extension-reload-loop.trace.md](001-linked-in-place-extension-reload-loop.trace.md)
  - Origin:
    - [relative](001-linked-in-place-extension-reload-loop.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-09 21:39:08
  - Authors: Anchor
  - Why: Sigma reproduced that the first versioned junction did not load Tiinex after VS Code restart and requested the proven ai-provenance behavior.
  - Summary: Adopt ai-provenance registry-aware Windows junction linking and move reload state under .vscode/link.
  - Status: ready/local

---

# Main-host link parity with ai-provenance

## Objective

Replace the first linked-development implementation with the proven ai-provenance Windows main-host junction model so the active VS Code instance actually registers and loads the local Tiinex checkout, while keeping ordinary iteration as `build -> Restart Extensions -> test` without per-edit VSIX installation.

## Done Criteria

- The Windows link setup uses an unversioned main-host junction under the stable VS Code extension root, matching the proven ai-provenance shape instead of relying on a versioned folder being discovered implicitly.
- Setup explicitly repairs the VS Code extension registry metadata in `~/.vscode/extensions/extensions.json` for the linked `tiinex.tiinex-vscode` location so the current main host recognizes the extension.
- Existing mismatched paths fail closed unless explicitly replaced; an owned development junction remains idempotent.
- Local reload state moves from `.tiinex-dev/` to ignored `.vscode/link/`.
- The default build task still compiles without VSIX manufacture and emits the reload marker only after a successful build.
- The running linked extension watches `.vscode/link/reload.json` and offers **Restart Extensions**.
- Documentation explains the one-time link step and the ordinary build/restart loop.
- Regression tests cover the new state path and registry-aware Windows link implementation.
- No package version or release authority changes.

## Scope

`extension-vscode` development scripts, local VS Code task wiring, reload marker handling, tests, README and repository-local lineage only.

## Dependencies

- Parent linked in-place extension reload loop Task.
- Proven ai-provenance main-host junction pattern as implementation evidence.
- Stable VS Code extension registry representation on Windows.

## Boundary

Developer convenience only. No Core/Docs/Business mutation, shared Tooling semantic change, Handoff semantic change, Receive semantic change, or 0.1.8 publication.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-linked-in-place-extension-reload-loop.trace.md](001-linked-in-place-extension-reload-loop.trace.md)
  - Value: 8ZZMJE-o0RqDbzhMPnmsvip1JWK6YAIGiSDKujx0ISw

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: Cmj5acH-8CofSRPjRFeNf5IZtlUWj9CMNlDfLO2BNGo