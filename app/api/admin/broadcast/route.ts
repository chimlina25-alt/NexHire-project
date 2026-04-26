import { NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { db } from "@/app/db";
import { notifications, users } from "@/app/db/schema";

export async function GET() {
  try {
    const rows = await db
      .select()
      .from(notifications)
      .orderBy(desc(notifications.createdAt))
      .limit(100);

    return NextResponse.json(rows);
  } catch (error) {
    console.error("ADMIN BROADCAST GET ERROR:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.title || !body.description) {
      return NextResponse.json(
        { error: "Missing title or description" },
        { status: 400 }
      );
    }

    const allUsers = await db.select({ id: users.id }).from(users);

    if (allUsers.length === 0) {
      return NextResponse.json({ ok: true, sent: 0 });
    }

    const inserts = allUsers.map((u) => ({
      recipientId: u.id,
      type: "system" as const,
      title: body.title,
      description: body.description,
      link: body.link ?? "/notification",
    }));

    await db.insert(notifications).values(inserts);

    return NextResponse.json({ ok: true, sent: inserts.length });
  } catch (error) {
    console.error("ADMIN BROADCAST POST ERROR:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}