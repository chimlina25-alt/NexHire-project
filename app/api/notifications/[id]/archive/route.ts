import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { db } from "@/app/db";
import { notifications } from "@/app/db/schema";
import { getCurrentUser } from "@/lib/auth";

// Archive
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getCurrentUser("auth");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await db
    .update(notifications)
    .set({ archivedAt: new Date() })
    .where(and(eq(notifications.id, id), eq(notifications.recipientId, user.id)));

  return NextResponse.json({ success: true });
}

// Unarchive/Restore
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getCurrentUser("auth");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await db
    .update(notifications)
    .set({ archivedAt: null })
    .where(and(eq(notifications.id, id), eq(notifications.recipientId, user.id)));

  return NextResponse.json({ success: true });
}