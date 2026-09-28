# Changelog

All notable user-visible changes to Tiinex for VS Code are documented here.

## Unreleased

### Fixed

- Kept Outgoing and Incoming Handoff pointer presentation aligned without creating a VS Code-side semantic resolver.
- Made Leaves / Full Lineage control artifact membership only; pointer/reference detail expansion no longer depends on lineage mode.
- Corrected the Exclude Handoff Route and Detach Handoff action icons for the VS Code 1.95 codicon set.
- Removed a duplicate Cancel action from the Workspace-source confirmation dialog.
- Made Reveal Package open the containing folder for external carrier ZIPs on Windows instead of navigating into the ZIP shell folder.

### Improved

- Added Marketplace-oriented manifest metadata, publication hygiene, and release auditing.
- Reworked the README around installation, operator workflows, safety boundaries, settings, and release readiness.

## 0.1.7

- Qualified native Handoff authoring with separate Title and optional Slug semantics.
- Added native 0..n additional participant Role selection backed by Core qualification.
- Fixed Transport route qualification to use Core-owned route identity.
- Added exact Outgoing carrier preview and physical pointer target expansion.
