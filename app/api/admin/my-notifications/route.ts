import { NextResponse } from "next/server";
import { and, eq, isNull, desc } from "drizzle-orm";
import { db } from "@/app/db";
import { notifications } from "@/app/db/schema";
import { getCurrentAdmin } from "@/lib/admin-auth";

export async function GET() {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const adminNotifs = await db
      .select()
      .from(notifications)
      .where(eq(notifications.recipientId, admin.id))
      .orderBy(desc(notifications.createdAt))
      .limit(50);

    return NextResponse.json(adminNotifs);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await req.json();
    await db.update(notifications).set({ readAt: new Date() }).where(eq(notifications.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}