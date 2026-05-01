import { NextResponse } from "next/server";
import { eq, desc } from "drizzle-orm";
import { db } from "@/app/db";
import {
  adminConversations, adminMessages, users,
  jobSeekerProfiles, employerProfiles
} from "@/app/db/schema";
import { getCurrentAdmin } from "@/lib/admin-auth";

export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const convs = await db
    .select()
    .from(adminConversations)
    .where(eq(adminConversations.adminId, admin.id))
    .orderBy(desc(adminConversations.lastMessageAt));

  const enriched = await Promise.all(convs.map(async (conv) => {
    const [user] = await db.select().from(users).where(eq(users.id, conv.userId)).limit(1);
    let displayName = user?.email || "User";
    let profileImage: string | null = null;

    if (conv.userRole === "job_seeker") {
      const [p] = await db.select().from(jobSeekerProfiles).where(eq(jobSeekerProfiles.userId, conv.userId)).limit(1);
      if (p) { displayName = `${p.firstName} ${p.lastName}`.trim(); profileImage = p.profileImage; }
    } else {
      const [p] = await db.select().from(employerProfiles).where(eq(employerProfiles.userId, conv.userId)).limit(1);
      if (p) { displayName = p.companyName; profileImage = p.profileImage; }
    }

    const [lastMsg] = await db
      .select()
      .from(adminMessages)
      .where(eq(adminMessages.conversationId, conv.id))
      .orderBy(desc(adminMessages.createdAt))
      .limit(1);

    return { ...conv, displayName, profileImage, lastMessage: lastMsg?.text || "", lastMessageTime: lastMsg?.createdAt || conv.lastMessageAt };
  }));

  return NextResponse.json(enriched);
}

export async function POST(req: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { userId } = await req.json();
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const [existing] = await db
    .select()
    .from(adminConversations)
    .where(eq(adminConversations.userId, userId))
    .limit(1);

  if (existing) return NextResponse.json(existing);

  const [conv] = await db.insert(adminConversations).values({
    adminId: admin.id,
    userId,
    userRole: user.role || "job_seeker",
  }).returning();

  return NextResponse.json(conv, { status: 201 });
}