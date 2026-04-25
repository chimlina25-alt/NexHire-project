import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/app/db";
import { employerProfiles, jobs } from "@/app/db/schema";
import { requireUser } from "@/lib/current-user";

export async function GET(_: Request, { params }: { params: { jobId: string } }) {
  const [job] = await db
    .select({
      id: jobs.id,
      employerId: jobs.employerId,
      title: jobs.title,
      category: jobs.category,
      location: jobs.location,
      arrangement: jobs.arrangement,
      type: jobs.employmentType,
      experience: jobs.experienceLevel,
      description: jobs.description,
      requirements: jobs.requirements,
      salaryMin: jobs.salaryMin,
      salaryMax: jobs.salaryMax,
      deadline: jobs.applicationDeadline,
      contactEmail: jobs.contactEmail,
      applicationPlatform: jobs.applicationPlatform,
      externalApplyLink: jobs.externalApplyLink,
      status: jobs.status,
      createdAt: jobs.createdAt,
      company: employerProfiles.companyName,
      companyDescription: employerProfiles.companyDescription,
      companyImage: employerProfiles.profileImage,
      companyWebsite: employerProfiles.websiteLink,
    })
    .from(jobs)
    .innerJoin(employerProfiles, eq(employerProfiles.userId, jobs.employerId))
    .where(eq(jobs.id, params.jobId))
    .limit(1);

  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  return NextResponse.json(job);
}

export async function PATCH(req: Request, { params }: { params: { jobId: string } }) {
  const auth = await requireUser("employer");
  if ("error" in auth) return auth.error;

  const body = await req.json();

  const [existing] = await db.select().from(jobs).where(eq(jobs.id, params.jobId)).limit(1);
  if (!existing) return NextResponse.json({ error: "Job not found" }, { status: 404 });
  if (existing.employerId !== auth.user.userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [updated] = await db
    .update(jobs)
    .set({
      title: body.title ?? existing.title,
      category: body.category ?? existing.category,
      location: body.location ?? existing.location,
      arrangement: body.arrangement ?? existing.arrangement,
      employmentType: body.employmentType ?? existing.employmentType,
      experienceLevel: body.experienceLevel ?? existing.experienceLevel,
      salaryMin: body.salaryMin ?? existing.salaryMin,
      salaryMax: body.salaryMax ?? existing.salaryMax,
      description: body.description ?? existing.description,
      requirements: body.requirements ?? existing.requirements,
      applicationDeadline: body.applicationDeadline ? new Date(body.applicationDeadline) : existing.applicationDeadline,
      applicationPlatform: body.applicationPlatform ?? existing.applicationPlatform,
      externalApplyLink: body.externalApplyLink ?? existing.externalApplyLink,
      contactEmail: body.contactEmail ?? existing.contactEmail,
      status: body.status ?? existing.status,
      updatedAt: new Date(),
    })
    .where(eq(jobs.id, params.jobId))
    .returning();

  return NextResponse.json(updated);
}
