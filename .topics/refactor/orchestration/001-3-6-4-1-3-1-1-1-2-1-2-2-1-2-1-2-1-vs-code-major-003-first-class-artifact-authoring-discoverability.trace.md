# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-12 16:50:44
  - Trace: [001-3-6-4-1-3-1-1-1-2-1-2-2-1-2-1-2-kodax-to-anchor-vs-code-major-003-incoming-merge-conflict-materi.trace.md](001-3-6-4-1-3-1-1-1-2-1-2-2-1-2-1-2-kodax-to-anchor-vs-code-major-003-incoming-merge-conflict-materi.trace.md)
  - Origin:
    - [relative](001-3-6-4-1-3-1-1-1-2-1-2-2-1-2-1-2-kodax-to-anchor-vs-code-major-003-incoming-merge-conflict-materi.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-12 17:23:39
  - Authors: Anchor
  - Why: The accepted Merge return clears the next planned Major 003 tranche: authoring already exists generically, but its operator discoverability and coherent UX must be first-class before one combined Sigma Windows acceptance gate.
  - Summary: Make generic Artifact, Feedback and Handoff authoring visibly first-class in VS Code while preserving Core-owned authoring semantics and accepted operator flows.
  - Status: ready/local

---

# VS Code Major 003 — First-Class Artifact Authoring Discoverability

## Objective

Make generic Tiinex Artifact authoring visibly first-class in the VS Code operator so an operator can discover and create ordinary Artifacts, Feedback and Handoffs without relying on hidden Explorer-only context actions, while preserving Core-owned schema, Parent, path, rendering and validation authority.

## Done Criteria

- Add an obvious first-class authoring entry point in the Tiinex operator surface for **New Artifact**, with **New Feedback** and **New Handoff** as schema-preselected shortcuts into the same generic Core-driven flow rather than bespoke host forms.
- Preserve the existing generic Workspace selection, Core-qualified schema catalog, Core-qualified Parent selection, preview-before-write confirmation, exact qualified write, and post-write Markdown preview behavior.
- Keep Handoff-specific host behavior limited to transport workflow extras: `Attach to Outgoing` is available only where an Outgoing context exists and must not redefine Handoff schema semantics or creation fields.
- Make the entry points understandable from the normal Tiinex Activity/Tree workflow; Explorer context actions may remain useful but must not be the only discoverable path.
- Preserve accepted Git automation, Transport queue, Incoming Merge union/conflict behavior, navigation and package workflows without regression or silent widening.
- Add focused regression coverage for command registration/contribution visibility, schema-preselection routing, generic authoring reuse, Attach-to-Outgoing gating and cancellation/fail-closed paths.
- Run the strongest exact-source qualification available in the execution host. If the exact locked TypeScript/Node/VS Code development toolchain remains unavailable, preserve that as an explicit blocker and do not substitute dependency versions or claim full `npm run validate` success.
- Return one auditable repo-local checkpoint to Anchor suitable for assembling the single coherent Sigma Windows acceptance frontier covering Git, Transport, Merge, navigation and authoring.

## Scope

Extension VS Code Major 003 authoring discoverability and operator UX only. Product implementation belongs in this repository. No Core/Docs semantic changes, no release or Marketplace publication, no remote mutation, and no unrelated feature tranche.

## Dependencies

- Accepted VS Code Major 003 Incoming Merge return and exact carried Extension VS Code Workspace.
- Existing generic Core-driven artifact authoring implementation and authoring panel.
- Existing Outgoing/Transport flow for Handoff attachment and package manufacture.
- Shared Core/Docs authority for schema, Parent, creation contract, rendering and validation.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-3-6-4-1-3-1-1-1-2-1-2-2-1-2-1-2-kodax-to-anchor-vs-code-major-003-incoming-merge-conflict-materi.trace.md](001-3-6-4-1-3-1-1-1-2-1-2-2-1-2-1-2-kodax-to-anchor-vs-code-major-003-incoming-merge-conflict-materi.trace.md)
  - Value: KVRtmIfe2xF21EGcxPTrlp5YHFOH4oNn33KHAJKQVWI

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: J8dajAdDqzD6cEcbCpdGDx4i8V2OXvq9l17_lYTl1Lk