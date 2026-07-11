import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { deleteDeployment, getProjectById, updateDeploymentStatus } from "@/lib/db/queries";

export async function PATCH(
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

    const { status, logs } = await req.json();
    if (!status || (status !== 'ready' && status !== 'failed' && status !== 'building' && status !== 'queued')) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const updated = await updateDeploymentStatus(deploymentId, status, logs);
    if (!updated) {
      return NextResponse.json({ error: "Deployment not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, deployment: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(
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
    const deleted = await deleteDeployment(projectId, deploymentId);
    if (!deleted) {
      return NextResponse.json({ error: "Deployment not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, deletedDeployment: deleted });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
