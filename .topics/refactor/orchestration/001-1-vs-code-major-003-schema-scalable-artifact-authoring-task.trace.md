# Continuity Context

- Envelope Schema: tiinex.root.v1
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-11 16:58:55
  - Trace: [001-vs-code-repository-local-orchestration-frontier.trace.md](001-vs-code-repository-local-orchestration-frontier.trace.md)
  - Origin:
    - [relative](001-vs-code-repository-local-orchestration-frontier.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-11 21:23:55
  - Authors: Anchor
  - Why: Sigma verified unpack, merge/replace and pack and wants the remaining authoring surface to scale with schemas instead of accumulating Handoff-specific technical debt.
  - Summary: Converge VS Code on Core-driven schema-scalable artifact creation so Handoff is ordinary authoring and Attach to Outgoing is the only intended Handoff-specific host behavior.
  - Status: ready/local

---

# VS Code Major 003 — Schema-Scalable Artifact Authoring

## Objective

Converge Extension VS Code artifact creation on the same schema-driven Core creation contract used by the broader Tiinex application surfaces so new creatable schemas do not require schema-specific VS Code implementations. Handoff must become an ordinary artifact type in authoring; the only intended VS Code-specific Handoff behavior is optional `Attach to Outgoing` transport routing after/alongside creation.

## Done Criteria

- The primary VS Code authoring entrypoint is artifact-generic rather than Handoff-specific: the operator can choose among currently qualified creatable schema types exposed by Core/runtime capability rather than from a VS Code-maintained schema allow-list.
- Field groups, required/optional fields, allowed values/shapes, repeatable declarations, reference assists, continuation mode and rendering/validation are derived from qualified Core schema/creation metadata. VS Code must not privately restate schema semantics.
- Artifact path/filename/Parent planning uses a schema-generic Core portable operation/capability. Existing `project-handoff-authoring-plan` may remain only as compatibility surface if shared Core still owns it; VS Code must not contain Handoff-only path policy as the generic creation architecture. If Core lacks an exact generic planning capability required to finish this safely, return that exact shared blocker instead of inventing host semantics.
- Prove scalability with at least one non-Handoff creatable schema in a disposable/focused test: the same VS Code authoring machinery must build its model/render/write/validate path without adding schema-specific host code for that schema.
- Remove or quarantine obsolete `SimpleHandoff`/template/field-specialization paths from the active authoring flow. Convenience aliases may preselect a schema, but may not own semantic fields, rendering, Parent rules or file naming.
- Handoff-specific VS Code behavior is limited to an `Attach to Outgoing` host option. That option controls whether the resulting Handoff is selected as an Outgoing carrier route; it must not change the Handoff artifact bytes, schema semantics, endpoint authority, Parent lineage or acceptance state.
- Endpoint/reference pickers are driven by generic qualified reference-domain/capability metadata where available. If Core does not expose sufficient field-reference semantics, preserve the gap explicitly rather than hardcoding `From`/`To` Role meaning in the generic host layer.
- Existing unpack, merge/replace and pack flows remain passing and are not redesigned in this Major.
- Focused tests demonstrate that adding another qualified create-capable schema does not require a new VS Code form implementation.
- The return states exact remaining Core/Docs capability gaps, if any, without privately patching shared repositories.

## Scope

Extension VS Code authoring host/model/panel/operator integration and focused tests/docs. Small cleanup of obsolete Handoff-specific host helpers is in scope when it reduces duplicate authoring paths.

## Dependencies

- Current Extension VS Code Workspace from the repaired Sigma/Anchor recovery frontier.
- Current Core portable creation operations including creation-contract/schema-guide/plan-artifact/create-local-draft/validation surfaces.
- Current Docs schemas as read-only semantic authority.
- Current App/Viewer schema-factory behavior as read-only parity/context, not source to copy mechanically.

## Exclusions

- No schema semantic changes in Docs.
- No Core mutation under this Handoff.
- No release/Marketplace/npm publication.
- No redesign of Incoming, Merge/Replace or package manufacture.
- No special-case implementation for Task/Evidence/etc merely to satisfy the proof test.

## Acceptance Boundary

The architecture is considered scalable only when VS Code can consume a newly available qualified creation schema through shared capabilities without a new schema-specific form/path/render implementation. A Handoff shortcut is acceptable only when it is a thin schema preselection; `Attach to Outgoing` is the sole intended Handoff-specific VS Code host behavior.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-vs-code-repository-local-orchestration-frontier.trace.md](001-vs-code-repository-local-orchestration-frontier.trace.md)
  - Value: IK318Q6V1V3YKWjWVhnm9M52xidg8QI1By5r_giIVJg

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: w3g1uYOkYJ647I9oyrn0pu_0THS6mhvttRGl20e9edE