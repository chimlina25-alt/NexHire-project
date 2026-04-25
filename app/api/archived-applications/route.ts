import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/app/db";
import { employerProfiles, jobApplications, jobs } from "@/app/db/schema";
import { requireUser } from "@/lib/current-user";

function employmentTypeLabel(value: string | null) {
  if (value === "full_time") return "Full time";
  if (value === "part_time") return "Part time";
  if (value === "contract") return "Contract";
  if (value === "freelance") return "Freelance";
  if (value === "internship") return "Internship";
  return "";
}

function arrangementLabel(value: string | null) {
  if (value === "on_site") return "On-site";
  if (value === "remote") return "Remote";
  if (value === "hybrid") return "Hybrid";
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
  const auth = await requireUser("job_seeker");
  if ("error" in auth) return auth.error;

  const rows = await db
    .select({
      id: jobApplications.id,
      status: jobApplications.status,
      appliedAt: jobApplications.appliedAt,
      updatedAt: jobApplications.updatedAt,
      jobTitle: jobs.title,
      company: employerProfiles.companyName,
      salaryMin: jobs.salaryMin,
      salaryMax: jobs.salaryMax,
      employmentType: jobs.employmentType,
      arrangement: jobs.arrangement,
      experienceLevel: jobs.experienceLevel,
    })
    .from(jobApplications)
    .innerJoin(jobs, eq(jobs.id, jobApplications.jobId))
    .innerJoin(employerProfiles, eq(employerProfiles.userId, jobs.employerId))
    .where(eq(jobApplications.jobSeekerId, auth.user.userId))
    .orderBy(desc(jobApplications.updatedAt));

  const archived = rows.filter(
    (row) => row.status === "withdrawn" || row.status === "rejected"
  );

  return NextResponse.json(
    archived.map((row) => ({
      ...row,
      employmentTypeLabel: employmentTypeLabel(row.employmentType),
      arrangementLabel: arrangementLabel(row.arrangement),
      experienceLabel: experienceLabel(row.experienceLevel),
    }))
  );
}
