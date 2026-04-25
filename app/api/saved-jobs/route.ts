import { NextRequest, NextResponse } from "next/server";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/app/db";
import { employerProfiles, jobs, savedJobs } from "@/app/db/schema";
import { requireUser } from "@/lib/current-user";

export async function GET() {
  const auth = await requireUser("job_seeker");
  if ("error" in auth) return auth.error;

  const rows = await db
    .select({
      id: savedJobs.id,
      jobId: jobs.id,
      title: jobs.title,
      company: employerProfiles.companyName,
      description: jobs.description,
      salaryMin: jobs.salaryMin,
      salaryMax: jobs.salaryMax,
      type: jobs.employmentType,
      arrangement: jobs.arrangement,
      experience: jobs.experienceLevel,
      createdAt: savedJobs.createdAt,
    })
    .from(savedJobs)
    .innerJoin(jobs, eq(jobs.id, savedJobs.jobId))
    .innerJoin(employerProfiles, eq(employerProfiles.userId, jobs.employerId))
    .where(eq(savedJobs.jobSeekerId, auth.user.userId))
    .orderBy(desc(savedJobs.createdAt));

  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const auth = await requireUser("job_seeker");
  if ("error" in auth) return auth.error;

  const body = await req.json();

  const [saved] = await db
    .insert(savedJobs)
    .values({
      jobId: body.jobId,
      jobSeekerId: auth.user.userId,
    })
    .onConflictDoNothing()
    .returning();

  return NextResponse.json(saved ?? { ok: true });
}

export async function DELETE(req: NextRequest) {
  const auth = await requireUser("job_seeker");
  if ("error" in auth) return auth.error;

  const body = await req.json();

  await db
    .delete(savedJobs)
    .where(and(eq(savedJobs.jobId, body.jobId), eq(savedJobs.jobSeekerId, auth.user.userId)));

  return NextResponse.json({ ok: true });
}
