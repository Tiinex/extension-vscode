# Pack recovery: local acceptance card

This is a bounded test card, not a release announcement. Keep existing work and the previous recovery package until this candidate has been tested.

## Prepare

Land the complete source snapshot into the matching repository. Preserve `.git`, private/ignored files and unrelated uncommitted work. The package does not carry dependencies or the local development junction. Do not change Site's branch or deploy its candidate as part of this test.

From `extension-vscode`, use the supplied manifest and lockfile:

```sh
npm ci
npm test
npm run test:package
```

`npm ci` requires registry access and uses the locked versions; it does not update everything to latest. If the installation fails, stop rather than fabricating a lockfile or disabling runtime qualification.

Rebuild/reload the linked development extension through the existing development task. If it is not already linked, run the existing **Tiinex: Link this checkout** task. For a VSIX installation, build a new candidate with `npm run vsix`; do not assume a previously installed extension has reloaded the changed source.

## Test Pack

Use a trusted package and a new empty outgoing folder. Leave commit and push disabled and do not test destructive landing on your only copy of a repository.

1. Create Outgoing and select the intended Workspaces. Record the complete filename shown on its root row.
2. Pack without attaching a Handoff. The output filename must exactly match the displayed name, including `.handoff-package.zip`.
3. Re-open the new carrier as Incoming. Check that the intended Workspace set is present and no Handoff routes were invented for the pointerless carrier.
4. Pack the same source again to the same destination. Identical bytes may be reused; a different payload must not overwrite an existing package with that filename. Preserve both candidates by choosing a different name or destination when needed.

The fix does not give a presentation filename semantic authority: pointerless carriage remains pointerless even when a label resembles an earlier routed carrier name.

## Still separate

Handoff creation, endpoint selection, defaults and automatic settings have not been accepted by Sigma. The next Anchor should delegate that bounded host work to Kodax. Routed Handoff naming/continuation still uses Core's existing guards and has not gained Windows acceptance from the pointerless integration test.

The reported `tiinex-vite` invalid problem matcher was not found in the supplied repository task definitions. Capture its actual task configuration when it recurs; do not change unrelated repository files based only on repeated task-provider log messages.
