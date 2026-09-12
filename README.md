# Tiinex VS Code

Tiinex VS Code is a thin native editor host over the published, host-neutral `@tiinex/core` Tooling surface. VS Code owns editor integration, operator presentation, filesystem/Git host adapters and user confirmations; it does not define Tiinex schema meaning, Handoff semantics, Workspace authority or shared package behavior.

This checkout is a **preparatory 0.1.7 lane**. It may build and qualify candidate VSIX bytes, but it does not declare or authorize 0.1.8. Final contract-dependent integration remains behind the Refactor Turn-2 Core/CLI/Interop frontier.

## Native operator trees

The Tiinex Activity Bar uses three native VS Code TreeViews. Each view has one **Display Options** control instead of a row of projection buttons. The picker exposes icon + text + checked state for **Files / Logical**, **Lineage / Leaves**, and (for Discovery/Incoming) **Delta / All**. Mutation actions stay on the object they affect, and stable title actions no longer shift because a display mode changed. Tree items use native ThemeIcons throughout.

### Discovery

**Discovery** is read-only `.handoff-package.zip` discovery in one explicit operator-selected folder. Expanding a carrier browses the qualified Tiinex carrier/workspace artifacts without performing Receive or Merge. Nested package context is retained through every directory level, so `.topics` and other Tiinex descendants remain expandable instead of disappearing after the first level.

Discovery settings remain deliberately separated:

- `tiinex.discovery.folder` — explicit discovery root; blank means no scan.
- `tiinex.discovery.autoRefresh` — refresh Discovery when package files change.
- `tiinex.discovery.latestToIncoming` — independently qualify and open the newest discovered carrier in Incoming.
- `tiinex.incoming.autoShowRoleHandoff` — `yes` / `ask` / `no` preview+reveal policy for qualified Handoffs whose **To** role matches `tiinex.operator.role`.

### Incoming

**Incoming** can keep multiple qualified Handoff packages open at once. Packages are independent carrier roots rather than implicitly merged, and their order mirrors Discovery: newest package timestamp first. Opening/reopening a package does not reshuffle that time order. Each package root has an inline **Close** action.

**Merge / Replace** is available both on a package root and on each carried Workspace. Package-level use first opens a Workspace multi-select. Every Workspace owning a qualified Handoff route whose **To** matches `tiinex.operator.role` is preselected; multiple matches can therefore preselect multiple Workspaces, and no match leaves the selection empty. Workspace-level use scopes directly to that Workspace.

Before any Merge/Replace choice, the extension asks the current shared Core `compare-source-frontiers` operation for an exact read-only byte/path comparison between the selected Incoming Workspace and its qualified Local Workspace. An `exact` Workspace is shown immediately as a green **qualified match** and its Workspace/archive rows do not offer Merge or Replace actions that cannot change state. `changed` is summarized as `+added ~changed -removed` in the plan UI, and any non-qualified comparison state fails visible instead of guessing.

The apply flow is plan-first and fail-closed:

- **Git Workspace:** `.git` is retained. When a carried snapshot can be proven to be an exact locally available commit with a common base, Merge uses real `git merge --no-commit` semantics so unresolved paths become native Git conflicts that VS Code Source Control / Merge Editor can resolve.
- **Non-Git Workspace:** Merge is file-safe: incoming-only files may be added, identical overlaps are retained, local-only files are preserved, and differing overlaps block rather than guessing a winner.
- **Replace:** Incoming becomes the non-ignored working-tree source while `.git`, ignored local material and protected local symlinks are retained. Incoming collisions with protected material block.
- `.gitignore` is evaluated from the local pre-operation state, including for ordinary folders without `.git`; ignored local material is not made disposable merely because Incoming contains different ignore rules.
- Dirty Git Workspaces require an explicit safe precondition. Preserve+Merge is offered only when proven non-overlapping; otherwise Commit or Discard is required. A differing branch disables Preserve, and a branch switch is separately confirmed.
- Every prompt can be escaped/cancelled. Source mutation begins only after the final **Execute Plan** confirmation.

### Outgoing

**Outgoing** is a descriptor-first package plan rather than a copied workspace tree. **New** is always visible and replacing an existing context requires confirmation. With open Incoming packages, New first shows one single-select choice: **Blank** or one of the open Incoming package roots in Incoming/Discovery time order. Blank (or no Incoming at all) asks for the lowercase Outgoing label and starts at carrier major `001`; choosing Incoming inherits that carrier's name/dimension context without an extra name prompt. Carrier continuation and major checkpoints remain delegated to shared Tooling rather than recreated in the extension.

New then opens the same **Select Workspaces** picker immediately. Blank preselects every qualified Local Workspace; choosing an Incoming package preselects every Workspace carried by that selected Incoming package. Cancelling that picker cancels the new Outgoing context rather than leaving a half-created plan.

**Select Workspaces** uses one compact multi-select ordered by source priority: a visually explicit `LOCAL · VS CODE` group first, then numbered `INCOMING 1`, `INCOMING 2`, ... groups newest to oldest. Workspace rows avoid secondary detail/subtitle lines so Local versus carried sources are recognizable mainly by group placement and native icons rather than dense text. If the same qualified Workspace is selected from more than one source, the highest-listed source wins; lower-priority duplicates are de-selected and the corrected picker is shown again so the operator explicitly confirms the effective selection. Outgoing does not merge sources. It carries exactly one selected source per Workspace.

The lineage parent is chosen only by **New**; **Select Workspaces** changes source membership only and never opens a second lineage prompt. Workspaces may still be sourced from Local or any open Incoming package independently of that parent choice. **Bump Major** is one explicit click with no throw-away Why prompt; it immediately advances the projected major in the Outgoing root and shared Tooling still owns the qualified manufacture. The Outgoing root has inline **Close**; package construction stays behind **Package** and shared Tiinex manufacture.
Before writing a Handoff carrier, Package requires shared Tooling preview/output to match the exact carrier dimension and visible ZIP filename projected by Outgoing. A mismatch is a shared-contract blocker: VS Code fails closed and never renames or post-edits qualified carrier bytes. An existing destination ZIP is never silently replaced: byte-identical output may be reused, while a different payload at the same canonical filename fails closed and must be resolved explicitly.

Logical projection keeps **Handoff identity** bounded to the outer Handoff-package layer: only package-level Handoff route pointers become current Handoff rows, so historical Handoffs inside a repository payload are never flattened into the carrier view. A Workspace with an embedded `.workspace.zip` additionally exposes **Files** (the complete payload file tree) and **Lineage** only when the payload actually contains Tiinex artifacts. A Workspace without a payload ZIP exposes only its package-level Handoff rows; the extension does not shadow-clone a checkout just to fill the tree. Expanding a resolved Handoff shows the outer pointer that led to it as provenance.

The ordinary **Files** projection remains package-truthful. Outer pointer Markdown stays a real clickable pointer artifact; expanding a resolvable Handoff/endpoint pointer shows the exact target filename beneath it, and clicking that Markdown target opens the same source-backed artifact surface. `bootstrap.zip` is shown only when it physically exists in the carrier. Carrier timestamps use one deterministic visual format everywhere: `YYYY-MM-DD HH:mm:ss`.


Artifact navigation is source-backed rather than preview-cache-backed. A local artifact backed by a real Workspace file opens through its actual `file:` URI in VS Code's native Markdown editor, so ordinary relative links inherit the real repository directory. Tiinex adds only `workspace::path` document links, and those resolve through Core-qualified local Workspace roots rather than host path guessing. An unopened Discovery/Incoming artifact opens as a read-only `tiinex-material:` document backed by an immutable in-memory snapshot of the exact carrier bytes; refreshing that document does not depend on a one-entry preview cache and does not unpack or mutate the carrier.

For carried material, Tiinex resolves only exact link identities that are present in that same snapshot: ordinary relative links stay inside their current Workspace (or outer carrier scope), `workspace::path` links switch to that exact carried Workspace, and `http`/`https` links remain external. Root escapes, unsupported URI schemes and absent targets are not guessed or rewritten into nearby filenames; they fail closed. The resolver is artifact-generic and does not special-case Handoff schemas.

While Outgoing performs a long qualification/manufacture step, its root remains visible immediately with a native spinning `Loading…` state in the tree; notification/status progress is secondary rather than the only indication that Outgoing is working. Source selection itself still does not scan/copy repository contents before it needs to qualify the available Local choices.

Role/identity presentation scans every qualified local Workspace plus every open Incoming carrier and prefers the latest actual Role artifact per label. Package-carried endpoint Role pointers are only fallback presentation data when the owning Role Workspace is not otherwise present. Role text never grants authority.

## Runtime/package boundary

The historical tracked `shared-core/` snapshot and Site-coupled `sync:shared-core` path have been removed. The extension now declares the published Core compatibility range used by this checkout; the lockfile pins qualification to `0.7.0`:

```json
"@tiinex/core": "^0.7.0"
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

Unsaved bytes are staged only in a transient host file for the lifetime of the shared `project-editor-assistance` call. Generation guards prevent stale asynchronous results from replacing newer editor state. Exact validator findings—including Core-owned per-field schema-reference debt/contradiction findings—appear in Problems/editor ranges with the severity and code projected by Core; VS Code does not infer validity from Markdown-link versus plain-id shape. Historical warning-level reference debt remains diagnostic/read-only, and Quick Fixes remain restricted to shared-qualified deterministic full-document hygiene replacement rather than host normalization of schema-reference fields.

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
7. After every selected merge finishes, `tiinex.landing.stage` controls the Git boundary: the default `yes` stages with `git add -A`, then the **pre-landing ignored set is explicitly removed from the index and verified absent**; `no` leaves the landed changes unstaged and suppresses extension-driven commit/push for that invocation. This protects preserved local material such as `.env` even if the incoming `.gitignore` stops ignoring it. Commit policy is evaluated only for changes staged by the same merge invocation, using the deterministic extension-owned `Tiinex Receive: <workspace-id>` message and never executing code from the received repository snapshot. If auto-commit is declined, that trusted message is pre-filled in Source Control when available and exposed through **Copy Commit Message**.
8. Auto-push is considered only for a commit created by that exact Receive invocation after auto-commit was approved. It additionally requires the pre-landing upstream to have been aligned and to remain unchanged; manual commits are never auto-pushed.

After qualification, `tiinex.operator.role` can contain a presentation-only label such as `Sigma`. `tiinex.incoming.autoShowRoleHandoff` applies to every qualified Incoming route whose **To** label matches that role. `yes` opens the stable carried artifact surface and reveals every match, `ask` asks once first, and `no` leaves navigation untouched. Reveal expands the Incoming package/workspace path and selects the real Handoff destination while transport pointers remain separate provenance. Multiple matching Handoffs are supported. The role string grants no authority and is not passed off as holder proof.

A Workspace whose qualified material does not expose exactly one usable repository origin cannot be safely mapped; the host offers Skip and reports the missing shared boundary rather than inventing repository identity. Package-carried Required Context remains retained as qualified carrier context even when a Required Context Workspace is intentionally skipped or has no local target; local `workspaceRoots` record only material actually available after Receive.

## Artifact authoring and Outgoing packaging

`Tiinex: New Artifact` is the primary authoring entrypoint. The selected local Workspace is projected through installed Core, and the schema picker is populated only from the currently create-capable schemas returned by Core. VS Code keeps no private schema allow-list.

For the selected schema, Core owns the creation contract, required/optional fields, repeatable shapes, rendering and validation. Core `prepare-materialization` also supplies the qualified Parent candidates and allocates the exact repository-relative filename/path for both lineage roots and continuations; the extension does not recreate Handoff naming policy for generic artifacts. Preview creation stays scratch-only, and reviewed bytes are written only after a separate explicit confirmation. The `create-local-draft` result is also the sole prospective validity/severity authority: any Core error or non-created result blocks preview/create, while warning-only results are not promoted by the host. When Core blocks a candidate—for example because its own per-field schema-reference authority reports an avoidable exact-target omission or a resolved material-identity contradiction—the panel surfaces Core's exact finding severity/code/message instead of parsing or classifying Envelope, Parent or Current schema-reference representation itself.

This source tranche is qualified against the carried current Core007 runtime as a disposable/local dependency boundary. The repository lockfile still pins registry `@tiinex/core` `0.7.0`; if those installed bytes cannot prove the Core007 result/finding behavior, full live-host qualification remains blocked on an updated reviewed package boundary rather than a host-side semantic fallback.

The existing **New Handoff** actions are compatibility shortcuts that merely preselect `tiinex.handoff.v1` through that same generic schema/model/Parent/path flow. Handoff-specific host behavior is intentionally limited to the optional **Attach to Outgoing** transport action after the exact reviewed Handoff bytes have been written and re-qualified. Attaching does not alter artifact semantics or bytes. Existing qualified Handoffs can likewise be attached intentionally; **Copy Handoff Transport Text** copies forwarding text and does not imply recipient acceptance, Role authority or a new Handoff identity.

Outgoing Workspace choices stay source descriptors until Package. Local selections remain bound to their live roots, while Incoming selections are materialized from the exact carried `.workspace.zip` only when manufacture needs them. One qualified Workspace identity can occur only once in the effective Outgoing selection.

Reviewed/written Handoffs marked as Outgoing routes are passed through shared `--workspace-routes`; the primary route selects the human-facing route and carrier continuation. For a child carrier, the extension derives the next carrier dimension from the ordinal position of the exact continued Handoff route in the parent carrier's qualified route sequence, not from the Handoff filename number. Shared manufacture is checked against that expected dimension and fails closed if the shared contract would allocate a different lineage.

**Bump Major** delegates the stable-checkpoint major transition to shared manufacture. Descriptor-only carriage semantics beyond the public shared Tooling contract, optional bootstrap profiles and encryption remain deferred rather than being recreated privately in VS Code.

## Git workflow

- `Tiinex: Generate Tiinex Commit Message` is an **explicit separate operator command** that delegates to the selected local repository's own `tools/tiinex-commit-message.mjs`; Receive itself never invokes that helper after source landing.
- `Tiinex: Stage, Review, Commit & Push Repositories` is the multi-repository operator flow. Candidate repositories come only from Core-projected qualified Workspace context. Each selected repository is staged and validated independently, then shown in one combined review where the operator can edit each commit message or exclude a repository before committing.
- Before review, the flow binds branch, upstream, HEAD, exact working-state bytes and exact staged-diff bytes. Commit re-verifies those facts; push is a separate final modal and is permitted only for the exact flow-created commit with unchanged branch/upstream/HEAD and an exact one-ahead/zero-behind relation. Per-repository blockers/failures are reported without silently treating later repositories as successful. There is no background push.
- `Tiinex: Stage, Commit & Push with Tiinex` remains available as the legacy single-repository command and keeps its existing fail-closed behavior.
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

For repeatable Marketplace/demo evidence after behavior is stable, follow [`docs/GIF-CAPTURE.md`](docs/GIF-CAPTURE.md). The runbook fixes the capture order and visible states while keeping Windows observation and human acceptance separate from technical PASS.

Branding remains intentionally unchanged until the exact current Tiinex primary asset bytes are available from the qualified organization branding source; this checkout does not substitute a guessed or look-alike logo.
