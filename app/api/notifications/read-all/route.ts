// app/api/notifications/read-all/route.ts
import { NextResponse } from "next/server";
import { eq, and, isNull } from "drizzle-orm";
import { db } from "@/app/db";
import { notifications } from "@/app/db/schema";
import { requireUser } from "@/lib/require-employer";

export async function POST() {
  const auth = await requireUser();
  if (auth.error) return auth.error;

  await db
    .update(notifications)
    .set({ readAt: new Date() })
    .where(
      and(
        eq(notifications.recipientId, auth.user.id),
        isNull(notifications.readAt)
      )
    );

  return NextResponse.json({ success: true });
}