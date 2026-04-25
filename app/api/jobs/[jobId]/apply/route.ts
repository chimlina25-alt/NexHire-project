import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/app/db";
import { jobApplications, jobSeekerProfiles, jobs, notifications } from "@/app/db/schema";
import { requireUser } from "@/lib/current-user";
import { saveUpload } from "@/lib/save-upload";

export async function POST(req: Request, { params }: { params: { jobId: string } }) {
  const auth = await requireUser("job_seeker");
  if ("error" in auth) return auth.error;

  const [job] = await db.select().from(jobs).where(eq(jobs.id, params.jobId)).limit(1);
  if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });

  const form = await req.formData();
  const coverLetter = String(form.get("coverLetter") || "");
  const cvFile = (form.get("cvFile") as File | null) ?? null;

  let cvUrl: string | null = null;
  let cvFileName: string | null = null;

  if (cvFile) {
    const upload = await saveUpload(
      cvFile,
      "applications",
      [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ],
      10 * 1024 * 1024
    );
    cvUrl = upload?.url ?? null;
    cvFileName = upload?.fileName ?? null;
  }

  const [profile] = await db
    .select()
    .from(jobSeekerProfiles)
    .where(eq(jobSeekerProfiles.userId, auth.user.userId))
    .limit(1);

  const [application] = await db
    .insert(jobApplications)
    .values({
      jobId: job.id,
      employerId: job.employerId,
      jobSeekerId: auth.user.userId,
      coverLetter,
      cvUrl,
      cvFileName,
    })
    .onConflictDoNothing()
    .returning();

  if (!application) {
    return NextResponse.json({ error: "Already applied to this job" }, { status: 409 });
  }

  await db.insert(notifications).values({
    recipientId: job.employerId,
    actorId: auth.user.userId,
    type: "application",
    title: `${profile?.firstName ?? "A candidate"} applied for ${job.title}`,
    description: "A new application is ready for review.",
    link: "/dashboard",
    meta: { jobId: job.id, applicationId: application.id },
  });

  return NextResponse.json(application, { status: 201 });
}
