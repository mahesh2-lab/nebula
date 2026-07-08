import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getProjects, createProject, ensureUserInDb } from "@/lib/db/queries";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const rawUserId = (session.user as any)?.id;
    let userId = rawUserId;
    if (session.user?.email) {
      const dbUser = await ensureUserInDb(rawUserId, session.user.email, session.user.name, session.user.image);
      userId = dbUser.id;
    }
    const list = await getProjects(userId);
    return NextResponse.json(list);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

