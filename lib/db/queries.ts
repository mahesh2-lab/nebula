import { db } from './index';
import { projects, deployments, envVariables, domains, apiKeys, users } from './schema';
import { eq, desc, and } from 'drizzle-orm';

// Type definitions inferred from tables
export type UserSelect = typeof users.$inferSelect;
export type UserInsert = typeof users.$inferInsert;

export type ProjectSelect = typeof projects.$inferSelect;
export type ProjectInsert = typeof projects.$inferInsert;

export type DeploymentSelect = typeof deployments.$inferSelect;
export type DeploymentInsert = typeof deployments.$inferInsert;

export type EnvVarSelect = typeof envVariables.$inferSelect;
export type EnvVarInsert = typeof envVariables.$inferInsert;

export type DomainSelect = typeof domains.$inferSelect;
export type DomainInsert = typeof domains.$inferInsert;

export type ApiKeySelect = typeof apiKeys.$inferSelect;
export type ApiKeyInsert = typeof apiKeys.$inferInsert;

// ==========================================
// Users Queries
// ==========================================
export async function createUser(data: UserInsert) {
  return db.insert(users).values(data).returning().then(rows => rows[0]);
}

export async function getUserById(id: string) {
  return db.select().from(users).where(eq(users.id, id)).then(rows => rows[0] || null);
}

// ==========================================
// Projects Queries
// ==========================================
export async function getProjects() {
  return db.query.projects.findMany({
    with: {
      deployments: {
        orderBy: [desc(deployments.createdAt)]
      },
      envVariables: true,
      domains: true
    },
    orderBy: [desc(projects.updatedAt)]
  });
}

export async function getProjectById(id: string) {
  return db.query.projects.findFirst({
    where: eq(projects.id, id),
    with: {
      deployments: {
        orderBy: [desc(deployments.createdAt)]
      },
      envVariables: true,
      domains: true
    }
  });
}

export async function getProjectByRepository(repository: string) {
  return db.query.projects.findFirst({
    where: eq(projects.repository, repository),
    with: {
      deployments: {
        orderBy: [desc(deployments.createdAt)]
      },
      envVariables: true,
      domains: true
    }
  });
}

export async function createProject(data: ProjectInsert) {
  return db.insert(projects).values(data).returning().then(rows => rows[0]);
}

export async function updateProject(id: string, updates: Partial<Omit<ProjectSelect, 'id'>>) {
  return db.update(projects).set(updates).where(eq(projects.id, id)).returning().then(rows => rows[0]);
}

export async function deleteProject(id: string) {
  return db.delete(projects).where(eq(projects.id, id)).returning().then(rows => rows[0]);
}

// ==========================================
// Deployments Queries
// ==========================================
export async function getDeployments(projectId?: string) {
  if (projectId) {
    return db.select()
      .from(deployments)
      .where(eq(deployments.projectId, projectId))
      .orderBy(desc(deployments.createdAt));
  }
  return db.select()
    .from(deployments)
    .orderBy(desc(deployments.createdAt));
}

export async function createDeployment(data: DeploymentInsert) {
  return db.insert(deployments).values(data).returning().then(rows => rows[0]);
}

export async function updateDeploymentStatus(id: string, status: string) {
  return db.update(deployments).set({ status, updatedAt: new Date() }).where(eq(deployments.id, id)).returning().then(rows => rows[0]);
}

// ==========================================
// Environment Variables Queries
// ==========================================
export async function getEnvVars(projectId: string) {
  return db.select().from(envVariables).where(eq(envVariables.projectId, projectId));
}

export async function createEnvVar(data: EnvVarInsert) {
  return db.insert(envVariables).values(data).returning().then(rows => rows[0]);
}

export async function deleteEnvVar(projectId: string, id: string) {
  return db.delete(envVariables).where(and(eq(envVariables.projectId, projectId), eq(envVariables.id, id))).returning().then(rows => rows[0]);
}

export async function updateEnvVar(projectId: string, id: string, updates: Partial<Omit<EnvVarSelect, 'id' | 'projectId'>>) {
  return db.update(envVariables)
    .set(updates)
    .where(and(eq(envVariables.projectId, projectId), eq(envVariables.id, id)))
    .returning()
    .then(rows => rows[0]);
}

// ==========================================
// Domains Queries
// ==========================================
export async function getDomains(projectId: string) {
  return db.select().from(domains).where(eq(domains.projectId, projectId));
}

export async function createDomain(data: DomainInsert) {
  return db.insert(domains).values(data).returning().then(rows => rows[0]);
}

export async function deleteDomain(projectId: string, name: string) {
  return db.delete(domains).where(and(eq(domains.projectId, projectId), eq(domains.name, name))).returning().then(rows => rows[0]);
}

// ==========================================
// API Keys Queries
// ==========================================
export async function getApiKeys(userId?: string) {
  if (userId) {
    return db.select().from(apiKeys).where(eq(apiKeys.userId, userId)).orderBy(desc(apiKeys.createdAt));
  }
  return db.select().from(apiKeys).orderBy(desc(apiKeys.createdAt));
}

export async function createApiKey(data: ApiKeyInsert) {
  return db.insert(apiKeys).values(data).returning().then(rows => rows[0]);
}

export async function revokeApiKey(id: string) {
  return db.delete(apiKeys).where(eq(apiKeys.id, id)).returning().then(rows => rows[0]);
}
export async function verifyApiKey(token: string) {
  return db.query.apiKeys.findFirst({
    where: eq(apiKeys.token, token)
  });
}
