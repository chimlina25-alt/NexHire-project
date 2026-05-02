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
      // Kill all active sessions immediately so they are logged out
      await db.delete(sessions).where(eq(sessions.userId, employerId));

      // Mark account as suspended via isEmailVerified=false, onboardingCompleted=false
      await db
        .update(users)
        .set({ isEmailVerified: false, onboardingCompleted: false, updatedAt: new Date() })
        .where(eq(users.id, employerId));

      // Send suspension notification to the employer
      await db.insert(notifications).values({
        recipientId: employerId,
        type: "system",
        title: "Your account has been suspended",
        description:
          "Your employer account has been suspended by an administrator. Please contact support for assistance.",
        link: null,
        meta: { adminAction: "account_suspended" } as Record<string, unknown>,
      });
    } else if (body.status === "active") {
      // Restore the account
      await db
        .update(users)
        .set({ isEmailVerified: true, onboardingCompleted: true, updatedAt: new Date() })
        .where(eq(users.id, employerId));

      // Send reactivation notification to the employer
      await db.insert(notifications).values({
        recipientId: employerId,
        type: "system",
        title: "Your account has been reactivated",
        description:
          "Your employer account has been reactivated by an administrator. You can now log in and post jobs.",
        link: "/dashboard",
        meta: { adminAction: "account_activated" } as Record<string, unknown>,
      });
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

    // 1. Kill all sessions
    await db.delete(sessions).where(eq(sessions.userId, employerId));

    // 2. Get all employer's jobs so we can notify applicants
    const employerJobs = await db
      .select({ id: jobs.id, title: jobs.title })
      .from(jobs)
      .where(eq(jobs.employerId, employerId));

    // 3. Notify applicants of all jobs that those jobs are gone
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

    // 4. Close all their job posts (soft delete so data stays for applicant history)
    await db
      .update(jobs)
      .set({ status: "closed", updatedAt: new Date() })
      .where(eq(jobs.employerId, employerId));

    // 5. Delete subscription
    await db
      .delete(subscriptions)
      .where(eq(subscriptions.employerId, employerId));

    // 6. Delete admin conversations for this employer
    await db
      .delete(adminConversations)
      .where(eq(adminConversations.userId, employerId));

    // 7. Delete notifications for this employer
    await db
      .delete(notifications)
      .where(eq(notifications.recipientId, employerId));

    // 8. Delete employer profile
    await db
      .delete(employerProfiles)
      .where(eq(employerProfiles.userId, employerId));

    // 9. Delete the user account itself
    await db.delete(users).where(eq(users.id, employerId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE EMPLOYER ERROR:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}