import { NextResponse } from "next/server";
import { eq, desc, and, notInArray } from "drizzle-orm";
import { db } from "@/app/db";
import {
  conversations, conversationArchives, conversationDeletes,
  employerProfiles, jobSeekerProfiles,
} from "@/app/db/schema";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser("auth");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const isEmployer = user.role === "employer";

  const allConvs = await db
    .select()
    .from(conversations)
    .where(isEmployer ? eq(conversations.employerId, user.id) : eq(conversations.jobSeekerId, user.id))
    .orderBy(desc(conversations.lastMessageAt));

  // Filter out conversations this user has permanently deleted
  const deletedRows = await db
    .select({ conversationId: conversationDeletes.conversationId })
    .from(conversationDeletes)
    .where(eq(conversationDeletes.userId, user.id));
  const deletedIds = new Set(deletedRows.map(d => d.conversationId));

  const visibleConvs = allConvs.filter(c => !deletedIds.has(c.id));

  // Archived status
  const archivedRows = await db
    .select({ conversationId: conversationArchives.conversationId })
    .from(conversationArchives)
    .where(eq(conversationArchives.userId, user.id));
  const archivedIds = new Set(archivedRows.map(a => a.conversationId));

  const result = await Promise.all(
    visibleConvs.map(async conv => {
      const [ep] = await db
        .select()
        .from(employerProfiles)
        .where(eq(employerProfiles.userId, conv.employerId))
        .limit(1);

      const [sp] = await db
        .select()
        .from(jobSeekerProfiles)
        .where(eq(jobSeekerProfiles.userId, conv.jobSeekerId))
        .limit(1);

      return {
        id: conv.id,
        employerId: conv.employerId,
        jobSeekerId: conv.jobSeekerId,
        jobId: conv.jobId,
        lastMessageAt: conv.lastMessageAt,
        employerName: ep?.companyName || "Employer",
        employerImage: ep?.profileImage || null,
        seekerFirstName: sp?.firstName || "Job",
        seekerLastName: sp?.lastName || "Seeker",
        seekerImage: sp?.profileImage || null,
        archived: archivedIds.has(conv.id),
      };
    })
  );

  return NextResponse.json(result);
}