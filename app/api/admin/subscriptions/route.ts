import { NextResponse } from "next/server";
import { eq, desc, ne } from "drizzle-orm";
import { db } from "@/app/db";
import {
  subscriptions,
  employerProfiles,
  users,
  notifications,
} from "@/app/db/schema";
import { getCurrentAdmin } from "@/lib/admin-auth";

export async function GET() {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
      .leftJoin(
        employerProfiles,
        eq(employerProfiles.userId, subscriptions.employerId)
      )
      .leftJoin(users, eq(users.id, subscriptions.employerId))
      .orderBy(desc(subscriptions.updatedAt));

    // Send 5-day expiry reminder notifications
    const fiveDaysFromNow = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
    for (const sub of subs) {
      if (
        sub.billingCycleEnd &&
        new Date(sub.billingCycleEnd) <= fiveDaysFromNow &&
        new Date(sub.billingCycleEnd) > new Date() &&
        sub.plan !== "free"
      ) {
        try {
          await db.insert(notifications).values({
            recipientId: sub.employerId,
            type: "system",
            title: "Your subscription is expiring soon!",
            description: `Your ${sub.plan} plan expires in less than 5 days. Renew to keep your job slots active.`,
            link: "/subscription",
          });
        } catch {
          // Ignore duplicate notification errors
        }
      }
    }

    return NextResponse.json(subs);
  } catch (error) {
    console.error("ADMIN SUBSCRIPTIONS ERROR:", error);
    return NextResponse.json(
      { error: "Internal server error: " + String(error) },
      { status: 500 }
    );
  }
}