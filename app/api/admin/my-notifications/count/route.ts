import { NextResponse } from "next/server";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/app/db";
import { notifications } from "@/app/db/schema";
import { getCurrentAdmin } from "@/lib/admin-auth";

export async function GET() {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return NextResponse.json({ count: 0 });

    const unread = await db
      .select()
      .from(notifications)
      .where(and(eq(notifications.recipientId, admin.id), isNull(notifications.readAt)));

    return NextResponse.json({ count: unread.length });
  } catch (error) {
    return NextResponse.json({ count: 0 });
  }
}