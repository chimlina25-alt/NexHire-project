import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/app/db";
import { conversationDeletes, messageDeletes, messages, conversations } from "@/app/db/schema";
import { getCurrentUser } from "@/lib/auth";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  const { conversationId } = await params;
  const user = await getCurrentUser("auth");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [conv] = await db
    .select()
    .from(conversations)
    .where(eq(conversations.id, conversationId))
    .limit(1);

  if (!conv) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (conv.employerId !== user.id && conv.jobSeekerId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Mark conversation as deleted for this user
  await db
    .insert(conversationDeletes)
    .values({ conversationId, userId: user.id })
    .onConflictDoNothing();

  // Also mark ALL messages in this conversation as deleted for this user
  // so if conversation is somehow restored, messages are gone too
  const allMessages = await db
    .select({ id: messages.id })
    .from(messages)
    .where(eq(messages.conversationId, conversationId));

  for (const msg of allMessages) {
    await db
      .insert(messageDeletes)
      .values({ messageId: msg.id, userId: user.id })
      .onConflictDoNothing();
  }

  return NextResponse.json({ success: true });
}