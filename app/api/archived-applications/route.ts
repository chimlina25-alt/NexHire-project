import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { db } from "@/app/db";
import { jobApplications, jobs, employerProfiles } from "@/app/db/schema";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser("auth");
  if (!user || user.role !== "job_seeker") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await db
    .select({
      id: jobApplications.id,
      status: jobApplications.status,
      updatedAt: jobApplications.updatedAt,
      jobId: jobs.id,
      jobTitle: jobs.title,
      company: employerProfiles.companyName,
      salaryMin: jobs.salaryMin,
      salaryMax: jobs.salaryMax,
    })
    .from(jobApplications)
    .innerJoin(jobs, eq(jobs.id, jobApplications.jobId))
    .leftJoin(employerProfiles, eq(employerProfiles.userId, jobApplications.employerId))
    .where(
      and(
        eq(jobApplications.jobSeekerId, user.id),
        eq(jobApplications.status, "archived") // ✅ ONLY change: was "withdrawn"
      )
    );

  return NextResponse.json(result);
}