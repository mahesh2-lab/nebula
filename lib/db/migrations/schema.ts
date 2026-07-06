import { pgTable, unique, text, timestamp, foreignKey, boolean, jsonb } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const users = pgTable("users", {
	id: text().primaryKey().notNull(),
	name: text(),
	email: text().notNull(),
	image: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	password: text(),
}, (table) => [
	unique("users_email_unique").on(table.email),
]);

export const apiKeys = pgTable("api_keys", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	token: text().notNull(),
	prefix: text().notNull(),
	scope: text().notNull(),
	userId: text("user_id"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	expiredAt: timestamp("expired_at", { mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "api_keys_user_id_users_id_fk"
		}).onDelete("cascade"),
	unique("api_keys_token_unique").on(table.token),
]);

export const projects = pgTable("projects", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	framework: text().notNull(),
	repository: text().notNull(),
	branch: text().notNull(),
	status: text().notNull(),
	latency: text().default('0ms'),
	region: text().default('iad1 (US East)'),
	buildCommand: text("build_command"),
	outputDirectory: text("output_directory"),
	installCommand: text("install_command"),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
});

export const deployments = pgTable("deployments", {
	id: text().primaryKey().notNull(),
	projectId: text("project_id").notNull(),
	status: text().notNull(),
	commitMessage: text("commit_message"),
	commitHash: text("commit_hash"),
	commitAuthor: text("commit_author"),
	branch: text().notNull(),
	latency: text().default('0ms'),
	region: text().default('iad1 (US East)'),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.projectId],
			foreignColumns: [projects.id],
			name: "deployments_project_id_projects_id_fk"
		}).onDelete("cascade"),
]);

export const domains = pgTable("domains", {
	id: text().primaryKey().notNull(),
	projectId: text("project_id").notNull(),
	name: text().notNull(),
	ssl: text().default('generating').notNull(),
	dns: text().notNull(),
	redirect: text().default('none'),
	verified: boolean().default(true).notNull(),
	health: text().default('healthy'),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.projectId],
			foreignColumns: [projects.id],
			name: "domains_project_id_projects_id_fk"
		}).onDelete("cascade"),
	unique("domains_name_unique").on(table.name),
]);

export const envVariables = pgTable("env_variables", {
	id: text().primaryKey().notNull(),
	projectId: text("project_id").notNull(),
	key: text().notNull(),
	value: text().notNull(),
	environments: jsonb().default(["production"]),
}, (table) => [
	foreignKey({
			columns: [table.projectId],
			foreignColumns: [projects.id],
			name: "env_variables_project_id_projects_id_fk"
		}).onDelete("cascade"),
]);
