import { NextResponse } from "next/server";
import { eq, desc, and, isNull } from "drizzle-orm";
import { db } from "@/app/db";
import { subscriptions, employerProfiles, users, notifications } from "@/app/db/schema";
import { getCurrentAdmin } from "@/lib/admin-auth";

export async function GET() {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const subs = await db
      .select({
        id: subscriptions.id,
        plan: subscriptions.plan,
        jobsPostedThisMonth: subscriptions.jobsPostedThisMonth,
        billingCycleStart: subscriptions.billingCycleStart,
        billingCycleEnd: subscriptions.billingCycleEnd,
        createdAt: subscriptions.createdAt,
        updatedAt: subscriptions.updatedAt,
        employerId: subscriptions.employerId,
        companyName: employerProfiles.companyName,
        industry: employerProfiles.industry,
        profileImage: employerProfiles.profileImage,
        email: users.email,
      })
      .from(subscriptions)
      .leftJoin(employerProfiles, eq(employerProfiles.userId, subscriptions.employerId))
      .leftJoin(users, eq(users.id, subscriptions.employerId))
      .orderBy(desc(subscriptions.updatedAt));

    // Send 3-day expiry reminder — only once per employer
    for (const sub of subs) {
      if (!sub.billingCycleEnd || sub.plan === "free") continue;
      const daysLeft = Math.ceil((new Date(sub.billingCycleEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      if (daysLeft <= 3 && daysLeft >= 0) {
        const [existing] = await db
          .select()
          .from(notifications)
          .where(
            and(
              eq(notifications.recipientId, sub.employerId),
              eq(notifications.title, "⚠️ Subscription Expiring Soon")
            )
          )
          .limit(1);

        if (!existing) {
          await db.insert(notifications).values({
            recipientId: sub.employerId,
            type: "system",
            title: "⚠️ Subscription Expiring Soon",
            description: `Your ${sub.plan} plan expires in ${daysLeft} day${daysLeft !== 1 ? "s" : ""}. Renew now to keep your job slots active.`,
            link: "/subscription",
            meta: { autoAlert: "expiry_warning" } as Record<string, unknown>,
          });
        }
      }
    }

    return NextResponse.json(subs);
  } catch (error) {
    console.error("ADMIN SUBSCRIPTIONS ERROR:", error);
    return NextResponse.json({ error: "Internal server error: " + String(error) }, { status: 500 });
  }
}