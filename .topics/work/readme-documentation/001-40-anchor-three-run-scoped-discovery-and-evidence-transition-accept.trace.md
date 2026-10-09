# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-10-07 19:53:23
  - Trace: [001-vs-code-readme-and-documentation-consolidation.trace.md](001-vs-code-readme-and-documentation-consolidation.trace.md)
  - Origin:
    - [relative](001-vs-code-readme-and-documentation-consolidation.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-10-09 11:44:19
  - Authors: Anchor
  - Why: Supply a self-contained plan and full recovery before branch with no premature user tests.
  - Summary: Execution, verification and owner boundaries for up to three effective runs before one Sigma acceptance.
  - Status: ready/local

---

# Anchor Three-Run Scoped Discovery And Evidence Transition Acceptance Plan

## Objective

Execute at most three **effective implementation runs** after this recovery checkpoint to deliver Core-wide, Workspace-`.topics`-bounded artifact discovery and human-usable, qualified Evidence-v1 Transition presets/Save as Transition without asking Sigma to debug routine edge cases. This is a *future execution plan*; no discovery implementation is asserted as complete in this checkpoint.

## Done Criteria

- Native's existing accepted Decision 002 is reconciled: dot-prefixed folders are bootstrap/import convenience, not the identity of an artifact; `.topics/.workspaces` is conventional primary Workspace identity while nested candidates remain discoverable only as their qualified contracts permit.
- Core discovers valid artifact candidates recursively only in a selected Workspace `.topics` (and explicit package boundaries), regardless of the leaf folder, while avoiding unbounded FS scans, following symlinks outside root, unknown binaries, and unrelated package/Workspace activation.
- Transition discovery is separated from applicability: package-local qualified Transition Definition candidates do not become global presets merely because they exist; schema-companion, output schema, conditions and generation defaults remain independently enforced.
- Evidence authoring gains one or more genuine Native/Core-qualified useful presets **if** the Native creation contract and companion participation are established; no fabricated default values and no competing VS Code-only resolver.
- Save as Transition, if supported by the Native/Core authoring contract, uses a second real schema-backed form seeded from partial values, targeting the artifact working directory's `.transitions` for convenience (not discovery exclusivity). If not yet authorable, report the exact Core/Native blocker and do not fake success.
- Verify Core full regression, source/schema checks, security/fidelity negatives, actual generated webview/browser flow, extension release-audit, package roundtrip/cold grounding, and measured candidate/preset latency. Real full Windows dependency-backed build and VS Code UX remain human-owned gates when unavailable here.
- Existing Evidence-v1 support (multiple separately described materials, Attach to Form, field help placeholders, local unpublished schema authority and exact parent continuity) remains intact.
- Deliver *one* formal Anchor → Sigma Handoff Package with one contiguous Sigma acceptance scenario only when the internally executable gates pass, or deliver a bounded Anchor recovery if native source creation is blocked.

## Scope

- **Run 1, Native/Core discovery correctness:** resolve the accepted Native discovery decision versus registered composition filters; implement portable `.topics` candidate enumeration/classification and path-neutral package-local Transition collection with scope and symlink guards; build golden fixtures and property/negative tests. Preserve separate `.topics/.workspaces` primary semantics.
- **Run 2, Core applicability and authoring contracts:** verify cross-package/Process references and schema-companion attachment, generation authority, exact dedupe/conflict, Evidence-v1 transitions from legitimate Native definitions only. Implement or formally classify the necessary Transition Definition authoring contract and second-form creation barrier. Test cold import and locally modified source identity.
- **Run 3, host + end-to-end acceptance:** VS Code renders qualified presets and optional Save as Transition second form, then confirm through generated browser UI, creation/validation/re-read, file refs, no unintended asset move, fake source rejection, package/roundtrip and recovery. Profile latency and run as many Node/browser/TypeScript checks as environment permits. Stage Sigma gate only after clear PASS/known limitations.
- Existing Native Surface/CLI/LLM interface parity remains **in the other fork**; this branch improves shared portable Core API only and must not compete for that surface. Move/Rebase and file relocation remain in the separate tooling fork.

## Execution Discipline

- Treat each *effective run* as potentially many internal commands/debug interruptions, but no premature operator tests. If the conversation approaches truncation, author a normal complete Tiinex Anchor → Anchor Handoff Package before branching.
- No mutable history rewrite of accepted Native decisions; qualify a successor/reconciliation only if normative change is really needed. Do not claim `.transitions` exclusive discovery, and do not indiscriminately import unknown dot dirs.
- Use exact source/file identities, not guessed paths or names, for candidate deduplication and schema authority. Avoid monolithic rewrites of `operatorTrees.ts`; keep portable Core semantics separate from host presentation.
- Keep all pre-release schemas v1 except the already-valid Validator-v2, unless user explicitly changes that rule.
- Test against **the three source corrections recovered after the prior Sigma carrier**; they are now in local Core/VS Code files but not independently Windows-accepted.
- Keep names exactly as Core projects for downloadable Handoff Packages, including lineage prefix; no short ZIP aliases even when ChatGPT download breaks.

## Acceptance Criteria

1. Two otherwise identical qualified Transition Definitions at `.topics/.transitions/` and `.topics/work/some-process/` both discover under the same qualified package; hidden unknown-dot path also discovers when explicitly within allowed boundary, without executable meaning conferred by the dot name.
2. Definitions outside `.topics`, in unselected Workspaces or in unselected nested packages, or via escaped symlink, never silently enter the candidate index. No loading binary assets just to infer artifact type.
3. A discovered but unattached/mismatched Transition is visible as a qualified candidate if appropriate, **not** an applicable authoring preset; an attached qualifying one may populate defaults without bypassing incomplete-form validation.
4. An Evidence-v1 with two independent files and per-item descriptions survives opened form → Attach to Form → Preview → Create → validation → reopen; Save as Transition seeded with partial form creates only a genuine qualified Definition.
5. Fresh/cached discovery results are identical in provenance and applicability; repeated discovery has measured p50/p95, not unsupported timing claims.
6. No failures in Native/Core qualification tests except explicitly previously known, separately owned debt; VS Code/browser regression passes and the full npm-backed build result is honestly reported.
7. One canonical full handoff carrier cold-grounds Sigma to `grounded-to-act` with all Required Context and zero unresolved references; no ZIP test artifacts need to be returned by Sigma unless debugging package bytes.

## Dependencies

- Native `.topics/decisions/002-recursive-registered-discovery-surface-convention-decision.trace.md`, schema Transition Companions and Transition Definitions.
- Native scoped discovery Task and Core scoped discovery Task, plus VS Code Save as Transition Task in this package.
- Previous 17-Workspace Sigma carrier and newly preserved Core schema-authority + VS Code UX post-carrier candidates.
- If full extension `npm ci` still fails offline, record dependency and make Windows local `dev:build:local` the first human acceptance gate, rather than asserting full local compilation.

## Completion Signal

A fresh Anchor can perform the next three effective runs without asking where the source lives, which branch owns what, or when Sigma should act. Sigma's next action is **none until a subsequent qualified Anchor → Sigma Handoff**; current package is solely pre-branch recovery.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-vs-code-readme-and-documentation-consolidation.trace.md](001-vs-code-readme-and-documentation-consolidation.trace.md)
  - Value: P9l0JbWGxC5NqesjDRJwSr-zcOGkm_B44j4pS9wffdI

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: WxS5svGinDiOlF61kmhXaAH54PjgieOGPbzAbLgKoLs