import { NextRequest, NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/app/db";
import {
  employerProfiles,
  interviews,
  jobApplications,
  jobs,
  jobSeekerProfiles,
} from "@/app/db/schema";
import { requireUser } from "@/lib/current-user";

export async function GET(req: NextRequest) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  if (auth.user.role === "job_seeker") {
    const rows = await db
      .select({
        id: jobApplications.id,
        status: jobApplications.status,
        appliedAt: jobApplications.appliedAt,
        updatedAt: jobApplications.updatedAt,
        jobTitle: jobs.title,
        company: employerProfiles.companyName,
        description: jobs.description,
        salaryMin: jobs.salaryMin,
        salaryMax: jobs.salaryMax,
        employmentType: jobs.employmentType,
        arrangement: jobs.arrangement,
        experienceLevel: jobs.experienceLevel,
      })
      .from(jobApplications)
      .innerJoin(jobs, eq(jobs.id, jobApplications.jobId))
      .innerJoin(employerProfiles, eq(employerProfiles.userId, jobs.employerId))
      .where(eq(jobApplications.jobSeekerId, auth.user.userId))
      .orderBy(desc(jobApplications.appliedAt));

    return NextResponse.json(rows);
  }

  const jobId = req.nextUrl.searchParams.get("jobId");

  const rows = await db
    .select({
      id: jobApplications.id,
      status: jobApplications.status,
      appliedAt: jobApplications.appliedAt,
      updatedAt: jobApplications.updatedAt,
      coverLetter: jobApplications.coverLetter,
      cvUrl: jobApplications.cvUrl,
      cvFileName: jobApplications.cvFileName,
      jobId: jobs.id,
      jobTitle: jobs.title,
      applicantId: jobSeekerProfiles.userId,
      firstName: jobSeekerProfiles.firstName,
      lastName: jobSeekerProfiles.lastName,
      profileImage: jobSeekerProfiles.profileImage,
      description: jobSeekerProfiles.description,
      contact: jobSeekerProfiles.contact,
    })
    .from(jobApplications)
    .innerJoin(jobs, eq(jobs.id, jobApplications.jobId))
    .innerJoin(jobSeekerProfiles, eq(jobSeekerProfiles.userId, jobApplications.jobSeekerId))
    .where(eq(jobApplications.employerId, auth.user.userId))
    .orderBy(desc(jobApplications.appliedAt));

  const filtered = jobId ? rows.filter((row) => row.jobId === jobId) : rows;
  return NextResponse.json(filtered);
}
