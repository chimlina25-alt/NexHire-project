// app/api/conversations/[id]/messages/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { eq, asc, and, notInArray } from "drizzle-orm";
import { db } from "@/app/db";
import {
  messages,
  conversations,
  notifications,
  messageDeletes,
} from "@/app/db/schema";
import { requireUser } from "@/lib/require-employer";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await requireUser();
  if (auth.error) return auth.error;

  const [conv] = await db
    .select()
    .from(conversations)
    .where(eq(conversations.id, id))
    .limit(1);

  if (!conv) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (conv.employerId !== auth.user.id && conv.jobSeekerId !== auth.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Get messages NOT deleted by this user
  const myDeletes = await db
    .select({ messageId: messageDeletes.messageId })
    .from(messageDeletes)
    .where(eq(messageDeletes.userId, auth.user.id));
  const deletedIds = myDeletes.map((d) => d.messageId);

  const rows = await db
    .select()
    .from(messages)
    .where(
      deletedIds.length
        ? and(
            eq(messages.conversationId, id),
            notInArray(messages.id, deletedIds)
          )
        : eq(messages.conversationId, id)
    )
    .orderBy(asc(messages.createdAt));

  return NextResponse.json(rows);
}

const sendSchema = z.object({
  text: z.string().min(1).max(5000),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await requireUser();
  if (auth.error) return auth.error;

  const body = await req.json();
  const parsed = sendSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  const [conv] = await db
    .select()
    .from(conversations)
    .where(eq(conversations.id, id))
    .limit(1);

  if (!conv) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (conv.employerId !== auth.user.id && conv.jobSeekerId !== auth.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [msg] = await db
    .insert(messages)
    .values({
      conversationId: id,
      senderId: auth.user.id,
      text: parsed.data.text,
    })
    .returning();

  await db
    .update(conversations)
    .set({ lastMessageAt: new Date() })
    .where(eq(conversations.id, id));

  // Notify the other party
  const recipientId =
    conv.employerId === auth.user.id ? conv.jobSeekerId : conv.employerId;

  await db.insert(notifications).values({
    recipientId,
    actorId: auth.user.id,
    type: "message",
    title: "New message",
    description: parsed.data.text.slice(0, 100),
    link: `/employer_message?conversation=${id}`,
  });

  return NextResponse.json(msg);
}