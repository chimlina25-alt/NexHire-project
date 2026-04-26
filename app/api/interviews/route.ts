import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/db";
import {
  interviews,
  jobApplications,
  notifications,
} from "@/app/db/schema";
import { eq, and } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser("auth");
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (user.role !== "employer") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { applicationId, mode, scheduledAt, location, notes } = body;

    if (!applicationId || !scheduledAt) {
      return NextResponse.json(
        { error: "applicationId and scheduledAt are required" },
        { status: 400 }
      );
    }

    // Verify application belongs to this employer
    const [application] = await db
      .select()
      .from(jobApplications)
      .where(
        and(
          eq(jobApplications.id, applicationId),
          eq(jobApplications.employerId, user.id)
        )
      )
      .limit(1);

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    const [interview] = await db
      .insert(interviews)
      .values({
        applicationId,
        employerId:   user.id,
        jobSeekerId:  application.jobSeekerId,
        mode:         mode || "remote",
        scheduledAt:  new Date(scheduledAt),
        location:     location || null,
        notes:        notes    || null,
      })
      .returning();

    // Update application status to interview
    await db
      .update(jobApplications)
      .set({ status: "interview", updatedAt: new Date() })
      .where(eq(jobApplications.id, applicationId));

    // Notify job seeker
    const interviewDate = new Date(scheduledAt).toLocaleString("en-US", {
      weekday: "long",
      month:   "long",
      day:     "numeric",
      year:    "numeric",
      hour:    "numeric",
      minute:  "2-digit",
    });

    await db.insert(notifications).values({
      recipientId: application.jobSeekerId,
      actorId:     user.id,
      type:        "interview",
      title:       "Interview Scheduled!",
      description: `Your interview has been scheduled for ${interviewDate}. ${
        location ? `Location/Link: ${location}.` : ""
      } ${notes ? notes : ""}`.trim(),
      link: `/interviews`,
    });

    return NextResponse.json(interview, { status: 201 });
  } catch (error) {
    console.error("[POST /api/interviews]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const user = await getCurrentUser("auth");
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rows = await db
      .select()
      .from(interviews)
      .where(
        user.role === "employer"
          ? eq(interviews.employerId, user.id)
          : eq(interviews.jobSeekerId, user.id)
      )
      .orderBy(interviews.scheduledAt);

    return NextResponse.json(rows);
  } catch (error) {
    console.error("[GET /api/interviews]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}