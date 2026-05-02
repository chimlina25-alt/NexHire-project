import { NextResponse } from "next/server";
import { eq, or, ilike } from "drizzle-orm";
import { db } from "@/app/db";
import {
  users, jobSeekerProfiles, employerProfiles, adminConversations, adminMessages
} from "@/app/db/schema";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { desc } from "drizzle-orm";

export async function GET(req: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim().toLowerCase();

  if (!q) return NextResponse.json([]);

  // Search job seeker profiles by name
  const seekers = await db
    .select({
      userId: jobSeekerProfiles.userId,
      firstName: jobSeekerProfiles.firstName,
      lastName: jobSeekerProfiles.lastName,
      profileImage: jobSeekerProfiles.profileImage,
    })
    .from(jobSeekerProfiles)
    .where(or(
      ilike(jobSeekerProfiles.firstName, `%${q}%`),
      ilike(jobSeekerProfiles.lastName, `%${q}%`),
    ))
    .limit(10);

  // Search employer profiles by company name
  const employers = await db
    .select({
      userId: employerProfiles.userId,
      companyName: employerProfiles.companyName,
      profileImage: employerProfiles.profileImage,
    })
    .from(employerProfiles)
    .where(ilike(employerProfiles.companyName, `%${q}%`))
    .limit(10);

  const results: any[] = [];

  for (const s of seekers) {
    const [existing] = await db.select().from(adminConversations)
      .where(eq(adminConversations.userId, s.userId)).limit(1);

    const [lastMsg] = existing ? await db.select().from(adminMessages)
      .where(eq(adminMessages.conversationId, existing.id))
      .orderBy(desc(adminMessages.createdAt)).limit(1) : [null];

    results.push({
      id: existing?.id || `new_${s.userId}`,
      userId: s.userId,
      adminId: admin.id,
      userRole: "job_seeker",
      displayName: `${s.firstName} ${s.lastName}`.trim() || "Job Seeker",
      profileImage: s.profileImage,
      lastMessage: lastMsg?.text || "",
      lastMessageAt: existing?.lastMessageAt || new Date().toISOString(),
      isNew: !existing,
      archived: existing?.archived || false,
    });
  }

  for (const e of employers) {
    const [existing] = await db.select().from(adminConversations)
      .where(eq(adminConversations.userId, e.userId)).limit(1);

    const [lastMsg] = existing ? await db.select().from(adminMessages)
      .where(eq(adminMessages.conversationId, existing.id))
      .orderBy(desc(adminMessages.createdAt)).limit(1) : [null];

    results.push({
      id: existing?.id || `new_${e.userId}`,
      userId: e.userId,
      adminId: admin.id,
      userRole: "employer",
      displayName: e.companyName || "Employer",
      profileImage: e.profileImage,
      lastMessage: lastMsg?.text || "",
      lastMessageAt: existing?.lastMessageAt || new Date().toISOString(),
      isNew: !existing,
      archived: existing?.archived || false,
    });
  }

  return NextResponse.json(results);
}