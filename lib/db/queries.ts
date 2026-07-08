import { db } from './index';
import { projects, deployments, envVariables, domains, apiKeys, users } from './schema';
import { eq, desc, and } from 'drizzle-orm';
import { unstable_cache, revalidateTag } from 'next/cache';

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
  const user = await db.insert(users).values(data).returning().then(rows => rows[0]);
  if (user) {
    revalidateTag(`user-${user.id}`, 'max');
  }
  return user;
}

export async function getUserById(id: string) {
  const queryFn = async () => {
    return db.select().from(users).where(eq(users.id, id)).then(rows => rows[0] || null);
  };
  if (process.env.NODE_ENV === 'development') {
    return queryFn();
  }
  return unstable_cache(queryFn, [`user-${id}`], { tags: [`user-${id}`] })();
}

export async function ensureUserInDb(id: string, email: string, name?: string | null, image?: string | null) {
  const existing = await db.select().from(users).where(eq(users.id, id)).then(rows => rows[0] || null);
  if (!existing) {
    const existingByEmail = await db.select().from(users).where(eq(users.email, email)).then(rows => rows[0] || null);
    if (existingByEmail) {
      return existingByEmail;
    }
    const inserted = await db.insert(users).values({
      id,
      name: name || "Nebula User",
      email,
      image: image || null,
      password: null
    }).returning().then(rows => rows[0]);
    if (inserted) {
      revalidateTag(`user-${inserted.id}`, 'max');
    }
    return inserted;
  }
  return existing;
}

// ==========================================
// Projects Queries
// ==========================================
export async function getProjects(userId?: string) {
  const queryFn = async () => {
    return db.query.projects.findMany({
      where: userId ? eq(projects.userId, userId) : undefined,
      with: {
        deployments: {
          orderBy: [desc(deployments.createdAt)]
        },
        envVariables: true,
        domains: true
      },
      orderBy: [desc(projects.updatedAt)]
    });
  };
  if (process.env.NODE_ENV === 'development') {
    return queryFn();
  }
  return unstable_cache(
    queryFn,
    [userId ? `projects-user-${userId}` : 'projects-all'],
    { tags: [userId ? `projects-${userId}` : 'projects'] }
  )();
}

export async function getProjectById(id: string, userId?: string) {
  const queryFn = async () => {
    return db.query.projects.findFirst({
      where: userId ? and(eq(projects.id, id), eq(projects.userId, userId)) : eq(projects.id, id),
      with: {
        deployments: {
          orderBy: [desc(deployments.createdAt)]
        },
        envVariables: true,
        domains: true
      }
    });
  };
  if (process.env.NODE_ENV === 'development') {
    return queryFn();
  }
  return unstable_cache(
    queryFn,
    [userId ? `project-${id}-user-${userId}` : `project-${id}`],
    { tags: [userId ? `project-${id}-${userId}` : `project-${id}`, 'projects'] }
  )();
}

export async function getProjectByRepository(repository: string, userId?: string) {
  const queryFn = async () => {
    return db.query.projects.findFirst({
      where: userId ? and(eq(projects.repository, repository), eq(projects.userId, userId)) : eq(projects.repository, repository),
      with: {
        deployments: {
          orderBy: [desc(deployments.createdAt)]
        },
        envVariables: true,
        domains: true
      }
    });
  };
  if (process.env.NODE_ENV === 'development') {
    return queryFn();
  }
  return unstable_cache(
    queryFn,
    [userId ? `project-repo-${repository}-user-${userId}` : `project-repo-${repository}`],
    { tags: [userId ? `project-repo-${repository}-${userId}` : `project-repo-${repository}`, 'projects'] }
  )();
}

async function revalidateProjectCache(projectId: string, userId?: string | null) {
  revalidateTag(`project-${projectId}`, 'max');
  revalidateTag('projects', 'max');
  if (userId) {
    revalidateTag(`projects-${userId}`, 'max');
    revalidateTag(`project-${projectId}-${userId}`, 'max');
  } else {
    try {
      const p = await db.select().from(projects).where(eq(projects.id, projectId)).then(rows => rows[0] || null);
      if (p && p.userId) {
        revalidateTag(`projects-${p.userId}`, 'max');
        revalidateTag(`project-${projectId}-${p.userId}`, 'max');
      }
    } catch (_) {}
  }
}

export async function createProject(data: ProjectInsert) {
  const p = await db.insert(projects).values(data).returning().then(rows => rows[0]);
  revalidateTag('projects', 'max');
  if (p && p.userId) {
    revalidateTag(`projects-${p.userId}`, 'max');
  }
  return p;
}

export async function updateProject(id: string, updates: Partial<Omit<ProjectSelect, 'id'>>) {
  const p = await db.update(projects).set(updates).where(eq(projects.id, id)).returning().then(rows => rows[0]);
  if (p) {
    await revalidateProjectCache(p.id, p.userId);
    if (p.repository) {
      revalidateTag(`project-repo-${p.repository}`, 'max');
      if (p.userId) {
        revalidateTag(`project-repo-${p.repository}-${p.userId}`, 'max');
      }
    }
  }
  return p;
}

export async function deleteProject(id: string) {
  const p = await db.delete(projects).where(eq(projects.id, id)).returning().then(rows => rows[0]);
  if (p) {
    await revalidateProjectCache(p.id, p.userId);
    if (p.repository) {
      revalidateTag(`project-repo-${p.repository}`, 'max');
      if (p.userId) {
        revalidateTag(`project-repo-${p.repository}-${p.userId}`, 'max');
      }
    }
  }
  return p;
}

// ==========================================
// Deployments Queries
// ==========================================
export async function getDeployments(projectId?: string) {
  const queryFn = async () => {
    if (projectId) {
      return db.select()
        .from(deployments)
        .where(eq(deployments.projectId, projectId))
        .orderBy(desc(deployments.createdAt));
    }
    return db.select()
        .from(deployments)
        .orderBy(desc(deployments.createdAt));
  };
  if (process.env.NODE_ENV === 'development') {
    return queryFn();
  }
  return unstable_cache(
    queryFn,
    [projectId ? `deployments-project-${projectId}` : 'deployments-all'],
    { tags: [projectId ? `deployments-${projectId}` : 'deployments'] }
  )();
}

export async function createDeployment(data: DeploymentInsert) {
  const d = await db.insert(deployments).values(data).returning().then(rows => rows[0]);
  revalidateTag('deployments', 'max');
  if (d && d.projectId) {
    revalidateTag(`deployments-${d.projectId}`, 'max');
    await revalidateProjectCache(d.projectId);
  }
  return d;
}

export async function updateDeploymentStatus(id: string, status: string) {
  const d = await db.update(deployments).set({ status, updatedAt: new Date() }).where(eq(deployments.id, id)).returning().then(rows => rows[0]);
  revalidateTag('deployments', 'max');
  if (d && d.projectId) {
    revalidateTag(`deployments-${d.projectId}`, 'max');
    await revalidateProjectCache(d.projectId);
  }
  return d;
}

export async function deleteDeployment(projectId: string, id: string) {
  const d = await db.delete(deployments).where(and(eq(deployments.projectId, projectId), eq(deployments.id, id))).returning().then(rows => rows[0]);
  revalidateTag('deployments', 'max');
  if (d && d.projectId) {
    revalidateTag(`deployments-${d.projectId}`, 'max');
    await revalidateProjectCache(d.projectId);
  }
  return d;
}


// ==========================================
// Environment Variables Queries
// ==========================================
export async function getEnvVars(projectId: string) {
  const queryFn = async () => {
    return db.select().from(envVariables).where(eq(envVariables.projectId, projectId));
  };
  if (process.env.NODE_ENV === 'development') {
    return queryFn();
  }
  return unstable_cache(
    queryFn,
    [`env-vars-${projectId}`],
    { tags: [`env-vars-${projectId}`] }
  )();
}

export async function createEnvVar(data: EnvVarInsert) {
  const ev = await db.insert(envVariables).values(data).returning().then(rows => rows[0]);
  if (ev && ev.projectId) {
    revalidateTag(`env-vars-${ev.projectId}`, 'max');
    await revalidateProjectCache(ev.projectId);
  }
  return ev;
}

export async function deleteEnvVar(projectId: string, id: string) {
  const ev = await db.delete(envVariables).where(and(eq(envVariables.projectId, projectId), eq(envVariables.id, id))).returning().then(rows => rows[0]);
  revalidateTag(`env-vars-${projectId}`, 'max');
  await revalidateProjectCache(projectId);
  return ev;
}

export async function updateEnvVar(projectId: string, id: string, updates: Partial<Omit<EnvVarSelect, 'id' | 'projectId'>>) {
  const ev = await db.update(envVariables)
    .set(updates)
    .where(and(eq(envVariables.projectId, projectId), eq(envVariables.id, id)))
    .returning()
    .then(rows => rows[0]);
  revalidateTag(`env-vars-${projectId}`, 'max');
  await revalidateProjectCache(projectId);
  return ev;
}

// ==========================================
// Domains Queries
// ==========================================
export async function getDomains(projectId: string) {
  const queryFn = async () => {
    return db.select().from(domains).where(eq(domains.projectId, projectId));
  };
  if (process.env.NODE_ENV === 'development') {
    return queryFn();
  }
  return unstable_cache(
    queryFn,
    [`domains-${projectId}`],
    { tags: [`domains-${projectId}`] }
  )();
}

export async function createDomain(data: DomainInsert) {
  const dom = await db.insert(domains).values(data).returning().then(rows => rows[0]);
  if (dom && dom.projectId) {
    revalidateTag(`domains-${dom.projectId}`, 'max');
    await revalidateProjectCache(dom.projectId);
  }
  return dom;
}

export async function deleteDomain(projectId: string, name: string) {
  const dom = await db.delete(domains).where(and(eq(domains.projectId, projectId), eq(domains.name, name))).returning().then(rows => rows[0]);
  revalidateTag(`domains-${projectId}`, 'max');
  await revalidateProjectCache(projectId);
  return dom;
}

// ==========================================
// API Keys Queries
// ==========================================
export async function getApiKeys(userId?: string) {
  const queryFn = async () => {
    if (userId) {
      return db.select().from(apiKeys).where(eq(apiKeys.userId, userId)).orderBy(desc(apiKeys.createdAt));
    }
    return db.select().from(apiKeys).orderBy(desc(apiKeys.createdAt));
  };
  if (process.env.NODE_ENV === 'development') {
    return queryFn();
  }
  return unstable_cache(
    queryFn,
    [userId ? `api-keys-user-${userId}` : 'api-keys-all'],
    { tags: [userId ? `api-keys-${userId}` : 'api-keys'] }
  )();
}

export async function createApiKey(data: ApiKeyInsert) {
  const key = await db.insert(apiKeys).values(data).returning().then(rows => rows[0]);
  revalidateTag('api-keys', 'max');
  if (key && key.userId) {
    revalidateTag(`api-keys-${key.userId}`, 'max');
  }
  return key;
}

export async function revokeApiKey(id: string, userId?: string) {
  const key = await db.delete(apiKeys)
    .where(userId ? and(eq(apiKeys.id, id), eq(apiKeys.userId, userId)) : eq(apiKeys.id, id))
    .returning()
    .then(rows => rows[0]);
  revalidateTag('api-keys', 'max');
  if (key && key.userId) {
    revalidateTag(`api-keys-${key.userId}`, 'max');
  }
  return key;
}

export async function verifyApiKey(token: string) {
  return db.query.apiKeys.findFirst({
    where: eq(apiKeys.token, token)
  });
}
