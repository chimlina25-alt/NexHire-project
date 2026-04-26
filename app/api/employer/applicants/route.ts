import { NextResponse } from "next/server";
import { db } from "@/app/db";
import { jobApplications, jobs, jobSeekerProfiles } from "@/app/db/schema";
import { eq, desc } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser("auth");
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const applicants = await db
      .select({
        id:              jobApplications.id,
        jobId:           jobApplications.jobId,
        jobSeekerId:     jobApplications.jobSeekerId,
        status:          jobApplications.status,
        coverLetter:     jobApplications.coverLetter,
        cvUrl:           jobApplications.cvUrl,
        cvFileName:      jobApplications.cvFileName,
        appliedAt:       jobApplications.appliedAt,
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
      .where(eq(jobApplications.employerId, user.id))
      .orderBy(desc(jobApplications.appliedAt));

    return NextResponse.json(applicants);
  } catch (error) {
    console.error("[GET /api/employer/applicants]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}