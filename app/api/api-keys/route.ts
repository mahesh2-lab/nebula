import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getApiKeys, createApiKey } from "@/lib/db/queries";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const list = await getApiKeys();
    return NextResponse.json(list);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();

    if (!body.name) {
      return NextResponse.json({ error: "Missing key name" }, { status: 400 });
    }

    const randomHash = Math.random().toString(16).substring(2, 14);
    const newToken = `neb_live_${randomHash}01a2b3c4d5e`;

    const newKey = await createApiKey({
      id: Math.random().toString(),
      name: body.name,
      token: newToken,
      prefix: `neb_live_${randomHash.substring(0, 4)}...`,
      scope: body.scope || 'Read',
      userId: '1' // mock admin or linked user id
    });

    return NextResponse.json(newKey, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
