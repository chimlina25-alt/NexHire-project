import { NextResponse } from "next/server";
import { count, eq } from "drizzle-orm";
import { db } from "@/app/db";
import { jobApplications, jobs, users } from "@/app/db/schema";

export async function GET() {
  try {
    const [totalUsersResult] = await db.select({ count: count() }).from(users);
    const [activeJobsResult] = await db
      .select({ count: count() })
      .from(jobs)
      .where(eq(jobs.status, "active"));
    const [totalApplicationsResult] = await db
      .select({ count: count() })
      .from(jobApplications);

    return NextResponse.json({
      totalUsers: totalUsersResult?.count ?? 0,
      activeJobs: activeJobsResult?.count ?? 0,
      totalApplications: totalApplicationsResult?.count ?? 0,
    });
  } catch (error) {
    console.error("ADMIN STATS ERROR:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}