import { NextResponse } from "next/server";
import { eq, count, desc } from "drizzle-orm";
import { db } from "@/app/db";
import { jobs, employerProfiles, jobApplications } from "@/app/db/schema";
import { getCurrentAdmin } from "@/lib/admin-auth";

export async function GET(req: Request) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || "All";

    let allJobs = await db
      .select({
        id: jobs.id,
        title: jobs.title,
        category: jobs.category,
        location: jobs.location,
        status: jobs.status,
        employmentType: jobs.employmentType,
        createdAt: jobs.createdAt,
        employerId: jobs.employerId,
        companyName: employerProfiles.companyName,
      })
      .from(jobs)
      .leftJoin(employerProfiles, eq(employerProfiles.userId, jobs.employerId))
      .orderBy(desc(jobs.createdAt));

    if (category && category !== "All") {
      allJobs = allJobs.filter((j) => j.category === category);
    }

    const withApplicants = await Promise.all(
      allJobs.map(async (j) => {
        const [appCount] = await db
          .select({ count: count() })
          .from(jobApplications)
          .where(eq(jobApplications.jobId, j.id));

        return { ...j, applicants: Number(appCount.count) };
      })
    );

    return NextResponse.json(withApplicants);
  } catch (error) {
    console.error("ADMIN JOBS ERROR:", error);
    return NextResponse.json(
      { error: "Internal server error: " + String(error) },
      { status: 500 }
    );
  }
}