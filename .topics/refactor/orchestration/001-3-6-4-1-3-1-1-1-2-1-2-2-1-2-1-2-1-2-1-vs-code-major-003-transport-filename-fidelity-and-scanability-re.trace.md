# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-12 18:54:56
  - Trace: [001-3-6-4-1-3-1-1-1-2-1-2-2-1-2-1-2-1-2-kodax-to-anchor-vs-code-major-003-first-class-artifact-authoring.trace.md](001-3-6-4-1-3-1-1-1-2-1-2-2-1-2-1-2-1-2-kodax-to-anchor-vs-code-major-003-first-class-artifact-authoring.trace.md)
  - Origin:
    - [relative](001-3-6-4-1-3-1-1-1-2-1-2-2-1-2-1-2-1-2-kodax-to-anchor-vs-code-major-003-first-class-artifact-authoring.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-12 19:09:48
  - Authors: Anchor
  - Why: Sigma live-observed that VS Code Copy Package pastes into ChatGPT with a UUID filename while Windows Explorer preserves the carrier name, and that identical copy icons are hard to scan with dyslexia.
  - Summary: Repair Windows Copy Package filename preservation and visually distinguish package-vs-text Transport actions before the coherent Sigma acceptance gate.
  - Status: ready/local

---

# VS Code Major 003 — Transport Filename Fidelity And Scanability Repair

## Objective

Repair the remaining live Windows Transport friction discovered after the accepted authoring-discoverability return so Copy Package preserves the canonical carrier filename when pasted into ChatGPT and package/text actions are visually distinguishable for fast, dyslexia-friendly scanning, without changing package bytes, transport semantics or Core authority.

## Done Criteria

- Reproduce or otherwise mechanically explain the observed Windows difference: VS Code Transport `Copy Package` pastes into ChatGPT as `<uuid>.zip`, while copying the same ZIP from Windows Explorer preserves the canonical Tiinex carrier filename.
- Fix `Copy Package` so a receiving application that honors the normal Windows file clipboard receives the same immutable carrier bytes under the original canonical filename. Do not rename or rewrite the qualified carrier itself, and do not claim success from a text-path clipboard fallback.
- Preserve the existing capability-bound behavior: Windows uses a real file-drop clipboard path when safely available; unsupported/failing hosts expose honest `Copy Path` / `Reveal Package` fallback instead of pretending a file was copied.
- Make package-copy and transport-text-copy actions visually distinguishable in the Transport operator. Prefer semantically different native VS Code icons and retain concise titles/tooltips so the actions can be recognized by pattern instead of requiring repeated text reading.
- Apply the same distinction consistently where equivalent package-vs-text transport actions are shown; avoid icon churn unrelated to the confusion Sigma observed.
- Add focused regression evidence around the chosen Windows clipboard mechanism, original basename preservation where mechanically testable, command contributions/icons, fallback truthfulness and existing Transport prepared-state semantics.
- Preserve accepted Git, Incoming Merge, navigation and first-class Artifact/Feedback/Handoff authoring behavior.
- Treat Sigma as the live Windows/ChatGPT observer when host-specific evidence cannot be automated. Kodax owns the hypothesis and asks for the smallest discriminating test, states expected outcomes and interprets Sigma's observation; Sigma is not asked to diagnose source code.
- Return the exact remaining blocker if ChatGPT or Windows host behavior cannot be proven deterministically from the extension/runtime boundary. Do not fabricate delivery semantics or weaken package qualification.

## Scope

Extension VS Code Major 003 Transport host UX only: Windows Copy Package filename fidelity, visually distinct package/text actions, focused tests/docs, and the minimum supporting host clipboard mechanics.

## Dependencies

- Accepted Major 003 Transport implementation and current first-class authoring-discoverability return.
- Current immutable carrier filename projected by shared Tooling/Core and the existing Transport queue/prepared-state implementation.
- Sigma's real Windows + ChatGPT host for a bounded live observation when automation cannot prove cross-application paste behavior.

## Exclusions

- No Core/Docs semantic change.
- No package repack, post-qualification rename, new transport authority or delivery/acceptance claim.
- No unrelated VS Code feature tranche, release, Marketplace publication, repository push or remote mutation.
- Do not redesign the whole icon language; repair the observed ambiguity with the smallest coherent native-icon change.

## Return Boundary

Return one repo-local checkpoint to Anchor with exact source delta, focused regression receipts, any live-host observation request still needed, and explicit qualification limits. This repair remains inside VS Code Major 003 and precedes the single coherent Sigma Windows acceptance gate.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-3-6-4-1-3-1-1-1-2-1-2-2-1-2-1-2-1-2-kodax-to-anchor-vs-code-major-003-first-class-artifact-authoring.trace.md](001-3-6-4-1-3-1-1-1-2-1-2-2-1-2-1-2-1-2-kodax-to-anchor-vs-code-major-003-first-class-artifact-authoring.trace.md)
  - Value: XDmcTOKvnb6DlemRsbyda-LwBFtlN7gGYeSKY-3a24Y

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: xp_bXNOci1TdgjmdCxaC6kQVGl-p6kcQke7n6NKCxOk