import { NextResponse } from "next/server";
import { eq, count, and } from "drizzle-orm";
import { db } from "@/app/db";
import { jobs, jobApplications } from "@/app/db/schema";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser("auth");
  if (!user || user.role !== "employer") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [totalJobsResult] = await db
    .select({ count: count() })
    .from(jobs)
    .where(eq(jobs.employerId, user.id));

  const [activeJobsResult] = await db
    .select({ count: count() })
    .from(jobs)
    .where(and(eq(jobs.employerId, user.id), eq(jobs.status, "active")));

  const [totalApplicantsResult] = await db
    .select({ count: count() })
    .from(jobApplications)
    .where(eq(jobApplications.employerId, user.id));

  return NextResponse.json({
    totalJobs: totalJobsResult.count,
    activeJobs: activeJobsResult.count,
    totalApplicants: totalApplicantsResult.count,
  });
}