# Continuity Context

- Envelope Schema: tiinex.root.v1
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-09 20:20:52
  - Trace: [001-linked-in-place-extension-reload-loop.trace.md](../001-linked-in-place-extension-reload-loop.trace.md)
  - Origin:
    - [relative](../001-linked-in-place-extension-reload-loop.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-09 21:22:42
  - Authors: Anchor
  - Why: Sigma ran npm run dev:build in the linked local checkout and TypeScript rejected the manual/auto comparison because the configuration fallback was inferred as the literal manual type.
  - Summary: Fix TS2367 in the linked dev build without changing discovery semantics.
  - Status: ready/local

---

# Discovery mode typecheck regression

## Objective

Correct the linked development build regression reported by Sigma where TypeScript inferred the `tiinex.handoff.discovery` configuration fallback as the literal type `"manual"`, making the valid comparison with `"auto"` fail with TS2367 during `npm run dev:build`.

## Done Criteria

- `HandoffInboxWatcher.restart()` reads `tiinex.handoff.discovery` as the declared `"manual" | "auto"` configuration union rather than inferring only the fallback literal.
- No discovery behavior or setting values change; the correction is typing-only.
- The same-window linked build path can proceed past this TypeScript comparison on a normal installed dev-dependency environment.
- The correction remains VS Code-local and does not mutate Business, Core or Docs.

## Scope

`extension-vscode` TypeScript configuration access for Handoff discovery and its linked-development build qualification.

## Dependencies

- Parent linked in-place extension reload loop Task.
- Existing `tiinex.handoff.discovery` schema values `manual` and `auto`.

## Boundary

This is a compile-time regression correction only. It does not change Receive semantics, discovery policy, package authority, release version or sibling Workspaces.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-linked-in-place-extension-reload-loop.trace.md](../001-linked-in-place-extension-reload-loop.trace.md)
  - Value: 8ZZMJE-o0RqDbzhMPnmsvip1JWK6YAIGiSDKujx0ISw

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: 5iGqJLjy72tmdOEk571CsfMfYT1OlZcL4745pVKEqT8