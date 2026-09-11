# Continuity Context

- Envelope Schema: tiinex.root.v1
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-09 18:11:03
  - Trace: [001-vs-code-handoff-discovery-and-manufacture-minimum.trace.md](../001-vs-code-handoff-discovery-and-manufacture-minimum.trace.md)
  - Origin:
    - [relative](../001-vs-code-handoff-discovery-and-manufacture-minimum.trace.md)
- Current
  - Current Schema: tiinex.evidence.v1
  - Created At: 2026-09-11 10:27:01
  - Authors: Anchor
  - Why: Deliver a source-qualified Pack candidate while preserving Sigma acceptance and release boundaries.
  - Summary: Pointerless filename repair, locked runtime enforcement and collision-safe output; Windows acceptance remains pending.
  - Status: ready/local

---

# VS Code Pack recovery qualification

## Supported Claim Or Question

- Supported Claim Or Question: Does pointerless Pack retain the filename shown in Outgoing, use the locked Core runtime and publish a complete carrier without overwriting unrelated output?
- Evidence Role: Executed regression and package integration evidence for this local source candidate.

## Provenance

- Known Source: Sigma's qualified sixteen-Workspace tiinex-001.handoff-package(1).zip, including the Copilot-assisted VS Code return.
- Preservation Basis: Source restored through Core's qualified Workspace byte provider. Only bounded code and evidence changes are made; historical artifacts and current package declarations are retained.
- Provenance Limits: The previous overnight worktree did not survive into this sandbox. Its logs are previous observations only. This source was reconstructed from the actual input and tested again; it is not claimed byte-identical to the earlier unavailable edits.

## Evidence Material

- Material Kind: Node bridge tests, real package-builder integration, extracted VSIX execution and partial TypeScript checks.
- Material: [Bridge tests](extension-validation.txt), [Package integration](package-integration.txt), [Human test card](../../../../docs/PACK-DOGFOOD.md).
- Bridge Result: 64 of 64 cases passed, including runtime declaration/lock/installed-version drift, safe filenames, collision-safe publication and artifact title extraction.
- Package Result: Four integration scenarios passed through the real extension package builder, portable Core, Git and filesystem. Only VS Code API calls use a test double. The tests check exact output filename, exact Workspace set, pointerless semantics, exact-byte retry, refusal to overwrite different bytes, and an extracted VSIX running its own locked Core entrypoint.
- Root Cause: The pointerless branch of packageOutgoing did not pass expectedCarrierFilename from the Outgoing tree. packageBuilder and the installed Core already accepted the option. Both preview and manufacture results are now checked before output publication.
- Runtime Binding: Both bundled-runtime preparation and VSIX packaging use one shared qualifier. package-lock.json is required and shipped in the VSIX. The root dependency declaration must match the lockfile declaration and installed Core must equal its exact locked version. This is not a substitute for npm package-integrity verification.
- Package Collision: The complete candidate is staged and published using a destination-local hard link with no overwrite. An exact-byte repeat is idempotent. Filesystems without hard-link support fail closed; no claim of Windows execution is made here.
- Presentation: Title extraction skips Continuity Context, the integrity footer and fenced examples. A missing content title falls back to the filename rather than inventing a title.
- TypeScript Result: Newly added host-neutral helpers and changed title/package-argument helpers passed strict type checking using available Node types. All extension JavaScript and source maps were freshly emitted using TypeScript 5.8.3 in emit-only mode. Full checking with the declared TypeScript 5.7.2 and locked VS Code/Node types remains pending.

## Preservation And Fidelity

- Preservation State: The Core dependency declaration remains ^0.7.0 and the supplied lockfile still resolves 0.7.0. No guessed lockfile integrity, registry metadata or package version is inserted.
- Fidelity Notes: Tests used the exact runtime restored from the incoming embedded bootstrap, whose package manifest identifies 0.7.0. npm registry access was unavailable. This does not independently attest that those bytes equal the npm tarball.
- Known Losses: No live Windows VS Code test, full locked-toolchain build, Marketplace release, npm publication or remote push occurred. No replacement-safe node_modules snapshot is carried.

## Interpretation Limits

- Does Not Prove: human acceptance of Handoff creation, endpoint assistance, defaults or automatic settings; final release readiness; hostile-carrier safety; or success on every filesystem.
- Not Yet Used As: permission to disable guards, discard local work, change every dependency to latest or replace Site master with its refactor candidate.
- Must Not Be Treated As: evidence that the Vite problem matcher has been repaired. The reported tiinex-vite definition was not found in the supplied repository task definitions; its actual host/global/generated source remains unresolved.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-vs-code-handoff-discovery-and-manufacture-minimum.trace.md](../001-vs-code-handoff-discovery-and-manufacture-minimum.trace.md)
  - Value: WrR1L02KLX6Hmie0wz1JokOvZvXxPJ0Rz6kvs-1Wmtc

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: WStGlNLaAZdZBON84Y-mwSnbqiW1CXQYkf-9sTpx_Cc