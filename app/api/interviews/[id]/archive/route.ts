import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { db } from "@/app/db";
import { interviews, jobApplications } from "@/app/db/schema";
import { getCurrentUser } from "@/lib/auth";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> } // ✅ was { interviewId }, folder is [id]
) {
  try {
    const { id } = await params; // ✅ was interviewId
    const user = await getCurrentUser("auth");

    if (!user || user.role !== "job_seeker") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find interview to get applicationId
    const [interview] = await db
      .select({ applicationId: interviews.applicationId })
      .from(interviews)
      .where(
        and(
          eq(interviews.id, id),
          eq(interviews.jobSeekerId, user.id)
        )
      )
      .limit(1);

    if (!interview) {
      return NextResponse.json({ error: "Interview not found" }, { status: 404 });
    }

    // ✅ Archive the application (not the interview row)
    // This makes it disappear from Interviews and appear in Archived tab
    // Does NOT touch interview status, employer view, or any other logic
    await db
      .update(jobApplications)
      .set({
        status: "archived",
        updatedAt: new Date(),
      })
      .where(eq(jobApplications.id, interview.applicationId));

    return NextResponse.json({ success: true, message: "Interview archived" });
  } catch (error) {
    console.error("ARCHIVE INTERVIEW ERROR:", error);
    return NextResponse.json({ error: "Failed to archive interview" }, { status: 500 });
  }
}