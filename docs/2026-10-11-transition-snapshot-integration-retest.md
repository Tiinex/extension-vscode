# Transition Snapshot Integration — Bounded Recovery and Windows Retest

Status: local candidate; **Windows Sigma acceptance not established**.

## Scope / ownership

- **Core** remains the semantic authority for Schema Transition neighborhood qualification, material equivalence, representation identity, and default authoring profiles.
- **VS Code** owns asynchronous presentation of Core results. It must not concatenate independent Core discovery snapshots into an artificial combined semantic catalog.
- **Tooling / Handoff** maintains full package integrity. Workspace scope is an explicit qualified selection and is never silently reduced by an agent; narrower intentional carriers remain allowed.
- **Interop** hosts must use qualified package-first output conventions and avoid treating sandbox npm registry access as release acceptance. No cross-Workspace Interop edits are claimed here.

## Exact VS Code change

`src/core/artifactAuthoringPresets.ts` exports `selectCompletedTransitionPresetCandidates(early, enriched)`. It selects the complete enriched result when available (otherwise retains the early snapshot) and applies existing **representation-key-only presentation** duplicate filtering. `src/operatorTrees.ts` uses this helper when both discovery promises complete rather than concatenating Core snapshots. No host-side semantic alias engine, Core mutation or automatic Transition invocation was introduced.

## Reproduction and verification

- **Manual Tiinex Core CLI** `project-transition-neighborhood --output-schema tiinex.evidence.v1`: 3 candidates, clean findings.
- **Manual Core CLI** with the qualified Native `.topics` root: 3 candidates, clean findings. Candidate semantic SHA-256 values agree with embedded Core candidates, while provenance-scoped `representationKey` values differ. Concatenation therefore creates six presentations; a completed snapshot remains three.
- **Real Core+Native roundtrip**: `node test/transitionRoundtrip.integration.mjs`, PASS with existing local Core/Native/Docs fixtures.
- **VS Code authored-boundary and webview-source regression**: `node test/authoringBoundaries.regression.cjs` and `node test/webviewSourceContext.regression.cjs`, PASS. They cover enriched-snapshot precedence, graceful early fallback and preserving distinct qualified candidates within one snapshot, as well as source context escaping.
- **Full `npm run dev:build`**: **NOT VERIFIED** in this isolated sandbox. Existing dependencies are absent: `TS2688` missing `node` and `vscode` type declarations. No npm-registry investigation or dependency-switching was attempted. Must run `npm run dev:build` in the configured qualified Windows workspace.
- **Installed VS Code Windows UI**: **NOT VERIFIED**. The user previously observed duplicated `Preserve source excerpt` choices; this candidate must be tested in the actual installed extension.

## Sigma Windows acceptance — one bounded run

1. Use the normal existing Switch to Local/Latest state, compile with `npm run dev:build` (no reinstall demanded by this handoff), reload extension as normally required.
2. Open Evidence Authoring with the Native Workspace available. Transition choices should show **three** qualified Evidence presets, not six; Manual remains available and no Transition is implicitly selected.
3. Verify distinct qualified candidates with genuinely different material/Generation context stay distinct, not merged by label.
4. Verify Evidence Create/Preview + correct Parent, PNG material, Move/Rebase and reference/asset continuity; mutation outside qualified closure remains fail-closed.
5. Observe first/second load and report notable delays with action and moment. Performance improvement is **not** claimed by this fix.
6. Disposition: `PASS`, `PASS WITH OBSERVATIONS`, or `BLOCK` with one small screenshot/video and the failing action if blocked.

## Gates / recovery

- A green manual CLI result or sandbox regression is not Windows accept.
- Source fix must be represented in a **qualified package**, not a loose patch handed to the user.
- For the 033-1 incoming Workspace carrier, preserve all 17 expected Workspace IDs in the outgoing carrier unless a separately deliberate narrow-scope selection occurs. This is agent delivery discipline, **not a hard prohibition** on creating narrower packages.
- No closure, artifact reduction, Git push, Marketplace publish, or remote mutation is claimed.
- If the full build or UI fails, return a bounded BLOCK with evidence for technical repair by the source owner, not interactive trial-and-error by Sigma.
