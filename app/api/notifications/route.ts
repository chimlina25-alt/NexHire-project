// app/api/notifications/route.ts
import { NextResponse } from "next/server";
import { eq, desc, and, isNull, count } from "drizzle-orm";
import { db } from "@/app/db";
import { notifications } from "@/app/db/schema";
import { requireUser } from "@/lib/require-employer";

export async function GET() {
  const auth = await requireUser();
  if (auth.error) return auth.error;

  const list = await db
    .select()
    .from(notifications)
    .where(eq(notifications.recipientId, auth.user.id))
    .orderBy(desc(notifications.createdAt))
    .limit(50);

  const [{ unread }] = await db
    .select({ unread: count() })
    .from(notifications)
    .where(
      and(
        eq(notifications.recipientId, auth.user.id),
        isNull(notifications.readAt)
      )
    );

  return NextResponse.json({
    notifications: list,
    unreadCount: Number(unread),
  });
}