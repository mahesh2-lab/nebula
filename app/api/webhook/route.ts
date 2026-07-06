import { NextRequest, NextResponse } from "next/server";
import { getProjectByRepository, createDeployment, getEnvVars } from "@/lib/db/queries";
import { buildProject } from "@/lib/build/triggerBuild";
import slugify from "slugify";
import crypto from "crypto";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // 1. Handle GitHub ping event gracefully
        if (body.zen) {
            console.log("[Webhook API] Received GitHub ping event:", body.zen);
            return NextResponse.json({
                success: true,
                message: "Zen: " + body.zen
            });
        }

        const ref = body.ref;
        const repository = body.repository;

        // 2. Validate webhook payload structure
        if (!repository || !ref) {
            console.warn("[Webhook API] Invalid webhook payload structure received.");
            return NextResponse.json(
                { error: "Invalid webhook payload structure" },
                { status: 400 }
            );
        }

        const repoName = repository.name;
        const repoSlug = slugify(repoName, { lower: true, strict: true });
        console.info(`[Webhook API] Processing push event for repository: ${repoSlug}`);

        // 3. Resolve corresponding project from the database
        const project = await getProjectByRepository(repoSlug);
        if (!project) {
            console.warn(`[Webhook API] No project found matching repository: ${repoSlug}`);
            return NextResponse.json(
                { error: `Project not found for repository: ${repoSlug}` },
                { status: 404 }
            );
        }

        // 4. Verify target branch matches project's configured branch
        const branch = ref.replace("refs/heads/", "");
        if (project.branch !== branch) {
            console.info(`[Webhook API] Pushed branch (${branch}) does not match project branch (${project.branch}). Skipping build.`);
            return NextResponse.json({
                success: true,
                message: `Branch ${branch} does not match project branch ${project.branch}. Skipping deployment.`
            });
        }

        const headCommit = body.head_commit;
        const deploymentId = `dep-${crypto.randomUUID().replace(/-/g, "").substring(0, 12)}`;

        console.info(`[Webhook API] Registering deployment ${deploymentId} for project: ${project.id}`);

        // 5. Create queued deployment record in database
        const deployment = await createDeployment({
            id: deploymentId,
            projectId: project.id,
            status: "queued",
            branch: branch,
            commitAuthor: headCommit?.author?.name || headCommit?.committer?.name || "GitHub Webhook",
            commitMessage: headCommit?.message || "Automatic build from GitHub push",
            commitHash: headCommit?.id || "",
        });

        // 5.5. Publish webhook deployment created event to Redis
        try {
            const { redis } = await import("@/lib/redis");
            await redis.publish("global:events", JSON.stringify({
                type: "DEPLOYMENT_CREATED",
                projectId: project.id,
                projectName: project.name,
                deploymentId: deploymentId,
                deployment: {
                    id: deploymentId,
                    projectId: project.id,
                    status: "queued",
                    branch: branch,
                    commit: {
                        message: deployment.commitMessage || "Automatic build from GitHub push",
                        hash: deployment.commitHash || "",
                        author: deployment.commitAuthor || "GitHub Webhook",
                    },
                    latency: '0ms',
                    region: 'iad1 (US East)',
                    createdAt: deployment.createdAt ? new Date(deployment.createdAt).toISOString() : new Date().toISOString(),
                    updatedAt: deployment.updatedAt ? new Date(deployment.updatedAt).toISOString() : new Date().toISOString(),
                    framework: project.framework
                }
            }));
        } catch (redisErr: any) {
            console.error("[Webhook API] Redis publish failed:", redisErr.message);
        }

        // 6. Fetch project environment variables
        const envVars = await getEnvVars(project.id);
        const ecsEnv = Array.isArray(envVars)
            ? envVars.map((v) => ({
                name: v.key,
                value: v.value
            }))
            : [];

        console.info(`[Webhook API] Triggering ECS Fargate build task for project: ${project.id}`);

        // 7. Trigger the AWS ECS build container task
        const buildRes = await buildProject({
            projectId: project.id,
            rootDir: "./",
            githubUrl: repository.clone_url,
            buildCommand: project.buildCommand || "next build",
            outputDirectory: project.outputDirectory || ".next",
            installCommand: project.installCommand || "npm install",
            deploymentId,
            branch,
        }, ecsEnv);

        if (!buildRes.success) {
            console.error("[Webhook API] ECS build task failed to schedule:", buildRes.error);
            return NextResponse.json(
                { error: "Failed to schedule build task on cloud infrastructure" },
                { status: 500 }
            );
        }

        console.info(`[Webhook API] Build triggered successfully for project: ${project.id}`);
        return NextResponse.json({
            success: true,
            message: "Build triggered successfully via webhook",
            projectId: project.id,
            deploymentId,
            deployment
        }, { status: 201 });

    } catch (err: any) {
        console.error("[Webhook API] Unexpected error processing webhook event:", err);
        return NextResponse.json(
            { error: err.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}