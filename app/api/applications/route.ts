// app/api/applications/route.ts
import { NextResponse } from "next/server";
import { eq, and, desc } from "drizzle-orm";
import { db } from "@/app/db";
import {
  jobApplications,
  jobs,
  jobSeekerProfiles,
  users,
} from "@/app/db/schema";
import { requireEmployer } from "@/lib/require-employer";

export async function GET(req: Request) {
  const auth = await requireEmployer();
  if (auth.error) return auth.error;

  const { searchParams } = new URL(req.url);
  const jobId = searchParams.get("jobId");
  const status = searchParams.get("status");

  const conditions = [eq(jobApplications.employerId, auth.user.id)];
  if (jobId) conditions.push(eq(jobApplications.jobId, jobId));
  if (status && ["pending", "accepted", "rejected", "interview", "withdrawn"].includes(status)) {
    conditions.push(eq(jobApplications.status, status as any));
  }

  const list = await db
    .select({
      id: jobApplications.id,
      jobId: jobApplications.jobId,
      jobTitle: jobs.title,
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
      description: jobSeekerProfiles.description,
      educationLevel: jobSeekerProfiles.educationLevel,
      schoolUniversity: jobSeekerProfiles.schoolUniversity,
      year: jobSeekerProfiles.year,
      address: jobSeekerProfiles.address,
      email: users.email,
    })
    .from(jobApplications)
    .innerJoin(jobs, eq(jobs.id, jobApplications.jobId))
    .leftJoin(
      jobSeekerProfiles,
      eq(jobSeekerProfiles.userId, jobApplications.jobSeekerId)
    )
    .leftJoin(users, eq(users.id, jobApplications.jobSeekerId))
    .where(and(...conditions))
    .orderBy(desc(jobApplications.appliedAt));

  return NextResponse.json(list);
}