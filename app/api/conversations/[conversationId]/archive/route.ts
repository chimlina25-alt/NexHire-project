import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/app/db";
import { conversationArchives, conversations } from "@/app/db/schema";
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

  await db
    .insert(conversationArchives)
    .values({ conversationId, userId: user.id })
    .onConflictDoNothing();

  return NextResponse.json({ success: true });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  const { conversationId } = await params;
  const user = await getCurrentUser("auth");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await db
    .delete(conversationArchives)
    .where(
      and(
        eq(conversationArchives.conversationId, conversationId),
        eq(conversationArchives.userId, user.id)
      )
    );

  return NextResponse.json({ success: true });
}