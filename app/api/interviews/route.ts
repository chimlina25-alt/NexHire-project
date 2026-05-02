import { NextResponse } from "next/server";
import { eq, desc, and, ne } from "drizzle-orm";
import { db } from "@/app/db";
import {
  interviews,
  jobs,
  jobApplications,
  employerProfiles,
} from "@/app/db/schema";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser("auth");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (user.role === "job_seeker") {
    const result = await db
      .select({
        id: interviews.id,
        mode: interviews.mode,
        scheduledAt: interviews.scheduledAt,
        duration: interviews.duration,
        location: interviews.location,
        link: interviews.link,
        notes: interviews.notes,
        createdAt: interviews.createdAt,
        applicationId: interviews.applicationId,
        employerId: interviews.employerId,
        jobTitle: jobs.title,
        company: employerProfiles.companyName,
        companyImage: employerProfiles.profileImage,
        salaryMin: jobs.salaryMin,
        salaryMax: jobs.salaryMax,
        employmentType: jobs.employmentType,
        experienceLevel: jobs.experienceLevel,
      })
      .from(interviews)
      .innerJoin(jobApplications, eq(jobApplications.id, interviews.applicationId))
      .innerJoin(jobs, eq(jobs.id, jobApplications.jobId))
      .innerJoin(employerProfiles, eq(employerProfiles.userId, interviews.employerId))
      .where(
        and(
          eq(interviews.jobSeekerId, user.id),
          ne(jobApplications.status, "archived") // ✅ exclude archived
        )
      )
      .orderBy(desc(interviews.scheduledAt));

    return NextResponse.json(result);
  }

  if (user.role === "employer") {
    const result = await db
      .select()
      .from(interviews)
      .where(eq(interviews.employerId, user.id))
      .orderBy(desc(interviews.scheduledAt));
    return NextResponse.json(result);
  }

  return NextResponse.json([]);
}