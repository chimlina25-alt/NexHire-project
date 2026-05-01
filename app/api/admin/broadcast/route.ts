import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/app/db";
import { users, notifications } from "@/app/db/schema";
import { getCurrentAdmin } from "@/lib/admin-auth";

export async function POST(req: Request) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { message, audience } = body;

    if (!message?.trim()) {
      return NextResponse.json({ error: "Message required" }, { status: 400 });
    }

    // Get target users
    let targetUsers: { id: string }[] = [];

    if (audience === "All Users") {
      targetUsers = await db.select({ id: users.id }).from(users);
    } else if (audience === "Employers") {
      targetUsers = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.role, "employer"));
    } else if (audience === "Job Seekers") {
      targetUsers = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.role, "job_seeker"));
    }

    // Insert notifications in batches
    const batchSize = 100;
    for (let i = 0; i < targetUsers.length; i += batchSize) {
      const batch = targetUsers.slice(i, i + batchSize);
      const values = batch.map((u) => ({
        recipientId: u.id,
        type: "system" as const,
        title: "Announcement from NexHire",
        description: message.trim(),
        link: null,
        meta: { broadcast: true, audience } as Record<string, unknown>,
      }));
      if (values.length > 0) {
        await db.insert(notifications).values(values);
      }
    }

    return NextResponse.json({ success: true, sent: targetUsers.length });
  } catch (error) {
    console.error("BROADCAST ERROR:", error);
    return NextResponse.json(
      { error: "Internal server error: " + String(error) },
      { status: 500 }
    );
  }
}