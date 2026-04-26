import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/db";
import { messages, messageDeletes } from "@/app/db/schema";
import { eq, and } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

// PATCH — edit your own message within 15 minutes
export async function PATCH(
  req: NextRequest,
  { params }: { params: { messageId: string } }
) {
  try {
    const user = await getCurrentUser("auth");
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [message] = await db
      .select()
      .from(messages)
      .where(
        and(
          eq(messages.id, params.messageId),
          eq(messages.senderId, user.id)
        )
      )
      .limit(1);

    if (!message) {
      return NextResponse.json(
        { error: "Message not found or you did not send it" },
        { status: 404 }
      );
    }

    const ageMs = Date.now() - new Date(message.createdAt).getTime();
    if (ageMs > 15 * 60 * 1000) {
      return NextResponse.json(
        { error: "Edit window of 15 minutes has expired" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const text = body.text?.trim();

    if (!text) {
      return NextResponse.json(
        { error: "text is required" },
        { status: 400 }
      );
    }

    const [updated] = await db
      .update(messages)
      .set({ text, editedAt: new Date() })
      .where(eq(messages.id, params.messageId))
      .returning();

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[PATCH /api/messages/[messageId]]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// DELETE — soft-delete for this user only (other participant still sees it)
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { messageId: string } }
) {
  try {
    const user = await getCurrentUser("auth");
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Confirm the message actually exists
    const [message] = await db
      .select()
      .from(messages)
      .where(eq(messages.id, params.messageId))
      .limit(1);

    if (!message) {
      return NextResponse.json(
        { error: "Message not found" },
        { status: 404 }
      );
    }

    // Insert soft-delete record; unique index prevents duplicates silently
    await db
      .insert(messageDeletes)
      .values({
        messageId: params.messageId,
        userId:    user.id,
      })
      .onConflictDoNothing();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/messages/[messageId]]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}