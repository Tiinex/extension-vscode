---
name: tiinex-discovery
description: Inspect the exact Tiinex Core operation catalog before choosing a workflow, or when a request concerns authoring, Move/Rebase, Handoffs, grounding or transport. Discovery does not authorize an action.
---

# Tiinex discovery

1. Use the `tiinex_inspectCapabilities` read-only language model tool with a short intent query. Its output is Core-owned, not a set of automatically executable VS Code tools.
2. Read the resulting operation `safety`, `inputSchemaId`, `hostExecution`, and boundary. An input schema ID alone is **not** a JSON argument contract. If `hostExecution` is `not-qualified`, do not invoke that operation as a VS Code native agent tool.
3. If an actual Handoff Package is provided, read its exact Start instruction first and use the qualified bootstrap/route. A role name, agent name, file name, or chat instruction is not Tiinex holder/transfer authority.
4. Prefer the existing Tiinex user command or exact Core portable CLI capability for actual work, after the corresponding capability/authority is established. Never synthesize a replacement Move/Rebase, schema validator, Handoff package or other host-owned semantic engine.
5. Mutation, confirmation, incoming Replace, source edits, remote writes and publishing all require independent qualification. Declining or blocking is preferable to an invented shortcut.

This packaged skill does not grant tools, Roles, handoffs, or permission to modify workspace files.
