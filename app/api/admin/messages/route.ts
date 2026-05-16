import { NextResponse } from "next/server";
import { eq, desc } from "drizzle-orm";
import { db } from "@/app/db";
import {
  adminConversations, adminMessages,
  jobSeekerProfiles, employerProfiles, users,
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

  const result = await Promise.all(
    convs.map(async (conv) => {
      const [lastMsg] = await db
        .select()
        .from(adminMessages)
        .where(eq(adminMessages.conversationId, conv.id))
        .orderBy(desc(adminMessages.createdAt))
        .limit(1);

      let displayName = "User";
      let profileImage: string | null = null;

      // Get user role from users table as source of truth
      const [u] = await db
        .select()
        .from(users)
        .where(eq(users.id, conv.userId))
        .limit(1);

      const role = u?.role || conv.userRole;

      if (role === "job_seeker") {
        const [profile] = await db
          .select()
          .from(jobSeekerProfiles)
          .where(eq(jobSeekerProfiles.userId, conv.userId))
          .limit(1);
        if (profile) {
          displayName = `${profile.firstName} ${profile.lastName}`.trim() || "Job Seeker";
          profileImage = profile.profileImage;
        }
      } else if (role === "employer") {
        const [profile] = await db
          .select()
          .from(employerProfiles)
          .where(eq(employerProfiles.userId, conv.userId))
          .limit(1);
        if (profile) {
          displayName = profile.companyName || "Employer";
          profileImage = profile.profileImage;
        }
      }

      return {
        id: conv.id,
        adminId: conv.adminId,
        userId: conv.userId,
        userRole: role || "job_seeker",
        archived: conv.archived,
        lastMessageAt: conv.lastMessageAt,
        lastMessage: lastMsg?.text || "",
        displayName,
        profileImage,
      };
    })
  );

  return NextResponse.json(result);
}

export async function POST(req: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { userId } = await req.json();
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

  const [u] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!u) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const [existing] = await db
    .select()
    .from(adminConversations)
    .where(eq(adminConversations.userId, userId))
    .limit(1);

  if (existing) {
    if (existing.archived) {
      await db
        .update(adminConversations)
        .set({ archived: false })
        .where(eq(adminConversations.id, existing.id));
    }
    return NextResponse.json(existing);
  }

  const [conv] = await db
    .insert(adminConversations)
    .values({
      adminId: admin.id,
      userId,
      userRole: u.role || "job_seeker",
    })
    .returning();

  return NextResponse.json(conv, { status: 201 });
}