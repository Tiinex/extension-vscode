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
4. Package with the official VS Code Extension Manager (`@vscode/vsce`) in the release workflow.
5. Publish the same qualified revision; do not rebuild from a different branch or working tree after qualification.
6. Preserve `@tiinex/core` as the semantic authority. Marketplace packaging must not introduce VS Code-only copies of Core qualification, allocation, route, participant, or render semantics.
7. Keep extension `src`, tests, `.topics`, local development state, and `dist-audit` out of the shipped Marketplace payload. Bundled `@tiinex/core` runtime files must match Core's own npm package file projection exactly.

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
