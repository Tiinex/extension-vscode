# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-12 10:51:06
  - Trace: [001-3-6-4-1-3-1-1-1-2-kodax-to-anchor-vs-code-major-003-final-generic-authoring-and-lo.trace.md](001-3-6-4-1-3-1-1-1-2-kodax-to-anchor-vs-code-major-003-final-generic-authoring-and-lo.trace.md)
  - Origin:
    - [relative](001-3-6-4-1-3-1-1-1-2-kodax-to-anchor-vs-code-major-003-final-generic-authoring-and-lo.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-12 11:08:47
  - Authors: Anchor
  - Why: The implementation is reconciled and 79/79 exact-local-Core runtime cases pass, leaving only the dependency-capable full toolchain and Sigma human gate.
  - Summary: Close or falsify VS Code Major 003 through exact-local-Core full validation plus bounded Sigma Windows/main-host UX observations.
  - Status: ready/local

---

# VS Code Major 003 — Sigma Full-Source Live-Host Acceptance

## Objective

Close or falsify the remaining VS Code Major 003 technical/human gate on Sigma's real Windows/main-host environment using the exact current local Core and Extension VS Code source frontier, without npm publishing first-party Tiinex packages or weakening locked third-party dependency requirements.

## Done Criteria

- The exact carried Core source is installed only into a disposable Extension VS Code acceptance harness through the checked-in `test:local-core` path; durable `package.json` and `package-lock.json` remain unchanged.
- `npm run test:local-core -- --core ../core` completes its full `npm run validate` chain using exact locked third-party dev dependencies and returns a ready receipt.
- After the technical gate passes, the linked/main-host extension is rebuilt/reloaded from the exact carried Extension VS Code source.
- Sigma verifies one local artifact Parent/Trace link can be followed through the normal source-backed preview/navigation path.
- Sigma verifies one artifact inside an unopened Incoming carrier can follow a relative Parent/Trace link without unpacking the carrier.
- Sigma verifies generic Artifact Authoring is usable for at least one non-Handoff schema and that Handoff creation uses the same generic surface; Handoff-specific host behavior is limited to optional Attach to Outgoing / route/package presentation.
- Sigma records whether the explicit multi-repository Git Operator materially reduces the old stage → validate → commit-message → review → commit → push friction on one real intended change, without automatic/background push.
- Any blocker/failure is returned exactly; Sigma is not asked to debug implementation source or invent a workaround.

## Scope

Human/host acceptance of the already-implemented VS Code Major 003 only. Small observation evidence may be authored; no new implementation feature tranche is part of this Task.

## Dependencies

- Exact current Extension VS Code Workspace with the final Major 003 source return accepted.
- Exact current Core Workspace through Core Major 007.
- Ordinary network/cache availability for exact locked public third-party dev dependencies if they are not already installed/cached locally.
- Existing linked/main-host VS Code development loop.

## Exclusions

- No npm or Marketplace publication.
- No substitution of different TypeScript / Node typing / VS Code typing versions.
- No Core/Docs semantic mutation.
- No hidden auto-push or background Git mutation.
- No requirement for Sigma to diagnose source code when the gate fails.

## Acceptance Boundary

Major 003 closes only when technical full-toolchain qualification and Sigma's bounded live-host observations both pass. Machine PASS does not substitute for Sigma UX acceptance, and Sigma observation does not substitute for the technical gate.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-3-6-4-1-3-1-1-1-2-kodax-to-anchor-vs-code-major-003-final-generic-authoring-and-lo.trace.md](001-3-6-4-1-3-1-1-1-2-kodax-to-anchor-vs-code-major-003-final-generic-authoring-and-lo.trace.md)
  - Value: I8FUBwLtsmPkY-k6QxUMN84kDUMVzkJAD5a72m1UhKU

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: 6V4xVc-DfuC2Xq68eZQSOFXqCNPDd3JJNEKcmeJigb8