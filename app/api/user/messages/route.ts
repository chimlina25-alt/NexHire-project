import { NextResponse } from "next/server";
import { eq, asc } from "drizzle-orm";
import { db } from "@/app/db";
import { adminConversations, adminMessages, adminAccounts, adminMessageReads } from "@/app/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { uploadFile } from "@/lib/file-upload";

export async function GET() {
  const user = await getCurrentUser("auth");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [conv] = await db.select().from(adminConversations).where(eq(adminConversations.userId, user.id)).limit(1);
  if (!conv) return NextResponse.json({ conversation: null, messages: [] });

  const msgs = await db.select().from(adminMessages).where(eq(adminMessages.conversationId, conv.id)).orderBy(asc(adminMessages.createdAt));

  for (const msg of msgs) {
    if (msg.senderType === "admin") {
      await db.insert(adminMessageReads).values({ messageId: msg.id, userId: user.id }).onConflictDoNothing();
    }
  }

  const allReads = await db.select().from(adminMessageReads);

  const result = await Promise.all(
    msgs.map(async (msg) => {
      const otherUserId = msg.senderType === "user" ? conv.adminId : user.id;
      const isRead = allReads.some((r) => r.messageId === msg.id && r.userId === otherUserId);

      let replyTo = null;
      if (msg.replyToId) {
        const [parent] = await db.select().from(adminMessages).where(eq(adminMessages.id, msg.replyToId)).limit(1);
        if (parent) replyTo = { id: parent.id, text: parent.text, senderId: parent.senderId, senderType: parent.senderType, attachmentName: parent.attachmentName };
      }
      return { ...msg, isRead, replyTo };
    })
  );

  return NextResponse.json({ conversation: conv, messages: result });
}

export async function POST(req: Request) {
  const user = await getCurrentUser("auth");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [admin] = await db.select().from(adminAccounts).limit(1);
  if (!admin) return NextResponse.json({ error: "Admin not found" }, { status: 404 });

  let [conv] = await db.select().from(adminConversations).where(eq(adminConversations.userId, user.id)).limit(1);
  if (!conv) {
    [conv] = await db.insert(adminConversations).values({ adminId: admin.id, userId: user.id, userRole: user.role || "job_seeker" }).returning();
  }

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

  if (!text && !attachmentUrl) return NextResponse.json({ error: "Text required" }, { status: 400 });

  const [msg] = await db.insert(adminMessages).values({
    conversationId: conv.id, senderId: user.id, senderType: "user",
    text: text ?? null, attachmentUrl: attachmentUrl ?? null,
    attachmentName: attachmentName ?? null, attachmentType: attachmentType ?? null,
    replyToId: replyToId ?? null,
  }).returning();

  await db.update(adminConversations).set({ lastMessageAt: new Date() }).where(eq(adminConversations.id, conv.id));
  return NextResponse.json({ ...msg, isRead: false, replyTo: null }, { status: 201 });
}