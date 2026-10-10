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
  - Created At: 2026-10-10 16:27:58
  - Authors: Anchor
  - Why: Reconcile user-approved Sigma scope and replace obsolete Save as Transition acceptance steps without rewriting historical tasks.
  - Summary: Candidate-only bounded Windows acceptance for actual Evidence presets, Move/Rebase, assets, safe Cross-Workspace BLOCK and paused Save as Transition.
  - Status: ready/local

---

# Sigma — Scoped Windows VS Code Acceptance (2026-10-10)

## Objective

Perform one bounded human observation of the exact carried VS Code candidate in an isolated, disposable local workspace. This task supersedes the older 001-7 Sigma acceptance procedure **for this candidate only** because Save as Transition is intentionally hidden and three first-party Evidence presets have since been added. Do not debug or patch source as Sigma.

## Scope

- Native/Core V1 qualified Evidence presets: Preserve source excerpt, Record image observation, Record counter-evidence. Six established Handoff presets remain available. All are **form defaults**, not executed transitions.
- Safe, reviewed in-Workspace Move/Rebase for ordinary artifacts and selected ordinary assets, including Cancel/nonmutation and Apply with preserved bytes/references.
- Core-qualified, closed-graph transfer between two explicitly qualified Workspaces, with exact-preview approval and atomic rollback. Out-of-transaction external Parent/readers and third-Workspace mutation must **BLOCK** before Apply. Never mistake an expected BLOCK for a defect.
- Fresh Evidence Parent under Evidence; repeated Material entries from Attach to Form; optional historical immutable pinned schema Parent verification via read-only GitHub HTTP when a real immutable historical fixture exists.
- Native read-only agent capability discovery and Incoming/Outgoing Handoff routing.

## Dependencies

- The complete package carries 17 Workspace snapshots; the linked Core tested offline as a packed npm consumer and 99-file Core suite passed 663 assertions, zero failures, one skip. Static release policy passed zero errors/warnings. These are **sandbox facts only**, not Windows installation evidence.
- Sigma supplies the Windows VS Code installation/linked local build and `npm run dev:build:local`, Reload Window, and normal VSIX/extension-host observation. The candidate can be rejected at the first build or activation error.
- Use disposable artifacts and PNGs; do not move real repository source or production Evidence. Do not publish, git push, mutate GitHub, install unknown software, or adjust Core schema authority.

## Acceptance Procedure

1. **Build/activate.** Replace the candidate Workspace files from the exact package, run your normal local Core dependency selection, `npm run dev:build:local`, and Reload Window (or test your locally installed VSIX matching this candidate). Confirm Tiinex activates. **BLOCK** on the first build/activation failure; report the exact text without debugging.
2. **Evidence and presets.** New Evidence shows *three* distinct selectable presets: Preserve source excerpt, Record image observation, Record counter-evidence. Select each in disposable drafts; confirm corresponding suggested values appear and are editable. Create and reopen one. Create a fresh Evidence child of that new qualified Evidence and confirm Parent continuity. Missing authority must visibly BLOCK, not silently pass.
3. **Attach to Form.** Attach two distinct PNGs from Explorer to a new Evidence draft. Confirm two separate editable Material entries and suggested, not authoritative, Material Kind; Preview+Cancel once (original bytes untouched), then Create/reopen a fresh draft with two retained entries and references. No silent move before approval.
4. **Move/Rebase.** In one disposable Workspace Preview+Cancel an ordinary PNG and ordinary `.trace.md` artifact, then Preview+Apply. Check exact PNG bytes, moved canonical filename and updated references. Where available, run a selected closed Parent graph + asset move without detaching Parents. Do not use valuable data.
5. **Bounded Cross-Workspace.** With two disposable qualified local Workspaces, try one explicitly supported closed graph/asset transfer; review preview and verify both sides after Apply. With an external Parent or third-Workspace reader, verify Core **BLOCKS before modification**. Do not try to override a failed qualification.
6. **Read-only and routing.** Run `inspectTiinexCapabilities` read-only; check Incoming/Outgoing and recipient role choices. Confirm *Save as Transition* is **not shown** in the authoring form. If you have an actual public immutable historical Evidence Parent fixture, try *Verify Pinned Schema* and report separately whether the real GitHub HTTPS check succeeded, BLOCKED correctly on incompatible bytes, or was **NOT TESTED** for lack of a fixture. A synthetic fixture is not proof of real HTTP behavior.

## Done Criteria

- Return just **PASS**, **PASS WITH OBSERVATIONS**, or **BLOCK** plus the first failed step and exact observed on-screen behavior; one optional short silent recording/screenshot. Avoid source edits and logs unless they genuinely change the diagnosis.
- If a needed authentic GitHub fixture is absent, explicitly report **historical HTTP NOT TESTED**. Do not infer a real-network PASS. Sigma may PASS the scoped local flows with this observation; marketplace/public release still requires any separate live-network gate agreed by the owners.
- Installed Windows acceptance requires the actual user's result. Neither this task nor a carrier auto-closes the parent Task or authorizes marketplace publication.

## Exclusions

- General Save as Transition editor/definition authoring (paused at user's request).
- Three-or-more-Workspace atomic rewrites and external readers outside qualified two-root transactions. Pre-Apply BLOCK is correct and intentional; future generalization must extend the canonical Core transaction deliberately.
- Cross-version migration of actually distinct historical Evidence schemas. Byte-incompatible historical schema is BLOCK without separate qualified historical authority or explicit future migration.
- Release/Marketplace publishing, remote writes, fixture fabrication, unsafe data mutation, and any human or Role authorization beyond the bounded Sigma acceptance.

---

## Interpretation Limits

- Does Not Prove: installed Windows host PASS, arbitrary external reference continuity, automatic Transition execution, historical schema equivalence or publication authorization before Sigma returns observations.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-vscode-extension-integration-and-final-acceptance.trace.md](001-vscode-extension-integration-and-final-acceptance.trace.md)
  - Value: cjZcy22E70O7lAaL4bykf-sJEEvjp1a8E-CoCj6zXOo

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: i3ngluoEYF_JnJMUfDomojDHiK3lkDn7r6aLqSf-UOY