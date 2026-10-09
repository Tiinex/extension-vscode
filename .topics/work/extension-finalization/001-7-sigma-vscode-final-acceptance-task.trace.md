# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-10-09 20:50:08
  - Trace: [001-vscode-extension-integration-and-final-acceptance.trace.md](001-vscode-extension-integration-and-final-acceptance.trace.md)
  - Origin:
    - [relative](001-vscode-extension-integration-and-final-acceptance.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-10-09 22:29:06
  - Authors: Anchor
  - Why: Use Sigma for final observation only, not implementation debugging
  - Summary: One bounded six-step local Windows acceptance of repaired VS Code workflows with first-failure stop.
  - Status: ready/local

---

# Sigma — One Bounded Windows Acceptance Of The Integrated VS Code Extension

## Objective

Perform one final human *observation* of the current local VS Code build against the original four P0 workflows, native agent discovery and canonical transport. Sigma does not diagnose code, npm, schema authority or runtime internals.

## Scope

Disposable, qualified local Tiinex test Workspace only. Use the user's existing linked local build and switch-to-local workflow. The carried candidate changes only the VS Code Workspace compared with `tiinex-032-1-1-1-1-1-1-1`; the Core source is unchanged. A clean package install and source handoff are separate operations.

## Dependencies

- Anchor's internal Core `.tgz` offline-install test, host P0 tests, native agent and Transition Create→persist→reopen are qualified locally; no claim that this simulates Windows rendering.
- Sigma explicitly owns running the normal local TypeScript build and Reload Window; npm/Latest switching is not an Anchor repair gate.
- No release, push, remote mutation or Marketplace publication is authorized by this acceptance Task.

## Acceptance Procedure (single run, in order)

1. **Build / activation gate.** Incoming → review → Replace the changed VS Code Workspace only. In that local checkout run your normal `npm run dev:build:local` and reload VS Code. If build fails, mark **BLOCK** and return only the first exact error; stop all other checks. No manual patching.
2. **Move / Rebase.** In a disposable `.topics` test Workspace, preview/cancel a normal PNG Move/Rebase and confirm the original remains. Preview/Apply to a dimension; verify exact image bytes and updated local references. Repeat once with an ordinary disposable `.trace.md` artifact. No valuable or canonical artifact moves.
3. **Evidence under Evidence.** Create a fresh qualified Evidence, then start New Artifact on that Evidence and select Evidence. A qualified fresh Parent must be accepted. An older unqualified schema link should explain its blocker, not silently gain authority.
4. **Attach to Form.** From Explorer attach two PNGs to one fresh Evidence draft. Confirm two distinct editable Material entries with filename-based Material Kind *suggestions*. For **Yes**, Preview must show a pending move while originals remain. Cancel once (nothing moves); then Create in a fresh attempt, reopen Evidence, verify descriptions, references and exactly two material entries. No silent overwrite or semicolon concatenation.
5. **Save as Transition.** From a partially filled Evidence form, choose Save as Transition. Verify the second Definition form displays the source's unfinished values; explicitly copy an appropriate value to a compatible field, Create the Definition and reopen it. The original unfinished Evidence must not be silently created or interpreted as Transition Roles/effects.
6. **Agent / recovery.** Read-only `inspectTiinexCapabilities` responds without granting execution. Preview Role as Agent, choose Cancel first (no file write), then optionally Apply to a disposable Role target and preserve human notes. Incoming/Outgoing and the carried Anchor/Sigma Handoff choices must be legible without reading a prior chat.

## Done Criteria

- Mark one overall result: **PASS**, **BLOCK**, or **PASS WITH OBSERVATIONS**.
- Report the first failing step number and exact error/on-screen behavior if blocked. A short silent recording or screenshot is enough. No logs/source isolation, terminal debugging or multiple test rounds.
- PASS requires the linked build and all six bounded observed flows. FAIL/BLOCK is useful evidence and returns implementation responsibility to Anchor, without authorizing publication.

## Exclusions

- No arbitrary external file relocation, remote writes, schema authority bypass, npm publish, Marketplace publish or production migration.
- Do not repeat Core machine fixtures, inspect generated patch files or debug TypeScript failures. One compact human return signal is sufficient.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-vscode-extension-integration-and-final-acceptance.trace.md](001-vscode-extension-integration-and-final-acceptance.trace.md)
  - Value: cjZcy22E70O7lAaL4bykf-sJEEvjp1a8E-CoCj6zXOo

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: aoqZWub0hc68KvmwHUbPSWy5SNFE6o7sH19sc0CPYNw