const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs/promises');
const path = require('node:path');
const vscode = require('vscode');

async function run() {
  const extension = vscode.extensions.getExtension('tiinex.tiinex-vscode');
  assert.ok(extension, 'Tiinex extension must be available in the real Extension Host');
  await extension.activate();

  const mode = String(process.env.TIINEX_EXTENSION_HOST_ACCEPTANCE_MODE || '');
  const restart = Number(process.env.TIINEX_EXTENSION_HOST_ACCEPTANCE_RESTART || 0);
  const fixturePackage = path.resolve(String(process.env.TIINEX_EXTENSION_HOST_FIXTURE_PACKAGE || ''));
  const fixtureManifestPath = path.resolve(String(process.env.TIINEX_EXTENSION_HOST_FIXTURE_MANIFEST || ''));
  const outputDir = path.resolve(String(process.env.TIINEX_EXTENSION_HOST_OUTPUT_DIR || ''));
  const workspaceRoot = path.resolve(String(process.env.TIINEX_EXTENSION_HOST_WORKSPACE_ROOT || ''));
  assert.ok(mode === 'local' || mode === 'published', `unexpected acceptance mode: ${mode}`);
  assert.ok(restart >= 1, `unexpected restart: ${restart}`);
  assert.ok(fixturePackage && fixtureManifestPath && outputDir && workspaceRoot, 'fixture paths must be supplied by the repository-owned runner');

  const manifest = JSON.parse(await fs.readFile(fixtureManifestPath, 'utf8'));
  assert.equal(await sha256File(fixturePackage), manifest.package.sha256, 'fixture package SHA-256 must match the pinned manifest');
  const commands = await vscode.commands.getCommands(true);
  for (const command of [
    'tiinex.discovery.setIncoming', 'tiinex.incoming.replace', 'tiinex.outgoing.new', 'tiinex.outgoing.attachHandoff',
    'tiinex.outgoing.package', 'tiinex.transport.send', 'tiinex.transport.refresh',
    'tiinex.acceptance.configure', 'tiinex.acceptance.snapshot', 'tiinex.acceptance.endpointCatalog', 'tiinex.acceptance.workspaceCatalog',
    'tiinex.acceptance.authorHandoff', 'tiinex.acceptance.corruptParticipantSnapshot'
  ]) assert.ok(commands.includes(command), `${command} must be registered in Extension Host`);
  assert.equal(commands.includes('tiinex.outgoing.removeParticipantPointer'), false, 'participant weakening command must not exist');

  const dependencyState = JSON.parse(await fs.readFile(path.join(extension.extensionPath, '.vscode', 'link', 'dependency-mode.json'), 'utf8'));
  assert.equal(dependencyState.mode, mode, 'Extension Host must see the requested Core dependency mode');

  await vscode.commands.executeCommand('tiinex.acceptance.configure', {
    incomingPackagePath: fixturePackage,
    outgoingFolder: outputDir,
    outgoingWorkspaceId: manifest.workspaceId,
    participantSelection: 'exact',
    additionalParticipantReferences: []
  });

  if (restart === 1) await firstHostRun({ manifest, fixturePackage, outputDir, workspaceRoot });
  else await restartHostRun({ manifest, fixturePackage });

  const finalSnapshot = await vscode.commands.executeCommand('tiinex.acceptance.snapshot');
  console.log(JSON.stringify({
    status: 'ready', mode, restart,
    incoming: finalSnapshot.incoming.length,
    transport: finalSnapshot.transport.map((item) => ({ filename: item.filename, routeCount: item.routes.length })),
    eventTypes: finalSnapshot.events.map((item) => item.type)
  }));
}

async function firstHostRun({ manifest, fixturePackage, workspaceRoot }) {
  await vscode.commands.executeCommand('tiinex.discovery.setIncoming', { data: { packagePath: fixturePackage } });
  let snapshot = await vscode.commands.executeCommand('tiinex.acceptance.snapshot');
  assert.equal(snapshot.incoming.length, 1, 'fixture carrier must enter Incoming through the registered command');
  assert.deepEqual(snapshot.incoming[0].workspaceIds, [manifest.workspaceId]);
  assert.equal(snapshot.incoming[0].routeCount, 0, 'fixture Incoming must be a qualified pointerless Workspace carrier');

  await vscode.commands.executeCommand('tiinex.transport.send', { data: { packagePath: fixturePackage } });
  snapshot = await vscode.commands.executeCommand('tiinex.acceptance.snapshot');
  const pointerless = findTransport(snapshot, fixturePackage);
  assert.ok(pointerless, 'pointerless Incoming carrier must qualify into Transport through the registered command');
  assert.equal(pointerless.routes.length, 0, 'pointerless Workspace carrier must expose no synthetic Handoff route');
  assert.equal(String(pointerless.genericTransportText || '').includes('Continue from'), false, 'pointerless Workspace carrier must expose no synthetic Handoff Continue from text');

  await fs.writeFile(path.join(workspaceRoot, 'landing-marker.txt'), 'local-before-landing\n', 'utf8');
  await vscode.commands.executeCommand('tiinex.incoming.replace', { data: { packagePath: fixturePackage, workspaceId: manifest.workspaceId } });
  assert.equal(await fs.readFile(path.join(workspaceRoot, 'landing-marker.txt'), 'utf8'), 'incoming-fixture\n', 'Replace must land the carried source through the production Incoming controller');
  snapshot = await vscode.commands.executeCommand('tiinex.acceptance.snapshot');
  assert.deepEqual(snapshot.incoming[0].appliedWorkspaceIds, [manifest.workspaceId], 'successful Replace must mark the exact Workspace applied in this host session');
  assert.equal(snapshot.events.some((item) => item.type === 'incoming-apply-blocked'), false, 'Incoming Replace must not hit an acceptance blocker');

  await vscode.commands.executeCommand('tiinex.outgoing.new');
  snapshot = await vscode.commands.executeCommand('tiinex.acceptance.snapshot');
  assert.ok(snapshot.outgoing, 'registered New Outgoing command must create the production Outgoing controller state');
  assert.equal(path.resolve(snapshot.outgoing.packageParentPath), path.resolve(fixturePackage), 'Outgoing must continue the exact qualified Incoming carrier');
  assert.deepEqual(snapshot.outgoing.workspaces.map((item) => [item.workspaceId, item.source]), [[manifest.workspaceId, 'local']], 'acceptance presentation seam must choose the qualified local Workspace source');
  assert.equal(snapshot.outgoing.workspaces[0].sourceQualification, 'qualified', 'fresh explicit Local Workspace source must begin qualified');

  // Reproduce the Sigma Workspace-discovery contamination shape. A recursively
  // discoverable nested Workspace must not become another live source choice for
  // this explicit VS Code Workspace root.
  let workspaceCatalog = await vscode.commands.executeCommand('tiinex.acceptance.workspaceCatalog');
  assert.equal(workspaceCatalog.length, 1, 'explicit operator root must expose exactly one live Workspace choice');
  const selectedWorkspaceTarget = String(workspaceCatalog[0].workspaceTargetPath || '');
  assert.ok(selectedWorkspaceTarget.startsWith('.topics/.workspaces/'), 'selected Workspace must be the direct canonical Workspace artifact');
  const selectedWorkspaceBytes = await fs.readFile(path.join(workspaceRoot, selectedWorkspaceTarget));
  const nestedWorkspacePath = path.join(workspaceRoot, 'test/extension-host/schema-example/.topics/.workspaces/nested.workspace.md');
  await fs.mkdir(path.dirname(nestedWorkspacePath), { recursive: true });
  await fs.writeFile(nestedWorkspacePath, selectedWorkspaceBytes);
  workspaceCatalog = await vscode.commands.executeCommand('tiinex.acceptance.workspaceCatalog');
  assert.equal(workspaceCatalog.length, 1, 'nested Workspace artifacts must not contaminate explicit-root discovery');
  assert.equal(String(workspaceCatalog[0].workspaceTargetPath || ''), selectedWorkspaceTarget);
  await fs.rm(path.join(workspaceRoot, 'test'), { recursive: true, force: true });

  // Stale selected source must be visibly invalidated by Refresh before Pack and
  // recover when the exact Workspace artifact qualifies again.
  const workspaceArtifactPath = path.join(workspaceRoot, selectedWorkspaceTarget);
  await fs.writeFile(workspaceArtifactPath, '# temporarily unqualified Workspace\n', 'utf8');
  await vscode.commands.executeCommand('tiinex.outgoing.refresh');
  snapshot = await vscode.commands.executeCommand('tiinex.acceptance.snapshot');
  assert.equal(snapshot.outgoing.workspaces[0].sourceQualification, 'invalid', 'Refresh must visibly invalidate a stale selected Local Workspace before Pack');
  await fs.writeFile(workspaceArtifactPath, selectedWorkspaceBytes);
  await vscode.commands.executeCommand('tiinex.outgoing.refresh');
  snapshot = await vscode.commands.executeCommand('tiinex.acceptance.snapshot');
  assert.equal(snapshot.outgoing.workspaces[0].sourceQualification, 'qualified', 'Refresh must recover the exact selected Local Workspace after its artifact qualifies again');

  // Reproduce the Sigma contamination shape with a fully valid Role artifact nested
  // beneath the selected Workspace. Core may discover material recursively, but the
  // host must not promote nested fixture/schema-example repositories into the live
  // endpoint selection surface for this exact Outgoing Workspace.
  const nestedRolePath = 'test/extension-host/schema-example/.topics/roles/sigma-role.trace.md';
  await fs.mkdir(path.dirname(path.join(workspaceRoot, nestedRolePath)), { recursive: true });
  await fs.copyFile(path.join(workspaceRoot, '.topics/roles/sigma-role.trace.md'), path.join(workspaceRoot, nestedRolePath));
  const endpoints = await vscode.commands.executeCommand('tiinex.acceptance.endpointCatalog');
  const anchorEndpoint = endpoints.find((item) => item.label === 'Anchor' && item.kind === 'role');
  const kodaxEndpoint = endpoints.find((item) => item.label === 'Kodax' && item.kind === 'role');
  const loomEndpoint = endpoints.find((item) => item.label === 'Loom' && item.kind === 'role');
  assert.ok(anchorEndpoint?.reference && kodaxEndpoint?.reference && loomEndpoint?.reference, 'acceptance Workspace must expose exact Core-projected Anchor, Kodax, and Loom Role references');
  assert.ok(endpoints.every((item) => String(item.path || '').startsWith('.topics/')), 'live endpoint choices must remain scoped to the explicit Workspace artifact namespace');
  assert.equal(endpoints.some((item) => String(item.path || '').includes('schema-example/.topics/')), false, 'nested fixture/schema-example Role artifacts must never become live endpoint choices');
  await fs.rm(path.join(workspaceRoot, 'test'), { recursive: true, force: true });

  const invalidPath = '.topics/handoffs/invalid-unqualified.trace.md';
  await fs.mkdir(path.dirname(path.join(workspaceRoot, invalidPath)), { recursive: true });
  await fs.writeFile(path.join(workspaceRoot, invalidPath), '# invalid handoff\n', 'utf8');
  await vscode.commands.executeCommand('tiinex.outgoing.attachHandoff', handoffNode(manifest.workspaceId, invalidPath));
  snapshot = await vscode.commands.executeCommand('tiinex.acceptance.snapshot');
  assert.equal(snapshot.outgoing.drafts.length, 0, 'invalid/unqualified Handoff must be rejected before it can become a late Pack route');
  assert.ok(snapshot.events.some((item) => item.type === 'attach-rejected' && item.detail.path === invalidPath), 'early Handoff rejection must be observable in the host gate');
  await fs.rm(path.join(workspaceRoot, invalidPath), { force: true });

  await vscode.commands.executeCommand('tiinex.acceptance.configure', { participantSelection: 'weaken' });
  await vscode.commands.executeCommand('tiinex.outgoing.attachHandoff', handoffNode(manifest.workspaceId, manifest.handoffs[0]));
  snapshot = await vscode.commands.executeCommand('tiinex.acceptance.snapshot');
  assert.equal(snapshot.outgoing.drafts.length, 0, 'attempted participant-set weakening must prevent Handoff attachment');
  assert.ok(snapshot.events.some((item) => item.type === 'participant-confirmation' && item.detail.state === 'rejected-weakened-set'), 'the exact-set guard must reject the weakened presentation selection');

  await vscode.commands.executeCommand('tiinex.acceptance.configure', { participantSelection: 'exact' });
  await vscode.commands.executeCommand('tiinex.outgoing.attachHandoff', handoffNode(manifest.workspaceId, manifest.handoffs[0]));
  snapshot = await vscode.commands.executeCommand('tiinex.acceptance.snapshot');
  assert.equal(snapshot.outgoing.drafts.length, 1, 'first exact Handoff attach must create one route');
  const firstDraftSha = snapshot.outgoing.drafts[0].artifactSha256;
  await vscode.commands.executeCommand('tiinex.outgoing.attachHandoff', handoffNode(manifest.workspaceId, manifest.handoffs[0]));
  snapshot = await vscode.commands.executeCommand('tiinex.acceptance.snapshot');
  assert.equal(snapshot.outgoing.drafts.length, 1, 'duplicate exact Handoff attach must be idempotent');
  assert.equal(snapshot.outgoing.drafts[0].artifactSha256, firstDraftSha, 'idempotent attach must preserve exact artifact identity');
  assert.ok(snapshot.events.some((item) => item.type === 'attach-idempotent-exact' && item.detail.path === manifest.handoffs[0]), 'duplicate exact attach must be observable as an idempotent host event');
  for (const handoffPath of manifest.handoffs.slice(1)) await vscode.commands.executeCommand('tiinex.outgoing.attachHandoff', handoffNode(manifest.workspaceId, handoffPath));
  await vscode.commands.executeCommand('tiinex.acceptance.configure', { participantSelection: 'exact', additionalParticipantReferences: [loomEndpoint.reference] });
  const authored = await vscode.commands.executeCommand('tiinex.acceptance.authorHandoff', { workspaceId: manifest.workspaceId, title: 'Extension Host Authored Handoff', fromLabel: 'Anchor', toLabel: 'Kodax' });
  assert.equal(authored.fromReference, anchorEndpoint.reference, 'production Handoff authoring must bind the exact Core-projected From Reference');
  assert.equal(authored.toReference, kodaxEndpoint.reference, 'production Handoff authoring must bind the exact Core-projected To Reference');
  const authoredMarkdown = await fs.readFile(path.join(workspaceRoot, authored.path), 'utf8');
  assert.ok(authoredMarkdown.includes(anchorEndpoint.reference), 'durable authored Handoff bytes must contain the exact From Reference');
  assert.ok(authoredMarkdown.includes(kodaxEndpoint.reference), 'durable authored Handoff bytes must contain the exact To Reference');
  snapshot = await vscode.commands.executeCommand('tiinex.acceptance.snapshot');
  assert.equal(snapshot.outgoing.drafts.length, 3, 'two fixture Handoffs plus one production-authored Handoff must be attached through the production controller path');
  const fixtureDrafts = snapshot.outgoing.drafts.filter((draft) => manifest.handoffs.includes(draft.path));
  assert.equal(fixtureDrafts.length, 2, 'both qualified fixture Handoffs must remain attached');
  for (const draft of fixtureDrafts) {
    assert.equal(draft.routeIncluded, true);
    assert.equal(draft.participantProjectionState, 'qualified');
    assert.deepEqual(draft.participants.map((item) => item.label).sort(), [...manifest.participants].sort(), 'visible participant presentation must match the exact Core-qualified set');
  }
  const authoredDraft = snapshot.outgoing.drafts.find((draft) => draft.path === authored.path);
  assert.ok(authoredDraft?.routeIncluded, 'the production-authored Handoff must be attached before Pack');
  assert.deepEqual(authoredDraft.participantSelections.map((item) => item.reference), [loomEndpoint.reference], 'Attach must preserve the exact operator-selected additional Role reference separately from Core semantic projection');
  assert.ok(authoredDraft.participants.some((item) => item.reference === loomEndpoint.reference), 'Core semantic participant projection must include the exact selected additional Role');

  await vscode.commands.executeCommand('tiinex.acceptance.corruptParticipantSnapshot');
  snapshot = await vscode.commands.executeCommand('tiinex.acceptance.snapshot');
  assert.equal(snapshot.outgoing.drafts.every((draft) => draft.participants.length === 0), true, 'test seam must corrupt only mutable host bookkeeping before Pack');

  await vscode.commands.executeCommand('tiinex.outgoing.package');
  snapshot = await vscode.commands.executeCommand('tiinex.acceptance.snapshot');
  assert.equal(snapshot.outgoing, null, 'successful Pack must close the Outgoing context');
  assert.equal(snapshot.events.some((item) => item.type === 'pack-blocked'), false, 'two-Handoff Pack must not block');
  const requalifyMessages = snapshot.events
    .filter((item) => item.type === 'pack-progress')
    .map((item) => String(item.detail.message || ''))
    .filter((message) => message.startsWith('Requalifying Core participants for '));
  assert.equal(requalifyMessages.length, 3, 'Pack must freshly reproject Core participants for each attached Handoff instead of trusting corrupted host snapshots');

  const routed = snapshot.transport.filter((item) => path.resolve(item.packagePath) !== path.resolve(fixturePackage) && item.routes.length === 3);
  assert.equal(routed.length, 1, 'Pack must produce exactly one Core-qualified three-route carrier in Transport');
  assert.deepEqual(routed[0].routes.map((item) => item.handoffPath).sort(), [...manifest.handoffs, authored.path].sort(), 'Transport must expose the exact fixture plus production-authored Handoff paths');
  for (const route of routed[0].routes) {
    assert.ok(route.transportText.includes('Continue from'), 'each routed Transport projection must include exact Handoff continuation text');
    assert.ok(route.transportText.includes(route.handoffPath) || /001-3-/.test(route.transportText), 'route transport text must carry an exact route pointer projection');
  }
  assert.ok(snapshot.events.some((item) => item.type === 'transport-qualified' && item.detail.source === 'queue' && item.detail.routeCount === 3 && path.resolve(String(item.detail.packagePath || '')) === path.resolve(routed[0].packagePath)), 'freshly built carrier must be reopened and qualified through Core before Transport accepts it');
}

async function restartHostRun({ fixturePackage }) {
  let snapshot = await vscode.commands.executeCommand('tiinex.acceptance.snapshot');
  const routed = snapshot.transport.filter((item) => path.resolve(item.packagePath) !== path.resolve(fixturePackage) && item.routes.length === 3);
  assert.equal(routed.length, 1, 'restart must restore the produced three-route carrier from persisted host queue bookkeeping');
  assert.ok(snapshot.events.some((item) => item.type === 'transport-qualified' && item.detail.source === 'restore' && item.detail.routeCount === 3 && path.resolve(String(item.detail.packagePath || '')) === path.resolve(routed[0].packagePath)), 'restart must requalify persisted carrier bytes through Core; persisted host bookkeeping cannot substitute semantic qualification');
  await vscode.commands.executeCommand('tiinex.transport.refresh');
  snapshot = await vscode.commands.executeCommand('tiinex.acceptance.snapshot');
  assert.ok(snapshot.events.some((item) => item.type === 'transport-qualified' && item.detail.source === 'refresh' && item.detail.routeCount === 3), 'explicit Transport refresh must requalify the routed carrier again');

  // The second real-host launch now exercises the exact Workspace-only Sigma seam:
  // Replace/local source state survived restart, New Outgoing chooses that qualified
  // source again, and Pack must manufacture a pointerless carrier without requiring
  // a Handoff route or mutating the Workspace artifact bytes.
  await vscode.commands.executeCommand('tiinex.outgoing.new');
  snapshot = await vscode.commands.executeCommand('tiinex.acceptance.snapshot');
  assert.ok(snapshot.outgoing, 'restart must be able to create a fresh Outgoing context from the qualified Incoming/local source');
  assert.equal(snapshot.outgoing.drafts.length, 0, 'Workspace-only Pack precondition must contain no Handoff routes');
  await vscode.commands.executeCommand('tiinex.outgoing.package');
  snapshot = await vscode.commands.executeCommand('tiinex.acceptance.snapshot');
  assert.equal(snapshot.outgoing, null, 'Workspace-only Pack must close the Outgoing context');
  const pointerlessBuilt = snapshot.transport.filter((item) => path.resolve(item.packagePath) !== path.resolve(fixturePackage) && item.routes.length === 0);
  assert.ok(pointerlessBuilt.length >= 1, 'Workspace-only Pack after Replace/local/restart must produce a Core-qualified pointerless carrier');
  assert.equal(snapshot.events.some((item) => item.type === 'pack-blocked'), false, 'Workspace-only Pack must not hit a host-owned mutation blocker');
}

function handoffNode(workspaceId, handoffPath) {
  return { data: { section: 'outgoing', workspaceId, artifact: { schemaId: 'tiinex.handoff.v1', path: handoffPath } } };
}
function findTransport(snapshot, packagePath) {
  return snapshot.transport.find((item) => path.resolve(item.packagePath) === path.resolve(packagePath));
}
async function sha256File(file) {
  return crypto.createHash('sha256').update(await fs.readFile(file)).digest('hex');
}

module.exports = { run };
