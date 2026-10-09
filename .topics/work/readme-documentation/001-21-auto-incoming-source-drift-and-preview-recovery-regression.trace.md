# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.evidence.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/core/evidence/tiinex.evidence.v1.schema.md)
  - Created At: 2026-10-08 19:50:12
  - Authors: Anchor
  - Why: Preserve a repeatable user-reported Windows receive-flow blocker and maintain exact carrier source guards.
  - Summary: Evidence and bounded host regression for source-changed warning during Auto Incoming and Preview omitted after Refresh.
  - Status: ready/local

---

# Auto Incoming Source Drift And Preview Recovery Regression

## Supported Claim Or Question

- Supported Claim Or Question: Why does Auto Discovery → Auto Incoming sometimes warn `tiinex.material.source-changed` immediately, then show qualified Workspaces after Refresh without automatically opening Handoff Markdown until the carrier is closed and moved to Incoming again?
- Evidence Role: direct Windows screenshots plus a bounded VS Code host recovery candidate; not an accepted Windows outcome.
- Review Context: Sigma observed the defect with the penultimate carrier and asked whether the following form batch already fixed it. Source inspection of the latest form-batch carrier shows the same pre-repair path.

## Provenance

- Known Source: three user-supplied silent Windows screenshots in this conversation; exact current VS Code carrier source `src/operatorTrees.ts`, `src/carrierIndex.ts` and existing `src/core/stableFile.ts`; carried README acceptance Task. No audio was used.
- Preservation Basis: each source screenshot is carried byte-for-byte below; changed source and regression assertions are in the same qualified VS Code Workspace snapshot.
- Provenance Limits: screenshots show outcomes but not whether the physical ZIP was being copied, touched by Windows/antivirus/sync, or modified by another writer. A race between file discovery, indexing/orientation and later material read is the best code-supported explanation, not yet a measured Windows trace.

## Evidence Material

- Material Kind: three original Windows screenshots and bounded host regression evidence.
- Material: [Auto Incoming initial source-changed error](windows-auto-incoming-media/20261008-auto-incoming-source-changed.png) SHA-256 `a82baf5dc31d5e8b20699167ae951a8313e1853ddc0378169c99f0e125cc7ee9`; [Refresh qualified without Preview](windows-auto-incoming-media/20261008-refresh-qualified-no-preview.png) SHA-256 `7fabd23640d1b0a3e163033efb805773b3910a55602474b9c57fbdba6b6167dc`; [Manual re-Incoming opens Handoff Preview](windows-auto-incoming-media/20261008-manual-reincoming-preview-opens.png) SHA-256 `adfa62ac01f0652268d0ff4ce5099a2fa3d86d4e9c18e951bd2efe249d403267`.
- Exact Host Boundary: discovery watcher waits 700 ms then invokes `refreshDiscovery` which had immediately called `setIncoming` for the newest filename; `indexCarrierPackage` recorded first file stat before parsing ZIP and `MaterialProvider.source` enforced size/mtime at later read. When these differ, Preview throws `tiinex.material.source-changed`. `refreshIncoming` separately requalifies but did not reopen the previously failed Preview. Manual close/re-Incoming repeats the Preview path against then-stable bytes.
- Candidate: use existing `waitForStableFile` before *automatic* move/qualification; reject `indexCarrierPackage` if the file changes during indexing; if source changes between successful orientation and virtual Markdown read, wait for stability, discard stale index, requalify through the real Core runtime and retry once; on persistent source change fail closed and retain a closeable Blocked carrier; on manual Refresh, retry the earlier failed Preview only after fresh qualification. Nothing about a filename alone establishes validity and no Accept/Reject guard is relaxed.
- Local Checks: isolated `waitForStableProbe` moving-file sequence PASS; `indexCarrierPackage` simulation rejecting source changes mid-index PASS and accepting exact stable snapshot PASS; host source wiring for qualified retry/Refresh PASS; all 73 TypeScript source files parse without syntax error; `npm run release:audit` no errors or warnings. No full npm/Windows build PASS is claimed.

## Preservation And Fidelity

- Preservation State: original user screenshot bytes preserved, Core-qualified carrier source unchanged, bounded VS Code host candidate plus targeted tests carried as Workspace material.
- Fidelity Notes: Windows shows a failure on the penultimate package, not proof that the latest product was already accepted or rejected. The latest inspected form batch did not contain this fix.
- Known Losses: no independently recorded `mtimeMs` trace from Windows, no extension host acceptance or timing measurements for the new code.

## Interpretation Limits

- Not Yet Used As: a conclusive finding that every source change is caused by an incomplete ZIP download, Windows acceptance, a release authorization or permission to suppress integrity checks.
- Does Not Prove: that all clipboard/download/antivirus/source mutation sequences are eliminated.
- Must Not Be Treated As: a reason to ignore `tiinex.material.source-changed`, accept stale Carrier material, or bypass Core orientation.
- Need For Review: Sigma tests discovery.latestToIncoming=true with incoming.autoShowPartyHandoff=yes and Auto Refresh enabled; introduce a new carrier by normal download/copy while watcher runs, confirm one Incoming entry and automatic qualified Markdown Preview without Refresh/close; if a transient change still occurs, Refresh should restore Preview without re-Incoming; keep Replace/Accept/Reject blocked on stale bytes. Report exact errors and timing if any.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: LDpIOhWMeo2cx13OPP6-7ktKr_BY7qamywGCpS4Z_2Y