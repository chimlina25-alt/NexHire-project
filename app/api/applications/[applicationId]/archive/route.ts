// app/api/applications/[applicationId]/archive/route.ts
// FULL REPLACEMENT
// The saved-jobs page calls this with jobId (not applicationId).
// The applied page calls this with the actual applicationId.
// This route tries both so both pages work correctly.

import { NextResponse } from "next/server";
import { eq, and, or } from "drizzle-orm";
import { db } from "@/app/db";
import { jobApplications } from "@/app/db/schema";
import { getCurrentUser } from "@/lib/auth";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ applicationId: string }> }
) {
  try {
    const { applicationId } = await params;
    const user = await getCurrentUser("auth");

    if (!user || user.role !== "job_seeker") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Try to find the application by its own ID first,
    // then fall back to treating the param as a jobId
    // (saved page passes jobId instead of applicationId)
    const [byId] = await db
      .select()
      .from(jobApplications)
      .where(
        and(
          eq(jobApplications.id, applicationId),
          eq(jobApplications.jobSeekerId, user.id)
        )
      )
      .limit(1);

    const [byJobId] = !byId
      ? await db
          .select()
          .from(jobApplications)
          .where(
            and(
              eq(jobApplications.jobId, applicationId),
              eq(jobApplications.jobSeekerId, user.id)
            )
          )
          .limit(1)
      : [undefined];

    const target = byId ?? byJobId;

    if (!target) {
      // Nothing to archive — return success silently so the UI still removes the card
      return NextResponse.json({ success: true, message: "Nothing to archive" });
    }

    await db
      .update(jobApplications)
      .set({ status: "archived", updatedAt: new Date() })
      .where(eq(jobApplications.id, target.id));

    return NextResponse.json({ success: true, message: "Application archived" });
  } catch (error) {
    console.error("ARCHIVE APPLICATION ERROR:", error);
    return NextResponse.json({ error: "Failed to archive application" }, { status: 500 });
  }
}