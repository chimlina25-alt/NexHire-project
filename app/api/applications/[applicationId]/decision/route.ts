import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/db";
import { jobApplications, notifications } from "@/app/db/schema";
import { eq, and } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: { applicationId: string } }
) {
  try {
    const user = await getCurrentUser("auth");
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (user.role !== "employer") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { decision } = body;

    if (!["accepted", "rejected"].includes(decision)) {
      return NextResponse.json(
        { error: "Decision must be 'accepted' or 'rejected'" },
        { status: 400 }
      );
    }

    // Verify this application belongs to this employer
    const [application] = await db
      .select()
      .from(jobApplications)
      .where(
        and(
          eq(jobApplications.id, params.applicationId),
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

    // Update status
    await db
      .update(jobApplications)
      .set({
        status:    decision as "accepted" | "rejected",
        updatedAt: new Date(),
      })
      .where(eq(jobApplications.id, params.applicationId));

    // Notify job seeker
    const isAccepted = decision === "accepted";
    await db.insert(notifications).values({
      recipientId: application.jobSeekerId,
      actorId:     user.id,
      type:        "application",
      title:       isAccepted
        ? "Your application was accepted!"
        : "Application update",
      description: isAccepted
        ? "Congratulations! The employer has accepted your application and will be in touch soon."
        : "Thank you for applying. The employer has decided not to move forward with your application at this time.",
      link: `/applied`,
    });

    return NextResponse.json({ success: true, status: decision });
  } catch (error) {
    console.error("[POST /api/applications/[applicationId]/decision]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}