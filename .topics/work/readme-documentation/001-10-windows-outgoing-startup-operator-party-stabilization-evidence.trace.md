# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.evidence.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/core/evidence/tiinex.evidence.v1.schema.md)
  - Created At: 2026-10-08 15:53:12
  - Authors: Anchor
  - Why: Capture a controlled multi-fix batch without confusing local source validation with Windows acceptance.
  - Summary: Bounded Windows failure observations, source-carried host stabilization fixes, exact frames and open release gates.
  - Status: ready/local

---

# Windows Outgoing, Startup, and Operator Party Stabilization Batch

## Supported Claim Or Question

- Supported Claim Or Question: Can the verified host-local causes of unusable Outgoing source selection, Incoming startup blocking, and long Operator Party qualification be addressed as one bounded VS Code stabilisation batch without moving Core/Native semantic authority into the host?
- Evidence Role: Source and host-observation evidence for a pending Windows acceptance rerun; not release acceptance.
- Review Context: Sigma's silent 2026-10-08 Windows video `20261008-1513-16.4133315.mp4` and written, embedded observations; previous Core Evidence Create group-input correction was received and a local Evidence draft was successfully created. The operator requested a wider controlled testing batch and one formal Handoff Package.

## Provenance

- Known Source: Windows recording, original video SHA-256 `ac0fd42d975bc6767c9207454564aeefb46dbf324cc36a6614e920bf337004f9`; the exact carried `vscode` Workspace implementation, tests, and local isolated validation. Video is silent by design; no transcription/audio inference.
- Preservation Basis: exact unchanged JPEG source frames copied from the visual review into `windows-stabilization-media/`, plus the full modified host source files and regression tests carried by the Workspace snapshot.
- Provenance Limits: the video supports operator-visible symptoms and one exact error. It does not measure startup phase duration or prove that candidate code works in installed Windows VS Code. The full 212 MB video is not embedded; source frames and video digest are retained.

## Evidence Material

- Material Kind: Windows observation and host change candidate.
- Material: [Incoming startup feedback frame](windows-stabilization-media/20261008-incoming-startup-feedback.jpg) (SHA-256 `1a95e863af1d271aae8815e8b34fb2508e431a68fdfab62de381fbe9aa066048`). Sigma reports other panels are delayed until Incoming package qualification completes after restart.
- Incoming Scheduling Interpretation: existing `start()` awaited sequential `restoreIncomingQueue()` and per-package review-readiness. Candidate now primes Loading-only cards from persisted paths and qualifies packages in the background, one by one. Ready material is published only after fresh qualification; blocked cases remain closeable, and cancellation/refresh epoch guards prevent stale in-flight restoration from resurrecting removed/replaced entries. Existing persisted review decisions are preserved while other cards load.
- Material 2: [Outgoing blocked frame](windows-stabilization-media/20261008-outgoing-operator-context-blocked.jpg) (SHA-256 `4ca81dfdcbed166c319e87f937fdeebdbda7c2e297783f8a93250bceb1fb24ff`). Windows Outgoing selection reports `tiinex.package-builder.operator-context-blocked` while Incoming match cards remain qualified.
- Outgoing Failure Interpretation: `selectOutgoingWorkspaces` used global `loadLocalWorkspaceChoices()` and could fail with explicit-root Workspace ID ambiguity. Candidate changes it to `loadQualifiedLocalWorkspaceChoices()` — exactly the pre-existing per-root, strict identity path used by Incoming Replace. Existing fail-closed duplicate qualified identity detection is retained.
- Source Candidate: the exact locally carried VS Code source snapshot; the implementation files are identified in the following description.
- Source Change Description: Source paths `src/operatorParty.ts`, `src/core/orderedBoundedMap.ts`, `src/packageBuilder.ts`, `src/vscode/incomingRestoreEntries.ts`, `src/operatorTrees.ts` and the regression file `test/run.mjs`. Independent Core Operator Party and authoring endpoint projections can now run in bounded concurrency (three roots at a time, stable presentation order) instead of strictly sequential; exact source-local Core projection and duplicate-ID checks are retained. Picker adds elapsed-time console diagnostics for local discovery and qualification to support Windows before/after measurement. Multiple host-root endpoint reference requests are likewise split to per-root Core projections, preventing later Handoff/Outgoing authority selection from reverting to combined ambiguous operator context.
- Current Local Verification: isolated behavioral tests passed for stable bounded projection/concurrency, cached queue deduplication and decision preservation, fail-closed source mapping and cancellation guards. All 70 VS Code TypeScript source files parse without syntax error, and `test/run.mjs` carries permanent regression assertions. This is *not* TypeScript typecheck, full npm suite, or installed Windows PASS: `npm ci` was blocked in this container by DNS `EAI_AGAIN` from registry.npmjs.org.

## Preservation And Fidelity

- Preservation State: qualified source material, exact local frames, explicit video digest and bounded test metadata.
- Fidelity Notes: measured wall time on Windows remains unknown; logger gives phases only on actual host. The new backgrounds do not grant trust to queued paths until Core qualifies exact bytes.
- Known Losses: full video not in carrier; no Windows reboot timings, end-to-end `Pack` receipt, UI acceptance or installed VSIX verified yet.

## Interpretation Limits

- Not Yet Used As: Windows host acceptance, fully working Outgoing/Handoff packaging, startup performance guarantee, completed README Task or release authorization.
- Does Not Prove: extension can build in every host, latency threshold is achieved, every 17-root combination is tested, or `Prism` role-currentness is corrected.
- Must Not Be Treated As: authority for a new Core/Native default, a new UX feature, an excuse to bypass qualified Workspace identity or a reason to ship detached patches.
- Need For Review: Sigma runs Incoming Replace → local build → reload. Test Outgoing Blank and selected Parent; choose qualified local source and create Handoff; package via Outgoing and verify pointer and Transport; restart with queued Incoming package to ensure other panels respond before qualification completes; time Pick Operator Party and verify exact Role/Party. Return exact errors/timing/screens if blocked. No release claim before real usage.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: taB0SOPjUDS0FuC_MIwapgZ5pwq6cH2cYNx70Jdj6Vw