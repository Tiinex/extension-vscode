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
  - Created At: 2026-09-09 19:31:55
  - Authors: Anchor
  - Why: Sigma wants received work to become immediately readable in VS Code after unpacking without manually following carrier pointers.
  - Summary: Filter qualified received Handoffs by optional operator role text and open the real Handoff artifacts, not pointers.
  - Status: ready/local

---

# Recipient-role Handoff opening after receive

## Objective

After selected Workspace landings finish, surface the actual qualified Handoff artifacts relevant to the operator without opening transport pointer files.

## Done Criteria

- A free-text VS Code setting records the operator role label, for example `Sigma`.
- Qualified Handoff routes/leaves from the received package are discovered through Tiinex Tooling projections.
- When the configured role matches Handoff endpoint labels, matching Handoff artifacts are preferred; when none match, all qualified Handoff artifacts remain available.
- The resolved Handoff artifacts are opened from their landed Workspace roots as VS Code tabs.
- Markdown Handoffs open in Markdown preview where supported.
- Handoff pointer files are never opened as the operator artifact.

## Scope

`extension-vscode` recipient filtering, post-landing artifact resolution, and VS Code editor/Markdown-preview presentation.

## Dependencies

- Parent VS Code Handoff discovery/manufacture minimum Task.
- Qualified received Handoff routes/grounding receipts.
- Landed Workspace root mapping from the Receive flow.

## Boundary

Role text is a presentation/filter preference only. It does not create Role authority, holder binding, Handoff acceptance, or semantic qualification.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-vs-code-handoff-discovery-and-manufacture-minimum.trace.md](../001-vs-code-handoff-discovery-and-manufacture-minimum.trace.md)
  - Value: WrR1L02KLX6Hmie0wz1JokOvZvXxPJ0Rz6kvs-1Wmtc

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: AfVyceWyTEuY4eX4T0IwGEAFdOLAf42NlJXTBI1cVy0