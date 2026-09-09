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
| `receiveUx`, `receivedHandoff` | Host-only Receive presentation/filtering plus qualified received-context bookkeeping. Role text and local folder preferences are never semantic authority. |

None of these files is treated as a reason to create a new Core export. A future move requires an independently frozen shared responsibility, not the word `core` in the local path.

## Diagnostics and Quick Fixes

Unsaved bytes are staged only in a transient host file for the lifetime of the shared `project-editor-assistance` call. Generation guards prevent stale asynchronous results from replacing newer editor state. Exact validator findings appear in Problems/editor ranges when a deterministic line is available; otherwise the location remains visibly unresolved. Quick Fixes remain restricted to shared-qualified deterministic full-document hygiene replacement.

The extension contributes no tasks or problem matchers for this path, so validation does not depend on task-driven Output/Problems pollution.

## Workspace Receive / unpacking

`Tiinex: Receive Handoff Package` first qualifies ingress with the **received package's own declared bootstrap**. Workspace inventory, repository identity and declared ref constraints then come from installed `@tiinex/core` `project-workspace-landing`; the extension does not privately reinterpret `.workspace.md` semantics.

Receive is explicitly multi-root and per-Workspace:

1. Qualified package Workspaces are compared with every Git repository visible in the current VS Code multi-root workspace.
2. An unmatched Workspace offers **Add Repository** or **Skip Workspace**. Add opens a folder picker at the immediate parent shared by the largest number of current repositories, verifies the chosen Git repository against the qualified Workspace origin through shared Tooling, then adds it through `workspace.updateWorkspaceFolders`. A saved `.code-workspace` is therefore updated by VS Code's native workspace writer (portable relative folder paths where VS Code can relativize them).
3. A declared branch/ref mismatch offers **Switch Branch** or **Skip Workspace**. If local changes must be cleared before switching, the same dirty-worktree choice is applied first. When the qualified Workspace declares **no Ref**, Receive shows the current branch plus `Declared Ref: (none)` and requires **Use Current Branch** or **Skip Workspace**; branch equivalence is never implied.
4. Dirty repositories offer **Stash**, **Commit**, **Discard**, or **Skip Workspace**. Discard uses `git reset --hard HEAD` plus `git clean -fd`; ignored material is not removed.
5. Before source mutation, one multi-select lists every remaining ready Workspace. Only Workspaces explicitly selected there can be replaced; clean carried context is not mutated merely because shared Tooling projected it ready.
6. After the final explicit Receive confirmation, the clean tracked worktree is replaced by the exact qualified `.workspace.zip` snapshot while `.git` and unrelated ignored material remain preserved. Incoming archive collisions with preserved ignored paths fail closed.
7. Every changed landed repository is staged with `git add -A`, then the **pre-landing ignored set is explicitly removed from the index and verified absent**. This protects preserved local material such as `.env` even if the incoming `.gitignore` stops ignoring it. Post-landing commit convenience uses a deterministic extension-owned `Tiinex Receive: <workspace-id>` message and never executes code from the received repository snapshot. If auto-commit is declined, that trusted message is pre-filled in Source Control when available and exposed through **Copy Commit Message**.
8. Auto-push is considered only for a commit created by that exact Receive invocation after auto-commit was approved. It additionally requires the pre-landing upstream to have been aligned and to remain unchanged; manual commits are never auto-pushed.

After landing, `tiinex.operator.role` can contain a presentation-only label such as `Sigma`. Qualified Handoff routes whose From/To label matches are preferred; if none match, all qualified routes remain eligible. `tiinex.landing.openHandoff` opens the actual Handoff Markdown artifacts as tabs/previews and never opens transport pointer files. The role string grants no authority and is not passed off as holder proof.

A Workspace whose qualified material does not expose exactly one usable repository origin cannot be safely mapped; the host offers Skip and reports the missing shared boundary rather than inventing repository identity. Package-carried Required Context remains retained as qualified carrier context even when a Required Context Workspace is intentionally skipped or has no local target; local `workspaceRoots` record only material actually available after Receive.

## Handoff authoring and package construction

Parent continuity and package route selection remain separate concepts. Shared Tooling qualifies authoring Parent, endpoint references, path allocation, schema rendering, validation and integrity sealing. The host form keeps exactly one From and one To.

The package builder presents shared-qualified Handoff leaves plus explicit **No Handoff pointer**, exact repository-matched Workspace candidates, read-only route From/To and independent Workspace inclusion. Pointerless carriers create no Handoff route, endpoint, current-work, transfer, participation, acceptance or completion semantics.

The candidate pipeline stays at package version 0.1.7 in this preparatory lane. No release publication is performed here.

## Git workflow

- `Tiinex: Generate Tiinex Commit Message` is an **explicit separate operator command** that delegates to the selected local repository's own `tools/tiinex-commit-message.mjs`; Receive itself never invokes that helper after source landing.
- `Tiinex: Stage, Commit & Push with Tiinex` remains explicit and fails closed on detached HEAD, missing upstream, no staged changes, failed staged Tiinex validation or changed publication state.
- Workspace landing never implies commit, push, acceptance or completion.

## Local development and qualification

Normal UX iteration uses the **same VS Code window** as the installed Tiinex extension. No Extension Development Host and no per-edit VSIX install are required.

One-time setup from this checkout:

1. Run the VS Code task **Tiinex: Link this checkout**.
2. The task first compiles `dist/`, preserves any currently installed Tiinex copy outside the extensions directory, then symlinks/junctions this checkout into the active VS Code extensions directory.
3. Restart the Extension Host (or VS Code) once so the linked checkout becomes the running extension.

After that the normal loop is:

```text
edit → Ctrl+Shift+B → Restart Extensions → test in the same window
```

`Ctrl+Shift+B` runs the default task **Tiinex: Build linked extension**. A successful TypeScript build writes a development-only reload signal. The linked Tiinex extension detects that signal and shows **Restart Extensions**; pressing it restarts the Extension Host and loads the new `dist/` bytes without building or installing a VSIX.

Use **Tiinex: Unlink this checkout** to remove the development link and restore any installed Tiinex copy that the setup task preserved. Restart once after unlinking.

The linker supports stable VS Code and Insiders automatically; `TIINEX_VSCODE_EXTENSIONS_DIR` can override the extensions directory for unusual/portable installations. Development markers live under ignored `.tiinex-dev/` and are not part of candidate VSIX packaging.

With the declared dev dependencies installed, full qualification remains:

```text
npm run validate
```

That performs typecheck, a clean build, focused regression tests and candidate VSIX generation. VSIX is qualification/release evidence, not the normal development loop, and this preparatory lane still does not authorize 0.1.8 publication.
