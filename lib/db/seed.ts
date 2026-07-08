import { db } from './index';
import { users, projects, deployments, envVariables, domains, apiKeys } from './schema';
import { eq } from 'drizzle-orm';
import { hashPassword } from '../auth/password';

export async function seedDatabase() {
  console.log('Seeding database...');
  
  // 1. Create default admin user
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@nebula.dev';
  const adminPassword = process.env.ADMIN_PASSWORD || 'password123';
  
  const existingAdmin = await db.query.users.findFirst({
    where: eq(users.email, adminEmail)
  });
  
  let adminId = '1';
  if (!existingAdmin) {
    const admin = await db.insert(users).values({
      id: '1',
      name: 'Workspace Admin',
      email: adminEmail,
      password: hashPassword(adminPassword),
      image: null
    }).returning().then(rows => rows[0]);
    adminId = admin.id;
    console.log('Created admin user:', adminEmail);
  } else {
    adminId = existingAdmin.id;
    // Update password if changed
    await db.update(users).set({ password: hashPassword(adminPassword) }).where(eq(users.id, adminId));
    console.log('Admin user already exists');
  }

  // 2. Create mock projects if no projects exist
  const existingProjects = await db.select().from(projects);
  if (existingProjects.length === 0) {
    console.log('Seeding mock projects and deployments...');
    
    // Project 1: Next.js Portal
    const p1 = await db.insert(projects).values({
      id: 'nebula-web-portal',
      name: 'Nebula Web Portal',
      framework: 'nextjs',
      repository: 'nebula-infra/portal',
      branch: 'main',
      buildCommand: 'npm run build',
      outputDirectory: '.next',
      installCommand: 'npm install',
      userId: adminId,
    }).returning().then(rows => rows[0]);

    // Project 2: Go Edge API
    const p2 = await db.insert(projects).values({
      id: 'go-edge-api',
      name: 'Go Edge API',
      framework: 'go',
      repository: 'nebula-infra/edge-api',
      branch: 'main',
      buildCommand: 'go build -o api main.go',
      outputDirectory: 'dist',
      installCommand: 'go mod download',
      userId: adminId,
    }).returning().then(rows => rows[0]);

    // Project 3: React Docs
    const p3 = await db.insert(projects).values({
      id: 'react-docs-site',
      name: 'React Docs Site',
      framework: 'react',
      repository: 'nebula-infra/docs',
      branch: 'main',
      buildCommand: 'npm run build',
      outputDirectory: 'build',
      installCommand: 'npm install',
      userId: adminId,
    }).returning().then(rows => rows[0]);

    // Seed deployments
    await db.insert(deployments).values([
      {
        id: 'dep-p1-1',
        projectId: p1.id,
        status: 'ready',
        branch: 'main',
        commitMessage: 'Release v1.2.0 production build',
        commitHash: 'a1b2c3d',
        commitAuthor: 'Mahesh Kumar',
        latency: '12ms',
        region: 'iad1 (US East)'
      },
      {
        id: 'dep-p2-1',
        projectId: p2.id,
        status: 'ready',
        branch: 'main',
        commitMessage: 'Optimize routing engine cache',
        commitHash: 'e5f6g7h',
        commitAuthor: 'Mahesh Kumar',
        latency: '8ms',
        region: 'sfo1 (US West)'
      },
      {
        id: 'dep-p3-1',
        projectId: p3.id,
        status: 'ready',
        branch: 'main',
        commitMessage: 'Update deployment configuration guides',
        commitHash: 'i9j0k1l',
        commitAuthor: 'Mahesh Kumar',
        latency: '19ms',
        region: 'cdg1 (Europe)'
      }
    ]);

    // Seed environment variables
    await db.insert(envVariables).values([
      {
        id: 'env-p1-1',
        projectId: p1.id,
        key: 'DATABASE_URL',
        value: 'postgresql://postgres:postgres@localhost:5432/nebuladb',
        environments: ['production', 'preview']
      },
      {
        id: 'env-p1-2',
        projectId: p1.id,
        key: 'NEXTAUTH_SECRET',
        value: 'my-super-secret-jwt-key-2024',
        environments: ['production']
      },
      {
        id: 'env-p2-1',
        projectId: p2.id,
        key: 'REDIS_URL',
        value: 'redis://localhost:6379',
        environments: ['production']
      }
    ]);

    // Seed domains
    await db.insert(domains).values([
      {
        id: 'dom-p1-1',
        projectId: p1.id,
        name: 'portal.nebula.dev',
        ssl: 'active',
        dns: 'CNAME cname.nebula.dev',
        verified: true,
        health: 'healthy'
      },
      {
        id: 'dom-p2-1',
        projectId: p2.id,
        name: 'api.nebula.dev',
        ssl: 'active',
        dns: 'A 76.76.21.21',
        verified: true,
        health: 'healthy'
      }
    ]);

    // Seed API key
    await db.insert(apiKeys).values([
      {
        id: 'key-1',
        name: 'Production Deploy Token',
        token: 'neb_live_7a3d8f1e9c2b4e5f6g7h8i9j',
        prefix: 'neb_live',
        scope: 'Admin',
        userId: adminId
      }
    ]);

    console.log('Seeding mock data completed successfully.');
  } else {
    console.log('Projects already exist, skipping mock data seed.');
  }
}
