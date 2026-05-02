import { NextResponse } from "next/server";
import { eq, desc, or, ilike } from "drizzle-orm";
import { db } from "@/app/db";
import {
  adminConversations, adminMessages, users,
  jobSeekerProfiles, employerProfiles
} from "@/app/db/schema";
import { getCurrentAdmin } from "@/lib/admin-auth";

export async function GET(req: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";

  // If searching, search across ALL users (not just existing conversations)
  if (search.trim()) {
    const allUsers = await db
      .select({
        id: users.id,
        email: users.email,
        role: users.role,
      })
      .from(users)
      .where(or(
        ilike(users.email, `%${search}%`),
      ))
      .limit(20);

    const results = await Promise.all(allUsers.map(async (user) => {
      let displayName = user.email || "User";
      let profileImage: string | null = null;

      if (user.role === "job_seeker") {
        const [p] = await db.select().from(jobSeekerProfiles)
          .where(eq(jobSeekerProfiles.userId, user.id)).limit(1);
        if (p) {
          const fullName = `${p.firstName} ${p.lastName}`.trim();
          if (fullName) displayName = fullName;
          profileImage = p.profileImage;
        }
      } else if (user.role === "employer") {
        const [p] = await db.select().from(employerProfiles)
          .where(eq(employerProfiles.userId, user.id)).limit(1);
        if (p) {
          if (p.companyName) displayName = p.companyName;
          profileImage = p.profileImage;
        }
      }

      // Check if displayName matches search too
      if (!displayName.toLowerCase().includes(search.toLowerCase()) &&
          !user.email.toLowerCase().includes(search.toLowerCase())) {
        return null;
      }

      // Find existing conversation
      const [existing] = await db.select().from(adminConversations)
        .where(eq(adminConversations.userId, user.id)).limit(1);

      const [lastMsg] = existing ? await db.select().from(adminMessages)
        .where(eq(adminMessages.conversationId, existing.id))
        .orderBy(desc(adminMessages.createdAt)).limit(1) : [null];

      return {
        id: existing?.id || `new_${user.id}`,
        userId: user.id,
        adminId: admin.id,
        userRole: user.role || "job_seeker",
        displayName,
        profileImage,
        lastMessage: lastMsg?.text || "",
        lastMessageAt: existing?.lastMessageAt || new Date().toISOString(),
        isNew: !existing,
        archived: existing?.archived || false,
      };
    }));

    return NextResponse.json(results.filter(Boolean));
  }

  // Default: return existing conversations (not archived)
  const convs = await db
    .select()
    .from(adminConversations)
    .where(eq(adminConversations.adminId, admin.id))
    .orderBy(desc(adminConversations.lastMessageAt));

  const enriched = await Promise.all(convs.map(async (conv) => {
    const [user] = await db.select().from(users)
      .where(eq(users.id, conv.userId)).limit(1);
    let displayName = user?.email || "User";
    let profileImage: string | null = null;

    if (conv.userRole === "job_seeker") {
      const [p] = await db.select().from(jobSeekerProfiles)
        .where(eq(jobSeekerProfiles.userId, conv.userId)).limit(1);
      if (p) {
        const fullName = `${p.firstName} ${p.lastName}`.trim();
        if (fullName) displayName = fullName;
        profileImage = p.profileImage;
      }
    } else {
      const [p] = await db.select().from(employerProfiles)
        .where(eq(employerProfiles.userId, conv.userId)).limit(1);
      if (p) {
        if (p.companyName) displayName = p.companyName;
        profileImage = p.profileImage;
      }
    }

    const [lastMsg] = await db.select().from(adminMessages)
      .where(eq(adminMessages.conversationId, conv.id))
      .orderBy(desc(adminMessages.createdAt)).limit(1);

    return {
      ...conv,
      displayName,
      profileImage,
      lastMessage: lastMsg?.text || "",
      lastMessageTime: lastMsg?.createdAt || conv.lastMessageAt,
      isNew: false,
    };
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

  const [existing] = await db.select().from(adminConversations)
    .where(eq(adminConversations.userId, userId)).limit(1);

  if (existing) return NextResponse.json(existing);

  const [conv] = await db.insert(adminConversations).values({
    adminId: admin.id,
    userId,
    userRole: user.role || "job_seeker",
  }).returning();

  return NextResponse.json(conv, { status: 201 });
}