# Deterministic VS Code GIF capture runbook

This runbook produces repeatable operator-UX evidence for the Tiinex VS Code extension. It is capture guidance, not release approval. A technically correct recording does not replace the required Sigma Windows observation or any explicit acceptance gate.

## Preconditions

Use the linked development extension from this exact checkout after its normal build/qualification step. Keep commit and push disabled. Use only disposable/test repositories for any landing operation, and begin with an empty dedicated Outgoing folder so filename/no-overwrite behavior is unambiguous.

Prepare two trusted carrier states before recording:

1. one Incoming package whose carried Workspace is byte-for-byte identical to its qualified Local Workspace; and
2. one Incoming package with a small, known Workspace delta and a qualified Handoff that can be attached/forwarded.

Do not place secrets, private repository names, personal paths, tokens, emails or unrelated editor content in the recording.

## Capture baseline

Keep these values unchanged for every take:

- VS Code zoom: `0`.
- Activity Bar visible with **Tiinex** selected.
- Primary Side Bar wide enough that `qualified match` and the projected carrier filename are readable without horizontal scrolling.
- Editor area free of unrelated files and notifications before each clip.
- One theme for the whole set; do not switch theme during a take.
- Pointer location and click order consistent between retakes.
- Export at 12–15 fps. Prefer short clips over speeding up prompts or hiding intermediate state.

If a machine-specific path appears in a picker, crop or retake rather than blurring a path over the Tiinex controls being demonstrated.

## Clip 1 — Display Options

1. Open **Discovery**.
2. Click the single **Display Options** gear.
3. Hold long enough to show the icon, text and checked state for **Files projection**, **Full lineage**, and **Delta only**.
4. Toggle **Delta only** once and confirm.
5. Re-open **Display Options** so the changed checked state is visible.
6. End with the tree visible and no legacy per-option toolbar buttons.

Success evidence: one scalable display control represents the view state instead of separate projection/lineage/delta title buttons.

## Clip 2 — Incoming exact qualified match

1. Open the prepared exact-match package as **Incoming**.
2. Expand the package until the matching Workspace or its `.workspace.zip` row is visible.
3. Hold on the green pass icon and `qualified match` text.
4. Open the row context menu.
5. Hold long enough to show that **Merge** and **Replace** are absent on that exact row.
6. End without mutating the Workspace.

Success evidence: an exact comparison is visible before an operator attempts landing, and no no-op destructive-looking actions are offered on the exact Workspace/archive row.

## Clip 3 — Outgoing Handoff and Pack safety

1. Create or reveal the prepared **Outgoing** context.
2. Select the intended Workspace source and show the canonical projected `.handoff-package.zip` filename on the Outgoing root.
3. Attach the prepared existing Handoff to Outgoing and reveal its attached state.
4. Invoke **Copy Handoff Transport Text** once; do not paste private clipboard contents into the recording.
5. Pack into the empty dedicated Outgoing folder.
6. Hold on the successful output path/receipt long enough to compare the written filename with the projected filename.
7. Attempt the same canonical filename again with intentionally different test payload bytes.
8. Hold on the fail-closed result showing that the existing different ZIP was not silently overwritten.

Success evidence: Handoff forwarding is intentional, the canonical projected name is the written name, and a conflicting existing ZIP survives unchanged.

## Clip 4 — Staging and commit-message ergonomics

Use only a disposable changed Workspace.

1. Execute a qualified Incoming merge with staging enabled and commit/push disabled.
2. Show the landed changes in Source Control already staged by the same merge invocation.
3. Show the trusted pre-filled/copyable Tiinex commit message path without manually staging files first.
4. End before commit or push.

Success evidence: staging is predictable and a useful commit message does not depend on an unnecessary manual staging step.

## Evidence notes

For each retained GIF, record alongside the file (plain text is sufficient): checkout commit/SHA if available, extension version, VS Code version, OS, carrier filename(s), and whether the clip is technical evidence only or has been observed by Sigma on Windows.

Do not mark the Major accepted from GIFs alone. Branding is also not a capture blocker: keep the currently carried extension asset until exact current Tiinex primary-logo bytes are supplied by the qualified organization branding source.
