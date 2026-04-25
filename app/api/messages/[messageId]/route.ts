import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/app/db";
import { messageDeletes, messages } from "@/app/db/schema";
import { getCurrentUser } from "@/lib/auth";

const EDIT_WINDOW_MS = 15 * 60 * 1000;

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ messageId: string }> }
) {
  try {
    const me = await getCurrentUser("auth");

    if (!me) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { messageId } = await context.params;
    const body = await req.json();

    const [message] = await db
      .select()
      .from(messages)
      .where(eq(messages.id, messageId))
      .limit(1);

    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    if (message.senderId !== me.id) {
      return NextResponse.json({ error: "Only sender can edit" }, { status: 403 });
    }

    const tooLate =
      Date.now() - new Date(message.createdAt).getTime() > EDIT_WINDOW_MS;

    if (tooLate) {
      return NextResponse.json({ error: "Edit window expired" }, { status: 400 });
    }

    const [updated] = await db
      .update(messages)
      .set({
        text: body.text,
        editedAt: new Date(),
      })
      .where(eq(messages.id, messageId))
      .returning();

    return NextResponse.json(updated);
  } catch (error) {
    console.error("EDIT MESSAGE ERROR:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _: NextRequest,
  context: { params: Promise<{ messageId: string }> }
) {
  try {
    const me = await getCurrentUser("auth");

    if (!me) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { messageId } = await context.params;

    const [message] = await db
      .select()
      .from(messages)
      .where(eq(messages.id, messageId))
      .limit(1);

    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    await db
      .insert(messageDeletes)
      .values({
        messageId: message.id,
        userId: me.id,
      })
      .onConflictDoNothing();

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE MESSAGE ERROR:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
