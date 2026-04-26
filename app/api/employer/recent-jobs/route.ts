import { NextResponse } from "next/server";
import { db } from "@/app/db";
import { jobs } from "@/app/db/schema";
import { eq, desc } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser("auth");
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const recentJobs = await db
      .select({
        id:             jobs.id,
        title:          jobs.title,
        category:       jobs.category,
        status:         jobs.status,
        createdAt:      jobs.createdAt,
        location:       jobs.location,
        employmentType: jobs.employmentType,
      })
      .from(jobs)
      .where(eq(jobs.employerId, user.id))
      .orderBy(desc(jobs.createdAt))
      .limit(5);

    return NextResponse.json(recentJobs);
  } catch (error) {
    console.error("[GET /api/employer/recent-jobs]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}