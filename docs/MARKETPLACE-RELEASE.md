# VS Code Marketplace release contract

This document describes the release boundary for `tiinex-vscode`. It does not contain publisher credentials and it is not a substitute for Marketplace identity configuration.

## Local release gate

From a clean checkout:

```bash
npm ci
npm run release:check
```

`release:check` is the repository contract for compilation, tests, package integration, VSIX qualification, and static Marketplace metadata checks.

The package manifest also exposes `vscode:prepublish` so an official `vsce package` / `vsce publish` run rebuilds the extension and reruns the static release audit before packaging.

## Release candidate rules

A Marketplace candidate must:

1. Be built from the exact Git revision being released.
2. Have a version that has not already been published.
3. Pass `npm run release:check` from a clean dependency install.
   The gate includes `test:authoring-boundaries` (separate Evidence Material entries, transition source snapshot, Core-backed asset/lineage integration).
4. Before packaging, confirm the **resolved published** `@tiinex/core` executable supports `inspect-agent-capabilities` and the packaged tool/skill contribution paths exist. A local sibling Core source that supports the operation does not prove the installed npm dependency does. Run the explicit local `npm run test:transition-roundtrip` with qualified Core/Native/Docs fixture roots; this is not a substitute for Windows UI acceptance.
5. Package with the official VS Code Extension Manager (`@vscode/vsce`) in the release workflow.
6. Publish the same qualified revision; do not rebuild from a different branch or working tree after qualification.
7. Preserve `@tiinex/core` as the semantic authority. Marketplace packaging must not introduce VS Code-only copies of Core qualification, allocation, route, participant, or render semantics.
8. Keep extension `src`, tests, `.topics`, local development state, and `dist-audit` out of the shipped Marketplace payload. Bundled `@tiinex/core` runtime files must match Core's own npm package file projection exactly.

## Automated publishing identity

Do not commit publisher credentials to this repository.

Microsoft is retiring global Azure DevOps Personal Access Tokens for Marketplace publishing on 1 December 2026. The automated release workflow should therefore use Microsoft Entra ID / workload identity rather than establishing a new long-lived PAT contract.

The identity setup is intentionally outside this repository until the publisher-side service identity is provisioned. Once it exists, the workflow should consume short-lived identity from the CI environment and call the official `vsce` publisher path.

## Suggested automation shape

```text
version/tag selected
        ↓
clean checkout
        ↓
npm ci
        ↓
npm run release:check
        ↓
official vsce package
        ↓
record VSIX SHA-256 + manifest/version
        ↓
Entra/workload identity
        ↓
official vsce publish
        ↓
verify Marketplace version
```

The publish job should be protected by the repository's release environment / approval policy rather than by an interactive local secret.

## Marketplace presentation

The Marketplace page is driven from the root `README.md`. The manifest carries:

- Tiinex publisher identity (`tiinex`).
- repository, homepage, issue tracker, searchable keywords, category, and Free pricing.
- a 256×256 PNG Marketplace icon.
- Tiinex gallery banner styling.
- explicit Workspace Trust and virtual Workspace capability declarations.

`CHANGELOG.md`, `SUPPORT.md`, `LICENSE`, and `NOTICE` are kept at the root for Marketplace presentation and support.

## Distinguish a development smoke VSIX from Marketplace release

`npm run vsix` builds the locally qualified development/smoke artifact. It can bundle an un-published sibling Core development version such as `999.0.0`; smoke ZIP contents prove **packaging only**, not Marketplace readiness.

For a release candidate, the exact published `@tiinex/core` package must be installed under a clean dependency-backed build and must match the literal dependency declared in `package.json`, the lock root, the locked version and the installed version. Run `npm run vsix:release`, which sets `TIINEX_VSIX_RELEASE=1` and fails closed for sibling-source modes, placeholder versions or non-exact dependency tuples. A failed release attempt clears the old VSIX before binding qualification to prevent accidental shipment of a stale archive.

The extracted VSIX integration test must run the bundled Core's `inspect-agent-capabilities` operation, verify `project-agent-role-sync` is present and non-executable, and inspect all declared skill paths physically inside the ZIP. Do not reuse a source-only Core test receipt for release qualification.

## Final human gate (not a debugging session)

Before the candidate is handed to Sigma, preserve clean install/TypeScript/VSIX receipts, Core/Native test receipts, bootstrap cold-grounding and the exact package fingerprint. Run automated positive and negative transaction tests on disposable Workspaces. A single bounded Sigma Handoff should contain the final user acceptance steps and explicit PASS/BLOCK conditions; it must not require debugging or reconstructing hidden conversation history.

The explicit `scripts/package-vsix.mjs` packer must include all declared skill files (and their local supporting files), not merely the contribution metadata in `package.json`. Check the generated archive entry `extension/skills/tiinex-discovery/SKILL.md`. A no-typecheck/transpile smoke VSIX is not sufficient for publish readiness.
