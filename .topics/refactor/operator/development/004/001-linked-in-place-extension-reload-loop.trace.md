# Continuity Context

- Envelope Schema: tiinex.root.v1
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-09 19:57:38
  - Trace: [004-local-extension-development-loop.trace.md](../004-local-extension-development-loop.trace.md)
  - Origin:
    - [relative](../004-local-extension-development-loop.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-09 20:20:52
  - Authors: Anchor
  - Why: Sigma rejected the F5 Extension Development Host loop and requested the previously smoother ai-provenance-style symlink/build/restart experience.
  - Summary: Replace Extension Development Host iteration with one-time linked install plus same-window build/restart prompts.
  - Status: ready/local

---

# Linked in-place extension reload loop

## Objective

Replace the rejected Extension Development Host loop with an ai-provenance-style same-window development path: link the source checkout into the active VS Code extensions directory once, then rebuild locally and offer an Extension Host restart in the running VS Code window.

## Done Criteria

- One explicit repository-local task creates a symlink/junction from the active VS Code extensions directory to this exact checkout.
- Any pre-existing installed Tiinex copy displaced by setup is preserved outside the extensions directory and can be restored by an explicit unlink task; setup is idempotent for the same checkout.
- The default build task compiles TypeScript without VSIX manufacture and emits a development-only reload signal only after a successful build.
- A linked running Tiinex extension observes that signal and offers **Restart Extensions** in the same VS Code window.
- One manual Extension Host/VS Code restart is allowed immediately after the initial link; ordinary iterations thereafter are `edit -> build -> Restart Extensions -> test`.
- Stable VS Code and Insiders extension roots are supported, with an explicit extensions-directory override for unusual installs.
- Development markers are ignored and never enter candidate VSIX bytes.
- No package-version or release-authority change is made.

## Scope

`extension-vscode` development scripts, VS Code tasks, host-only reload notification, regression coverage and local documentation.

## Dependencies

- Parent local extension development loop Task.
- Existing TypeScript build pipeline and VS Code task runner.
- User-initiated one-time development-link setup in the active VS Code installation.

## Supersedes

The parent Task's Extension Development Host/watch-loop implementation is UX-rejected. This child retains the parent's goal of no per-edit VSIX installation while changing the mechanism to linked same-window development.

## Boundary

Developer convenience only. No Core/Docs/Business mutation, shared Tooling semantic change, Handoff semantic change or 0.1.8 publication.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [004-local-extension-development-loop.trace.md](../004-local-extension-development-loop.trace.md)
  - Value: U1ixpgDLyFwh_FCoIjLCIwlM6hi2seBH2aTi44agv2Y

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: 8ZZMJE-o0RqDbzhMPnmsvip1JWK6YAIGiSDKujx0ISw