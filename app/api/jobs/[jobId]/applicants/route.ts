import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { db } from "@/app/db";
import { jobApplications, jobSeekerProfiles, jobs, users } from "@/app/db/schema";
import { getCurrentUser } from "@/lib/auth";

export async function GET(_req: Request, { params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await params;
  const user = await getCurrentUser("auth");
  if (!user || user.role !== "employer") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [job] = await db
    .select()
    .from(jobs)
    .where(and(eq(jobs.id, jobId), eq(jobs.employerId, user.id)))
    .limit(1);

  if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const applicants = await db
    .select({
      id: jobApplications.id,
      status: jobApplications.status,
      coverLetter: jobApplications.coverLetter,
      cvUrl: jobApplications.cvUrl,
      cvFileName: jobApplications.cvFileName,
      appliedAt: jobApplications.appliedAt,
      jobSeekerId: jobApplications.jobSeekerId,
      firstName: jobSeekerProfiles.firstName,
      lastName: jobSeekerProfiles.lastName,
      profileImage: jobSeekerProfiles.profileImage,
      contact: jobSeekerProfiles.contact,
      address: jobSeekerProfiles.address,
      educationLevel: jobSeekerProfiles.educationLevel,
      schoolUniversity: jobSeekerProfiles.schoolUniversity,
      seekerEmail: users.email,
    })
    .from(jobApplications)
    .innerJoin(jobSeekerProfiles, eq(jobSeekerProfiles.userId, jobApplications.jobSeekerId))
    .innerJoin(users, eq(users.id, jobApplications.jobSeekerId))
    .where(eq(jobApplications.jobId, jobId));

  return NextResponse.json(applicants);
}