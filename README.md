# Tiinex VS Code

A deliberately thin native VS Code operator adapter over shared Tiinex package/bootstrap, validation, artifact-authoring, Workspace landing and Git mechanics.

## Tiinex Operator view

The primary human path is the persistent **Tiinex Operator** view in its own **Tiinex Activity Bar** container, visible immediately after activation. Command Palette entries remain escape hatches that focus the same view rather than starting long chains of transient inputs.

The view has three bounded surfaces:

- **Validate** — automatically validates eligible Tiinex Markdown on open, debounced in-memory change, and save through shared `project-editor-assistance`; it shows the active artifact state, links directly to Problems, and keeps Tiinex discovery/settings nearby. Manual refresh remains recovery-only.
- **Create Handoff** — binds an explicit shared-qualified Parent when available, derives only epistemically safe continuation defaults from that Parent, keeps sender/recipient identity explicit, and collapses pre-filled transfer/completion boilerplate. Shared Tooling still owns Parent qualification, path allocation, schema creation, validation, envelope and integrity sealing.
- **Build Package** — automatically loads shared-qualified Handoff leaves plus explicit **No Handoff pointer** when the tab becomes active, shows selected Handoff From/To read-only, and independently controls Workspace inclusion. Handoff artifact Parent continuity is not package route selection.

The context-menu transition appears only while shared Tooling has qualified the active local artifact as a usable authoring Parent. UI presence, active editor, filenames and folder placement do not create authority.

## Native diagnostics and Quick Fixes

Eligible Tiinex Markdown artifacts are projected through shared `project-editor-assistance` automatically. Unsaved editor bytes are staged only in a transient host file and sent through that same shared operation after a short debounce; saves immediately requalify the real file path. Generation guards prevent stale asynchronous results from replacing newer diagnostics. Exact validator findings appear in Problems/editor ranges when a deterministic line is available; otherwise location stays visibly unresolved. Quick Fixes are restricted to shared-core-qualified deterministic full-document hygiene replacement. Semantic rewriting and LLM guesses are never Code Actions.

The extension does not contribute tasks or problem matchers for the operator path, so Tiinex diagnostics do not depend on task-driven Output/Problems pollution.

## Multi-root and Workspace landing

`Tiinex: Land Handoff Package` qualifies ingress with the package-declared portable bootstrap, then uses the manifest-bound current Site shared core for landing-plan projection.

Repository matching is explicitly multi-root:

- all opened Git roots and their explicit Git facts are projected to shared Tooling together;
- Windows root comparisons treat slash/case-equivalent Git API and `git.exe` roots as the same filesystem repository without weakening repository identity checks;
- ambiguous/missing repository identity still fails closed;
- dirty worktrees block;
- qualified ref/branch mismatches are preflighted across all targets and require one explicit safe branch-switch approval before Workspace bytes are written.

Landing uses one multi-repository confirmation. Post-landing `commit`, `push`, and `openHandoff` policies are independent `no | ask | yes` settings and all default to `no`. Push can only target the unchanged configured upstream for the exact commit created by the same landing run; no force push or invented upstream exists in this adapter.

## Package construction

Package construction is distinct from Handoff authoring. The persistent builder presents only shared-qualified Handoff leaves plus explicit `No Handoff pointer`, exact repository-matched Workspace candidates, read-only route From/To and Workspace inclusion controls before shared manufacture preview.

Pointerless Workspace-carrier manufacture uses shared Tooling's canonical all-`none` mode, emits no Handoff route or routing text, and does not infer endpoint, current-work, transfer, participation, acceptance or completion semantics. Arbitrary tracked-source exclusions are not offered.

## Git workflow

- `Tiinex: Generate Tiinex Commit Message` delegates to the selected repository's own `tools/tiinex-commit-message.mjs` and fills the native SCM input.
- `Tiinex: Stage, Commit & Push with Tiinex` remains a separate explicit command and fails closed on detached HEAD, missing upstream, no staged changes or changed publication state.
- Workspace landing itself never implies commit, push, acceptance or completion.

## Inbox discovery

Handoff discovery is `manual` by default or opt-in `auto`, with an explicit inbox override and conservative stable-file debounce for completed `.handoff-package.zip` files. The Operator view visibly distinguishes disabled, watching, candidate-found, candidate-blocked, and landing-awaiting-confirmation states. Auto discovery raises a native **Preview / Land** vs **Ignore** notification before entering the existing qualified, explicitly confirmed landing flow.

## Shared Tiinex core snapshot

The installable VSIX carries `shared-core/tiinex.bootstrap`, a manifest-bound runtime snapshot generated byte-for-byte by the shared `Tiinex/site` portable Tooling bootstrap builder. Package ingress is always qualified first by the received package's own declared bootstrap. Current planning/authoring/manufacture projections then use the bundled shared core so older already-issued carriers need not contain future Tooling operations.

Refresh the snapshot from a qualified Site workspace with:

```text
npm run sync:shared-core -- /path/to/site
```

VS Code remains a host adapter. It does not define Handoff, Workspace, Role, Task, package, validator, path-allocation or commit-message semantics.
