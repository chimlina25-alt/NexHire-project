import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/app/db";
import { subscriptions, notifications, adminAccounts, employerProfiles } from "@/app/db/schema";
import { getCurrentUser } from "@/lib/auth";

export async function POST() {
  try {
    const user = await getCurrentUser("auth");
    if (!user || user.role !== "employer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [sub] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.employerId, user.id))
      .limit(1);

    if (!sub || sub.plan === "free") {
      return NextResponse.json({ error: "No active subscription to cancel" }, { status: 400 });
    }

    const oldPlan = sub.plan;

    await db
      .update(subscriptions)
      .set({ plan: "free", billingCycleEnd: null, updatedAt: new Date() })
      .where(eq(subscriptions.employerId, user.id));

    const [profile] = await db
      .select()
      .from(employerProfiles)
      .where(eq(employerProfiles.userId, user.id))
      .limit(1);

    // Notify employer
    await db.insert(notifications).values({
      recipientId: user.id,
      type: "system",
      title: "Membership Cancelled",
      description: `Your ${oldPlan} plan has been cancelled. You've been moved to the Free plan (1 job slot/month).`,
      link: "/subscription",
      meta: { action: "membership_cancelled" } as Record<string, unknown>,
    });

    // ++ Notify all admins
    const admins = await db.select().from(adminAccounts);
    for (const admin of admins) {
      await db.insert(notifications).values({
        recipientId: admin.id,
        type: "system",
        title: "Employer Cancelled Membership",
        description: `${profile?.companyName || "An employer"} cancelled their ${oldPlan} plan and moved to Free.`,
        link: "/admin_subscription",
        meta: { action: "employer_cancelled", employerId: user.id } as Record<string, unknown>,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("CANCEL ERROR:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}