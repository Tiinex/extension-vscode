# Continuity Context

- Envelope Schema: tiinex.root.v1
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-09 23:35:17
  - Trace: [001-native-carrier-tree-operator.trace.md](../../001-native-carrier-tree-operator.trace.md)
  - Origin:
    - [relative](../../001-native-carrier-tree-operator.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-10 00:21:39
  - Authors: Anchor
  - Why: Sigma explicitly asked for stronger self-review after earlier dev-loop wiring misses; the first tree milestone also adds new carrier routing behavior that warrants direct shared-Tooling smoke qualification.
  - Summary: Close native carrier-tree review gaps and prove multi-route manufacture before return.
  - Status: ready/local

---

# Native tree self-review and manufacture smoke

## Objective

Close repository-local review gaps in the first native carrier-tree implementation before returning it for Anchor/Sigma testing.

## Done Criteria

- Retired webview/inbox source is removed once native TreeViews own the operator surface.
- Compatibility command titles use Discovery / Incoming / Outgoing vocabulary rather than the retired Receive / Review / Return webview vocabulary.
- Discovery cache invalidates when a carrier is rebuilt at the same path, and latest-to-Incoming notices a same-path new file identity.
- Role choices include current Role artifacts from every qualified local Workspace, not only Workspaces already selected into Outgoing, while package-carried endpoint Role cache remains a fallback.
- Tree-item-only commands fail harmlessly without a node and are hidden from the Command Palette.
- A completed Incoming Workspace renders a passed-state check and no longer exposes Merge.
- Shared Tooling is smoke-tested with two explicit Handoff routes in one carrier and returns both routes qualified with a clean orientation.
- Shared Tooling is smoke-tested with an additional participant Role route requirement and emits the participant Role pointer while the carrier remains qualified.
- Full extension build/tests/package qualification remains green after the review corrections.

## Scope

`extension-vscode` native tree implementation, presentation cleanup, regression coverage and qualification evidence only.

## Dependencies

Parent native carrier tree operator Task and its Discovery / Incoming / Outgoing / authoring / routing subtasks.

## Out Of Scope

Changing Core/Docs/Business, broad-release untrusted ingress hardening, encryption, bounded source scopes, optional bootstrap profile, final Handoff/package UX freeze or 0.1.8 publication.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-native-carrier-tree-operator.trace.md](../../001-native-carrier-tree-operator.trace.md)
  - Value: S0cOLmqgAnRbfOPzsX0MBgnI5i1-keNsrHsa2TgrjBI

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: o80bsKAtmU6S4rVXnYxjlwS9M48LQapEPzg_tZV9btY