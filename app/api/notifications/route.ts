import { NextResponse } from "next/server";
import { eq, desc, isNull, and } from "drizzle-orm";
import { db } from "@/app/db";
import { notifications } from "@/app/db/schema";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser("auth");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const result = await db
    .select()
    .from(notifications)
    .where(
      and(
        eq(notifications.recipientId, user.id),
        isNull(notifications.archivedAt) // ✅ exclude archived
      )
    )
    .orderBy(desc(notifications.createdAt))
    .limit(50);

  return NextResponse.json(result);
}

export async function POST() {
  const user = await getCurrentUser("auth");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await db
    .update(notifications)
    .set({ readAt: new Date() })
    .where(
      and(
        eq(notifications.recipientId, user.id),
        isNull(notifications.readAt),
        isNull(notifications.archivedAt) // ✅ don't mark archived ones as read
      )
    );

  return NextResponse.json({ success: true });
}