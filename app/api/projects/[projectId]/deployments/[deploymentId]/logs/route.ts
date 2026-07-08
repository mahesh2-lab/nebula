import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getProjectById } from "@/lib/db/queries";
import { db } from "@/lib/db";
import { deployments } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string; deploymentId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { projectId, deploymentId } = await params;
    const userId = (session.user as any)?.id;
    const project = await getProjectById(projectId, userId);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // 1. Fetch deployment from DB
    const dep = await db.query.deployments.findFirst({
      where: eq(deployments.id, deploymentId)
    });

    if (!dep) {
      return NextResponse.json({ error: "Deployment not found" }, { status: 404 });
    }

    // 2. If status is building or queued, fetch from Socket Server Express API
    if ((dep.status === 'queued' || dep.status === 'building') && !dep.logs) {
      try {
        const socketServerUrl = process.env.SOCKET_SERVER_API_URL || 'http://localhost:9000';
        const res = await fetch(`${socketServerUrl}/logs/${deploymentId}`);
        if (res.ok) {
          const data = await res.json();
          return NextResponse.json({ logs: data.logs || "" });
        }
      } catch (err: any) {
        console.error(`[Logs API] Failed to fetch active logs from socket server:`, err.message);
      }
    }

    // 3. Fallback/default: return stored logs from DB
    return NextResponse.json({ logs: dep.logs || "" });
  } catch (err: any) {
    console.error("[Logs API] Unexpected error:", err);
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}
