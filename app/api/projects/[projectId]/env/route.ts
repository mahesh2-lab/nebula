import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getEnvVars, createEnvVar } from "@/lib/db/queries";

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
    const list = await getEnvVars(projectId);
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
    const body = await req.json();

    if (!body.key || !body.value) {
      return NextResponse.json({ error: "Missing key or value" }, { status: 400 });
    }

    const newVar = await createEnvVar({
      id: Math.random().toString(36).substring(7),
      projectId,
      key: body.key,
      value: body.value,
      environments: body.environments || ['production']
    });

    return NextResponse.json(newVar, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
