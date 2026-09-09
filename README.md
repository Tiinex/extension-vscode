# Tiinex VS Code

Tiinex VS Code is a thin native editor host over the published, host-neutral `@tiinex/core` Tooling surface. VS Code owns editor integration, operator presentation, filesystem/Git host adapters and user confirmations; it does not define Tiinex schema meaning, Handoff semantics, Workspace authority or shared package behavior.

This checkout is a **preparatory 0.1.7 lane**. It may build and qualify candidate VSIX bytes, but it does not declare or authorize 0.1.8. Final contract-dependent integration remains behind the Refactor Turn-2 Core/CLI/Interop frontier.

## Primary operator flow: Receive → Review → Return

The Tiinex Activity Bar view keeps one calm primary sequence while retaining fail-closed details and Command Palette recovery paths.

1. **Receive** opens the existing qualified Handoff-package landing flow. Optional Auto discovery watches only stable `.handoff-package.zip` files observed after the current watcher session starts; it never scans an inbox backlog.
2. **Review** shows shared Tiinex validation for the active artifact. Eligible Markdown is qualified on open, debounced in-memory change and save. Problems, deterministic locations and eligible full-document Quick Fix bytes come from shared Tooling, not editor inference.
3. **Return** authors exactly one Handoff **From** endpoint and one **To** endpoint, then offers qualified package construction as the transport step. Extra participants/context must use their declared schema fields; they are never encoded as additional Handoff endpoints.

Advanced package construction is intentionally reachable from Return and through `Tiinex: Build Return Package`; it is not a fourth semantic workflow step. Command IDs remain stable for compatibility.

## Runtime/package boundary

The historical tracked `shared-core/` snapshot and Site-coupled `sync:shared-core` path have been removed. The extension now declares the already-published exact dependency:

```json
"@tiinex/core": "0.1.1"
```

VS Code resolves only the public `@tiinex/core/portable-entry` export (plus the public `package.json` export for version qualification). It does not import private Core source paths and does not ask Core to add new subpaths merely to reproduce the old copied tree.

Parity evidence for this migration is repository-local and mechanical: the former snapshot's 480 `runtime/src` files were byte-identical to the corresponding carried Core 0.1.1 files, its portable entrypoint was byte-identical, and both operation catalogs exposed the same 70 operations. The VSIX includes the installed `@tiinex/core` package under `extension/node_modules/@tiinex/core` so the runtime dependency is self-contained.

Package generation removes any previous same-version candidate **before** runtime-dependency qualification. A failed build therefore cannot leave a stale candidate looking current. Successful manufacture prints a deterministic receipt containing candidate SHA-256 plus the Core package version, portable entrypoint, file/byte counts and a representation SHA-256.

## What remains host-local in `src/core/`

Directory names are locality, not semantic authority. The remaining modules are intentionally VS Code-owned helpers:

| Area | Responsibility |
| --- | --- |
| `findingPresentation`, `operatorError`, `operatorUx`, `operatorWebview`, `operatorModel` | Editor/operator presentation, safe defaults and selection-state shaping. |
| `latestWinsQueue` | Host scheduling for stale-result suppression in diagnostics. |
| `packageArgs` | VS Code host argument shaping for the public portable Tooling entrypoint. |
| `paths`, `repositoryPath`, `stableFile` | Local filesystem/repository normalization and inbox stability/session behavior. |

None of these files is treated as a reason to create a new Core export. A future move requires an independently frozen shared responsibility, not the word `core` in the local path.

## Diagnostics and Quick Fixes

Unsaved bytes are staged only in a transient host file for the lifetime of the shared `project-editor-assistance` call. Generation guards prevent stale asynchronous results from replacing newer editor state. Exact validator findings appear in Problems/editor ranges when a deterministic line is available; otherwise the location remains visibly unresolved. Quick Fixes remain restricted to shared-qualified deterministic full-document hygiene replacement.

The extension contributes no tasks or problem matchers for this path, so validation does not depend on task-driven Output/Problems pollution.

## Workspace landing

`Tiinex: Receive Handoff Package` first qualifies ingress with the **received package's own declared bootstrap**. Current landing-plan projection then uses installed `@tiinex/core` Tooling.

Repository matching is explicitly multi-root. All opened Git roots and explicit Git facts are projected together; slash/case-equivalent Windows paths can represent the same local repository while repository identity remains fail-closed. Dirty worktrees block. Qualified branch mismatches are preflighted and require one explicit branch-switch approval before Workspace bytes are written.

Landing has one multi-repository confirmation. Post-landing `commit`, `push`, and `openHandoff` policies are independent `no | ask | yes` settings and default to `no`. Push is limited to the unchanged configured upstream for the exact commit created by the same landing run; there is no force push or invented upstream.

## Handoff authoring and package construction

Parent continuity and package route selection remain separate concepts. Shared Tooling qualifies authoring Parent, endpoint references, path allocation, schema rendering, validation and integrity sealing. The host form keeps exactly one From and one To.

The package builder presents shared-qualified Handoff leaves plus explicit **No Handoff pointer**, exact repository-matched Workspace candidates, read-only route From/To and independent Workspace inclusion. Pointerless carriers create no Handoff route, endpoint, current-work, transfer, participation, acceptance or completion semantics.

The candidate pipeline stays at package version 0.1.7 in this preparatory lane. No release publication is performed here.

## Git workflow

- `Tiinex: Generate Tiinex Commit Message` delegates to the selected repository's own `tools/tiinex-commit-message.mjs`.
- `Tiinex: Stage, Commit & Push with Tiinex` remains explicit and fails closed on detached HEAD, missing upstream, no staged changes, failed staged Tiinex validation or changed publication state.
- Workspace landing never implies commit, push, acceptance or completion.

## Local qualification

With the declared dev dependencies installed, run:

```text
npm run validate
```

That performs typecheck, a clean build, focused regression tests and candidate VSIX generation. `node scripts/package-vsix.mjs` can also manufacture from an already-built `dist/`; its JSON receipt is the authoritative local candidate-byte summary for that run.
