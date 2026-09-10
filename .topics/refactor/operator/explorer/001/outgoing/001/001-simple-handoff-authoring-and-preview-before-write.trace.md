# Continuity Context

- Envelope Schema: tiinex.root.v1
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-10 00:05:18
  - Trace: [001-live-outgoing-context.trace.md](../001-live-outgoing-context.trace.md)
  - Origin:
    - [relative](../001-live-outgoing-context.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-10 00:05:18
  - Authors: Anchor
  - Why: Sigma wants LLM-like Handoff creation without filling the raw schema form and wants to inspect the trace artifact before it touches repository disk.
  - Summary: Role-aware bounded Handoff drafting with participants and virtual Markdown review before disk write.
  - Status: ready/local

---

# Simple Handoff authoring and preview-before-write

## Objective

Give the operator LLM-like Handoff authoring capability through a few bounded decisions rather than a raw schema form.

## Done Criteria

- A Workspace-level native action can prepare a new Handoff with a short subject and intent including Discussion, Continue, Review, Blocked and Complete.
- From prefers the configured operator Role when resolvable, without inventing authority when it is not represented.
- To prefers the Incoming route From Role for a From-Incoming return when unambiguous.
- Role/identity choices show only the latest current Role artifact per label, with package-carried endpoint Role cache as fallback when the owning Workspace is absent.
- Additional Role participants can be selected separately from the exactly-one From and exactly-one To endpoints and remain non-authoritative grounding context.
- Shared Tiinex Tooling creates the Handoff Markdown in scratch material first.
- The resulting `.trace.md` can be opened in Markdown preview before any repository file is written.
- Writing reviewed bytes is a separate explicit action.

## Scope

`extension-vscode` simple Handoff choice UI, scratch preview bridge, explicit reviewed write and tests only.

## Dependencies

Parent live Outgoing context Task and public shared Tiinex Handoff authoring operations.

## Boundary

The extension supplies operator choices and presentation; shared Tooling remains Handoff schema/path/integrity authority. Pointer authoring remains package routing rather than free-form pointer editing.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-live-outgoing-context.trace.md](../001-live-outgoing-context.trace.md)
  - Value: eYrk3i4MIAvJqwP2pQdyY_SupL_TElaBGoKc_ejGgd0

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: MGAICm2vZZoN-xwbhAEt6NWhvb4axFz_XO-n7A_Uv4U