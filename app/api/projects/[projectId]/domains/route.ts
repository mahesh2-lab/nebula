import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getDomains, createDomain, getProjectById } from "@/lib/db/queries";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { projectId } = await params;
    const userId = (session.user as any)?.id;
    const project = await getProjectById(projectId, userId);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    const list = await getDomains(projectId);
    return NextResponse.json(list);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { projectId } = await params;
    const userId = (session.user as any)?.id;
    const project = await getProjectById(projectId, userId);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    const body = await req.json();

    if (!body.name) {
      return NextResponse.json({ error: "Missing domain name" }, { status: 400 });
    }

    const newDomain = await createDomain({
      id: Math.random().toString(36).substring(7),
      projectId,
      name: body.name,
      ssl: body.ssl || 'generating',
      dns: body.dns || `CNAME: cname.nebula-dns.com`,
      redirect: body.redirect || 'none',
      verified: body.verified !== undefined ? body.verified : true,
      health: body.health || 'healthy'
    });

    return NextResponse.json(newDomain, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
