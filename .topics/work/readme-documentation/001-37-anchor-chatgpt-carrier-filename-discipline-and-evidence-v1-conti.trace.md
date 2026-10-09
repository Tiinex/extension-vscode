# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-10-07 19:53:23
  - Trace: [001-vs-code-readme-and-documentation-consolidation.trace.md](001-vs-code-readme-and-documentation-consolidation.trace.md)
  - Origin:
    - [relative](001-vs-code-readme-and-documentation-consolidation.trace.md)
- Current
  - Current Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-10-09 10:06:29
  - Authors: Anchor
  - Why: Eliminate a recurring host-level shortcut that bypassed qualified Tiinex carrier presentation despite correct Core output.
  - Summary: Preserve canonical Core-projected carrier lineage prefixes for ChatGPT downloads; retain Evidence-v1 form changes and deferred Sigma Windows gate.
  - Status: ready/local

---

# Anchor ChatGPT Carrier Filename Discipline And Evidence-v1 Continuation

## Handoff Parties

- Purpose: Restore the visible Tiinex carrier lineage prefix at ChatGPT recipient delivery by preserving the exact Core-projected filename rather than using short manually copied aliases, and retain the already verified Evidence-v1 implementation work and remaining Windows gate.
- From: Anchor
- From Kind: role
- From Reference: [Anchor](business::.topics/roles/001-1-1-1-1-1-anchor-canonical-holder-cutover-role.trace.md)
- To: Anchor
- To Kind: role
- To Reference: [Anchor](business::.topics/roles/001-1-1-1-1-1-anchor-canonical-holder-cutover-role.trace.md)

## Transfers

- preserve-canonical-chatgpt-delivery-identity
  - Transfer Kind: work
  - Description: A local ChatGPT convenience workaround started manually copying qualified `tiinex-031-...` Handoff Package ZIP bytes under names like `Anchor-Evidence-v1-Continuation.handoff-package.zip`. The Core manufacture receipt already gave the canonical `humanOutput.primary.filename` and `primaryOutput.projectedFilename`, and both files are byte-identical. Interop OpenAI ChatGPT Web Target Entry now directs the host to present the exact Core basename; `tools/verify-chatgpt-carrier-download.mjs` fails closed for an alias even when bytes match. A download failure must be reported or retried with the same canonical filename rather than normalized into a short alias. The filename is human-visible transport lineage, not semantic Parent or recipient authority.
  - Controlling Artifact: [VS Code README And Documentation Consolidation](001-vs-code-readme-and-documentation-consolidation.trace.md)
  - Boundary: ChatGPT-specific deliverability and Grounding presentation; Core naming and original carrier bytes remain unchanged

- continue-evidence-v1-windows-gate
  - Transfer Kind: work
  - Description: Preserve the previous Handoff's two Evidence-v1 form fixes (Attach to Form per-material no overwrite, and initial repeatable material hydration), qualified Native/Docs v1 material model and Core roundtrip checks, together with the open full TypeScript build and single combined Sigma Windows review. This host filename correction does not close that separate acceptance gate or implement Move/Rebase.
  - Controlling Artifact: [VS Code README And Documentation Consolidation](001-vs-code-readme-and-documentation-consolidation.trace.md)
  - Boundary: no new Evidence schema version, no Windows PASS claim

## Required Context

- chatgpt-carrier-download-drift-evidence
  - Material: Sigma's exact download-history screenshot, canonical manufacture receipt/file SHA proof, ChatGPT Target Entry update and executable alias-rejection test
  - Material Reference: [ChatGPT Canonical Carrier Filename Drift And Host Download Guard](interop-openai::.topics/work/host-observations/002-chatgpt-canonical-carrier-filename-drift-and-host-download-guard.trace.md)
  - Purpose: preserve why replacing correct Tiinex filenames with short download aliases is a host delivery regression, not a Core lineage bug
  - Availability: available

- prior-evidence-v1-owner-handoff
  - Material: existing Evidence-v1 form-fidelity corrections, Core/Native schema qualification and pending Windows acceptance limits
  - Material Reference: [Anchor Evidence-v1 Material Attachment Fidelity And Windows Gate Continuation](001-36-anchor-evidence-v1-material-attachment-fidelity-and-windows-gate.trace.md)
  - Purpose: carry forward existing bounded work without reopening unrelated maintenance
  - Availability: available

## Reference Context

- chatgpt-web-target-entry
  - Material: existing host-specific target adaptation with newly explicit canonical download basename check
  - Material Reference: [ChatGPT Web Target Entry](interop-openai::.topics/.entries/where/chatgpt-web/001-chatgpt-web-target-entry.trace.md)
  - Purpose: host-specific presentation rather than portable Tiinex semantics
  - Availability: available

## Retained Responsibilities

- final-evidence-windows-gate
  - Retained By: Anchor
  - Responsibility: full dependency-backed VS Code build and Sigma Windows test remain pending. The next Anchor must use only Core's projected canonical filenames for delivery, especially if a browser download fails. The Interop OpenAI verifier is a host-side pre-link check, not a replacement for carrier qualification.
  - Boundary: do not infer acceptance, performance or platform downloading guarantees from the current Linux tests

## Exclusions And Dependencies

- no-carrier-authority-confusion
  - Kind: excluded-scope
  - Description: This fix is not a new Core naming rule or file rename operation. Do not use ZIP filenames as semantic authority, do not create aliases as a download workaround, do not change carrier lineage or route selection, do not rewrite canonical package bytes, and do not fold the separate Move/Rebase branch into Evidence-v1.
  - Responsible Party Or Role: Anchor

## Completion Expectation

- Signal Kind: disposition
- Signal Meaning: A future Anchor cold-grounds from this exact carrier, retains the Interop OpenAI filename guard and 4/4 host tests and resumes the prior Evidence-v1 Windows acceptance plan. Any newly delivered carrier must keep its Tooling-projected `tiinex-<dimension>-<from>-to-<to>.handoff-package.zip` basename even when Host UI prefers a shorter display label.
- Return To: Anchor
- Return To Reference: [Anchor](business::.topics/roles/001-1-1-1-1-1-anchor-canonical-holder-cutover-role.trace.md)

## Interpretation Limits

- Does Not Mean: Windows Evidence-v1 PASS, release authorization, a browser's own download-renaming behavior is controllable, or Handoff acceptance simply because a filename matches.
- Must Not Be Used To Claim: carrier lineage is inferred from the filename rather than Core's qualified carrier metadata.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-vs-code-readme-and-documentation-consolidation.trace.md](001-vs-code-readme-and-documentation-consolidation.trace.md)
  - Value: P9l0JbWGxC5NqesjDRJwSr-zcOGkm_B44j4pS9wffdI

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: ZIl3-CEBycHnWUf9LXt0NJkAfJHwpUurOv5aiusy1TE