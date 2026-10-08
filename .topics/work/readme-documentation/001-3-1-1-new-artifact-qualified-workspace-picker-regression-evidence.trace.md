# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.evidence.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/core/evidence/tiinex.evidence.v1.schema.md)
  - Created At: 2026-10-08 00:55:30
  - Trace: [001-3-1-incoming-exact-workspace-mapping-regression-evidence.trace.md](001-3-1-incoming-exact-workspace-mapping-regression-evidence.trace.md)
  - Origin:
    - [relative](001-3-1-incoming-exact-workspace-mapping-regression-evidence.trace.md)
- Current
  - Current Schema: [tiinex.evidence.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/core/evidence/tiinex.evidence.v1.schema.md)
  - Created At: 2026-10-08 09:40:12
  - Authors: Anchor; Sigma
  - Why: Prevent plain unversioned VS Code roots from blocking legitimate Tiinex artifact creation while retaining exact Workspace identity gates.
  - Summary: Record multi-root authoring context failure and exact per-root Core-qualified Workspace reuse.
  - Status: ready/local

---

# New Artifact Qualified Workspace Picker Regression Evidence

## Supported Claim Or Question

- Supported Claim Or Question: Can New Tiinex Artifact open the Core-qualified schema selector when an ordinary unversioned VS Code folder is open alongside the 17 valid Tiinex Workspaces, without weakening exact Workspace matching?
- Evidence Role: bounded code-level regression and human-rerun preparation

## Provenance

- Known Source: Sigma's 2026-10-08 Windows screenshot of New Artifact failing with tiinex.package-builder.operator-context-blocked after Incoming had recovered; carried VS Code src/packageBuilder.ts, src/operatorTrees.ts, pure incomingWorkspaceMapping, and focused Core tests.
- Preservation Basis: Original Core operator-context behavior and the previously qualified Incoming 17-Workspace mapping are kept. Only the New Artifact authoring source selector is connected to the already established per-root Core-qualified Workspace path.
- Provenance Limits: The screenshots show the exact popup but do not expose the detailed underlying Core finding. The root cause is inferred from the actual New Artifact code path and confirmed architectural distinction; Windows UI acceptance still awaits Sigma.

## Evidence Material

- Material: In vscode/src/operatorTrees.ts, localWorkspaceChoices() now calls loadQualifiedLocalWorkspaceChoices() rather than the global all-root loadLocalWorkspaceChoices(). The generic alias in vscode/src/packageBuilder.ts reuses loadIncomingLocalWorkspaceChoices(), which calls Core projectWorkspacePackageSources() separately for each explicit host Workspace root; non-qualified root candidates do not enter the authoring choices. No filesystem folder-name guess or rootPath-to-host-root comparison is introduced. Existing Incoming and Package Builder semantics remain unchanged.
- Material Kind: bounded implementation and regression checks
- Description: Verified 17/17 representative, Core-qualified Workspace identities map one-to-one, an additional unversioned root contributes zero candidates, duplicate Workspace IDs fail closed, and the New Artifact method uses the qualified per-root path. TypeScript parse tests passed on the two modified source files. 64/64 focused Core tests passed, including workspace/operator-context boundaries, carrier manufacture, native transitions and Evidence creation qualification.

## Preservation And Fidelity

- Preservation State: local carried candidate; not committed or published
- Fidelity Notes: No Core change, schema change, Handoff routing change, Incoming source lifecycle change or repository rename is part of the correction. It changes the local Workspace candidates for authoring only, not the authority of candidate schemas or selected Parents.
- Known Losses: This sandbox did not run the locked Windows build nor invoke VS Code's real user-facing New Artifact QuickPick. The source evidence cannot claim that UI acceptance is already green.

## Interpretation Limits

- Does Not Prove: arbitrary unrelated open roots are globally qualified, that every discovered candidate is safe to author under, or that Core may be bypassed for Workspace identity or parent qualification
- Not Yet Used As: human PASS, Task closure, Marketplace publication, commit/push authority or UI acceptance
- Must Not Be Treated As: replacement for the actual Windows 17-Workspace and extra-unversioned-root New Artifact test

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-3-1-incoming-exact-workspace-mapping-regression-evidence.trace.md](001-3-1-incoming-exact-workspace-mapping-regression-evidence.trace.md)
  - Value: PN-27E8sBabbAh92_rH23im3wZjWOKZrJeCvyL2qrGc

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: rqMdFKZb6iIebjqZwUW17a06K6gFQBjt20PZiP5wdkI