// app/api/conversations/[conversationId]/messages/route.ts
// FULL REPLACEMENT
// Key fix: formData field is "attachment" (from frontend), not "file"

import { NextResponse } from "next/server";
import { eq, asc } from "drizzle-orm";
import { db } from "@/app/db";
import {
  messages,
  conversations,
  messageDeletes,
  notifications,
  employerProfiles,
  jobSeekerProfiles,
} from "@/app/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { saveUpload } from "@/lib/save-upload";

export async function GET(
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

  const allMessages = await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, conversationId))
    .orderBy(asc(messages.createdAt));

  const deletedByUser = await db
    .select()
    .from(messageDeletes)
    .where(eq(messageDeletes.userId, user.id));

  const deletedIds = new Set(deletedByUser.map((d) => d.messageId));
  const filtered = allMessages.filter((m) => !deletedIds.has(m.id));

  return NextResponse.json(filtered);
}

export async function POST(
  req: Request,
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

  const contentType = req.headers.get("content-type") || "";
  let text: string | null = null;
  let attachmentUrl: string | null = null;
  let attachmentName: string | null = null;
  let attachmentType: string | null = null;

  if (contentType.includes("multipart/form-data")) {
    const formData = await req.formData();
    const rawText = String(formData.get("text") || "").trim();
    text = rawText || null;

    // Frontend sends field named "attachment"
    const file = formData.get("attachment");
    if (file instanceof File) {
      attachmentUrl = await saveUpload(file, "chat-attachments");
      attachmentName = file.name;
      attachmentType = file.type;
    }
  } else {
    const body = await req.json();
    text = body.text || null;
  }

  if (!text && !attachmentUrl) {
    return NextResponse.json({ error: "Message or attachment required" }, { status: 400 });
  }

  const [message] = await db
    .insert(messages)
    .values({
      conversationId,
      senderId: user.id,
      text,
      attachmentUrl,
      attachmentName,
      attachmentType,
    })
    .returning();

  // Update conversation lastMessageAt
  await db
    .update(conversations)
    .set({ lastMessageAt: new Date() })
    .where(eq(conversations.id, conversationId));

  // Notify the other participant
  const recipientId =
    conv.employerId === user.id ? conv.jobSeekerId : conv.employerId;

  let senderName = user.email;
  if (user.role === "employer") {
    const [ep] = await db
      .select()
      .from(employerProfiles)
      .where(eq(employerProfiles.userId, user.id))
      .limit(1);
    if (ep) senderName = ep.companyName;
  } else {
    const [sp] = await db
      .select()
      .from(jobSeekerProfiles)
      .where(eq(jobSeekerProfiles.userId, user.id))
      .limit(1);
    if (sp) senderName = `${sp.firstName} ${sp.lastName}`;
  }

  await db.insert(notifications).values({
    recipientId,
    actorId: user.id,
    type: "message",
    title: `New message from ${senderName}`,
    description: text ? text.slice(0, 100) : "Sent an attachment",
    link: user.role === "employer" ? "/employer_message" : "/message",
    meta: { conversationId, messageId: message.id },
  });

  return NextResponse.json(message, { status: 201 });
}