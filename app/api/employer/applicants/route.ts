import { NextResponse } from "next/server";
import { eq, desc } from "drizzle-orm";
import { db } from "@/app/db";
import { jobApplications, jobSeekerProfiles, jobs, users } from "@/app/db/schema";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser("auth");
  if (!user || user.role !== "employer") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const applicants = await db
    .select({
      id: jobApplications.id,
      status: jobApplications.status,
      coverLetter: jobApplications.coverLetter,
      cvUrl: jobApplications.cvUrl,
      cvFileName: jobApplications.cvFileName,
      appliedAt: jobApplications.appliedAt,
      jobId: jobApplications.jobId,
      jobSeekerId: jobApplications.jobSeekerId,
      jobTitle: jobs.title,
      firstName: jobSeekerProfiles.firstName,
      lastName: jobSeekerProfiles.lastName,
      profileImage: jobSeekerProfiles.profileImage,
      contact: jobSeekerProfiles.contact,
      seekerEmail: users.email,
    })
    .from(jobApplications)
    .innerJoin(jobs, eq(jobs.id, jobApplications.jobId))
    .innerJoin(jobSeekerProfiles, eq(jobSeekerProfiles.userId, jobApplications.jobSeekerId))
    .innerJoin(users, eq(users.id, jobApplications.jobSeekerId))
    .where(eq(jobApplications.employerId, user.id))
    .orderBy(desc(jobApplications.appliedAt))
    .limit(20);

  return NextResponse.json(applicants);
}