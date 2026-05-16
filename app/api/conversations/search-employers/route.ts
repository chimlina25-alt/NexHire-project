import { NextResponse } from "next/server";
import { ilike, eq, and } from "drizzle-orm";
import { db } from "@/app/db";
import {
  employerProfiles,
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

  const employers = await db
    .select()
    .from(employerProfiles)
    .where(ilike(employerProfiles.companyName, `%${q}%`))
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
    employers.map(async (e) => {
      // FIX: must match BOTH employerId and jobSeekerId (current user)
      const [existing] = await db
        .select()
        .from(conversations)
        .where(
          and(
            eq(conversations.employerId, e.userId),
            eq(conversations.jobSeekerId, user.id)
          )
        )
        .limit(1);

      if (existing && deletedIds.has(existing.id)) {
        return {
          id: `new_${e.userId}`,
          employerId: e.userId,
          jobSeekerId: user.id,
          jobId: null,
          lastMessageAt: new Date().toISOString(),
          employerName: e.companyName,
          employerImage: e.profileImage,
          seekerFirstName: "",
          seekerLastName: "",
          seekerImage: null,
          archived: false,
          isNew: true,
        };
      }

      return {
        id: existing?.id || `new_${e.userId}`,
        employerId: e.userId,
        jobSeekerId: user.id,
        jobId: null,
        lastMessageAt: existing?.lastMessageAt?.toISOString() || new Date().toISOString(),
        employerName: e.companyName,
        employerImage: e.profileImage,
        seekerFirstName: "",
        seekerLastName: "",
        seekerImage: null,
        archived: existing ? archivedIds.has(existing.id) : false,
        isNew: !existing,
      };
    })
  );

  return NextResponse.json(results);
}