import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { revokeApiKey } from "@/lib/db/queries";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ keyId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { keyId } = await params;
    const deleted = await revokeApiKey(keyId);
    if (!deleted) {
      return NextResponse.json({ error: "API Key not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, deletedKey: deleted });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
