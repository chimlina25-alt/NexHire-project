import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/app/db";
import { jobs, employerProfiles } from "@/app/db/schema";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params;

  const [job] = await db
    .select({
      id: jobs.id,
      title: jobs.title,
      category: jobs.category,
      location: jobs.location,
      arrangement: jobs.arrangement,
      employmentType: jobs.employmentType,
      experienceLevel: jobs.experienceLevel,
      salaryMin: jobs.salaryMin,
      salaryMax: jobs.salaryMax,
      description: jobs.description,
      requirements: jobs.requirements,
      applicationDeadline: jobs.applicationDeadline,
      applicationPlatform: jobs.applicationPlatform,
      externalApplyLink: jobs.externalApplyLink,
      contactEmail: jobs.contactEmail,
      status: jobs.status,
      postedAt: jobs.postedAt,
      createdAt: jobs.createdAt,
      updatedAt: jobs.updatedAt,
      employerId: jobs.employerId,
      companyName: employerProfiles.companyName,
      companyImage: employerProfiles.profileImage,
      companyIndustry: employerProfiles.industry,
      companySize: employerProfiles.companySize,
      companyAddress: employerProfiles.currentAddress,
      companyWebsite: employerProfiles.websiteLink,
      companyDescription: employerProfiles.companyDescription,
    })
    .from(jobs)
    .leftJoin(employerProfiles, eq(employerProfiles.userId, jobs.employerId))
    .where(eq(jobs.id, jobId))
    .limit(1);

  if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(job);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params;
  const user = await getCurrentUser("auth");
  if (!user || user.role !== "employer") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [job] = await db
    .select()
    .from(jobs)
    .where(and(eq(jobs.id, jobId), eq(jobs.employerId, user.id)))
    .limit(1);

  if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();

  const [updated] = await db
    .update(jobs)
    .set({
      ...body,
      updatedAt: new Date(),
      postedAt:
        body.status === "active" && !job.postedAt ? new Date() : job.postedAt,
    })
    .where(eq(jobs.id, jobId))
    .returning();

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params;
  const user = await getCurrentUser("auth");
  if (!user || user.role !== "employer") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [job] = await db
    .select()
    .from(jobs)
    .where(and(eq(jobs.id, jobId), eq(jobs.employerId, user.id)))
    .limit(1);

  if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await db.update(jobs).set({ status: "closed", updatedAt: new Date() }).where(eq(jobs.id, jobId));

  return NextResponse.json({ success: true });
}