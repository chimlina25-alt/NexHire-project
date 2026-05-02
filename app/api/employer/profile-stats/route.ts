import { NextResponse } from "next/server";
import { eq, and, count } from "drizzle-orm";
import { db } from "@/app/db";
import { jobs, jobApplications, employerProfiles } from "@/app/db/schema";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser("auth");
    if (!user || user.role !== "employer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get employer profile to get the employer id
    const [profile] = await db
      .select()
      .from(employerProfiles)
      .where(eq(employerProfiles.userId, user.id))
      .limit(1);

    if (!profile) {
      return NextResponse.json({
        activeJobs: 0,
        totalHires: 0,
        growthPct: 0,
        openPositions: [],
      });
    }

    const employerId = profile.id;

    // Count active jobs
    const [activeJobsResult] = await db
      .select({ count: count() })
      .from(jobs)
      .where(
        and(
          eq(jobs.employerId, employerId),
          eq(jobs.status, "active")
        )
      );

    // Count total hires (accepted applications)
    const [hiresResult] = await db
      .select({ count: count() })
      .from(jobApplications)
      .where(
        and(
          eq(jobApplications.employerId, employerId),
          eq(jobApplications.status, "accepted")
        )
      );

    // Count total applications
    const [totalAppsResult] = await db
      .select({ count: count() })
      .from(jobApplications)
      .where(eq(jobApplications.employerId, employerId));

    // Get active jobs with details for open positions list
    const openPositions = await db
      .select({
        id: jobs.id,
        title: jobs.title,
        employmentType: jobs.employmentType,
        arrangement: jobs.arrangement,
        salaryMin: jobs.salaryMin,
        salaryMax: jobs.salaryMax,
        category: jobs.category,
        location: jobs.location,
        postedAt: jobs.postedAt,
        createdAt: jobs.createdAt,
      })
      .from(jobs)
      .where(
        and(
          eq(jobs.employerId, employerId),
          eq(jobs.status, "active")
        )
      )
      .orderBy(jobs.createdAt)
      .limit(10);

    // Get applicant count per job
    const positionsWithCounts = await Promise.all(
      openPositions.map(async (job) => {
        const [appCount] = await db
          .select({ count: count() })
          .from(jobApplications)
          .where(eq(jobApplications.jobId, job.id));

        return {
          ...job,
          applicantCount: Number(appCount?.count ?? 0),
        };
      })
    );

    const totalApps = Number(totalAppsResult?.count ?? 0);
    const totalHires = Number(hiresResult?.count ?? 0);
    const activeJobs = Number(activeJobsResult?.count ?? 0);

    // Growth = hire rate as percentage
    const growthPct = totalApps > 0
      ? Math.round((totalHires / totalApps) * 100)
      : 0;

    return NextResponse.json({
      activeJobs,
      totalHires,
      growthPct,
      openPositions: positionsWithCounts,
    });
  } catch (err) {
    console.error("EMPLOYER PROFILE STATS ERROR:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}