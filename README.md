# Tiinex for VS Code

Tiinex brings qualified Handoff and Workspace workflows into native VS Code UI.

Use it to discover Tiinex carriers, review Incoming work, author and package Outgoing Handoffs, prepare exact Transport instructions, and keep Git operations explicit — while shared `@tiinex/core` remains the authority for Tiinex semantics, qualification, allocation, and carrier manufacture.

## Install

After Marketplace publication:

1. Open **Extensions** in VS Code.
2. Search for **Tiinex**.
3. Install the extension published by **tiinex**.
4. Open the **Tiinex** Activity Bar icon.

For prerelease/local acceptance, install the qualified VSIX produced by the repository release gate instead of an arbitrary development build.

## What you get

The **Tiinex** Activity Bar contains four operator views:

- **Discovery** — browse `.handoff-package.zip` carriers from a folder without receiving or mutating them.
- **Incoming** — inspect qualified carrier contents, compare carried Workspaces with open local Workspaces, and explicitly Merge or Replace.
- **Outgoing** — author Handoffs, select Workspace sources, choose optional participant Roles, preview exact carrier material, and Pack.
- **Transport** — keep already-manufactured carriers ready for reveal/copy and copy the exact per-route handoff text.

A typical flow is:

```text
Discovery → Incoming → Outgoing → Pack → Transport
```

Tiinex is deliberately fail-closed: if shared Core cannot qualify an operation, the extension shows the blocker instead of inventing a VS Code-side fallback.

## Quick start

### Requirements

- VS Code **1.95.0 or newer**.
- Node.js **22.14 or newer** available to Tiinex Tooling. Set `tiinex.nodePath` if the intended Node executable is not on `PATH`.
- A Tiinex Workspace when you want authoring, validation, or qualified Handoff flows.

### First run

1. Open the **Tiinex** icon in the Activity Bar.
2. In **Discovery**, choose a folder containing `.handoff-package.zip` files, or open a package directly as Incoming.
3. Expand **Incoming** to inspect Workspaces, Files, Lineage, and qualified Handoffs.
4. Use **Outgoing → New** when you want to create a new carrier.
5. Select the Workspaces to carry, author or attach Handoffs, then choose **Pack**.
6. Open **Transport** to reveal the finished package or copy the exact handoff text for a selected route.

## Handoff authoring

Handoff authoring keeps human-facing identity separate from carrier allocation:

- **Title** becomes the Handoff's rendered heading and summary.
- **Slug** is an optional path-planning hint. When blank, Tiinex derives the path label from the selected **From → To** Roles and lets Core perform slugification/allocation.
- **From** and **To** are selected from Core-projected Role endpoints in qualified open Workspaces.
- After Attach, a native multi-select lets you choose **0..n additional participant Roles**. Those selections are operator input; Core requalifies the final semantic participant set.

The extension does not treat its Role inventory as participant authority.

## Tree display modes

Discovery, Incoming, and Outgoing support native display options.

### Logical vs Files

- **Logical** emphasizes Workspaces and Tiinex artifacts.
- **Files** shows the physical carrier/file projection.

### Leaves vs Full Lineage

- **Leaves** shows only artifacts that are not parents of another visible artifact in the same lineage.
- **Full Lineage** shows those leaves plus their visible ancestors.

Lineage mode changes **artifact membership only**. It does not change whether pointer targets, Handoff provenance, or other row details are expandable.

### Delta vs All

Discovery and Incoming can compare carried Workspaces with qualified local Workspaces. Exact matches are shown as such; changed Workspaces expose bounded `+added ~changed -removed` summaries.

## Incoming safety model

Incoming never implies acceptance.

- Browsing a package is read-only.
- Merge/Replace is explicit and plan-first.
- Exact local matches are identified before mutation.
- Git-native merge is used only when the required commit/common-base proof exists.
- File-safe merge preserves local-only paths and surfaces same-path conflicts instead of silently replacing them.
- Replace stays a separate explicit operation.
- Hidden or ambiguous repository targets fail closed.

## Outgoing and Transport

Outgoing is a carrier plan, not a shadow copy of your repositories.

- Workspace source choice remains explicit.
- Core owns Handoff package filename/allocation and physical pointer material.
- The **Files** projection is based on Core's exact carrier preview when one is available.
- Pack never silently overwrites a different carrier at the same canonical destination.
- A successfully manufactured carrier is qualified for **Transport** through Core's exact route identity.

Transport does not rewrite or repack carriers. It prepares the already-qualified package and exact route text for the operator.

## Git integration

Tiinex includes explicit Git helpers for reviewed Tiinex changes. Automatic Commit + Push paths are fail-closed around branch/upstream and staged-state checks; unrelated commits are never silently pushed as part of a Tiinex operation.

Git commands use your configured repositories and remotes. Tiinex does not require a Tiinex-hosted cloud service.

## Settings

| Setting | Default | Purpose |
| --- | --- | --- |
| `tiinex.discovery.folder` | empty | Folder scanned by Discovery for `.handoff-package.zip` carriers. |
| `tiinex.discovery.autoRefresh` | `false` | Refresh Discovery when packages change. |
| `tiinex.discovery.latestToIncoming` | `false` | Qualify and open the newest discovered carrier as Incoming. |
| `tiinex.incoming.autoShowPartyHandoff` | `ask` | Preview/reveal qualified Incoming Handoffs addressed to the Core-projected recipient scope of `tiinex.operator.party`. |
| `tiinex.operator.party` | empty | Host-local Operator Party preference. Use **Pick Operator Party**; canonical values are Workspace-qualified artifact references, `unknown::<name>` is a named unknown Party, and empty means None. It grants no Party/Role authority. |
| `tiinex.outgoing.folder` | empty | Destination folder for Pack. |
| `tiinex.nodePath` | empty | Optional Node executable override for Tiinex Tooling. |
| `tiinex.landing.stage` | `yes` | Stage safe landed changes after successful explicit Incoming merge. |
| `tiinex.git.postStagePolicy` | `ask` | Post-stage Git policy over a stable staged Tiinex selection. |

All settings are also available through the normal VS Code Settings UI.

## Useful commands

Open the Command Palette and search for **Tiinex**. Common commands include:

- `Tiinex: Open Handoff Package as Incoming`
- `Tiinex: New Outgoing Handoff`
- `Tiinex: Package Outgoing`
- `Tiinex: Refresh Validation`
- `Tiinex: Commit Repository…`
- `Tiinex: Stage, Review, Commit & Push Repositories`

Most everyday carrier work is easier from the Tiinex Activity Bar because row actions remain scoped to the object they affect.

## About grounding state

Core can project internal readiness states for an Incoming Handoff. These are useful to the host, but ordinary users should not need to interpret labels such as `grounded-to-act` to use Tiinex correctly. The extension is expected to turn state into concrete available actions rather than make Core vocabulary a user prerequisite.

## Privacy and network behavior

Tiinex primarily operates on local Workspaces, local carrier files, and the configured `@tiinex/core` runtime. Network activity occurs only when an explicit operation uses an external system already configured by the user, such as a Git push to a repository remote.

## Current platform scope

The extension is a desktop/workspace extension. The real-host qualification lane is Windows + VS Code, while the implementation uses portable VS Code APIs where practical. It is not currently published as a browser/web extension.

## Documentation

- [Detailed operator and implementation reference](docs/OPERATOR-REFERENCE.md)
- [Repeatable Marketplace/demo capture runbook](docs/GIF-CAPTURE.md)
- [Marketplace release contract](docs/MARKETPLACE-RELEASE.md)

## Contributing and local development

Install dependencies and run the full qualification lane:

```bash
npm ci
npm run validate
```

For the linked Windows main-host development loop, see the detailed operator/reference document above.

Before a Marketplace release, run:

```bash
npm run release:check
```

That gate is intended to become the local contract consumed by the automated Marketplace release workflow.

## License

Apache License 2.0. See [LICENSE](LICENSE) and [NOTICE](NOTICE).

## Support and issues

Report reproducible extension issues at the [Tiinex VS Code issue tracker](https://github.com/Tiinex/extension-vscode/issues). See [SUPPORT.md](SUPPORT.md) for the information that helps us reproduce a problem without exposing private Handoff or Workspace material.
