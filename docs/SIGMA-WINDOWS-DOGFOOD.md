# Sigma Windows dogfood card — VS Code Major 003 MVP closure

This is a bounded real-host check for the current `extension-vscode` operator tranche. It is **acceptance evidence**, not automatic acceptance.

## Preconditions

1. Use a disposable or recoverable Windows checkout for any Merge/Replace test.
2. `npm install` / build must resolve the lockfile-qualified `@tiinex/core` dependency before testing. If Core qualification fails, **stop** and report the exact version/error; do not substitute another Core build.
3. Build the linked checkout and restart VS Code Extensions. Fresh/default configuration should resolve `tiinex.git.postStagePolicy = ask`; individual steps may override it explicitly.

## 1 — UI / exact-match sanity

1. Open Discovery and Incoming.
2. Open **Display Options** and confirm projection, lineage and Delta-only toggles are presented in the consolidated menu.
3. Load an Incoming package containing at least one Workspace that is byte-identical to Local.

Expected: the identical Workspace shows a green **qualified match** and offers no Merge/Replace action.

**Stop if:** an exact Workspace still offers a mutation action, or Delta-only hides an unqualified/unknown comparison.

## 2 — Merge + staging + message

Settings:

- `tiinex.landing.stage = yes`
- `tiinex.git.postStagePolicy = do-nothing`

1. Choose one changed Incoming Workspace and **Merge**.
2. Review the plan and exact local destination, then Execute.
3. Open Source Control.

Expected:

- landed changes are staged by the same invocation;
- ignored/protected local material is not staged;
- a deterministic Tiinex commit message is pre-filled when Source Control can be addressed and is also available through **Copy Commit Message**;
- no commit or push occurs.

Safety boundary: the automatic message path executes the helper shipped with the extension against the staged index. It must not execute helper bytes from the newly received Workspace.

**Stop if:** unrelated pre-existing local work is staged, protected/ignored material is staged, a received helper is executed, or a commit/push happens with the policies above.

### Preserve-local-work variant

Repeat with non-overlapping dirty local work and choose **Preserve + Merge** when offered.

Expected: the merge may proceed, but auto-staging is intentionally skipped and VS Code tells you to review/stage explicitly so unrelated human work is not absorbed.

## 3 — Replace + staging

With the same stage/commit/push settings, run **Replace** on one disposable changed Workspace.

Expected: the qualified non-ignored Incoming tree lands, protected local material survives, and safe landed changes are staged with the same message behavior as Merge.

**Stop if:** `.git`, ignored/protected material, or any repository outside the reviewed root changes.

## 4 — Incoming operation-scoped Ask

Settings:

- `tiinex.landing.stage = yes`
- `tiinex.git.postStagePolicy = ask`

1. Load one Incoming Handoff package whose Merge/Replace plan affects at least two repositories.
2. Execute the reviewed multi-repository Incoming plan.
3. After all safe landings have been staged, confirm Tiinex presents **one** modal for the whole operation, with exactly **Commit**, **Commit + Push**, and **Cancel**.
4. Choose **Cancel** once and confirm every affected repository remains staged; there must be no follow-up per-repository Ask prompts for that same operation.
5. Repeat with changed Incoming bytes and choose **Commit** once; confirm each safely staged repository receives its local Tiinex commit and no push occurs.
6. On disposable repositories whose current branches all have aligned upstreams, repeat and choose **Commit + Push** once; confirm publication is limited to the exact commits created by that operation.
7. Repeat the operation with policy **commit**, then **commit-push**; confirm those policies are non-interactive and do not present success prompts.

**Stop if:** a multi-repository Incoming operation asks once per repository, the policy changes midway because settings were edited while the operation was running, Cancel mutates any staged selection, or automatic `commit` / `commit-push` asks for confirmation.

## 5 — Post-stage policy from manual staging

Use a disposable Workspace with at least one Tiinex Markdown artifact under `.topics/` in the staged closure and no unstaged remainder. Intentionally use an artifact with known qualification findings (for example an unstaged/unresolved Parent) so this gate proves ordinary Git policy is independent of Tiinex qualification.

1. Set `tiinex.landing.stage = no`.
2. Manually stage the Tiinex change in Source Control; leave the known qualification issue unresolved.
3. Exercise `tiinex.git.postStagePolicy` in this order:
   - **do-nothing**: expect no prompt, commit or push.
   - **ask**: expect one prompt for the stable staged state with exactly **Commit**, **Commit + Push**, and **Cancel**. Choose **Cancel** and confirm the index stays staged; cause a harmless SCM refresh and confirm the unchanged state is not prompted again. Change the staged bytes, wait for the next stable SCM event, then choose **Commit** and confirm one local commit is created with no push despite the known qualification finding. On a disposable branch with an already aligned upstream, stage another changed Tiinex state and choose **Commit + Push**; confirm Tiinex pushes only the exact commit created by that prompt.
   - **commit**: prepare another staged Tiinex state with the same known qualification finding and confirm it creates the local commit after the same safety gates.
   - **commit-push**: only on a disposable branch with an already aligned upstream, confirm Tiinex commits and then pushes only that exact same-operation commit.

Expected: the policy is driven by the operator's stable staged Tiinex selection, not by qualification or Incoming auto-staging, and background automation never performs Stage All.

**Stop if:** `landing.stage = no` disables manual-staging evaluation, Ask repeats for an unchanged staged state, declining changes the index, Ask pushes, or Commit + Push publishes any commit other than the one it just created.

## 6 — Authoring / attach / forwarding

1. In the Tiinex Discovery title, confirm **New Artifact**, **New Feedback**, and **New Handoff** are directly discoverable; also confirm the Explorer **Tiinex** submenu exposes the same generic authoring shortcuts.
2. Create or open Outgoing with the intended Local Workspace source.
3. Start **New Handoff** through the generic authoring flow, preview the exact bytes, create them, and intentionally enable **Attach to Outgoing** when offered.
4. On a separate existing qualified Handoff, use **Attach Handoff to Outgoing**.
5. If starting from Explorer, confirm the Tiinex Outgoing panel reveals/focuses automatically.
6. After Pack, use **Copy Handoff Transport Text** where available.

Expected: New Feedback/New Handoff remain schema-preselection shortcuts through generic Core-driven authoring; attaching occurs only after written Handoff bytes are re-qualified, tracks the authoritative Handoff as an Outgoing route, and does not rewrite artifact bytes or imply recipient acceptance.

**Stop if:** authoring requires command-name archaeology, a shortcut uses private host schema semantics, Attach rewrites the source Handoff, silently changes endpoint authority, or the route cannot be qualified by shared Tooling.

Cross-Workspace Handoff Parent authoring is a shared Core boundary. If New Handoff blocks there, record the exact blocker and **do not work around it in VS Code**.

## 7 — Pack / overwrite / reveal

Test both:

- pointerless Outgoing with one or more Workspaces;
- routed Outgoing with an attached Handoff.

Expected:

- the visible projected canonical filename equals the written ZIP filename;
- Pack never silently overwrites different bytes at the same filename;
- one Handoff route copies exact transport text automatically before reveal;
- multiple Handoff routes expose per-route copy actions;
- output inside an open VS Code Workspace uses **Reveal in Explorer**;
- output outside all open Workspaces uses the OS file explorer action;
- output in the Discovery folder appears after refresh without manual archaeology.

**Stop if:** the written name differs from the projection, a different existing ZIP is overwritten, or reveal opens the wrong surface.

## Report back

For any failure, send the shortest reproducible observation:

`step → visible action → expected → actual → exact error text`

Screenshots/video are useful for interaction/placement regressions. Do not mark Carrier Major 002 accepted until Sigma has observed the relevant Windows behavior.
