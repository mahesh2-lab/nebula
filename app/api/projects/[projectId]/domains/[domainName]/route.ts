import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { deleteDomain } from "@/lib/db/queries";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string; domainName: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { projectId, domainName } = await params;
    const decodedDomain = decodeURIComponent(domainName);
    const deleted = await deleteDomain(projectId, decodedDomain);
    if (!deleted) {
      return NextResponse.json({ error: "Domain not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, deletedDomain: deleted });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
