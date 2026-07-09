import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getProjectByRepository, createProject, updateProject, createDeployment, getDeployments, ensureUserInDb } from "@/lib/db/queries";
import { buildProject } from "@/lib/build/triggerBuild";
import slugify from "slugify";
import crypto from "crypto";
import { db } from "@/lib/db";
import { envVariables } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { redis } from "@/lib/redis";

// Simple helper to detect frameworks and assign default values
function detectFramework(repoName: string): {
  framework: string;
  defaultOutputDir: string;
  defaultInstallCommand: string;
  defaultBuildCommand: string;
} {
  return {
    framework: "vite",
    defaultOutputDir: "dist",
    defaultInstallCommand: "npm install",
    defaultBuildCommand: "npm run build",
  };
}

// Helper to parse owner from GitHub clone/html URL if not explicitly provided
function parseOwnerFromUrl(githubUrl: string): string | null {
  if (!githubUrl) return null;
  // Matches e.g. github.com/owner/repo or github.com:owner/repo
  const match = githubUrl.match(/github\.com[/:]([^/]+)\//);
  return match ? match[1] : null;
}

export async function POST(req: NextRequest) {
  // 1. Authenticate user session
  const session = await getServerSession(authOptions);
  if (!session || !session.user ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const token = (session as any).accessToken;
  const rawUserId = (session.user as any)?.id;

  // Resolve or recreate the database user record to prevent foreign key violations
  const dbUser = await ensureUserInDb(rawUserId, session.user.email || "", session.user.name, session.user.image);
  const userId = dbUser.id;

  // 2. Parse request payload safely
  let body: any;
  try {
    body = await req.json();
  } catch (err) {
    return NextResponse.json({ error: "Malformed request payload" }, { status: 400 });
  }

  const {
    repoId,
    repoName,
    ownerName,
    githubUrl,
    outputDirectory,
    installCommand,
    buildCommand,
    branch,
    envVars,
    rootDir,
  } = body;

  // 3. Validate request parameters
  if (!repoName || typeof repoName !== "string" || !repoName.trim()) {
    return NextResponse.json({ error: "Missing or invalid repoName" }, { status: 400 });
  }
  if (!githubUrl || typeof githubUrl !== "string" || !githubUrl.trim()) {
    return NextResponse.json({ error: "Missing or invalid githubUrl" }, { status: 400 });
  }

  const resolvedOwner = ownerName || parseOwnerFromUrl(githubUrl);
  if (!resolvedOwner) {
    return NextResponse.json({ error: "Could not resolve GitHub repository owner" }, { status: 400 });
  }

  const targetBranch = branch || "main";

  // 4. Fetch latest commit details from GitHub API
  let latestCommitHash = "";
  let latestCommitMessage = "";

  try {
    const commitResponse = await fetch(
      `https://api.github.com/repos/${resolvedOwner}/${repoName}/commits/${encodeURIComponent(targetBranch)}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
          "User-Agent": "Nebula",
        },
        cache: "no-store",
      }
    );

    if (!commitResponse.ok) {
      throw new Error(`Failed to fetch latest commit: ${commitResponse.status}`);
    }

    const commitData = await commitResponse.json();
    latestCommitHash = commitData.sha;
    latestCommitMessage = commitData.commit.message;
  } catch (error: any) {
    console.error("[Deploy API] Error fetching latest commit:", error.message || error);
    return NextResponse.json({ error: "Failed to fetch latest commit from GitHub" }, { status: 500 });
  }

  // 5. Setup Project and Deployment
  try {
    const repoSlug = slugify(repoName, { lower: true, strict: true });
    const fullRepoPath = `${resolvedOwner}/${repoName}`.toLowerCase();
    const stringifiedRepoId = repoId ? String(repoId) : "";

    // Resolve project details from DB (scoped by current userId)
    let existingProject = null;
    if (stringifiedRepoId) {
      existingProject = await getProjectByRepository(stringifiedRepoId, userId);
    }
    if (!existingProject) {
      existingProject = await getProjectByRepository(fullRepoPath, userId);
    }
    if (!existingProject) {
      existingProject = await getProjectByRepository(repoSlug, userId);
    }
    let targetProjectId: string;

    if (existingProject) {
      const projectDeps = await getDeployments(existingProject.id);
      const latestDep = projectDeps[0];
      if (latestDep) {
        console.info(`[Deploy API] Project already deployed. Returning existing project and deployment: ${existingProject.id}, ${latestDep.id}`);
        return NextResponse.json({
          projectId: existingProject.id,
          deployment: {
            id: latestDep.id,
            projectId: latestDep.projectId,
            status: latestDep.status,
            branch: latestDep.branch,
            commit: {
              message: latestDep.commitMessage || "Manual Deploy",
              hash: latestDep.commitHash || "",
              author: latestDep.commitAuthor || "System",
            },
            latency: latestDep.latency,
            region: latestDep.region,
            createdAt: latestDep.createdAt ? new Date(latestDep.createdAt).toISOString() : new Date().toISOString(),
            updatedAt: latestDep.updatedAt ? new Date(latestDep.updatedAt).toISOString() : new Date().toISOString(),
          },
          alreadyDeployed: true
        });
      }
    }

    let resolvedBuildCommand = buildCommand;
    let resolvedOutputDirectory = outputDirectory;
    let resolvedInstallCommand = installCommand;

    if (!existingProject) {
      // Setup presets based on detected framework
      const { framework, defaultOutputDir, defaultInstallCommand, defaultBuildCommand } = detectFramework(repoName);

      resolvedBuildCommand = resolvedBuildCommand || defaultBuildCommand;
      resolvedOutputDirectory = resolvedOutputDirectory || defaultOutputDir;
      resolvedInstallCommand = resolvedInstallCommand || defaultInstallCommand;

      const randomSuffix = crypto.randomUUID().split("-")[0];
      const projectId = `${repoSlug}-${randomSuffix}`;

      const newProj = await createProject({
        id: projectId,
        name: repoName,
        framework,
        repository: stringifiedRepoId || fullRepoPath,
        branch: targetBranch,
        buildCommand: resolvedBuildCommand,
        outputDirectory: resolvedOutputDirectory,
        installCommand: resolvedInstallCommand,
        userId: userId,
      });

      targetProjectId = newProj.id;
      console.info(`[Deploy API] Created new project: ${targetProjectId} (${framework})`);
    } else {
      targetProjectId = existingProject.id;

      // Fallback to existing configurations if not provided in request
      resolvedBuildCommand = resolvedBuildCommand || existingProject.buildCommand || "npm run build";
      resolvedOutputDirectory = resolvedOutputDirectory || existingProject.outputDirectory || "dist";
      resolvedInstallCommand = resolvedInstallCommand || existingProject.installCommand || "npm install";

      // Update changed configurations
      const updates: Record<string, string> = {};
      if (buildCommand && buildCommand !== existingProject.buildCommand) {
        updates.buildCommand = buildCommand;
      }
      if (outputDirectory && outputDirectory !== existingProject.outputDirectory) {
        updates.outputDirectory = outputDirectory;
      }
      if (installCommand && installCommand !== existingProject.installCommand) {
        updates.installCommand = installCommand;
      }

      if (Object.keys(updates).length > 0) {
        await updateProject(existingProject.id, updates);
        console.info(`[Deploy API] Updated build settings for project: ${targetProjectId}`);
      }
    }

    // Create deployment record
    const deploymentId = `dep-${crypto.randomUUID().replace(/-/g, "").substring(0, 12)}`;
    const deployment = await createDeployment({
      id: deploymentId,
      projectId: targetProjectId,
      status: "queued",
      branch: targetBranch,
      commitAuthor: session.user?.name || "GitHub User",
      commitHash: latestCommitHash,
      commitMessage: latestCommitMessage,
    });

    // Publish manual deployment created event to Redis
    try {
      await redis.publish(
        "global:events",
        JSON.stringify({
          type: "DEPLOYMENT_CREATED",
          projectId: targetProjectId,
          projectName: repoName,
          deploymentId: deploymentId,
            deployment: {
              id: deploymentId,
              projectId: targetProjectId,
              status: "queued",
              branch: targetBranch,
              commit: {
                message: deployment.commitMessage || "Manual Deploy",
                hash: deployment.commitHash || "",
                author: deployment.commitAuthor || "System",
              },
              createdAt: deployment.createdAt ? new Date(deployment.createdAt).toISOString() : new Date().toISOString(),
              updatedAt: deployment.updatedAt ? new Date(deployment.updatedAt).toISOString() : new Date().toISOString(),
              framework: existingProject?.framework || (existingProject ? existingProject.framework : "vite"),
            },
        })
      );
    } catch (redisErr: any) {
      console.error("[Deploy API] Redis publish failed:", redisErr.message);
    }

    // Save environment variables to the database
    await db.delete(envVariables).where(eq(envVariables.projectId, targetProjectId));
    if (Array.isArray(envVars)) {
      for (const ev of envVars) {
        if (ev.key && ev.value) {
          await db.insert(envVariables).values({
            id: crypto.randomUUID(),
            projectId: targetProjectId,
            key: ev.key,
            value: ev.value,
            environments: ["production"],
          });
        }
      }
    }

    // Map envVars for ECS build task environment variables override
    const ecsEnv = Array.isArray(envVars)
      ? envVars.map((v: { key: string; value: string }) => ({
          name: v.key,
          value: v.value,
        }))
      : [];

    // Inject token to allow cloning private repositories if using https://github.com/
    const authenticatedGithubUrl = token && githubUrl.startsWith("https://github.com/")
      ? githubUrl.replace("https://github.com/", `https://x-access-token:${token}@github.com/`)
      : githubUrl;

    // Trigger external build task (AWS Fargate)
    console.info(`[Deploy API] Triggering build task on ECS for: ${repoSlug}`);
    const buildRes = await buildProject(
      {
        projectId: targetProjectId,
        rootDir: rootDir || "./",
        githubUrl: authenticatedGithubUrl,
        buildCommand: resolvedBuildCommand,
        outputDirectory: resolvedOutputDirectory,
        installCommand: resolvedInstallCommand,
        deploymentId,
        branch: targetBranch,
      },
      ecsEnv
    );

    if (!buildRes.success) {
      console.error("[Deploy API] ECS build task failed to start:", buildRes.error);
      return NextResponse.json({ error: "Failed to schedule build task on cloud infrastructure" }, { status: 500 });
    }

    return NextResponse.json(
      {
        message: "Build is getting ready",
        projectId: targetProjectId,
        deployment,
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("[Deploy API] Unexpected error during deployment setup:", err);
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}

