import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { db } from "@/app/db";
import { jobApplications, jobs, notifications } from "@/app/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { saveUpload } from "@/lib/save-upload";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params;
  const user = await getCurrentUser("auth");
  if (!user || user.role !== "job_seeker") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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

  const formData = await req.formData();
  const coverLetter = String(formData.get("coverLetter") || "");
  const cvFile = formData.get("cvFile");

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