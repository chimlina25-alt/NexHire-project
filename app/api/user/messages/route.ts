import { NextResponse } from "next/server";
import { eq, desc, asc } from "drizzle-orm";
import { db } from "@/app/db";
import { adminConversations, adminMessages, adminAccounts } from "@/app/db/schema";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser("auth");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [conv] = await db
    .select()
    .from(adminConversations)
    .where(eq(adminConversations.userId, user.id))
    .limit(1);

  if (!conv) return NextResponse.json({ conversation: null, messages: [] });

  const msgs = await db
    .select()
    .from(adminMessages)
    .where(eq(adminMessages.conversationId, conv.id))
    .orderBy(asc(adminMessages.createdAt));

  return NextResponse.json({ conversation: conv, messages: msgs });
}

export async function POST(req: Request) {
  const user = await getCurrentUser("auth");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { text } = await req.json();
  if (!text?.trim()) return NextResponse.json({ error: "Text required" }, { status: 400 });

  const [admin] = await db.select().from(adminAccounts).limit(1);
  if (!admin) return NextResponse.json({ error: "Admin not found" }, { status: 404 });

  let [conv] = await db
    .select()
    .from(adminConversations)
    .where(eq(adminConversations.userId, user.id))
    .limit(1);

  if (!conv) {
    [conv] = await db.insert(adminConversations).values({
      adminId: admin.id,
      userId: user.id,
      userRole: user.role || "job_seeker",
    }).returning();
  }

  const [msg] = await db.insert(adminMessages).values({
    conversationId: conv.id,
    senderId: user.id,
    senderType: "user",
    text: text.trim(),
  }).returning();

  await db.update(adminConversations).set({ lastMessageAt: new Date() }).where(eq(adminConversations.id, conv.id));

  return NextResponse.json(msg, { status: 201 });
}