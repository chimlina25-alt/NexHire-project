import { NextResponse } from "next/server";
import { db } from "@/app/db";
import { jobs, jobApplications } from "@/app/db/schema";
import { eq, and, count } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser("auth");
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [totalJobsRow] = await db
      .select({ value: count() })
      .from(jobs)
      .where(eq(jobs.employerId, user.id));

    const [activeJobsRow] = await db
      .select({ value: count() })
      .from(jobs)
      .where(
        and(
          eq(jobs.employerId, user.id),
          eq(jobs.status, "active")
        )
      );

    const [totalApplicantsRow] = await db
      .select({ value: count() })
      .from(jobApplications)
      .where(eq(jobApplications.employerId, user.id));

    return NextResponse.json({
      totalJobs:       Number(totalJobsRow?.value       ?? 0),
      activeJobs:      Number(activeJobsRow?.value      ?? 0),
      totalApplicants: Number(totalApplicantsRow?.value ?? 0),
    });
  } catch (error) {
    console.error("[GET /api/employer/stats]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}