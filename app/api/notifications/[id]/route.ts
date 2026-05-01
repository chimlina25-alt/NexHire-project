// app/api/notifications/[id]/route.ts
// FULL REPLACEMENT - adds DELETE on top of existing read POST

import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { db } from "@/app/db";
import { notifications } from "@/app/db/schema";
import { getCurrentUser } from "@/lib/auth";

// Mark one notification as read
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getCurrentUser("auth");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await db
    .update(notifications)
    .set({ readAt: new Date() })
    .where(and(eq(notifications.id, id), eq(notifications.recipientId, user.id)));

  return NextResponse.json({ success: true });
}

// Delete a notification
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getCurrentUser("auth");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [notification] = await db
    .select()
    .from(notifications)
    .where(and(eq(notifications.id, id), eq(notifications.recipientId, user.id)))
    .limit(1);

  if (!notification) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await db
    .delete(notifications)
    .where(and(eq(notifications.id, id), eq(notifications.recipientId, user.id)));

  return NextResponse.json({ success: true });
}