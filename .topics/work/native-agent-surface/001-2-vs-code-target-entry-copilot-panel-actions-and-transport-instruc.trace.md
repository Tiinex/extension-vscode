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
  - Created At: 2026-10-09 11:04:01
  - Authors: Anchor
  - Why: Bound Copilot panel delegation without impairing ordinary authoring, and render host-specific human transport instructions
  - Summary: Three levels restricted to native agent invocation of operator panel actions, with a VS Code Target Entry and transient Markdown transport receipt.
  - Status: ready/local

---

# VS Code Target Entry, Copilot Panel Actions And Transport Instruction Tab

## Objective

Supply host-owned VS Code/Copilot transport differences through a qualified Target Entry and optional host Process, expose three operator-chosen Copilot access levels for Tiinex panel actions only, and show a transient Markdown instruction tab on transport completion instead of relying exclusively on a toast and clipboard.

## Critical Boundary: Panel Actions, Not Ordinary Tooling

- The user explicitly scopes levels to **Copilot's delegation of Tiinex panel actions**. Never gate ordinary authoring, artifact creation, schema/Transition discovery, general Core CLI, standalone `ground`, Move/Rebase tooling not invoked as an operator panel action, or the human's ordinary panels merely because the Copilot panel-action setting is `None`.
- `None` (default): no delegated panel action. Normal read-only Core grounding/context and passive operator-state notification remain available through separate read-only projections; notification is not a panel action or grant.
- `Pack and Transport`: delegated outgoing source selection, plan/preview, pack and transport preparation/copy/presentation, subject to all preexisting Core qualification and host confirmation. No Incoming unpack/landing privileges.
- `Inspect, Unpack, Pack and Transport`: adds incoming carrier inspection/preview and safe unpack to disposable/staged storage; it does not implicitly add Merge/Replace, Reject, delete/prune, Git reset, source overwrite or remote send. Those remain operator-owned with separate explicit review and confirmation.
- This setting never asserts system-security isolation against a Copilot agent with unrestricted OS filesystem/terminal privileges. It controls only the Tiinex **native agent tool adapter's** delegated panel surface, evaluated at every invocation; no agent-exposed tool may flip its own setting. CLI commands remain available under their own existing safety gates; do not install a global Core permission check for ordinary authoring.

## Host-Owned Target Entry And Guidance

- Create a qualified VS Code Copilot Target Entry using existing `tiinex.entry.target.v1` in the correct host-owning Workspace `.topics/.entries/where/...` surface, analogous to ChatGPT Web's separate Target Entry. Do not create a new v2 contract, a duplicate universal Entry or an MCP server embedded in VS Code.
- Target describes local vs Agent Host capability observations, attachment/clipboard/open-tab interactions, Copilot session/role distinctions, Workspace Trust, pre-prompt limits and the three panel-action levels. Link host-specific step material via Target Material `Reference` and `Purpose`; qualify each material's own applicability. Attached Handoff content never automatically changes the agent's bound Role.
- A Target Entry supplies only environment adaptation. It cannot grant recipient authority, execute a Process, mark completion or reassign a Role.

## Transport Completion UX

- Consume Core's read-only completed-transport projection and show a fresh transient Markdown tab/editor/preview for **all** successful transport paths (ordinary pack, Guided Entry, route copy and pointerless transfer), containing exact canonical carrier basename, transport-ready text, actual clipboard status, what/where Entry source and qualified host-specific operator next steps.
- Preserve clipboard text byte-for-byte. Never automatically rename the package, invent a target-specific instruction or auto-send it to a remote model/service. A modal/informational toast is not the primary guidance surface; failures/warnings may still use notifications.
- For zero, one, or multiple Handoff routes, instruct correct route selection rather than selecting an arbitrary primary recipient; unchanged carrier bytes and exact route pointers remain preserved.
- Reuse the same presenter across package and Transport paths through a separate small host component, not more domain decision logic inside `operatorTrees.ts`.

## Verification And Integration

- Classify every **agent-exposed** panel tool explicitly; deny unknown/new actions until mapped, and prove None/Pack/Full outcomes while the human panel remains unaffected. Reject impersonation via caller-provided `isHuman` or `accessLevel` parameters; read the real setting in the adapter on each tool call.
- Test a third-party agent with full OS access as an explicit **limitation**, not falsely call the setting a security sandbox. UI tool consent is not Tiinex Role authority.
- Qualify `Target Entry` through Core `project-workspace-carrier-entry`, show exact material identity in the Markdown result, preserve frontmatter/Role customizations and verify Local/Agent Host behavior separately.
- Test all outgoing paths, 0/1/multiple routes, clipboard success/failure, nonportable target, missing/ambiguous Target Entry, user cancellation, exact filename continuity and generated Markdown validity. A real extension-host Windows acceptance remains separately required.

## Dependencies And Exclusions

- Depends on Core Target-Guided Transport Completion Projection Task, existing portable agent capability projection, and existing VS Code Native Agent Tools Task.
- No second `operatorTrees` semantics engine, no MCP in VS Code repo, no global author permission modes, no silent Incoming Replace, and no claim that Copilot pre-prompts are security boundaries.

## Scope

- VS Code Target Entry host adaptation, native agent-only panel-action delegation policy and transient transport instruction tab, with no ordinary authoring restriction.

## Dependencies

- Core portable receipt projection, existing VS Code Native Agent Tools Task, Native Target Entry schema and Core-grounded current Role separation.

## Done Criteria

- Exactly three agent-delegated **panel-action** levels operate as documented, default None, with no impact on ordinary Core authoring or human panel commands; target-specific transport receipt opens in Markdown on every qualified route, while clipboard bytes and canonical package basename remain unchanged; tests include hostile/stale/unknown scenarios and Windows host gate remains explicit.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-vs-code-native-agent-tools-and-generated-customizations-adapter.trace.md](001-vs-code-native-agent-tools-and-generated-customizations-adapter.trace.md)
  - Value: svhEnJIUfQCDjAzNNR1lmR1O8q8x7kJl1QmhLuy4-xc

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: DKyVPR1zgEuNVD3LVQ9WnxDmLt8zM4c7NewYJg-LH2A