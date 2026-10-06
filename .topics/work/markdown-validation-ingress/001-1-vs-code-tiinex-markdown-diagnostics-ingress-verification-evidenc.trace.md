# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-10-05 23:10:29
  - Trace: [001-vs-code-tiinex-markdown-diagnostics-ingress.trace.md](001-vs-code-tiinex-markdown-diagnostics-ingress.trace.md)
  - Origin:
    - [relative](001-vs-code-tiinex-markdown-diagnostics-ingress.trace.md)
- Current
  - Current Schema: [tiinex.evidence.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/core/evidence/tiinex.evidence.v1.schema.md)
  - Created At: 2026-10-05 23:25:27
  - Authors: Anchor; Sigma
  - Why: Make the host-side resource/noise correction and its exact verification boundary durable in the owning VS Code Workspace.
  - Summary: Record first-line envelope diagnostics gating, exact transport.md false-warning elimination and 149/149 VS Code bridge regression.
  - Status: ready/local

---

# VS Code Tiinex Markdown Diagnostics Ingress Verification Evidence

## Supported Claim Or Question

- Supported Claim Or Question: whether VS Code now excludes ordinary Markdown from Tiinex diagnostics before preparing shared Core runtime/validation while still admitting first-line Tiinex-declared Markdown.
- Evidence Role: bounded host implementation/regression evidence for VS Code Tiinex Markdown Diagnostics Ingress.
- Target Artifact: VS Code Tiinex Markdown Diagnostics Ingress.
- Review Context: real cold-test `transport.md` began with `Handoff package attached.` and received a false Tiinex lineage warning before this correction.

## Provenance

- Known Source: exact user-supplied `tiinex-027.handoff-package.zip` plus exact user-supplied `transport.md` used in the cold grounding test.
- Preservation Basis: VS Code change is limited to a pure first-line Tiinex Markdown classifier, diagnostics ingress use of that classifier, and regression tests; Core remains the validation authority after ingress.
- Provenance Limits: package-integration manufacture is not claimed by this evidence; the standalone integration harness cannot discover a qualified fixture Workspace in this ad hoc local composition and fails before the changed diagnostics path executes.

## Evidence Material

- Material: VS Code source/runtime regression plus exact shared-Core before/after reproduction of the user-supplied non-Tiinex transport Markdown.
- Material Kind: implementation and regression evidence.
- Host Ingress: `.md` and `.markdown` diagnostics eligibility now requires first-line `# Continuity Context` after BOM/whitespace normalization.
- Resource Boundary: ordinary Markdown clears any stale Tiinex diagnostics/snapshot/status and returns before repository-root resolution, permalink resolution, Core runtime preparation, editor assistance, or Quick Fix projection.
- Transition Boundary: changing an open document from Tiinex-marked to ordinary Markdown clears stale diagnostics; changing ordinary Markdown to the first-line marker makes it eligible for normal validation.
- Pure Classifier Regression: direct VS Code helper tests cover valid marker, BOM/CRLF marker, whitespace-tolerant marker, later-only marker, ordinary transport first line and empty input.
- Source-backed Diagnostics Regression: tests verify diagnostics uses `hasTiinexEnvelopeFirstLine(document.lineAt(0).text)` and does not schedule shared runtime work for non-Tiinex Markdown.
- VS Code bridge/runtime regression: 149/149 pass with exit code 0 under the current locally composed Core/Native/OpenAI runtime.
- Shared Core Reproduction: exact `transport.md` changes from one degraded Tiinex document with `portable.lineage-integrity.child-self-unavailable` before the fix to `clean`, zero documents and zero diagnostics after the fix.
- Shared Core full regression: 455 distinct tests pass in intended contexts; Native 7/7 and OpenAI Interop 2/2 also pass.

## Preservation And Fidelity

- Preservation State: all Markdown that declares the Tiinex envelope marker on its first line still enters the existing shared validation path; VS Code does not infer schema validity from the marker.
- Fidelity Notes: the first-line marker is only an ingress classifier. A malformed Tiinex-marked artifact remains eligible and Core still reports its actual schema/integrity/lineage findings.
- Known Losses: non-Tiinex Markdown intentionally receives no Tiinex Problems, Quick Fixes or Tiinex validation status because it is outside the Tiinex artifact domain.

## Interpretation Limits

- Not Yet Used As: release acceptance, extension-host desktop acceptance, Marketplace readiness, package manufacture acceptance, or final P1/Task closure.
- Does Not Prove: every Markdown-related feature outside diagnostics should be envelope-gated; this evidence is specifically about Tiinex artifact validation/diagnostics ingress.
- Must Not Be Treated As: permission to skip validation of a malformed artifact that explicitly starts with the Tiinex envelope marker.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-vs-code-tiinex-markdown-diagnostics-ingress.trace.md](001-vs-code-tiinex-markdown-diagnostics-ingress.trace.md)
  - Value: qaiI3Hrkx2q_r8SV1OILGu83J9TK_962WiI4cQk8o-Q

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: yS8_CQnKnS63Vhg7jZdFsoX6g2E2sCGVzw5D6uNSFws