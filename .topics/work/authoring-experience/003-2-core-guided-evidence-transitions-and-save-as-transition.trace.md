# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-10-08 11:50:33
  - Trace: [003-schema-guided-authoring-grounding-followups-task.trace.md](003-schema-guided-authoring-grounding-followups-task.trace.md)
  - Origin:
    - [relative](003-schema-guided-authoring-grounding-followups-task.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-10-09 11:43:38
  - Authors: Anchor
  - Why: Make transitions authorable and discoverable across VS Code, Viewer and portable LLM tooling.
  - Summary: Complete schema-driven Transition presets and second form from partial Evidence without moving Core semantics into the host.
  - Status: ready/local

---

# Complete Core-Guided Evidence Transitions And Save As Transition UX

## Objective

After Core has qualified path-neutral Transition discovery and Native has defined reusable authoring semantics, finish the **host-neutral** user journey from an Evidence-v1 form to selecting a qualified preset or saving a partial state as a genuine Transition Definition. VS Code only presents portable contracts; other viewers/CLI/LLM adapters must be able to consume the same Core behavior.

## Done Criteria

- Evidence authoring presets appear when genuinely discovered **and** qualified for the output schema/companion/conditions; do not fabricate presets because Evidence has no existing ready generation Transition.
- `Save as Transition` appears adjacent to the Transition preset selector as a clear action (not just a filename operation). It may open a **separate schema-guided Transition Definition form** seeded with the current form's *partial* values. Preserve unfinished source form values and avoid requiring the user to complete the source Evidence just to capture a potential preset.
- New Definition form shows fields, human-oriented descriptions, source-linked help and short Core-supplied placeholders or examples where available; it requests missing mandatory owner-qualified fields, never fills roles/conditions/effects/authority by guesswork.
- The default target `.transitions` folder is created beneath the prospective artifact working directory **only after** qualified Create; do not imply that this folder is an exclusive discovery path or schema authority. Root `.topics` semantics and explicit parent/lineage are preserved.
- Saved Definition passes native schema validation, Core materialization, conditional generation binding and any required schema-companion attachment; Core reprojection subsequently discovers/applicably offers it without a global reload or stale cache race. If not attachable, show a reason rather than pretending it is ready.
- Form keeps established single-page right-click → form → optional Preview → Create; do not add wizard, mandatory preview or path picker by default. Keep repeatable Evidence materials, Attach to Form, Parent selection and busy-state protections intact.
- Test mouse + keyboard access, empty / seeded / partial form, canceled second form, malformed Definition, invalid/irrelevant Transition, re-open, duplicate title/slug and relocated source directory. Browser-driven tests must exercise actual generated webview; full dependency-backed extension build and Windows integration remain final gates.

## Scope

- VS Code host projection and UI only; Core owns candidate discovery, binding and applicability, Native owns Transition semantics; no new VS Code-specific Transition file format or independent form-validator.
- CLI/LLM capability parity remains with the **other branch**. This branch only ensures the portable Core surface is reusable by those interfaces.
- Do not touch Move/Rebase/asset relocation; that work has independent ownership in the parallel branch.

## Execution Order

1. Read Native/Core qualified transition discovery and existing form / source-help contracts; create host golden fixtures.
2. Add the second-form pathway only after Core confirms an executable creation contract for Transition Definition. If missing, transfer a bounded Core/Native gap rather than writing a host serializer.
3. Test real browser UI and as much local core/runtime as possible, then one formal Sigma Windows gate.

## Dependencies

- Core Task `core::.topics/work/topics-discovery/001-unify-scoped-topics-discovery-with-qualified-transition-applicability.trace.md` (qualified in the same package).
- Existing `003-schema-guided-authoring-grounding-followups-task.trace.md`, `004-vscode-file-attachment-and-form-presentation-acceptance.trace.md` and latest Sigma Evidence-v1 acceptance.
- Preserve post-Sigma webview help changes as a tracked untransported source candidate; see the recovery Evidence in this package.

## Completion Signal

The same Core-qualified Transition is available regardless of its directory placement, a partial Evidence form can seed a valid second-form Transition Definition transaction, and host tests plus explicit Windows acceptance criteria are present without semantic shortcuts.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [003-schema-guided-authoring-grounding-followups-task.trace.md](003-schema-guided-authoring-grounding-followups-task.trace.md)
  - Value: yOV4Gu0y3zNBGtRkn3GVLBmCCpgkKuD0DZKZ0DSOX3I

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: DgXmqvkjxJl5ky-R6wk2B3xsizJ3LOQZ5Y10FBKfSDU