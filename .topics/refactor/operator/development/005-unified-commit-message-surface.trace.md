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
  - Created At: 2026-09-10 00:08:31
  - Authors: Anchor
  - Why: Sigma identified repo-specific commit-message tasks as high-maintenance and wants one reusable extension capability instead.
  - Summary: Future VS Code-native commit-message action replaces per-repository tasks.json fanout.
  - Status: ready/local

---

# Unified commit-message surface without repo-specific task fanout

## Objective

Replace high-maintenance per-repository `tasks.json` commit-message entries with one reusable VS Code-native commit-message capability.

## Done Criteria

- Commit-message generation is exposed through one shared extension action rather than one task per repository.
- The action operates on an explicitly selected/current Git repository and its staged changes.
- Receive can reuse the same presentation surface for copy/prefill without executing landed repository-local code implicitly.
- Existing repository-specific task fanout can be removed once equivalent operator capability is proven.

## Scope

Future `extension-vscode` Git/operator presentation and task cleanup only.

## Dependencies

Existing explicit Tiinex commit-message command, Source Control integration and Receive staging safeguards.

## Boundary

Do not change shared commit-message semantics or reintroduce implicit post-landing code execution.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-vs-code-handoff-discovery-and-manufacture-minimum.trace.md](../001-vs-code-handoff-discovery-and-manufacture-minimum.trace.md)
  - Value: WrR1L02KLX6Hmie0wz1JokOvZvXxPJ0Rz6kvs-1Wmtc

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: 5B7BedeOY13HDAJteV2nwmpFNt7_N2kAnHLuSPy35mc