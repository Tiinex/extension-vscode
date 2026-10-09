# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-10-09 10:32:11
  - Trace: [001-vs-code-native-agent-tools-and-generated-customizations-adapter.trace.md](001-vs-code-native-agent-tools-and-generated-customizations-adapter.trace.md)
  - Origin:
    - [relative](001-vs-code-native-agent-tools-and-generated-customizations-adapter.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-10-09 10:40:01
  - Authors: Anchor
  - Why: Copilot pre-prompts and custom agent files cannot alone enforce Tiinex Role, Handoff or selected Process gates.
  - Summary: VS Code host adapter for qualified Tiinex recipient grounding, per-operation checks and harness-specific session hooks.
  - Status: ready/local

---

# Copilot Grounding Bootstrap And Harness-Specific Process Enforcement

## Objective

Provide Copilot in VS Code the same qualified Core grounding *opportunity* as a fresh Tiinex CLI/bootstrap recipient, without depending on the ordering or content of Copilot pre-prompts. Generated custom agents and skills guide discovery; Core's structured receipts and authorization gates remain authoritative.

## Qualified Starting Point

- `contributes.languageModelTools` and `vscode.lm.registerTool` register tools; `modelDescription` controls when Copilot may choose to call one. Automatic tool invocation is model-directed and not guaranteed by an `.agent.md` file.
- `.agent.md`, extension `contributes.chatAgents`, generated `SKILL.md`, and extension `contributes.chatSkills` help scope agent discovery, tools and workflows. They do not automatically bind a Tiinex Role or activate Process guidance.
- VS Code `Local`, `Copilot Agent Host` and other harnesses have materially different hook semantics. Local `SessionStart`, `UserPromptSubmit`, `PreToolUse` and Copilot SDK / CLI equivalents must use their documented event schemas and be verified independently. Hooks are defense-in-depth where enabled, not a universal enforcement or a guarantee across providers.
- Consumes Core `Portable Agent Grounding Session And Process-Recheck Gate` and `Portable Agent Capability Projection And Synchronization Contract`; no VS Code-hosted Process engine.

## Scope

- VS Code-owned Copilot Native Agent Tool adapter, optional host-specific hooks, generated grounding workflow skill, and presentation of Core-produced grounding receipts. No independent Process meaning or runtime authority is established by this layer.

## Host Design

- Contribute one discoverable read-only Tiinex grounding/bootstrap tool whose description clearly says to run it when beginning Tiinex work or entering a new Handoff/Workspace. A narrow, generated `tiinex-ground-work` workflow skill instructs Copilot to select the exact carrier and route, resolve Role binding, request Core `ground --recipient` equivalence, and read bounded Required Context and Process guidance.
- The generated `.agent.md` points to this tool and to the actual Role source; it provides concise *instructions*, not a giant copied Process text or blanket grants. It must not silently choose a carrier, selected Process or active step from a visible file name.
- For hosts where session lifecycle hooks are supported and permitted, use `SessionStart` / `userPromptSubmitted` equivalent for soft bootstrap reminders or narrow context injection, and verified `PreToolUse` for supplementary gating. Do not assume Copilot Agent Host loads the same agent-scoped Local hooks or that all hook outputs are honored.
- Every Tiinex **mutating extension tool invocation** must invoke the portable Core grounding/operation preflight inside its implementation before delegating to apply. Missing/expired receipt, revoked selected guidance or undecidable active step returns a clear blocking finding and next action. The agent's `tools` frontmatter list cannot grant authority.
- A generic Copilot agent retains other built-in shell/edit capabilities that a Tiinex extension cannot necessarily gate. Never claim unconditional enforcement across unrelated tools. Evaluate harness-specific hooks separately where stronger protection is required and mark unsupported harnesses as partial parity.
- On Workspace switch, source hash drift, context compaction/agent delegation or new turn, trigger requalification or ask for exact route/source selection. If no session-bound event identity is available, recheck per action and do not cache write permission.
- UX should expose the current grounding receipt, source, active/unresolved Process guidance and safe next operation without filling the chat with unrelated raw documentation. Handle permission denial, unsupported hook, unavailable tool and untrusted workspace explicitly.
- Keep VS Code Native agent tools separate from a future MCP adapter repo; do not expose duplicate tool identities in a single Copilot setup by default.

## Acceptance

- Fresh Copilot with only the extension and a selected Role can find the grounding tool, orient the exact carrier, ground the selected Handoff and consume the same verified Required Context/Process qualification as the CLI bootstrap. Test with **identical carrier and route** and compare structured source/authority projections.
- On a follow-up message which changes Process path or revokes previous activity, the agent must be challenged before the next Tiinex mutation. Deliberate `apply` bypass of grounding must be rejected by the extension tool Core gate even if Copilot ignores the `.agent.md` or the hook.
- Confirm behavior under Copilot Agent Host and Local harness separately; don't mark remote or provider-specific harness parity without live tests. Check agent/skill discovery positive and negative prompts, disabled tools, untrusted workspace, selected Role mismatch, source drift, interrupted session, and compaction.
- Validate generated custom-agent frontmatter merge independently per the existing VS Code agent customization Task. No user frontmatter values should disappear, and no local overrides can widen Core-granted capabilities.

## Out Of Scope

- Automatic universal control of all Copilot editor/terminal tools; replacement of Copilot pre-prompts; a separate MCP server bundled in the extension; manual Process execution decisions inferred from heuristics; modifying Move/Rebase or Evidence semantics.

## Dependencies

- Qualified Core gateway Task and Core agent capability projection Task; VS Code native agent adapter Task; official host API/hook compatibility verified against actual chosen harness.

## Done Criteria

- One end-to-end Windows acceptance proves read-only bootstrap grounding parity and fail-closed Tiinex apply behavior across changed user turns and stale sources. Unsupported wider host-tool policies are explicitly documented rather than reported as enforced.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-vs-code-native-agent-tools-and-generated-customizations-adapter.trace.md](001-vs-code-native-agent-tools-and-generated-customizations-adapter.trace.md)
  - Value: svhEnJIUfQCDjAzNNR1lmR1O8q8x7kJl1QmhLuy4-xc

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: I4ionGFyL9LM4BP09bF2p9mYG-sgAbKaLHTy9ZRAejQ