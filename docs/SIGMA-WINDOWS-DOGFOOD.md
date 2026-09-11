# Sigma Windows dogfood card — Carrier Major 002

This is a bounded real-host check for the current `extension-vscode` operator tranche. It is **acceptance evidence**, not automatic acceptance.

## Preconditions

1. Use a disposable or recoverable Windows checkout for any Merge/Replace test.
2. `npm install` / build must resolve the lockfile-qualified `@tiinex/core` dependency before testing. If Core qualification fails, **stop** and report the exact version/error; do not substitute another Core build.
3. Build the linked checkout, restart VS Code Extensions, then keep commit and push policies disabled unless the step explicitly asks otherwise.

## 1 — UI / exact-match sanity

1. Open Discovery and Incoming.
2. Open **Display Options** and confirm projection, lineage and Delta-only toggles are presented in the consolidated menu.
3. Load an Incoming package containing at least one Workspace that is byte-identical to Local.

Expected: the identical Workspace shows a green **qualified match** and offers no Merge/Replace action.

**Stop if:** an exact Workspace still offers a mutation action, or Delta-only hides an unqualified/unknown comparison.

## 2 — Merge + staging + message

Settings:

- `tiinex.landing.stage = yes`
- `tiinex.landing.commit = no`
- `tiinex.landing.push = no`

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

## 4 — Attach / forwarding

1. Create or open Outgoing with the intended Workspace source.
2. On an existing qualified Handoff, use **Attach Handoff to Outgoing**.
3. If starting from Explorer, confirm the Tiinex Outgoing panel reveals/focuses automatically.
4. After Pack, use **Copy Handoff Transport Text** where available.

Expected: attaching tracks the existing authoritative Handoff as a route; it does not rewrite the Handoff or imply recipient acceptance. Incoming-sourced Workspaces may expose their carried authoritative Handoff for the same forwarding flow.

**Stop if:** Attach rewrites the source Handoff, silently changes endpoint authority, or the route cannot be qualified by shared Tooling.

Cross-Workspace Handoff Parent authoring is a shared Core boundary. If New Handoff blocks there, record the exact blocker and **do not work around it in VS Code**.

## 5 — Pack / overwrite / reveal

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
