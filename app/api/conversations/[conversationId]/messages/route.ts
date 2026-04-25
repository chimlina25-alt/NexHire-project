import { NextResponse } from "next/server";
import { and, asc, eq, notInArray } from "drizzle-orm";
import { db } from "@/app/db";
import {
  conversations,
  messageDeletes,
  messages,
  notifications,
} from "@/app/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { saveUpload } from "@/lib/save-upload";

async function loadConversation(conversationId: string) {
  const [conversation] = await db
    .select()
    .from(conversations)
    .where(eq(conversations.id, conversationId))
    .limit(1);

  return conversation;
}

export async function GET(
  _: Request,
  context: { params: Promise<{ conversationId: string }> }
) {
  try {
    const me = await getCurrentUser("auth");

    if (!me) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { conversationId } = await context.params;
    const conversation = await loadConversation(conversationId);

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    const allowed =
      conversation.employerId === me.id || conversation.jobSeekerId === me.id;

    if (!allowed) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const deleted = await db
      .select({ messageId: messageDeletes.messageId })
      .from(messageDeletes)
      .where(eq(messageDeletes.userId, me.id));

    const deletedIds = deleted.map((x) => x.messageId);

    const rows = await db
      .select()
      .from(messages)
      .where(
        deletedIds.length
          ? and(
              eq(messages.conversationId, conversationId),
              notInArray(messages.id, deletedIds)
            )
          : eq(messages.conversationId, conversationId)
      )
      .orderBy(asc(messages.createdAt));

    return NextResponse.json(rows);
  } catch (error) {
    console.error("GET MESSAGES ERROR:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}

export async function POST(
  req: Request,
  context: { params: Promise<{ conversationId: string }> }
) {
  try {
    const me = await getCurrentUser("auth");

    if (!me) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { conversationId } = await context.params;
    const conversation = await loadConversation(conversationId);

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    const allowed =
      conversation.employerId === me.id || conversation.jobSeekerId === me.id;

    if (!allowed) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const form = await req.formData();
    const text = String(form.get("text") || "");
    const attachment = (form.get("attachment") as File | null) ?? null;

    if (!text && !attachment) {
      return NextResponse.json({ error: "Message cannot be empty" }, { status: 400 });
    }

    const upload = await saveUpload(attachment, "chat", undefined, 15 * 1024 * 1024);

    const [message] = await db
      .insert(messages)
      .values({
        conversationId,
        senderId: me.id,
        text: text || null,
        attachmentUrl: upload?.url ?? null,
        attachmentName: upload?.fileName ?? null,
        attachmentType: upload?.mimeType ?? null,
      })
      .returning();

    await db
      .update(conversations)
      .set({ lastMessageAt: new Date() })
      .where(eq(conversations.id, conversationId));

    const recipientId =
      conversation.employerId === me.id
        ? conversation.jobSeekerId
        : conversation.employerId;

    await db.insert(notifications).values({
      recipientId,
      actorId: me.id,
      type: "message",
      title: "New message",
      description: text
        ? text.slice(0, 120)
        : `Sent an attachment: ${upload?.fileName ?? "file"}`,
      link: me.role === "employer" ? "/message" : "/employer_message",
      meta: { conversationId, messageId: message.id },
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error("SEND MESSAGE ERROR:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
