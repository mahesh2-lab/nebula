"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.domainsRelations = exports.envVariablesRelations = exports.deploymentsRelations = exports.projectsRelations = exports.apiKeys = exports.domains = exports.envVariables = exports.deployments = exports.projects = exports.users = void 0;
var pg_core_1 = require("drizzle-orm/pg-core");
var drizzle_orm_1 = require("drizzle-orm");
// Users table
exports.users = (0, pg_core_1.pgTable)('users', {
    id: (0, pg_core_1.text)('id').primaryKey(),
    name: (0, pg_core_1.text)('name'),
    email: (0, pg_core_1.text)('email').notNull().unique(),
    image: (0, pg_core_1.text)('image'),
    password: (0, pg_core_1.text)('password'), // added password column for credentials auth
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull()
});
// Projects table
exports.projects = (0, pg_core_1.pgTable)('projects', {
    id: (0, pg_core_1.text)('id').primaryKey(),
    name: (0, pg_core_1.text)('name').notNull(),
    framework: (0, pg_core_1.text)('framework').notNull(),
    repository: (0, pg_core_1.text)('repository').notNull(),
    branch: (0, pg_core_1.text)('branch').notNull(),
    buildCommand: (0, pg_core_1.text)('build_command'),
    outputDirectory: (0, pg_core_1.text)('output_directory'),
    installCommand: (0, pg_core_1.text)('install_command'),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull()
});
// Deployments table
exports.deployments = (0, pg_core_1.pgTable)('deployments', {
    id: (0, pg_core_1.text)('id').primaryKey(),
    projectId: (0, pg_core_1.text)('project_id').notNull().references(function () { return exports.projects.id; }, { onDelete: 'cascade' }),
    status: (0, pg_core_1.text)('status').notNull(), // 'ready' | 'building' | 'failed' | 'queued'
    commitMessage: (0, pg_core_1.text)('commit_message'),
    commitHash: (0, pg_core_1.text)('commit_hash'),
    commitAuthor: (0, pg_core_1.text)('commit_author'),
    branch: (0, pg_core_1.text)('branch').notNull(),
    latency: (0, pg_core_1.text)('latency').default('0ms'),
    region: (0, pg_core_1.text)('region').default('iad1 (US East)'),
    logs: (0, pg_core_1.text)('logs'),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull()
});
// Environment Variables table
exports.envVariables = (0, pg_core_1.pgTable)('env_variables', {
    id: (0, pg_core_1.text)('id').primaryKey(),
    projectId: (0, pg_core_1.text)('project_id').notNull().references(function () { return exports.projects.id; }, { onDelete: 'cascade' }),
    key: (0, pg_core_1.text)('key').notNull(),
    value: (0, pg_core_1.text)('value').notNull(),
    environments: (0, pg_core_1.jsonb)('environments').$type().default(['production']) // e.g. ['production', 'preview', 'development']
});
// Domains table
exports.domains = (0, pg_core_1.pgTable)('domains', {
    id: (0, pg_core_1.text)('id').primaryKey(),
    projectId: (0, pg_core_1.text)('project_id').notNull().references(function () { return exports.projects.id; }, { onDelete: 'cascade' }),
    name: (0, pg_core_1.text)('name').notNull().unique(),
    ssl: (0, pg_core_1.text)('ssl').notNull().default('generating'), // 'active' | 'generating' | 'expired'
    dns: (0, pg_core_1.text)('dns').notNull(),
    redirect: (0, pg_core_1.text)('redirect').default('none'),
    verified: (0, pg_core_1.boolean)('verified').default(true).notNull(),
    health: (0, pg_core_1.text)('health').default('healthy'), // 'healthy' | 'unhealthy'
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull()
});
// API Keys table
exports.apiKeys = (0, pg_core_1.pgTable)('api_keys', {
    id: (0, pg_core_1.text)('id').primaryKey(),
    name: (0, pg_core_1.text)('name').notNull(),
    token: (0, pg_core_1.text)('token').notNull().unique(),
    prefix: (0, pg_core_1.text)('prefix').notNull(),
    scope: (0, pg_core_1.text)('scope').notNull(), // 'Read' | 'Read/Write' | 'Admin'
    userId: (0, pg_core_1.text)('user_id').references(function () { return exports.users.id; }, { onDelete: 'cascade' }),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    expiredAt: (0, pg_core_1.timestamp)('expired_at')
});
// Relations definitions (Optional but very helpful for Drizzle queries)
exports.projectsRelations = (0, drizzle_orm_1.relations)(exports.projects, function (_a) {
    var many = _a.many;
    return ({
        deployments: many(exports.deployments),
        envVariables: many(exports.envVariables),
        domains: many(exports.domains)
    });
});
exports.deploymentsRelations = (0, drizzle_orm_1.relations)(exports.deployments, function (_a) {
    var one = _a.one;
    return ({
        project: one(exports.projects, {
            fields: [exports.deployments.projectId],
            references: [exports.projects.id]
        })
    });
});
exports.envVariablesRelations = (0, drizzle_orm_1.relations)(exports.envVariables, function (_a) {
    var one = _a.one;
    return ({
        project: one(exports.projects, {
            fields: [exports.envVariables.projectId],
            references: [exports.projects.id]
        })
    });
});
exports.domainsRelations = (0, drizzle_orm_1.relations)(exports.domains, function (_a) {
    var one = _a.one;
    return ({
        project: one(exports.projects, {
            fields: [exports.domains.projectId],
            references: [exports.projects.id]
        })
    });
});
