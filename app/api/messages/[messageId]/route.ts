import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { db } from "@/app/db";
import { messages, messageDeletes } from "@/app/db/schema";
import { getCurrentUser } from "@/lib/auth";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ messageId: string }> }
) {
  const { messageId } = await params;
  const user = await getCurrentUser("auth");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [message] = await db
    .select()
    .from(messages)
    .where(eq(messages.id, messageId))
    .limit(1);

  if (!message) return NextResponse.json({ error: "Message not found" }, { status: 404 });
  if (message.senderId !== user.id)
    return NextResponse.json({ error: "You can only edit your own messages" }, { status: 403 });
  if (Date.now() - new Date(message.createdAt).getTime() > 15 * 60 * 1000)
    return NextResponse.json({ error: "Edit window has expired (15 minutes)" }, { status: 403 });

  const body = await req.json();
  if (!body.text?.trim())
    return NextResponse.json({ error: "Text required" }, { status: 400 });

  const [updated] = await db
    .update(messages)
    .set({ text: body.text.trim(), editedAt: new Date() })
    .where(eq(messages.id, messageId))
    .returning();

  return NextResponse.json(updated);
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ messageId: string }> }
) {
  const { messageId } = await params;
  const user = await getCurrentUser("auth");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const forEveryone = searchParams.get("everyone") === "true";

  const [message] = await db
    .select()
    .from(messages)
    .where(eq(messages.id, messageId))
    .limit(1);

  if (!message) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (forEveryone) {
    // Only sender can delete for everyone
    if (message.senderId !== user.id)
      return NextResponse.json({ error: "You can only delete your own messages for everyone" }, { status: 403 });
    // Hard delete the message text and attachment, keep row
    await db
      .update(messages)
      .set({ text: null, attachmentUrl: null, attachmentName: null, attachmentType: null, deletedBySender: true })
      .where(eq(messages.id, messageId));
    return NextResponse.json({ success: true, deletedForEveryone: true });
  }

  // Delete for me only
  await db
    .insert(messageDeletes)
    .values({ messageId, userId: user.id })
    .onConflictDoNothing();

  return NextResponse.json({ success: true, deletedForEveryone: false });
}