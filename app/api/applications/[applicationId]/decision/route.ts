import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/app/db";
import { interviews, jobApplications, jobs, notifications } from "@/app/db/schema";
import { requireUser } from "@/lib/current-user";

export async function POST(req: Request, { params }: { params: { applicationId: string } }) {
  const auth = await requireUser("employer");
  if ("error" in auth) return auth.error;

  const body = await req.json();
  const decision = body.decision as "accepted" | "rejected" | "interview";

  const [application] = await db
    .select()
    .from(jobApplications)
    .where(eq(jobApplications.id, params.applicationId))
    .limit(1);

  if (!application) return NextResponse.json({ error: "Application not found" }, { status: 404 });
  if (application.employerId !== auth.user.userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [job] = await db.select().from(jobs).where(eq(jobs.id, application.jobId)).limit(1);

  await db
    .update(jobApplications)
    .set({ status: decision, updatedAt: new Date() })
    .where(eq(jobApplications.id, application.id));

  if (decision === "interview") {
    await db.insert(interviews).values({
      applicationId: application.id,
      employerId: application.employerId,
      jobSeekerId: application.jobSeekerId,
      mode: body.mode ?? "remote",
      scheduledAt: new Date(body.scheduledAt),
      location: body.location ?? "",
      notes: body.notes ?? "",
    });
  }

  const titleMap = {
    accepted: `Application accepted for ${job?.title ?? "your application"}`,
    rejected: `Application update for ${job?.title ?? "your application"}`,
    interview: `Interview scheduled for ${job?.title ?? "your application"}`,
  };

  const descriptionMap = {
    accepted: body.message || "The employer accepted your application.",
    rejected: body.message || "The employer did not move forward with your application.",
    interview: body.message || `Interview scheduled on ${body.scheduledAt}.`,
  };

  await db.insert(notifications).values({
    recipientId: application.jobSeekerId,
    actorId: auth.user.userId,
    type: decision === "interview" ? "interview" : "application",
    title: titleMap[decision],
    description: descriptionMap[decision],
    link: decision === "interview" ? "/interviews" : "/applied",
    meta: {
      applicationId: application.id,
      jobId: application.jobId,
      decision,
      scheduledAt: body.scheduledAt ?? null,
      location: body.location ?? null,
    },
  });

  return NextResponse.json({ ok: true });
}
