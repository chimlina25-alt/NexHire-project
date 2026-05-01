import { NextResponse } from "next/server";
import { eq, and, ne } from "drizzle-orm"; // ✅ Added 'ne' import
import { z } from "zod";
import { db } from "@/app/db";
import {
  jobApplications,
  jobs,
  notifications,
  employerProfiles,
} from "@/app/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { saveUpload } from "@/lib/save-upload";

export async function GET(req: Request) {
  const user = await getCurrentUser("auth");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const jobId = searchParams.get("jobId");

  if (user.role === "job_seeker") {
    const result = await db
      .select({
        id: jobApplications.id,
        status: jobApplications.status,
        coverLetter: jobApplications.coverLetter,
        cvUrl: jobApplications.cvUrl,
        cvFileName: jobApplications.cvFileName,
        appliedAt: jobApplications.appliedAt,
        updatedAt: jobApplications.updatedAt,
        jobId: jobApplications.jobId,
        jobTitle: jobs.title,
        description: jobs.description,
        salaryMin: jobs.salaryMin,
        salaryMax: jobs.salaryMax,
        employmentType: jobs.employmentType,
        arrangement: jobs.arrangement,
        experienceLevel: jobs.experienceLevel,
        company: employerProfiles.companyName,
        companyImage: employerProfiles.profileImage,
      })
      .from(jobApplications)
      .innerJoin(jobs, eq(jobs.id, jobApplications.jobId))
      .leftJoin(
        employerProfiles,
        eq(employerProfiles.userId, jobApplications.employerId)
      )
      .where(
        and(
          eq(jobApplications.jobSeekerId, user.id),
          // ✅ Exclude archived/withdrawn applications from the main list
          ne(jobApplications.status, "archived"), 
          ne(jobApplications.status, "withdrawn")
        )
      );

    return NextResponse.json(result);
  }

  if (user.role === "employer") {
    const conditions: any[] = [eq(jobApplications.employerId, user.id)];
    if (jobId) conditions.push(eq(jobApplications.jobId, jobId));

    const result = await db
      .select()
      .from(jobApplications)
      .where(and(...conditions));

    return NextResponse.json(result);
  }

  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function POST(req: Request) {
  const user = await getCurrentUser("auth");
  if (!user || user.role !== "job_seeker") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const jobId = String(formData.get("jobId") || "");
  const coverLetter = String(formData.get("coverLetter") || "");
  const cvFile = formData.get("cv") || formData.get("cvFile");

  if (!jobId) return NextResponse.json({ error: "jobId required" }, { status: 400 });

  const [job] = await db
    .select()
    .from(jobs)
    .where(eq(jobs.id, jobId))
    .limit(1);

  if (!job || job.status !== "active") {
    return NextResponse.json({ error: "Job not found or closed" }, { status: 404 });
  }

  const [existing] = await db
    .select()
    .from(jobApplications)
    .where(
      and(
        eq(jobApplications.jobId, jobId),
        eq(jobApplications.jobSeekerId, user.id)
      )
    )
    .limit(1);

  if (existing) {
    return NextResponse.json({ error: "Already applied" }, { status: 409 });
  }

  let cvUrl: string | null = null;
  let cvFileName: string | null = null;

  if (cvFile instanceof File) {
    cvUrl = await saveUpload(cvFile, "cvs");
    cvFileName = cvFile.name;
  }

  const [application] = await db
    .insert(jobApplications)
    .values({
      jobId,
      employerId: job.employerId,
      jobSeekerId: user.id,
      coverLetter: coverLetter || null,
      cvUrl,
      cvFileName,
      status: "pending",
    })
    .returning();

  await db.insert(notifications).values({
    recipientId: job.employerId,
    actorId: user.id,
    type: "application",
    title: "New application received",
    description: `Someone applied for your job: ${job.title}`,
    link: `/dashboard`,
    meta: { applicationId: application.id, jobId },
  });

  return NextResponse.json(application, { status: 201 });
}