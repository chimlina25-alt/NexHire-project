import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/db";
import { jobApplications, jobSeekerProfiles } from "@/app/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const user = await getCurrentUser("auth");
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const applicants = await db
      .select({
        id:              jobApplications.id,
        jobSeekerId:     jobApplications.jobSeekerId,
        status:          jobApplications.status,
        coverLetter:     jobApplications.coverLetter,
        cvUrl:           jobApplications.cvUrl,
        cvFileName:      jobApplications.cvFileName,
        appliedAt:       jobApplications.appliedAt,
        seekerFirstName: jobSeekerProfiles.firstName,
        seekerLastName:  jobSeekerProfiles.lastName,
        seekerImage:     jobSeekerProfiles.profileImage,
      })
      .from(jobApplications)
      .innerJoin(
        jobSeekerProfiles,
        eq(jobApplications.jobSeekerId, jobSeekerProfiles.userId)
      )
      .where(
        and(
          eq(jobApplications.jobId, params.jobId),
          eq(jobApplications.employerId, user.id)
        )
      )
      .orderBy(desc(jobApplications.appliedAt));

    return NextResponse.json(applicants);
  } catch (error) {
    console.error("[GET /api/jobs/[jobId]/applicants]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}