# Continuity Context

- Envelope Schema: tiinex.root.v1
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-08 23:38:17
  - Trace: [001-3-6-4-repository-frontiers-lineage-stabilization-turn2-task.trace.md](business::.topics/initiatives/001-3-6-4-repository-frontiers-lineage-stabilization-turn2-task.trace.md)
  - Origin:
    - [relative](business::.topics/initiatives/001-3-6-4-repository-frontiers-lineage-stabilization-turn2-task.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-11 23:25:36
  - Authors: Anchor
  - Why: Sigma could not traverse even one Parent step because the custom preview used ephemeral unresolved URIs; this informed Major 003 revision removes that live-host blocker before human acceptance.
  - Summary: Repair local and unopened-Incoming Tiinex artifact navigation so Parent/Trace continuity survives the VS Code preview surface.
  - Status: ready/local

---

# VS Code Major 003 — Artifact Continuity Preview And Navigation Revision

## Objective

Close the live-host continuity blocker Sigma found while attempting to follow the Parent lineage of a local Handoff artifact: VS Code must present Tiinex artifacts through navigation surfaces that preserve resolvable lineage instead of rendering isolated Markdown text whose relative links immediately die.

## Done Criteria

- Local Tiinex artifacts open through a file-backed/native VS Code surface whenever the source is a real local file, so ordinary relative Markdown links resolve naturally against the artifact's real directory.
- Incoming artifacts that remain inside an unopened Handoff/Workspace carrier open through a stable read-only virtual material surface whose URI/path identity is sufficient for relative links to resolve across the exact carried Workspace bytes without unpacking the carrier into the repository.
- Link resolution distinguishes local-relative artifact links, workspace-qualified `workspace::path` references, package-carried relative material, and external/permalink HTTP targets without filename guessing or semantic inference.
- Following Parent/Trace links from a Handoff can move backward at least one step and continue across the carried exact material as long as the referenced artifact is present and qualified.
- A preview/editor refresh does not invalidate already-open virtual artifact URIs with `Preview content is no longer available` merely because the content provider cache entry was ephemeral.
- The navigation implementation is artifact-generic: it does not special-case Handoff schema semantics merely to make Handoff links work.
- Incoming virtual navigation remains read-only and byte-faithful to the exact carrier snapshot; clicking links must not silently materialize or mutate repository source.
- Existing Discovery, Incoming, Merge/Replace, Pack, Git operator, generic artifact-authoring and `Attach to Outgoing` behavior remain passing.
- Focused tests cover local relative navigation, incoming-carrier relative navigation, workspace-qualified navigation, external links and stale/absent target failure behavior.

## Known Reproduction

Sigma opened a local Handoff in the Tiinex preview and attempted to follow its Parent/Trace link. The initial artifact rendered, but the link target opened as another `tiinex-preview:` URI backed by no durable entry and displayed `Preview content is no longer available.` The same continuity problem would make an unopened Incoming carrier unusable for artifact lineage traversal unless the virtual source itself owns stable relative resolution.

## Scope

Extension VS Code preview/navigation/material-source behavior, focused tests and docs. This is a final informed revision inside the still-open VS Code Carrier Major 003 before human UX acceptance.

## Dependencies

- Current salvaged Major 003 Git operator and schema-scalable authoring source.
- Current Core portable/carrier index and exact Workspace-binding capabilities as read-only shared authority.
- Current Docs Root/Pointer/Handoff schemas as read-only semantic authority.

## Exclusions

- No Core or Docs semantic mutation.
- No schema-reference rendering fix inside VS Code; the canonical Envelope/Current/Parent schema-reference defect is routed separately to Core.
- No redesign of artifact authoring; Handoff remains ordinary authoring and `Attach to Outgoing` remains the only intended Handoff-specific authoring behavior.
- No release/Marketplace/npm publication.

## Acceptance Boundary

Major 003 is still not human-accepted until Sigma can use the returned live extension. Technical PASS here means continuity navigation is ready for that later full-source Sigma checkpoint; it does not itself close the Major.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-3-6-4-repository-frontiers-lineage-stabilization-turn2-task.trace.md](business::.topics/initiatives/001-3-6-4-repository-frontiers-lineage-stabilization-turn2-task.trace.md)
  - Value: Z-8KDTRtswJDhg820T7a-hH1kHqlQimQNPz1HECJQSM

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: GgvJVz_FiVNd8EAYlXH2oaSnnpIrF0WvlPb3OB21GE8