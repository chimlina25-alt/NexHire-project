import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/app/db";
import { employerProfiles, jobApplications, jobs } from "@/app/db/schema";
import { requireUser } from "@/lib/current-user";

export async function GET() {
  const auth = await requireUser("job_seeker");
  if ("error" in auth) return auth.error;

  const rows = await db
    .select({
      id: jobApplications.id,
      status: jobApplications.status,
      appliedAt: jobApplications.appliedAt,
      updatedAt: jobApplications.updatedAt,
      jobTitle: jobs.title,
      company: employerProfiles.companyName,
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
    .orderBy(desc(jobApplications.updatedAt));

  const archived = rows.filter(
    (row) => row.status === "withdrawn" || row.status === "rejected"
  );

  return NextResponse.json(archived);
}