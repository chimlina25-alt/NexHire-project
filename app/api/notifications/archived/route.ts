import { NextResponse } from "next/server";
import { eq, desc, and, isNotNull } from "drizzle-orm";
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
        isNotNull(notifications.archivedAt) // ✅ only archived
      )
    )
    .orderBy(desc(notifications.createdAt))
    .limit(50);

  return NextResponse.json(result);
}