# Tiinex VS Code

Tiinex VS Code is a thin native editor host over the published, host-neutral `@tiinex/core` Tooling surface. VS Code owns editor integration, operator presentation, filesystem/Git host adapters and user confirmations; it does not define Tiinex schema meaning, Handoff semantics, Workspace authority or shared package behavior.

This checkout is a **preparatory 0.1.7 lane**. It may build and qualify candidate VSIX bytes, but it does not declare or authorize 0.1.8. Final contract-dependent integration remains behind the Refactor Turn-2 Core/CLI/Interop frontier.

## Native operator trees

The Tiinex Activity Bar is now object-based rather than a schema-form workflow. It exposes three native VS Code TreeViews:

1. **Discovery** — read-only `.handoff-package.zip` discovery in one explicit operator-selected folder. Expanding a carrier browses Tiinex Markdown artifacts only; it never performs Receive/landing.
2. **Incoming** — exactly one active qualified carrier. Workspace rows expose an explicit **Merge** action; a successful merge becomes a session-local green check and resets if the carrier is reopened.
3. **Outgoing** — a live package-selection context. **New** supports **Blank** and **From Incoming**. From Incoming mirrors the Incoming Workspace set and binds that incoming carrier as package parent; Blank does not infer carrier parentage.

Every section independently supports **Logical / Files** and **Leaves / Lineage** presentation. These are projections only: package, Workspace and artifact actions keep the same identity regardless of how the tree is visualized. File projection shows only directories needed to reach indexed Tiinex Markdown artifacts; the Tiinex panel is not another general file browser.

Discovery settings are deliberately separated:

- `tiinex.discovery.folder` — explicit discovery root; blank means no scan. Opening Discovery without one asks for a folder and shows `You need to select a discovery folder` if cancelled.
- `tiinex.discovery.autoRefresh` — refresh the Discovery tree when package files change; no Incoming/Receive mutation follows.
- `tiinex.discovery.latestToIncoming` — independently qualify and set the newest discovered carrier as Incoming.
- `tiinex.incoming.autoShowRoleHandoff` — `yes` / `ask` / `no` automatic Markdown preview when exactly one qualified Incoming route matches `tiinex.operator.role`. The actual Handoff artifact is opened, never its package pointer.

Role/identity presentation scans every qualified local Workspace plus the active Incoming carrier, then prefers the latest actual Role artifact per label. Package-carried endpoint Role cache pointers are a fallback when the owning Role Workspace is not otherwise present. Role text remains presentation/defaulting only and grants no authority.

Discovery cache identity includes path, modification time and byte size, so rebuilding a carrier at the same filename invalidates the indexed view and can become the new latest Incoming candidate. Tree-item-only actions are hidden from the Command Palette and guard missing node context; they remain item actions in every projection. The retired webview/inbox implementation is no longer part of the source surface.

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
| `artifactTree`, `findingPresentation`, `operatorError`, `operatorUx`, `operatorModel` | Native artifact-tree projection, editor/operator presentation, safe defaults and selection-state shaping. |
| `latestWinsQueue` | Host scheduling for stale-result suppression in diagnostics. |
| `packageArgs` | VS Code host argument shaping for the public portable Tooling entrypoint. |
| `paths`, `repositoryPath`, `stableFile` | Local filesystem/repository normalization and stable-file/session behavior. |
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

After qualification, `tiinex.operator.role` can contain a presentation-only label such as `Sigma`. `tiinex.incoming.autoShowRoleHandoff` may open the actual Handoff Markdown artifact only when exactly one qualified Incoming route has a From/To label matching that role; it never opens transport pointer files. `yes` opens it, `ask` asks first, and `no` leaves it closed. The role string grants no authority and is not passed off as holder proof.

A Workspace whose qualified material does not expose exactly one usable repository origin cannot be safely mapped; the host offers Skip and reports the missing shared boundary rather than inventing repository identity. Package-carried Required Context remains retained as qualified carrier context even when a Required Context Workspace is intentionally skipped or has no local target; local `workspaceRoots` record only material actually available after Receive.

## Handoff authoring and Outgoing packaging

Handoff creation now starts from the **+** action on an Outgoing Workspace instead of the old raw schema form. The happy path asks for a short subject, one bounded intent (`Discussion`, `Continue`, `Review`, `Blocked`, or `Complete`), exactly one From endpoint, exactly one To endpoint, and optional additional Role participants.

`tiinex.operator.role` is only a preferred From choice. When a current Role artifact can be resolved, its exact `workspaceId::artifact-path` reference is carried; when it cannot, the operator may use an explicitly unrepresented label without pretending that a Role artifact exists. For **New (From Incoming)**, an unambiguous Incoming route From Role is suggested as the return To endpoint. Additional participants remain package-grounding context rather than extra From/To endpoints.

Shared Tiinex Tooling owns the Handoff path, schema fields, continuity rendering, validation and integrity. The extension first creates the draft against scratch Markdown material and opens the resulting `.trace.md` through a virtual Markdown preview. **No repository file is written merely to preview it.** Writing the exact reviewed bytes is a separate explicit action.

Outgoing is not staging. Selected local Workspaces stay bound to their live repository roots, so edits made after adding a Workspace remain eligible when packaging eventually runs. Workspace siblings are always ordered case-insensitively by Workspace id for deterministic/manual-merge-friendly presentation.

Carrier parentage is separate from Handoff artifact Parent semantics. **New (From Incoming)** passes the active Incoming `.handoff-package.zip` as the package parent to shared manufacture; **New (Blank)** does not. Package routing/pointer artifacts remain Tooling-owned projections rather than manually-authored pointer Markdown.

Reviewed/written Handoffs can be explicitly marked as Outgoing routes. One or more marked routes are passed through the public shared `--workspace-routes` manufacture surface; when several routes are present, the operator chooses one primary route only for the copied human-facing routing text while the carrier keeps every selected route. Pointer Markdown remains Tooling-manufactured rather than manually authored.

The following requested Outgoing capabilities are lineage-recorded but intentionally deferred until a qualified shared contract exists: descriptor-only Workspace carriage / narrower file scopes, optional bootstrap delivery profiles, and root/Workspace encryption controls. VS Code will not invent these package semantics by rewriting ZIP bytes privately.

## Git workflow

- `Tiinex: Generate Tiinex Commit Message` is an **explicit separate operator command** that delegates to the selected local repository's own `tools/tiinex-commit-message.mjs`; Receive itself never invokes that helper after source landing.
- `Tiinex: Stage, Commit & Push with Tiinex` remains explicit and fails closed on detached HEAD, missing upstream, no staged changes, failed staged Tiinex validation or changed publication state.
- Workspace landing never implies commit, push, acceptance or completion.

## Local development and qualification

Normal UX iteration uses the **same VS Code window**. The local development path now mirrors the proven ai-provenance Windows main-host pattern instead of relying on implicit discovery of a versioned extension folder.

One-time setup from this checkout:

1. Run **Tiinex: Link this checkout**.
2. The task creates the unversioned junction `%USERPROFILE%\.vscode\extensions\tiinex.tiinex-vscode` -> this checkout.
3. It explicitly registers that junction in `%USERPROFILE%\.vscode\extensions\extensions.json`, so the main VS Code host knows the linked extension exists.
4. Run `Ctrl+Shift+B` once, then restart VS Code or its Extension Host once.

Normal loop after that:

```text
edit → Ctrl+Shift+B → VS Code: Restart Extensions → test in the same window
```

`Ctrl+Shift+B` runs **Tiinex: Build linked extension** with the explicit sequence **npm install → Link this checkout → build**, so a replaced checkout refreshes dependencies before the main-host link/build step. There is no per-edit VSIX manufacture and no Tiinex-owned reload marker protocol; VS Code observes the registered junction-backed extension and owns the restart-required UX.

Use **Tiinex: Unlink this checkout** to remove the junction and restore the extension-registry entries that existed before linking. Reversible link metadata lives only under ignored `.vscode/link/`. The setup also cleans the superseded `.tiinex-dev/` marker and old versioned Tiinex junction created by the first implementation.

For checkouts that still have the earlier npm-backed Link task cached or materialized, `dev:setup` remains as a compatibility alias to `dev:link`; the canonical task now calls the PowerShell linker directly.

With the declared dev dependencies installed, full qualification remains:

```text
npm run validate
```

That performs typecheck, a clean build, focused regression tests and candidate VSIX generation. VSIX is qualification/release evidence, not the normal development loop, and this preparatory lane still does not authorize 0.1.8 publication.
