import { getCurrentUser } from "@/lib/auth";
import { db } from "@/app/db";
import { employerProfiles, subscriptions } from "@/app/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function requireEmployer() {
  const user = await getCurrentUser("auth");
  if (!user || user.role !== "employer") {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }), user: null, profile: null, subscription: null };
  }

  const [profile] = await db
    .select()
    .from(employerProfiles)
    .where(eq(employerProfiles.userId, user.id))
    .limit(1);

  let [subscription] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.employerId, user.id))
    .limit(1);

  if (!subscription) {
    const [newSub] = await db
      .insert(subscriptions)
      .values({ employerId: user.id, plan: "free", jobsPostedThisMonth: 0, billingCycleStart: new Date() })
      .returning();
    subscription = newSub;
  }

  return { error: null, user, profile, subscription };
}

export function getMonthlyLimit(plan: string) {
  if (plan === "premium") return 7;
  if (plan === "standard") return 3;
  return 1;
}