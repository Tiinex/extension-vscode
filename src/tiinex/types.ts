export interface TiinexFinding {
  severity: string;
  code: string;
  message: string;
  context?: Record<string, unknown>;
}

export interface LandingRepository {
  id: string;
  root: string;
  repository: string;
  repositoryIdentity: string;
  branch: string;
  clean: boolean | null;
}

export interface LandingWorkspace {
  workspaceId: string;
  title: string;
  coverage: string;
  archivePackagePath: string;
  archiveBytes: number;
  archiveSha256: string;
  workspaceArtifactInnerPath: string;
  state: string;
  source: { repository?: string; ref?: string } | null;
  repository: LandingRepository | null;
  candidateRepositoryIds?: string[];
  reasons: string[];
}

export interface LandingPlan {
  schema: string;
  status: 'ready' | 'blocked' | string;
  packageQualification: string;
  selectionMode: string;
  workspaces: LandingWorkspace[];
  affected: LandingWorkspace[];
  unaffected: LandingWorkspace[];
  confirmation: {
    required: boolean;
    repositoryCount: number;
    repositoryRoots: string[];
    statement: string;
    authority: string;
  };
  operationBoundary: { sourceMutation: boolean; remoteWrite: boolean; commit: boolean; push: boolean; acceptance: boolean };
  findings: TiinexFinding[];
  boundary: string;
}

export interface OrientResult {
  status?: string;
  ready?: boolean;
  workspaces?: Array<{ workspaceId?: string; qualification?: string; state?: string }>;
  [key: string]: unknown;
}
