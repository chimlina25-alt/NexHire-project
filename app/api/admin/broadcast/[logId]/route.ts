import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { db } from "@/app/db";
import { broadcastLogs, notifications } from "@/app/db/schema";
import { getCurrentAdmin } from "@/lib/admin-auth";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ logId: string }> }
) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { logId } = await params;
    const body = await req.json();
    const { message } = body;

    if (!message?.trim()) {
      return NextResponse.json({ error: "Message required" }, { status: 400 });
    }

    // Find the log and make sure it belongs to this admin
    const [log] = await db
      .select()
      .from(broadcastLogs)
      .where(
        and(
          eq(broadcastLogs.id, logId),
          eq(broadcastLogs.adminId, admin.id)
        )
      )
      .limit(1);

    if (!log) {
      return NextResponse.json({ error: "Broadcast not found" }, { status: 404 });
    }

    // Update the broadcast log message
    const [updated] = await db
      .update(broadcastLogs)
      .set({
        message: message.trim(),
        updatedAt: new Date(),
      })
      .where(eq(broadcastLogs.id, logId))
      .returning();

    // Also update all the notification descriptions that were sent with this broadcast
    // Match by description = old message and meta broadcast = true
    // We use the original message to find matching notifications
    await db
      .update(notifications)
      .set({
        description: message.trim(),
      })
      .where(
        and(
          eq(notifications.description, log.message),
          eq(notifications.title, "Announcement from NexHire")
        )
      );

    return NextResponse.json(updated);
  } catch (error) {
    console.error("BROADCAST PATCH ERROR:", error);
    return NextResponse.json(
      { error: "Internal server error: " + String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ logId: string }> }
) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { logId } = await params;

    // Find the log and make sure it belongs to this admin
    const [log] = await db
      .select()
      .from(broadcastLogs)
      .where(
        and(
          eq(broadcastLogs.id, logId),
          eq(broadcastLogs.adminId, admin.id)
        )
      )
      .limit(1);

    if (!log) {
      return NextResponse.json({ error: "Broadcast not found" }, { status: 404 });
    }

    // Delete all matching notifications that were sent with this broadcast
    await db
      .delete(notifications)
      .where(
        and(
          eq(notifications.description, log.message),
          eq(notifications.title, "Announcement from NexHire")
        )
      );

    // Delete the broadcast log
    await db
      .delete(broadcastLogs)
      .where(eq(broadcastLogs.id, logId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("BROADCAST DELETE ERROR:", error);
    return NextResponse.json(
      { error: "Internal server error: " + String(error) },
      { status: 500 }
    );
  }
}