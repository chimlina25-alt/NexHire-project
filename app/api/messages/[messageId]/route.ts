import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { db } from "@/app/db";
import { messages, messageDeletes } from "@/app/db/schema";
import { getCurrentUser } from "@/lib/auth";

export async function PATCH(req: Request, { params }: { params: Promise<{ messageId: string }> }) {
  const { messageId } = await params;
  const user = await getCurrentUser("auth");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [message] = await db
    .select()
    .from(messages)
    .where(and(eq(messages.id, messageId), eq(messages.senderId, user.id)))
    .limit(1);

  if (!message) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // 15-minute edit window
  const createdAt = new Date(message.createdAt).getTime();
  const now = Date.now();
  if (now - createdAt > 15 * 60 * 1000) {
    return NextResponse.json({ error: "Edit window has expired (15 minutes)" }, { status: 403 });
  }

  const { text } = await req.json();
  if (!text?.trim()) return NextResponse.json({ error: "Text required" }, { status: 400 });

  const [updated] = await db
    .update(messages)
    .set({ text: text.trim(), editedAt: new Date() })
    .where(eq(messages.id, messageId))
    .returning();

  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ messageId: string }> }) {
  const { messageId } = await params;
  const user = await getCurrentUser("auth");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [message] = await db.select().from(messages).where(eq(messages.id, messageId)).limit(1);
  if (!message) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (message.senderId !== user.id) {
    return NextResponse.json({ error: "Can only delete your own messages" }, { status: 403 });
  }

  // Soft delete for sender only
  await db.insert(messageDeletes).values({ messageId, userId: user.id }).onConflictDoNothing();

  return NextResponse.json({ success: true });
}