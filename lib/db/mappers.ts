import type { Project, Deployment, DomainInfo } from '@/store/store';
import type { ProjectSelect, DeploymentSelect, EnvVarSelect, DomainSelect } from '@/lib/db/queries';

export interface DbProjectWithRelations extends ProjectSelect {
  deployments: DeploymentSelect[];
  envVariables: EnvVarSelect[];
  domains: DomainSelect[];
}

export function mapDbProjectToStoreProject(p: DbProjectWithRelations): Project {
  const deps: Deployment[] = (p.deployments || []).map((d) => ({
    id: d.id,
    projectId: d.projectId,
    status: d.status as Deployment['status'],
    branch: d.branch,
    latency: d.latency || '12ms',
    region: d.region || 'iad1 (US East)',
    createdAt: d.createdAt ? new Date(d.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: d.updatedAt ? new Date(d.updatedAt).toISOString() : new Date().toISOString(),
    framework: p.framework,
    commit: {
      message: d.commitMessage || 'No message',
      hash: d.commitHash || '0000000',
      author: d.commitAuthor || 'Author'
    }
  }));

  const lastDep = deps[0];
  const lastCommit = lastDep ? lastDep.commit : {
    message: 'Initial project setup',
    hash: '7a3d8f1',
    author: 'Mahesh Kumar'
  };

  return {
    id: p.id,
    name: p.name,
    framework: p.framework,
    repository: p.repository,
    branch: p.branch,
    status: (lastDep ? lastDep.status : 'ready') as Project['status'],
    latency: lastDep ? lastDep.latency : '12ms',
    region: lastDep ? lastDep.region : 'iad1 (US East)',
    updatedAt: p.updatedAt ? new Date(p.updatedAt).toISOString() : new Date().toISOString(),
    buildCommand: p.buildCommand || undefined,
    outputDirectory: p.outputDirectory || undefined,
    installCommand: p.installCommand || undefined,
    lastCommit,
    deployments: deps,
    env: (p.envVariables || []).map((e) => ({
      id: e.id,
      key: e.key,
      value: e.value,
      env: e.environments || ['production']
    })),
    domains: (p.domains || []).map((d) => ({
      name: d.name,
      ssl: d.ssl as DomainInfo['ssl'],
      dns: d.dns,
      redirect: d.redirect || 'none',
      verified: d.verified,
      health: (d.health || 'healthy') as DomainInfo['health']
    })),
    functions: [],
    billing: {
      bandwidthUsed: 0.4,
      bandwidthLimit: 100.0,
      requestsUsed: 0.12,
      requestsLimit: 50.0,
      buildMinutesUsed: 14,
      buildMinutesLimit: 1000
    }
  };
}
