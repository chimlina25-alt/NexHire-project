import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/db";
import { jobApplications, jobs, jobSeekerProfiles } from "@/app/db/schema";
import { eq, and } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: { applicationId: string } }
) {
  try {
    const user = await getCurrentUser("auth");
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [row] = await db
      .select({
        id:              jobApplications.id,
        jobTitle:        jobs.title,
        seekerFirstName: jobSeekerProfiles.firstName,
        seekerLastName:  jobSeekerProfiles.lastName,
        seekerImage:     jobSeekerProfiles.profileImage,
      })
      .from(jobApplications)
      .innerJoin(jobs, eq(jobApplications.jobId, jobs.id))
      .innerJoin(
        jobSeekerProfiles,
        eq(jobApplications.jobSeekerId, jobSeekerProfiles.userId)
      )
      .where(
        and(
          eq(jobApplications.id, params.applicationId),
          eq(jobApplications.employerId, user.id)
        )
      )
      .limit(1);

    if (!row) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(row);
  } catch (error) {
    console.error("[GET /api/applications/[applicationId]/info]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}