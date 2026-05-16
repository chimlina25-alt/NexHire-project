import { NextResponse } from "next/server";
import { eq, and, ne } from "drizzle-orm";
import { db } from "@/app/db";
import { messages, messageReads, conversations } from "@/app/db/schema";
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

  // Mark all messages not from this user as read
  const unreadMessages = await db
    .select()
    .from(messages)
    .where(
      and(
        eq(messages.conversationId, conversationId),
        ne(messages.senderId, user.id)
      )
    );

  for (const msg of unreadMessages) {
    await db
      .insert(messageReads)
      .values({ messageId: msg.id, userId: user.id })
      .onConflictDoNothing();
  }

  return NextResponse.json({ success: true });
}