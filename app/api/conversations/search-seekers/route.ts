import { NextResponse } from "next/server";
import { ilike, or, eq, and } from "drizzle-orm";
import { db } from "@/app/db";
import {
  jobSeekerProfiles,
  conversations,
  conversationArchives,
  conversationDeletes,
} from "@/app/db/schema";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: Request) {
  const user = await getCurrentUser("auth");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();
  if (!q) return NextResponse.json([]);

  const seekers = await db
    .select()
    .from(jobSeekerProfiles)
    .where(
      or(
        ilike(jobSeekerProfiles.firstName, `%${q}%`),
        ilike(jobSeekerProfiles.lastName, `%${q}%`)
      )
    )
    .limit(10);

  const deletedRows = await db
    .select({ conversationId: conversationDeletes.conversationId })
    .from(conversationDeletes)
    .where(eq(conversationDeletes.userId, user.id));
  const deletedIds = new Set(deletedRows.map((d) => d.conversationId));

  const archivedRows = await db
    .select({ conversationId: conversationArchives.conversationId })
    .from(conversationArchives)
    .where(eq(conversationArchives.userId, user.id));
  const archivedIds = new Set(archivedRows.map((a) => a.conversationId));

  const results = await Promise.all(
    seekers.map(async (s) => {
      // FIX: must match BOTH jobSeekerId and employerId (current user)
      const [existing] = await db
        .select()
        .from(conversations)
        .where(
          and(
            eq(conversations.jobSeekerId, s.userId),
            eq(conversations.employerId, user.id)
          )
        )
        .limit(1);

      if (existing && deletedIds.has(existing.id)) {
        return {
          id: `new_${s.userId}`,
          employerId: user.id,
          jobSeekerId: s.userId,
          jobId: null,
          lastMessageAt: new Date().toISOString(),
          employerName: "",
          employerImage: null,
          seekerFirstName: s.firstName,
          seekerLastName: s.lastName,
          seekerImage: s.profileImage,
          archived: false,
          isNew: true,
        };
      }

      return {
        id: existing?.id || `new_${s.userId}`,
        employerId: user.id,
        jobSeekerId: s.userId,
        jobId: null,
        lastMessageAt: existing?.lastMessageAt?.toISOString() || new Date().toISOString(),
        employerName: "",
        employerImage: null,
        seekerFirstName: s.firstName,
        seekerLastName: s.lastName,
        seekerImage: s.profileImage,
        archived: existing ? archivedIds.has(existing.id) : false,
        isNew: !existing,
      };
    })
  );

  return NextResponse.json(results);
}