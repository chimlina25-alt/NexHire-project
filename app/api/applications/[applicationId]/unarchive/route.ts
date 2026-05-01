// app/api/applications/[applicationId]/unarchive/route.ts
// FULL REPLACEMENT

import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
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

    // Try by applicationId first, then by jobId as fallback
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
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    await db
      .update(jobApplications)
      .set({ status: "pending", updatedAt: new Date() })
      .where(eq(jobApplications.id, target.id));

    return NextResponse.json({ success: true, message: "Application unarchived" });
  } catch (error) {
    console.error("UNARCHIVE APPLICATION ERROR:", error);
    return NextResponse.json({ error: "Failed to unarchive application" }, { status: 500 });
  }
}