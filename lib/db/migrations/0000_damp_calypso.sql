-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"email" text NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"password" text,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "api_keys" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"token" text NOT NULL,
	"prefix" text NOT NULL,
	"scope" text NOT NULL,
	"user_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"expired_at" timestamp,
	CONSTRAINT "api_keys_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"framework" text NOT NULL,
	"repository" text NOT NULL,
	"branch" text NOT NULL,
	"status" text NOT NULL,
	"latency" text DEFAULT '0ms',
	"region" text DEFAULT 'iad1 (US East)',
	"build_command" text,
	"output_directory" text,
	"install_command" text,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "deployments" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"status" text NOT NULL,
	"commit_message" text,
	"commit_hash" text,
	"commit_author" text,
	"branch" text NOT NULL,
	"latency" text DEFAULT '0ms',
	"region" text DEFAULT 'iad1 (US East)',
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "domains" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"name" text NOT NULL,
	"ssl" text DEFAULT 'generating' NOT NULL,
	"dns" text NOT NULL,
	"redirect" text DEFAULT 'none',
	"verified" boolean DEFAULT true NOT NULL,
	"health" text DEFAULT 'healthy',
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "domains_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "env_variables" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"key" text NOT NULL,
	"value" text NOT NULL,
	"environments" jsonb DEFAULT '["production"]'::jsonb
);
--> statement-breakpoint
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deployments" ADD CONSTRAINT "deployments_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "domains" ADD CONSTRAINT "domains_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "env_variables" ADD CONSTRAINT "env_variables_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
*/