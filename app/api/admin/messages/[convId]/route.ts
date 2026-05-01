import { NextResponse } from "next/server";
import { eq, asc } from "drizzle-orm";
import { db } from "@/app/db";
import { adminConversations, adminMessages } from "@/app/db/schema";
import { getCurrentAdmin } from "@/lib/admin-auth";

export async function GET(_req: Request, { params }: { params: Promise<{ convId: string }> }) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { convId } = await params;

  const msgs = await db
    .select()
    .from(adminMessages)
    .where(eq(adminMessages.conversationId, convId))
    .orderBy(asc(adminMessages.createdAt));

  return NextResponse.json(msgs);
}

export async function POST(req: Request, { params }: { params: Promise<{ convId: string }> }) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { convId } = await params;
  const { text } = await req.json();

  if (!text?.trim()) return NextResponse.json({ error: "Text required" }, { status: 400 });

  const [conv] = await db.select().from(adminConversations).where(eq(adminConversations.id, convId)).limit(1);
  if (!conv) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const [msg] = await db.insert(adminMessages).values({
    conversationId: convId,
    senderId: admin.id,
    senderType: "admin",
    text: text.trim(),
  }).returning();

  await db.update(adminConversations).set({ lastMessageAt: new Date() }).where(eq(adminConversations.id, convId));

  return NextResponse.json(msg, { status: 201 });
}