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
  conversations,
  interviews,
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
      // Kill all active sessions so they get logged out immediately
      await db.delete(sessions).where(eq(sessions.userId, employerId));
      // Use isEmailVerified false + onboardingCompleted false as suspended marker
      await db
        .update(users)
        .set({ isEmailVerified: false, onboardingCompleted: false, updatedAt: new Date() })
        .where(eq(users.id, employerId));

      // Notify the employer
      await db.insert(notifications).values({
        recipientId: employerId,
        type: "system",
        title: "Your account has been suspended",
        description: "Your employer account has been suspended by an administrator. Please contact support for assistance.",
        link: null,
        meta: { adminAction: "account_suspended" } as Record<string, unknown>,
      });
    } else if (body.status === "active") {
      await db
        .update(users)
        .set({ isEmailVerified: true, onboardingCompleted: true, updatedAt: new Date() })
        .where(eq(users.id, employerId));

      // Notify the employer their account is restored
      await db.insert(notifications).values({
        recipientId: employerId,
        type: "system",
        title: "Your account has been reactivated",
        description: "Your employer account has been reactivated by an administrator. You can now log in and post jobs.",
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

    // Delete in correct order to avoid FK constraint issues
    await db.delete(sessions).where(eq(sessions.userId, employerId));

    // Close all their job posts
    await db
      .update(jobs)
      .set({ status: "closed", updatedAt: new Date() })
      .where(eq(jobs.employerId, employerId));

    // Delete subscription
    await db
      .delete(subscriptions)
      .where(eq(subscriptions.employerId, employerId));

    // Delete employer profile
    await db
      .delete(employerProfiles)
      .where(eq(employerProfiles.userId, employerId));

    // Delete the user account
    await db.delete(users).where(eq(users.id, employerId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE EMPLOYER ERROR:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}