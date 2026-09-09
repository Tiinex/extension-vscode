# Continuity Context

- Envelope Schema: tiinex.root.v1
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-09 18:11:03
  - Trace: [001-vs-code-handoff-discovery-and-manufacture-minimum.trace.md](../001-vs-code-handoff-discovery-and-manufacture-minimum.trace.md)
  - Origin:
    - [relative](../001-vs-code-handoff-discovery-and-manufacture-minimum.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-09 20:43:44
  - Authors: Anchor
  - Why: Refactor Anchor identified package-supplied bootstrap execution as a release-hardening boundary beyond the trusted Sigma fixture gate.
  - Summary: Defer broad-release ingress hardening so untrusted carriers are preflighted before embedded bootstrap execution.
  - Status: ready/local

---

# Trusted carrier preflight before package bootstrap execution

## Objective

Define and implement a trusted VS Code-side preflight boundary for untrusted Handoff carriers before any package-supplied bootstrap code is executed.

## Done Criteria

- Carrier structure and bootstrap declaration are inspected through trusted installed/bundled Tooling before package-supplied runtime execution.
- Packages that fail the trusted preflight cannot execute their embedded bootstrap.
- Exact cold-start/bootstrap semantics remain compatible with qualified Tiinex carriers.
- Regression coverage distinguishes trusted preflight from later package-supplied execution.

## Scope

`extension-vscode` Receive ingress hardening only.

## Dependencies

- Parent VS Code Handoff discovery and manufacture minimum Task.
- Existing package bootstrap qualification contract from shared Tooling.

## Boundary

Deferred broad-release hardening. No Core/Docs/Business mutation and no change to the five blockers required before Sigma's trusted-fixture test.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-vs-code-handoff-discovery-and-manufacture-minimum.trace.md](../001-vs-code-handoff-discovery-and-manufacture-minimum.trace.md)
  - Value: WrR1L02KLX6Hmie0wz1JokOvZvXxPJ0Rz6kvs-1Wmtc

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: 0lGWhVB5GV0WqJCaDEIsNkMim9ymqPL3tMJsnX76szA