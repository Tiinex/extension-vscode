import { prepareHostCoreRuntime, runTiinexJson } from './tiinex/bootstrap';
import { preferredNodeExecutable } from './host/nodeExecutable';

interface WorkspaceInitReceipt {
  status: string;
  path?: string;
  workspaceId?: string;
  writeReceipt?: { path?: string; workspaceRelativePath?: string; bytes?: number };
  resolutionRequest?: { schemaId?: string; repository?: string; path?: string; resolution?: string };
  findingSummary?: { counts?: { error?: number } };
  findings?: Array<{ severity?: string; code?: string; message?: string }>;
}

/**
 * VS Code owns only folder selection/progress/presentation. Shared Core owns
 * Workspace source identity, native schema material, rendering and filesystem
 * write semantics so CLI, LLM sandboxes and this host behave identically.
 */
export async function initializeWorkspaceDirectory(extensionPath: string, root: string, candidateRoots: string[] = []): Promise<WorkspaceInitReceipt> {
  const runtime = await prepareHostCoreRuntime(extensionPath, candidateRoots, preferredNodeExecutable());
  try {
    return await runTiinexJson<WorkspaceInitReceipt>(runtime, ['init-workspace', root, '--authors', 'local-user', '--compact']);
  } finally {
    await runtime.dispose();
  }
}
