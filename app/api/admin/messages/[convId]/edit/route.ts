import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { db } from "@/app/db";
import { adminMessages } from "@/app/db/schema";
import { getCurrentAdmin } from "@/lib/admin-auth";

export async function PATCH(req: Request, { params }: { params: Promise<{ convId: string }> }) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { messageId, text } = await req.json();
  if (!messageId || !text?.trim()) return NextResponse.json({ error: "messageId and text required" }, { status: 400 });

  const [msg] = await db.select().from(adminMessages).where(eq(adminMessages.id, messageId)).limit(1);
  if (!msg) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (msg.senderType !== "admin" || msg.senderId !== admin.id) {
    return NextResponse.json({ error: "Cannot edit this message" }, { status: 403 });
  }

  const createdAt = new Date(msg.createdAt).getTime();
  if (Date.now() - createdAt > 15 * 60 * 1000) {
    return NextResponse.json({ error: "Edit window expired (15 minutes)" }, { status: 403 });
  }

  const [updated] = await db.update(adminMessages)
    .set({ text: text.trim(), editedAt: new Date() })
    .where(eq(adminMessages.id, messageId))
    .returning();

  return NextResponse.json(updated);
}