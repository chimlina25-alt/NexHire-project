import { NextResponse } from "next/server";
import { eq, desc } from "drizzle-orm";
import { db } from "@/app/db";
import { jobs, jobApplications, sessions, users } from "@/app/db/schema";
import { cookies } from "next/headers";
import { createHash } from "crypto";
import { and, gt, count } from "drizzle-orm";

async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const rawToken = cookieStore.get("session_token")?.value;
    if (!rawToken) return null;
    const tokenHash = createHash("sha256").update(rawToken).digest("hex");
    const [session] = await db
      .select()
      .from(sessions)
      .where(and(eq(sessions.tokenHash, tokenHash), gt(sessions.expiresAt, new Date())))
      .limit(1);
    if (!session) return null;
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, session.userId))
      .limit(1);
    return user ?? null;
  } catch {
    return null;
  }
}

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "employer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "all";

    // Employer sees ALL their own jobs regardless of status
    let employerJobs = await db
      .select({
        id: jobs.id,
        title: jobs.title,
        category: jobs.category,
        location: jobs.location,
        status: jobs.status,
        employmentType: jobs.employmentType,
        arrangement: jobs.arrangement,
        postedAt: jobs.postedAt,
        createdAt: jobs.createdAt,
        applicationDeadline: jobs.applicationDeadline,
        salaryMin: jobs.salaryMin,
        salaryMax: jobs.salaryMax,
      })
      .from(jobs)
      .where(eq(jobs.employerId, user.id))
      .orderBy(desc(jobs.createdAt));

    if (status !== "all") {
      employerJobs = employerJobs.filter((j) => j.status === status);
    }

    const withCounts = await Promise.all(
      employerJobs.map(async (j) => {
        const [appCount] = await db
          .select({ count: count() })
          .from(jobApplications)
          .where(eq(jobApplications.jobId, j.id));

        return { ...j, applicants: Number(appCount.count) };
      })
    );

    return NextResponse.json(withCounts);
  } catch (error) {
    console.error("EMPLOYER RECENT JOBS ERROR:", error);
    return NextResponse.json(
      { error: "Internal server error: " + String(error) },
      { status: 500 }
    );
  }
}