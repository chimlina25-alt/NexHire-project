import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/app/db";
import {
  users,
  jobSeekerProfiles,
  sessions,
  jobApplications,
  savedJobs,
  notifications,
  interviews,
} from "@/app/db/schema";
import { getCurrentAdmin } from "@/lib/admin-auth";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { userId } = await params;

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const [profile] = await db
      .select()
      .from(jobSeekerProfiles)
      .where(eq(jobSeekerProfiles.userId, userId))
      .limit(1);

    return NextResponse.json({ ...user, profile: profile ?? null });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { userId } = await params;
    const body = await req.json();

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (body.status === "suspended") {
      // Kill all sessions immediately
      await db.delete(sessions).where(eq(sessions.userId, userId));
      // Mark as unverified + incomplete onboarding as suspended marker
      await db
        .update(users)
        .set({ isEmailVerified: false, onboardingCompleted: false, updatedAt: new Date() })
        .where(eq(users.id, userId));

      // Notify the user
      await db.insert(notifications).values({
        recipientId: userId,
        type: "system",
        title: "Your account has been suspended",
        description: "Your account has been suspended by an administrator. Please contact support for assistance.",
        link: null,
        meta: { adminAction: "account_suspended" } as Record<string, unknown>,
      });
    } else if (body.status === "active") {
      await db
        .update(users)
        .set({ isEmailVerified: true, onboardingCompleted: true, updatedAt: new Date() })
        .where(eq(users.id, userId));

      // Notify the user
      await db.insert(notifications).values({
        recipientId: userId,
        type: "system",
        title: "Your account has been reactivated",
        description: "Your account has been reactivated by an administrator. You can now log in.",
        link: "/home_page",
        meta: { adminAction: "account_activated" } as Record<string, unknown>,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PATCH USER ERROR:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { userId } = await params;

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Delete in correct order
    await db.delete(sessions).where(eq(sessions.userId, userId));

    await db
      .delete(savedJobs)
      .where(eq(savedJobs.jobSeekerId, userId));

    await db
      .delete(jobApplications)
      .where(eq(jobApplications.jobSeekerId, userId));

    await db
      .delete(jobSeekerProfiles)
      .where(eq(jobSeekerProfiles.userId, userId));

    await db.delete(users).where(eq(users.id, userId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE USER ERROR:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}