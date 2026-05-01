import { NextResponse } from "next/server";
import { eq, desc } from "drizzle-orm";
import { db } from "@/app/db";
import { savedJobs, jobs, employerProfiles } from "@/app/db/schema";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser("auth");
  if (!user || user.role !== "job_seeker") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await db
    .select({
      id: savedJobs.id,
      createdAt: savedJobs.createdAt,
      jobId: jobs.id,
      title: jobs.title,
      category: jobs.category,
      location: jobs.location,
      arrangement: jobs.arrangement,
      type: jobs.employmentType,
      experience: jobs.experienceLevel,
      salaryMin: jobs.salaryMin,
      salaryMax: jobs.salaryMax,
      description: jobs.description,
      status: jobs.status,
      company: employerProfiles.companyName,
      companyImage: employerProfiles.profileImage,
    })
    .from(savedJobs)
    .innerJoin(jobs, eq(jobs.id, savedJobs.jobId))
    .leftJoin(employerProfiles, eq(employerProfiles.userId, jobs.employerId))
    .where(eq(savedJobs.jobSeekerId, user.id))
    .orderBy(desc(savedJobs.createdAt));

  return NextResponse.json(result);
}