# Kodax Carrier Major 002 — bounded return status

This is the durable extension-local status snapshot for the Anchor → Kodax operator-completion tranche. It does not substitute for the required semantic Handoff return; shared cross-Workspace Parent authoring is still blocking that return.

## Sigma feedback matrix

| # | Item | Status | Current evidence / boundary |
|---|---|---|---|
| 1 | Pack canonical filename + no silent overwrite | **PASS locally / Windows untested** | Accepted source keeps shared projected filename guards and destination-local no-overwrite publication. Real Windows acceptance remains Sigma-owned. |
| 2 | Real Handoff authoring | **SHARED-BLOCKED** | Scratch `author` with the exact Business-qualified governing Parent is reported qualified but renders the Parent target as `../../../../business::.topics/...`; VS Code must not normalize or work around that shared defect. |
| 3 | Forward existing Incoming Handoff | **PASS in source / Windows untested** | Incoming-sourced Outgoing Workspaces expose their authoritative Handoff artifact; Attach tracks that existing artifact as the route, and shared Tooling manufactures routing/pointer material. Copy Transport Text remains a transport convenience only. |
| 4 | Auto staging | **FIXED locally / Windows untested** | Native Incoming Merge/Replace now stages only successful non-conflicted operations when `tiinex.landing.stage=yes`. Preserve+Merge deliberately skips auto-staging so unrelated pre-existing human work cannot be absorbed. |
| 5 | Commit-message / commit / push ergonomics | **FIXED locally / Windows untested** | Dirty-work precondition Commit now stages before deterministic message generation. Post-Incoming staging uses the helper shipped with the extension against the staged target index; it does not execute helper bytes from the received Workspace. Missing message generation leaves staged changes and suppresses auto commit/push. Commit/push remain policy-gated and push only an exact commit created by the same invocation. |
| 6 | Current Tiinex primary branding | **DEFERRED / shared asset missing** | Exact organization `.github/assets` bytes are not carried; no guessed image is introduced. |
| 7 | Consolidated Display Options | **PASS in source / Windows untested** | One scalable menu owns projection, lineage and Delta-only toggles. |
| 8 | Marketplace README + capture support | **PASS locally** | README and `docs/GIF-CAPTURE.md` are present; `docs/SIGMA-WINDOWS-DOGFOOD.md` adds the current ordered real-host card and stop conditions. |
| 9 | Incoming == Local green match / suppress mutations | **PASS in source / Windows untested** | Exact shared byte comparison projects a green qualified match and removes Merge/Replace actions. |
| 10 | Attach Handoff | **PASS in source / Windows untested** | Existing Handoff Attach qualifies the artifact, tracks the route, and reveals/focuses Outgoing. New Handoff continuation that needs a cross-Workspace Parent remains shared-blocked by item 2. |

## Bounded extension-local changes in this tranche

- Native Incoming Merge/Replace now owns a safe post-apply Git follow-up:
  - stage successful non-conflicted landed changes by default;
  - preserve pre-operation ignored paths;
  - skip auto-staging when Preserve+Merge leaves pre-existing local changes present;
  - generate deterministic message only after staging;
  - use extension-shipped helper bytes after receive, never newly received helper bytes;
  - leave staged changes intact and suppress auto commit/push if message generation fails;
  - keep commit/push opt-in and exact-invocation bounded.
- Dirty-work **Commit first** now uses the existing `commitWorkingTree` ordering (`git add -A` → deterministic message → commit) instead of trying to generate from an unstaged index.
- VSIX construction now includes `tools/tiinex-commit-message.mjs`, so the trusted post-Incoming helper exists in an installed extension as well as a linked source checkout.
- Configuration/README/GIF wording is aligned with the safe behavior.
- Added `docs/SIGMA-WINDOWS-DOGFOOD.md`.

## Qualification

- `node test/run.mjs`: **20 focused cases pass**, including the new safe staging/message orchestration check.
- The suite then fails closed at the existing package binding guard: lockfile requires `@tiinex/core 0.7.0`; the carried qualified Core available in this Handoff is `0.1.1`.
- Changed TypeScript files pass TypeScript parser/transpile diagnostics with the available host compiler.
- Full `tsc` / full regression / VSIX qualification is **not claimed** because the exact lockfile-qualified Core/runtime + normal dev dependency install could not be established in this host. No version guard was bypassed and Core source was not modified.

## Shared blockers retained for Anchor / Core Loom

1. **Cross-Workspace Parent rendering:** exact scratch proof still rewrites `business::.topics/...` into a child-local relative target while Tooling reports the artifact qualified. A real return Handoff is therefore intentionally not authored through that broken path.
2. **Qualification dependency availability:** this extension checkout is pinned/locked to `@tiinex/core 0.7.0`, while the carried qualified Core Workspace/runtime is `0.1.1`; this host could not install the locked package. The mismatch is left visible rather than papered over.
3. **Brand asset coverage:** exact current organization branding bytes are still absent.

## Sigma Windows card

Use [`SIGMA-WINDOWS-DOGFOOD.md`](SIGMA-WINDOWS-DOGFOOD.md). The order is: exact-match/UI sanity → Merge staging/message → Preserve+Merge safety → Replace staging → Attach/forwarding → Pack/no-overwrite/reveal.

Sigma observation remains the acceptance gate.
