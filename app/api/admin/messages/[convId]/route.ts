import { NextResponse } from "next/server";
import { eq, asc } from "drizzle-orm";
import { db } from "@/app/db";
import { adminConversations, adminMessages, adminMessageReads } from "@/app/db/schema";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { uploadFile } from "@/lib/file-upload";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ convId: string }> }
) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { convId } = await params;

  const msgs = await db.select().from(adminMessages).where(eq(adminMessages.conversationId, convId)).orderBy(asc(adminMessages.createdAt));

  for (const msg of msgs) {
    if (msg.senderType === "user") {
      await db.insert(adminMessageReads).values({ messageId: msg.id, userId: admin.id }).onConflictDoNothing();
    }
  }

  const allReads = await db.select().from(adminMessageReads);

  const result = await Promise.all(
    msgs.map(async (msg) => {
      const [conv] = await db.select().from(adminConversations).where(eq(adminConversations.id, convId)).limit(1);
      const otherUserId = msg.senderType === "admin" ? conv?.userId : admin.id;
      const isRead = allReads.some((r) => r.messageId === msg.id && r.userId === otherUserId);

      let replyTo = null;
      if (msg.replyToId) {
        const [parent] = await db.select().from(adminMessages).where(eq(adminMessages.id, msg.replyToId)).limit(1);
        if (parent) replyTo = { id: parent.id, text: parent.text, senderId: parent.senderId, senderType: parent.senderType, attachmentName: parent.attachmentName };
      }
      return { ...msg, isRead, replyTo };
    })
  );

  return NextResponse.json(result);
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ convId: string }> }
) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { convId } = await params;

  const [conv] = await db.select().from(adminConversations).where(eq(adminConversations.id, convId)).limit(1);
  if (!conv) return NextResponse.json({ error: "Not found" }, { status: 404 });

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

  const [msg] = await db.insert(adminMessages).values({
    conversationId: convId, senderId: admin.id, senderType: "admin",
    text: text ?? null, attachmentUrl: attachmentUrl ?? null,
    attachmentName: attachmentName ?? null, attachmentType: attachmentType ?? null,
    replyToId: replyToId ?? null,
  }).returning();

  await db.update(adminConversations).set({ lastMessageAt: new Date() }).where(eq(adminConversations.id, convId));
  return NextResponse.json({ ...msg, isRead: false, replyTo: null }, { status: 201 });
}