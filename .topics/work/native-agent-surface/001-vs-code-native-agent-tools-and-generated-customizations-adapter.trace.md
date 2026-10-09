# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-10-09 10:32:11
  - Authors: Anchor
  - Why: Make Copilot discover qualified Tiinex skills at the right time and preserve human-edited agent settings.
  - Summary: VS Code adapter from Core projection to agent tools, skills and agents with preserving local frontmatter and no embedded MCP.
  - Status: ready/local

---

# VS Code Native Agent Tools And Generated Customizations Adapter

## Objective

Build a thin VS Code extension adapter consuming a Core-owned portable agent capability projection. It must enable Copilot to discover the correct Tiinex operation at the moment of need without competing runtime semantics. Keep this under the VS Code repository, never an in-extension MCP server.

## Owner Boundaries

- Core is authoritative for semantic operation names/contracts, safety, plan/apply/recovery, Role qualification and source fingerprints. VS Code owns languageModelTools registration, host file/editor selection, confirmation presentation, extension package contribution entries, and optional workspace export UX.
- Native owns Role schema and Transition semantics; Business owns concrete Role artifacts. VS Code cannot copy free-text Role into `tools`, `handoffs` or `model` and call those fields authorized.
- MCP stays a separate repository/adapter consuming Core; do not register duplicate MCP tools in VS Code.

## Host Packaging (Documentation Verified October 2026)

- `contributes.languageModelTools` with unique `{verb}_{noun}` names, `modelDescription`, `inputSchema`, `canBeReferencedInPrompt`, optional `when` and `vscode.lm.registerTool` runtime implementation. `prepareInvocation` explains/asks user to confirm material action; `invoke` calls qualified Core operation and returns errors that preserve machine-readable Core finding and next action. Ref: https://code.visualstudio.com/api/extension-guides/ai/tools
- `contributes.chatSkills` points at extension-packaged `skills/<workflow>/SKILL.md`. Skill name matches its directory; the description covers exact intent and when to use; source operation IDs are referenced in instructions. Use focused workflow skills such as `tiinex-author-artifact`, `tiinex-move-lineage` and `tiinex-handoff-transport` only when needed, not a skill file for each low-level tool. Ref: https://code.visualstudio.com/docs/agent-customization/agent-skills
- `contributes.chatAgents` points at packaged `agents/<role>.agent.md`; or optional workspace `/.github/agents/<role>.agent.md` output. Never emit the same named agent in both channels by default. Ref: https://code.visualstudio.com/api/references/contribution-points and https://code.visualstudio.com/docs/agent-customization/custom-agents
- `.github/copilot-instructions.md` or `AGENTS.md` is optional concise general grounding, not an indiscriminate copy of Role material or thousands of operation instructions.

## Frontmatter-Preserving Sync

- User may edit VS Code agent frontmatter such as `model`, `tools`, `handoffs`, `name`, `description`, `user-invocable`, and future unknown fields. Plan/diff/apply must preserve user-owned YAML AST nodes, comments and ordering where practical, adding only missing generated defaults.
- Generated body is delimited by explicit ownership markers and carries an exact source-fingerprint reference. No destructive full-file overwrite. A manifest/receipt retains base projection hash so 3-way merge can detect concurrent edits; manual body sections remain untouched.
- If a manual frontmatter override conflicts with qualifying Role authorizations or host availability, warn/block rather than discard edits or silently widen privileges. An obsolete generated agent or skill is only reported, not automatically deleted.
- Generate `package.json` contribution entries in the build pipeline with deterministic stable ids and validate they match qualified operation/agent/skill output; never let runtime silently register undeclared tools.

## Acceptance / Discovery

- Test Copilot automatic tool choice (appropriate and inappropriate scenarios), skill retrieval at right user task, explicit `/skill` invocation, agent loading, source-linked Role material and safe tool confirmation under VS Code.
- Tests use actual VS Code extension host where available, not only regex snapshots of source. Check tool registration mismatch, disabled tools, untrusted workspace, unavailable Core operation, permission denial, interrupted operation, stale schema/Role hash and recovery receipts.
- Confirm no duplicate tools are exposed through an embedded MCP route, no duplicated agents from extension and workspace projections, and no hidden dependency on VS Code profile location settings deprecated for Copilot Agent Host.

## Dependency

- Requires Core portable agent capability projection and synchronization/merge plan from the Core-owned Task; Move/Rebase should remain the currently active implementation focus. A future independent MCP Task may consume the same contract after CLI parity.

## Exclusions

- No VS Code domain-specific Move/Rebase executor, no agent auth/Role assignment inference, no direct writes to canonical Role artifacts, no automatic remote installation or tool access widening.

## Scope

- VS Code host-specific API registration, packaged skills/agents and optional workspace synchronization UX. Only Core-qualified operations and Role boundaries are rendered.

## Dependencies

- Core `Portable Agent Capability Projection And Synchronization Contract` Task in `.topics/work/portable-agent-surfaces`. This must not become an alternate Core or Native schema registry. Real VS Code compatibility and version gates apply.

## Done Criteria

- Extension package generation and native tool registration match Core; role-derived agent files can be synchronized without destroying frontmatter edits; UI safely reports conflicts, duplication and unsupported privileges; Copilot auto-chooses appropriate tools/skills in representative prompts and fails safely for unrelated prompts; same CLI/host receipts verified. No embedded MCP adapter.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: svhEnJIUfQCDjAzNNR1lmR1O8q8x7kJl1QmhLuy4-xc