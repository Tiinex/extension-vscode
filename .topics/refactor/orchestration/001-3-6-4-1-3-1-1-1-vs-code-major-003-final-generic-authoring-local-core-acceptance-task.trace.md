# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-12 09:41:43
  - Trace: [001-3-6-4-1-3-1-1-kodax-to-anchor-vs-code-major-003-core007-host-adoption-return.trace.md](001-3-6-4-1-3-1-1-kodax-to-anchor-vs-code-major-003-core007-host-adoption-return.trace.md)
  - Origin:
    - [relative](001-3-6-4-1-3-1-1-kodax-to-anchor-vs-code-major-003-core007-host-adoption-return.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-12 09:59:47
  - Authors: Anchor
  - Why: The host-adoption source is correct, but the full installed Core boundary remains unqualified and dead Handoff-specific authoring code still violates the intended no-special-semantics architecture.
  - Summary: Finish Major 003 by eliminating unreachable legacy Handoff authoring debt and exercising the accepted Core007 behavior through an exact local-source installed dependency boundary.
  - Status: ready/local

---

# VS Code Major 003 — Final Generic Authoring And Local-Core Live-Host Acceptance

## Objective

Finish VS Code Major 003 by proving the installed/live host can exercise the accepted Core007 generic authoring behavior from current local source without npm publication, while removing unreachable legacy Handoff-specific authoring implementation so `Attach to Outgoing` remains the only Handoff-specific host behavior.

## Done Criteria

- Preserve the accepted Core007 host-adoption source: Core status/severity remains prospective validity authority; VS Code does not re-declare per-field schema policy.
- Remove or otherwise eliminate unreachable legacy Handoff-only authoring implementations such as old form/simple-Handoff paths that are no longer referenced by the active operator flow; `New Handoff` may remain only as a shortcut that preselects `tiinex.handoff.v1` through the same generic authoring path.
- Verify by source/static regression that no reachable Handoff-specific path owns schema fields, path allocation, Parent policy, rendering or validation; the only Handoff-specific host behavior after write is optional `Attach to Outgoing`/route tracking and Handoff display categorization.
- Add a disposable local-source Core acceptance harness for the extension: package or link the exact current Core Workspace into a temporary/reviewed extension test environment without publishing `@tiinex/core`, without mutating the repository lockfile/manifest as durable source, and without silently substituting registry Core 0.7.0.
- Run the full extension build/typecheck/test path that becomes possible in that local-source environment and prove the Core007 blocking/warning finding behavior through the actual installed-package boundary.
- Preserve Discovery, Incoming, Merge/Replace, Pack, Git Operator and artifact-navigation regressions.
- Return one normal Kodax-to-Anchor Handoff with exact test evidence and, if technically ready, one concise Sigma live-host test card. If public third-party dependencies or host integration still block the run, return the smallest exact blocker instead of asking Sigma to troubleshoot internal mechanics.

## Dependencies

- Accepted VS Code Core007 host-adoption return.
- Current Core007 source Workspace.
- Current Docs005 schema-reference semantics.
- Current artifact-navigation and Git Operator implementation already accepted inside VS Code Major 003.

## Scope

Final technical/source acceptance tranche inside the existing VS Code Carrier Major 003. No new UX/product feature scope.

## Exclusions

- No npm/Marketplace publication.
- No Core/Docs mutation.
- No private VS Code schema semantics.
- No new Git ergonomics or Pack features beyond regression preservation.
- No Sigma human acceptance claim.

## Acceptance Boundary

Major 003 is technically closable only when the generic authoring architecture is actually exercised through the installed local Core source boundary and the unreachable legacy Handoff-specific authoring implementation no longer remains as technical debt. Sigma retains final live-host/UX acceptance.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-3-6-4-1-3-1-1-kodax-to-anchor-vs-code-major-003-core007-host-adoption-return.trace.md](001-3-6-4-1-3-1-1-kodax-to-anchor-vs-code-major-003-core007-host-adoption-return.trace.md)
  - Value: 2ssoa_N3K_Vrs8mbLvZLnWC4cT_Sj4gO3egt2oz9Qlo

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: V0eC5oLHkPeflfTugXVDiUKsP8zAo81c1GZqRKA82uk