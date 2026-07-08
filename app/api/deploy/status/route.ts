import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { deployments, projects } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidateTag } from "next/cache";

export async function POST(req: NextRequest) {
  try {
    // Shared secret authorization check
    const authHeader = req.headers.get("authorization");
    const webhookSecret = process.env.STATUS_WEBHOOK_SECRET || "fallback_default_secret_for_dev_only";
    if (!authHeader || authHeader !== `Bearer ${webhookSecret}`) {
      console.warn(`[Deploy Status API] Unauthorized webhook status update attempt.`);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { deploymentId, status, logs } = await req.json();

    if (!deploymentId || !status) {
      return NextResponse.json({ error: "Missing deploymentId or status" }, { status: 400 });
    }

    if (status !== 'ready' && status !== 'failed' && status !== 'building') {
      return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
    }

    // 1. Update deployment status and logs
    const updatedDep = await db.update(deployments)
      .set({ status, logs, updatedAt: new Date() })
      .where(eq(deployments.id, deploymentId))
      .returning()
      .then(rows => rows[0]);

    if (!updatedDep) {
      return NextResponse.json({ error: "Deployment not found" }, { status: 404 });
    }

    // 2. Update project updatedAt
    await db.update(projects)
      .set({ updatedAt: new Date() })
      .where(eq(projects.id, updatedDep.projectId));

    // 2.5. Invalidate Next.js cache tags
    try {
      revalidateTag('deployments', 'max');
      revalidateTag(`deployments-${updatedDep.projectId}`, 'max');
      revalidateTag(`project-${updatedDep.projectId}`, 'max');
      revalidateTag('projects', 'max');
      console.info(`[Deploy Status API] Invalidated cache tags for project: ${updatedDep.projectId}`);
    } catch (cacheErr: any) {
      console.error("[Deploy Status API] Cache revalidation failed:", cacheErr.message);
    }

    // 3. Publish status update to Redis
    try {
        const { redis } = await import("@/lib/redis");
        await redis.publish("global:events", JSON.stringify({
            type: "DEPLOYMENT_STATUS_UPDATED",
            projectId: updatedDep.projectId,
            deploymentId: deploymentId,
            status: status
        }));
        console.info(`[Deploy Status API] Published DEPLOYMENT_STATUS_UPDATED for ${deploymentId}`);
    } catch (redisErr: any) {
        console.error("[Deploy Status API] Redis publish failed:", redisErr.message);
    }

    console.info(`[Deploy Status API] Updated deployment ${deploymentId} status to: ${status}`);

    return NextResponse.json({ success: true, deployment: updatedDep });
  } catch (err: any) {
    console.error("[Deploy Status API] Unexpected error:", err);
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}
