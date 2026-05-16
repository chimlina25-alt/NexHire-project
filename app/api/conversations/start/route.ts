import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/app/db";
import { conversations, conversationDeletes } from "@/app/db/schema";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: Request) {
  const user = await getCurrentUser("auth");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { employerId, jobSeekerId } = await req.json();
  if (!employerId || !jobSeekerId) {
    return NextResponse.json({ error: "employerId and jobSeekerId required" }, { status: 400 });
  }

  // Check if one already exists (even if deleted by this user — restore it)
  const [existing] = await db
    .select()
    .from(conversations)
    .where(
      and(
        eq(conversations.employerId, employerId),
        eq(conversations.jobSeekerId, jobSeekerId)
      )
    )
    .limit(1);

  if (existing) {
    // Remove from deletes so it reappears
    await db
      .delete(conversationDeletes)
      .where(
        and(
          eq(conversationDeletes.conversationId, existing.id),
          eq(conversationDeletes.userId, user.id)
        )
      );
    return NextResponse.json(existing);
  }

  const [conv] = await db
    .insert(conversations)
    .values({ employerId, jobSeekerId })
    .returning();

  return NextResponse.json(conv, { status: 201 });
}