import { NextResponse } from "next/server";
import { eq, desc, count } from "drizzle-orm";
import { db } from "@/app/db";
import { jobs, jobApplications } from "@/app/db/schema";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser("auth");
  if (!user || user.role !== "employer") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const recentJobs = await db
    .select({
      id: jobs.id,
      title: jobs.title,
      category: jobs.category,
      location: jobs.location,
      status: jobs.status,
      arrangement: jobs.arrangement,
      employmentType: jobs.employmentType,
      createdAt: jobs.createdAt,
    })
    .from(jobs)
    .where(eq(jobs.employerId, user.id))
    .orderBy(desc(jobs.createdAt))
    .limit(10);

  const jobsWithCounts = await Promise.all(
    recentJobs.map(async (job) => {
      const [result] = await db
        .select({ count: count() })
        .from(jobApplications)
        .where(eq(jobApplications.jobId, job.id));
      return { ...job, applicantCount: result.count };
    })
  );

  return NextResponse.json(jobsWithCounts);
}