import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/app/db";
import {
  users,
  employerProfiles,
  sessions,
  jobs,
  jobApplications,
  subscriptions,
  notifications,
  adminConversations,
} from "@/app/db/schema";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { sendSuspensionEmail, sendAccountDeletedEmail, sendReactivationEmail } from "@/lib/email"; // ++ ADDED sendReactivationEmail

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ employerId: string }> }
) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { employerId } = await params;
    const body = await req.json();

    const [employer] = await db
      .select()
      .from(users)
      .where(eq(users.id, employerId))
      .limit(1);

    if (!employer) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (body.status === "suspended") {
      await db.delete(sessions).where(eq(sessions.userId, employerId));

      await db
        .update(users)
        .set({ isEmailVerified: false, onboardingCompleted: false, updatedAt: new Date() })
        .where(eq(users.id, employerId));

      await db.insert(notifications).values({
        recipientId: employerId,
        type: "system",
        title: "Your account has been suspended",
        description:
          "Your employer account has been suspended by an administrator. Please contact support for assistance.",
        link: null,
        meta: { adminAction: "account_suspended" } as Record<string, unknown>,
      });

      try {
        await sendSuspensionEmail(employer.email);
      } catch (emailErr) {
        console.error("Failed to send suspension email:", emailErr);
      }

    } else if (body.status === "active") {
      await db
        .update(users)
        .set({ isEmailVerified: true, onboardingCompleted: true, updatedAt: new Date() })
        .where(eq(users.id, employerId));

      await db.insert(notifications).values({
        recipientId: employerId,
        type: "system",
        title: "Your account has been reactivated",
        description:
          "Your employer account has been reactivated by an administrator. You can now log in and post jobs.",
        link: "/dashboard",
        meta: { adminAction: "account_activated" } as Record<string, unknown>,
      });

      // ++ ADDED
      try {
        await sendReactivationEmail(employer.email);
      } catch (emailErr) {
        console.error("Failed to send reactivation email:", emailErr);
      }
      // ++ END ADDED
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PATCH EMPLOYER ERROR:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ employerId: string }> }
) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { employerId } = await params;

    const [employer] = await db
      .select()
      .from(users)
      .where(eq(users.id, employerId))
      .limit(1);

    if (!employer) return NextResponse.json({ error: "Not found" }, { status: 404 });

    try {
      await sendAccountDeletedEmail(employer.email);
    } catch (emailErr) {
      console.error("Failed to send account deleted email:", emailErr);
    }

    await db.delete(sessions).where(eq(sessions.userId, employerId));

    const employerJobs = await db
      .select({ id: jobs.id, title: jobs.title })
      .from(jobs)
      .where(eq(jobs.employerId, employerId));

    for (const job of employerJobs) {
      const applicants = await db
        .select({ jobSeekerId: jobApplications.jobSeekerId })
        .from(jobApplications)
        .where(eq(jobApplications.jobId, job.id));

      if (applicants.length > 0) {
        await db.insert(notifications).values(
          applicants.map((a) => ({
            recipientId: a.jobSeekerId,
            type: "system" as const,
            title: "A job you applied to is no longer available",
            description: `The job posting "${job.title}" is no longer available as the employer account has been removed.`,
            link: "/applied",
            meta: { adminAction: "employer_deleted" } as Record<string, unknown>,
          }))
        );
      }
    }

    await db.update(jobs).set({ status: "closed", updatedAt: new Date() }).where(eq(jobs.employerId, employerId));
    await db.delete(subscriptions).where(eq(subscriptions.employerId, employerId));
    await db.delete(adminConversations).where(eq(adminConversations.userId, employerId));
    await db.delete(notifications).where(eq(notifications.recipientId, employerId));
    await db.delete(employerProfiles).where(eq(employerProfiles.userId, employerId));
    await db.delete(users).where(eq(users.id, employerId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE EMPLOYER ERROR:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}