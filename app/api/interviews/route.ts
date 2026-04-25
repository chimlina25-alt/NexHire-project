import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/app/db";
import { employerProfiles, interviews, jobApplications, jobs } from "@/app/db/schema";
import { requireUser } from "@/lib/current-user";

function employmentTypeLabel(value: string | null) {
  if (value === "full_time") return "Full time";
  if (value === "part_time") return "Part time";
  if (value === "contract") return "Contract";
  if (value === "freelance") return "Freelance";
  if (value === "internship") return "Internship";
  return "";
}

function experienceLabel(value: string | null) {
  if (value === "entry") return "Entry level";
  if (value === "mid") return "Mid level";
  if (value === "senior") return "Senior";
  if (value === "lead") return "Lead / Manager";
  if (value === "executive") return "Executive";
  return "";
}

export async function GET() {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  if (auth.user.role === "job_seeker") {
    const rows = await db
      .select({
        id: interviews.id,
        scheduledAt: interviews.scheduledAt,
        location: interviews.location,
        mode: interviews.mode,
        jobTitle: jobs.title,
        company: employerProfiles.companyName,
        salaryMin: jobs.salaryMin,
        salaryMax: jobs.salaryMax,
        employmentType: jobs.employmentType,
        experienceLevel: jobs.experienceLevel,
      })
      .from(interviews)
      .innerJoin(jobApplications, eq(jobApplications.id, interviews.applicationId))
      .innerJoin(jobs, eq(jobs.id, jobApplications.jobId))
      .innerJoin(employerProfiles, eq(employerProfiles.userId, jobs.employerId))
      .where(eq(interviews.jobSeekerId, auth.user.userId))
      .orderBy(desc(interviews.scheduledAt));

    return NextResponse.json(
      rows.map((row) => ({
        ...row,
        employmentTypeLabel: employmentTypeLabel(row.employmentType),
        experienceLabel: experienceLabel(row.experienceLevel),
      }))
    );
  }

  const rows = await db
    .select({
      id: interviews.id,
      scheduledAt: interviews.scheduledAt,
      location: interviews.location,
      mode: interviews.mode,
      applicationId: interviews.applicationId,
      jobTitle: jobs.title,
      firstName: jobApplications.jobSeekerId,
    })
    .from(interviews)
    .innerJoin(jobApplications, eq(jobApplications.id, interviews.applicationId))
    .innerJoin(jobs, eq(jobs.id, jobApplications.jobId))
    .where(eq(interviews.employerId, auth.user.userId))
    .orderBy(desc(interviews.scheduledAt));

  return NextResponse.json(rows);
}
