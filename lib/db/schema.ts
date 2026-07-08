import { pgTable, text, timestamp, boolean, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users table
export const users = pgTable('users', {
  id: text('id').primaryKey(),
  name: text('name'),
  email: text('email').notNull().unique(),
  image: text('image'),
  password: text('password'), // added password column for credentials auth
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Projects table
export const projects = pgTable('projects', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  framework: text('framework').notNull(),
  repository: text('repository').notNull(),
  branch: text('branch').notNull(),
  buildCommand: text('build_command'),
  outputDirectory: text('output_directory'),
  installCommand: text('install_command'),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// Deployments table
export const deployments = pgTable('deployments', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  status: text('status').notNull(), // 'ready' | 'building' | 'failed' | 'queued'
  commitMessage: text('commit_message'),
  commitHash: text('commit_hash'),
  commitAuthor: text('commit_author'),
  branch: text('branch').notNull(),
  latency: text('latency').default('0ms'),
  region: text('region').default('iad1 (US East)'),
  logs: text('logs'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// Environment Variables table
export const envVariables = pgTable('env_variables', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  key: text('key').notNull(),
  value: text('value').notNull(),
  environments: jsonb('environments').$type<string[]>().default(['production']) // e.g. ['production', 'preview', 'development']
});

// Domains table
export const domains = pgTable('domains', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  name: text('name').notNull().unique(),
  ssl: text('ssl').notNull().default('generating'), // 'active' | 'generating' | 'expired'
  dns: text('dns').notNull(),
  redirect: text('redirect').default('none'),
  verified: boolean('verified').default(true).notNull(),
  health: text('health').default('healthy'), // 'healthy' | 'unhealthy'
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// API Keys table
export const apiKeys = pgTable('api_keys', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  token: text('token').notNull().unique(),
  prefix: text('prefix').notNull(),
  scope: text('scope').notNull(), // 'Read' | 'Read/Write' | 'Admin'
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  expiredAt: timestamp('expired_at')
});

// Relations definitions (Optional but very helpful for Drizzle queries)
export const projectsRelations = relations(projects, ({ one, many }) => ({
  user: one(users, {
    fields: [projects.userId],
    references: [users.id]
  }),
  deployments: many(deployments),
  envVariables: many(envVariables),
  domains: many(domains)
}));

export const deploymentsRelations = relations(deployments, ({ one }) => ({
  project: one(projects, {
    fields: [deployments.projectId],
    references: [projects.id]
  })
}));

export const envVariablesRelations = relations(envVariables, ({ one }) => ({
  project: one(projects, {
    fields: [envVariables.projectId],
    references: [projects.id]
  })
}));

export const domainsRelations = relations(domains, ({ one }) => ({
  project: one(projects, {
    fields: [domains.projectId],
    references: [projects.id]
  })
}));
