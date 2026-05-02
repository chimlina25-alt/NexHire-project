import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { db } from "@/app/db";
import { adminConversations } from "@/app/db/schema";
import { getCurrentAdmin } from "@/lib/admin-auth";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ convId: string }> }
) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { convId } = await params;

  await db.update(adminConversations)
    .set({ archived: true })
    .where(and(
      eq(adminConversations.id, convId),
      eq(adminConversations.adminId, admin.id)
    ));

  return NextResponse.json({ success: true });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ convId: string }> }
) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { convId } = await params;

  await db.update(adminConversations)
    .set({ archived: false })
    .where(and(
      eq(adminConversations.id, convId),
      eq(adminConversations.adminId, admin.id)
    ));

  return NextResponse.json({ success: true });
}