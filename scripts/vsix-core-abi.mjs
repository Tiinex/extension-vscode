/** Validate the *actual selected Core runtime*, never sibling source by name.
 * The host adapter depends on these read-only discovery contracts. */
export function qualifyCoreAgentAbi(result = {}) {
  if (result.status !== 'ready' || result.operation !== 'inspect-agent-capabilities')
    throw new Error('tiinex.vsix.core-agent-abi.discovery-unavailable');
  const operations = result.operations;
  if (!Array.isArray(operations)) throw new Error('tiinex.vsix.core-agent-abi.operations-missing');
  const expected = ['inspect-agent-capabilities', 'project-agent-role-sync'];
  for (const name of expected) {
    const item=operations.find(op=>op?.id===name);
    if (!item) throw new Error(`tiinex.vsix.core-agent-abi.operation-missing:${name}`);
    if (item.hostExecution !== 'not-qualified' || item.roleAuthorization !== 'not-established' || item.safety !== 'read-only')
      throw new Error(`tiinex.vsix.core-agent-abi.authority-drift:${name}`);
  }
  return Object.freeze({ status:'ready', operations: expected });
}
