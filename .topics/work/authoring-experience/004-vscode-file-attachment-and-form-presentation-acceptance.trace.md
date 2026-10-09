# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-10-08 19:21:01
  - Authors: Anchor
  - Why: Keep UX work under the responsible Workspace after Outgoing/packaging host confirmation.
  - Summary: Owner-specific VS Code host implementation and Windows acceptance for file attach, Quick/Full and Core field help.
  - Status: ready/local

---

# VS Code File Attachment And Form Presentation Acceptance

## Objective

Qualify and host-accept a bounded VS Code user experience for attaching local files to Core-qualified authoring fields, switching Quick/Full presentation of one creation contract, and inspecting Core-projected field-help provenance. Preserve owner boundaries for file relocation, multi-material Evidence semantics and Transition Definition authoring.

## Done Criteria

- The Explorer file-only `Tiinex → Attach to Form` appears on ordinary files, selects an open schema-driven authoring form, and chooses the exact receiving field when multiple are qualified.
- No file contents change on the default `No` path. A same-Workspace relative Markdown link is inserted into a Core-qualified `workspace-file-reference-picker` field and the user can Preview/Create through the existing Core materialization path.
- An outside-Workspace file and a folder fail closed; a non-`.trace.md` file offers an explicit default `No` / `Yes` move choice, but the `Yes` path remains blocked and is not represented as a supported asset relocation until qualified Core relocation exists.
- Quick/Full toggles only optional controls on the same Core creation model; missing values remain missing. Field help is keyboard-accessible and includes the actual schema ID, group/field, requirement and domains available in the Core projection; exact source-permalink provenance is not falsely invented.
- Automated attachment field gating, host event and visible presentation tests pass locally, and Sigma records real Windows-context menu / field selection / Preview / Create / reopen acceptance or a bounded defect report.
- Native/Core owners receive disposition (not VS Code semantic workarounds) for per-material Evidence schema and explicit companion provenance, safe binary asset relocation with lineage-collision/reference guarantees, and `Save as Transition` as a real separate schema-driven Definition authoring transaction.

## Scope

- Bounded VS Code host/UI behavior, no schema or Core materialization semantic change. Avoid new domain logic in `operatorTrees.ts` beyond wiring.
- Reuse existing Core affordance identification and `localArtifactReference`; do not infer that arbitrary `.trace.md` filename alone proves semantic authority.
- Maintain the independently owned README/release Windows workflow gate and the existing 003 qualification/coordination Task; this is an owner-specific implementation and acceptance Task, not implementation under 003.

## Dependencies

- README Windows dogfood gate and Sigma's reported Outgoing/packaging PASS; reports are not a blanket VSIX release approval.
- Existing authoring UX/grounding Evidence under 001 and Task 003.
- Core-owned asset move/rebase and Native Evidence multi-material/Transition Definition scope still require independently qualified substantive implementation work.

## Exclusions

- No file moving/copying/deleting, no unsafely generated lineage names, no multi-material semantics invented by concatenating paths, no implicit Transition conversion, no remote commit/push, no Marketplace release before host acceptance.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: uTAy3YDbOCW2ADJ0tUp3EYGgRqDLXTtyJ5oFEerORqg