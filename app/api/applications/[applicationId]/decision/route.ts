import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/app/db";
import { jobApplications, jobs, notifications, interviews } from "@/app/db/schema";
import { getCurrentUser } from "@/lib/auth";

const decisionSchema = z.object({
  decision: z.enum(["review", "reject", "accept"]),
  // For accept (schedule interview)
  mode: z.enum(["remote", "onsite"]).optional(),
  scheduledAt: z.string().optional(),
  duration: z.number().optional(),
  location: z.string().optional(),
  link: z.string().optional(),
  notes: z.string().optional(),
});

export async function POST(req: Request, { params }: { params: Promise<{ applicationId: string }> }) {
  const { applicationId } = await params;
  const user = await getCurrentUser("auth");
  if (!user || user.role !== "employer") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = decisionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  const [application] = await db
    .select()
    .from(jobApplications)
    .where(and(eq(jobApplications.id, applicationId), eq(jobApplications.employerId, user.id)))
    .limit(1);

  if (!application) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const [job] = await db.select().from(jobs).where(eq(jobs.id, application.jobId)).limit(1);

  const { decision } = parsed.data;

  if (decision === "review") {
    await db.update(jobApplications)
      .set({ status: "interview", updatedAt: new Date() })
      .where(eq(jobApplications.id, applicationId));

    await db.insert(notifications).values({
      recipientId: application.jobSeekerId,
      actorId: user.id,
      type: "application",
      title: "Your application is under review",
      description: `Your application for ${job?.title || "a position"} is being reviewed by the employer.`,
      link: "/applied",
      meta: { applicationId, jobId: application.jobId },
    });

    return NextResponse.json({ success: true, status: "interview" });
  }

  if (decision === "reject") {
    await db.update(jobApplications)
      .set({ status: "rejected", updatedAt: new Date() })
      .where(eq(jobApplications.id, applicationId));

    await db.insert(notifications).values({
      recipientId: application.jobSeekerId,
      actorId: user.id,
      type: "application",
      title: "Application update",
      description: `Your application for ${job?.title || "a position"} was not selected at this time.`,
      link: "/applied",
      meta: { applicationId, jobId: application.jobId },
    });

    return NextResponse.json({ success: true, status: "rejected" });
  }

  if (decision === "accept") {
    if (!parsed.data.scheduledAt) {
      return NextResponse.json({ error: "scheduledAt is required for accept" }, { status: 400 });
    }

    await db.update(jobApplications)
      .set({ status: "accepted", updatedAt: new Date() })
      .where(eq(jobApplications.id, applicationId));

    const [interview] = await db
      .insert(interviews)
      .values({
        applicationId,
        employerId: user.id,
        jobSeekerId: application.jobSeekerId,
        mode: parsed.data.mode ?? "remote",
        scheduledAt: new Date(parsed.data.scheduledAt),
        duration: parsed.data.duration ?? 60,
        location: parsed.data.location ?? null,
        link: parsed.data.link ?? null,
        notes: parsed.data.notes ?? null,
      })
      .returning();

    const modeText = parsed.data.mode === "onsite" ? "In-person" : "Online";
    const dateStr = new Date(parsed.data.scheduledAt).toLocaleString("en-US", {
      weekday: "long", year: "numeric", month: "long",
      day: "numeric", hour: "2-digit", minute: "2-digit",
    });

    await db.insert(notifications).values({
      recipientId: application.jobSeekerId,
      actorId: user.id,
      type: "interview",
      title: "You have been selected for an interview!",
      description: `Congratulations! You've been selected for an interview for ${job?.title || "a position"}. ${modeText} interview scheduled for ${dateStr}. Duration: ${parsed.data.duration ?? 60} minutes.${parsed.data.link ? ` Link: ${parsed.data.link}` : ""}${parsed.data.location ? ` Location: ${parsed.data.location}` : ""}`,
      link: "/interviews",
      meta: {
        applicationId,
        jobId: application.jobId,
        interviewId: interview.id,
        scheduledAt: parsed.data.scheduledAt,
        mode: parsed.data.mode,
        duration: parsed.data.duration,
        link: parsed.data.link,
        location: parsed.data.location,
      },
    });

    return NextResponse.json({ success: true, status: "accepted", interview });
  }

  return NextResponse.json({ error: "Invalid decision" }, { status: 400 });
}