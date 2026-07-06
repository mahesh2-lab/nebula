import { relations } from "drizzle-orm/relations";
import { users, apiKeys, projects, deployments, domains, envVariables } from "./schema";

export const apiKeysRelations = relations(apiKeys, ({one}) => ({
	user: one(users, {
		fields: [apiKeys.userId],
		references: [users.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	apiKeys: many(apiKeys),
}));

export const deploymentsRelations = relations(deployments, ({one}) => ({
	project: one(projects, {
		fields: [deployments.projectId],
		references: [projects.id]
	}),
}));

export const projectsRelations = relations(projects, ({many}) => ({
	deployments: many(deployments),
	domains: many(domains),
	envVariables: many(envVariables),
}));

export const domainsRelations = relations(domains, ({one}) => ({
	project: one(projects, {
		fields: [domains.projectId],
		references: [projects.id]
	}),
}));

export const envVariablesRelations = relations(envVariables, ({one}) => ({
	project: one(projects, {
		fields: [envVariables.projectId],
		references: [projects.id]
	}),
}));