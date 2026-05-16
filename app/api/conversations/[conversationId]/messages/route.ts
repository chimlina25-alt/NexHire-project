import { NextResponse } from "next/server";
import { eq, asc, notInArray, and } from "drizzle-orm";
import { db } from "@/app/db";
import { messages, messageDeletes, messageReads, conversations } from "@/app/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { uploadFile } from "@/lib/file-upload";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  const { conversationId } = await params;
  const user = await getCurrentUser("auth");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [conv] = await db.select().from(conversations).where(eq(conversations.id, conversationId)).limit(1);
  if (!conv) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (conv.employerId !== user.id && conv.jobSeekerId !== user.id)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const deletedByUser = await db
    .select({ messageId: messageDeletes.messageId })
    .from(messageDeletes)
    .where(eq(messageDeletes.userId, user.id));
  const deletedIds = deletedByUser.map((d) => d.messageId);

  const allMessages =
    deletedIds.length > 0
      ? await db.select().from(messages)
          .where(and(eq(messages.conversationId, conversationId), notInArray(messages.id, deletedIds)))
          .orderBy(asc(messages.createdAt))
      : await db.select().from(messages)
          .where(eq(messages.conversationId, conversationId))
          .orderBy(asc(messages.createdAt));

  for (const msg of allMessages) {
    if (msg.senderId !== user.id) {
      await db.insert(messageReads).values({ messageId: msg.id, userId: user.id }).onConflictDoNothing();
    }
  }

  const allReads = await db.select().from(messageReads);

  const result = await Promise.all(
    allMessages.map(async (msg) => {
      const otherUserId = msg.senderId === conv.employerId ? conv.jobSeekerId : conv.employerId;
      const isRead = allReads.some((r) => r.messageId === msg.id && r.userId === otherUserId);

      let replyTo = null;
      if (msg.replyToId) {
        const [parent] = await db.select().from(messages).where(eq(messages.id, msg.replyToId)).limit(1);
        if (parent) replyTo = { id: parent.id, text: parent.text, senderId: parent.senderId, attachmentName: parent.attachmentName };
      }

      return { ...msg, isRead, replyTo };
    })
  );

  return NextResponse.json(result);
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  const { conversationId } = await params;
  const user = await getCurrentUser("auth");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [conv] = await db.select().from(conversations).where(eq(conversations.id, conversationId)).limit(1);
  if (!conv) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (conv.employerId !== user.id && conv.jobSeekerId !== user.id)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  let text: string | null = null;
  let attachmentUrl: string | null = null;
  let attachmentName: string | null = null;
  let attachmentType: string | null = null;
  let replyToId: string | null = null;

  const contentType = req.headers.get("content-type") || "";
  if (contentType.includes("multipart/form-data")) {
    const formData = await req.formData();
    text = (formData.get("text") as string)?.trim() || null;
    replyToId = (formData.get("replyToId") as string) || null;
    const file = formData.get("attachment") as File | null;
    if (file && file.size > 0) {
      const uploaded = await uploadFile(file);
      if (uploaded) { attachmentUrl = uploaded.url; attachmentName = uploaded.name; attachmentType = uploaded.type; }
    }
  } else {
    const body = await req.json();
    text = body.text?.trim() || null;
    replyToId = body.replyToId || null;
  }

  if (!text && !attachmentUrl) return NextResponse.json({ error: "Text or attachment required" }, { status: 400 });

  const [msg] = await db.insert(messages).values({
    conversationId, senderId: user.id, senderType: "user",
    text: text ?? null, attachmentUrl: attachmentUrl ?? null,
    attachmentName: attachmentName ?? null, attachmentType: attachmentType ?? null,
    replyToId: replyToId ?? null,
  }).returning();

  await db.update(conversations).set({ lastMessageAt: new Date() }).where(eq(conversations.id, conversationId));
  return NextResponse.json({ ...msg, isRead: false, replyTo: null }, { status: 201 });
}