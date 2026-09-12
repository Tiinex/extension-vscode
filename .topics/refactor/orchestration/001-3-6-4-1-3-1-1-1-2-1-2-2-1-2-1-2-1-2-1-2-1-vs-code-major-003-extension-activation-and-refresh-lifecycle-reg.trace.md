# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-12 19:37:01
  - Trace: [001-3-6-4-1-3-1-1-1-2-1-2-2-1-2-1-2-1-2-1-2-kodax-to-anchor-vs-code-major-003-transport-filename-fidelity-an.trace.md](001-3-6-4-1-3-1-1-1-2-1-2-2-1-2-1-2-1-2-1-2-kodax-to-anchor-vs-code-major-003-transport-filename-fidelity-an.trace.md)
  - Origin:
    - [relative](001-3-6-4-1-3-1-1-1-2-1-2-2-1-2-1-2-1-2-1-2-kodax-to-anchor-vs-code-major-003-transport-filename-fidelity-an.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-12 20:19:19
  - Authors: Anchor
  - Why: Sigma's Windows live observation showed missing Tiinex data providers and command-not-found for tiinex.discovery.refresh after build/restart, with a later reload recovering the extension.
  - Summary: Repair the live post-build/restart lifecycle regression where Tiinex view providers and the discovery refresh command can be unregistered, while preserving the confirmed Transport filename and icon improvements.
  - Status: ready/local

---

# VS Code Major 003 — Extension Activation And Refresh Lifecycle Regression Repair

## Objective

Repair the live Windows regression observed after the accepted Transport filename/icon delta: after building/restarting VS Code, Tiinex Discovery/Incoming/Outgoing/Transport could lose their registered data providers and the refresh action could fail with `command 'tiinex.discovery.refresh' not found`, while a later reload/reopen could recover the extension. Preserve the filename-fidelity and scanability wins while making extension activation, provider registration and command registration reliable across the normal build/restart/reload lifecycle.

## Live Evidence

- Sigma's Windows video shows Discovery, Incoming, Outgoing and Transport presenting `There is no data provider registered that can provide view data.` after the build/restart sequence.
- Invoking refresh then reports `command 'tiinex.discovery.refresh' not found` and VS Code attributes that failure to the extension that should contribute the command.
- A later reload/reopen in the same observation restores Discovery, so treat this as a lifecycle/activation/registration regression until mechanically explained and eliminated, not as a permanent-carrier or package failure.
- The same video also confirms the prior Transport repair's intended user-visible wins: ChatGPT receives the canonical carrier filename rather than a UUID-like basename and package-vs-text copy actions are visually distinct.

## Done Criteria

- Reproduce, mechanically explain, or otherwise isolate the exact lifecycle path that can leave Tiinex views without providers and `tiinex.discovery.refresh` unregistered after the ordinary development build/restart/reload sequence.
- Fix the root cause at the Extension VS Code host boundary so normal activation reliably registers commands and view providers before the operator invokes them; do not paper over the issue with retries that hide an unregistered extension.
- Preserve the live-confirmed Transport filename fidelity and package/text icon distinction from the previous bounded return.
- Add focused regression evidence for extension activation/registration lifecycle, including the refresh command and the Discovery/Incoming/Outgoing/Transport provider surfaces implicated by the live observation.
- Preserve accepted Git, Transport, Incoming Merge, navigation and first-class Artifact/Feedback/Handoff authoring behavior.
- If exact locked-toolchain validation remains unavailable, keep that limitation explicit; do not substitute dependency versions or weaken validation claims.
- Use Sigma only for the smallest discriminating Windows/VS Code observation that cannot be proven locally. Kodax owns the hypothesis, expected outcomes and interpretation.
- Do not claim the Major 003 live gate closed until the build/restart/reload sequence is re-observed without missing providers or missing commands.

## Scope

Extension VS Code Major 003 host lifecycle only: activation events, command registration, view-provider registration, focused tests/runtime output, and the minimum supporting implementation required to make the observed restart/reload path reliable.

## Dependencies

- Current Extension VS Code Major 003 checkpoint returned by Kodax with the live-confirmed carrier-filename and package/text icon improvements.
- Sigma's Windows + VS Code live observation showing the post-build/restart missing-provider and missing-command regression.
- Existing Extension VS Code activation/registration implementation and focused host regression harness.

## Exclusions

- No Core/Docs semantic change.
- No carrier/package-byte change, transport-authority change, release, Marketplace publication, repository push or remote mutation.
- No unrelated UI redesign or new feature tranche.
- Do not undo the canonical filename or scanability improvements that already passed the live Windows observation.

## Return Boundary

Return one repo-local checkpoint to Anchor with the root-cause explanation, exact source delta, regression receipts, any remaining environment/live-host limits, and a minimal Sigma retest request only if still needed.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-3-6-4-1-3-1-1-1-2-1-2-2-1-2-1-2-1-2-1-2-kodax-to-anchor-vs-code-major-003-transport-filename-fidelity-an.trace.md](001-3-6-4-1-3-1-1-1-2-1-2-2-1-2-1-2-1-2-1-2-kodax-to-anchor-vs-code-major-003-transport-filename-fidelity-an.trace.md)
  - Value: 3LvbWhct-pT-OQHUlh4gaQmbPf-dv8jyNTj6fHGXqrI

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: C4BXrvAxzXg_T5XtuqoPoTAiNOQirJzdJD_3QL2zhFM