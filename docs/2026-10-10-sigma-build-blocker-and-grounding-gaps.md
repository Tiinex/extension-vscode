# Bounded result — VS Code SHA typing blocker and ChatGPT grounding gaps

Date: 2026-10-10
Incoming authority: exact Anchor→Sigma `001-19-12` Handoff in the carried package; controlling Task `001-vscode-extension-integration-and-final-acceptance.trace.md`.
Return endpoint: Anchor (per selected Handoff). No Task closure, Sigma PASS, publication authorization or remote write is claimed.

## Verified change in the selected VS Code Workspace

- `src/tiinex/bootstrap.ts`: added `representationSha256?: string` to `TransitionCatalogDefinition`, which `TransitionNeighborhoodDefinition` extends.
- `src/operatorTrees.ts` consumes `candidate.representationSha256` at its existing location, so the new declaration closes the reported TS2339 type-contract gap without casts, deleting evidence, changing Core selection, or creating an alias engine.
- The carried Core catalog and neighborhood samples in the working session each contain three distinct qualified Evidence candidates and each includes `representationSha256`. This is evidence for the optional property; it is not a Windows build or installed-extension PASS.
- Package scripts show `npm run dev:build` invokes `tsc -p tsconfig.json` without changing dependency mode; `dev:build:local` and `dev:build:latest` explicitly run `scripts/core-mode.mjs` to switch modes first. Respect the tester's existing **Switch to Local / Switch to Latest** state rather than performing registry-dependent changes from a ChatGPT sandbox.

## Root cause 1 — canonical package-first delivery was present but not applied

**Grounded source:** `interop-openai::.topics/.entries/where/chatgpt-web/001-chatgpt-web-target-entry.trace.md` declares target-specific material, specifically `interop-openai::.topics/.processes/chatgpt-session-continuity/001-chatgpt-session-continuity-and-source-discipline-process.trace.md`. That process explicitly says that at a ChatGPT operator completion/recipient-transfer boundary, Tooling must manufacture **one canonical Handoff Package** with exact routing text and that loose patches/ZIPs/Markdown are *not* substitutes. The Sigma Role also explicitly rejects treating a human as a patch courier.

**Observed failure:** a previous ChatGPT assistant delivered `tiinex-vscode-representationSha256-fix.patch` with `git apply` commands to the Windows tester. The requirement existed in qualified material but did not govern the actual outgoing response. The present `ground --recipient --continue` receipt reports `recipientContract.guidance.state: not-declared` and `recipientContract.operationSelection.selectedGuidance: false`; it does not project an active host process step. This is evidence of an **unclosed host composition/execution gate**, not proof that the Entry/Process was missing or that Core incorrectly granted process applicability. Target discovery alone never means an executable Process has been invoked.

**Required owner correction (Interop OpenAI / host adapter, not implemented in this VS Code-only recipient scope):** qualify the exact selected Target Material *before* output selection; reconcile Process applicability against actual Entry/Handoff/Task authority; on every response that hands an action to a human or LLM, require Core `qualify-return` → `prepare-return`/`author` → canonical `handoff` manufacture, byte/filename verification and exact Tooling-projected routing. If the gate cannot qualify, explicitly block/degrade transfer rather than falling back to a patch or asking the operator to run Git commands. Rehearse with blind cold-start package re-grounding and a negative test that rejects a bare patch. Keep Process applicability independent from mere Target selection.

## Root cause 2 — sandbox npm availability was promoted into a release prerequisite

**Observed failure:** assistant spent time diagnosing npm registry/package installation inside a constrained ChatGPT runtime, despite the tester's working Windows **Switch to Local / Switch to Latest** flow. The sandbox's registry/network behavior is a host capability limitation; it cannot determine whether the local Windows dependency mode is healthy or whether a release candidate passes. Core/npm source build, Node smoke tests and Windows-installed VSIX acceptance remain separate checks.

**Required owner correction (Interop OpenAI execution profile / host process, not implemented in this VS Code-only recipient scope):** qualify which dependency-backed checks are feasible in the *active* host, and do not make public npm registry access in a ChatGPT sandbox a mandatory acceptance gate. Use already supplied dependencies and `npm run dev:build` when the mode is already selected; avoid automatic install/mode flips in the constrained host. If required dependencies are missing, record `not verified in this host` without interpreting it as a product failure or retrying registry archaeology. Route dependency-backed build to the environment that owns those dependencies, and Windows-installed acceptance exclusively to Sigma. Rehearse offline/no-registry plus local-mode positive cases. This is a host capability adaptation; it does not lower TypeScript, packaging or Windows acceptance standards.

## Next evidence gate / no release permission

1. Anchor must review/integrate the scoped VS Code source correction and the two host-grounding owner changes with their own qualified Workspace/Task authority. Do not treat this return package as proof that Interop OpenAI or Core Tooling were changed.
2. Build the exact candidate in the already selected local mode (`npm run dev:build`), package it through the normal qualified workflow, and verify exact artifact identity.
3. Give Sigma a separate canonical Handoff Package for real installed Windows VS Code acceptance (three Evidence presets, Parent/Create/PNG, Move/Rebase, integrity/fail-closed controls and Core agent parity), without making the human perform a source-code repair.
4. Reduction/Marketplace are **BLOCKED** until successful dependency-backed build, host regressions, human Windows acceptance and separate explicit release/publish authorization. No Task completion/closure is asserted.

## Confidence / interpretation

- Confirmed: the patch-vs-package delivery violated already-carried ChatGPT process semantics; the existing target points to them; the current grounding receipt does not select executable process guidance; local VS Code type surface lacked the Core-provided SHA field; the npm scripts differ as stated.
- Not established: that any specific Core parser defect caused the host behavior; that changing a Target Entry alone creates Process applicability; complete Windows compilation or runtime acceptance; permission to mutate the Interop OpenAI/Business/Core Workspaces from this Sigma Handoff.
